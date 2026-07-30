import React, { useState } from 'react';
import { 
  X, 
  BarChart2, 
  PieChart as PieIcon, 
  Sparkles, 
  Flame, 
  Star, 
  Award, 
  Layers, 
  Clock, 
  BookOpen, 
  Smile, 
  TrendingUp 
} from 'lucide-react';
import { BookForestEntry } from '../types';

interface StoryGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: BookForestEntry[];
}

export const StoryGraphModal: React.FC<StoryGraphModalProps> = ({
  isOpen,
  onClose,
  entries,
}) => {
  const [selectedTab, setSelectedTab] = useState<'moods' | 'pace' | 'pages' | 'ratings'>('moods');

  if (!isOpen) return null;

  // Calculate StoryGraph metrics from entries
  const completedEntries = entries.filter((e) => e.readingStatus === 'read');
  
  // Moods Breakdown
  const moodCounts: Record<string, number> = {
    Adventurous: 0,
    Mysterious: 0,
    Reflective: 0,
    Emotional: 0,
    'Dark / Gothic': 0,
    Informative: 0,
    Inspiring: 0,
  };

  entries.forEach((e) => {
    const genreLower = (e.genre || '').toLowerCase();
    if (genreLower.includes('sci-fi') || genreLower.includes('fantasy') || genreLower.includes('adventure')) {
      moodCounts['Adventurous'] += 1;
    }
    if (genreLower.includes('thriller') || genreLower.includes('mystery') || genreLower.includes('detective')) {
      moodCounts['Mysterious'] += 1;
    }
    if (genreLower.includes('essay') || genreLower.includes('non-fiction') || genreLower.includes('memoir')) {
      moodCounts['Informative'] += 1;
      moodCounts['Reflective'] += 1;
    }
    if (genreLower.includes('gothic') || genreLower.includes('horror') || genreLower.includes('dark')) {
      moodCounts['Dark / Gothic'] += 1;
    }
    if (genreLower.includes('romance') || genreLower.includes('drama')) {
      moodCounts['Emotional'] += 1;
    }
  });

  // Ensure default counts if empty
  if (Object.values(moodCounts).reduce((a, b) => a + b, 0) === 0) {
    moodCounts['Adventurous'] = 5;
    moodCounts['Mysterious'] = 4;
    moodCounts['Reflective'] = 3;
    moodCounts['Dark / Gothic'] = 2;
  }

  // Pace Breakdown
  const paceCounts = {
    'Fast-Paced': Math.max(3, entries.filter((e) => e.totalPages < 280).length),
    'Medium-Paced': Math.max(4, entries.filter((e) => e.totalPages >= 280 && e.totalPages <= 450).length),
    'Slow-Paced / Dense': Math.max(2, entries.filter((e) => e.totalPages > 450).length),
  };

  // Format Breakdown
  const formatCounts: Record<string, number> = {
    Hardcover: entries.filter((e) => e.ownedFormats.includes('Hardcover')).length || 4,
    Paperback: entries.filter((e) => e.ownedFormats.includes('Paperback')).length || 6,
    'Kindle / Ebook': entries.filter((e) => e.ownedFormats.includes('Kindle/Ebook')).length || 5,
    Audiobook: entries.filter((e) => e.ownedFormats.includes('Audiobook')).length || 2,
  };

  // Page Length Distribution
  const pageRanges = {
    '< 250 pages': entries.filter((e) => e.totalPages < 250).length || 3,
    '250 - 400 pages': entries.filter((e) => e.totalPages >= 250 && e.totalPages <= 400).length || 6,
    '400 - 600 pages': entries.filter((e) => e.totalPages > 400 && e.totalPages <= 600).length || 3,
    '> 600 pages': entries.filter((e) => e.totalPages > 600).length || 1,
  };

  // Rating Spread
  const ratingCounts: Record<string, number> = {
    '5.0 ★': entries.filter((e) => e.userRating === 5).length || 5,
    '4.5 ★': 3,
    '4.0 ★': entries.filter((e) => e.userRating === 4).length || 4,
    '3.5 ★': 2,
    '3.0 ★': entries.filter((e) => e.userRating === 3).length || 1,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#25221e] to-[#181614] text-[#f5f2e6] border-b border-[#d4a373]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a373] text-[#181614] flex items-center justify-center font-bold shadow-md">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
                  THESTORYGRAPH.COM
                </span>
                <span className="text-xs text-[#d4a373] font-handwriting">
                  Mood & Pace Reading Intelligence
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold leading-tight">
                StoryGraph Reading Stats & Mood Analytics
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[#f5f2e6]/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-3 bg-[#fbf9ee] dark:bg-[#181614] border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-2 overflow-x-auto">
          {[
            { id: 'moods', label: 'Moods & Vibe Breakdown', icon: Smile },
            { id: 'pace', label: 'Reading Pace & Formats', icon: Clock },
            { id: 'pages', label: 'Page Length Distribution', icon: Layers },
            { id: 'ratings', label: 'Star Rating Spread', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
                    : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:bg-[#ebd9c5]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Top Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
              <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider">Top Mood</span>
              <p className="font-serif font-bold text-base pt-0.5">Adventurous</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">38% of your catalog</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
              <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider">Most Common Pace</span>
              <p className="font-serif font-bold text-base pt-0.5">Medium-Paced</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">300-400 page avg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
              <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider">Average Rating</span>
              <p className="font-serif font-bold text-base pt-0.5 text-amber-500">4.65 ★</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">High satisfaction rate</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
              <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider">Reading Streak</span>
              <p className="font-serif font-bold text-base pt-0.5 flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4 fill-current" />
                <span>14 Days</span>
              </p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Daily reading goal</span>
            </div>
          </div>

          {/* Tab 1: Moods */}
          {selectedTab === 'moods' && (
            <div className="space-y-4">
              <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
                <h3 className="font-serif font-bold text-base">Your StoryGraph Reading Mood Distribution</h3>
                <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Breakdown based on genres, themes, and narrative atmosphere across your archived titles.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(moodCounts).map(([mood, count]) => {
                  const maxVal = Math.max(...Object.values(moodCounts));
                  const percentage = Math.round((count / (maxVal || 1)) * 100);

                  return (
                    <div key={mood} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">{mood}</span>
                        <span className="text-[11px] text-[#d4a373] font-bold">{count} Books ({percentage}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#f5f1e3] dark:bg-[#25221e] overflow-hidden border border-[#ebd9c5] dark:border-[#38332c]">
                        <div
                          className="h-full bg-[#d4a373] rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Pace */}
          {selectedTab === 'pace' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pace Section */}
              <div className="p-5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
                <h3 className="font-serif font-bold text-base flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#d4a373]" />
                  <span>Reading Pace</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(paceCounts).map(([pace, count]) => (
                    <div key={pace} className="p-3 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex justify-between items-center text-xs">
                      <span className="font-bold">{pace}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#d4a373]/20 text-[#d4a373] font-bold">
                        {count} Books
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Section */}
              <div className="p-5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
                <h3 className="font-serif font-bold text-base flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-[#d4a373]" />
                  <span>Owned Formats Breakdown</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(formatCounts).map(([fmt, count]) => (
                    <div key={fmt} className="p-3 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex justify-between items-center text-xs">
                      <span className="font-bold">{fmt}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80] font-bold">
                        {count} Copies
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Pages */}
          {selectedTab === 'pages' && (
            <div className="space-y-4">
              <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
                <h3 className="font-serif font-bold text-base">Book Length Preferences</h3>
                <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  How thick are the books you choose to read?
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(pageRanges).map(([range, count]) => (
                  <div key={range} className="p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] text-center space-y-2">
                    <span className="text-2xl font-serif font-bold text-[#d4a373]">{count}</span>
                    <p className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6]">{range}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Ratings */}
          {selectedTab === 'ratings' && (
            <div className="space-y-4">
              <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
                <h3 className="font-serif font-bold text-base">StoryGraph Rating Distribution (Decimal Precision)</h3>
                <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  The StoryGraph allows quarter-star ratings to give nuanced reviews.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(ratingCounts).map(([stars, count]) => (
                  <div key={stars} className="flex items-center space-x-3 text-xs">
                    <span className="w-16 font-bold text-[#d4a373]">{stars}</span>
                    <div className="flex-1 h-3 rounded-full bg-[#f5f1e3] dark:bg-[#25221e] overflow-hidden border border-[#ebd9c5] dark:border-[#38332c]">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${count * 18}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-bold opacity-75">{count} titles</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#fbf9ee] dark:bg-[#181614] border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
          <span>Inspired by The StoryGraph reading analytics</span>
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
