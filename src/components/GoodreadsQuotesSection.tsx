import React, { useState } from 'react';
import { 
  Quote, 
  Search, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  BookMarked 
} from 'lucide-react';
import { GOODREADS_QUOTES, GoodreadsQuote } from '../data/goodreadsData';
import { BookForestEntry } from '../types';

interface GoodreadsQuotesSectionProps {
  onImportToBookForest: (entry: BookForestEntry) => void;
}

export const GoodreadsQuotesSection: React.FC<GoodreadsQuotesSectionProps> = ({
  onImportToBookForest,
}) => {
  const [quotesList, setQuotesList] = useState<GoodreadsQuote[]>(GOODREADS_QUOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quote Card Generator Modal state
  const [activeCardQuote, setActiveCardQuote] = useState<GoodreadsQuote | null>(null);
  const [cardTheme, setCardTheme] = useState<'parchment' | 'midnight' | 'emerald' | 'rose'>('parchment');

  const allTags = ['All', 'Reading', 'Books', 'Wisdom', 'Magic', 'Choices', 'Travel', 'Friendship'];

  const filteredQuotes = quotesList.filter((q) => {
    const matchesQuery =
      q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.bookTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'All' || q.tags.includes(selectedTag);

    return matchesQuery && matchesTag;
  });

  const handleLike = (id: string) => {
    setQuotesList((prev) =>
      prev.map((q) => (q.id === id ? { ...q, likes: q.likes + (likedMap[id] ? -1 : 1) } : q))
    );
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyQuote = (q: GoodreadsQuote) => {
    const text = `"${q.quote}" — ${q.author}, ${q.bookTitle}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveQuoteToBookForest = (q: GoodreadsQuote) => {
    const entry: BookForestEntry = {
      id: `quote-book-${q.id}-${Date.now()}`,
      title: q.bookTitle,
      author: q.author,
      coverUrl: q.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      genre: 'Literature',
      readingStatus: 'want-to-read',
      userRating: 5,
      currentProgressPages: 0,
      totalPages: 320,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Saved from Goodreads Quotes database. Quote: "${q.quote}"`,
      quotesSaved: [q.quote],
      tags: ['Goodreads Quote', ...q.tags],
      ownedFormats: ['Paperback'],
      collectionLocation: 'Wishlist / Not Owned',
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
  };

  const cardThemeStyles = {
    parchment: 'bg-[#fffef2] text-[#2a2724] border-[#ebd9c5]',
    midnight: 'bg-[#181614] text-[#f5f2e6] border-[#38332c]',
    emerald: 'bg-[#064e3b] text-[#ecfdf5] border-[#047857]',
    rose: 'bg-[#4c0519] text-[#fff1f2] border-[#881337]',
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-[#25221e] text-[#f5f2e6] rounded-3xl border border-[#d4a373]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 flex items-center space-x-1">
              <Quote className="w-3 h-3 text-[#d4a373]" />
              <span>GOODREADS LITERARY QUOTES</span>
            </span>
            <span className="text-xs text-[#d4a373] font-handwriting">
              Search & Design Printable Quote Cards
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl mt-1 leading-tight">
            Popular Literary Quotes & Quote Card Studio
          </h2>
          <p className="text-xs text-[#f5f2e6]/70 mt-1 max-w-xl">
            Discover thousands of timeless literary quotes, generate styled quote cards for social sharing, and save quotes directly into your BookForest notes.
          </p>
        </div>
      </div>

      {/* Search & Tag Filter Strip */}
      <div className="p-5 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#d4a373] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes by author, title, or keywords (e.g. Tolkien, Magic, Reading)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-xs font-serif outline-none"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
                  : 'bg-[#f5f1e3] dark:bg-[#181614] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.map((q) => {
          const isLiked = likedMap[q.id];
          const isCopied = copiedId === q.id;

          return (
            <div
              key={q.id}
              className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] flex flex-col justify-between space-y-4 shadow-xs hover:border-[#d4a373] transition-all"
            >
              <div className="space-y-3">
                <Quote className="w-8 h-8 text-[#d4a373]/40" />
                <p className="font-serif font-medium text-base text-[#2a2724] dark:text-[#f5f2e6] leading-relaxed italic">
                  "{q.quote}"
                </p>

                <div>
                  <h4 className="font-serif font-bold text-xs text-[#d4a373]">
                    — {q.author}
                  </h4>
                  <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    from <span className="italic font-serif">{q.bookTitle}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(q.id)}
                    className={`flex items-center space-x-1 text-xs font-bold transition-colors ${
                      isLiked ? 'text-rose-500' : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{q.likes.toLocaleString()}</span>
                  </button>

                  <button
                    onClick={() => handleCopyQuote(q)}
                    className="p-1.5 rounded-xl text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#d4a373] transition-colors"
                    title="Copy Quote text"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveCardQuote(q)}
                    className="px-3 py-1.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] text-xs font-bold flex items-center space-x-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Design Card</span>
                  </button>

                  <button
                    onClick={() => handleSaveQuoteToBookForest(q)}
                    className="px-3 py-1.5 rounded-xl bg-[#15803d] text-white hover:bg-[#166534] text-xs font-bold flex items-center space-x-1"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Save Book</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote Card Studio Modal */}
      {activeCardQuote && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#221f1c] text-[#f5f2e6] border border-[#d4a373]/40 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#d4a373]" />
                <h3 className="font-serif font-bold text-lg">Literary Quote Card Studio</h3>
              </div>
              <button
                onClick={() => setActiveCardQuote(null)}
                className="text-[#f5f2e6]/60 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Theme Selector */}
            <div className="flex items-center justify-center space-x-2">
              {(['parchment', 'midnight', 'emerald', 'rose'] as const).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setCardTheme(thm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border ${
                    cardTheme === thm ? 'border-[#d4a373] bg-[#d4a373]/20 text-[#d4a373]' : 'border-[#ebd9c5]/30'
                  }`}
                >
                  {thm}
                </button>
              ))}
            </div>

            {/* Styled Card Canvas Preview */}
            <div className={`p-8 rounded-3xl border-2 shadow-2xl text-center space-y-6 font-serif ${cardThemeStyles[cardTheme]}`}>
              <Quote className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-lg font-medium leading-relaxed italic">
                "{activeCardQuote.quote}"
              </p>
              <div>
                <h4 className="font-serif font-bold text-sm">
                  — {activeCardQuote.author}
                </h4>
                <p className="text-xs opacity-70">
                  {activeCardQuote.bookTitle}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleCopyQuote(activeCardQuote)}
                className="px-4 py-2 rounded-xl bg-[#d4a373] text-[#181614] font-bold text-xs flex items-center space-x-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
