import React, { useState } from 'react';
import { 
  Library, 
  Globe, 
  Search, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Check, 
  Loader2, 
  Quote, 
  Sun, 
  Moon, 
  Coffee,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { GUTENBERG_CLASSICS, GutenbergBook } from '../data/gutenbergClassics';
import { BookForestEntry } from '../types';

interface LibrarySectionProps {
  onImportToBookForest: (entry: BookForestEntry) => void;
}

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
  edition_count?: number;
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({
  onImportToBookForest,
}) => {
  const [activeCatalog, setActiveCatalog] = useState<'gutenberg' | 'openlibrary'>('gutenberg');
  
  // Gutenberg state
  const [gutenbergQuery, setGutenbergQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<GutenbergBook | null>(GUTENBERG_CLASSICS[0]);
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'light' | 'dark'>('sepia');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Open Library state
  const [openLibQuery, setOpenLibQuery] = useState('');
  const [openLibLoading, setOpenLibLoading] = useState(false);
  const [openLibResults, setOpenLibResults] = useState<OpenLibraryDoc[]>([]);
  const [openLibSearched, setOpenLibSearched] = useState(false);

  const [importedKeys, setImportedKeys] = useState<Record<string, boolean>>({});

  // Filter Gutenberg books
  const filteredGutenberg = GUTENBERG_CLASSICS.filter(
    (b) =>
      b.title.toLowerCase().includes(gutenbergQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(gutenbergQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(gutenbergQuery.toLowerCase())
  );

  const handleImportGutenberg = (book: GutenbergBook) => {
    const entry: BookForestEntry = {
      id: `gut-entry-${book.gutenbergId}-${Date.now()}`,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      genre: book.genre,
      readingStatus: 'want-to-read',
      userRating: 5,
      currentProgressPages: 0,
      totalPages: book.pages,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Discovered in Library via Project Gutenberg (Ebook #${book.gutenbergId}). "${book.description}"`,
      quotesSaved: [book.featuredQuote],
      tags: ['Project Gutenberg', 'Public Domain Classic', book.genre, book.year],
      ownedFormats: ['Kindle/Ebook'],
      collectionLocation: 'Kindle Library',
      editionDetails: `Project Gutenberg Ebook #${book.gutenbergId}`,
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
    setImportedKeys((prev) => ({ ...prev, [`gut-${book.id}`]: true }));
  };

  const handleOpenLibSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openLibQuery.trim()) return;

    setOpenLibLoading(true);
    setOpenLibSearched(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(openLibQuery.trim())}&limit=12`
      );
      if (response.ok) {
        const data = await response.json();
        setOpenLibResults(data.docs || []);
      }
    } catch (err) {
      console.error('Open Library Search Error:', err);
    } finally {
      setOpenLibLoading(false);
    }
  };

  const handleImportOpenLib = (doc: OpenLibraryDoc) => {
    const author = doc.author_name ? doc.author_name.join(', ') : 'Unknown Author';
    const pages = doc.number_of_pages_median || 320;
    const coverUrl = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
    const genre = doc.subject ? doc.subject.slice(0, 2).join(', ') : 'Literature';

    const entry: BookForestEntry = {
      id: `openlib-${doc.key.replace(/\//g, '-')}-${Date.now()}`,
      title: doc.title,
      author: author,
      coverUrl: coverUrl,
      genre: genre,
      readingStatus: 'want-to-read',
      userRating: 5,
      currentProgressPages: 0,
      totalPages: pages,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Discovered in Library via Open Library (Internet Archive). First published in ${
        doc.first_publish_year || 'N/A'
      }. Editions: ${doc.edition_count || 1}.`,
      quotesSaved: [],
      tags: ['Open Library', 'Internet Archive', ...(doc.subject ? doc.subject.slice(0, 3) : [])],
      ownedFormats: ['Paperback'],
      collectionLocation: 'Physical Main Bookshelf',
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
    setImportedKeys((prev) => ({ ...prev, [`ol-${doc.key}`]: true }));
  };

  const themeClasses = {
    sepia: 'bg-[#fffef2] text-[#2a2724] border-[#ebd9c5]',
    light: 'bg-[#fbf9ee] text-[#2a2724] border-[#ebd9c5]',
    dark: 'bg-[#181614] text-[#f5f2e6] border-[#38332c]',
  };

  const fontClasses = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-relaxed',
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-[#25221e] text-[#f5f2e6] rounded-3xl border border-[#d4a373]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
              UNIFIED DIGITAL LIBRARY
            </span>
            <span className="text-xs text-[#d4a373] font-handwriting">
              70,000+ Public Domain Classics & Millions of Open Catalog Titles
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl mt-1 leading-tight">
            Library Archive & Search Engine
          </h2>
          <p className="text-xs text-[#f5f2e6]/70 mt-1 max-w-xl">
            Explore free ebook downloads, read full-text sample chapters, search global catalog editions via Open Library, and add titles directly to your BookForest.
          </p>
        </div>

        {/* Catalog Selector Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-[#181614] rounded-2xl border border-[#d4a373]/30 shrink-0">
          <button
            onClick={() => setActiveCatalog('gutenberg')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCatalog === 'gutenberg'
                ? 'bg-[#15803d] text-white shadow-md'
                : 'text-[#f5f2e6]/70 hover:text-white'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Project Gutenberg</span>
          </button>

          <button
            onClick={() => setActiveCatalog('openlibrary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeCatalog === 'openlibrary'
                ? 'bg-[#0284c7] text-white shadow-md'
                : 'text-[#f5f2e6]/70 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Open Library Catalog</span>
          </button>
        </div>
      </div>

      {/* CATALOG 1: PROJECT GUTENBERG */}
      {activeCatalog === 'gutenberg' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Book Selector List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-[#d4a373] absolute left-3.5 top-3" />
              <input
                type="text"
                value={gutenbergQuery}
                onChange={(e) => setGutenbergQuery(e.target.value)}
                placeholder="Search classics by title, author, or genre..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-xs font-serif outline-none"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredGutenberg.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                const isImported = importedKeys[`gut-${book.id}`];

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex space-x-3 items-center justify-between ${
                      isSelected
                        ? 'bg-[#f5f1e3] dark:bg-[#25221e] border-[#d4a373] shadow-sm'
                        : 'bg-[#fffef2] dark:bg-[#181614] border-[#ebd9c5] dark:border-[#38332c] hover:bg-[#fbf9ee]'
                    }`}
                  >
                    <div className="flex space-x-3 items-center min-w-0">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">
                          {book.genre} • {book.year}
                        </span>
                        <h4 className="font-serif font-bold text-xs truncate text-[#2a2724] dark:text-[#f5f2e6]">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 truncate">
                          {book.author}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImportGutenberg(book);
                      }}
                      disabled={isImported}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center space-x-1 ${
                        isImported
                          ? 'bg-emerald-800/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#15803d] text-white hover:bg-[#166534]'
                      }`}
                    >
                      {isImported ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span>{isImported ? 'Added' : 'Import'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Book Preview Reader */}
          <div className="lg:col-span-7">
            {selectedBook ? (
              <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-6">
                
                {/* Book Meta Details */}
                <div className="flex flex-col sm:flex-row gap-4 items-start border-b border-[#ebd9c5] dark:border-[#38332c] pb-5">
                  <img
                    src={selectedBook.coverUrl}
                    alt={selectedBook.title}
                    className="w-24 h-36 object-cover rounded-xl shadow-md border border-[#ebd9c5] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/10 text-[#15803d] dark:text-[#4ade80] border border-[#15803d]/30">
                        Project Gutenberg Ebook #{selectedBook.gutenbergId}
                      </span>
                      <span className="text-xs text-[#d4a373] font-bold font-handwriting">
                        {selectedBook.pages} Pages • Free Download
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                      {selectedBook.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                      by {selectedBook.author} ({selectedBook.year})
                    </p>
                    <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed">
                      {selectedBook.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleImportGutenberg(selectedBook)}
                        disabled={importedKeys[`gut-${selectedBook.id}`]}
                        className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs flex items-center space-x-2 shadow-sm"
                      >
                        {importedKeys[`gut-${selectedBook.id}`] ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>In BookForest Library</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Add to BookForest</span>
                          </>
                        )}
                      </button>

                      <a
                        href={selectedBook.fullGutenbergUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Gutenberg.org</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Reader Controls */}
                <div className="flex items-center justify-between text-xs bg-[#f5f1e3] dark:bg-[#181614] p-3 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c]">
                  <span className="font-bold text-[#d4a373] font-serif">Full-Text Excerpt Reader</span>

                  <div className="flex items-center space-x-3">
                    {/* Theme Toggles */}
                    <div className="flex items-center space-x-1 bg-[#fffef2] dark:bg-[#25221e] p-1 rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
                      <button
                        onClick={() => setReaderTheme('sepia')}
                        className={`p-1 rounded-lg ${readerTheme === 'sepia' ? 'bg-[#d4a373] text-[#181614]' : ''}`}
                        title="Sepia Mode"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReaderTheme('light')}
                        className={`p-1 rounded-lg ${readerTheme === 'light' ? 'bg-[#d4a373] text-[#181614]' : ''}`}
                        title="Light Mode"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReaderTheme('dark')}
                        className={`p-1 rounded-lg ${readerTheme === 'dark' ? 'bg-[#d4a373] text-[#181614]' : ''}`}
                        title="Dark Mode"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Font Size Toggles */}
                    <div className="flex items-center space-x-1 bg-[#fffef2] dark:bg-[#25221e] p-1 rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
                      {(['sm', 'base', 'lg'] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setFontSize(sz)}
                          className={`px-2 py-0.5 rounded-lg font-bold text-[10px] ${
                            fontSize === sz ? 'bg-[#2a2724] text-[#d4a373]' : ''
                          }`}
                        >
                          {sz.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Excerpt Container */}
                <div className={`p-6 rounded-2xl border shadow-inner max-h-96 overflow-y-auto space-y-4 font-serif ${themeClasses[readerTheme]} ${fontClasses[fontSize]}`}>
                  <p className="whitespace-pre-line">{selectedBook.excerptText}</p>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-dashed border-[#ebd9c5] dark:border-[#38332c]">
                Select a book from the Gutenberg list to read its sample excerpt.
              </div>
            )}
          </div>

        </div>
      )}

      {/* CATALOG 2: OPEN LIBRARY DATABASE */}
      {activeCatalog === 'openlibrary' && (
        <div className="space-y-6">
          
          {/* Search Box */}
          <div className="p-6 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#0284c7]" />
              <h3 className="font-serif font-bold text-lg">Search Millions of Books via OpenLibrary.org</h3>
            </div>
            
            <form onSubmit={handleOpenLibSearch} className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#0284c7] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={openLibQuery}
                  onChange={(e) => setOpenLibQuery(e.target.value)}
                  placeholder="Search by title, author, ISBN, or topic (e.g. Science Fiction, Charles Dickens)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-xs font-serif outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={openLibLoading}
                className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center space-x-2 shadow-sm shrink-0"
              >
                {openLibLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search Catalog</span>
              </button>
            </form>
          </div>

          {/* Results Grid */}
          {!openLibSearched && (
            <div className="text-center py-12 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-dashed border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <BookMarked className="w-12 h-12 text-[#0284c7] mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-base">Search Open Library REST API</h3>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 max-w-md mx-auto">
                Type any book title or author name above to query millions of indexed records from the Internet Archive open database.
              </p>
            </div>
          )}

          {openLibLoading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#0284c7] mx-auto" />
              <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Fetching live catalog results from Open Library...</p>
            </div>
          )}

          {!openLibLoading && openLibSearched && openLibResults.length === 0 && (
            <div className="text-center py-12 text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-dashed border-[#ebd9c5]">
              No results found for "{openLibQuery}". Please try another keyword.
            </div>
          )}

          {!openLibLoading && openLibResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openLibResults.map((doc) => {
                const cover = doc.cover_i
                  ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                  : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                const isImported = importedKeys[`ol-${doc.key}`];

                return (
                  <div
                    key={doc.key}
                    className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] flex space-x-3 justify-between"
                  >
                    <img
                      src={cover}
                      alt={doc.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#0284c7]">
                          {doc.first_publish_year ? `Published ${doc.first_publish_year}` : 'Catalog Title'}
                        </span>
                        <h4 className="font-serif font-bold text-xs truncate leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 truncate">
                          {doc.author_name ? doc.author_name.join(', ') : 'Unknown Author'}
                        </p>
                        <p className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                          {doc.number_of_pages_median || 320} Pages • {doc.edition_count || 1} Editions
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleImportOpenLib(doc)}
                          disabled={isImported}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 ${
                            isImported
                              ? 'bg-emerald-800/30 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
                          }`}
                        >
                          {isImported ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3" />
                              <span>Import</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`https://openlibrary.org${doc.key}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834]"
                          title="View on OpenLibrary.org"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
