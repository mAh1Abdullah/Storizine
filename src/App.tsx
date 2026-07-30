import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { PortfolioView } from './components/PortfolioView';
import { StorizineView } from './components/StorizineView';
import { BookForestView } from './components/BookForestView';
import { WriterDashboardView } from './components/WriterDashboardView';
import { SampleChapterModal } from './components/SampleChapterModal';
import { AddPublishedBookModal } from './components/AddPublishedBookModal';
import { AddBookForestModal } from './components/AddBookForestModal';
import { AICompanionModal } from './components/AICompanionModal';
import { GutenbergClassicsModal } from './components/GutenbergClassicsModal';
import { FableLoungeModal } from './components/FableLoungeModal';
import { OpenLibraryModal } from './components/OpenLibraryModal';
import { StoryGraphModal } from './components/StoryGraphModal';
import { LoginModal } from './components/LoginModal';
import { Lock } from 'lucide-react';

import {
  INITIAL_AUTHOR_PROFILE,
  INITIAL_PUBLISHED_BOOKS,
  INITIAL_UPCOMING_BOOKS,
  INITIAL_BOOK_FOREST,
  INITIAL_READING_GOAL,
} from './data/initialData';
import { STORIZINE_WORKS } from './data/storizineData';

import {
  PublishedBook,
  UpcomingBook,
  BookForestEntry,
  AuthorProfile,
  ReadingGoal,
} from './types';

