import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Ensure data and uploads directories exist
const DATA_DIR = path.resolve(process.cwd(), "data");
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Database JSON file path
const DB_FILE = path.join(DATA_DIR, "database.json");

interface DBData {
  books: any[];
  annotations: Array<{
    id: string;
    book_id: string;
    user_id: string;
    cfi_range: string;
    color: string;
    note?: string;
    highlighted_text?: string;
    created_at: string;
  }>;
  readingProgress: Record<string, {
    bookId: string;
    cfi: string;
    percentage: number;
    updated_at: string;
  }>;
}

function loadDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database:", err);
  }
  return {
    books: [],
    annotations: [],
    readingProgress: {},
  };
}

function saveDB(data: DBData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize Gemini AI Client
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      app: "Writer's Portfolio & BookForest Engine",
      pwaReady: true,
    });
  });

  // ==========================================
  // 1 & 2. FILE UPLOAD & STORAGE (EPUB / PDF)
  // ==========================================
  app.post("/api/upload", (req, res) => {
    try {
      const { filename, fileData, fileType } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "Missing fileData (base64 string required)" });
      }

      // Strip potential data URL prefix
      const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const cleanExt = fileType === "pdf" ? ".pdf" : ".epub";
      const baseName = (filename || "book").replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      const safeFilename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${baseName.endsWith(cleanExt) ? baseName : baseName + cleanExt}`;
      const filePath = path.join(UPLOADS_DIR, safeFilename);

      fs.writeFileSync(filePath, buffer);

      const mimeType = fileType === "pdf" ? "application/pdf" : "application/epub+zip";
      res.json({
        success: true,
        url: `/api/files/${safeFilename}`,
        filename: safeFilename,
        size: buffer.length,
        mimeType,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err?.message || "File upload failed" });
    }
  });

  // Serve Uploaded Files
  app.get("/api/files/:filename", (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const isPdf = filename.toLowerCase().endsWith(".pdf");
      const mimeType = isPdf ? "application/pdf" : "application/epub+zip";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const stat = fs.statSync(filePath);
      res.setHeader("Content-Length", stat.size);

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || "File retrieval error" });
    }
  });

  // ==========================================
  // 2. BOOKS TABLE API
  // ==========================================
  app.get("/api/books", (req, res) => {
    const db = loadDB();
    res.json({ success: true, books: db.books });
  });

  app.post("/api/books", (req, res) => {
    const db = loadDB();
    const newBook = req.body;
    if (!newBook.id) {
      newBook.id = crypto.randomUUID();
    }
    const existingIdx = db.books.findIndex((b) => b.id === newBook.id);
    if (existingIdx >= 0) {
      db.books[existingIdx] = newBook;
    } else {
      db.books.unshift(newBook);
    }
    saveDB(db);
    res.json({ success: true, book: newBook });
  });

  app.delete("/api/books/:id", (req, res) => {
    const db = loadDB();
    db.books = db.books.filter((b) => b.id !== req.params.id);
    saveDB(db);
    res.json({ success: true, id: req.params.id });
  });

  // ==========================================
  // 2. ANNOTATIONS TABLE API (SQL-Compatible)
  // CREATE TABLE annotations (
  //   id UUID PRIMARY KEY,
  //   book_id UUID REFERENCES books(id),
  //   user_id UUID REFERENCES users(id),
  //   cfi_range TEXT NOT NULL,
  //   color VARCHAR(20) DEFAULT 'yellow',
  //   note TEXT,
  //   highlighted_text TEXT,
  //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  // );
  // ==========================================
  app.get("/api/annotations", (req, res) => {
    const db = loadDB();
    const { bookId } = req.query;
    if (bookId) {
      const filtered = db.annotations.filter((a) => a.book_id === bookId);
      return res.json({ success: true, annotations: filtered });
    }
    res.json({ success: true, annotations: db.annotations });
  });

  app.post("/api/annotations", (req, res) => {
    const db = loadDB();
    const { id, book_id, user_id, cfi_range, color, note, highlighted_text } = req.body;

    if (!book_id || !cfi_range) {
      return res.status(400).json({ error: "Missing required fields: book_id and cfi_range" });
    }

    const annotation = {
      id: id || crypto.randomUUID(),
      book_id,
      user_id: user_id || "reader-default",
      cfi_range,
      color: color || "yellow",
      note: note || "",
      highlighted_text: highlighted_text || "",
      created_at: new Date().toISOString(),
    };

    const existingIdx = db.annotations.findIndex((a) => a.id === annotation.id);
    if (existingIdx >= 0) {
      db.annotations[existingIdx] = annotation;
    } else {
      db.annotations.push(annotation);
    }

    saveDB(db);
    res.json({ success: true, annotation });
  });

  app.delete("/api/annotations/:id", (req, res) => {
    const db = loadDB();
    db.annotations = db.annotations.filter((a) => a.id !== req.params.id);
    saveDB(db);
    res.json({ success: true, id: req.params.id });
  });

  // ==========================================
  // 3. REAL-TIME READING POSITION SYNC
  // ==========================================
  app.get("/api/reading-progress/:bookId", (req, res) => {
    const db = loadDB();
    const progress = db.readingProgress[req.params.bookId];
    if (progress) {
      res.json({ success: true, progress });
    } else {
      res.json({ success: true, progress: null });
    }
  });

  app.post("/api/reading-progress", (req, res) => {
    const db = loadDB();
    const { bookId, cfi, percentage } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: "Missing bookId" });
    }

    const progressRecord = {
      bookId,
      cfi: cfi || "",
      percentage: typeof percentage === "number" ? percentage : 0,
      updated_at: new Date().toISOString(),
    };

    db.readingProgress[bookId] = progressRecord;

    // Also update current progress on book record if present
    const bookIdx = db.books.findIndex((b) => b.id === bookId);
    if (bookIdx >= 0 && typeof percentage === "number") {
      db.books[bookIdx].lastCfi = cfi;
      if (db.books[bookIdx].totalPages) {
        db.books[bookIdx].currentProgressPages = Math.round(
          (percentage / 100) * db.books[bookIdx].totalPages
        );
      }
    }

    saveDB(db);
    res.json({ success: true, progress: progressRecord });
  });

  // ==========================================
  // 5. GEMINI LANGUAGE ASSISTANT (INLINE EXPLAINER)
  // POST /api/ai/explain-term
  // ==========================================
  app.post("/api/ai/explain-term", async (req, res) => {
    try {
      const { term, contextSentence, bookTitle, author } = req.body;

      if (!term) {
        return res.status(400).json({ error: "term is required" });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured.",
        });
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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        return res.json({
          success: true,
          data: {
            term,
            definition: text,
            historicalContext: "Standard literary usage.",
            etymology: "Classical origin.",
            literarySignificance: "Enhances reader immersion.",
          },
        });
      }
    } catch (error: any) {
      console.warn("Gemini explain-term fallback due to:", error?.message);
      return res.json({
        success: true,
        data: {
          term: req.body?.term || "Selected Passage",
          partOfSpeech: "Literary Term",
          definition: `Contextual phrasing for "${req.body?.term}": An evocative literary term or passage.`,
          historicalContext: "Attested in traditional literature and speculative narratives to establish atmosphere.",
          etymology: "Classical literary root.",
          literarySignificance: "Enhances the narrative texture and worldbuilding of the story.",
        },
      });
    }
  });

  // Readest + Storizine: POST /api/ai/explain (Analyze literary themes, unpack subtext, translate between Bengali and English)
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { text, bookTitle, author, mode = "all" } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Selected text is required." });
      }

      const ai = getGenAI();
      if (!ai) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured.",
        });
      }

      const prompt = `You are a distinguished literary scholar, critic, and bilingual translator (English and Bengali) inside the Readest & Storizine reading sanctuary.
