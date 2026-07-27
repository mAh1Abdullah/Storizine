import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI Client
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  };

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      app: "Writer's Portfolio & BookForest Engine",
    });
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
        model: "gemini-2.5-flash",
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

  // AI Book Recommendations Endpoint based on BookForest history
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
        model: "gemini-2.5-flash",
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
