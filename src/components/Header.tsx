import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Moon,
  Sun,
  Search,
  Library,
  Feather,
  LayoutDashboard,
  Lock,
  LogOut,
  ChevronDown,
  User,
  Settings,
  BookMarked,
  Users,
  Quote,
  FileText,
  Layers,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  authorName: string;
  avatarUrl?: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isLoggedIn,
  onOpenLoginModal,
  onLogout,
  authorName,
  avatarUrl,
  darkMode,
  setDarkMode,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHomeActive = currentPath === '/' || currentPath === '/home';
  const isStorizineActive = currentPath.startsWith('/storizine');
  const isBookForestActive = currentPath.startsWith('/bookforest');
  const isAccountActive = currentPath.startsWith('/account') || currentPath.startsWith('/dashboard');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-[#181614]/90 border-[#2e2a25] text-[#f5f2e6]'
          : 'bg-[#fffef2]/90 border-[#ebd9c5] text-[#2a2724]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Author Brand */}
        <Link to="/" className="flex items-center space-x-3 shrink-0 hover:opacity-90 transition-opacity">
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
              Home &amp; BookForest Catalog
            </p>
          </div>
        </Link>

        {/* Center Main Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c]">
          <Link
            id="btn-tab-portfolio"
            to="/"
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isHomeActive
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#8c5627] dark:text-[#d4a373] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Home Page</span>
          </Link>

          <Link
            id="btn-tab-storizine"
            to="/storizine"
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isStorizineActive
                ? 'bg-[#2a2724] text-[#d4a373] shadow-xs border border-[#d4a373]/40'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>STORIZINE</span>
          </Link>

          <Link
            id="btn-tab-bookforest"
            to="/bookforest"
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isBookForestActive
                ? 'bg-[#fffef2] dark:bg-[#181614] text-[#15803d] dark:text-[#4ade80] shadow-xs border border-[#ebd9c5] dark:border-[#38332c]'
                : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>BookForest</span>
          </Link>
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
            /* User Account Dropdown Menu */
            <div className="relative" ref={menuRef}>
              <button
                id="btn-user-menu-trigger"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isAccountActive || isUserMenuOpen
                    ? 'bg-[#2a2724] text-[#d4a373] border-[#d4a373]/50 shadow-xs'
                    : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5]/50 border-[#ebd9c5] dark:border-[#38332c]'
                }`}
                aria-expanded={isUserMenuOpen}
                aria-label="User Account Menu"
              >
                {/* User Avatar Circle */}
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#d4a373]/50 bg-[#fef08a] text-[#ca8a04] flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={authorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-[10px] font-serif">{authorName.charAt(0)}</span>
                  )}
                </div>

                <span className="hidden sm:inline font-serif tracking-tight">{authorName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#d4a373] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Dropdown Card */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                  
                  {/* Account Header info */}
                  <div className="px-3 py-2 bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 rounded-xl border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-0.5">
                    <p className="font-bold font-serif text-sm text-[#2a2724] dark:text-[#f5f2e6]">{authorName}</p>
                    <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 flex items-center gap-1 font-handwriting text-[#b07843] dark:text-[#d4a373]">
                      <span>✓ Verified Author Account</span>
                    </p>
                  </div>

                  {/* Account Links */}
                  <div className="pt-1 space-y-0.5 text-xs font-bold">
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#d4a373]" />
                      <span>Account Stats &amp; Goals</span>
                    </Link>

                    <Link
                      to="/storizine"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-[#d4a373]" />
                      <span>Manage Writing &amp; Catalog</span>
                    </Link>

                    <Link
                      to="/account/bookshelf"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <Library className="w-4 h-4 text-[#15803d] dark:text-[#4ade80]" />
                      <span>Personal Bookshelf</span>
                    </Link>

                    <Link
                      to="/account/clubs"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#d4a373]" />
                      <span>Reading Clubs &amp; Lounge</span>
                    </Link>

                    <Link
                      to="/account/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#d4a373]" />
                      <span>Profile &amp; Account Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-[#ebd9c5] dark:border-[#38332c] my-1" />

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>

                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 transition-colors shadow-xs cursor-pointer"
              title="Login as Author / Writer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Writer Access</span>
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton />

          <button
            id="btn-toggle-darkmode"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-[#2a2724]/70 hover:text-[#2a2724] dark:text-[#f5f2e6]/70 dark:hover:text-[#f5f2e6] rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#d4a373]" /> : <Moon className="w-4 h-4 text-[#b07843]" />}
          </button>

        </div>

      </div>
    </header>
  );
};
