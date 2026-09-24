import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Star, 
  Library, 
  Check, 
  Camera, 
  Loader2, 
  Barcode, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Phone, 
  User, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  BookForestEntry, 
  ReadingStatus, 
  BookFormat, 
  CollectionLocation, 
  BookLoan, 
  JournalPrompts 
} from '../types';

interface AddBookForestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: BookForestEntry) => void;
  initialEntry?: BookForestEntry | null;
}

const ALL_FORMATS: BookFormat[] = [
  'Hardcover',
  'Paperback',
  "Collector's Edition",
  'Signed Copy',
  'First Edition',
  'Kindle/Ebook',
  'Audiobook',
];

const ALL_LOCATIONS: CollectionLocation[] = [
  'Physical Main Bookshelf',
  'Physical Special Shelf',
  'Kindle Library',
  'Audible',
  'Wishlist / Not Owned',
];

export const AddBookForestModal: React.FC<AddBookForestModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
}) => {
  // Core Book Details
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [coverUrl, setCoverUrl] = useState('');
  const [readingStatus, setReadingStatus] = useState<ReadingStatus>('want-to-read');
  const [userRating, setUserRating] = useState<number>(5);
  const [currentProgressPages, setCurrentProgressPages] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(350);
  const [reviewComments, setReviewComments] = useState('');
  const [quotes, setQuotes] = useState<string>('');
  const [tagsStr, setTagsStr] = useState('Sci-Fi, Favorites');
  
  // Physical / Digital Collection State
  const [ownedFormats, setOwnedFormats] = useState<BookFormat[]>(['Paperback']);
  const [collectionLocation, setCollectionLocation] = useState<CollectionLocation>('Physical Main Bookshelf');
  const [editionDetails, setEditionDetails] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');

  // 1. Book Lending Tracker State (BookBuddy+ Feature)
  const [isLoanedOut, setIsLoanedOut] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerContact, setBorrowerContact] = useState('');
  const [loanDate, setLoanDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  // 2. Guided Journal Prompts State (Goodnotes Feature)
  const [showGuidedPrompts, setShowGuidedPrompts] = useState(false);
  const [plotTwistRating, setPlotTwistRating] = useState('Mind-Blowing 🤯');
  const [pacingAndTone, setPacingAndTone] = useState('Slow Burn & Atmospheric');
  const [wouldReRead, setWouldReRead] = useState('Yes, absolutely!');
  const [emotionalImpact, setEmotionalImpact] = useState('Thought-provoking 🧠');
  const [worldbuildingNotes, setWorldbuildingNotes] = useState('');

  // 3. Barcode Scanner State (BookBuddy+ Feature)
  const [isScanning, setIsScanning] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (initialEntry) {
      setTitle(initialEntry.title);
      setAuthor(initialEntry.author);
      setGenre(initialEntry.genre);
      setCoverUrl(initialEntry.coverUrl);
      setReadingStatus(initialEntry.readingStatus);
      setUserRating(initialEntry.userRating || 5);
      setCurrentProgressPages(initialEntry.currentProgressPages || 0);
      setTotalPages(initialEntry.totalPages || 350);
      setReviewComments(initialEntry.reviewComments || '');
      setQuotes(initialEntry.quotesSaved?.join('\n') || '');
      setTagsStr(initialEntry.tags?.join(', ') || '');
      setOwnedFormats(initialEntry.ownedFormats || ['Paperback']);
      setCollectionLocation(initialEntry.collectionLocation || 'Physical Main Bookshelf');
      setEditionDetails(initialEntry.editionDetails || '');
      setPurchasePrice(initialEntry.purchasePrice ? String(initialEntry.purchasePrice) : '');
      
      // Load loan data
      if (initialEntry.loan) {
        setIsLoanedOut(initialEntry.loan.isLoanedOut);
        setBorrowerName(initialEntry.loan.borrowerName || '');
        setBorrowerContact(initialEntry.loan.borrowerContact || '');
        setLoanDate(initialEntry.loan.loanDate || '');
        setDueDate(initialEntry.loan.dueDate || '');
      } else {
        setIsLoanedOut(false);
        setBorrowerName('');
        setBorrowerContact('');
        setLoanDate('');
        setDueDate('');
      }

      // Load journal prompts data
      if (initialEntry.journalPrompts) {
        setShowGuidedPrompts(true);
        setPlotTwistRating(initialEntry.journalPrompts.plotTwistRating || 'Mind-Blowing 🤯');
        setPacingAndTone(initialEntry.journalPrompts.pacingAndTone || 'Slow Burn & Atmospheric');
        setWouldReRead(initialEntry.journalPrompts.wouldReRead || 'Yes, absolutely!');
        setEmotionalImpact(initialEntry.journalPrompts.emotionalImpact || 'Thought-provoking 🧠');
        setWorldbuildingNotes(initialEntry.journalPrompts.worldbuildingNotes || '');
      } else {
        setShowGuidedPrompts(false);
        setPlotTwistRating('Mind-Blowing 🤯');
        setPacingAndTone('Slow Burn & Atmospheric');
        setWouldReRead('Yes, absolutely!');
        setEmotionalImpact('Thought-provoking 🧠');
        setWorldbuildingNotes('');
      }
    } else {
      setTitle('');
      setAuthor('');
      setGenre('Fantasy');
      setCoverUrl('');
      setReadingStatus('want-to-read');
      setUserRating(5);
      setCurrentProgressPages(0);
      setTotalPages(350);
      setReviewComments('');
      setQuotes('');
      setTagsStr('Favorites');
      setOwnedFormats(['Hardcover']);
      setCollectionLocation('Physical Main Bookshelf');
      setEditionDetails('');
      setPurchasePrice('');
      
      // Default loan
      setIsLoanedOut(false);
      setBorrowerName('');
      setBorrowerContact('');
      setLoanDate('');
      setDueDate('');

      // Default prompts
      setShowGuidedPrompts(false);
      setPlotTwistRating('Mind-Blowing 🤯');
      setPacingAndTone('Slow Burn & Atmospheric');
      setWouldReRead('Yes, absolutely!');
      setEmotionalImpact('Thought-provoking 🧠');
      setWorldbuildingNotes('');
    }
    setScanMessage(null);
  }, [initialEntry, isOpen]);

  // Clean up scanner on unmount or modal close
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  // Fetch book metadata from Open Library using scanned or entered ISBN
  const fetchOpenLibraryMetadata = async (isbn: string) => {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
    if (!cleanIsbn) return;

    setScanLoading(true);
    setScanMessage(null);

    try {
      // 1. Try Open Library Data API
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      if (res.ok) {
        const data = await res.json();
        const bookData = data[`ISBN:${cleanIsbn}`];
        if (bookData) {
          if (bookData.title) setTitle(bookData.title);
          if (bookData.authors && bookData.authors.length > 0) {
            setAuthor(bookData.authors.map((a: any) => a.name).join(', '));
          }
          if (bookData.number_of_pages) setTotalPages(bookData.number_of_pages);
          if (bookData.cover?.large || bookData.cover?.medium) {
            setCoverUrl(bookData.cover.large || bookData.cover.medium);
          } else {
            setCoverUrl(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`);
          }
          if (bookData.subjects && bookData.subjects.length > 0) {
            setGenre(bookData.subjects[0].name || 'Fiction');
          }
          const pub = bookData.publishers?.[0]?.name;
          const pubDate = bookData.publish_date;
          setEditionDetails(`ISBN: ${cleanIsbn}${pub ? ` • ${pub}` : ''}${pubDate ? ` (${pubDate})` : ''}`);
          
          setScanMessage({
            type: 'success',
            text: `Successfully matched "${bookData.title}" via Open Library (ISBN: ${cleanIsbn})!`,
          });
          setScanLoading(false);
          return;
        }
      }

      // 2. Fallback to Open Library Search API
      const searchRes = await fetch(`https://openlibrary.org/search.json?isbn=${cleanIsbn}&limit=1`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.docs && searchData.docs.length > 0) {
          const doc = searchData.docs[0];
          setTitle(doc.title || '');
          if (doc.author_name) setAuthor(doc.author_name.join(', '));
          if (doc.number_of_pages_median) setTotalPages(doc.number_of_pages_median);
          if (doc.cover_i) {
            setCoverUrl(`https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`);
          } else {
            setCoverUrl(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`);
          }
          if (doc.subject) setGenre(doc.subject[0] || 'Fiction');
          setEditionDetails(`ISBN: ${cleanIsbn}${doc.first_publish_year ? ` (First published ${doc.first_publish_year})` : ''}`);
          
          setScanMessage({
            type: 'success',
            text: `Found "${doc.title}" via Open Library Search (ISBN: ${cleanIsbn})!`,
          });
          setScanLoading(false);
          return;
        }
      }

      setScanMessage({
        type: 'error',
        text: `No records found in Open Library for ISBN: ${cleanIsbn}. You can still fill details manually.`,
      });
    } catch (err) {
      console.error('Open Library Fetch Error:', err);
      setScanMessage({
        type: 'error',
        text: `Network error querying Open Library for ISBN: ${cleanIsbn}.`,
      });
    } finally {
      setScanLoading(false);
    }
  };

  // Start Camera Barcode Scanner
  const startScanner = async () => {
    setIsScanning(true);
    setScanMessage(null);

    // Give DOM a frame to render the div element
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode('barcode-reader-container');
        html5QrCodeRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.5,
          },
          async (decodedText) => {
            // Detected barcode!
            await stopScanner();
            await fetchOpenLibraryMetadata(decodedText);
          },
          () => {
            // Ignore ongoing frame recognition noise
          }
        );
      } catch (err: any) {
        console.error('Camera Scanner Error:', err);
        setIsScanning(false);
        setScanMessage({
          type: 'error',
          text: `Camera could not be started (${err?.message || 'Permission denied or no webcam'}). You can test with a sample barcode below.`,
        });
      }
    }, 150);
  };

  if (!isOpen) return null;

  const toggleFormat = (fmt: BookFormat) => {
    if (ownedFormats.includes(fmt)) {
      setOwnedFormats(ownedFormats.filter((f) => f !== fmt));
    } else {
      setOwnedFormats([...ownedFormats, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) return;

    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

    // Construct BookBuddy+ Loan object
    const loanData: BookLoan | undefined = isLoanedOut
      ? {
          isLoanedOut: true,
          borrowerName: borrowerName.trim() || 'Book Club Friend',
          borrowerContact: borrowerContact.trim() || undefined,
          loanDate: loanDate || new Date().toISOString().slice(0, 10),
          dueDate: dueDate || undefined,
        }
      : undefined;

    // Construct Goodnotes Journal Prompts
    const journalData: JournalPrompts | undefined = showGuidedPrompts
      ? {
          plotTwistRating,
          pacingAndTone,
          wouldReRead,
          emotionalImpact,
          worldbuildingNotes: worldbuildingNotes.trim() || undefined,
          favoriteQuote: quotes ? quotes.split('\n')[0]?.trim() : undefined,
        }
      : undefined;

    const entryToSave: BookForestEntry = {
      id: initialEntry ? initialEntry.id : `bf-${Date.now()}`,
      title,
      author,
      coverUrl: defaultCover,
      genre: genre || 'Fiction',
      readingStatus,
      userRating: readingStatus === 'read' ? userRating : 0,
      currentProgressPages: readingStatus === 'currently-reading' ? currentProgressPages : undefined,
      totalPages: totalPages || 350,
      dateAdded: initialEntry ? initialEntry.dateAdded : new Date().toISOString().split('T')[0],
      dateFinished: readingStatus === 'read' ? (initialEntry?.dateFinished || new Date().toISOString().split('T')[0]) : undefined,
      reviewComments,
      quotesSaved: quotes ? quotes.split('\n').filter((q) => q.trim().length > 0) : [],
      tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()) : [],
      ownedFormats,
      collectionLocation,
      editionDetails: editionDetails || undefined,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      readCount: readingStatus === 'read' ? 1 : 0,
      loan: loanData,
      journalPrompts: journalData,
    };

    onSave(entryToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between bg-[#fcfbf4] dark:bg-[#1b1917]">
          <div className="flex items-center space-x-2">
            <Library className="w-5 h-5 text-[#d4a373]" />
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">
                {initialEntry ? 'Edit BookForest Record' : 'Add Book to BookForest'}
              </h3>
              <p className="text-[11px] text-[#b07843] dark:text-[#d4a373] font-handwriting">
                BookBuddy+ Barcode Scanner & Lending • Goodnotes Aesthetic Journal
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#2a2724]/40 hover:text-[#2a2724] dark:text-[#f5f2e6]/40 dark:hover:text-[#f5f2e6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Barcode Scanner Banner (BookBuddy+ Feature) */}
          <div className="p-3.5 bg-gradient-to-r from-[#d4a373]/15 to-[#ebd9c5]/25 dark:from-[#d4a373]/10 dark:to-[#2e2a25] rounded-2xl border border-[#d4a373]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-[#b07843] dark:text-[#d4a373]" />
                <span className="font-bold text-xs text-[#2a2724] dark:text-[#f5f2e6]">
                  Mobile Barcode Scanner (BookBuddy+)
                </span>
                <span className="text-[10px] bg-[#d4a373] text-[#181614] font-bold px-1.5 py-0.2 rounded font-mono">
                  ISBN Auto-Fill
                </span>
              </div>
              <p className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Point your camera at a book's physical barcode to auto-populate metadata from Open Library.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isScanning ? (
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-3.5 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold flex items-center space-x-1.5 shadow-xs transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Barcode</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center space-x-1.5 shadow-xs transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Camera Viewfinder Overlay */}
          {isScanning && (
            <div className="p-4 bg-[#181614] rounded-2xl border-2 border-dashed border-[#d4a373] space-y-3 text-center">
              <div className="flex items-center justify-between text-white/80 text-xs px-1">
                <span className="flex items-center gap-1 font-mono text-[#d4a373]">
                  <Camera className="w-3.5 h-3.5 animate-pulse" />
                  Align book ISBN barcode inside the scanner box
                </span>
                <button
                  type="button"
                  onClick={stopScanner}
                  className="text-xs text-white/60 hover:text-white underline"
                >
                  Cancel
                </button>
              </div>

              {/* Viewfinder Element for html5-qrcode */}
              <div 
                id="barcode-reader-container" 
                className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-white/20 bg-black min-h-[180px]"
              />

              {/* Quick Sample Barcode Simulation Buttons for testing in dev / iframe environments */}
              <div className="pt-1 text-[11px] text-white/60 space-y-1">
                <span>Or test without camera:</span>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await stopScanner();
                      fetchOpenLibraryMetadata('9780441013593'); // Dune
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#d4a373] font-mono"
                  >
                    Dune (9780441013593)
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await stopScanner();
                      fetchOpenLibraryMetadata('9780593135204'); // Project Hail Mary
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#d4a373] font-mono"
                  >
                    Project Hail Mary (9780593135204)
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await stopScanner();
                      fetchOpenLibraryMetadata('9780063021426'); // Babel
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#d4a373] font-mono"
                  >
                    Babel (9780063021426)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanner Feedback Messages */}
          {scanLoading && (
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center space-x-2 text-xs border border-amber-500/20">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Fetching book details from Open Library API...</span>
            </div>
          )}

          {scanMessage && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 text-xs border ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}

          {/* Form Fields: Book Title, Author, Genre, Cover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dune"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Author *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Frank Herbert"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Genre / Category</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Sci-Fi Classic"
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Cover Image URL</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-mono"
              />
            </div>
          </div>

          {/* Reading Status & Progress */}
          <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                  Reading Status
                </label>
                <select
                  value={readingStatus}
                  onChange={(e) => setReadingStatus(e.target.value as ReadingStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] font-semibold outline-none"
                >
                  <option value="want-to-read">Want to Read</option>
                  <option value="currently-reading">Currently Reading</option>
                  <option value="read">Finished Reading</option>
                  <option value="did-not-finish">Did Not Finish</option>
                </select>
              </div>

              {readingStatus === 'read' && (
                <div>
                  <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                    Your Star Rating
                  </label>
                  <div className="flex items-center space-x-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= userRating
                              ? 'text-[#d4a373] fill-[#d4a373]'
                              : 'text-[#ebd9c5] dark:text-[#38332c]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-xs">{userRating} / 5</span>
                  </div>
                </div>
              )}

              {readingStatus === 'currently-reading' && (
                <div>
                  <label className="block font-bold mb-1 text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">
                    Current Reading Progress
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={currentProgressPages}
                      onChange={(e) => setCurrentProgressPages(parseInt(e.target.value) || 0)}
                      placeholder="Page"
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] font-mono"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={totalPages}
                      onChange={(e) => setTotalPages(parseInt(e.target.value) || 350)}
                      placeholder="Total"
                      className="w-24 px-2 py-1.5 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] font-mono"
                    />
                    <span className="text-xs font-bold text-[#d4a373]">
                      ({Math.round(((currentProgressPages || 0) / (totalPages || 1)) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1. BOOK LENDING TRACKER (BookBuddy+ Feature) */}
          <div className="p-3.5 bg-[#f5f1e3]/90 dark:bg-[#25221e]/90 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
                <h4 className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm uppercase tracking-wider">
                  Book Lending Tracker (BookBuddy+)
                </h4>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLoanedOut}
                  onChange={(e) => setIsLoanedOut(e.target.checked)}
                  className="rounded border-[#ebd9c5] text-[#d4a373] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold text-xs text-[#2a2724] dark:text-[#f5f2e6]">
                  Lent out to someone
                </span>
              </label>
            </div>

            {isLoanedOut && (
              <div className="pt-2 border-t border-[#ebd9c5]/60 dark:border-[#38332c] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#d4a373]" />
                    Borrower Name *
                  </label>
                  <input
                    type="text"
                    required={isLoanedOut}
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#d4a373]" />
                    Borrower Contact (Email or Phone)
                  </label>
                  <input
                    type="text"
                    value={borrowerContact}
                    onChange={(e) => setBorrowerContact(e.target.value)}
                    placeholder="e.g. sarah@email.com or +1 555-0192"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#d4a373]" />
                    Date Lent Out
                  </label>
                  <input
                    type="date"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#d4a373]" />
                    Due / Return By Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. GUIDED JOURNAL PROMPTS (Goodnotes Feature) */}
          <div className="p-3.5 bg-[#f5f1e3]/90 dark:bg-[#25221e]/90 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <div 
              onClick={() => setShowGuidedPrompts(!showGuidedPrompts)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#d4a373]" />
                <h4 className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm uppercase tracking-wider">
                  Guided Journal Prompts (Goodnotes Aesthetic)
                </h4>
              </div>
              <button type="button" className="p-1 text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                {showGuidedPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showGuidedPrompts && (
              <div className="pt-2 border-t border-[#ebd9c5]/60 dark:border-[#38332c] space-y-3 text-xs animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Plot Twist Rating</label>
                    <select
                      value={plotTwistRating}
                      onChange={(e) => setPlotTwistRating(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-medium"
                    >
                      <option value="None">None (Straightforward Story)</option>
                      <option value="Mild">Mild (Expected Turns)</option>
                      <option value="Predictable">Saw It Coming Miles Away</option>
                      <option value="Mind-Blowing 🤯">Mind-Blowing 🤯</option>
                      <option value="Unpredictable Masterpiece">Unpredictable Masterpiece</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Pacing & Atmospheric Tone</label>
                    <select
                      value={pacingAndTone}
                      onChange={(e) => setPacingAndTone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-medium"
                    >
                      <option value="Slow Burn & Atmospheric">Slow Burn & Atmospheric</option>
                      <option value="Fast-Paced Page-Turner">Fast-Paced Page-Turner</option>
                      <option value="Cozy & Character-Driven">Cozy & Character-Driven</option>
                      <option value="Intense & Thrilling">Intense & Thrilling</option>
                      <option value="Philosophical & Reflective">Philosophical & Reflective</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Would I Re-read?</label>
                    <select
                      value={wouldReRead}
                      onChange={(e) => setWouldReRead(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-medium"
                    >
                      <option value="Yes, absolutely!">Yes, absolutely!</option>
                      <option value="Maybe in a few years">Maybe in a few years</option>
                      <option value="One-time read">One-time read</option>
                      <option value="Better as audiobook">Better as audiobook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Emotional Impact</label>
                    <select
                      value={emotionalImpact}
                      onChange={(e) => setEmotionalImpact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-medium"
                    >
                      <option value="Tears were shed 🥺">Tears were shed 🥺</option>
                      <option value="Heartwarming ❤️">Heartwarming ❤️</option>
                      <option value="Thought-provoking 🧠">Thought-provoking 🧠</option>
                      <option value="Thrilling adrenaline ⚡">Thrilling adrenaline ⚡</option>
                      <option value="Cozy comfort ☕">Cozy comfort ☕</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Worldbuilding & Setting Impressions</label>
                  <input
                    type="text"
                    value={worldbuildingNotes}
                    onChange={(e) => setWorldbuildingNotes(e.target.value)}
                    placeholder="e.g. Intricate magic system based on linguistic translation and silver..."
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Formats Owned & Collection Management */}
          <div className="p-3 bg-[#f5f1e3]/80 dark:bg-[#25221e]/80 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <h4 className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm uppercase tracking-wider">
              Collection & Physical / Virtual Edition Owned
            </h4>

            <div>
              <label className="block font-semibold mb-1">Format(s) Owned in Collection:</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_FORMATS.map((fmt) => {
                  const isSel = ownedFormats.includes(fmt);
                  return (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => toggleFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1 ${
                        isSel
                          ? 'bg-[#2a2724] text-[#d4a373] border-[#2a2724] shadow-xs'
                          : 'bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] border-[#ebd9c5] dark:border-[#38332c]'
                      }`}
                    >
                      {isSel && <Check className="w-3 h-3 text-[#d4a373]" />}
                      <span>{fmt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold mb-1">Collection Location</label>
                <select
                  value={collectionLocation}
                  onChange={(e) => setCollectionLocation(e.target.value as CollectionLocation)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                >
                  {ALL_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Edition Notes (Optional)</label>
                <input
                  type="text"
                  value={editionDetails}
                  onChange={(e) => setEditionDetails(e.target.value)}
                  placeholder="e.g. Illumicrate Special Sprayed Edges & Signed"
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personal Review & Comments */}
          <div>
            <label className="block font-bold mb-1">Personal Comments & Review</label>
            <textarea
              rows={3}
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="What did you think of the story, worldbuilding, characters, or writing style?"
              className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Favorite Quotes Saved (One per line)</label>
            <textarea
              rows={2}
              value={quotes}
              onChange={(e) => setQuotes(e.target.value)}
              placeholder='e.g. "Fear is the mind-killer..."'
              className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none font-serif"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Sci-Fi, Award Winner, Audio Gold"
              className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-2 border-t border-[#ebd9c5] dark:border-[#38332c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] shadow-md transition-all"
            >
              Save to BookForest
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
