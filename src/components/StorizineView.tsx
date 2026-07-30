import React, { useState, useMemo } from 'react';
import { 
  Feather, 
  Search, 
  BookOpen, 
  Sparkles, 
  ExternalLink, 
  Tag, 
  Filter, 
  Layers, 
  Globe, 
  Flame, 
  ChevronRight, 
  X,
  FileText,
  Compass,
  MapPin,
  Bookmark,
  Users,
  Library,
  Plus,
  Edit3,
  Trash2,
  Save,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { STORIZINE_AUTHOR, STORIZINE_WORKS } from '../data/storizineData';
import { StorizineWork, StorizineCategory, PublishedBook, UpcomingBook } from '../types';

interface StorizineViewProps {
  searchQuery: string;
  publishedBooks?: PublishedBook[];
  onUpdatePublishedBooks?: (books: PublishedBook[]) => void;
  upcomingBooks?: UpcomingBook[];
  onUpdateUpcomingBooks?: (books: UpcomingBook[]) => void;
  isLoggedIn?: boolean;
  onOpenAddPortfolioModal?: () => void;
  onOpenSampleChapter?: (book: PublishedBook) => void;
  onOpenFableLounge?: () => void;
  onOpenGutenbergModal?: () => void;
}

export const StorizineView: React.FC<StorizineViewProps> = ({ 
  searchQuery, 
  publishedBooks = [], 
  onUpdatePublishedBooks,
  upcomingBooks = [],
  onUpdateUpcomingBooks,
  isLoggedIn = false,
  onOpenAddPortfolioModal,
  onOpenSampleChapter,
  onOpenFableLounge,
  onOpenGutenbergModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StorizineCategory | 'All'>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedWork, setSelectedWork] = useState<StorizineWork | null>(null);

  // Editing state for published/upcoming book
  const [editingPublished, setEditingPublished] = useState<PublishedBook | null>(null);
  const [editingUpcoming, setEditingUpcoming] = useState<UpcomingBook | null>(null);

  // Combine static Storizine works with live published & upcoming books
  const combinedWorks = useMemo<StorizineWork[]>(() => {
    const publishedAsWorks: StorizineWork[] = publishedBooks.map((b, idx) => ({
      id: `pub-${b.id}`,
      number: STORIZINE_WORKS.length + idx + 1,
      title: b.title,
      category: (b.genre.toLowerCase().includes('sci-fi') || b.genre.toLowerCase().includes('science')) 
        ? 'Sci-Fi & Cyberpunk' 
        : 'Novels & Series',
      subcategory: b.genre,
      series: b.series,
      coverUrl: b.coverUrl,
      language: 'English',
      blurbEnglish: b.blurb,
      excerpt: b.excerpt,
      chapterCount: b.pages ? Math.round(b.pages / 10) : undefined,
      readOnPlatforms: b.buyLinks.map(l => ({ name: l.vendor, url: l.url })),
      tags: [b.genre, 'Published Novel', b.publisher, ...(b.series ? [b.series] : [])],
      featured: true,
    }));

    const upcomingAsWorks: StorizineWork[] = upcomingBooks.map((u, idx) => ({
      id: `up-${u.id}`,
      number: STORIZINE_WORKS.length + publishedBooks.length + idx + 1,
      title: `${u.title} (Upcoming)`,
      category: (u.genre.toLowerCase().includes('sci-fi') || u.genre.toLowerCase().includes('science')) 
        ? 'Sci-Fi & Cyberpunk' 
        : 'Novels & Series',
      subcategory: `Stage: ${u.writingStage} (${u.progressPercentage}%)`,
      series: u.series,
      coverUrl: u.coverUrl,
      language: 'English',
      blurbEnglish: u.blurb,
      excerpt: u.teaserQuote,
      readOnPlatforms: u.preorderLinks ? u.preorderLinks.map(l => ({ name: l.vendor, url: l.url })) : [],
      tags: [u.genre, 'Upcoming Release', u.writingStage],
      featured: false,
    }));

    return [...publishedAsWorks, ...upcomingAsWorks, ...STORIZINE_WORKS];
  }, [publishedBooks, upcomingBooks]);

  const categories = useMemo(() => [
    { label: 'All Works', value: 'All' as const, icon: <Layers className="w-4 h-4" />, count: combinedWorks.length },
    { label: 'Novels & Series', value: 'Novels & Series' as const, icon: <BookOpen className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Novels & Series').length },
    { label: 'Sci-Fi & Cyberpunk', value: 'Sci-Fi & Cyberpunk' as const, icon: <Sparkles className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Sci-Fi & Cyberpunk').length },
    { label: 'Stories', value: 'Stories' as const, icon: <Compass className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Stories').length },
    { label: 'Short Stories', value: 'Short Stories' as const, icon: <Feather className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Short Stories').length },
    { label: 'Articles & Essays', value: 'Articles & Essays' as const, icon: <FileText className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Articles & Essays').length },
    { label: 'Guides & Features', value: 'Guides & Features' as const, icon: <Bookmark className="w-4 h-4" />, count: combinedWorks.filter(w => w.category === 'Guides & Features').length },
  ], [combinedWorks]);

  const effectiveSearch = searchQuery || localSearch;

  const filteredWorks = useMemo(() => {
    return combinedWorks.filter(work => {
      const matchesCategory = selectedCategory === 'All' || work.category === selectedCategory;
      const q = effectiveSearch.toLowerCase();
      const matchesSearch = !q || 
        work.title.toLowerCase().includes(q) ||
        (work.titleBengali && work.titleBengali.toLowerCase().includes(q)) ||
        (work.blurbEnglish && work.blurbEnglish.toLowerCase().includes(q)) ||
        (work.blurbBengali && work.blurbBengali.toLowerCase().includes(q)) ||
        work.tags.some(t => t.toLowerCase().includes(q)) ||
        work.category.toLowerCase().includes(q) ||
        (work.series && work.series.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [combinedWorks, selectedCategory, effectiveSearch]);

  // Edit / Delete handlers for Published Work
  const handleEditWorkClick = (e: React.MouseEvent, work: StorizineWork) => {
    e.stopPropagation();
    if (work.id.startsWith('pub-')) {
      const rawId = work.id.replace('pub-', '');
      const pubBook = publishedBooks.find(b => b.id === rawId);
      if (pubBook) setEditingPublished(pubBook);
    } else if (work.id.startsWith('up-')) {
      const rawId = work.id.replace('up-', '');
      const upBook = upcomingBooks.find(u => u.id === rawId);
      if (upBook) setEditingUpcoming(upBook);
    }
  };

  const handleDeleteWorkClick = (e: React.MouseEvent, work: StorizineWork) => {
    e.stopPropagation();
    if (work.id.startsWith('pub-')) {
      const rawId = work.id.replace('pub-', '');
      if (window.confirm(`Delete "${work.title}" from published works?`)) {
        if (onUpdatePublishedBooks) {
          onUpdatePublishedBooks(publishedBooks.filter(b => b.id !== rawId));
        }
      }
    } else if (work.id.startsWith('up-')) {
      const rawId = work.id.replace('up-', '');
      if (window.confirm(`Delete upcoming release "${work.title}"?`)) {
        if (onUpdateUpcomingBooks) {
          onUpdateUpcomingBooks(upcomingBooks.filter(u => u.id !== rawId));
        }
      }
    }
  };

  const handleSavePublishedBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPublished || !onUpdatePublishedBooks) return;
    const updated = publishedBooks.map(b => (b.id === editingPublished.id ? editingPublished : b));
    onUpdatePublishedBooks(updated);
    setEditingPublished(null);
  };

  const handleSaveUpcomingBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUpcoming || !onUpdateUpcomingBooks) return;
    const updated = upcomingBooks.map(u => (u.id === editingUpcoming.id ? editingUpcoming : u));
    onUpdateUpcomingBooks(updated);
    setEditingUpcoming(null);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Compact Top Action Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c]">
        <div>
          <h1 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">
            STORIZINE <span className="font-handwriting text-[#d4a373]">Literary Works</span>
          </h1>
          <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 mt-0.5">
            Complete catalog of published novels, short stories, cyberpunk sagas, and articles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Add Published Work Button for Logged-In Author */}
          {isLoggedIn && onOpenAddPortfolioModal && (
            <button
              onClick={onOpenAddPortfolioModal}
              className="px-3.5 py-1.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Published Work</span>
            </button>
          )}

          {onOpenFableLounge && (
            <button
              onClick={onOpenFableLounge}
              className="px-3.5 py-1.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] border border-[#d4a373]/40 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clubs</span>
            </button>
          )}
        </div>
      </div>

      {/* Multiple Section Category Navigation Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
          <div>
            <h2 className="font-serif text-2xl text-[#2a2724] dark:text-[#f5f2e6]">
              Browse Writing Sections
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
              Select a section page to view relevant works with cover, titles, and descriptions at a glance
            </p>
          </div>

          {/* Local Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#d4a373] absolute left-3 top-2.5" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search Storizine works..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#1f1d1a] text-[#2a2724] dark:text-[#f5f2e6] outline-none focus:border-[#d4a373]"
            />
            {localSearch && (
              <button onClick={() => setLocalSearch('')} className="absolute right-2.5 top-2.5 text-xs text-[#2a2724]/40 dark:text-[#f5f2e6]/40">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Page Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  isActive
                    ? 'bg-[#2a2724] dark:bg-[#fffef2] text-[#d4a373] dark:text-[#181614] ring-2 ring-[#d4a373]'
                    : 'bg-[#fffef2] dark:bg-[#1f1d1a] text-[#2a2724]/80 dark:text-[#f5f2e6]/80 hover:bg-[#f5f1e3] dark:hover:bg-[#2a2724] border border-[#ebd9c5] dark:border-[#38332c]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-[#d4a373] text-[#181614]' : 'bg-[#ebd9c5]/40 dark:bg-[#38332c]'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Works Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-medium">
            Showing <span className="font-bold text-[#d4a373]">{filteredWorks.length}</span> works in{' '}
            <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              {selectedCategory === 'All' ? 'All Sections' : selectedCategory}
            </span>
          </p>
        </div>

        {filteredWorks.length === 0 ? (
          <div className="text-center py-16 bg-[#fffef2] dark:bg-[#1f1d1a] rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-[#d4a373] mx-auto opacity-50" />
            <h3 className="font-serif text-xl text-[#2a2724] dark:text-[#f5f2e6]">No writings found</h3>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 max-w-md mx-auto">
              No works match your current filter or search term. Try selecting "All Works" or clearing your search.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setLocalSearch(''); }}
              className="px-4 py-2 rounded-xl bg-[#d4a373] text-[#fffef2] text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => {
              const isEditable = isLoggedIn && (work.id.startsWith('pub-') || work.id.startsWith('up-'));
              return (
                <div
                  key={work.id}
                  onClick={() => setSelectedWork(work)}
                  className="group bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] rounded-3xl overflow-hidden hover:shadow-2xl hover:border-[#d4a373]/60 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Book Cover Banner & Overlay Badge */}
                    <div className="relative h-56 w-full bg-[#181614] overflow-hidden">
                      <img
                        src={work.coverUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181614] via-[#181614]/30 to-transparent" />
                      
                      {/* Top Badges & Author Controls */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#181614]/80 backdrop-blur-md text-[#d4a373] border border-[#d4a373]/30">
                          #{work.number}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          {work.featured && (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#d4a373] text-[#181614] flex items-center space-x-1 shadow-md">
                              <Flame className="w-3 h-3" />
                              <span>Featured</span>
                            </span>
                          )}

                          {/* Inline Author Edit/Delete Controls */}
                          {isEditable && (
                            <div className="flex items-center space-x-1 bg-[#181614]/90 p-1 rounded-xl border border-[#d4a373]/40 backdrop-blur-md">
                              <button
                                onClick={(e) => handleEditWorkClick(e, work)}
                                className="p-1 rounded-lg hover:bg-[#d4a373]/20 text-[#d4a373] transition-colors"
                                title="Edit Work Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteWorkClick(e, work)}
                                className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                                title="Delete Work"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Title Bar over Cover */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#d4a373]">
                          {work.category} {work.subcategory && `• ${work.subcategory}`}
                        </p>
                        <h3 className="font-serif text-xl font-normal text-[#fffef2] leading-snug line-clamp-1">
                          {work.number}. {work.title}
                        </h3>
                        {work.titleBengali && (
                          <p className="text-xs text-[#d4a373] font-serif line-clamp-1">
                            {work.titleBengali}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-3">
                      {work.blurbBengali && (
                        <p className="text-xs text-[#2a2724] dark:text-[#f5f2e6] leading-relaxed line-clamp-3 font-serif bg-[#fbf9ee] dark:bg-[#25221e] p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c]">
                          {work.blurbBengali}
                        </p>
                      )}
                      {work.blurbEnglish && (
                        <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed line-clamp-3 font-sans">
                          {work.blurbEnglish}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {work.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 text-[10px] rounded-lg bg-[#f5f1e3] dark:bg-[#2a2724] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border border-[#ebd9c5] dark:border-[#38332c]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-[#ebd9c5]/40 dark:border-[#38332c]/40 flex items-center justify-between gap-2 text-xs text-[#d4a373] font-bold">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">{work.language}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenSampleChapter) {
                            const publishedBook: PublishedBook = {
                              id: work.id,
                              title: work.title,
                              subtitle: work.titleBengali ? `${work.titleBengali} • ${work.subcategory || ''}` : work.subcategory,
                              series: work.series,
                              coverUrl: work.coverUrl,
                              genre: work.category,
                              releaseDate: '2024',
                              publisher: 'Storizine Edition',
                              blurb: work.blurbEnglish || work.blurbBengali || '',
                              excerpt: work.excerpt || `Chapter 1: ${work.title}\n\n${work.blurbEnglish || work.blurbBengali || 'Excerpt sample coming soon.'}`,
                              buyLinks: work.readOnPlatforms ? work.readOnPlatforms.map(p => ({ vendor: p.name, url: p.url })) : [
                                { vendor: 'Wattpad', url: 'https://www.wattpad.com' },
                                { vendor: 'Webnovel', url: 'https://www.webnovel.com' }
                              ],
                              praise: [{ quote: 'A featured Storizine release.', source: 'Storizine' }],
                              rating: 4.9,
                              pages: 250,
                              formats: ['Ebook', 'Paperback'],
                            };
                            onOpenSampleChapter(publishedBook);
                          } else {
                            setSelectedWork(work);
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-[#d4a373]/20 hover:bg-[#d4a373] text-[#d4a373] hover:text-[#181614] border border-[#d4a373]/30 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                        title="Read Sample Chapter"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Read Sample</span>
                      </button>

                      <div className="flex items-center space-x-1 text-[#d4a373] group-hover:translate-x-1 transition-transform">
                        <span>Info</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Work Details Overlay Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedWork(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-44 h-64 bg-[#181614] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-[#ebd9c5]/60">
                <img src={selectedWork.coverUrl} alt={selectedWork.title} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-3 flex-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373]">
                  {selectedWork.category} {selectedWork.subcategory && `• ${selectedWork.subcategory}`}
                </span>

                <h2 className="font-serif text-2xl font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  {selectedWork.number}. {selectedWork.title}
                </h2>

                {selectedWork.blurbEnglish && (
                  <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed font-sans">
                    {selectedWork.blurbEnglish}
                  </p>
                )}

                {/* Available Reading Platforms */}
                {selectedWork.readOnPlatforms && selectedWork.readOnPlatforms.length > 0 && (
                  <div className="pt-3 border-t border-[#ebd9c5] dark:border-[#38332c]">
                    <span className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6] block mb-2">Read on Platforms:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedWork.readOnPlatforms.map((p, pIdx) => (
                        <a
                          key={pIdx}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-[#2a2724] text-[#d4a373] text-xs font-bold flex items-center space-x-1.5 hover:bg-[#3d3834] transition-colors"
                        >
                          <span>{p.name}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Published Book Modal */}
      {editingPublished && (
        <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSavePublishedBookSubmit} className="bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button
              type="button"
              onClick={() => setEditingPublished(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2a2724] dark:text-[#f5f2e6] border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
              Edit Published Work
            </h3>

            <div>
              <label className="block font-bold mb-1">Title</label>
              <input
                type="text"
                value={editingPublished.title}
                onChange={(e) => setEditingPublished({ ...editingPublished, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Genre</label>
                <input
                  type="text"
                  value={editingPublished.genre}
                  onChange={(e) => setEditingPublished({ ...editingPublished, genre: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Publisher</label>
                <input
                  type="text"
                  value={editingPublished.publisher}
                  onChange={(e) => setEditingPublished({ ...editingPublished, publisher: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Cover Image URL</label>
              <input
                type="text"
                value={editingPublished.coverUrl}
                onChange={(e) => setEditingPublished({ ...editingPublished, coverUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Blurb / Description</label>
              <textarea
                rows={3}
                value={editingPublished.blurb}
                onChange={(e) => setEditingPublished({ ...editingPublished, blurb: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPublished(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#d4a373] text-[#fffef2] font-bold flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save Work</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Upcoming Release Modal */}
      {editingUpcoming && (
        <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveUpcomingBookSubmit} className="bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-xs">
            <button
              type="button"
              onClick={() => setEditingUpcoming(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6]"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-xl font-bold text-[#2a2724] dark:text-[#f5f2e6] border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
              Edit Upcoming Release &amp; WIP
            </h3>

            <div>
              <label className="block font-bold mb-1">Title</label>
              <input
                type="text"
                value={editingUpcoming.title}
                onChange={(e) => setEditingUpcoming({ ...editingUpcoming, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Writing Stage</label>
                <input
                  type="text"
                  value={editingUpcoming.writingStage}
                  onChange={(e) => setEditingUpcoming({ ...editingUpcoming, writingStage: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Progress (%)</label>
                <input
                  type="number"
                  value={editingUpcoming.progressPercentage}
                  onChange={(e) => setEditingUpcoming({ ...editingUpcoming, progressPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUpcoming(null)}
                className="px-4 py-2 rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#d4a373] text-[#fffef2] font-bold flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save WIP</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
