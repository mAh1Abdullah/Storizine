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
  Library
} from 'lucide-react';
import { STORIZINE_AUTHOR, STORIZINE_WORKS } from '../data/storizineData';
import { StorizineWork, StorizineCategory, PublishedBook, UpcomingBook } from '../types';

interface StorizineViewProps {
  searchQuery: string;
  publishedBooks?: PublishedBook[];
  upcomingBooks?: UpcomingBook[];
  onOpenSampleChapter?: (book: PublishedBook) => void;
  onOpenFableLounge?: () => void;
  onOpenGutenbergModal?: () => void;
}

export const StorizineView: React.FC<StorizineViewProps> = ({ 
  searchQuery, 
  publishedBooks = [], 
  upcomingBooks = [],
  onOpenSampleChapter,
  onOpenFableLounge,
  onOpenGutenbergModal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StorizineCategory | 'All'>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedWork, setSelectedWork] = useState<StorizineWork | null>(null);

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

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenFableLounge && (
            <button
              onClick={onOpenFableLounge}
              className="px-3.5 py-1.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
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
            {filteredWorks.map((work) => (
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
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#181614]/80 backdrop-blur-md text-[#d4a373] border border-[#d4a373]/30">
                        #{work.number}
                      </span>
                      {work.featured && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#d4a373] text-[#181614] flex items-center space-x-1 shadow-md">
                          <Flame className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
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
                    {/* Blurb Bengali or English */}
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
            ))}
          </div>
        )}
      </section>

      {/* Work Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header image banner */}
            <div className="relative h-48 bg-[#181614] shrink-0">
              <img
                src={selectedWork.coverUrl}
                alt={selectedWork.title}
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1d1a] via-[#1f1d1a]/50 to-transparent" />
              
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#181614]/80 text-[#fffef2] hover:bg-[#d4a373] hover:text-[#181614] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#d4a373] text-[#181614]">
                  Work #{selectedWork.number} • {selectedWork.category}
                </span>
                <h2 className="text-2xl font-serif text-[#fffef2]">
                  {selectedWork.title} {selectedWork.titleBengali && <span className="text-[#d4a373]">/ {selectedWork.titleBengali}</span>}
                </h2>
                {selectedWork.subcategory && (
                  <p className="text-xs text-[#d4a373] font-handwriting">{selectedWork.subcategory}</p>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {selectedWork.blurbBengali && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#d4a373] uppercase tracking-wider">সারসংক্ষেপ (Bengali Blurb)</h4>
                  <p className="text-sm font-serif leading-relaxed bg-[#fbf9ee] dark:bg-[#25221e] p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]">
                    {selectedWork.blurbBengali}
                  </p>
                </div>
              )}

              {selectedWork.blurbEnglish && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#d4a373] uppercase tracking-wider">English Synopsis</h4>
                  <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed font-sans">
                    {selectedWork.blurbEnglish}
                  </p>
                </div>
              )}

              {selectedWork.excerpt && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#d4a373] uppercase tracking-wider">Sample Excerpt</h4>
                  <pre className="text-xs font-serif leading-relaxed whitespace-pre-wrap bg-[#f5f1e3] dark:bg-[#2a2724] p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]">
                    {selectedWork.excerpt}
                  </pre>
                </div>
              )}

              {selectedWork.chapterCount && (
                <div className="p-3 bg-[#d4a373]/15 rounded-xl border border-[#d4a373]/30 flex items-center justify-between text-xs text-[#d4a373]">
                  <span className="font-bold">Total Chapters Published:</span>
                  <span className="font-serif text-base">{selectedWork.chapterCount} Chapters</span>
                </div>
              )}

              {selectedWork.readOnPlatforms && selectedWork.readOnPlatforms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#d4a373] uppercase tracking-wider">Read Online Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWork.readOnPlatforms.map((p, pIdx) => (
                      <a
                        key={pIdx}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#2a2724] hover:bg-[#d4a373] text-[#d4a373] hover:text-[#181614] text-xs font-bold transition-colors flex items-center space-x-1.5 border border-[#d4a373]/40"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Read on {p.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-1.5 pt-2 border-t border-[#ebd9c5] dark:border-[#38332c]">
                <p className="text-[11px] font-bold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Tags & Categories:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWork.tags.map((t, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-xs rounded-xl bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5] dark:border-[#38332c]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-[#fbf9ee] dark:bg-[#25221e] border-t border-[#ebd9c5] dark:border-[#38332c] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Storizine • by {STORIZINE_AUTHOR.name}</span>
              
              <div className="flex items-center space-x-2">
                {onOpenSampleChapter && (
                  <button
                    onClick={() => {
                      const publishedBook: PublishedBook = {
                        id: selectedWork.id,
                        title: selectedWork.title,
                        subtitle: selectedWork.titleBengali ? `${selectedWork.titleBengali} • ${selectedWork.subcategory || ''}` : selectedWork.subcategory,
                        series: selectedWork.series,
                        coverUrl: selectedWork.coverUrl,
                        genre: selectedWork.category,
                        releaseDate: '2024',
                        publisher: 'Storizine Edition',
                        blurb: selectedWork.blurbEnglish || selectedWork.blurbBengali || '',
                        excerpt: selectedWork.excerpt || `Chapter 1: ${selectedWork.title}\n\n${selectedWork.blurbEnglish || selectedWork.blurbBengali || 'Excerpt sample coming soon.'}`,
                        buyLinks: selectedWork.readOnPlatforms ? selectedWork.readOnPlatforms.map(p => ({ vendor: p.name, url: p.url })) : [
                          { vendor: 'Wattpad', url: 'https://www.wattpad.com' },
                          { vendor: 'Webnovel', url: 'https://www.webnovel.com' }
                        ],
                        praise: [{ quote: 'A featured Storizine release.', source: 'Storizine' }],
                        rating: 4.9,
                        pages: 250,
                        formats: ['Ebook', 'Paperback'],
                      };
                      setSelectedWork(null);
                      onOpenSampleChapter(publishedBook);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#d4a373] text-[#181614] hover:bg-[#c39262] font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Sample Chapter</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedWork(null)}
                  className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#38332c] text-[#f5f2e6] font-bold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
