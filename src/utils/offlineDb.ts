import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BookAnnotation, ReadingProgressRecord, BookForestEntry } from '../types';

interface StorizineDB extends DBSchema {
  books: {
    key: string;
    value: BookForestEntry;
  };
  cachedFiles: {
    key: string;
    value: {
      id: string;
      title: string;
      fileType: 'epub' | 'pdf';
      data: ArrayBuffer | Blob | string;
      cachedAt: string;
    };
  };
  annotations: {
    key: string;
    value: BookAnnotation;
    indexes: { 'by-book': string };
  };
  readingProgress: {
    key: string;
    value: ReadingProgressRecord;
  };
}

const DB_NAME = 'storizine-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<StorizineDB>> | null = null;

export function getOfflineDB() {
  if (!dbPromise) {
    dbPromise = openDB<StorizineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cachedFiles')) {
          db.createObjectStore('cachedFiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('annotations')) {
          const store = db.createObjectStore('annotations', { keyPath: 'id' });
          store.createIndex('by-book', 'book_id');
        }
        if (!db.objectStoreNames.contains('readingProgress')) {
          db.createObjectStore('readingProgress', { keyPath: 'bookId' });
        }
      },
    });
  }
  return dbPromise;
}

// Book Caching
export async function cacheBookOffline(book: BookForestEntry) {
  try {
    const db = await getOfflineDB();
    await db.put('books', book);
  } catch (err) {
    console.warn('Failed to cache book offline:', err);
  }
}

export async function getCachedBooks(): Promise<BookForestEntry[]> {
  try {
    const db = await getOfflineDB();
    const all = await db.getAll('books');
    return all.filter((b: any) => {
      if (!b) return false;
      if (typeof b.number === 'number' && b.number >= 31 && b.number <= 60) return false;
      if (typeof b.id === 'string' && /^(book|sz|pub-sz|bf)-(3[1-9]|[45][0-9]|60)$/i.test(b.id)) return false;
      return true;
    });
  } catch (err) {
    console.warn('Failed to read cached books:', err);
    return [];
  }
}

// File / EPUB / PDF Caching
export async function cacheFileBlobOffline(key: string, blob: Blob | File) {
  try {
    const db = await getOfflineDB();
    await db.put('cachedFiles', {
      id: key,
      title: key,
      fileType: key.endsWith('.pdf') ? 'pdf' : 'epub',
      data: blob,
      cachedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to cache file blob offline:', err);
  }
}

export async function cacheReaderFileOffline(id: string, title: string, fileType: 'epub' | 'pdf', data: ArrayBuffer | Blob | string) {
  const blob = typeof data === 'string' ? new Blob([data]) : data instanceof Blob ? data : new Blob([data]);
  return cacheFileBlobOffline(id, blob);
}

export async function getCachedFileBlobOffline(key: string): Promise<Blob | null> {
  try {
    const db = await getOfflineDB();
    const entry = await db.get('cachedFiles', key);
    if (!entry) return null;
    if (entry.data instanceof Blob) return entry.data;
    if (entry.data instanceof ArrayBuffer) return new Blob([entry.data]);
    return null;
  } catch (err) {
    console.warn('Failed to retrieve cached blob:', err);
    return null;
  }
}

export async function getCachedReaderFile(id: string) {
  try {
    const db = await getOfflineDB();
    return await db.get('cachedFiles', id);
  } catch (err) {
    console.warn('Failed to get cached reader file:', err);
    return null;
  }
}

// Annotations Caching
export async function cacheAnnotationOffline(annotation: BookAnnotation) {
  try {
    const db = await getOfflineDB();
    await db.put('annotations', annotation);
  } catch (err) {
    console.warn('Failed to cache annotation offline:', err);
  }
}

export async function getCachedAnnotationsByBook(bookId: string): Promise<BookAnnotation[]> {
  try {
    const db = await getOfflineDB();
    const index = db.transaction('annotations').store.index('by-book');
    return await index.getAll(bookId);
  } catch (err) {
    console.warn('Failed to get cached annotations:', err);
    return [];
  }
}

export async function deleteCachedAnnotation(id: string) {
  try {
    const db = await getOfflineDB();
    await db.delete('annotations', id);
  } catch (err) {
    console.warn('Failed to delete cached annotation:', err);
  }
}

// Reading Progress Caching
export async function saveReadingProgressOffline(record: ReadingProgressRecord) {
  try {
    const db = await getOfflineDB();
    await db.put('readingProgress', record);
  } catch (err) {
    console.warn('Failed to cache reading progress:', err);
  }
}

export async function getReadingProgressOffline(bookId: string): Promise<ReadingProgressRecord | undefined> {
  try {
    const db = await getOfflineDB();
    return await db.get('readingProgress', bookId);
  } catch (err) {
    console.warn('Failed to get cached progress:', err);
    return undefined;
  }
}

/**
 * Auto-saves the reader's current location (cfi, percentage, totalReadingTimeSec)
 * back into IndexedDB, updating both readingProgress and the cached book entry.
 */
export async function saveBookLocationAndProgressOffline(
  bookId: string,
  progress: {
    cfi: string;
    percentage: number;
    totalSecondsRead?: number;
    currentPage?: number;
    totalPages?: number;
    format?: 'epub' | 'pdf' | 'mobi' | 'txt' | 'markdown';
  }
) {
  try {
    const db = await getOfflineDB();

    // 1. Save reading progress record
    await db.put('readingProgress', {
      bookId,
      cfi: progress.cfi,
      percentage: progress.percentage,
      updated_at: new Date().toISOString(),
    });

    // 2. Update existing cached book if present
    const existingBook = await db.get('books', bookId);
    if (existingBook) {
      const calculatedPages =
        progress.currentPage ||
        Math.round(((progress.percentage || 0) / 100) * (existingBook.totalPages || progress.totalPages || 320));

      const updatedBook: BookForestEntry = {
        ...existingBook,
        lastCfi: progress.cfi,
        currentProgressPages: calculatedPages,
        readingStatus: progress.percentage >= 100 ? 'read' : 'currently-reading',
        dateFinished: progress.percentage >= 100 ? (existingBook.dateFinished || new Date().toISOString().split('T')[0]) : existingBook.dateFinished,
        readingEngine: {
          ...(existingBook.readingEngine || {}),
          format: progress.format || existingBook.readingEngine?.format || 'epub',
          cfi: progress.cfi,
          percentage: progress.percentage,
          totalSecondsRead:
            (existingBook.readingEngine?.totalSecondsRead || 0) + (progress.totalSecondsRead || 0),
        },
      };

      await db.put('books', updatedBook);
      return updatedBook;
    }
    return null;
  } catch (err) {
    console.warn('Failed to save book location and progress to offline DB:', err);
    return null;
  }
}

