import React, { useState } from 'react';
import {
  AuthorProfile,
  PublishedBook,
  UpcomingBook,
  BookForestEntry,
  WritingStage,
  ReadingGoal,
  ReadingChallenge,
} from '../types';
import {
  Feather,
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  Settings,
  Clock,
  Layout,
  ExternalLink,
  MessageSquareQuote,
  FileText,
  Award,
  Target,
  Download,
  TrendingUp,
  BarChart2,
  DollarSign,
  Library,
  Users,
  Check,
} from 'lucide-react';
import { exportBookForestJSON, exportBookForestCSV } from '../utils/exportUtils';
import { ReaderGraphSection } from './ReaderGraphSection';

interface WriterDashboardViewProps {
  author: AuthorProfile;
  onUpdateAuthor: (updated: AuthorProfile) => void;
  publishedBooks: PublishedBook[];
  onUpdatePublishedBooks: (books: PublishedBook[]) => void;
  upcomingBooks: UpcomingBook[];
  onUpdateUpcomingBooks: (books: UpcomingBook[]) => void;
  bookForestEntries: BookForestEntry[];
  readingGoal?: ReadingGoal;
  onUpdateReadingGoal?: (goal: ReadingGoal) => void;
  onEditBookForestEntry?: (entry: BookForestEntry) => void;
  onDeleteBookForestEntry?: (id: string) => void;
  onOpenAddPortfolioModal: () => void;
  onOpenAddBookForestModal: () => void;
  onOpenGutenbergModal?: () => void;
  onOpenOpenLibraryModal?: () => void;
  onOpenStoryGraphModal?: () => void;
  onOpenFableLounge?: () => void;
  onOpenAICompanion?: () => void;
}

