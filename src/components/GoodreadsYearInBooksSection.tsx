import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Star, 
  Share2, 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  Clock, 
  Layers 
} from 'lucide-react';
import { BookForestEntry, ReadingGoal } from '../types';

interface GoodreadsYearInBooksSectionProps {
  entries: BookForestEntry[];
  readingGoal: ReadingGoal;
}

export const GoodreadsYearInBooksSection: React.FC<GoodreadsYearInBooksSectionProps> = ({
  entries,
  readingGoal,
}) => {
  const readBooks = entries.filter((e) => e.readingStatus === 'read');
  const totalPagesRead = readBooks.reduce((acc, b) => acc + (b.totalPages || 0), 0);

  // Shortest & Longest
  const sortedByPages = [...readBooks].sort((a, b) => (a.totalPages || 0) - (b.totalPages || 0));
  const shortestBook = sortedByPages[0];
  const longestBook = sortedByPages[sortedByPages.length - 1];

  // Highest Rated
  const sortedByRating = [...readBooks].sort((a, b) => b.userRating - a.userRating);
  const topRatedBook = sortedByRating[0];

  const avgPages = readBooks.length > 0 ? Math.round(totalPagesRead / readBooks.length) : 0;

  return (
    <div className="space-y-6">
      
      {/* Year in Books Poster Header */}
      <div className="p-8 bg-[#181614] text-[#f5f2e6] rounded-3xl border-2 border-[#d4a373] shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#d4a373]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373] text-[#181614] font-handwriting">
              OFFICIAL GOODREADS YEAR IN BOOKS
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl mt-2 text-[#fffef2] leading-tight">
              My {readingGoal.year} Year in Books Infographic
            </h2>
            <p className="text-xs text-[#f5f2e6]/70 mt-1 max-w-xl">
              An annual literary portrait showcasing reading milestones, page records, and book shelf achievements.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">
              Challenge Goal
            </span>
            <span className="font-serif font-bold text-3xl text-amber-400">
              {readBooks.length} / {readingGoal.targetBooks}
            </span>
            <span className="text-xs text-[#f5f2e6]/60 block">Books Completed</span>
          </div>
        </div>

        {/* Big Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#d4a373]/30">
          <div className="p-4 rounded-2xl bg-[#25221e] border border-[#d4a373]/20">
            <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Total Pages Read</span>
            <p className="font-serif font-bold text-2xl text-[#fffef2] mt-1">{totalPagesRead.toLocaleString()}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#25221e] border border-[#d4a373]/20">
            <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Average Length</span>
            <p className="font-serif font-bold text-2xl text-[#fffef2] mt-1">{avgPages} Pages</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#25221e] border border-[#d4a373]/20">
            <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Highest Rating</span>
            <p className="font-serif font-bold text-2xl text-amber-400 mt-1">5.0 ★</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#25221e] border border-[#d4a373]/20">
            <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Active Streak</span>
            <p className="font-serif font-bold text-2xl text-orange-400 mt-1">14 Days</p>
          </div>
        </div>

        {/* Shortest vs Longest Book Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Shortest */}
          {shortestBook && (
            <div className="p-5 rounded-2xl bg-[#25221e] border border-[#d4a373]/30 flex items-center space-x-3">
              <img
                src={shortestBook.coverUrl}
                alt={shortestBook.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">
                  Shortest Book
                </span>
                <h4 className="font-serif font-bold text-sm text-[#fffef2] truncate">
                  {shortestBook.title}
                </h4>
                <p className="text-xs text-[#f5f2e6]/70 truncate">{shortestBook.author}</p>
                <span className="text-xs font-bold text-[#d4a373] mt-1 block">
                  {shortestBook.totalPages} Pages
                </span>
              </div>
            </div>
          )}

          {/* Longest */}
          {longestBook && (
            <div className="p-5 rounded-2xl bg-[#25221e] border border-[#d4a373]/30 flex items-center space-x-3">
              <img
                src={longestBook.coverUrl}
                alt={longestBook.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">
                  Longest Book
                </span>
                <h4 className="font-serif font-bold text-sm text-[#fffef2] truncate">
                  {longestBook.title}
                </h4>
                <p className="text-xs text-[#f5f2e6]/70 truncate">{longestBook.author}</p>
                <span className="text-xs font-bold text-[#d4a373] mt-1 block">
                  {longestBook.totalPages} Pages
                </span>
              </div>
            </div>
          )}

          {/* Top Rated */}
          {topRatedBook && (
            <div className="p-5 rounded-2xl bg-[#25221e] border border-[#d4a373]/30 flex items-center space-x-3">
              <img
                src={topRatedBook.coverUrl}
                alt={topRatedBook.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Highest Rated
                </span>
                <h4 className="font-serif font-bold text-sm text-[#fffef2] truncate">
                  {topRatedBook.title}
                </h4>
                <p className="text-xs text-[#f5f2e6]/70 truncate">{topRatedBook.author}</p>
                <span className="text-xs font-bold text-amber-400 mt-1 block">
                  {topRatedBook.userRating}.0 ★★★★★
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Visual Book Grid Poster */}
        <div className="space-y-3 pt-4 border-t border-[#d4a373]/30">
          <h3 className="font-serif font-bold text-base text-[#fffef2]">
            {readingGoal.year} Finished Book Collage Shelf ({readBooks.length})
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {readBooks.map((b) => (
              <div key={b.id} className="group relative">
                <img
                  src={b.coverUrl}
                  alt={b.title}
                  className="w-full h-32 object-cover rounded-xl shadow-md border border-[#d4a373]/30 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                  <p className="font-bold truncate">{b.title}</p>
                  <p className="text-amber-400 font-bold">{b.userRating} ★</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
