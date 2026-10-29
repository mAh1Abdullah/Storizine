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
  PieChart as PieIcon,
  ShieldCheck,
  Target,
  ArrowRight,
  Smile,
  Compass,
  HeartHandshake,
  Calendar,
  AlertTriangle,
  X,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { LibrarySection } from './LibrarySection';
import { ClubsSection } from './ClubsSection';
import { ReaderGraphSection } from './ReaderGraphSection';
import { GoodreadsChoiceAwardsSection } from './GoodreadsChoiceAwardsSection';
import { GoodreadsQuotesSection } from './GoodreadsQuotesSection';
import { AestheticJournalModal } from './AestheticJournalModal';
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
  onOpenReader?: (book: BookForestEntry) => void;
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
  onOpenReader,
  searchQuery,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const [subTab, setSubTab] = useState<'shelf' | 'lent-out' | 'choice-awards' | 'quotes' | 'library' | 'clubs' | 'collection' | 'analytics'>('shelf');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all' | 'loaned-out'>('all');
  const [locationFilter, setLocationFilter] = useState<CollectionLocation | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Aesthetic Journal Modal state (Goodnotes Feature)
  const [selectedJournalBook, setSelectedJournalBook] = useState<BookForestEntry | null>(null);

  // Lending & Loan Tracker Modal state (BookBuddy+ Feature)
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [selectedBookForLoan, setSelectedBookForLoan] = useState<BookForestEntry | null>(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanNotes, setLoanNotes] = useState('');
  const [lendingSearch, setLendingSearch] = useState('');

  const handleOpenLendModal = (book?: BookForestEntry) => {
    if (book) {
      setSelectedBookForLoan(book);
    } else {
      const available = entries.find((e) => !e.loan?.isLoanedOut);
      setSelectedBookForLoan(available || null);
    }
    setBorrowerName('');
    setBorrowerContact('');
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setLoanDueDate(d.toISOString().split('T')[0]);
    setLoanNotes('');
    setIsLendModalOpen(true);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForLoan || !borrowerName.trim()) return;

    const updated: BookForestEntry = {
      ...selectedBookForLoan,
      loan: {
        isLoanedOut: true,
        borrowerName: borrowerName.trim(),
        borrowerContact: borrowerContact.trim() || undefined,
        loanDate: new Date().toISOString().split('T')[0],
        dueDate: loanDueDate || undefined,
        notes: loanNotes.trim() || undefined,
      },
    };

    if (onSaveEntry) {
      onSaveEntry(updated);
    }
    setIsLendModalOpen(false);
  };

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

  // Return loaned book handler (BookBuddy+ Feature)
  const handleReturnBook = (book: BookForestEntry) => {
    const updated: BookForestEntry = {
      ...book,
      loan: {
        isLoanedOut: false,
        borrowerName: book.loan?.borrowerName,
        borrowerContact: book.loan?.borrowerContact,
        loanDate: book.loan?.loanDate,
        dueDate: undefined,
        notes: book.loan?.notes,
      },
    };
    if (onSaveEntry) {
      onSaveEntry(updated);
    }
  };

  const handleExtendDueDate = (book: BookForestEntry, daysToAdd: number = 7) => {
    const currentDue = book.loan?.dueDate ? new Date(book.loan.dueDate) : new Date();
    currentDue.setDate(currentDue.getDate() + daysToAdd);
    const updated: BookForestEntry = {
      ...book,
      loan: {
        ...(book.loan || { isLoanedOut: true }),
        dueDate: currentDue.toISOString().split('T')[0],
      },
    };
    if (onSaveEntry) {
      onSaveEntry(updated);
    }
  };

  const getDaysRemainingOrOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter logic (supports loaned-out filter)
  const filteredEntries = entries.filter((item) => {
    const matchesStatus =
      statusFilter === 'loaned-out'
        ? Boolean(item.loan?.isLoanedOut)
        : statusFilter === 'all' || item.readingStatus === statusFilter;
        
    const matchesLocation = locationFilter === 'all' || item.collectionLocation === locationFilter;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reviewComments.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.loan?.borrowerName && item.loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesLocation && matchesSearch;
  });

  // Basic counts
  const statusCounts = {
    read: entries.filter((e) => e.readingStatus === 'read').length,
    currentlyReading: entries.filter((e) => e.readingStatus === 'currently-reading').length,
    wantToRead: entries.filter((e) => e.readingStatus === 'want-to-read').length,
    dnf: entries.filter((e) => e.readingStatus === 'did-not-finish').length,
    loanedOut: entries.filter((e) => e.loan?.isLoanedOut).length,
  };

  // 3. Ahead / Behind Schedule Metric (Goodreads Feature)
  // Expected = Annual Goal * (Current Day of Year / 365)
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diffTime = (now.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const dayOfYear = Math.max(1, Math.min(365, Math.floor(diffTime / (1000 * 60 * 60 * 24))));
  const annualGoal = readingGoal.targetBooks || 25;
  const expectedBooks = annualGoal * (dayOfYear / 365);
  const actualCompleted = Math.max(statusCounts.read, readingGoal.completedBooks || 0);
  const scheduleDiff = Math.round(actualCompleted - expectedBooks);

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
            onClick={() => setSubTab('lent-out')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'lent-out'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-amber-700 dark:text-amber-400 shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Lending Tracker</span>
            {statusCounts.loanedOut > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-mono font-bold">
                {statusCounts.loanedOut}
              </span>
            )}
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
            <Building className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => setSubTab('clubs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              subTab === 'clubs'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#d97706] dark:text-[#fbbf24] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
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

        {/* View Mode & Quick Actions */}
        <div className="flex items-center space-x-2">
          {subTab === 'shelf' && (
            <div className="flex items-center space-x-1 p-1 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#fffef2] dark:bg-[#181614] shadow-xs' : 'opacity-60'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4 text-[#2a2724] dark:text-[#f5f2e6]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#fffef2] dark:bg-[#181614] shadow-xs' : 'opacity-60'}`}
                title="List View"
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

          {/* 3. GOODREADS READING CHALLENGE & AHEAD / BEHIND SCHEDULE CARD */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-[#d4a373]/20 border border-[#d4a373]/50 flex items-center justify-center text-[#d4a373] shrink-0">
                  <Target className="w-6 h-6 text-[#d4a373]" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#d4a373] text-[#181614] px-2 py-0.5 rounded-full font-mono">
                      {readingGoal.year || new Date().getFullYear()} Reading Challenge
                    </span>
                    <span className="text-xs text-[#b07843] dark:text-[#d4a373] font-handwriting">
                      Goodreads Schedule Pace
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6] mt-0.5">
                    {actualCompleted} of {annualGoal} Books Completed
                  </h3>
                </div>
              </div>

              {/* Goodreads Ahead / Behind Alert Badge */}
              <div className="shrink-0">
                {scheduleDiff > 0 ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">
                        🎉 You are {scheduleDiff === 1 ? '1 book' : `${scheduleDiff} books`} ahead of schedule!
                      </span>
                      <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 font-mono">
                        Pace: Day {dayOfYear}/365 • Expected: {Math.round(expectedBooks * 10) / 10} bks
                      </span>
                    </div>
                  </div>
                ) : scheduleDiff < 0 ? (
                  <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-center space-x-2 shadow-xs">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">
                        ⏳ You are {Math.abs(scheduleDiff) === 1 ? '1 book' : `${Math.abs(scheduleDiff)} books`} behind schedule
                      </span>
                      <span className="text-[10px] text-amber-800/80 dark:text-amber-300/80 font-mono">
                        Pace: Day {dayOfYear}/365 • Expected: {Math.round(expectedBooks * 10) / 10} bks
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-sky-800 dark:text-sky-300 flex items-center space-x-2 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">
                        🎯 You are right on track with your reading goal!
                      </span>
                      <span className="text-[10px] text-sky-800/80 dark:text-sky-300/80 font-mono">
                        Pace: Day {dayOfYear}/365 • Expected: {Math.round(expectedBooks * 10) / 10} bks
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar & Sub-metrics */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-semibold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                <span>
                  Annual Target Progress
                </span>
                <span className="font-mono font-bold text-[#b07843] dark:text-[#d4a373]">
                  {Math.round((actualCompleted / annualGoal) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#15803d] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((actualCompleted / annualGoal) * 100))}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Filter Status Pills (Includes 1. Book Lending Tracker Tab) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f5f1e3] dark:bg-[#221f1c] p-3 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mr-1 flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1 text-[#d4a373]" />
                Filter:
              </span>
              {[
                { id: 'all', label: `All (${entries.length})` },
                { id: 'currently-reading', label: `Currently Reading (${statusCounts.currentlyReading})` },
                { id: 'want-to-read', label: `Want to Read (${statusCounts.wantToRead})` },
                { id: 'read', label: `Read (${statusCounts.read})` },
                { 
                  id: 'loaned-out', 
                  label: `Lent Out / On Loan (${statusCounts.loanedOut})`,
                  icon: ShieldCheck,
                },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
                    statusFilter === st.id
                      ? st.id === 'loaned-out'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-[#15803d] text-[#fffef2] shadow-xs'
                      : 'bg-[#fffef2] dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5]/50 dark:hover:bg-[#38332c]'
                  }`}
                >
                  {st.icon && <st.icon className="w-3.5 h-3.5" />}
                  <span>{st.label}</span>
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
                {statusFilter === 'loaned-out'
                  ? 'No books are currently loaned out to friends or book club members.'
                  : 'No books found matching criteria'}
              </p>
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 bg-[#d4a373] text-[#fffef2] rounded-xl text-xs font-bold hover:bg-[#c39262] transition-colors"
              >
                Add Book to BookForest
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

                    {/* 1. BOOK LENDING TRACKER BADGE (BookBuddy+ Feature) */}
                    {book.loan?.isLoanedOut && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div>
                            <span className="font-bold">
                              Loaned Out to: {book.loan.borrowerName || 'Friend'}
                            </span>
                            {book.loan.dueDate && (
                              <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                                Return Due: {book.loan.dueDate}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleReturnBook(book)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 transition-colors shadow-xs"
                          title="Mark book as returned"
                        >
                          Return Book
                        </button>
                      </div>
                    )}

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

                    {/* 4. GUIDED JOURNAL PROMPTS DISPLAY (Goodnotes Feature) */}
                    {book.journalPrompts && (
                      <div className="mt-3 p-2.5 bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 rounded-xl border border-[#ebd9c5]/50 dark:border-[#38332c] space-y-1.5 text-xs">
                        <span className="font-bold text-[#b07843] dark:text-[#d4a373] text-[10px] uppercase tracking-wider block">
                          Guided Reader Journal:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {book.journalPrompts.plotTwistRating && (
                            <span className="px-2 py-0.5 rounded-md bg-[#fffef2] dark:bg-[#1a1816] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] text-[10px]">
                              🎭 {book.journalPrompts.plotTwistRating}
                            </span>
                          )}
                          {book.journalPrompts.pacingAndTone && (
                            <span className="px-2 py-0.5 rounded-md bg-[#fffef2] dark:bg-[#1a1816] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] text-[10px]">
                              ⏱️ {book.journalPrompts.pacingAndTone}
                            </span>
                          )}
                          {book.journalPrompts.emotionalImpact && (
                            <span className="px-2 py-0.5 rounded-md bg-[#fffef2] dark:bg-[#1a1816] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] text-[10px]">
                              {book.journalPrompts.emotionalImpact}
                            </span>
                          )}
                          {book.journalPrompts.wouldReRead && (
                            <span className="px-2 py-0.5 rounded-md bg-[#fffef2] dark:bg-[#1a1816] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] text-[10px]">
                              🔁 {book.journalPrompts.wouldReRead}
                            </span>
                          )}
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

                  {/* Card Footer: Formats, Shelf Location & 4. Aesthetic Journal Card Export Button */}
                  <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between text-xs gap-1">
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

                    {/* 4. Goodnotes Aesthetic Journal Card Export Action & Web Reader */}
                    <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenReader?.(book)}
                          className="px-3 py-1.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                          title="Open in EPUB/PDF Web Reader"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read</span>
                        </button>

                        <button
                          onClick={() => setSelectedJournalBook(book)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#d4a373]/15 hover:bg-[#d4a373]/25 text-[#b07843] dark:text-[#d4a373] font-bold text-xs flex items-center space-x-1 transition-all border border-[#d4a373]/30"
                          title="View and export aesthetic Goodnotes journal card"
                        >
                          <Sparkles className="w-3 h-3 text-[#d4a373]" />
                          <span>Journal Card</span>
                        </button>
                      </div>

                      {isLoggedIn && !book.loan?.isLoanedOut && (
                        <button
                          onClick={() => handleOpenLendModal(book)}
                          className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                          title="Lend this copy to a contact"
                        >
                          <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Lend</span>
                        </button>
                      )}

                      {isLoggedIn && book.loan?.isLoanedOut && (
                        <button
                          onClick={() => handleReturnBook(book)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                          title="Mark copy as returned to shelf"
                        >
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Return</span>
                        </button>
                      )}
                    </div>
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
                    <th className="p-3">Loan Status</th>
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
                        {b.loan?.isLoanedOut ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                              <ShieldCheck className="w-3 h-3" />
                              Lent to {b.loan.borrowerName || 'Friend'}
                            </span>
                            {isLoggedIn && (
                              <button
                                onClick={() => handleReturnBook(b)}
                                className="text-[10px] font-bold text-emerald-600 hover:underline"
                              >
                                Mark Returned
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[#2a2724]/40 dark:text-[#f5f2e6]/40">In Library</span>
                            {isLoggedIn && (
                              <button
                                onClick={() => handleOpenLendModal(b)}
                                className="text-[10px] font-bold text-amber-600 hover:underline"
                              >
                                Lend
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-xs text-[#b07843] dark:text-[#d4a373] font-handwriting">
                        {b.collectionLocation}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onOpenReader?.(b)}
                          className="px-2.5 py-1 rounded-lg bg-[#d4a373] text-[#181614] font-bold text-xs inline-flex items-center gap-1 shadow-xs hover:bg-[#c39262] transition"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Read</span>
                        </button>
                        <button
                          onClick={() => setSelectedJournalBook(b)}
                          className="text-[#d4a373] hover:underline font-bold mr-1"
                        >
                          Journal Card
                        </button>
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

      {/* SUB-TAB: LENDING & LOAN TRACKER (BookBuddy+ Parity) */}
      {subTab === 'lent-out' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <h3 className="font-serif text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                  Lending & Loan Tracker
                </h3>
              </div>
              <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 max-w-2xl leading-relaxed">
                Track physical books lent out to friends, book clubs, and colleagues. Monitor due dates, contact info, and book condition notes with BookBuddy+ parity.
              </p>
            </div>

            {isLoggedIn && (
              <button
                onClick={() => handleOpenLendModal()}
                className="px-4 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Lend a Book</span>
              </button>
            )}
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                  {entries.filter((e) => e.loan?.isLoanedOut).length}
                </div>
                <div className="text-[11px] font-semibold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Active Loans
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-700 dark:text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400">
                  {
                    entries.filter(
                      (e) =>
                        e.loan?.isLoanedOut &&
                        e.loan?.dueDate &&
                        getDaysRemainingOrOverdue(e.loan.dueDate)! < 0
                    ).length
                  }
                </div>
                <div className="text-[11px] font-semibold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Overdue Returns
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#d4a373]/15 border border-[#d4a373]/30 flex items-center justify-center text-[#b07843] dark:text-[#d4a373] shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                  {
                    new Set(
                      entries
                        .filter((e) => e.loan?.isLoanedOut)
                        .map((e) => e.loan?.borrowerName)
                        .filter(Boolean)
                    ).size
                  }
                </div>
                <div className="text-[11px] font-semibold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Borrowing Contacts
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                  {entries.filter((e) => !e.loan?.isLoanedOut && e.loan?.borrowerName).length}
                </div>
                <div className="text-[11px] font-semibold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Returned to Shelf
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2a2724]/50 dark:text-[#f5f2e6]/50" />
              <input
                type="text"
                placeholder="Search by borrower name, contact, or title..."
                value={lendingSearch}
                onChange={(e) => setLendingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] placeholder:text-[#2a2724]/40"
              />
            </div>

            <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-semibold">
              Showing {entries.filter((e) => e.loan?.isLoanedOut).length} currently borrowed book(s)
            </div>
          </div>

          {/* Loaned Books Cards */}
          {(() => {
            const activeLoans = entries.filter((e) => {
              if (!e.loan?.isLoanedOut) return false;
              if (!lendingSearch.trim()) return true;
              const q = lendingSearch.toLowerCase();
              return (
                e.title.toLowerCase().includes(q) ||
                e.author.toLowerCase().includes(q) ||
                (e.loan.borrowerName && e.loan.borrowerName.toLowerCase().includes(q)) ||
                (e.loan.borrowerContact && e.loan.borrowerContact.toLowerCase().includes(q))
              );
            });

            if (activeLoans.length === 0) {
              return (
                <div className="p-12 text-center bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                    No Books Currently Loaned Out
                  </h4>
                  <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 max-w-sm mx-auto">
                    {lendingSearch
                      ? 'No active loans matched your search query.'
                      : 'All your physical and digital books are safely resting in your BookForest. Lend a book to a contact to start tracking here.'}
                  </p>
                  {isLoggedIn && !lendingSearch && (
                    <button
                      onClick={() => handleOpenLendModal()}
                      className="px-4 py-2 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs inline-flex items-center space-x-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Lend Your First Book</span>
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLoans.map((book) => {
                  const daysDiff = getDaysRemainingOrOverdue(book.loan?.dueDate);
                  const isOverdue = daysDiff !== null && daysDiff < 0;
                  const isDueToday = daysDiff === 0;

                  return (
                    <div
                      key={book.id}
                      className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3.5">
                        {/* Book Header */}
                        <div className="flex gap-3.5 items-start">
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-16 h-24 object-cover rounded-xl shadow-xs border border-[#ebd9c5] dark:border-[#38332c] shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] line-clamp-1">
                              {book.title}
                            </h4>
                            <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 truncate">
                              by {book.author}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f1e3] dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c]">
                                📍 {book.collectionLocation}
                              </span>
                              {book.ownedFormats?.[0] && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373]">
                                  {book.ownedFormats[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Borrower Information Card */}
                        <div className="p-3.5 bg-[#f5f1e3]/80 dark:bg-[#282420] rounded-2xl border border-[#ebd9c5]/60 dark:border-[#38332c] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#b07843] dark:text-[#d4a373] text-[10px] uppercase tracking-wider flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              Borrower:
                            </span>
                            <span className="font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                              {book.loan?.borrowerName || 'Friend'}
                            </span>
                          </div>

                          {book.loan?.borrowerContact && (
                            <div className="flex items-center justify-between text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#d4a373]" />
                                Contact:
                              </span>
                              <span className="font-mono">{book.loan.borrowerContact}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 pt-1 border-t border-[#ebd9c5]/50 dark:border-[#38332c]/50">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#d4a373]" />
                              Loan Date:
                            </span>
                            <span>{book.loan?.loanDate || 'Recent'}</span>
                          </div>

                          {book.loan?.dueDate && (
                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <span className="flex items-center gap-1 text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                                <Clock className="w-3 h-3 text-[#d4a373]" />
                                Due Date:
                              </span>
                              <div>
                                {isOverdue ? (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                                    Overdue by {Math.abs(daysDiff!)} day{Math.abs(daysDiff!) > 1 ? 's' : ''}
                                  </span>
                                ) : isDueToday ? (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                    Due Today
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                    Due in {daysDiff} day{daysDiff! > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {book.loan?.notes && (
                            <div className="mt-1.5 pt-1.5 border-t border-[#ebd9c5]/40 dark:border-[#38332c]/40 text-[11px] italic text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                              Note: “{book.loan.notes}”
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <button
                          onClick={() => onOpenReader?.(book)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#d4a373]/15 hover:bg-[#d4a373]/25 text-[#b07843] dark:text-[#d4a373] font-bold text-xs flex items-center space-x-1 transition border border-[#d4a373]/30"
                          title="Preview in Reader"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleExtendDueDate(book, 7)}
                            className="px-2 py-1.5 rounded-xl bg-[#f5f1e3] dark:bg-[#282420] hover:bg-[#ebd9c5] dark:hover:bg-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] font-semibold text-[11px] transition border border-[#ebd9c5] dark:border-[#38332c]"
                            title="Extend due date by 7 days"
                          >
                            +7 Days
                          </button>

                          {isLoggedIn && (
                            <button
                              onClick={() => handleReturnBook(book)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition"
                              title="Mark copy returned to personal shelf"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Returned</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Past Loans / Returned Shelf History */}
          {entries.filter((e) => !e.loan?.isLoanedOut && e.loan?.borrowerName).length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <h4 className="font-serif text-lg text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Returned Loan History</span>
              </h4>
              <div className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 font-bold uppercase">
                    <tr>
                      <th className="p-3">Book Title</th>
                      <th className="p-3">Past Borrower</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Loan Date</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebd9c5] dark:divide-[#38332c]">
                    {entries
                      .filter((e) => !e.loan?.isLoanedOut && e.loan?.borrowerName)
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-[#f5f1e3]/40 dark:hover:bg-[#282420]">
                          <td className="p-3 font-semibold text-[#2a2724] dark:text-[#f5f2e6]">
                            {b.title}
                          </td>
                          <td className="p-3 text-[#b07843] dark:text-[#d4a373] font-bold">
                            {b.loan?.borrowerName}
                          </td>
                          <td className="p-3 text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-mono">
                            {b.loan?.borrowerContact || '—'}
                          </td>
                          <td className="p-3 text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                            {b.loan?.loanDate || 'Past'}
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              Returned to Shelf
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
                    {book.loan?.isLoanedOut && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300">
                        Lent to: {book.loan.borrowerName}
                      </span>
                    )}
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

      {/* 4. AESTHETIC JOURNAL MODAL (Goodnotes Feature) */}
      <AestheticJournalModal
        isOpen={Boolean(selectedJournalBook)}
        onClose={() => setSelectedJournalBook(null)}
        book={selectedJournalBook}
      />

      {/* 5. LEND A BOOK MODAL (BookBuddy+ Parity) */}
      {isLendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#fffef2] dark:bg-[#1a1816] w-full max-w-lg rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl p-6 sm:p-7 space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebd9c5] dark:border-[#38332c]">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                    Lend a Book
                  </h3>
                  <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    BookBuddy+ Lending Tracker
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLendModalOpen(false)}
                className="p-2 rounded-xl text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:bg-[#f5f1e3] dark:hover:bg-[#282420] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-4">
              {/* Select Book */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#b07843] dark:text-[#d4a373] text-[11px] uppercase tracking-wider block">
                  Select Book to Lend: *
                </label>
                <select
                  value={selectedBookForLoan?.id || ''}
                  onChange={(e) => {
                    const found = entries.find((b) => b.id === e.target.value);
                    setSelectedBookForLoan(found || null);
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] font-semibold text-xs focus:ring-2 focus:ring-[#d4a373] outline-hidden"
                >
                  <option value="">-- Choose a book from your shelf --</option>
                  {entries
                    .filter((b) => !b.loan?.isLoanedOut || b.id === selectedBookForLoan?.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author} ({b.collectionLocation})
                      </option>
                    ))}
                </select>
              </div>

              {/* Borrower Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#b07843] dark:text-[#d4a373] text-[11px] uppercase tracking-wider block">
                  Borrower Name: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Jenkins, Uncle Marcus, Fable Clubmate"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] text-xs focus:ring-2 focus:ring-[#d4a373] outline-hidden"
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#b07843] dark:text-[#d4a373] text-[11px] uppercase tracking-wider block">
                  Contact Info (Phone, Email, Social):
                </label>
                <input
                  type="text"
                  placeholder="e.g., sarah@gmail.com or (555) 019-2834 or @sarahreads"
                  value={borrowerContact}
                  onChange={(e) => setBorrowerContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] text-xs focus:ring-2 focus:ring-[#d4a373] outline-hidden"
                />
              </div>

              {/* Due Date & Quick Presets */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#b07843] dark:text-[#d4a373] text-[11px] uppercase tracking-wider block">
                  Return Due Date:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={loanDueDate}
                    onChange={(e) => setLoanDueDate(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] text-xs focus:ring-2 focus:ring-[#d4a373] outline-hidden"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        setLoanDueDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-2 rounded-lg bg-[#f5f1e3] dark:bg-[#282420] text-[#2a2724] dark:text-[#f5f2e6] font-semibold text-[11px] hover:bg-[#ebd9c5] border border-[#ebd9c5] dark:border-[#38332c]"
                    >
                      +7d
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 14);
                        setLoanDueDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-2 rounded-lg bg-[#f5f1e3] dark:bg-[#282420] text-[#2a2724] dark:text-[#f5f2e6] font-semibold text-[11px] hover:bg-[#ebd9c5] border border-[#ebd9c5] dark:border-[#38332c]"
                    >
                      +14d
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 30);
                        setLoanDueDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-2.5 py-2 rounded-lg bg-[#f5f1e3] dark:bg-[#282420] text-[#2a2724] dark:text-[#f5f2e6] font-semibold text-[11px] hover:bg-[#ebd9c5] border border-[#ebd9c5] dark:border-[#38332c]"
                    >
                      +30d
                    </button>
                  </div>
                </div>
              </div>

              {/* Loan / Condition Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#b07843] dark:text-[#d4a373] text-[11px] uppercase tracking-wider block">
                  Condition & Loan Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Pristine hardcover with dust jacket. Borrowed for October spooky book club."
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] text-xs focus:ring-2 focus:ring-[#d4a373] outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLendModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:bg-[#f5f1e3] dark:hover:bg-[#282420] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedBookForLoan || !borrowerName.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-[#d4a373] hover:bg-[#c39262] disabled:opacity-50 text-[#181614] shadow-sm transition"
                >
                  Confirm Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