export function App() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Data states
  const [authorProfile, setAuthorProfile] = useState<AuthorProfile>(INITIAL_AUTHOR_PROFILE);
  const [publishedBooks, setPublishedBooks] = useState<PublishedBook[]>(INITIAL_PUBLISHED_BOOKS);
  const [upcomingBooks, setUpcomingBooks] = useState<UpcomingBook[]>(INITIAL_UPCOMING_BOOKS);
  const [bookForestEntries, setBookForestEntries] = useState<BookForestEntry[]>(INITIAL_BOOK_FOREST);
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>(INITIAL_READING_GOAL);

  // Modal States
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [activeSampleBook, setActiveSampleBook] = useState<PublishedBook | null>(null);

  const [isAddPortfolioModalOpen, setIsAddPortfolioModalOpen] = useState(false);

  const [isAddBookForestModalOpen, setIsAddBookForestModalOpen] = useState(false);
  const [editingBookForestEntry, setEditingBookForestEntry] = useState<BookForestEntry | null>(null);

  const [isAICompanionOpen, setIsAICompanionOpen] = useState(false);
  const [isGutenbergModalOpen, setIsGutenbergModalOpen] = useState(false);
  const [isFableLoungeOpen, setIsFableLoungeOpen] = useState(false);
  const [isOpenLibraryModalOpen, setIsOpenLibraryModalOpen] = useState(false);
  const [isStoryGraphModalOpen, setIsStoryGraphModalOpen] = useState(false);

  // Dark Mode side effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handlers
  const handleOpenSampleChapter = (book: PublishedBook) => {
    setActiveSampleBook(book);
    setIsSampleModalOpen(true);
  };

  const handleAddPublishedBook = (newBook: PublishedBook) => {
    setPublishedBooks([newBook, ...publishedBooks]);
  };

  const handleAddUpcomingBook = (newUpcoming: UpcomingBook) => {
    setUpcomingBooks([newUpcoming, ...upcomingBooks]);
  };

  const handleSaveBookForestEntry = (entry: BookForestEntry) => {
    const existingIndex = bookForestEntries.findIndex((b) => b.id === entry.id);
    if (existingIndex >= 0) {
      const updated = [...bookForestEntries];
      updated[existingIndex] = entry;
      setBookForestEntries(updated);
    } else {
      setBookForestEntries([entry, ...bookForestEntries]);
    }
  };

  const handleDeleteBookForestEntry = (id: string) => {
    setBookForestEntries(bookForestEntries.filter((b) => b.id !== id));
  };

  const handleEditBookForestEntry = (entry: BookForestEntry) => {
    setEditingBookForestEntry(entry);
    setIsAddBookForestModalOpen(true);
  };

  const handleAddRecommendationToWantToRead = (rec: { title: string; author: string; genre: string; blurb: string }) => {
    const newEntry: BookForestEntry = {
      id: `rec-${Date.now()}`,
      title: rec.title,
      author: rec.author,
      genre: rec.genre,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      readingStatus: 'want-to-read',
      userRating: 0,
      dateAdded: new Date().toISOString().split('T')[0],
      reviewComments: `Added from AI Recommendation: ${rec.blurb}`,
      quotesSaved: [],
      tags: ['AI Recommended', rec.genre],
      ownedFormats: [],
      collectionLocation: 'Wishlist / Not Owned',
      readCount: 0,
    };

    setBookForestEntries([newEntry, ...bookForestEntries]);
    setIsAICompanionOpen(false);
    navigate('/bookforest');
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      darkMode 
        ? 'bg-[#181614] text-[#f5f2e6] selection:bg-[#d4a373]/30 selection:text-amber-200' 
        : 'bg-[#fffef2] text-[#2a2724] selection:bg-[#d4a373]/30 selection:text-[#2a2724]'
    }`}>
      
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setIsLoggedIn(false);
          navigate('/');
        }}
        authorName={authorProfile.name}
        avatarUrl={authorProfile.avatarUrl}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main View Area with Routes */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Routes>
          {/* Home Page (formerly Frontpage) */}
          <Route
            path="/"
            element={
              <PortfolioView
                author={authorProfile}
                publishedBooks={publishedBooks}
                upcomingBooks={upcomingBooks}
                onOpenSampleChapter={handleOpenSampleChapter}
                searchQuery={searchQuery}
                onNavigateToStorizine={() => navigate('/storizine')}
              />
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Storizine Page */}
          <Route
            path="/storizine"
            element={
              <StorizineView
                searchQuery={searchQuery}
                publishedBooks={publishedBooks}
                onUpdatePublishedBooks={setPublishedBooks}
                upcomingBooks={upcomingBooks}
                onUpdateUpcomingBooks={setUpcomingBooks}
                isLoggedIn={isLoggedIn}
                onOpenAddPortfolioModal={() => setIsAddPortfolioModalOpen(true)}
                onOpenSampleChapter={handleOpenSampleChapter}
                onOpenFableLounge={() => setIsFableLoungeOpen(true)}
                onOpenGutenbergModal={() => setIsGutenbergModalOpen(true)}
              />
            }
          />

          {/* BookForest Page */}
          <Route
            path="/bookforest"
            element={
              isLoggedIn ? (
                <BookForestView
                  entries={bookForestEntries}
                  readingGoal={readingGoal}
                  onOpenAddModal={() => {
                    setEditingBookForestEntry(null);
                    setIsAddBookForestModalOpen(true);
                  }}
                  onEditEntry={handleEditBookForestEntry}
                  onDeleteEntry={handleDeleteBookForestEntry}
                  onSaveEntry={handleSaveBookForestEntry}
                  onOpenAICompanion={() => setIsAICompanionOpen(true)}
                  onOpenGutenbergModal={() => setIsGutenbergModalOpen(true)}
                  onOpenFableLounge={() => setIsFableLoungeOpen(true)}
                  onOpenOpenLibraryModal={() => setIsOpenLibraryModalOpen(true)}
                  onOpenStoryGraphModal={() => setIsStoryGraphModalOpen(true)}
                  searchQuery={searchQuery}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginModal={() => setIsLoginModalOpen(true)}
                />
              ) : (
                <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-12 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] text-center max-w-lg mx-auto my-12 space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-[#d4a373]/20 border border-[#d4a373]/40 flex items-center justify-center text-[#d4a373] mx-auto">
                    <Lock className="w-6 h-6 text-[#d4a373]" />
                  </div>
                  <h2 className="text-2xl font-serif text-[#2a2724] dark:text-[#f5f2e6]">Authentication Required</h2>
                  <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                    The BookForest library, shelves, reading goals, quotes studio, and collection features are strictly accessible after logging in. Please sign in to access your personal shelf.
                  </p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] text-xs shadow-md transition-all cursor-pointer"
                  >
                    Sign In to Access BookForest
                  </button>
                </div>
              )
            }
          />

          {/* Author Account Portal Page */}
          <Route
            path="/account/*"
            element={
              isLoggedIn ? (
                <WriterDashboardView
                  author={authorProfile}
                  onUpdateAuthor={setAuthorProfile}
                  publishedBooks={publishedBooks}
                  onUpdatePublishedBooks={setPublishedBooks}
                  upcomingBooks={upcomingBooks}
                  onUpdateUpcomingBooks={setUpcomingBooks}
                  bookForestEntries={bookForestEntries}
                  readingGoal={readingGoal}
                  onUpdateReadingGoal={setReadingGoal}
                  onEditBookForestEntry={handleEditBookForestEntry}
                  onDeleteBookForestEntry={handleDeleteBookForestEntry}
                  onSaveBookForestEntry={handleSaveBookForestEntry}
                  onOpenAddPortfolioModal={() => setIsAddPortfolioModalOpen(true)}
                  onOpenAddBookForestModal={() => {
                    setEditingBookForestEntry(null);
                    setIsAddBookForestModalOpen(true);
                  }}
                  onOpenGutenbergModal={() => setIsGutenbergModalOpen(true)}
                  onOpenOpenLibraryModal={() => setIsOpenLibraryModalOpen(true)}
                  onOpenStoryGraphModal={() => setIsStoryGraphModalOpen(true)}
                  onOpenFableLounge={() => setIsFableLoungeOpen(true)}
                  onOpenAICompanion={() => setIsAICompanionOpen(true)}
                />
              ) : (
                <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-12 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] text-center max-w-lg mx-auto my-12 space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-[#d4a373]/20 border border-[#d4a373]/40 flex items-center justify-center text-[#d4a373] mx-auto">
                    <Lock className="w-6 h-6 text-[#d4a373]" />
                  </div>
                  <h2 className="text-2xl font-serif text-[#2a2724] dark:text-[#f5f2e6]">Account Portal Authentication Required</h2>
                  <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                    The Account Portal is restricted to the author. Please sign in with your passcode to modify author bio, manage bibliography, update works-in-progress, and edit BookForest catalog entries.
                  </p>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] text-xs shadow-md transition-all cursor-pointer"
                  >
                    Sign In to Account Portal
                  </button>
                </div>
              )
            }
          />
          <Route path="/dashboard/*" element={<Navigate to="/account" replace />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          navigate('/account');
        }}
      />

      {/* Sample Chapter Reader Overlay */}
      <SampleChapterModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        book={activeSampleBook}
      />

      {/* Add Author Book Modal */}
      <AddPublishedBookModal
        isOpen={isAddPortfolioModalOpen}
        onClose={() => setIsAddPortfolioModalOpen(false)}
        onAddPublished={handleAddPublishedBook}
        onAddUpcoming={handleAddUpcomingBook}
      />

      {/* Add / Edit BookForest Entry Modal */}
      <AddBookForestModal
        isOpen={isAddBookForestModalOpen}
        onClose={() => {
          setIsAddBookForestModalOpen(false);
          setEditingBookForestEntry(null);
        }}
        onSave={handleSaveBookForestEntry}
        initialEntry={editingBookForestEntry}
      />

      {/* AI Reading Companion Modal */}
      <AICompanionModal
        isOpen={isAICompanionOpen}
        onClose={() => setIsAICompanionOpen(false)}
        bookForestEntries={bookForestEntries}
        onAddRecommendationToWantToRead={handleAddRecommendationToWantToRead}
      />

      {/* Project Gutenberg Ebooks Modal */}
      <GutenbergClassicsModal
        isOpen={isGutenbergModalOpen}
        onClose={() => setIsGutenbergModalOpen(false)}
        onImportToBookForest={handleSaveBookForestEntry}
      />

      {/* Fable Social Reading Lounge Modal */}
      <FableLoungeModal
        isOpen={isFableLoungeOpen}
        onClose={() => setIsFableLoungeOpen(false)}
        works={STORIZINE_WORKS}
        onImportToBookForest={handleSaveBookForestEntry}
      />

      {/* Open Library Search Modal */}
      <OpenLibraryModal
        isOpen={isOpenLibraryModalOpen}
        onClose={() => setIsOpenLibraryModalOpen(false)}
        onImportToBookForest={handleSaveBookForestEntry}
      />

      {/* The StoryGraph Analytics Modal */}
      <StoryGraphModal
        isOpen={isStoryGraphModalOpen}
        onClose={() => setIsStoryGraphModalOpen(false)}
        entries={bookForestEntries}
      />

      {/* Minimal Warm Collector Footer */}
      <footer className="border-t border-[#ebd9c5] dark:border-[#2e2a25] py-8 text-center text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
        <p className="font-serif text-sm tracking-wide">
          © {new Date().getFullYear()} {authorProfile.name} • <span className="font-handwriting text-base text-[#d4a373] ml-1">Warm Collector Edition</span>
        </p>
      </footer>

    </div>
  );
}

export default App;

