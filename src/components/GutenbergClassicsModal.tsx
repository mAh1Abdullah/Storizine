import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Download, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Sun, 
  Moon, 
  Coffee, 
  Check, 
  Globe, 
  Quote, 
  Library 
} from 'lucide-react';
import { GUTENBERG_CLASSICS, GutenbergBook } from '../data/gutenbergClassics';
import { BookForestEntry } from '../types';

interface GutenbergClassicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportToBookForest: (entry: BookForestEntry) => void;
}

export const GutenbergClassicsModal: React.FC<GutenbergClassicsModalProps> = ({
  isOpen,
  onClose,
  onImportToBookForest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<GutenbergBook | null>(GUTENBERG_CLASSICS[0]);
  const [importedIds, setImportedIds] = useState<Record<string, boolean>>({});
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'light' | 'dark'>('sepia');

  if (!isOpen) return null;

  const filteredBooks = GUTENBERG_CLASSICS.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImport = (book: GutenbergBook) => {
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
      reviewComments: `Discovered via Project Gutenberg (Ebook #${book.gutenbergId}). "${book.description}"`,
      quotesSaved: [book.featuredQuote],
      tags: ['Project Gutenberg', 'Public Domain Classic', book.genre, book.year],
      ownedFormats: ['Kindle/Ebook'],
      collectionLocation: 'Kindle Library',
      editionDetails: `Project Gutenberg Ebook #${book.gutenbergId}`,
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
    setImportedIds((prev) => ({ ...prev, [book.id]: true }));
  };

  const themeClasses = {
    sepia: 'bg-[#fffef2] text-[#2a2724] border-[#ebd9c5]',
    light: 'bg-[#fbf9ee] text-[#2a2724] border-[#ebd9c5]',
    dark: 'bg-[#181614] text-[#f5f2e6] border-[#38332c]',
  };

  const fontClasses = {
    sm: 'text-xs leading-relaxed',
    base: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#fbf9ee] dark:bg-[#181614] border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#15803d]/15 border border-[#15803d]/30 text-[#15803d] dark:text-[#4ade80] flex items-center justify-center">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80]">
                  GUTENBERG.ORG INTEGRATION
                </span>
                <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  70,000+ Free Ebooks
                </span>
              </div>
              <h2 className="font-serif font-bold text-lg leading-tight">
                Project Gutenberg Public Domain Classics Library
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#2a2724] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Classics Catalog List */}
          <div className="lg:col-span-5 p-4 border-b lg:border-b-0 lg:border-r border-[#ebd9c5] dark:border-[#38332c] overflow-y-auto space-y-4 max-h-[40vh] lg:max-h-none">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#d4a373] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classic title, author, genre..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
              />
            </div>

            {/* Book Items */}
            <div className="space-y-2.5">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                const isImported = importedIds[book.id];

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-[#2a2724] text-[#f5f2e6] border-[#d4a373] shadow-md'
                        : 'bg-[#fbf9ee] dark:bg-[#25221e] border-[#ebd9c5] dark:border-[#38332c] hover:border-[#d4a373]/50'
                    }`}
                  >
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#d4a373]' : 'text-[#15803d] dark:text-[#4ade80]'}`}>
                          Gutenberg #{book.gutenbergId}
                        </span>
                        <span className="text-[10px] opacity-70">{book.year}</span>
                      </div>
                      <h4 className="font-serif font-bold text-xs truncate leading-snug">
                        {book.title}
                      </h4>
                      <p className="text-[11px] opacity-80 truncate">{book.author}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImport(book);
                      }}
                      disabled={isImported}
                      className={`p-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                        isImported
                          ? 'bg-emerald-800/30 text-emerald-400 border border-emerald-500/30'
                          : isSelected
                          ? 'bg-[#d4a373] text-[#181614] hover:bg-[#c39262]'
                          : 'bg-[#d4a373]/20 text-[#d4a373] hover:bg-[#d4a373] hover:text-[#181614]'
                      }`}
                      title="Import to BookForest catalog"
                    >
                      {isImported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ebook Reader & Details */}
          {selectedBook ? (
            <div className="lg:col-span-7 p-6 overflow-y-auto flex flex-col justify-between space-y-6">
              
              {/* Top Controls & Book Details */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80]">
                      {selectedBook.genre} • {selectedBook.pages} Pages
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#2a2724] dark:text-[#f5f2e6] pt-1">
                      {selectedBook.title}
                    </h3>
                    <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                      by {selectedBook.author} ({selectedBook.year})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleImport(selectedBook)}
                      disabled={importedIds[selectedBook.id]}
                      className="px-3.5 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] disabled:bg-emerald-900/40 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                    >
                      {importedIds[selectedBook.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to BookForest</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Import to BookForest</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedBook.fullGutenbergUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] transition-colors"
                      title="Open full book on Project Gutenberg"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Reader Controls Toolbar */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] text-xs">
                  <span className="font-bold text-[#d4a373] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Gutenberg Ebook Reader</span>
                  </span>

                  <div className="flex items-center space-x-3">
                    {/* Font Size */}
                    <div className="flex items-center space-x-1 bg-[#f5f1e3] dark:bg-[#25221e] p-1 rounded-lg border border-[#ebd9c5] dark:border-[#38332c]">
                      <button
                        onClick={() => setFontSize('sm')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${fontSize === 'sm' ? 'bg-[#d4a373] text-[#181614]' : 'opacity-70'}`}
                      >
                        A-
                      </button>
                      <button
                        onClick={() => setFontSize('base')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${fontSize === 'base' ? 'bg-[#d4a373] text-[#181614]' : 'opacity-70'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('lg')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${fontSize === 'lg' ? 'bg-[#d4a373] text-[#181614]' : 'opacity-70'}`}
                      >
                        A+
                      </button>
                    </div>

                    {/* Theme Switches */}
                    <div className="flex items-center space-x-1 bg-[#f5f1e3] dark:bg-[#25221e] p-1 rounded-lg border border-[#ebd9c5] dark:border-[#38332c]">
                      <button
                        onClick={() => setReaderTheme('sepia')}
                        className={`p-1 rounded ${readerTheme === 'sepia' ? 'bg-[#e7d7b8] text-[#433422]' : 'opacity-70'}`}
                        title="Sepia"
                      >
                        <Coffee className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReaderTheme('light')}
                        className={`p-1 rounded ${readerTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-70'}`}
                        title="Light"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReaderTheme('dark')}
                        className={`p-1 rounded ${readerTheme === 'dark' ? 'bg-slate-900 text-white' : 'opacity-70'}`}
                        title="Dark"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reader Excerpt Paper */}
                <div className={`p-6 sm:p-8 rounded-2xl border font-serif ${themeClasses[readerTheme]} shadow-inner space-y-4`}>
                  <div className="border-b pb-3 border-current/10 flex items-center justify-between text-xs font-sans opacity-75">
                    <span>Project Gutenberg Ebook #{selectedBook.gutenbergId}</span>
                    <span>{selectedBook.language}</span>
                  </div>

                  <div className={`${fontClasses[fontSize]} whitespace-pre-line leading-relaxed`}>
                    {selectedBook.excerptText}
                  </div>

                  <div className="pt-4 border-t border-current/10 font-sans text-xs flex items-center justify-between">
                    <span className="italic opacity-80 flex items-center gap-1">
                      <Quote className="w-3 h-3 text-[#d4a373]" />
                      "{selectedBook.featuredQuote}"
                    </span>
                    <a
                      href={selectedBook.fullGutenbergUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#d4a373] hover:underline flex items-center gap-1"
                    >
                      <span>Read Full Ebook on Gutenberg.org</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-7 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <BookOpen className="w-12 h-12 text-[#d4a373] opacity-40" />
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Select a classic from the catalog to read and import.</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#fbf9ee] dark:bg-[#181614] border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#15803d]" />
            Free and unrestricted public domain ebooks provided by Project Gutenberg (gutenberg.org)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2a2724] text-[#f5f2e6] font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
