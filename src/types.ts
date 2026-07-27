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
  editionDetails?: string; // e.g. "Illumicrate Special Sprayed Edges"
  purchasePrice?: number;
  readCount: number;
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
  challenges?: ReadingChallenge[];
}
