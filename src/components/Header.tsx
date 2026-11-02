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
  X,
  Bell,
  CheckCheck,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { api } from '../utils/api';

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

  // Unified Search State
  const [searchResults, setSearchResults] = useState<{
    books: any[];
    magazine: any[];
    lessons: any[];
    writingProjects: any[];
    journal: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchAll(searchQuery.trim());
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.warn('Search query error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load notifications if authenticated
  useEffect(() => {
    if (isLoggedIn) {
      api.getNotifications().then((res) => {
        if (Array.isArray(res)) setNotifications(res);
      }).catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.warn('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
              <span className="font-bold text-base tracking-wider font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                STORIZINE
              </span>
            </div>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hidden md:block">
              A Magazine of Stories
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


        {/* Unified Search Input & Live Dropdown */}
        <div className="relative hidden lg:block w-48 xl:w-64" ref={searchContainerRef}>
          <Search className="w-3.5 h-3.5 text-[#2a2724]/40 dark:text-[#f5f2e6]/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stories, lessons, books..."
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim().length >= 2 && searchResults) setShowSearchDropdown(true);
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] placeholder:text-[#2a2724]/40 dark:placeholder:text-[#f5f2e6]/40 outline-none focus:ring-2 focus:ring-[#d4a373]/50 transition-all"
          />
          {isSearching && (
            <Loader2 className="w-3.5 h-3.5 text-[#d4a373] animate-spin absolute right-2.5 top-2.5" />
          )}

          {/* Live Search Floating Popover */}
          {showSearchDropdown && searchResults && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl z-50 p-3 max-h-[75vh] overflow-y-auto space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-[#ebd9c5]/50 dark:border-[#38332c]/50 text-[11px] font-bold text-[#b07843] dark:text-[#d4a373]">
                <span>Search Results for "{searchQuery}"</span>
                <button
                  onClick={() => setShowSearchDropdown(false)}
                  className="text-xs text-[#2a2724]/50 dark:text-[#f5f2e6]/50 hover:text-red-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Books Section */}
              {searchResults.books && searchResults.books.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a2724]/50 dark:text-[#f5f2e6]/50 mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#d4a373]" />
                    <span>Books &amp; Library ({searchResults.books.length})</span>
                  </p>
                  <div className="space-y-1">
                    {searchResults.books.slice(0, 4).map((book: any) => (
                      <div
                        key={book.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/read`);
                        }}
                        className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] cursor-pointer transition-colors"
                      >
                        {book.cover_url ? (
                          <img src={book.cover_url} alt="" className="w-7 h-10 object-cover rounded shadow-xs shrink-0" />
                        ) : (
                          <div className="w-7 h-10 bg-[#d4a373]/20 rounded flex items-center justify-center shrink-0 text-xs">📖</div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6] truncate">{book.title}</p>
                          <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate">{book.author || 'Unknown'} • {book.genre}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Magazine Section */}
              {searchResults.magazine && searchResults.magazine.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a2724]/50 dark:text-[#f5f2e6]/50 mb-1.5 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#d4a373]" />
                    <span>Magazine Articles ({searchResults.magazine.length})</span>
                  </p>
                  <div className="space-y-1">
                    {searchResults.magazine.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/magazine`);
                        }}
                        className="p-2 rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] truncate">{item.title}</p>
                        <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate">By {item.author_name} • {item.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academy Lessons Section */}
              {searchResults.lessons && searchResults.lessons.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a2724]/50 dark:text-[#f5f2e6]/50 mb-1.5 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#d4a373]" />
                    <span>Academy Lessons ({searchResults.lessons.length})</span>
                  </p>
                  <div className="space-y-1">
                    {searchResults.lessons.slice(0, 3).map((lesson: any) => (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/learn`);
                        }}
                        className="p-2 rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] truncate">{lesson.title}</p>
                        <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate">{lesson.category} • {lesson.level} • {lesson.estimated_minutes}m</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authenticated Writing & Journal */}
              {searchResults.writingProjects && searchResults.writingProjects.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2a2724]/50 dark:text-[#f5f2e6]/50 mb-1.5 flex items-center gap-1">
                    <Feather className="w-3 h-3 text-[#d4a373]" />
                    <span>My Studio Projects ({searchResults.writingProjects.length})</span>
                  </p>
                  <div className="space-y-1">
                    {searchResults.writingProjects.slice(0, 2).map((proj: any) => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(`/write`);
                        }}
                        className="p-2 rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] cursor-pointer transition-colors"
                      >
                        <p className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] truncate">{proj.title}</p>
                        <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate">{proj.format} • {proj.word_count || 0} words</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {(!searchResults.books?.length &&
                !searchResults.magazine?.length &&
                !searchResults.lessons?.length &&
                !searchResults.writingProjects?.length) && (
                <div className="py-6 text-center text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  No matching literary records found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Notifications Bell (Step 15) */}
          {isLoggedIn && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-[#2a2724]/70 hover:text-[#2a2724] dark:text-[#f5f2e6]/70 dark:hover:text-[#f5f2e6] rounded-xl hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-[#d4a373]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4a373] text-[#181614] text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Floating Card */}
              {isNotifOpen && (
                <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-80 max-h-[80vh] rounded-2xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl z-50 p-3 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-2 pb-1.5 border-b border-[#ebd9c5]/40 dark:border-[#38332c]/40">
                    <span className="font-bold font-serif text-xs text-[#2a2724] dark:text-[#f5f2e6]">Notifications</span>
                    <span className="text-[10px] text-[#b07843] dark:text-[#d4a373] font-bold">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1">
                    {notifications.length === 0 ? (
                      <p className="py-6 text-center text-xs text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.link) {
                              setIsNotifOpen(false);
                              navigate(notif.link);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs transition-colors flex items-start justify-between gap-2 ${
                            notif.isRead
                              ? 'bg-transparent border-transparent opacity-75'
                              : 'bg-[#f5f1e3]/80 dark:bg-[#25221e]/80 border-[#ebd9c5] dark:border-[#38332c]'
                          } ${notif.link ? 'cursor-pointer hover:bg-[#ebd9c5]/40 dark:hover:bg-[#2e2a25]' : ''}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#2a2724] dark:text-[#f5f2e6] text-[11px] leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-[10px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                          {!notif.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              title="Mark as read"
                              className="p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#b07843] dark:text-[#d4a373] hover:text-[#2a2724] dark:hover:text-[#f5f2e6] rounded-md transition-colors shrink-0"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
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

                    <Link
                      to="/account/audit"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
                      <span>Audit Trail &amp; System Health</span>
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
        <div className="lg:hidden border-t border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#2a2724]/40 dark:text-[#f5f2e6]/40 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search books, stories, lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] text-[#2a2724] dark:text-[#f5f2e6] outline-none focus:ring-2 focus:ring-[#d4a373]/50 transition-all min-h-[44px]"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-[#d4a373] animate-spin absolute right-3.5 top-3" />
            )}
          </div>

          {/* Mobile Quick Search Results Preview */}
          {searchQuery.trim().length >= 2 && searchResults && (
            <div className="p-3 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/60 dark:border-[#38332c]/60 space-y-2">
              <div className="text-[11px] font-bold text-[#b07843] dark:text-[#d4a373]">
                Search Previews for "{searchQuery}"
              </div>
              {searchResults.books?.slice(0, 3).map((b: any) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/read');
                  }}
                  className="p-2 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5]/40 flex items-center gap-2 cursor-pointer text-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#d4a373] shrink-0" />
                  <span className="font-bold truncate text-[#2a2724] dark:text-[#f5f2e6]">{b.title}</span>
                  <span className="text-[10px] text-[#2a2724]/60 ml-auto shrink-0">Read →</span>
                </div>
              ))}
              {searchResults.magazine?.slice(0, 2).map((m: any) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/magazine');
                  }}
                  className="p-2 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5]/40 flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#d4a373] shrink-0" />
                  <span className="font-bold truncate text-[#2a2724] dark:text-[#f5f2e6]">{m.title}</span>
                  <span className="text-[10px] text-[#2a2724]/60 ml-auto shrink-0">Story →</span>
                </div>
              ))}
            </div>
          )}

          {/* Main Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                    link.active
                      ? 'bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] border border-[#d4a373]/40'
                      : 'text-[#2a2724]/80 dark:text-[#f5f2e6]/80 hover:bg-[#f5f1e3] dark:hover:bg-[#221f1c]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#d4a373]" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[#ebd9c5] dark:border-[#38332c] pt-2 space-y-2">
            {isLoggedIn ? (
              <div className="space-y-1">
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] min-h-[44px]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#d4a373]" />
                  <span>Account Stats &amp; Profile ({authorName})</span>
                </Link>

                <Link
                  to="/account/audit"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#f5f1e3] dark:hover:bg-[#25221e] min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
                  <span>System Health &amp; Audit Trail</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold min-h-[44px] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-xs font-bold rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 shadow-xs cursor-pointer min-h-[44px]"
              >
                <Lock className="w-4 h-4" />
                <span>Writer Access Sign In</span>
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
