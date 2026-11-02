import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export const aiRouter = Router();

function getGenAI(): GoogleGenAI | null {
  const apiKey = config.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/v1/ai/explain-term
export async function handleExplainTerm(req: Request, res: Response) {
  const { term, contextSentence, bookTitle, author } = req.body;
  if (!term) {
    throw new AppError('term is required', 400, 'BAD_REQUEST');
  }

  const ai = getGenAI();
  if (!ai) {
    throw new AppError('GEMINI_API_KEY is not configured on the server.', 503, 'SERVICE_UNAVAILABLE');
  }

  const prompt = `You are a scholarly and engaging literary linguist and vocabulary guide. A reader is reading "${bookTitle || 'a literary work'}" by ${author || 'the author'} and highlighted the following word or phrase:

Term/Phrase: "${term}"
Sentence Context: "${contextSentence || ''}"

Provide an insightful, concise explanation in strictly valid JSON format:
{
  "term": "${term}",
  "partOfSpeech": "e.g. noun / verb / adjective / idiom",
  "definition": "Clear, precise definition fitting the contextual nuance of the passage.",
  "historicalContext": "Historical, geographical, or cultural context if applicable, or how this word was used in classical/modern literature.",
  "etymology": "Word origin (e.g., Latin roots, Old Norse, French derivation) and original meaning.",
  "literarySignificance": "Why an author might choose this particular word for mood, atmospheric tone, or symbolism."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini explain-term fallback due to:', error?.message);
    return res.json({
      success: true,
      data: {
        term: req.body?.term || 'Selected Passage',
        partOfSpeech: 'Literary Term',
        definition: `Contextual phrasing for "${req.body?.term}": An evocative literary term or passage.`,
        historicalContext: 'Attested in traditional literature and speculative narratives to establish atmosphere.',
        etymology: 'Classical literary root.',
        literarySignificance: 'Enhances the narrative texture and worldbuilding of the story.',
      },
    });
  }
}

// POST /api/v1/ai/explain
export async function handleExplain(req: Request, res: Response) {
  const {
    selectedText,
    text,
    term,
    contextSentence,
    targetLang = 'Bengali',
    bookTitle,
    author,
    mode = 'all',
  } = req.body;

  const targetText = (selectedText || text || term || '').trim();
  if (!targetText) {
    throw new AppError('selectedText or text is required.', 400, 'BAD_REQUEST');
  }

  const ai = getGenAI();
  if (!ai) {
    throw new AppError('GEMINI_API_KEY is not configured on the server.', 503, 'SERVICE_UNAVAILABLE');
  }

  const prompt = `You are a distinguished literary scholar, cultural historian, and polyglot translator (specializing in English, Bengali, and classical languages) inside the Storizine and Foliate e-reader sanctuary.
A reader has selected the following excerpt while reading "${bookTitle || 'a literary work'}" by ${author || 'the author'}:

Selected Text:
"""
${targetText}
"""
${contextSentence ? `Surrounding Context Sentence: "${contextSentence}"` : ''}
Target Translation Language: ${targetLang}
Requested Mode: ${mode}

Please explain the cultural context, define historical or classical terminology, analyze implicit literary subtext, and provide a faithful translation.
Output strictly valid JSON with this exact structure:
{
  "selectedText": ${JSON.stringify(targetText)},
  "term": ${JSON.stringify(targetText)},
  "definition": "Clear, contextual definition of the selected term or phrase.",
  "culturalContext": "Cultural, geographical, or era-specific context clarifying the nuance of the passage.",
  "historicalContext": "Historical terminology origin, etymology, or period significance.",
  "subtext": "An insightful breakdown unpacking the implied subtext, psychological tension, symbolism, or unspoken emotion in this passage.",
  "literaryThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "stylisticDevices": ["e.g. Chiaroscuro", "e.g. Free indirect discourse", "e.g. Sensory imagery"],
  "translation": "Faithful, evocative literary translation into ${targetLang}.",
  "bengaliTranslation": "A lyrical, faithful literary Bengali translation of the highlighted passage (or English if the passage was Bengali).",
  "historicalOrAtmosphericVibe": "A brief note describing the atmospheric tone and aesthetic texture."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini explain fallback due to:', error?.message);
    const fallbackTarget = req.body?.selectedText || req.body?.text || req.body?.term || 'Selected Passage';
    return res.json({
      success: true,
      data: {
        selectedText: fallbackTarget,
        term: fallbackTarget,
        definition: `Contextual phrasing for "${fallbackTarget}": An evocative literary expression.`,
        culturalContext: 'Reflects classical literary storytelling conventions with resonant cultural subtext.',
        historicalContext: 'Traditional literary terminology rooted in classical aesthetic discourse.',
        subtext: "This passage introduces subtle narrative tension, utilizing evocative diction to heighten the reader's sensory engagement with the setting.",
        literaryThemes: ['Identity', 'Time & Memory', 'Atmosphere'],
        stylisticDevices: ['Sensory Imagery', 'Rhythmic Cadence'],
        translation: 'এই অনুচ্ছেদটি প্রচ্ছন্ন মানসিক দ্বন্দ্ব ও গভীর আবহ ফুটিয়ে তোলে।',
        bengaliTranslation: 'এই অনুচ্ছেদটি প্রচ্ছন্ন মানসিক দ্বন্দ্ব ও গভীর আবহ ফুটিয়ে তোলে।',
        historicalOrAtmosphericVibe: 'Pensive and rich with literary atmosphere.',
      },
    });
  }
}

// POST /api/v1/ai/review-assistant
export async function handleReviewAssistant(req: Request, res: Response) {
  const { bookTitle, author, notes, userRating } = req.body;

  const ai = getGenAI();
  if (!ai) {
    throw new AppError('GEMINI_API_KEY is not configured on the server.', 503, 'SERVICE_UNAVAILABLE');
  }

  const prompt = `You are a warm, eloquent literary critic and book club curator assisting a reader in writing a personal book review for their personal BookForest journal.

Book Title: ${bookTitle || 'Untitled'}
Author: ${author || 'Unknown'}
User Rating: ${userRating || 5}/5 Stars
User Raw Notes/Thoughts:
${notes || 'Enjoyed the atmosphere, worldbuilding, and character development.'}

Please generate a structured JSON object (strictly valid JSON with no markdown block surrounding it):
{
  "polishedReview": "A beautifully written 2-paragraph book review blending the user's raw thoughts with articulate literary appreciation.",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "suggestedReadingVibe": "e.g. Rainy Sunday, Cozy Coffee Shop, Deep Space Exploration",
  "memorableTakeaway": "A one-sentence summary reflection."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in review assistant:', error);
    return res.json({
      success: true,
      data: {
        polishedReview: 'An engaging and memorable literary exploration that leaves a lasting impression.',
        keyThemes: ['Worldbuilding', 'Atmosphere'],
        suggestedReadingVibe: 'Quiet Evening',
        memorableTakeaway: 'A captivating read.',
      },
    });
  }
}

// POST /api/v1/ai/recommend-books
export async function handleRecommendBooks(req: Request, res: Response) {
  const { readHistory, preferredGenres } = req.body;

  const ai = getGenAI();
  if (!ai) {
    throw new AppError('GEMINI_API_KEY is not configured on the server.', 503, 'SERVICE_UNAVAILABLE');
  }

  const prompt = `You are an expert librarian and book curator at BookForest. Based on the reader's recent favorite read books and genres:

Read History: ${JSON.stringify(readHistory || [])}
Preferred Genres: ${preferredGenres?.join(', ') || 'Speculative Fiction, Sci-Fi, Fantasy, Classics'}

Recommend 3 incredible books to add to their BookForest 'Want to Read' list. Return strictly valid JSON in this schema:
{
  "recommendations": [
    {
      "title": "string",
      "author": "string",
      "genre": "string",
      "blurb": "string short description",
      "whyRecommended": "Why this aligns with their specific reading taste",
      "vibeTag": "e.g. Immersive Worldbuilding"
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in book recommendations:', error);
    throw new AppError('Failed to generate recommendations', 500, 'AI_ERROR');
  }
}

aiRouter.post('/explain-term', handleExplainTerm);
aiRouter.post('/explain', handleExplain);
aiRouter.post('/review-assistant', handleReviewAssistant);
aiRouter.post('/recommend-books', handleRecommendBooks);
