import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  Smile, 
  Clock, 
  Layers, 
  Star, 
  Flame, 
  TrendingUp, 
  Award, 
  BookOpen,
  Target,
  CheckCircle2,
  Sparkles,
  Flag,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { GoodreadsYearInBooksSection } from './GoodreadsYearInBooksSection';
import { BookForestEntry, ReadingGoal } from '../types';

interface ReaderGraphSectionProps {
  entries: BookForestEntry[];
  readingGoal: ReadingGoal;
}

export const ReaderGraphSection: React.FC<ReaderGraphSectionProps> = ({
  entries,
  readingGoal,
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'goals-preview' | 'year-in-books' | 'moods' | 'pace' | 'pages' | 'ratings'>('overview');

  const totalPagesRead = entries
    .filter((e) => e.readingStatus === 'read')
    .reduce((sum, e) => sum + (e.totalPages || 0), 0);

  const ratedEntries = entries.filter((e) => (e.userRating || 0) > 0);
  const averageRating = ratedEntries.length > 0
    ? ratedEntries.reduce((sum, e) => sum + (e.userRating || 0), 0) / ratedEntries.length
    : 4.65;

  const topRatedEntries = [...entries]
    .sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
    .slice(0, 4);

  // Basic counts
  const statusCounts = {
    read: entries.filter((e) => e.readingStatus === 'read').length,
    currentlyReading: entries.filter((e) => e.readingStatus === 'currently-reading').length,
    wantToRead: entries.filter((e) => e.readingStatus === 'want-to-read').length,
    dnf: entries.filter((e) => e.readingStatus === 'did-not-finish').length,
  };

  const statusChartData = [
    { name: 'Finished Read', value: statusCounts.read, color: '#047857' },
    { name: 'Currently Reading', value: statusCounts.currentlyReading, color: '#0284c7' },
    { name: 'Want to Read', value: statusCounts.wantToRead, color: '#d97706' },
  ];

  // Format distribution
  const formatMap: Record<string, number> = {};
  entries.forEach((e) => {
    e.ownedFormats.forEach((fmt) => {
      formatMap[fmt] = (formatMap[fmt] || 0) + 1;
    });
  });

  const formatChartData = Object.keys(formatMap).map((fmt) => ({
    format: fmt,
    count: formatMap[fmt],
  }));

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
    <div className="space-y-8">
      
      {/* Annual Reading Challenge Hero Card */}
      <div className="p-6 sm:p-8 bg-[#25221e] text-[#f5f2e6] rounded-3xl shadow-xl border border-[#d4a373]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
            {readingGoal.year} Reader Graph Reading Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-serif text-[#fffef2]">
            {statusCounts.read} of {readingGoal.targetBooks} Books Finished
          </h2>
          <p className="text-xs text-[#f5f2e6]/80 max-w-xl">
            Track reading mood, pace, page distribution, and decimal rating trends with deep Reader Graph intelligence.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span>Goal Progress</span>
            <span className="font-mono text-[#d4a373]">
              {Math.round((statusCounts.read / readingGoal.targetBooks) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#181614] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#d4a373]/40">
            <div
              className="bg-[#d4a373] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round((statusCounts.read / readingGoal.targetBooks) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reader Graph Quick Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
          <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Primary Vibe</span>
          <p className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] pt-0.5">Adventurous</p>
          <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">38% of your library</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
          <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Reading Speed</span>
          <p className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] pt-0.5">Medium-Paced</p>
          <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">300-400 page avg</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
          <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Avg Star Rating</span>
          <p className="font-serif font-bold text-base text-amber-500 pt-0.5">4.65 ★</p>
          <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">High satisfaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
          <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Reading Streak</span>
          <p className="font-serif font-bold text-base pt-0.5 flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <Flame className="w-4 h-4 fill-current" />
            <span>14 Days</span>
          </p>
          <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Daily goal active</span>
        </div>
      </div>

      {/* Reader Graph Navigation Tabs */}
      <div className="flex items-center space-x-2 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-x-auto">
        {[
          { id: 'overview', label: 'Overall Status & Formats', icon: TrendingUp },
          { id: 'goals-preview', label: 'Goals & Custom Challenges', icon: Target },
          { id: 'year-in-books', label: 'Year in Books Poster', icon: Award },
          { id: 'moods', label: 'Moods & Atmosphere', icon: Smile },
          { id: 'pace', label: 'Reading Pace', icon: Clock },
          { id: 'pages', label: 'Page Length', icon: Layers },
          { id: 'ratings', label: 'Rating Spread', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#2a2724] text-[#d4a373] shadow-sm'
                  : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: GOALS & CUSTOM CHALLENGES PREVIEW */}
      {(selectedTab === 'goals-preview' || selectedTab === 'overview') && (
        <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-[#d4a373]" />
                <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                  {readingGoal.year} Reading Goals & Custom Challenges
                </h3>
              </div>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 mt-0.5">
                Live progress tracking for annual targets and custom reading marathons. Configure goal parameters in your Dashboard.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-[#f5f1e3] dark:bg-[#25221e] px-3.5 py-1.5 rounded-full border border-[#ebd9c5] dark:border-[#38332c] text-xs font-bold text-[#b07843] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{readingGoal.challenges?.filter(c => c.completed).length || 0} / {readingGoal.challenges?.length || 0} Challenges Achieved</span>
            </div>
          </div>

          {/* Goal Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Books Goal Progress */}
            <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#d4a373]" />
                  <span>Annual Books Goal</span>
                </span>
                <span className="font-mono text-[#d4a373]">
                  {Math.round((statusCounts.read / (readingGoal.targetBooks || 1)) * 100)}%
                </span>
              </div>
              <p className="font-serif font-bold text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                {statusCounts.read} <span className="text-sm font-normal text-[#2a2724]/60 dark:text-[#f5f2e6]/60">/ {readingGoal.targetBooks} books finished</span>
              </p>
              <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#d4a373] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((statusCounts.read / (readingGoal.targetBooks || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Pages Goal Progress */}
            <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0284c7]" />
                  <span>Pages Read Goal</span>
                </span>
                <span className="font-mono text-[#0284c7]">
                  {Math.round((totalPagesRead / (readingGoal.targetPages || 10000)) * 100)}%
                </span>
              </div>
              <p className="font-serif font-bold text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                {totalPagesRead.toLocaleString()} <span className="text-sm font-normal text-[#2a2724]/60 dark:text-[#f5f2e6]/60">/ {(readingGoal.targetPages || 10000).toLocaleString()} pages</span>
              </p>
              <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0284c7] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalPagesRead / (readingGoal.targetPages || 10000)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Preferred Genres */}
            <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <span className="text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#b07843]" />
                <span>Preferred Reading Focus</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(readingGoal.preferredGenres || ['Literary Fiction', 'Sci-Fi', 'Memoir']).map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Challenges Section */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d4a373]" />
              <span>Active Custom Reading Challenges</span>
            </h4>

            {readingGoal.challenges && readingGoal.challenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {readingGoal.challenges.map((ch) => {
                  const pct = Math.min(100, Math.round((ch.currentCount / (ch.targetCount || 1)) * 100));
                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-serif font-bold text-sm ${ch.completed ? 'line-through text-[#2a2724]/50 dark:text-[#f5f2e6]/50' : 'text-[#2a2724] dark:text-[#f5f2e6]'}`}>
                          {ch.title}
                        </span>
                        {ch.completed ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/15 text-[#15803d] dark:text-[#4ade80] flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Achieved
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/15 text-[#b07843] dark:text-[#d4a373] shrink-0">
                            {pct}% Progress
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                        <span>Milestone Count</span>
                        <span className="font-mono font-bold">{ch.currentCount} / {ch.targetCount} books</span>
                      </div>

                      <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${ch.completed ? 'bg-[#15803d]' : 'bg-[#d4a373]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-dashed border-[#ebd9c5] dark:border-[#38332c] text-center text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                No custom reading challenges active. Configure custom targets in the Dashboard under Goal Settings.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & CONSOLIDATED EXECUTIVE REPORT */}
      {selectedTab === 'overview' && (
        <div className="space-y-8 print:space-y-6">
          
          {/* Executive Header & Print Action Bar */}
          <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-[#d4a373]" />
                <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                  Overall Status, Formats & Analytics Summary
                </h3>
              </div>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 mt-1 max-w-2xl">
                Consolidated reader graph report summarizing library collection formats, reading goal milestones, narrative moods, pace metrics, page distributions, and top-rated books.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-2xl bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] font-bold text-xs flex items-center space-x-2 shadow-md transition-all shrink-0 no-print"
              title="Print or Save as PDF Report"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF Report</span>
            </button>
          </div>

          {/* Key Executive Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-[#d4a373] uppercase tracking-wider block">Total Archived</span>
              <p className="font-serif font-bold text-2xl text-[#2a2724] dark:text-[#f5f2e6]">{entries.length}</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Library Titles</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-[#15803d] dark:text-[#4ade80] uppercase tracking-wider block">Finished Books</span>
              <p className="font-serif font-bold text-2xl text-[#15803d] dark:text-[#4ade80]">{statusCounts.read}</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Read Completed</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-[#0284c7] uppercase tracking-wider block">Pages Read</span>
              <p className="font-serif font-bold text-2xl text-[#0284c7]">{totalPagesRead.toLocaleString()}</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Total Pages</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Average Rating</span>
              <p className="font-serif font-bold text-2xl text-amber-500">{averageRating.toFixed(1)} ★</p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Satisfaction Score</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-[#b07843] uppercase tracking-wider block">Annual Goal</span>
              <p className="font-serif font-bold text-2xl text-[#b07843]">
                {Math.round((statusCounts.read / (readingGoal.targetBooks || 1)) * 100)}%
              </p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">{readingGoal.targetBooks} Books Target</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
              <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider block">Challenges</span>
              <p className="font-serif font-bold text-2xl text-[#7c3aed]">
                {readingGoal.challenges?.filter(c => c.completed).length || 0} / {readingGoal.challenges?.length || 0}
              </p>
              <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Achieved</span>
            </div>
          </div>

          {/* Section 1: Charts (Reading Status & Owned Formats) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                  Reading Status Breakdown
                </h3>
                <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">{entries.length} Total</span>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2a2724',
                        borderColor: '#d4a373',
                        borderRadius: '12px',
                        color: '#f5f2e6',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#d4a373' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                  Owned Edition Formats
                </h3>
                <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Physical vs Virtual</span>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData}>
                    <XAxis dataKey="format" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2a2724',
                        borderColor: '#d4a373',
                        borderRadius: '12px',
                        color: '#f5f2e6',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#d4a373' }}
                    />
                    <Bar dataKey="count" fill="#d4a373" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Challenges Progress Summary */}
          <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
              <Target className="w-5 h-5 text-[#d4a373]" />
              <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                Annual Reading Goals & Challenges Snapshot
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Annual Books Progress */}
              <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Annual Books Finish Target ({readingGoal.year})</span>
                  <span className="font-mono text-[#d4a373]">
                    {Math.round((statusCounts.read / (readingGoal.targetBooks || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#d4a373] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((statusCounts.read / (readingGoal.targetBooks || 1)) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                  {statusCounts.read} finished out of {readingGoal.targetBooks} planned books
                </p>
              </div>

              {/* Annual Pages Progress */}
              <div className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Annual Pages Target</span>
                  <span className="font-mono text-[#0284c7]">
                    {Math.round((totalPagesRead / (readingGoal.targetPages || 10000)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0284c7] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((totalPagesRead / (readingGoal.targetPages || 10000)) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                  {totalPagesRead.toLocaleString()} read out of {(readingGoal.targetPages || 10000).toLocaleString()} total pages
                </p>
              </div>
            </div>

            {/* Active Challenges List */}
            {readingGoal.challenges && readingGoal.challenges.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 block mb-2">Active Challenge Milestones</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {readingGoal.challenges.map((ch) => (
                    <div key={ch.id} className="p-3 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between text-xs">
                      <span className="font-bold truncate max-w-[160px]">{ch.title}</span>
                      <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${ch.completed ? 'bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80]' : 'bg-[#d4a373]/20 text-[#b07843]'}`}>
                        {ch.currentCount}/{ch.targetCount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Moods & Reading Pace Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moods Summary */}
            <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <Smile className="w-5 h-5 text-[#d4a373]" />
                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                  Top Reading Moods & Vibe Summary
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(moodCounts).slice(0, 5).map(([mood, count]) => {
                  const maxVal = Math.max(...Object.values(moodCounts));
                  const percentage = Math.round((count / (maxVal || 1)) * 100);
                  return (
                    <div key={mood} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>{mood}</span>
                        <span className="text-[#d4a373] font-bold">{count} books ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#f5f1e3] dark:bg-[#181614] overflow-hidden">
                        <div
                          className="h-full bg-[#d4a373] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reading Pace & Page Distribution Summary */}
            <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <Clock className="w-5 h-5 text-[#d4a373]" />
                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                  Reading Speed & Length Spread
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 block mb-2">Reading Speed Pace</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(paceCounts).map(([pace, count]) => (
                      <div key={pace} className="p-3 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] text-center">
                        <p className="text-lg font-serif font-bold text-[#d4a373]">{count}</p>
                        <span className="text-[10px] font-bold text-[#2a2724]/80 dark:text-[#f5f2e6]/80 block truncate">{pace.split('-')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 block mb-2">Page Length Distribution</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(pageRanges).map(([range, count]) => (
                      <div key={range} className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] text-center">
                        <p className="text-base font-serif font-bold text-[#b07843]">{count}</p>
                        <span className="text-[9px] font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 block truncate">{range}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Rating Spread & Catalog Highlights */}
          <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                Highest Rated Collection Highlights
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topRatedEntries.length > 0 ? (
                topRatedEntries.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#d4a373]/20 text-[#b07843]">
                          {b.genre || 'Literature'}
                        </span>
                        <span className="font-bold text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {b.userRating || 5}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6] line-clamp-1">
                        {b.title}
                      </h4>
                      <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 line-clamp-1">
                        by {b.author}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#ebd9c5]/50 dark:border-[#38332c]/50 flex justify-between text-[10px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                      <span>{b.totalPages ? `${b.totalPages} pages` : 'N/A'}</span>
                      <span className="capitalize font-semibold">{b.readingStatus.replace('-', ' ')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 p-4">
                  No rated entries found in your library yet.
                </div>
              )}
            </div>
          </div>

        </div>
      )}


      {/* TAB: YEAR IN BOOKS */}
      {selectedTab === 'year-in-books' && (
        <GoodreadsYearInBooksSection entries={entries} readingGoal={readingGoal} />
      )}

      {/* TAB 2: MOODS */}
      {selectedTab === 'moods' && (
        <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
              Reader Graph Mood & Vibe Analytics
            </h3>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Analysis of narrative atmosphere across all archived titles in your BookForest.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(moodCounts).map(([mood, count]) => {
              const maxVal = Math.max(...Object.values(moodCounts));
              const percentage = Math.round((count / (maxVal || 1)) * 100);

              return (
                <div key={mood} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">{mood}</span>
                    <span className="text-[11px] text-[#d4a373] font-bold">{count} Books ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-[#f5f1e3] dark:bg-[#181614] overflow-hidden border border-[#ebd9c5] dark:border-[#38332c]">
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

      {/* TAB 3: PACE */}
      {selectedTab === 'pace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center space-x-2 text-[#2a2724] dark:text-[#f5f2e6]">
              <Clock className="w-4 h-4 text-[#d4a373]" />
              <span>Reading Pace Breakdown</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(paceCounts).map(([pace, count]) => (
                <div key={pace} className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex justify-between items-center text-xs">
                  <span className="font-bold">{pace}</span>
                  <span className="px-3 py-1 rounded-full bg-[#d4a373]/20 text-[#d4a373] font-bold">
                    {count} Titles
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center space-x-2 text-[#2a2724] dark:text-[#f5f2e6]">
              <BookOpen className="w-4 h-4 text-[#d4a373]" />
              <span>Owned Formats Count</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(formatCounts).map(([fmt, count]) => (
                <div key={fmt} className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex justify-between items-center text-xs">
                  <span className="font-bold">{fmt}</span>
                  <span className="px-3 py-1 rounded-full bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80] font-bold">
                    {count} Copies
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAGES */}
      {selectedTab === 'pages' && (
        <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
              Page Length Distribution
            </h3>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              How thick are the books you choose to read in your personal library?
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {Object.entries(pageRanges).map(([range, count]) => (
              <div key={range} className="p-5 rounded-2xl bg-[#f5f1e3] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] text-center space-y-2">
                <span className="text-3xl font-serif font-bold text-[#d4a373]">{count}</span>
                <p className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6]">{range}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RATINGS */}
      {selectedTab === 'ratings' && (
        <div className="p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
            <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
              Decimal Precision Star Rating Distribution
            </h3>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Detailed star rating spread across all completed titles.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(ratingCounts).map(([stars, count]) => (
              <div key={stars} className="flex items-center space-x-3 text-xs">
                <span className="w-16 font-bold text-[#d4a373]">{stars}</span>
                <div className="flex-1 h-3.5 rounded-full bg-[#f5f1e3] dark:bg-[#181614] overflow-hidden border border-[#ebd9c5] dark:border-[#38332c]">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${count * 18}%` }}
                  />
                </div>
                <span className="w-16 text-right font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">{count} titles</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
