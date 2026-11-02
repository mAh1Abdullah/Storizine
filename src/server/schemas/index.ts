import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  displayName: z.string().min(1).max(100),
  role: z.enum(['user', 'author', 'editor']).optional().default('user'),
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  passcode: z.string().optional(),
});

export const bookCreateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).optional(),
  author: z.string().min(1).max(255),
  genre: z.string().max(100).optional(),
  coverUrl: z.string().max(1000).optional(),
  alternateCovers: z.array(z.string()).optional(),
  totalPages: z.number().int().nonnegative().optional(),
  isbn: z.string().max(50).optional(),
  publisher: z.string().max(255).optional(),
  releaseDate: z.string().max(50).optional(),
  blurb: z.string().max(5000).optional(),
  excerpt: z.string().optional(),
  epubUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  fileType: z.enum(['epub', 'pdf', 'text', 'markdown']).optional(),
});

export const libraryItemCreateSchema = z.object({
  bookId: z.string().min(1),
  readingStatus: z.enum(['want-to-read', 'currently-reading', 'read', 'did-not-finish']).default('want-to-read'),
  userRating: z.number().min(0).max(5).optional().default(0),
  ownedFormat: z.enum(['Hardcover', 'Paperback', "Collector's Edition", 'Signed Copy', 'First Edition', 'Kindle/Ebook', 'Audiobook']).optional().default('Kindle/Ebook'),
  collectionLocation: z.string().max(100).optional(),
  reviewComments: z.string().max(5000).optional(),
  quotes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const libraryItemUpdateSchema = z.object({
  readingStatus: z.enum(['want-to-read', 'currently-reading', 'read', 'did-not-finish']).optional(),
  userRating: z.number().min(0).max(5).optional(),
  ownedFormat: z.string().optional(),
  collectionLocation: z.string().optional(),
  reviewComments: z.string().optional(),
  quotes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const readingProgressSchema = z.object({
  bookId: z.string().min(1),
  cfi: z.string().default(''),
  percentage: z.number().min(0).max(100).default(0),
  currentPage: z.number().int().nonnegative().optional().default(0),
  totalSecondsRead: z.number().int().nonnegative().optional().default(0),
});

export const annotationCreateSchema = z.object({
  id: z.string().optional(),
  book_id: z.string().min(1),
  cfi_range: z.string().min(1),
  color: z.enum(['yellow', 'blue', 'green', 'pink']).default('yellow'),
  note: z.string().max(5000).optional().default(''),
  highlighted_text: z.string().max(5000).optional().default(''),
});

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(255),
  format: z.enum(['novel', 'novella', 'short-story', 'series', 'essay']).default('novel'),
  language: z.string().max(50).default('English'),
  genre: z.string().max(100).optional(),
  premise: z.string().max(2000).optional(),
  workflow: z.enum(['outline-first', 'discovery', 'hybrid']).default('hybrid'),
  status: z.enum(['concept', 'outlining', 'drafting', 'revising', 'completed', 'archived']).default('drafting'),
  targetWordCount: z.number().int().positive().default(80000),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const documentCreateSchema = z.object({
  title: z.string().min(1).max(255),
  docType: z.enum(['draft', 'outline', 'synopsis', 'scene', 'note']).default('draft'),
  content: z.string().default(''),
  orderIndex: z.number().int().default(0),
});

export const documentUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  docType: z.enum(['draft', 'outline', 'synopsis', 'scene', 'note']).optional(),
  content: z.string().optional(),
  expectedVersion: z.number().int().optional(),
  orderIndex: z.number().int().optional(),
});

export const documentVersionCreateSchema = z.object({
  summary: z.string().max(500).optional(),
});

export const storyBibleItemSchema = z.object({
  category: z.enum(['character', 'location', 'lore', 'item', 'plot_thread', 'theme']),
  name: z.string().min(1).max(255),
  summary: z.string().max(2000).optional(),
  details: z.record(z.string(), z.any()).optional(),
  orderIndex: z.number().int().default(0),
});

export const journalEntryCreateSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  linkedBookId: z.string().optional().nullable(),
  linkedProjectId: z.string().optional().nullable(),
  mood: z.string().max(50).optional().nullable(),
});

export const journalEntryUpdateSchema = journalEntryCreateSchema.partial();

export const submissionCreateSchema = z.object({
  title: z.string().min(1).max(255),
  genre: z.string().max(100),
  wordCount: z.number().int().positive(),
  synopsis: z.string().min(10).max(5000),
  manuscriptUrl: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const magazineItemCreateSchema = z.object({
  slug: z.string().min(2).max(255),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).optional().nullable(),
  authorName: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  excerpt: z.string().min(1).max(2000),
  bodyMarkdown: z.string().min(1),
  coverImage: z.string().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});
