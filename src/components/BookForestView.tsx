import React, { useState } from 'react';
import {
  Library as LibraryIcon,
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
  Users,
  Globe,
  Trophy,
  Quote,
  PieChart as PieIcon
} from 'lucide-react';
import { LibrarySection } from './LibrarySection';
import { ClubsSection } from './ClubsSection';
import { ReaderGraphSection } from './ReaderGraphSection';
import { GoodreadsChoiceAwardsSection } from './GoodreadsChoiceAwardsSection';
import { GoodreadsQuotesSection } from './GoodreadsQuotesSection';
import { BookForestEntry, ReadingStatus, CollectionLocation, BookFormat, ReadingGoal } from '../types';

interface BookForestViewProps {
  entries: BookForestEntry[];
  readingGoal: ReadingGoal;
  onOpenAddModal: () => void;
  onEditEntry: (entry: BookForestEntry) => void;
  onDeleteEntry: (id: string) => void;
  onOpenAICompanion: () => void;
  onSaveEntry?: (entry: BookForestEntry) => void;
  onOpenGutenbergModal?: () => void;
  onOpenFableLounge?: () => void;
  onOpenOpenLibraryModal?: () => void;
  onOpenStoryGraphModal?: () => void;
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
  onSaveEntry,
  onOpenGutenbergModal,
  onOpenFableLounge,
  onOpenOpenLibraryModal,
  onOpenStoryGraphModal,
  searchQuery,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const [subTab, setSubTab] = useState<'shelf' | 'choice-awards' | 'quotes' | 'library' | 'clubs' | 'collection' | 'analytics'>('shelf');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<CollectionLocation | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleImportEntry = (entry: BookForestEntry) => {
    if (onSaveEntry) {
      onSaveEntry(entry);
    }
  };

  const handleQuickStatusChange = (book: BookForestEntry, newStatus: ReadingStatus) => {
    const updated = { ...book, readingStatus: newStatus };
    if (onSaveEntry) {
      onSaveEntry(updated);
    }
  };

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
    <div className="space-y-6 pb-16">
      
      {/* Sub-Navigation Tabs & Quick Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#2e2a25] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c]">
          <button
            onClick={() => setSubTab('shelf')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'shelf'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#15803d] dark:text-[#4ade80] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookshelf</span>
          </button>

          <button
            onClick={() => setSubTab('choice-awards')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'choice-awards'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Awards</span>
          </button>

          <button
            onClick={() => setSubTab('quotes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'quotes'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quotes</span>
          </button>

          <button
            onClick={() => setSubTab('library')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'library'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#0284c7] dark:text-[#38bdf8] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <LibraryIcon className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setSubTab('clubs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'clubs'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clubs</span>
          </button>

          <button
            onClick={() => setSubTab('collection')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'collection'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#8c5627] dark:text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Collections</span>
          </button>

          <button
            onClick={() => setSubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'analytics'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#7c3aed] dark:text-[#a78bfa] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Stats</span>
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
                          <select
                            value={book.readingStatus}
                            onChange={(e) => handleQuickStatusChange(book, e.target.value as ReadingStatus)}
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase font-handwriting outline-none cursor-pointer border border-transparent hover:border-current transition-all ${
                              book.readingStatus === 'read'
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : book.readingStatus === 'currently-reading'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                          >
                            <option value="want-to-read">Want to Read</option>
                            <option value="currently-reading">Currently Reading</option>
                            <option value="read">Read</option>
                            <option value="did-not-finish">Did Not Finish</option>
                          </select>

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

      {/* SUB-TAB: GOODREADS CHOICE AWARDS */}
      {subTab === 'choice-awards' && (
        <GoodreadsChoiceAwardsSection onImportToBookForest={handleImportEntry} />
      )}

      {/* SUB-TAB: GOODREADS QUOTES & CARD STUDIO */}
      {subTab === 'quotes' && (
        <GoodreadsQuotesSection onImportToBookForest={handleImportEntry} />
      )}

      {/* SUB-TAB 2: UNIFIED DIGITAL LIBRARY */}
      {subTab === 'library' && (
        <LibrarySection onImportToBookForest={handleImportEntry} />
      )}

      {/* SUB-TAB 3: FABLE READING CLUBS & LOUNGE */}
      {subTab === 'clubs' && (
        <ClubsSection onImportToBookForest={handleImportEntry} />
      )}

      {/* SUB-TAB 5: READER GRAPH ANALYTICS & STATS */}
      {subTab === 'analytics' && (
        <ReaderGraphSection entries={entries} readingGoal={readingGoal} />
      )}

    </div>
  );
};
