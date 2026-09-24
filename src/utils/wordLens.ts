import dictionaryData from '../data/wordlens/dictionary.json';
import { WordLensDefinition } from '../types';

const dictionary: Record<string, WordLensDefinition> = dictionaryData as any;

/**
 * Normalizes text to lookup keys
 */
export function cleanWordKey(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
}

/**
 * Readest WordLens Offline Lookup
 * Reads directly from data/wordlens/*.json for instant definition, grammar tags, and phonetics.
 */
export function lookupWordLensOffline(rawWord: string): WordLensDefinition | null {
  const key = cleanWordKey(rawWord);
  if (!key) return null;

  // Direct lookup
  if (dictionary[key]) {
    return dictionary[key];
  }

  // Common suffix stripping (plural -s, past -ed, participle -ing, adverb -ly)
  const stems = [
    key.replace(/s$/, ''),
    key.replace(/es$/, ''),
    key.replace(/ed$/, ''),
    key.replace(/ing$/, ''),
    key.replace(/ly$/, ''),
  ];

  for (const stem of stems) {
    if (stem && dictionary[stem]) {
      return dictionary[stem];
    }
  }

  // Graceful offline morphological structure for unindexed words
  return {
    word: key,
    partOfSpeech: key.endsWith('ly') ? 'adverb' : key.endsWith('tion') ? 'noun' : 'word',
    phonetic: `/${key}/`,
    definition: `Offline entry for "${key}". Select Gemini Literary AI in the toolbar for in-depth subtext analysis and translation.`,
    grammarTags: ['offline token', 'contextual'],
    synonyms: [],
  };
}
