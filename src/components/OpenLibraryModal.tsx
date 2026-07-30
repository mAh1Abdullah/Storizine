import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Globe, 
  Sparkles, 
  Check, 
  Loader2, 
  BookMarked 
} from 'lucide-react';
import { BookForestEntry } from '../types';

interface OpenLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const OpenLibraryModal: React.FC<OpenLibraryModalProps> = ({
  isOpen,
  onClose,
  onImportToBookForest,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<OpenLibraryDoc[]>([]);
  const [importedKeys, setImportedKeys] = useState<Record<string, boolean>>({});
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=12`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.docs || []);
      }
    } catch (err) {
      console.error('Open Library Search Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (doc: OpenLibraryDoc) => {
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
      reviewComments: `Imported via Open Library (Internet Archive). First published in ${
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
    setImportedKeys((prev) => ({ ...prev, [doc.key]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#25221e] text-[#f5f2e6] border-b border-[#ebd9c5]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a373] text-[#181614] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
                  OPENLIBRARY.ORG
                </span>
                <span className="text-xs text-[#d4a373] font-handwriting">
                  Internet Archive Open Book Catalog
                </span>
              </div>
              <h2 className="font-serif font-bold text-lg leading-tight">
                Search Millions of Open Ebooks & Editions
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-[#f5f2e6]/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 bg-[#fbf9ee] dark:bg-[#181614] border-b border-[#ebd9c5] dark:border-[#38332c]">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#d4a373] absolute left-3.5 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author name, ISBN, or topic (e.g. Science Fiction, Jane Austen)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#25221e] text-xs font-serif outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-2 shadow-xs shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#d4a373]" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search Open Library</span>
            </button>
          </form>
        </div>

        {/* Results Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!hasSearched && (
            <div className="text-center py-12 space-y-3">
              <BookMarked className="w-12 h-12 text-[#d4a373] mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-base">Search OpenLibrary.org Database</h3>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 max-w-md mx-auto">
                Discover titles from the Internet Archive public catalog, check page numbers, authors, and import directly into your BookForest library.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#d4a373] mx-auto" />
              <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Querying Open Library database...</p>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center py-12 text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              No results found for "{query}". Try another search term.
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((doc) => {
                const cover = doc.cover_i
                  ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                  : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                const isImported = importedKeys[doc.key];

                return (
                  <div
                    key={doc.key}
                    className="p-4 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] flex space-x-3 justify-between"
                  >
                    <img
                      src={cover}
                      alt={doc.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#d4a373]">
                          {doc.first_publish_year ? `Published ${doc.first_publish_year}` : 'Classic Work'}
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
                          onClick={() => handleImport(doc)}
                          disabled={isImported}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 ${
                            isImported
                              ? 'bg-emerald-800/30 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#d4a373] text-[#181614] hover:bg-[#c39262]'
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

        {/* Footer */}
        <div className="px-6 py-3 bg-[#fbf9ee] dark:bg-[#181614] border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#d4a373]" />
            Powered by Open Library REST API (openlibrary.org)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2a2724] text-[#f5f2e6] font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
