import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Sparkles, 
  Star, 
  Bookmark, 
  Quote, 
  Calendar, 
  BookOpen, 
  Heart, 
  Share2, 
  Check, 
  Compass,
  Smile,
  ShieldCheck
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { BookForestEntry } from '../types';

interface AestheticJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookForestEntry | null;
}

export const AestheticJournalModal: React.FC<AestheticJournalModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !book) return null;

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High DPI aesthetic graphic
        quality: 0.95,
      });
      const link = document.createElement('a');
      link.download = `${book.title.replace(/\s+/g, '_')}_Journal_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `📖 *${book.title}* by ${book.author}
⭐ Rating: ${book.userRating}/5 Stars
🎭 Plot Twist: ${book.journalPrompts?.plotTwistRating || 'N/A'}
⏱️ Pacing & Tone: ${book.journalPrompts?.pacingAndTone || 'N/A'}
💭 Emotional Impact: ${book.journalPrompts?.emotionalImpact || 'N/A'}
🔁 Would Re-read: ${book.journalPrompts?.wouldReRead || 'N/A'}
✨ Favorite Quote: "${book.journalPrompts?.favoriteQuote || book.quotesSaved?.[0] || 'N/A'}"
📝 Reflection: ${book.reviewComments || 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quoteToDisplay = book.journalPrompts?.favoriteQuote || (book.quotesSaved && book.quotesSaved[0]);

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fcfaf2] dark:bg-[#1a1816] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Modal Controls Header (Not in export) */}
        <div className="px-6 py-4 bg-[#2a2724] text-[#fffef2] flex items-center justify-between border-b border-[#d4a373]/30 no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4a373]/20 border border-[#d4a373]/50 flex items-center justify-center text-[#d4a373]">
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#fffef2]">
                Aesthetic Reading Journal Card
              </h3>
              <p className="text-[11px] text-[#d4a373] font-handwriting">
                Goodnotes Planner Style • Shareable Graphic & PDF Card
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#fffef2] text-xs font-semibold flex items-center space-x-1.5 transition-all"
              title="Copy formatted journal text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download Image'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Card Viewport */}
        <div className="p-4 sm:p-8 overflow-y-auto flex items-center justify-center bg-[#f5f1e3]/40 dark:bg-[#121110]">
          
          {/* Aesthetic Goodnotes Planner Card (Target for HTML-to-Image / Print) */}
          <div
            ref={cardRef}
            id="aesthetic-journal-card"
            className="w-full max-w-2xl bg-[#fffef5] text-[#2a2724] rounded-2xl border-2 border-[#ebd9c5] shadow-xl p-6 sm:p-8 relative overflow-hidden font-sans space-y-6"
            style={{
              backgroundImage: `radial-gradient(#ebd9c5 0.75px, transparent 0.75px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Washi Tape Graphic Accents */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#d4a373]/30 backdrop-blur-xs border border-dashed border-[#b07843]/40 rotate-1 shadow-xs pointer-events-none" />
            <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-mono text-[#b07843]/60 border border-[#b07843]/30 px-2 py-0.5 rounded-sm">
              BOOKFOREST JOURNAL • NO. {book.id.slice(-4).toUpperCase()}
            </div>

            {/* Card Header & Book Info */}
            <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-[#ebd9c5] pb-6 pt-2">
              
              {/* Book Cover with Photo Tab Accents */}
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <div className="absolute -top-2 -left-2 w-5 h-5 border-t-2 border-l-2 border-[#b07843] opacity-60" />
                <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b-2 border-r-2 border-[#b07843] opacity-60" />
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-28 h-42 sm:w-32 sm:h-48 object-cover rounded-lg shadow-md border border-[#ebd9c5]"
                  crossOrigin="anonymous"
                />
                {book.readingStatus === 'read' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#15803d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
                    ✓ Completed
                  </div>
                )}
              </div>

              {/* Title, Author, Star Rating, Genre */}
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4a373]/20 text-[#b07843] font-handwriting">
                  {book.genre}
                </div>

                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#2a2724] leading-tight">
                  {book.title}
                </h2>

                <p className="text-sm font-medium text-[#2a2724]/70">
                  by <span className="font-bold text-[#2a2724]">{book.author}</span>
                </p>

                {/* Star Rating Seal */}
                <div className="flex items-center justify-center sm:justify-start space-x-1 pt-1">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star
                      key={st}
                      className={`w-5 h-5 ${
                        st <= (book.userRating || 5)
                          ? 'text-[#d4a373] fill-[#d4a373]'
                          : 'text-[#ebd9c5]'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-sm text-[#b07843] ml-2 font-mono">
                    {book.userRating ? `${book.userRating}.0 / 5.0` : 'Unrated'}
                  </span>
                </div>

                {/* Dates & Edition Metadata */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-[#2a2724]/60">
                  {book.dateFinished && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#b07843]" />
                      Finished: {book.dateFinished}
                    </span>
                  )}
                  {book.totalPages && (
                    <span className="flex items-center gap-1 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-[#b07843]" />
                      {book.totalPages} Pages
                    </span>
                  )}
                  <span className="font-handwriting text-sm text-[#b07843]">
                    📍 {book.collectionLocation}
                  </span>
                </div>

                {/* Lending Status Banner if Lent Out */}
                {book.loan?.isLoanedOut && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">Lent to: {book.loan.borrowerName || 'Friend'}</span>
                        {book.loan.dueDate && (
                          <span className="text-[11px] text-amber-800 ml-1.5">(Due: {book.loan.dueDate})</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-md">
                      BookBuddy+ Loan
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* Guided Journal Prompts Grid (Goodnotes Aesthetic Feature) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#f5f1e3]/80 border border-[#ebd9c5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#b07843] tracking-wider block">
                  Plot Twist Rating
                </span>
                <p className="font-serif font-bold text-[#2a2724]">
                  {book.journalPrompts?.plotTwistRating || 'Mind-Blowing 🤯'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f5f1e3]/80 border border-[#ebd9c5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#b07843] tracking-wider block">
                  Pacing & Tone
                </span>
                <p className="font-serif font-bold text-[#2a2724]">
                  {book.journalPrompts?.pacingAndTone || 'Slow Burn & Atmospheric'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f5f1e3]/80 border border-[#ebd9c5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#b07843] tracking-wider block">
                  Emotional Impact
                </span>
                <p className="font-serif font-bold text-[#2a2724]">
                  {book.journalPrompts?.emotionalImpact || 'Thought-provoking 🧠'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#f5f1e3]/80 border border-[#ebd9c5] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#b07843] tracking-wider block">
                  Would I Re-read?
                </span>
                <p className="font-serif font-bold text-[#2a2724]">
                  {book.journalPrompts?.wouldReRead || 'Yes, absolutely!'}
                </p>
              </div>
            </div>

            {/* Worldbuilding & Setting Notes (if present) */}
            {book.journalPrompts?.worldbuildingNotes && (
              <div className="p-3 rounded-xl bg-[#f5f1e3]/50 border border-[#ebd9c5] space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-[#b07843] tracking-wider block flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Worldbuilding & Atmospheric Setting
                </span>
                <p className="text-[#2a2724]/90 italic leading-relaxed">
                  {book.journalPrompts.worldbuildingNotes}
                </p>
              </div>
            )}

            {/* Favorite Quote Block */}
            {quoteToDisplay && (
              <div className="relative p-4 rounded-xl bg-[#fbf9ee] border-l-4 border-[#d4a373] shadow-xs text-xs space-y-1">
                <Quote className="w-5 h-5 text-[#d4a373] opacity-50 absolute top-2 right-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b07843] block">
                  Favorite Highlighted Quote
                </span>
                <p className="font-serif text-sm sm:text-base italic text-[#2a2724] leading-relaxed pr-6">
                  “{quoteToDisplay}”
                </p>
              </div>
            )}

            {/* Reader Thoughts & Reflection */}
            {book.reviewComments && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-[#b07843] font-handwriting text-sm block">
                  Reader Reflection & Notes:
                </span>
                <p className="text-[#2a2724]/90 leading-relaxed font-sans bg-[#fbf9ee]/80 p-3.5 rounded-xl border border-[#ebd9c5]/60">
                  {book.reviewComments}
                </p>
              </div>
            )}

            {/* Card Footer Stamp */}
            <div className="pt-4 border-t border-[#ebd9c5] flex items-center justify-between text-[11px] text-[#2a2724]/50">
              <span className="font-handwriting text-base text-[#b07843]">
                BookForest Sanctuary • Personal Library Journal
              </span>
              <span className="font-mono">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
