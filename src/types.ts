export type BookFormat = 'Hardcover' | 'Paperback' | "Collector's Edition" | 'Signed Copy' | 'First Edition' | 'Kindle/Ebook' | 'Audiobook';

export type CollectionLocation = 'Physical Main Bookshelf' | 'Physical Special Shelf' | 'Kindle Library' | 'Audible' | 'Wishlist / Not Owned';

export type ReadingStatus = 'want-to-read' | 'currently-reading' | 'read' | 'did-not-finish';

export type WritingStage = 'Outlining' | 'Drafting' | 'Revision' | 'Editing' | 'Proofreading' | 'ARC Review' | 'Print Ready';

export interface BuyLink {
  vendor: string;
  url: string;
  price?: string;
}

export interface PublishedBook {
  id: string;
  title: string;
  subtitle?: string;
  series?: string;
  seriesNumber?: number;
  coverUrl: string;
  genre: string;
  releaseDate: string;
  publisher: string;
  isbn?: string;
  blurb: string;
  excerpt?: string; // Sample chapter text
  buyLinks: BuyLink[];
  praise: { quote: string; source: string }[];
  rating: number;
  pages: number;
  formats: ('Hardcover' | 'Paperback' | 'Ebook' | 'Audiobook')[];
  showOnFrontPage?: boolean;
  epubUrl?: string;
  pdfUrl?: string;
  fileType?: 'epub' | 'pdf' | 'text';
}

export interface UpcomingBook {
  id: string;
  title: string;
  series?: string;
  coverUrl: string;
  genre: string;
  expectedRelease: string;
  writingStage: WritingStage;
  progressPercentage: number;
  blurb: string;
  teaserQuote: string;
  preorderLinks: BuyLink[];
  showOnFrontPage?: boolean;
}

export interface BookLoan {
  isLoanedOut: boolean;
  borrowerName?: string;
  borrowerContact?: string;
  loanDate?: string;
  dueDate?: string;
}

export interface JournalPrompts {
  plotTwistRating?: string;
  favoriteQuote?: string;
  worldbuildingNotes?: string;
  pacingAndTone?: string;
  wouldReRead?: string;
  emotionalImpact?: string;
}

export interface BookForestEntry {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string;
  readingStatus: ReadingStatus;
  userRating: number; // 0 to 5
  currentProgressPages?: number;
  totalPages?: number;
  dateAdded: string;
  dateStarted?: string;
  dateFinished?: string;
  reviewComments: string;
  quotesSaved: string[];
  tags: string[];
  
  // Personal Collection & Edition Tracking
  ownedFormats: BookFormat[];
  collectionLocation: CollectionLocation;
  editionDetails?: string;
  purchasePrice?: number;
  readCount: number;

  // Book Lending Tracker (BookBuddy+)
  loan?: BookLoan;

  // Guided Journal Prompts (Goodnotes aesthetic review)
  journalPrompts?: JournalPrompts;

  // Reader Files & Position
  epubUrl?: string;
  pdfUrl?: string;
  txtUrl?: string;
  fileType?: 'epub' | 'pdf' | 'text' | 'mobi' | 'markdown';
  lastCfi?: string;

  // Readest Engine Extensions
  readingEngine?: {
    fileUrl?: string;
    format: 'epub' | 'pdf' | 'mobi' | 'txt' | 'markdown';
    cfi: string;
    percentage: number;
    totalSecondsRead: number;
  };
  annotations?: Array<{
    id: string;
    cfiRange: string;
    color: 'yellow' | 'blue' | 'green' | 'pink';
    highlightText: string;
    note?: string;
    createdDate: string;
  }>;
}

// Readest Schema Extension
export interface BookForestItem {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  shelf: 'read' | 'currently-reading' | 'want-to-read' | 'dnf';
  ownedFormat: 'Hardcover' | 'Paperback' | 'Ebook' | 'Audiobook';
  shelfLocation?: string;
  price?: number;
  
  // Readest Engine Extensions
  readingEngine?: {
    fileUrl?: string;                   // Blob URL, local path, or remote storage link
    format: 'epub' | 'pdf' | 'mobi' | 'txt' | 'markdown';
    cfi: string;                        // Standard Canonical Fragment Identifier
    percentage: number;
    totalSecondsRead: number;
  };
  annotations?: Array<{
    id: string;
    cfiRange: string;
    color: 'yellow' | 'blue' | 'green' | 'pink';
    highlightText: string;
    note?: string;
    createdDate: string;
  }>;
}

export interface AuthorProfile {
  name: string;
  penName?: string;
  title: string;
  bio: string;
  avatarUrl: string;
  socialLinks: { platform: string; url: string }[];
  newsletterSignupUrl?: string;
  featuredQuote: string;
}

export type StorizineCategory = 
  | 'Novels & Series' 
  | 'Sci-Fi & Cyberpunk' 
  | 'Stories' 
  | 'Short Stories' 
  | 'Articles & Essays' 
  | 'Guides & Features';

export interface StorizineWork {
  id: string;
  number: number;
  title: string;
  titleBengali?: string;
  category: StorizineCategory;
  subcategory?: string;
  series?: string;
  coverUrl: string;
  language: string;
  blurbEnglish?: string;
  blurbBengali?: string;
  excerpt?: string;
  chapterCount?: number;
  readOnPlatforms?: { name: string; url: string }[];
  tags: string[];
  featured?: boolean;
  epubUrl?: string;
  pdfUrl?: string;
}

export interface ReadingChallenge {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface ReadingGoal {
  year: number;
  targetBooks: number;
  completedBooks: number;
  targetPages?: number;
  completedPages?: number;
  preferredGenres?: string[];
  challenges?: ReadingChallenge[];
}

// 2. Metadata & Annotations Table (SQL Table Schema)
export interface BookAnnotation {
  id: string;
  book_id: string;
  user_id: string;
  cfi_range: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  note?: string;
  highlighted_text?: string;
  created_at: string;
}

// 3. Real-Time Reading Progress
export interface ReadingProgressRecord {
  bookId: string;
  cfi: string;
  percentage: number;
  updated_at: string;
}

// 4. Reader Display Settings (Readest & Foliate Core)
export type ReaderPalette = 'day' | 'night' | 'sepia' | 'blue-light' | 'oled';
export type ReaderFontFamily = 'Merriweather' | 'Inter' | 'OpenDyslexic' | 'Georgia' | 'Cinzel' | 'Fira Code';
export type ReadingMode = 'paginated' | 'continuous';

export interface ReaderSettings {
  fontSize: number; // 12 to 72 pt
  lineHeight: number; // 1.0 to 2.8
  marginPadding: number; // 12 to 96 px
  fontFamily: ReaderFontFamily;
  colorPalette: ReaderPalette;
  readingMode: ReadingMode;
}

// 5. Readest WordLens Offline Dictionary
export interface WordLensDefinition {
  word: string;
  partOfSpeech: string;
  phonetic?: string;
  definition: string;
  synonyms?: string[];
  grammarTags?: string[];
  example?: string;
  bengaliTranslation?: string;
}
