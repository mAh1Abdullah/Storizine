import React, { useState } from 'react';
import { BookOpen, Clock, Award, Star, ExternalLink, Sparkles, Feather, Bookmark, Quote, ChevronRight } from 'lucide-react';
import { AuthorProfile, PublishedBook, UpcomingBook } from '../types';

interface PortfolioViewProps {
  author: AuthorProfile;
  publishedBooks: PublishedBook[];
  upcomingBooks: UpcomingBook[];
  onOpenSampleChapter: (book: PublishedBook) => void;
  searchQuery: string;
  onNavigateToStorizine?: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  author,
  publishedBooks,
  upcomingBooks,
  onOpenSampleChapter,
  searchQuery,
  onNavigateToStorizine,
}) => {
  const filteredPublished = publishedBooks.filter((b) => {
    const isShownOnFront = b.showOnFrontPage !== false;
    const matchesSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.blurb.toLowerCase().includes(searchQuery.toLowerCase());
    return isShownOnFront && matchesSearch;
  });

  const filteredUpcoming = upcomingBooks.filter((b) => {
    const isShownOnFront = b.showOnFrontPage !== false;
    const matchesSearch = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return isShownOnFront && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* Author Showcase Hero Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-[#2a2724] dark:bg-[#1f1d1a] text-[#f5f2e6] p-8 sm:p-12 shadow-xl border border-[#d4a373]/30">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          
          {/* Author Portrait */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-[#d4a373]/50 shadow-2xl">
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#d4a373] text-[#fffef2] p-2 rounded-xl shadow-lg border border-[#fffef2]/20">
              <Feather className="w-4 h-4" />
            </div>
          </div>

          {/* Author Details */}
          <div className="space-y-4 text-center md:text-left">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30 font-handwriting">
                Official Front Page • mAh Abdullah
              </span>
              <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight mt-2 text-[#fffef2]">
                {author.name}
              </h1>
              <p className="text-sm font-semibold text-[#d4a373] mt-1">
                {author.title}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#f5f2e6]/90 leading-relaxed max-w-2xl font-sans">
              {author.bio}
            </p>

            <blockquote className="text-sm italic text-[#d4a373] font-serif border-l-2 border-[#d4a373]/60 pl-3 py-0.5">
              {author.featuredQuote}
            </blockquote>

            {/* Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              {author.socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#fffef2]/10 hover:bg-[#fffef2]/20 text-[#f5f2e6] text-xs font-medium transition-colors flex items-center space-x-1 border border-[#fffef2]/15"
                >
                  <span>{link.platform}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* Upcoming Releases Section (Placed above Published Novels) */}
      <section className="space-y-6 pt-2">
        <div className="border-b border-[#ebd9c5] dark:border-[#2e2a25] pb-4">
          <h2 className="text-3xl font-normal font-serif tracking-tight text-[#2a2724] dark:text-[#f5f2e6] flex items-center space-x-2">
            <Clock className="w-6 h-6 text-[#d4a373]" />
            <span>Upcoming Releases & Writing Tracker</span>
          </h2>
          <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 mt-0.5">
            Follow current writing stages, completion percentages, and pre-order announcements for upcoming novels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredUpcoming.map((book) => (
            <div
              key={book.id}
              className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-24 h-36 object-cover rounded-xl shadow-md shrink-0 border border-[#ebd9c5]"
                />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373] font-handwriting">
                      {book.genre}
                    </span>
                    <span className="text-[11px] font-bold text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      Expected: {book.expectedRelease}
                    </span>
                  </div>

                  <h3 className="text-2xl font-normal font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                    {book.title}
                  </h3>

                  {book.series && (
                    <p className="text-xs text-[#d4a373] font-semibold font-handwriting">
                      {book.series}
                    </p>
                  )}

                  <p className="text-[#2a2724]/80 dark:text-[#f5f2e6]/80 text-xs leading-relaxed line-clamp-3">
                    {book.blurb}
                  </p>
                </div>
              </div>

              {/* Progress Stage Bar */}
              <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl space-y-2 border border-[#ebd9c5]/60 dark:border-[#38332c]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                    Writing Stage: <span className="text-[#d4a373]">{book.writingStage}</span>
                  </span>
                  <span className="font-mono font-bold text-[#d4a373]">
                    {book.progressPercentage}%
                  </span>
                </div>

                <div className="w-full bg-[#ebd9c5] dark:bg-[#38332c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#d4a373] h-full transition-all duration-500"
                    style={{ width: `${book.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Teaser quote */}
              {book.teaserQuote && (
                <blockquote className="italic font-serif text-xs text-[#2a2724] dark:text-[#f5f2e6] bg-[#f5f1e3] dark:bg-[#2b2723] p-2.5 rounded-lg border-l-2 border-[#d4a373]">
                  {book.teaserQuote}
                </blockquote>
              )}

              {/* Pre-order links */}
              {book.preorderLinks && book.preorderLinks.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {book.preorderLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] font-bold text-xs flex items-center space-x-1"
                    >
                      <span>{link.vendor}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      </section>

      {/* Published Works Section */}
      <section className="space-y-6">
        <div className="border-b border-[#ebd9c5] dark:border-[#2e2a25] pb-4">
          <h2 className="text-3xl font-normal font-serif tracking-tight text-[#2a2724] dark:text-[#f5f2e6] flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-[#d4a373]" />
            <span>Published Novels</span>
          </h2>
          <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 mt-0.5">
            Explore published books, read sample chapters, and find physical & digital store purchase links.
          </p>
        </div>

        {/* Published Books Cards Grid (Limited to 9 items) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublished.slice(0, 9).map((book) => (
            <div
              key={book.id}
              className="bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Book Cover Header */}
                <div className="relative h-64 bg-[#f5f1e3] dark:bg-[#181614] overflow-hidden group">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181614] via-[#181614]/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2a2724]/90 text-[#d4a373] backdrop-blur-xs border border-[#d4a373]/40 font-handwriting">
                      {book.genre}
                    </span>
                    {book.series && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#181614]/80 text-[#f5f2e6] backdrop-blur-xs font-handwriting">
                        {book.series} #{book.seriesNumber}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-[#f5f2e6]">
                    <h3 className="text-2xl font-normal font-serif leading-snug drop-shadow-md">
                      {book.title}
                    </h3>
                    {book.subtitle && (
                      <p className="text-xs text-[#d4a373] font-medium mt-0.5">
                        {book.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="p-5 space-y-4 text-xs">
                  
                  <div className="flex items-center justify-between text-[#2a2724]/60 dark:text-[#f5f2e6]/60 text-[11px] font-medium border-b border-[#ebd9c5] dark:border-[#38332c] pb-2">
                    <span>{book.publisher}</span>
                    <span>{book.pages} Pages</span>
                    <span className="flex items-center text-[#d4a373] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#d4a373] text-[#d4a373] mr-1" />
                      {book.rating} / 5
                    </span>
                  </div>

                  <p className="text-[#2a2724]/90 dark:text-[#f5f2e6]/90 leading-relaxed line-clamp-4">
                    {book.blurb}
                  </p>

                  {/* Formats Available */}
                  <div className="flex flex-wrap gap-1">
                    {book.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f5f1e3] dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] border border-[#ebd9c5]/60 dark:border-[#38332c]"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>

                  {/* Praise Quote */}
                  {book.praise && book.praise.length > 0 && (
                    <div className="p-3 bg-[#f5f1e3]/80 dark:bg-[#2b2723] border-l-2 border-[#d4a373] rounded-r-xl">
                      <p className="italic text-[#2a2724] dark:text-[#f5f2e6] font-serif text-xs">
                        “{book.praise[0].quote}”
                      </p>
                      <p className="text-xs font-bold text-[#b07843] dark:text-[#d4a373] mt-1 font-handwriting">
                        — {book.praise[0].source}
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 space-y-2">
                <button
                  id={`btn-read-sample-${book.id}`}
                  onClick={() => onOpenSampleChapter(book)}
                  className="w-full py-2 px-3 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] dark:bg-[#d4a373] dark:hover:bg-[#c39262] dark:text-[#181614] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs border border-[#d4a373]/30"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Sample Chapter</span>
                </button>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {book.buyLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1 px-2 text-[10px] font-semibold text-center rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#25221e] hover:bg-[#f5f1e3] dark:hover:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6] transition-colors"
                    >
                      {link.vendor} {link.price && `(${link.price})`}
                    </a>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Link to Storizine Page to see more */}
        <div className="pt-4 text-center bg-[#fbf9ee] dark:bg-[#221f1c] p-6 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] flex flex-col items-center space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-[#d4a373] text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>FULL LITERARY CATALOG</span>
          </div>
          <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 max-w-md">
            Showing 9 of {filteredPublished.length} published titles. Visit the Storizine page to view all novels, series, short stories, and articles.
          </p>
          {onNavigateToStorizine && (
            <button
              onClick={onNavigateToStorizine}
              className="px-6 py-3 rounded-2xl bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] dark:bg-[#d4a373] dark:hover:bg-[#c39262] dark:text-[#181614] font-bold text-xs flex items-center space-x-2 shadow-md transition-all hover:scale-102"
            >
              <span>See More Published Books on Storizine Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
