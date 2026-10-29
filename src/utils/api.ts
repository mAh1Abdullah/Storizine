import { BookAnnotation, ReadingProgressRecord, BookForestEntry } from '../types';
import {
  cacheAnnotationOffline,
  getCachedAnnotationsByBook,
  deleteCachedAnnotation,
  saveReadingProgressOffline,
  getReadingProgressOffline,
  cacheBookOffline,
  getCachedBooks,
} from './offlineDb';

export const api = {
  // Books API
  async getBooks(): Promise<BookForestEntry[]> {
    try {
      const res = await fetch('/api/books');
      if (res.ok) {
        const json = await res.json();
        if (json.books && json.books.length > 0) {
          // Cache offline
          for (const b of json.books) {
            await cacheBookOffline(b);
          }
          return json.books;
        }
      }
    } catch (err) {
      console.warn('Network fetch for books failed, falling back to offline IndexedDB cache', err);
    }
    return await getCachedBooks();
  },

  async saveBook(book: BookForestEntry): Promise<BookForestEntry> {
    await cacheBookOffline(book);
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (res.ok) {
        const json = await res.json();
        return json.book;
      }
    } catch (err) {
      console.warn('Offline: saved book to IndexedDB', err);
    }
    return book;
  },

  // File Upload (.epub / .pdf)
  async uploadFile(file: File, fileType: 'epub' | 'pdf'): Promise<{ url: string; filename: string; size: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              fileData,
              fileType,
            }),
          });
          if (!res.ok) {
            throw new Error(`Upload failed with status ${res.status}`);
          }
          const json = await res.json();
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // Annotations API (SQL table sync)
  async getAnnotations(bookId: string): Promise<BookAnnotation[]> {
    try {
      const res = await fetch(`/api/annotations?bookId=${encodeURIComponent(bookId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.annotations) {
          for (const ann of json.annotations) {
            await cacheAnnotationOffline(ann);
          }
          return json.annotations;
        }
      }
    } catch (err) {
      console.warn('Using offline cached annotations', err);
    }
    return await getCachedAnnotationsByBook(bookId);
  },

  async saveAnnotation(ann: Partial<BookAnnotation> & { book_id: string; cfi_range: string }): Promise<BookAnnotation> {
    const fullAnn: BookAnnotation = {
      id: ann.id || crypto.randomUUID(),
      book_id: ann.book_id,
      user_id: ann.user_id || 'reader-default',
      cfi_range: ann.cfi_range,
      color: ann.color || 'yellow',
      note: ann.note || '',
      highlighted_text: ann.highlighted_text || '',
      created_at: new Date().toISOString(),
    };

    // Cache locally in IndexedDB first
    await cacheAnnotationOffline(fullAnn);

    try {
      const res = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullAnn),
      });
      if (res.ok) {
        const json = await res.json();
        return json.annotation;
      }
    } catch (err) {
      console.warn('Saved annotation to offline IndexedDB cache', err);
    }
    return fullAnn;
  },

  async deleteAnnotation(id: string): Promise<void> {
    await deleteCachedAnnotation(id);
    try {
      await fetch(`/api/annotations/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Deleted annotation from offline store', err);
    }
  },

  // Reading Progress Sync
  async getReadingProgress(bookId: string): Promise<ReadingProgressRecord | null> {
    try {
      const res = await fetch(`/api/reading-progress/${encodeURIComponent(bookId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.progress) {
          await saveReadingProgressOffline(json.progress);
          return json.progress;
        }
      }
    } catch (err) {
      console.warn('Using offline cached reading progress', err);
    }
    const cached = await getReadingProgressOffline(bookId);
    return cached || null;
  },

  // 3. Real-Time Reading Position Sync (Debounced helper)
  saveReadingProgress: (() => {
    let timeoutId: any = null;
    return ({ bookId, cfi, percentage }: { bookId: string; cfi: string; percentage: number }) => {
      // Immediate local cache
      const record: ReadingProgressRecord = {
        bookId,
        cfi,
        percentage,
        updated_at: new Date().toISOString(),
      };
      saveReadingProgressOffline(record);

      // Debounce network request by 400ms to avoid flooding on rapid page flips
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await fetch('/api/reading-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId, cfi, percentage }),
          });
        } catch (err) {
          console.warn('Failed to sync progress to server, kept in offline cache', err);
        }
      }, 400);
    };
  })(),

  // 5. Gemini Vocabulary & Term Explainer
  async explainTerm(params: {
    term: string;
    contextSentence?: string;
    bookTitle?: string;
    author?: string;
  }): Promise<{
    term: string;
    definition: string;
    historicalContext?: string;
    etymology?: string;
    literarySignificance?: string;
    partOfSpeech?: string;
  }> {
    const res = await fetch('/api/ai/explain-term', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Explainer failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  },

  // 6. Gemini Literary Passage Analysis & Subtext Explainer (Phase 3)
  async explain(params: {
    selectedText?: string;
    text?: string;
    term?: string;
    contextSentence?: string;
    targetLang?: string;
    bookTitle?: string;
    author?: string;
    mode?: 'all' | 'subtext' | 'themes' | 'translate';
  }): Promise<{
    selectedText: string;
    term?: string;
    definition?: string;
    culturalContext?: string;
    historicalContext?: string;
    subtext: string;
    literaryThemes: string[];
    stylisticDevices: string[];
    translation?: string;
    bengaliTranslation: string;
    historicalOrAtmosphericVibe: string;
  }> {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Explainer failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  },

  async explainPassage(params: {
    text: string;
    bookTitle?: string;
    author?: string;
    mode?: 'all' | 'subtext' | 'themes' | 'translate';
  }): Promise<{
    selectedText: string;
    subtext: string;
    literaryThemes: string[];
    stylisticDevices: string[];
    bengaliTranslation: string;
    historicalOrAtmosphericVibe: string;
  }> {
    return this.explain(params);
  },
};
