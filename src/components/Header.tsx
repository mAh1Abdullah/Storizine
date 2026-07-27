import React from 'react';
import { BookOpen, Moon, Sun, Search, Library, Feather, LayoutDashboard, Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  activeMainSection: 'portfolio' | 'storizine' | 'bookforest' | 'dashboard';
  setActiveMainSection: (sec: 'portfolio' | 'storizine' | 'bookforest' | 'dashboard') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  authorName: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeMainSection,
  setActiveMainSection,
  searchQuery,
  setSearchQuery,
  isLoggedIn,
  onOpenLoginModal,
  onLogout,
  authorName,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
      darkMode 
        ? 'bg-[#181614]/90 border-[#2e2a25] text-[#f5f2e6]' 
        : 'bg-[#fffef2]/90 border-[#ebd9c5] text-[#2a2724]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Author Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#2a2724] dark:bg-[#2a2520] flex items-center justify-center text-[#d4a373] shadow-sm border border-[#d4a373]/30">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                {authorName}
              </span>
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-[#d4a373]/15 text-[#b07843] dark:text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
                Warm Collector
              </span>
            </div>
            <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hidden sm:block">
              Front Page & BookForest Catalog
            </p>
          </div>
        </div>

        {/* Center Main Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
          <button
            id="btn-tab-portfolio"
            onClick={() => setActiveMainSection('portfolio')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMainSection === 'portfolio'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#8c5627] dark:text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Front Page</span>
          </button>

          <button
            id="btn-tab-storizine"
            onClick={() => setActiveMainSection('storizine')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMainSection === 'storizine'
                ? 'bg-[#2a2724] text-[#d4a373] shadow-xs border border-[#d4a373]/40'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>STORIZINE</span>
          </button>

          <button
            id="btn-tab-bookforest"
            onClick={() => setActiveMainSection('bookforest')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMainSection === 'bookforest'
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#15803d] dark:text-[#4ade80] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>BookForest</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative hidden lg:block w-40 xl:w-52">
          <Search className="w-3.5 h-3.5 text-[#2a2724]/40 dark:text-[#f5f2e6]/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search books, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] placeholder:text-[#2a2724]/40 dark:placeholder:text-[#f5f2e6]/40 outline-none focus:ring-2 focus:ring-[#d4a373]/50 transition-all"
          />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {isLoggedIn ? (
            <>
              <button
                id="btn-tab-dashboard"
                onClick={() => setActiveMainSection('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeMainSection === 'dashboard'
                    ? 'bg-[#2a2724] text-[#d4a373] shadow-xs border border-[#d4a373]/40'
                    : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5]/50 border border-[#ebd9c5] dark:border-[#38332c]'
                }`}
                title="Go to Writer Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#d4a373]" />
                <span className="hidden sm:inline">Writer Dashboard</span>
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#f5f2e6]/80 hover:text-[#f5f2e6] border border-[#d4a373]/30 transition-all shadow-xs"
                title="Sign out of Writer Dashboard"
              >
                <LogOut className="w-3.5 h-3.5 text-[#d4a373]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 transition-colors shadow-xs"
              title="Login as Author / Writer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Writer Access</span>
            </button>
          )}

          <button
            id="btn-toggle-darkmode"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-[#2a2724]/70 hover:text-[#2a2724] dark:text-[#f5f2e6]/70 dark:hover:text-[#f5f2e6] rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#d4a373]" /> : <Moon className="w-4 h-4 text-[#b07843]" />}
          </button>

        </div>

      </div>
    </header>
  );
};
