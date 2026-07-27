import React, { useState } from 'react';
import {
  Library,
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Edit3,
  Trash2,
  Bookmark,
  Award,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  List,
  Check,
  Building,
  Download,
  FileText
} from 'lucide-react';
import { exportBookForestJSON, exportBookForestCSV } from '../utils/exportUtils';
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
  Legend,
} from 'recharts';
import { BookForestEntry, ReadingStatus, CollectionLocation, BookFormat, ReadingGoal } from '../types';

interface BookForestViewProps {
  entries: BookForestEntry[];
  readingGoal: ReadingGoal;
  onOpenAddModal: () => void;
  onEditEntry: (entry: BookForestEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenAICompanion: () => void;
  searchQuery: string;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
}

export const BookForestView: React.FC<BookForestViewProps> = ({
  entries,
  readingGoal,
  onOpenAddModal,
  onEditEntry,
  onDeleteEntry,
  onOpenAICompanion,
  searchQuery,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const [subTab, setSubTab] = useState<'shelf' | 'collection' | 'analytics'>('shelf');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<CollectionLocation | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter logic
  const filteredEntries = entries.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.readingStatus === statusFilter;
    const matchesLocation = locationFilter === 'all' || item.collectionLocation === locationFilter;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reviewComments.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesLocation && matchesSearch;
  });

  // Analytics data calculation
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

  // Genre distribution
  const genreMap: Record<string, number> = {};
  entries.forEach((e) => {
    genreMap[e.genre] = (genreMap[e.genre] || 0) + 1;
  });

  const genreChartData = Object.keys(genreMap).map((g) => ({
    genre: g,
    count: genreMap[g],
  }));

  const COLORS = ['#047857', '#d97706', '#2563eb', '#7c3aed', '#db2777', '#059669'];