export const WriterDashboardView: React.FC<WriterDashboardViewProps> = ({
  author,
  onUpdateAuthor,
  publishedBooks,
  onUpdatePublishedBooks,
  upcomingBooks,
  onUpdateUpcomingBooks,
  bookForestEntries,
  readingGoal,
  onUpdateReadingGoal,
  onEditBookForestEntry,
  onDeleteBookForestEntry,
  onOpenAddPortfolioModal,
  onOpenAddBookForestModal,
  onOpenGutenbergModal,
  onOpenOpenLibraryModal,
  onOpenStoryGraphModal,
  onOpenFableLounge,
  onOpenAICompanion,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'published' | 'upcoming' | 'bookforest' | 'goals' | 'site'>('profile');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Profile form local state
  const [profileForm, setProfileForm] = useState<AuthorProfile>({ ...author });

  // Reading Goal local form
  const [goalForm, setGoalForm] = useState<ReadingGoal>({
    year: readingGoal?.year || 2026,
    targetBooks: readingGoal?.targetBooks || 25,
    completedBooks: readingGoal?.completedBooks ?? bookForestEntries.filter(e => e.readingStatus === 'read').length,
    targetPages: readingGoal?.targetPages || 8000,
    completedPages: readingGoal?.completedPages || 4250,
    challenges: readingGoal?.challenges || [
      { id: 'ch-1', title: '500+ Page Epic Sci-Fi Novels', targetCount: 3, currentCount: 2, completed: false },
      { id: 'ch-2', title: 'Read 5 Classic Speculative Works', targetCount: 5, currentCount: 4, completed: false },
      { id: 'ch-3', title: 'Collect 10 Special Hardcover Editions', targetCount: 10, currentCount: 8, completed: false },
    ],
  });

  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeTarget, setNewChallengeTarget] = useState<number>(5);

  // Currently editing book state
  const [editingPublished, setEditingPublished] = useState<PublishedBook | null>(null);
  const [editingUpcoming, setEditingUpcoming] = useState<UpcomingBook | null>(null);

  // Site banner state
  const [heroAnnouncement, setHeroAnnouncement] = useState<string>(
    'New Release "Sherif" & "The Virus <evo>" now live on Wattpad, Webnovel & Front Page'
  );

  const showToast = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAuthor(profileForm);
    showToast('Author profile updated successfully!');
  };

  // Published book update handlers
  const handleSavePublishedBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPublished) return;
    const updated = publishedBooks.map((b) => (b.id === editingPublished.id ? editingPublished : b));
    onUpdatePublishedBooks(updated);
    setEditingPublished(null);
    showToast(`Updated "${editingPublished.title}" in Published Books!`);
  };

  const handleDeletePublishedBook = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your published works?`)) {
      onUpdatePublishedBooks(publishedBooks.filter((b) => b.id !== id));
      showToast(`Removed "${title}".`);
    }
  };

  const handleToggleFrontPagePublished = (id: string) => {
    const updated = publishedBooks.map((b) => {
      if (b.id === id) {
        const isShown = b.showOnFrontPage !== false;
        return { ...b, showOnFrontPage: !isShown };
      }
      return b;
    });
    onUpdatePublishedBooks(updated);
    showToast('Front Page visibility updated!');
  };

  // Upcoming book update handlers
  const handleSaveUpcomingBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUpcoming) return;
    const updated = upcomingBooks.map((b) => (b.id === editingUpcoming.id ? editingUpcoming : b));
    onUpdateUpcomingBooks(updated);
    setEditingUpcoming(null);
    showToast(`Updated upcoming release "${editingUpcoming.title}"!`);
  };

  const handleDeleteUpcomingBook = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete upcoming title "${title}"?`)) {
      onUpdateUpcomingBooks(upcomingBooks.filter((b) => b.id !== id));
      showToast(`Removed "${title}".`);
    }
  };

  const handleToggleFrontPageUpcoming = (id: string) => {
    const updated = upcomingBooks.map((u) => {
      if (u.id === id) {
        const isShown = u.showOnFrontPage !== false;
        return { ...u, showOnFrontPage: !isShown };
      }
      return u;
    });
    onUpdateUpcomingBooks(updated);
    showToast('Front Page visibility updated!');
  };

  const handlePublishUpcomingBook = (u: UpcomingBook) => {
    const published: PublishedBook = {
      id: `pub-${Date.now()}-${u.id}`,
      title: u.title,
      series: u.series,
      genre: u.genre,
      coverUrl: u.coverUrl,
      publisher: 'Self-Published / Independently Published',
      releaseDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      blurb: u.blurb,
      excerpt: u.teaserQuote ? `Chapter 1: ${u.title}\n\n${u.teaserQuote}` : `Chapter 1: ${u.title}\n\nSample chapter excerpt text...`,
      buyLinks: u.preorderLinks ? u.preorderLinks.map((l) => ({ vendor: l.vendor, url: l.url })) : [
        { vendor: 'Wattpad', url: 'https://www.wattpad.com' },
        { vendor: 'Webnovel', url: 'https://www.webnovel.com' },
      ],
      praise: [{ quote: 'Freshly published release now live in author bibliography.', source: 'Author Announcement' }],
      rating: 5,
      pages: 320,
      formats: ['Paperback', 'Ebook'],
      showOnFrontPage: true,
    };

    onUpdatePublishedBooks([published, ...publishedBooks]);
    onUpdateUpcomingBooks(upcomingBooks.filter((item) => item.id !== u.id));
    if (editingUpcoming?.id === u.id) {
      setEditingUpcoming(null);
    }
    showToast(`"${u.title}" has been published and moved to Published Bibliography!`);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateReadingGoal) {
      onUpdateReadingGoal(goalForm);
    }
    showToast('Reading Goal & Challenges updated!');
  };

  const handleSyncCompletedWithBookForest = () => {
    const finishedCount = bookForestEntries.filter(e => e.readingStatus === 'read').length;
    setGoalForm(prev => ({ ...prev, completedBooks: finishedCount }));
    showToast(`Synced completed books (${finishedCount}) from BookForest catalog!`);
  };

  const handleAddChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallengeTitle.trim()) return;
    const newCh: ReadingChallenge = {
      id: `ch-${Date.now()}`,
      title: newChallengeTitle.trim(),
      targetCount: newChallengeTarget || 1,
      currentCount: 0,
      completed: false,
    };
    setGoalForm(prev => {
      const updated = {
        ...prev,
        challenges: [...(prev.challenges || []), newCh],
      };
      if (onUpdateReadingGoal) onUpdateReadingGoal(updated);
      return updated;
    });
    setNewChallengeTitle('');
    setNewChallengeTarget(5);
    showToast(`Added challenge "${newCh.title}"`);
  };

  const handleToggleChallenge = (id: string) => {
    setGoalForm(prev => {
      const updated = {
        ...prev,
        challenges: (prev.challenges || []).map(ch => 
          ch.id === id ? { ...ch, completed: !ch.completed } : ch
        ),
      };
      if (onUpdateReadingGoal) onUpdateReadingGoal(updated);
      return updated;
    });
  };

  const handleDeleteChallenge = (id: string) => {
    setGoalForm(prev => {
      const updated = {
        ...prev,
        challenges: (prev.challenges || []).filter(ch => ch.id !== id),
      };
      if (onUpdateReadingGoal) onUpdateReadingGoal(updated);
      return updated;
    });
    showToast('Challenge removed.');
  };

  const handleUpdateChallengeProgress = (id: string, delta: number) => {
    setGoalForm(prev => {
      const updated = {
        ...prev,
        challenges: (prev.challenges || []).map(ch => {
          if (ch.id === id) {
            const nextCount = Math.max(0, ch.currentCount + delta);
            return {
              ...ch,
              currentCount: nextCount,
              completed: nextCount >= ch.targetCount,
            };
          }
          return ch;
        }),
      };
      if (onUpdateReadingGoal) onUpdateReadingGoal(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a2724] text-[#f5f2e6] border border-[#d4a373] px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#d4a373]" />
          <span className="font-bold text-xs">{savedSuccess}</span>
        </div>
      )}

      {/* Dashboard Top Header Banner */}
      <div className="rounded-3xl bg-[#2a2724] dark:bg-[#1f1d1a] text-[#f5f2e6] p-6 sm:p-8 shadow-xl border border-[#d4a373]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
              Author Content Management System
            </span>
            <span className="text-xs text-[#d4a373] font-semibold font-handwriting">
              Live Web Editing Mode
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#fffef2] tracking-tight flex items-center gap-3">
            <Feather className="w-8 h-8 text-[#d4a373]" />
            Writer’s Content Control Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#f5f2e6]/80 max-w-xl font-sans">
            Instantly manage bio, published bibliography, upcoming release milestones, sample chapters, and web content.
          </p>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
            Published Novels
          </span>
          <div className="text-2xl font-serif text-[#b07843] dark:text-[#d4a373] font-bold">
            {publishedBooks.length}
          </div>
        </div>

        <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
            Upcoming / Works-in-Progress
          </span>
          <div className="text-2xl font-serif text-[#b07843] dark:text-[#d4a373] font-bold">
            {upcomingBooks.length}
          </div>
        </div>

        <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
            BookForest Archive
          </span>
          <div className="text-2xl font-serif text-[#15803d] dark:text-[#4ade80] font-bold">
            {bookForestEntries.length} Books
          </div>
        </div>

        <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
            System Status
          </span>
          <div className="text-xs font-bold text-[#15803d] dark:text-[#4ade80] flex items-center space-x-1 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Dashboard Sub-Tab Navigation */}
      <div className="flex border-b border-[#ebd9c5] dark:border-[#38332c] pb-3 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <Feather className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Author Profile & Bio</span>
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'published'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Published Bibliography ({publishedBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'upcoming'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Upcoming Releases ({upcomingBooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookforest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'bookforest'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#15803d]" />
          <span>BookForest Catalog ({bookForestEntries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'goals'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Reading Goals & Challenges</span>
        </button>

        <button
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeTab === 'site'
              ? 'bg-[#2a2724] text-[#d4a373] shadow-xs'
              : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-[#d4a373]" />
          <span>Site Announcements & Banner</span>
        </button>
      </div>

      {/* TAB 1: AUTHOR PROFILE EDITOR */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 sm:p-8 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <div>
              <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                Edit Author Profile Information
              </h2>
              <p className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 text-xs mt-0.5">
                Updates bio, pen name, accolades, avatar, and featured quote across the entire website.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center space-x-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Author Public Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Pen Name / Variant
              </label>
              <input
                type="text"
                value={profileForm.penName || ''}
                onChange={(e) => setProfileForm({ ...profileForm, penName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Title / Author Subtitle & Accolades
              </label>
              <input
                type="text"
                value={profileForm.title}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Full Biography
              </label>
              <textarea
                rows={4}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Avatar / Headshot URL
              </label>
              <input
                type="text"
                value={profileForm.avatarUrl}
                onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Featured Quote
              </label>
              <input
                type="text"
                value={profileForm.featuredQuote}
                onChange={(e) => setProfileForm({ ...profileForm, featuredQuote: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-serif"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: PUBLISHED BIBLIOGRAPHY MANAGER */}
      {activeTab === 'published' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
              Manage Published Bibliography
            </h2>
            <button
              onClick={onOpenAddPortfolioModal}
              className="px-4 py-2 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Published Work</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {publishedBooks.map((book) => (
              <div
                key={book.id}
                className="bg-[#fbf9ee] dark:bg-[#221f1c] p-5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded-xl border border-[#ebd9c5] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-lg font-normal text-[#2a2724] dark:text-[#f5f2e6]">
                        {book.title}
                      </h3>
                      {book.series && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373] font-handwriting font-bold">
                          {book.series}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      Released {book.releaseDate} • {book.publisher} • {book.pages} pages
                    </p>
                    <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 line-clamp-2 max-w-xl">
                      {book.blurb}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleFrontPagePublished(book.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                      book.showOnFrontPage !== false
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                    title="Choose if this book is displayed on Front Page"
                  >
                    <span>{book.showOnFrontPage !== false ? '✓ Shown on Front Page' : '✕ Hidden on Front Page'}</span>
                  </button>

                  <button
                    onClick={() => setEditingPublished(book)}
                    className="px-3 py-2 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] hover:bg-[#ebd9c5] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c] font-bold text-xs flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#d4a373]" />
                    <span>Edit Book</span>
                  </button>

                  <button
                    onClick={() => handleDeletePublishedBook(book.id, book.title)}
                    className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                    title="Delete Book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Published Book Modal */}
          {editingPublished && (
            <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                  <h3 className="font-serif font-normal text-xl">
                    Editing Published Work: {editingPublished.title}
                  </h3>
                  <button
                    onClick={() => setEditingPublished(null)}
                    className="text-[#2a2724]/50 hover:text-[#2a2724]"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePublishedBook} className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1">Book Title</label>
                    <input
                      type="text"
                      value={editingPublished.title}
                      onChange={(e) => setEditingPublished({ ...editingPublished, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Series Name</label>
                      <input
                        type="text"
                        value={editingPublished.series || ''}
                        onChange={(e) => setEditingPublished({ ...editingPublished, series: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Genre</label>
                      <input
                        type="text"
                        value={editingPublished.genre}
                        onChange={(e) => setEditingPublished({ ...editingPublished, genre: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Cover Image URL</label>
                    <input
                      type="text"
                      value={editingPublished.coverUrl}
                      onChange={(e) => setEditingPublished({ ...editingPublished, coverUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Book Blurb / Synopsis</label>
                    <textarea
                      rows={3}
                      value={editingPublished.blurb}
                      onChange={(e) => setEditingPublished({ ...editingPublished, blurb: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Sample Chapter Excerpt</label>
                    <textarea
                      rows={4}
                      value={editingPublished.excerpt || ''}
                      onChange={(e) => setEditingPublished({ ...editingPublished, excerpt: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] outline-none font-serif"
                    />
                  </div>

                  <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
                    <label className="flex items-center space-x-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPublished.showOnFrontPage !== false}
                        onChange={(e) => setEditingPublished({ ...editingPublished, showOnFrontPage: e.target.checked })}
                        className="rounded accent-[#d4a373] w-4 h-4"
                      />
                      <span className="text-xs">Display this book on the Front Page (Portfolio)</span>
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingPublished(null)}
                      className="px-4 py-2 rounded-xl font-bold border border-[#ebd9c5]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl font-bold bg-[#d4a373] text-[#fffef2]"
                    >
                      Save Book Updates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPCOMING RELEASES MANAGER */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
              Manage Upcoming Releases & WIPs
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {upcomingBooks.map((u) => (
              <div
                key={u.id}
                className="bg-[#fbf9ee] dark:bg-[#221f1c] p-5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={u.coverUrl}
                    alt={u.title}
                    className="w-16 h-24 object-cover rounded-xl border border-[#ebd9c5] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-lg font-normal text-[#2a2724] dark:text-[#f5f2e6]">
                        {u.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373] font-handwriting">
                        Stage: {u.writingStage} ({u.progressPercentage}%)
                      </span>
                    </div>
                    <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      Target Release: {u.expectedRelease} • Genre: {u.genre}
                    </p>
                    <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 line-clamp-2 max-w-xl">
                      {u.blurb}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePublishUpcomingBook(u)}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition-colors"
                    title="Publish this work now and move to Published Bibliography"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Publish & Move to Bibliography</span>
                  </button>

                  <button
                    onClick={() => handleToggleFrontPageUpcoming(u.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                      u.showOnFrontPage !== false
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                    title="Choose if this upcoming release is displayed on Front Page"
                  >
                    <span>{u.showOnFrontPage !== false ? '✓ Shown on Front Page' : '✕ Hidden on Front Page'}</span>
                  </button>

                  <button
                    onClick={() => setEditingUpcoming(u)}
                    className="px-3 py-2 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] hover:bg-[#ebd9c5] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c] font-bold text-xs flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#d4a373]" />
                    <span>Edit Progress</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUpcomingBook(u.id, u.title)}
                    className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Upcoming Modal */}
          {editingUpcoming && (
            <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                  <h3 className="font-serif font-normal text-xl">
                    Edit Upcoming Release: {editingUpcoming.title}
                  </h3>
                  <button
                    onClick={() => setEditingUpcoming(null)}
                    className="text-[#2a2724]/50 hover:text-[#2a2724]"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveUpcomingBook} className="space-y-3">
                  <div>
                    <label className="block font-bold mb-1">Title</label>
                    <input
                      type="text"
                      value={editingUpcoming.title}
                      onChange={(e) => setEditingUpcoming({ ...editingUpcoming, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Writing Stage</label>
                      <select
                        value={editingUpcoming.writingStage}
                        onChange={(e) => setEditingUpcoming({ ...editingUpcoming, writingStage: e.target.value as WritingStage })}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                      >
                        <option value="Outlining">Outlining</option>
                        <option value="Drafting">Drafting</option>
                        <option value="Revision">Revision</option>
                        <option value="Editing">Editing</option>
                        <option value="Proofreading">Proofreading</option>
                        <option value="ARC Review">ARC Review</option>
                        <option value="Print Ready">Print Ready</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Completion ({editingUpcoming.progressPercentage}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingUpcoming.progressPercentage}
                        onChange={(e) => setEditingUpcoming({ ...editingUpcoming, progressPercentage: parseInt(e.target.value) })}
                        className="w-full accent-[#d4a373] mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Expected Release Date</label>
                    <input
                      type="text"
                      value={editingUpcoming.expectedRelease}
                      onChange={(e) => setEditingUpcoming({ ...editingUpcoming, expectedRelease: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] bg-[#fbf9ee] dark:bg-[#181614] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Teaser Quote / Sample Chapter Entry</label>
                    <textarea
                      rows={3}
                      value={editingUpcoming.teaserQuote}
                      onChange={(e) => setEditingUpcoming({ ...editingUpcoming, teaserQuote: e.target.value })}
                      placeholder="Write or paste teaser quote / sample chapter excerpt..."
                      className="w-full p-3 rounded-xl border border-[#ebd9c5] bg-[#fbf9ee] dark:bg-[#181614] outline-none font-serif text-xs"
                    />
                  </div>

                  <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
                    <label className="flex items-center space-x-2 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUpcoming.showOnFrontPage !== false}
                        onChange={(e) => setEditingUpcoming({ ...editingUpcoming, showOnFrontPage: e.target.checked })}
                        className="rounded accent-[#d4a373] w-4 h-4"
                      />
                      <span className="text-xs">Display this work on the Front Page (Portfolio)</span>
                    </label>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublishUpcomingBook(editingUpcoming)}
                      className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 shadow-xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Publish Now (Move to Bibliography)</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingUpcoming(null)}
                        className="px-4 py-2 rounded-xl font-bold border border-[#ebd9c5]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl font-bold bg-[#d4a373] text-[#fffef2]"
                      >
                        Save Progress
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BOOKFOREST CATALOG MANAGER */}
      {activeTab === 'bookforest' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                Manage BookForest Catalog
              </h2>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                Curate your reading log, ratings, format collection, and download backups for safety.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportBookForestJSON(bookForestEntries)}
                className="px-3.5 py-2 rounded-xl bg-[#2a2724] dark:bg-[#1f1d1a] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                title="Backup full BookForest library as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>

              <button
                onClick={() => exportBookForestCSV(bookForestEntries)}
                className="px-3.5 py-2 rounded-xl bg-[#2a2724] dark:bg-[#1f1d1a] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 font-bold text-xs flex items-center space-x-1.5 shadow-xs"
                title="Export full BookForest library as CSV"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onOpenAddBookForestModal}
                className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-[#fffef2] font-bold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add BookForest Entry</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {bookForestEntries.map((bf) => (
              <div
                key={bf.id}
                className="bg-[#fbf9ee] dark:bg-[#221f1c] p-5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={bf.coverUrl}
                    alt={bf.title}
                    className="w-16 h-24 object-cover rounded-xl border border-[#ebd9c5] shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-lg font-normal text-[#2a2724] dark:text-[#f5f2e6]">
                        {bf.title}
                      </h3>
                      <span className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                        by {bf.author}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#15803d]/15 text-[#15803d] dark:text-[#4ade80]">
                        {bf.readingStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      Rating: {'★'.repeat(bf.userRating)}{'☆'.repeat(5 - bf.userRating)} • Genre: {bf.genre} • Added: {bf.dateAdded}
                    </p>
                    <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 line-clamp-2 max-w-xl font-serif">
                      "{bf.reviewComments}"
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {bf.ownedFormats.map((fmt) => (
                        <span key={fmt} className="text-[10px] px-2 py-0.5 rounded-md bg-[#ebd9c5]/40 dark:bg-[#38332c] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 font-mono">
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {onEditBookForestEntry && (
                    <button
                      onClick={() => onEditBookForestEntry(bf)}
                      className="px-3 py-2 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] hover:bg-[#ebd9c5] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c] font-bold text-xs flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#15803d]" />
                      <span>Edit Entry</span>
                    </button>
                  )}

                  {onDeleteBookForestEntry && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete BookForest entry "${bf.title}"?`)) {
                          onDeleteBookForestEntry(bf.id);
                          showToast(`Removed "${bf.title}" from BookForest.`);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: READING GOAL, CHALLENGES & STATS CONTROL PANEL */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 sm:p-8 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-6 text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
                  Reader Analytics & Control Panel
                </span>
                <h2 className="font-serif font-normal text-2xl sm:text-3xl text-[#2a2724] dark:text-[#f5f2e6] pt-1">
                  Reading Goals & Custom Challenges Control Panel
                </h2>
                <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                  Manage your annual reading targets, track page milestones, add custom reading challenges, and export library backups.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportBookForestJSON(bookForestEntries)}
                  className="px-3.5 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-1.5 shadow-xs border border-[#d4a373]/40"
                  title="Download JSON Backup"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup JSON</span>
                </button>
                <button
                  onClick={() => exportBookForestCSV(bookForestEntries)}
                  className="px-3.5 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-1.5 shadow-xs border border-[#d4a373]/40"
                  title="Export CSV Spreadsheet"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
                <div className="flex items-center justify-between text-[#d4a373]">
                  <span className="text-[11px] font-bold font-handwriting uppercase">Annual Books Target</span>
                  <Target className="w-4 h-4" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  {goalForm.completedBooks} / {goalForm.targetBooks}
                </div>
                <div className="w-full h-2 rounded-full bg-[#ebd9c5] dark:bg-[#38332c] overflow-hidden">
                  <div
                    className="h-full bg-[#d4a373] transition-all"
                    style={{ width: `${Math.min(100, Math.round((goalForm.completedBooks / (goalForm.targetBooks || 1)) * 100))}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  {Math.round((goalForm.completedBooks / (goalForm.targetBooks || 1)) * 100)}% of {goalForm.year} Goal
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
                <div className="flex items-center justify-between text-[#15803d] dark:text-[#4ade80]">
                  <span className="text-[11px] font-bold font-handwriting uppercase">Pages Read Milestone</span>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  {(goalForm.completedPages || 0).toLocaleString()} / {(goalForm.targetPages || 0).toLocaleString()}
                </div>
                <div className="w-full h-2 rounded-full bg-[#ebd9c5] dark:bg-[#38332c] overflow-hidden">
                  <div
                    className="h-full bg-[#15803d] dark:bg-[#4ade80] transition-all"
                    style={{ width: `${Math.min(100, Math.round(((goalForm.completedPages || 0) / (goalForm.targetPages || 1)) * 100))}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  {Math.round(((goalForm.completedPages || 0) / (goalForm.targetPages || 1)) * 100)}% Page Completion
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
                <div className="flex items-center justify-between text-[#b07843]">
                  <span className="text-[11px] font-bold font-handwriting uppercase">Active Challenges</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  {(goalForm.challenges || []).filter(c => c.completed).length} / {(goalForm.challenges || []).length} Completed
                </div>
                <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 block pt-1">
                  Custom Reader Trackers
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-[11px] font-bold font-handwriting uppercase">Collection Value</span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  ${bookForestEntries.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0).toFixed(2)}
                </div>
                <span className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 block pt-1">
                  Physical & Virtual Editions
                </span>
              </div>
            </div>

            {/* Annual Goal Settings Form */}
            <form onSubmit={handleSaveGoal} className="p-5 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
              <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#d4a373]" />
                  <span>Configure Annual Goal & Page Targets</span>
                </h3>
                <button
                  type="button"
                  onClick={handleSyncCompletedWithBookForest}
                  className="px-3 py-1.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 text-[11px] font-bold flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Sync with BookForest</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Target Year
                  </label>
                  <input
                    type="number"
                    value={goalForm.year}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Target Books
                  </label>
                  <input
                    type="number"
                    value={goalForm.targetBooks}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetBooks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Completed Books
                  </label>
                  <input
                    type="number"
                    value={goalForm.completedBooks}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, completedBooks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Target Pages
                  </label>
                  <input
                    type="number"
                    value={goalForm.targetPages || 8000}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, targetPages: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Completed Pages
                  </label>
                  <input
                    type="number"
                    value={goalForm.completedPages || 0}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, completedPages: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center space-x-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Goal Settings</span>
                </button>
              </div>
            </form>

            {/* Custom Reading Challenges Control Panel */}
            <div className="p-5 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
              <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#b07843]" />
                  <span>Custom Reading Challenges & Goals</span>
                </h3>
                <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  Track specialized reading endeavors like genre marathons, hardcover collecting, or classic literature reading goals.
                </p>
              </div>

              {/* Active Challenges List */}
              <div className="space-y-3">
                {(goalForm.challenges || []).map((ch) => (
                  <div
                    key={ch.id}
                    className="p-4 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleChallenge(ch.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            ch.completed
                              ? 'bg-[#15803d] border-[#15803d] text-white'
                              : 'border-[#ebd9c5] dark:border-[#38332c] bg-transparent'
                          }`}
                        >
                          {ch.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span className={`font-serif text-sm font-bold ${ch.completed ? 'line-through text-[#2a2724]/50 dark:text-[#f5f2e6]/50' : 'text-[#2a2724] dark:text-[#f5f2e6]'}`}>
                          {ch.title}
                        </span>
                        {ch.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/15 text-[#15803d] dark:text-[#4ade80]">
                            Achieved!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                        <span>Progress: {ch.currentCount} / {ch.targetCount} books</span>
                        <div className="w-32 h-2 rounded-full bg-[#ebd9c5] dark:bg-[#38332c] overflow-hidden">
                          <div
                            className="h-full bg-[#d4a373] transition-all"
                            style={{ width: `${Math.min(100, Math.round((ch.currentCount / (ch.targetCount || 1)) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateChallengeProgress(ch.id, -1)}
                        className="w-7 h-7 rounded-lg bg-[#f5f1e3] dark:bg-[#25221e] hover:bg-[#ebd9c5] border border-[#ebd9c5] dark:border-[#38332c] font-bold text-xs"
                        title="Decrement Count"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateChallengeProgress(ch.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#f5f1e3] dark:bg-[#25221e] hover:bg-[#ebd9c5] border border-[#ebd9c5] dark:border-[#38332c] font-bold text-xs"
                        title="Increment Count"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteChallenge(ch.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 transition-colors"
                        title="Remove Challenge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Challenge Form */}
              <form onSubmit={handleAddChallenge} className="pt-2 flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-1">
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    New Challenge Goal Title
                  </label>
                  <input
                    type="text"
                    value={newChallengeTitle}
                    onChange={(e) => setNewChallengeTitle(e.target.value)}
                    placeholder="e.g., Read 5 Hardcover Award-Winning Novels"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                    Target Count
                  </label>
                  <input
                    type="number"
                    value={newChallengeTarget}
                    onChange={(e) => setNewChallengeTarget(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#1f1d1a] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Challenge</span>
                </button>
              </form>
            </div>

            {/* Library Data Backup & Export Panel */}
            <div className="p-5 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5] dark:border-[#38332c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#15803d]" />
                  <span>Library Data Portability & Data Backup</span>
                </h3>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 max-w-2xl">
                  Download your entire BookForest library database as a JSON backup or CSV spreadsheet to preserve your reading history, ratings, quotes, and physical book inventory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => exportBookForestJSON(bookForestEntries)}
                  className="px-4 py-2.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-2 border border-[#d4a373]/50 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportBookForestCSV(bookForestEntries)}
                  className="px-4 py-2.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-2 border border-[#d4a373]/50 shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download CSV Spreadsheet</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: SITE ANNOUNCEMENTS */}
      {activeTab === 'site' && (
        <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-6 sm:p-8 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-6 text-xs">
          <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
            Site Hero Banner & Announcements
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                Featured Hero Announcement Text
              </label>
              <input
                type="text"
                value={heroAnnouncement}
                onChange={(e) => setHeroAnnouncement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] outline-none"
              />
            </div>

            <div className="p-4 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <span className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm block">
                Announcement Banner Live Preview
              </span>
              <div className="p-3 bg-[#2a2724] text-[#fffef2] rounded-xl text-xs flex items-center justify-between">
                <span>📢 {heroAnnouncement}</span>
                <span className="text-xs text-[#d4a373] font-handwriting">Live</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Saved site announcement banner settings!')}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] text-[#fffef2] flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Announcement</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
