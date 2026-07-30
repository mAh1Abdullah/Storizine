import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
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
  Globe,
  Clock,
  Layout,
  FileText,
  Award,
  Target,
  Download,
  BarChart2,
  DollarSign,
  Check,
  User,
  Camera,
  Upload,
  Library,
  Settings as SettingsIcon,
  ShieldCheck,
  BookMarked,
  Layers,
  Filter,
} from 'lucide-react';
import { exportBookForestJSON, exportBookForestCSV } from '../utils/exportUtils';
import { ReaderGraphSection } from './ReaderGraphSection';
import { ClubsSection } from './ClubsSection';
import { GoodreadsQuotesSection } from './GoodreadsQuotesSection';

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
  onSaveBookForestEntry?: (entry: BookForestEntry) => void;
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
  onSaveBookForestEntry,
  onOpenAddPortfolioModal,
  onOpenAddBookForestModal,
}) => {
  const navigate = useNavigate();
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Profile form local state
  const [profileForm, setProfileForm] = useState<AuthorProfile>({ ...author });

  // Social link state
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  // Bookshelf filter state
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All Locations');

  // Reading Goal local form
  const defaultGoal: ReadingGoal = {
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
  };

  const [goalForm, setGoalForm] = useState<ReadingGoal>(defaultGoal);

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

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '/account');
      showToast('Profile URL copied to clipboard!');
    } else {
      showToast('Profile URL: ' + window.location.origin + '/account');
    }
  };

  // Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAuthor(profileForm);
    showToast('Author profile settings saved successfully!');
  };

  // Social link handlers
  const handleAddSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialPlatform.trim() || !newSocialUrl.trim()) return;
    const updatedLinks = [...(profileForm.socialLinks || []), { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() }];
    const updatedProfile = { ...profileForm, socialLinks: updatedLinks };
    setProfileForm(updatedProfile);
    onUpdateAuthor(updatedProfile);
    setNewSocialPlatform('');
    setNewSocialUrl('');
    showToast(`Added social profile for ${newSocialPlatform}`);
  };

  const handleDeleteSocialLink = (index: number) => {
    const updatedLinks = (profileForm.socialLinks || []).filter((_, i) => i !== index);
    const updatedProfile = { ...profileForm, socialLinks: updatedLinks };
    setProfileForm(updatedProfile);
    onUpdateAuthor(updatedProfile);
    showToast('Removed social link.');
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
    showToast('Home Page visibility updated!');
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
    showToast('Home Page visibility updated!');
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

  const dummyImport = (entry: BookForestEntry) => {
    if (onSaveBookForestEntry) {
      onSaveBookForestEntry(entry);
      showToast(`Imported "${entry.title}" to BookForest!`);
    }
  };

  // Filter books for Bookshelf tab
  const filteredBookshelfEntries = bookForestEntries.filter((b) => {
    if (selectedLocationFilter === 'All Locations') return true;
    return b.collectionLocation === selectedLocationFilter;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a2724] text-[#f5f2e6] border border-[#d4a373] px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#d4a373]" />
          <span className="font-bold text-xs">{savedSuccess}</span>
        </div>
      )}

      {/* Centered Profile Header (Matching User's Reference Image) */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pt-4 pb-2">
        
        {/* Large Circular Emblem / Avatar */}
        <div 
          className="relative group cursor-pointer"
          onClick={() => navigate('/account/settings')}
          title="Click to edit profile & avatar settings"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#fffef2] dark:border-[#181614] shadow-xl bg-[#fef08a] text-[#ca8a04] dark:bg-[#25221e] flex items-center justify-center">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#fef08a] text-[#854d0e] flex items-center justify-center text-2xl font-bold font-serif">
                <Feather className="w-8 h-8 text-[#ca8a04]" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Author Title / Name */}
        <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#2a2724] dark:text-[#f5f2e6] tracking-tight">
          {author.name}
        </h1>

        {/* Subtitle Blue Link */}
        <a
          href="#network"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 font-sans tracking-wide transition-colors"
        >
          View network
        </a>

        {/* Action Icon Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={handleShareProfile}
            className="p-2 rounded-full border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#221f1c] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] transition-colors shadow-xs cursor-pointer"
            title="Share Account Profile"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <NavLink
            to="/account/settings"
            className="p-2 rounded-full border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#221f1c] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] transition-colors shadow-xs cursor-pointer"
            title="Profile Settings & Bio"
          >
            <Edit3 className="w-4 h-4" />
          </NavLink>
        </div>
      </div>

      {/* Centered Minimalist Navigation Tabs Bar */}
      <div className="flex items-center justify-center border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pt-2 gap-6 sm:gap-10 overflow-x-auto text-xs font-medium">
        <NavLink
          to="/account"
          end
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Stats</span>
        </NavLink>

        <NavLink
          to="/account/bookshelf"
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Bookshelf</span>
        </NavLink>

        <NavLink
          to="/account/clubs"
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Clubs</span>
        </NavLink>

        <NavLink
          to="/account/reviews"
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Reviews</span>
        </NavLink>

        <NavLink
          to="/account/posts"
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Posts</span>
        </NavLink>

        <NavLink
          to="/account/settings"
          className={({ isActive }) =>
            `pb-3 px-1 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-b-2 border-[#15803d] dark:border-[#4ade80] font-bold text-[#2a2724] dark:text-[#f5f2e6]'
                : 'text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`
          }
        >
          <span>Settings</span>
        </NavLink>
      </div>

      {/* Main Content Container Card */}
      <div className="bg-[#fbf9ee]/60 dark:bg-[#221f1c]/60 p-6 sm:p-8 rounded-3xl border border-[#ebd9c5]/60 dark:border-[#38332c]/60 shadow-xs">
        <Routes>
          
          {/* TAB 1: STATS */}
          <Route
            index
            element={
              <div className="space-y-8 text-xs">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
                      Annual Target
                    </span>
                    <div className="text-2xl font-serif text-[#b07843] dark:text-[#d4a373] font-bold">
                      {goalForm.completedBooks} / {goalForm.targetBooks} Books
                    </div>
                  </div>

                  <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
                      Pages Read
                    </span>
                    <div className="text-2xl font-serif text-[#15803d] dark:text-[#4ade80] font-bold">
                      {(goalForm.completedPages || 0).toLocaleString()} Pages
                    </div>
                  </div>

                  <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
                      Active Challenges
                    </span>
                    <div className="text-2xl font-serif text-[#b07843] dark:text-[#d4a373] font-bold">
                      {(goalForm.challenges || []).filter(c => c.completed).length} / {(goalForm.challenges || []).length} Completed
                    </div>
                  </div>

                  <div className="p-4 bg-[#fffef2] dark:bg-[#181614] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-1">
                    <span className="text-[11px] font-bold uppercase text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-handwriting">
                      Collection Value
                    </span>
                    <div className="text-2xl font-serif text-emerald-600 dark:text-emerald-400 font-bold">
                      ${bookForestEntries.reduce((acc, curr) => acc + (curr.purchasePrice || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Reader Analytics Graph Section */}
                <ReaderGraphSection entries={bookForestEntries} readingGoal={goalForm} />

                {/* Goal & Challenge Form Controls */}
                <form onSubmit={handleSaveGoal} className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                    <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#d4a373]" />
                      <span>Configure Annual Reading Goals</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleSyncCompletedWithBookForest}
                      className="px-3 py-1.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 text-[11px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Sync with BookForest</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Target Year</label>
                      <input
                        type="number"
                        value={goalForm.year}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Target Books</label>
                      <input
                        type="number"
                        value={goalForm.targetBooks}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetBooks: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Completed Books</label>
                      <input
                        type="number"
                        value={goalForm.completedBooks}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, completedBooks: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Target Pages</label>
                      <input
                        type="number"
                        value={goalForm.targetPages || 8000}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetPages: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Completed Pages</label>
                      <input
                        type="number"
                        value={goalForm.completedPages || 0}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, completedPages: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Goal Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            }
          />

          {/* Redirect old /lists tab to /storizine */}
          <Route path="lists" element={<Navigate to="/storizine" replace />} />

          {/* TAB 3: BOOKSHELF */}
          <Route
            path="bookshelf"
            element={
              <div className="space-y-6 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#15803d]/15 text-[#15803d] dark:text-[#4ade80] font-handwriting">
                      Personal Library &amp; Editions Tracker
                    </span>
                    <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6] pt-1">
                      Personal Bookshelf &amp; Collections
                    </h2>
                    <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                      Track physical shelves, special sprayed edges, signed copies, Kindle/Audible libraries, and wishlist items.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onOpenAddBookForestModal}
                      className="px-4 py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] text-[#fffef2] font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Book to Shelf</span>
                    </button>
                  </div>
                </div>

                {/* Filter by Collection Location */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {['All Locations', 'Physical Main Bookshelf', 'Physical Special Shelf', 'Kindle Library', 'Audible', 'Wishlist / Not Owned'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocationFilter(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                        selectedLocationFilter === loc
                          ? 'bg-[#2a2724] text-[#d4a373] border-[#d4a373]/40 shadow-xs'
                          : 'bg-[#fffef2] dark:bg-[#181614] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border-[#ebd9c5] dark:border-[#38332c] hover:bg-[#f5f1e3]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Visual Bookshelf Display Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredBookshelfEntries.map((book) => (
                    <div
                      key={book.id}
                      className="group relative bg-[#fffef2] dark:bg-[#181614] rounded-2xl p-3 border border-[#ebd9c5] dark:border-[#38332c] shadow-xs flex flex-col justify-between space-y-2 hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-sm border border-[#ebd9c5]/60">
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#2a2724]/80 text-[#d4a373] text-[10px] font-bold font-handwriting backdrop-blur-xs">
                          ★ {book.userRating}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif font-bold text-xs text-[#2a2724] dark:text-[#f5f2e6] line-clamp-1">{book.title}</h4>
                        <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 line-clamp-1">{book.author}</p>
                        
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ebd9c5]/40 dark:bg-[#38332c] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 font-mono line-clamp-1">
                            {book.collectionLocation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#ebd9c5]/40 dark:border-[#38332c]/40">
                        <span className="text-[10px] font-bold text-[#15803d] dark:text-[#4ade80] capitalize">
                          {book.readingStatus}
                        </span>
                        {onEditBookForestEntry && (
                          <button
                            onClick={() => onEditBookForestEntry(book)}
                            className="p-1 text-[#2a2724]/60 hover:text-[#2a2724] dark:text-[#f5f2e6]/60 dark:hover:text-[#f5f2e6] cursor-pointer"
                            title="Edit Entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />

          {/* TAB 4: CLUBS */}
          <Route
            path="clubs"
            element={
              <div className="space-y-6">
                <ClubsSection onImportToBookForest={dummyImport} />
              </div>
            }
          />

          {/* TAB 5: REVIEWS */}
          <Route
            path="reviews"
            element={
              <div className="space-y-8">
                <GoodreadsQuotesSection onImportToBookForest={dummyImport} />
              </div>
            }
          />

          {/* TAB 6: POSTS */}
          <Route
            path="posts"
            element={
              <div className="space-y-6 text-xs">
                <div className="p-6 rounded-3xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
                  <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                    Site Hero Announcements &amp; Posts
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">
                        Featured Hero Announcement Banner
                      </label>
                      <input
                        type="text"
                        value={heroAnnouncement}
                        onChange={(e) => setHeroAnnouncement(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>

                    <div className="p-4 bg-[#f5f1e3] dark:bg-[#25221e] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
                      <span className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm block">
                        Live Banner Preview
                      </span>
                      <div className="p-3 bg-[#2a2724] text-[#fffef2] rounded-xl text-xs flex items-center justify-between">
                        <span>📢 {heroAnnouncement}</span>
                        <span className="text-xs text-[#d4a373] font-handwriting">Live</span>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('Saved announcement banner!')}
                      className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] text-[#fffef2] flex items-center space-x-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Post Announcement</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          />

          {/* TAB 7: SETTINGS (PROFILE & ACCOUNT SETTINGS) */}
          <Route
            path="settings"
            element={
              <div className="space-y-6 text-xs">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Identity Card */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
                      <div>
                        <h2 className="font-serif font-normal text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
                          Profile &amp; Account Settings
                        </h2>
                        <p className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 text-xs mt-0.5">
                          Update name, pen name, accolades, full bio, avatar image, and featured quotes.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center space-x-2 shadow-md cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Profile Settings</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Public Author Name</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Pen Name / Variant</label>
                        <input
                          type="text"
                          value={profileForm.penName || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, penName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Title / Accolades</label>
                        <input
                          type="text"
                          value={profileForm.title}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Full Biography</label>
                        <textarea
                          rows={4}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Avatar Image URL</label>
                        <input
                          type="text"
                          value={profileForm.avatarUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-[#2a2724] dark:text-[#f5f2e6]">Featured Quote</label>
                        <input
                          type="text"
                          value={profileForm.featuredQuote}
                          onChange={(e) => setProfileForm({ ...profileForm, featuredQuote: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none font-serif"
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Social Handles Form */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">Social Media Profiles</h3>
                  <div className="space-y-2">
                    {(profileForm.socialLinks || []).map((link, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#fbf9ee] dark:bg-[#221f1c] flex items-center justify-between border border-[#ebd9c5] dark:border-[#38332c]">
                        <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">{link.platform}: <span className="font-mono font-normal text-[#2a2724]/70 dark:text-[#f5f2e6]/70">{link.url}</span></span>
                        <button type="button" onClick={() => handleDeleteSocialLink(idx)} className="p-1 text-red-600 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddSocialLink} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                    <div className="w-full sm:w-40">
                      <label className="block font-bold mb-1">Platform</label>
                      <input
                        type="text"
                        value={newSocialPlatform}
                        onChange={(e) => setNewSocialPlatform(e.target.value)}
                        placeholder="Substack"
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block font-bold mb-1">URL</label>
                      <input
                        type="text"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none font-mono"
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] font-bold text-xs cursor-pointer">
                      + Add Link
                    </button>
                  </form>
                </div>
              </div>
            }
          />

          <Route path="edit" element={<Navigate to="/account/settings" replace />} />
          <Route path="*" element={<Navigate to="/account" replace />} />
        </Routes>
      </div>

    </div>
  );
};