  return (
    <div className="space-y-8 pb-16">
      
      {/* BookForest Top Header Banner */}
      <div className="rounded-3xl bg-[#2a2724] dark:bg-[#1f1d1a] text-[#f5f2e6] p-6 sm:p-10 shadow-xl border border-[#d4a373]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
              Personal Goodreads & Collection Catalog
            </span>
            <span className="text-xs text-[#d4a373] font-semibold font-handwriting">
              {entries.length} Total Books Archived
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#fffef2] tracking-tight">
            BookForest Personal Library
          </h1>
          <p className="text-xs sm:text-sm text-[#f5f2e6]/80 max-w-xl font-sans">
            Track books you want to read, rate completed titles with personal comments, and organize physical vs. virtual edition collections.
          </p>
        </div>

        {/* AI Quick Trigger & Export Backup */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAICompanion}
            className="px-4 py-2.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/50 font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#d4a373]" />
            <span>AI Review Helper</span>
          </button>

          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#181614]/60 border border-[#d4a373]/30">
            <button
              onClick={() => exportBookForestJSON(entries)}
              className="px-3 py-1.5 rounded-lg bg-[#d4a373]/20 hover:bg-[#d4a373] text-[#d4a373] hover:text-[#181614] text-[11px] font-bold flex items-center space-x-1 transition-all"
              title="Download full library as JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
            <button
              onClick={() => exportBookForestCSV(entries)}
              className="px-3 py-1.5 rounded-lg bg-[#d4a373]/20 hover:bg-[#d4a373] text-[#d4a373] hover:text-[#181614] text-[11px] font-bold flex items-center space-x-1 transition-all"
              title="Export full library as CSV spreadsheet"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#2e2a25] pb-3">
        <div className="flex items-center space-x-2 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
          <button
            onClick={() => setSubTab('shelf')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              subTab === 'shelf'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#15803d] dark:text-[#4ade80] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookshelf Tracker</span>
          </button>

          <button
            onClick={() => setSubTab('collection')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              subTab === 'collection'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#8c5627] dark:text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Physical & Virtual Editions</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
              subTab === 'analytics'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Reading Goal & Stats</span>
          </button>
        </div>

        {/* View Mode & Quick Count */}
        <div className="flex items-center space-x-2">
          {subTab === 'shelf' && (
            <div className="flex items-center space-x-1 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[#fffef2] dark:bg-[#181614] shadow-xs' : 'opacity-60'}`}
              >
                <LayoutGrid className="w-4 h-4 text-[#2a2724] dark:text-[#f5f2e6]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#fffef2] dark:bg-[#181614] shadow-xs' : 'opacity-60'}`}
              >
                <List className="w-4 h-4 text-[#2a2724] dark:text-[#f5f2e6]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: BOOKSHELF TRACKER */}
      {subTab === 'shelf' && (
        <div className="space-y-6">
          
          {/* Filter Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f1e3] dark:bg-[#221f1c] p-3 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mr-1 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-[#d4a373]" />
                Status:
              </span>
              {[
                { id: 'all', label: `All (${entries.length})` },
                { id: 'currently-reading', label: `Currently Reading (${statusCounts.currentlyReading})` },
                { id: 'want-to-read', label: `Want to Read (${statusCounts.wantToRead})` },
                { id: 'read', label: `Read (${statusCounts.read})` },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    statusFilter === st.id
                      ? 'bg-[#15803d] text-[#fffef2] shadow-xs'
                      : 'bg-[#fffef2] dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5]/50 dark:hover:bg-[#38332c]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-semibold text-[11px] font-handwriting text-sm">
              Showing {filteredEntries.length} items
            </div>
          </div>

          {/* Cards Display */}
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-dashed border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-[#d4a373]" />
              <p className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                No books found matching criteria
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#d4a373] text-[#fffef2] rounded-xl text-xs font-bold"
              >
                Add First Book to BookForest
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map((book) => (
                <div
                  key={book.id}
                  className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Cover + Basic Info */}
                    <div className="flex gap-4">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-24 h-36 object-cover rounded-xl shadow-md shrink-0 border border-[#ebd9c5]"
                      />
                      <div className="space-y-1.5 text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase font-handwriting ${
                            book.readingStatus === 'read'
                              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : book.readingStatus === 'currently-reading'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                          }`}>
                            {book.readingStatus.replace('-', ' ')}
                          </span>

                          {isLoggedIn && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => onEditEntry(book)}
                                className="p-1 text-[#2a2724]/40 hover:text-[#2a2724] dark:text-[#f5f2e6]/40 dark:hover:text-[#f5f2e6]"
                                title="Edit record"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteEntry(book.id)}
                                className="p-1 text-[#2a2724]/40 hover:text-red-600 dark:text-[#f5f2e6]/40 dark:hover:text-red-400"
                                title="Delete record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <h3 className="font-normal font-serif text-xl text-[#2a2724] dark:text-[#f5f2e6] leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 font-semibold">
                          by {book.author}
                        </p>
                        <p className="text-xs text-[#d4a373] font-handwriting">{book.genre}</p>

                        {/* Star Rating */}
                        {book.readingStatus === 'read' && (
                          <div className="flex items-center space-x-1 pt-1">
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Star
                                key={st}
                                className={`w-3.5 h-3.5 ${
                                  st <= book.userRating
                                    ? 'text-[#d4a373] fill-[#d4a373]'
                                    : 'text-[#ebd9c5] dark:text-[#38332c]'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Currently Reading */}
                    {book.readingStatus === 'currently-reading' && book.currentProgressPages && (
                      <div className="mt-3 p-2.5 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl space-y-1 border border-[#ebd9c5]/60 dark:border-[#38332c]">
                        <div className="flex justify-between text-[11px] font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                          <span>Reading Progress</span>
                          <span className="text-[#d4a373] font-mono">
                            {book.currentProgressPages} / {book.totalPages || 350} pgs (
                            {Math.round(((book.currentProgressPages || 0) / (book.totalPages || 1)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#d4a373] h-full"
                            style={{
                              width: `${Math.round(
                                ((book.currentProgressPages || 0) / (book.totalPages || 1)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Personal Review & Comments */}
                    {book.reviewComments && (
                      <div className="mt-3 p-3 bg-[#f5f1e3]/80 dark:bg-[#282420] rounded-xl text-xs space-y-1 border border-[#ebd9c5]/40 dark:border-[#38332c]">
                        <p className="font-bold text-[#b07843] dark:text-[#d4a373] text-sm font-handwriting">
                          Personal Notes & Comment:
                        </p>
                        <p className="text-[#2a2724]/90 dark:text-[#f5f2e6]/90 italic leading-relaxed font-sans">
                          “{book.reviewComments}”
                        </p>
                      </div>
                    )}

                    {/* Quotes Saved */}
                    {book.quotesSaved && book.quotesSaved.length > 0 && (
                      <div className="mt-2 text-xs font-serif italic text-[#2a2724] dark:text-[#f5f2e6] bg-[#f5f1e3] dark:bg-[#2b2723] p-2.5 rounded-lg border-l-2 border-[#d4a373]">
                        “{book.quotesSaved[0]}”
                      </div>
                    )}
                  </div>

                  {/* Formats & Location Badges */}
                  <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex flex-wrap items-center justify-between text-xs gap-1">
                    <div className="flex flex-wrap gap-1">
                      {book.ownedFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f1e3] dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5]"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>

                    <span className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                      📍 {book.collectionLocation}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Book & Author</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Formats Owned</th>
                    <th className="p-3">Shelf Location</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebd9c5] dark:divide-[#38332c]">
                  {filteredEntries.map((b) => (
                    <tr key={b.id} className="hover:bg-[#f5f1e3]/60 dark:hover:bg-[#282420]">
                      <td className="p-3 font-semibold flex items-center space-x-3">
                        <img src={b.coverUrl} className="w-8 h-12 object-cover rounded shadow-xs border border-[#ebd9c5]" />
                        <div>
                          <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6] font-serif text-sm">{b.title}</div>
                          <div className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 text-[11px]">{b.author}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373] font-handwriting">
                          {b.readingStatus}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-[#d4a373]">
                        {b.userRating ? `${b.userRating} / 5 ★` : '—'}
                      </td>
                      <td className="p-3 text-[11px]">
                        {b.ownedFormats.join(', ')}
                      </td>
                      <td className="p-3 text-xs text-[#b07843] dark:text-[#d4a373] font-handwriting">
                        {b.collectionLocation}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {isLoggedIn ? (
                          <>
                            <button onClick={() => onEditEntry(b)} className="text-[#2a2724]/70 hover:text-[#2a2724] dark:text-[#f5f2e6]/70">
                              Edit
                            </button>
                            <button onClick={() => onDeleteEntry(b.id)} className="text-red-500 hover:text-red-700">
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-[#2a2724]/40 dark:text-[#f5f2e6]/40 italic">Read-only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: PHYSICAL & VIRTUAL LIBRARY EDITIONS */}
      {subTab === 'collection' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-normal font-serif text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                Physical & Virtual Library Catalog
              </h3>
              <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mt-0.5">
                Track exact physical editions (Collector’s Hardcovers, Signed Prints, Sprayed Edges) and digital libraries (Kindle, Audible).
              </p>
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] font-bold"
            >
              <option value="all">All Collection Locations</option>
              <option value="Physical Main Bookshelf">Physical Main Bookshelf</option>
              <option value="Physical Special Shelf">Physical Special Shelf</option>
              <option value="Kindle Library">Kindle Library</option>
              <option value="Audible">Audible</option>
              <option value="Wishlist / Not Owned">Wishlist / Not Owned</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((book) => (
              <div
                key={book.id}
                className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex gap-3">
                  <img src={book.coverUrl} className="w-16 h-24 object-cover rounded-lg shadow-sm border border-[#ebd9c5]" />
                  <div className="space-y-1">
                    <h4 className="font-normal font-serif text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                      {book.title}
                    </h4>
                    <p className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-medium">by {book.author}</p>
                    <p className="text-sm font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting">
                      📍 {book.collectionLocation}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#ebd9c5] dark:border-[#38332c]">
                  <span className="font-bold text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50 uppercase tracking-wider block">
                    Formats Owned:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {book.ownedFormats.length > 0 ? (
                      book.ownedFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="px-2 py-0.5 rounded text-xs font-bold bg-[#d4a373]/20 text-[#2a2724] dark:text-[#f5f2e6] border border-[#d4a373]/40 font-handwriting"
                        >
                          {fmt}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#2a2724]/50 italic">Not in physical/digital collection</span>
                    )}
                  </div>
                </div>

                {book.editionDetails && (
                  <div className="p-2.5 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl text-xs border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm block">Edition Details: </span>
                    <span className="text-[#2a2724]/80 dark:text-[#f5f2e6]/80">{book.editionDetails}</span>
                  </div>
                )}

                {book.purchasePrice && (
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-semibold flex justify-between">
                    <span>Purchase Value:</span>
                    <span className="font-mono font-bold text-[#2a2724] dark:text-[#f5f2e6]">${book.purchasePrice.toFixed(2)}</span>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: READING GOAL & STATS */}
      {subTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Annual Challenge Card */}
          <div className="p-6 bg-[#2a2724] dark:bg-[#1f1d1a] text-[#f5f2e6] rounded-3xl shadow-lg border border-[#d4a373]/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#d4a373] font-handwriting">
                {readingGoal.year} Annual Reading Challenge
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal font-serif text-[#fffef2]">
                {statusCounts.read} of {readingGoal.targetBooks} Books Finished
              </h2>
              <p className="text-xs text-[#f5f2e6]/80">
                You are on track to achieve your {readingGoal.year} personal reading challenge!
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Completion Rate</span>
                <span className="font-mono text-[#d4a373]">
                  {Math.round((statusCounts.read / readingGoal.targetBooks) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#181614] h-3 rounded-full overflow-hidden p-0.5 border border-[#d4a373]/40">
                <div
                  className="bg-[#d4a373] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((statusCounts.read / readingGoal.targetBooks) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recharts Data Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Breakdown Pie Chart */}
            <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
              <h3 className="font-normal font-serif text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                Reading Status Breakdown
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Formats Owned Distribution Bar Chart */}
            <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
              <h3 className="font-normal font-serif text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                Owned Collection Formats
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatChartData}>
                    <XAxis dataKey="format" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d4a373" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