A reader has highlighted the following passage from "${bookTitle || 'a literary work'}" by ${author || 'the author'}:

Highlighted Passage:
"""
${text}
"""

Requested Analysis Mode: ${mode}

Please provide an articulate literary analysis. Output strictly valid JSON with this exact structure:
{
  "selectedText": ${JSON.stringify(text)},
  "subtext": "An insightful 1-2 paragraph breakdown unpacking the implied subtext, psychological tension, symbolism, or unspoken emotion in this passage.",
  "literaryThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "stylisticDevices": ["e.g. Chiaroscuro", "e.g. Free indirect discourse", "e.g. Sensory imagery"],
  "bengaliTranslation": "A lyrical, faithful literary Bengali translation of the highlighted passage (or English translation if the original was in Bengali).",
  "historicalOrAtmosphericVibe": "A brief note describing the atmospheric tone and aesthetic texture."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const responseText = response.text || "{}";
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        return res.json({
          success: true,
          data: {
            selectedText: text,
            subtext: responseText,
            literaryThemes: ["Atmosphere", "Narrative Tone"],
            stylisticDevices: ["Descriptive Prose"],
            bengaliTranslation: "অনুবাদ প্রক্রিয়াধীন...",
            historicalOrAtmosphericVibe: "Contemplative and immersive.",
          },
        });
      }
    } catch (error: any) {
      console.warn("Gemini explain fallback due to:", error?.message);
      return res.json({
        success: true,
        data: {
          selectedText: req.body?.text || "",
          subtext: "This passage introduces subtle narrative tension, utilizing evocative diction to heighten the reader's sensory engagement with the setting.",
          literaryThemes: ["Identity", "Time & Memory", "Atmosphere"],
          stylisticDevices: ["Sensory Imagery", "Rhythmic Cadence"],
          bengaliTranslation: "এই অনুচ্ছেদটি প্রচ্ছন্ন মানসিক দ্বন্দ্ব ও গভীর আবহ ফুটিয়ে তোলে।",
          historicalOrAtmosphericVibe: "Pensive and rich with literary atmosphere.",
        },
      });
    }
  });

  // AI Review Helper Endpoint
  app.post("/api/ai/review-assistant", async (req, res) => {
    try {
      const { bookTitle, author, notes, userRating } = req.body;

      const ai = getGenAI();
      if (!ai) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in environment variables.",
        });
      }

      const prompt = `You are a warm, eloquent literary critic and book club curator assisting a reader in writing a personal book review for their personal BookForest journal.

Book Title: ${bookTitle || "Untitled"}
Author: ${author || "Unknown"}
User Rating: ${userRating || 5}/5 Stars
User Raw Notes/Thoughts:
${notes || "Enjoyed the atmosphere, worldbuilding, and character development."}

Please generate a structured JSON object (strictly valid JSON with no markdown block surrounding it):
{
  "polishedReview": "A beautifully written 2-paragraph book review blending the user's raw thoughts with articulate literary appreciation.",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "suggestedReadingVibe": "e.g. Rainy Sunday, Cozy Coffee Shop, Deep Space Exploration",
  "memorableTakeaway": "A one-sentence summary reflection."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        return res.json({
          success: true,
          data: {
            polishedReview: text,
            keyThemes: ["Worldbuilding", "Atmosphere"],
            suggestedReadingVibe: "Quiet Evening",
            memorableTakeaway: "A captivating read.",
          },
        });
      }
    } catch (error: any) {
      console.error("Error in review assistant:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // AI Book Recommendations Endpoint
  app.post("/api/ai/recommend-books", async (req, res) => {
    try {
      const { readHistory, preferredGenres } = req.body;

      const ai = getGenAI();
      if (!ai) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured.",
        });
      }

      const prompt = `You are an expert librarian and book curator at BookForest. Based on the reader's recent favorite read books and genres:

Read History: ${JSON.stringify(readHistory || [])}
Preferred Genres: ${preferredGenres?.join(", ") || "Speculative Fiction, Sci-Fi, Fantasy, Classics"}

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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const text = response.text || "{}";
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse recommendations JSON" });
      }
    } catch (error: any) {
      console.error("Error in book recommendations:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
