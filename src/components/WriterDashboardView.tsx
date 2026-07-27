import React, { useState } from 'react';
import {
  AuthorProfile,
  PublishedBook,
  UpcomingBook,
  BookForestEntry,
  WritingStage,
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
} from 'lucide-react';

interface WriterDashboardViewProps {
  author: AuthorProfile;
  onUpdateAuthor: (updated: AuthorProfile) => void;
  publishedBooks: PublishedBook[];
  onUpdatePublishedBooks: (books: PublishedBook[]) => void;
  upcomingBooks: UpcomingBook[];
  onUpdateUpcomingBooks: (books: UpcomingBook[]) => void;
  bookForestEntries: BookForestEntry[];
  onOpenAddPortfolioModal: () => void;
  onOpenAddBookForestModal: () => void;
}

export const WriterDashboardView: React.FC<WriterDashboardViewProps> = ({
  author,
  onUpdateAuthor,
  publishedBooks,
  onUpdatePublishedBooks,
  upcomingBooks,
  onUpdateUpcomingBooks,
  bookForestEntries,
  onOpenAddPortfolioModal,
  onOpenAddBookForestModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'published' | 'upcoming' | 'site'>('profile');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Profile form local state
  const [profileForm, setProfileForm] = useState<AuthorProfile>({ ...author });

  // Currently editing book state
  const [editingPublished, setEditingPublished] = useState<PublishedBook | null>(null);
  const [editingUpcoming, setEditingUpcoming] = useState<UpcomingBook | null>(null);

  // Site banner state
  const [heroAnnouncement, setHeroAnnouncement] = useState<string>(
    'New Release "The Chronos Whisperer" now available in Hardcover & Special Editions'
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddPortfolioModal}
            className="px-4 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Author Book</span>
          </button>

          <button
            onClick={onOpenAddBookForestModal}
            className="px-4 py-2.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/50 font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Add BookForest Entry</span>
          </button>
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

                <div className="flex items-center space-x-2 shrink-0">
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

                <div className="flex items-center space-x-2 shrink-0">
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
                    <label className="block font-bold mb-1">Teaser Quote</label>
                    <input
                      type="text"
                      value={editingUpcoming.teaserQuote}
                      onChange={(e) => setEditingUpcoming({ ...editingUpcoming, teaserQuote: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] bg-[#fbf9ee] dark:bg-[#181614] outline-none font-serif"
                    />
                  </div>

                  <div className="pt-3 flex justify-end space-x-2">
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
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SITE ANNOUNCEMENTS */}
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
