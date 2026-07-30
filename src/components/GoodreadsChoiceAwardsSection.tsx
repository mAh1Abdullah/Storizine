import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  Plus, 
  Heart, 
  Sparkles, 
  Bookmark, 
  Check, 
  ChevronRight, 
  Star 
} from 'lucide-react';
import { GOODREADS_CHOICE_AWARDS, ChoiceAwardBook } from '../data/goodreadsData';
import { BookForestEntry } from '../types';

interface GoodreadsChoiceAwardsSectionProps {
  onImportToBookForest: (entry: BookForestEntry) => void;
}

export const GoodreadsChoiceAwardsSection: React.FC<GoodreadsChoiceAwardsSectionProps> = ({
  onImportToBookForest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(GOODREADS_CHOICE_AWARDS[0].id);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}); // categoryId -> bookId
  const [importedIds, setImportedIds] = useState<Record<string, boolean>>({});

  const currentCategory = GOODREADS_CHOICE_AWARDS.find((c) => c.id === selectedCategory) || GOODREADS_CHOICE_AWARDS[0];

  const handleVote = (categoryId: string, bookId: string) => {
    setUserVotes((prev) => ({ ...prev, [categoryId]: bookId }));
  };

  const handleImportNominee = (book: ChoiceAwardBook) => {
    const entry: BookForestEntry = {
      id: `gca-${book.id}-${Date.now()}`,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
      genre: currentCategory.name,
      readingStatus: 'want-to-read',
      userRating: Math.round(book.rating),
      currentProgressPages: 0,
      totalPages: book.pages,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Nominated in Goodreads Choice Awards (${currentCategory.name}). "${book.blurb}"`,
      quotesSaved: [],
      tags: ['Goodreads Choice Awards', 'Award Nominee', currentCategory.name],
      ownedFormats: ['Paperback'],
      collectionLocation: 'Wishlist / Not Owned',
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
    setImportedIds((prev) => ({ ...prev, [book.id]: true }));
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-[#25221e] text-[#f5f2e6] rounded-3xl border border-[#d4a373]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 flex items-center space-x-1">
              <Trophy className="w-3 h-3 text-[#d4a373]" />
              <span>GOODREADS CHOICE AWARDS 2026</span>
            </span>
            <span className="text-xs text-[#d4a373] font-handwriting">
              Community Voted Annual Book Awards
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl mt-1 leading-tight">
            Official Goodreads Choice Awards Hub
          </h2>
          <p className="text-xs text-[#f5f2e6]/70 mt-1 max-w-xl">
            Explore annual award-winning titles across genres, cast your community votes, and add nominees directly to your "Want to Read" shelf.
          </p>
        </div>

        {/* Total Votes Counter Card */}
        <div className="px-4 py-3 bg-[#181614] rounded-2xl border border-[#d4a373]/30 text-center shrink-0">
          <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">
            Your Votes Cast
          </span>
          <span className="font-serif font-bold text-2xl text-[#fffef2]">
            {Object.keys(userVotes).length} / {GOODREADS_CHOICE_AWARDS.length}
          </span>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 p-1.5 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-x-auto">
        {GOODREADS_CHOICE_AWARDS.map((cat) => {
          const isActive = cat.id === selectedCategory;
          const userVotedBookId = userVotes[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#2a2724] text-[#d4a373] shadow-md'
                  : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${userVotedBookId ? 'text-amber-400' : ''}`} />
              <span>{cat.name}</span>
              {userVotedBookId && (
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1" title="Voted in this category" />
              )}
            </button>
          );
        })}
      </div>

      {/* Category Header & Description */}
      <div className="p-5 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
        <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">
          {currentCategory.name} Category
        </h3>
        <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mt-0.5">
          {currentCategory.description}
        </p>
      </div>

      {/* Nominees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentCategory.nominees.map((book) => {
          const hasVotedForThis = userVotes[currentCategory.id] === book.id;
          const isImported = importedIds[book.id];
          const isWinner = book.isWinner;

          return (
            <div
              key={book.id}
              className={`p-5 rounded-3xl transition-all flex flex-col justify-between space-y-4 relative ${
                isWinner
                  ? 'bg-[#fbf9ee] dark:bg-[#221f1c] border-2 border-amber-500/60 shadow-lg'
                  : 'bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]'
              }`}
            >
              {/* Winner Laurel Badge */}
              {isWinner && (
                <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center space-x-1">
                  <Trophy className="w-3 h-3 fill-current" />
                  <span>Category Winner</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex space-x-3 pt-1">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-[#ebd9c5] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{book.rating} Rating</span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] leading-snug">
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                      by {book.author}
                    </p>
                    <span className="text-[10px] text-[#d4a373] font-bold block pt-1">
                      {book.votes.toLocaleString()} Votes
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 font-serif line-clamp-3 leading-relaxed">
                  {book.blurb}
                </p>
              </div>

              {/* Voting & Shelf Actions */}
              <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleVote(currentCategory.id, book.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    hasVotedForThis
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{hasVotedForThis ? 'Voted!' : 'Vote'}</span>
                </button>

                <button
                  onClick={() => handleImportNominee(book)}
                  disabled={isImported}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isImported
                      ? 'bg-emerald-800/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#15803d] text-white hover:bg-[#166534]'
                  }`}
                >
                  {isImported ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isImported ? 'On Shelf' : 'Want to Read'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
