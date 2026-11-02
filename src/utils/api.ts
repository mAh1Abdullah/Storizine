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

  // ==========================================
  // Auth & Session Management
  // ==========================================
  getToken(): string | null {
    try {
      return localStorage.getItem('storizine_auth_token');
    } catch {
      return null;
    }
  },

  setToken(token: string | null) {
    try {
      if (token) {
        localStorage.setItem('storizine_auth_token', token);
      } else {
        localStorage.removeItem('storizine_auth_token');
      }
    } catch (err) {
      console.warn('Could not persist auth token in localStorage', err);
    }
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async login(credentials: { email?: string; password?: string; passcode?: string }): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Authentication failed');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return json;
  },

  async register(data: { email: string; password: string; displayName: string; role?: string }): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Registration failed');
    }

    if (json.token) {
      this.setToken(json.token);
    }
    return json;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } finally {
      this.setToken(null);
    }
  },

  async getMe(): Promise<{ user: any; profile: any }> {
    const res = await fetch('/api/v1/auth/me', {
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error('Not authenticated');
    }
    return await res.json();
  },

  async exportUserData(): Promise<any> {
    const res = await fetch('/api/v1/auth/export', {
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error('Export failed');
    }
    return await res.json();
  },

  // ==========================================
  // Writing Projects & Documents
  // ==========================================
  async getWritingProjects(): Promise<any[]> {
    const res = await fetch('/api/v1/writing/projects', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.projects || [];
  },

  async createWritingProject(data: any): Promise<any> {
    const res = await fetch('/api/v1/writing/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const json = await res.json();
    return json.project;
  },

  async getWritingProject(id: string): Promise<any> {
    const res = await fetch(`/api/v1/writing/projects/${id}`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Project not found');
    const json = await res.json();
    return json.project;
  },

  async getDocument(id: string): Promise<any> {
    const res = await fetch(`/api/v1/documents/${id}`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Document not found');
    const json = await res.json();
    return json.document;
  },

  async updateDocument(id: string, data: { content?: string; title?: string; expectedVersion?: number }): Promise<any> {
    const res = await fetch(`/api/v1/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || 'Failed to update document');
    }
    return json.document;
  },

  async createDocumentSnapshot(docId: string, summary?: string): Promise<any> {
    const res = await fetch(`/api/v1/documents/${docId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ summary }),
    });
    if (!res.ok) throw new Error('Failed to create snapshot');
    const json = await res.json();
    return json.version;
  },

  // ==========================================
  // Story Bible
  // ==========================================
  async getStoryBible(projectId: string): Promise<any[]> {
    const res = await fetch(`/api/v1/writing/projects/${projectId}/story-bible`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  },

  async addStoryBibleItem(projectId: string, item: any): Promise<any> {
    const res = await fetch(`/api/v1/writing/projects/${projectId}/story-bible`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add story bible item');
    const json = await res.json();
    return json.item;
  },

  // ==========================================
  // Private Journal
  // ==========================================
  async getJournalEntries(): Promise<any[]> {
    const res = await fetch('/api/v1/journal', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.entries || [];
  },

  async createJournalEntry(entry: { title: string; content: string; linkedBookId?: string | null; linkedProjectId?: string | null; mood?: string | null }): Promise<any> {
    const res = await fetch('/api/v1/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to create journal entry');
    const json = await res.json();
    return json.entry;
  },

  // ==========================================
  // Magazine & Literary Desk
  // ==========================================
  async getMagazineItems(category?: string): Promise<any[]> {
    const url = category ? `/api/v1/magazine?category=${encodeURIComponent(category)}` : '/api/v1/magazine';
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.items || [];
  },

  async getMagazineItem(slug: string): Promise<any> {
    const res = await fetch(`/api/v1/magazine/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Article not found');
    const json = await res.json();
    return json.item;
  },

  async submitManuscript(submission: { title: string; genre: string; wordCount: number; synopsis: string; manuscriptUrl?: string; notes?: string }): Promise<any> {
    const res = await fetch('/api/v1/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(submission),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Submission failed');
    return json.submission;
  },

  // ==========================================
  // Learning Academy (Step 12)
  // ==========================================
  async getLessons(): Promise<any[]> {
    const res = await fetch('/api/v1/learning/lessons', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.lessons || [];
  },

  async getLesson(id: string): Promise<any> {
    const res = await fetch(`/api/v1/learning/lessons/${id}`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Lesson not found');
    const json = await res.json();
    return json.lesson;
  },

  async saveLessonProgress(id: string, data: { completed?: boolean; responseText?: string }): Promise<any> {
    const res = await fetch(`/api/v1/learning/lessons/${id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error('Failed to update lesson progress');
    return json.progress;
  },

  async runStoryClinic(excerpt: string, mode = 'clarity'): Promise<any> {
    const res = await fetch('/api/v1/learning/clinic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify({ excerpt, mode }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Clinic diagnostic failed');
    return json;
  },

  // ==========================================
  // Publishing Opportunities & Submission Tracker (Step 13)
  // ==========================================
  async getOpportunities(filter?: { type?: string; search?: string }): Promise<any[]> {
    let url = '/api/v1/opportunities';
    const params = new URLSearchParams();
    if (filter?.type && filter.type !== 'All') params.set('type', filter.type);
    if (filter?.search) params.set('search', filter.search);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.opportunities || [];
  },

  async getPublishingTracks(): Promise<any[]> {
    const res = await fetch('/api/v1/publishing-tracker', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.tracks || [];
  },

  async addPublishingTrack(track: any): Promise<any> {
    const res = await fetch('/api/v1/publishing-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(track),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to save submission track');
    return json.track;
  },

  async updatePublishingTrack(id: string, updates: any): Promise<any> {
    const res = await fetch(`/api/v1/publishing-tracker/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeaders() },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update track');
    return json;
  },

  async deletePublishingTrack(id: string): Promise<any> {
    const res = await fetch(`/api/v1/publishing-tracker/${id}`, {
      method: 'DELETE',
      headers: { ...this.getAuthHeaders() },
    });
    return res.ok;
  },

  // ==========================================
  // Unified Search (Step 15)
  // ==========================================
  async searchAll(query: string): Promise<any> {
    const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query)}`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return { books: [], magazine: [], lessons: [], writingProjects: [], journal: [] };
    const json = await res.json();
    return json.results;
  },

  // ==========================================
  // Notifications (Step 15)
  // ==========================================
  async getNotifications(): Promise<any[]> {
    const res = await fetch('/api/v1/notifications', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.notifications || [];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { ...this.getAuthHeaders() },
    });
    return res.ok;
  },

  // ==========================================
  // Admin & Audit Trail (Step 16)
  // ==========================================
  async getAdminStats(): Promise<any> {
    const res = await fetch('/api/v1/admin/stats', {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) throw new Error('Failed to fetch admin statistics');
    const json = await res.json();
    return json;
  },

  async getAdminAudit(params?: { limit?: number; action?: string; targetType?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.action) query.set('action', params.action);
    if (params?.targetType) query.set('targetType', params.targetType);
    const res = await fetch(`/api/v1/admin/audit?${query.toString()}`, {
      headers: { ...this.getAuthHeaders() },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.events || [];
  },
};
