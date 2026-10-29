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
  Compass,
  Award,
  Send,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isHomeActive = currentPath === '/' || currentPath === '/app' || currentPath === '/home';
  const isReadActive = currentPath.startsWith('/read') || currentPath.startsWith('/bookforest');
  const isWriteActive = currentPath.startsWith('/write');
  const isLearnActive = currentPath.startsWith('/learn');
  const isMagazineActive = currentPath.startsWith('/magazine') || currentPath.startsWith('/storizine');
  const isPublishActive = currentPath.startsWith('/publish');
  const isMySpaceActive = currentPath.startsWith('/me') || currentPath.startsWith('/account');

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

  // Close menus when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: BookOpen, active: isHomeActive },
    { to: '/read', label: 'Read', icon: Library, active: isReadActive },
    { to: '/write', label: 'Write', icon: Feather, active: isWriteActive },
    { to: '/learn', label: 'Learn', icon: Award, active: isLearnActive },
    { to: '/magazine', label: 'Magazine', icon: Compass, active: isMagazineActive },
    { to: '/publish', label: 'Publish', icon: Send, active: isPublishActive },
    { to: '/me', label: 'My Space', icon: User, active: isMySpaceActive },
  ];

  return (
    <header
      className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-[#181614]/90 border-[#2e2a25] text-[#f5f2e6]'
          : 'bg-[#fffef2]/90 border-[#ebd9c5] text-[#2a2724]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center space-x-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-[#2a2724] dark:bg-[#2a2520] flex items-center justify-center text-[#d4a373] shadow-xs border border-[#d4a373]/30">
            <Feather className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                Storizine
              </span>
              <span className="text-[#d4a373] text-xs font-serif">&amp; BookForest</span>
            </div>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hidden md:block">
              Unified Literary Platform
            </p>
          </div>
        </Link>

        {/* Desktop Primary Hub Navigation Bar */}
        <nav className="hidden lg:flex items-center p-1 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-x-0.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  link.active
                    ? 'bg-[#2a2724] dark:bg-[#181614] text-[#d4a373] shadow-xs border border-[#d4a373]/40'
                    : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#d4a373]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>


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
                  isMySpaceActive || isUserMenuOpen
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

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#d4a373]" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] px-4 py-3 space-y-1 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  link.active
                    ? 'bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] border border-[#d4a373]/40'
                    : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:bg-[#f5f1e3] dark:hover:bg-[#221f1c]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#d4a373]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
