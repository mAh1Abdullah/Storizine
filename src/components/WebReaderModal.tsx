import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import ePub, { Book, Rendition } from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';
import {
  PublishedBook,
  BookForestEntry,
  ReaderSettings,
  BookAnnotation,
  ReadingProgressRecord,
} from '../types';
import { ReaderSettingsBar } from './ReaderSettingsBar';
import { GeminiExplainerModal } from './GeminiExplainerModal';
import { AnnotationsDrawer } from './AnnotationsDrawer';
import { api } from '../utils/api';
import { createEpubBlob } from '../utils/createEpub';
import { cacheReaderFileOffline, getCachedReaderFile } from '../utils/offlineDb';

// Configure Mozilla PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface WebReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: PublishedBook | BookForestEntry | null;
  onUpdateBook?: (book: any) => void;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  marginPadding: 44,
  fontFamily: 'Merriweather',
  colorPalette: 'day',
  readingMode: 'paginated',
};

const PALETTE_THEMES = {
  day: { bg: '#fbf9ee', text: '#2a2724', name: 'day' },
  night: { bg: '#080808', text: '#e0e0e0', name: 'night' },
  sepia: { bg: '#f4ecd8', text: '#3b2e2a', name: 'sepia' },
  'blue-light': { bg: '#fef3c7', text: '#451a03', name: 'blue-light' },
};

export const WebReaderModal: React.FC<WebReaderModalProps> = ({
  isOpen,
  onClose,
  book,
  onUpdateBook,
}) => {
  // Settings & Theme
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem('storizine-reader-settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Reader State
  const [activeEngine, setActiveEngine] = useState<'epub' | 'pdf' | 'text'>('epub');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>('');
  
  // PDF specific state
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPageNum, setPdfPageNum] = useState<number>(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Annotations
  const [annotations, setAnnotations] = useState<BookAnnotation[]>([]);
  const [isAnnotationsDrawerOpen, setIsAnnotationsDrawerOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; cfiRange: string; x: number; y: number } | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteField, setShowNoteField] = useState(false);

  // Gemini Explainer
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [explainerLoading, setExplainerLoading] = useState(false);
  const [explainerData, setExplainerData] = useState<any>(null);

  // Browser Text-To-Speech (TTS)
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // EPUB References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const epubBookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  // File Upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('storizine-reader-settings', JSON.stringify(settings));
  }, [settings]);

  // Init SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // 3. Real-Time Reading Position Sync helper
  const onLocationChange = useCallback((cfiStr: string, percentage: number) => {
    if (!book) return;
    setCurrentCfi(cfiStr);
    setProgressPercentage(percentage);

    // Save and sync with backend & IndexedDB (debounced)
    api.saveReadingProgress({
      bookId: book.id,
      cfi: cfiStr,
      percentage,
    });
  }, [book]);

  // Load Annotations & Saved Progress
  useEffect(() => {
    if (!isOpen || !book) return;

    let isMounted = true;
    (async () => {
      try {
        const [savedAnns, savedProg] = await Promise.all([
          api.getAnnotations(book.id),
          api.getReadingProgress(book.id),
        ]);
        if (isMounted) {
          setAnnotations(savedAnns);
          if (savedProg && savedProg.cfi) {
            setCurrentCfi(savedProg.cfi);
            setProgressPercentage(savedProg.percentage || 0);
          }
        }
      } catch (err) {
        console.warn('Could not load annotations/progress:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, book]);

  // Setup Reader Engine when Book or Engine changes
  useEffect(() => {
    if (!isOpen || !book) return;

    let isCancelled = false;
    setLoading(true);
    setErrorMessage(null);

    const initReader = async () => {
      // Determine file format
      const hasPdf = Boolean(book.pdfUrl || (book as any).fileType === 'pdf');
      const isPdfEngine = hasPdf && activeEngine === 'pdf';

      if (isPdfEngine) {
        // PDF ENGINE (Mozilla PDF.js)
        try {
          const fileUrl = book.pdfUrl || '/sample.pdf';
          const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
          const pdf = await loadingTask.promise;
          if (isCancelled) return;
          setPdfDoc(pdf);
          setPdfTotalPages(pdf.numPages);
          setPdfPageNum(1);
          setLoading(false);
        } catch (err: any) {
          if (!isCancelled) {
            console.error('PDF Load Error:', err);
            setErrorMessage('Could not load PDF file. Falling back to EPUB viewer.');
            setActiveEngine('epub');
          }
        }
        return;
      }

      // EPUB ENGINE (epub.js)
      try {
        // Clean up previous book instance
        if (renditionRef.current) {
          try {
            renditionRef.current.destroy();
          } catch {}
          renditionRef.current = null;
        }
        if (epubBookRef.current) {
          try {
            epubBookRef.current.destroy();
          } catch {}
          epubBookRef.current = null;
        }

        if (!containerRef.current) {
          setTimeout(initReader, 50);
          return;
        }

        containerRef.current.innerHTML = '';

        // Check for cached offline file in IndexedDB
        let epubSource: any = null;
        const cached = await getCachedReaderFile(book.id);
        if (cached && cached.data) {
          epubSource = cached.data;
        } else if (book.epubUrl) {
          epubSource = book.epubUrl;
        } else {
          // Generate a valid EPUB binary on the fly from book metadata and chapter text
          const excerptText =
            (book as any).excerpt ||
            (book as any).blurb ||
            'The sun had begun to sink beneath the crystalline spires of the ancient city. A gentle breeze carried the scent of aged parchment and ozone through the open archways of the grand library...';

          const chapters = [
            {
              title: `Chapter 1: The Awakening`,
              content: excerptText,
            },
            {
              title: `Chapter 2: The Echoes of Time`,
              content: `${excerptText}\n\nAs the night fell, the stars appeared in unfamiliar constellations, casting a silver gleam across the observatory floor. Every whisper seemed to carry the weight of forgotten epochs.`,
            },
          ];

          epubSource = await createEpubBlob(book.title, (book as any).author || 'Evelyn Vance', chapters);
          // Cache in IndexedDB for offline reading
          await cacheReaderFileOffline(book.id, book.title, 'epub', epubSource);
        }

        if (isCancelled) return;

        // Initialize ePub instance
        const epubInstance = ePub(epubSource);
        epubBookRef.current = epubInstance;

        // Wait for book ready
        await epubInstance.ready;
        if (isCancelled) return;

        // Determine Flow & Manager according to Reading Mode
        const flow = settings.readingMode === 'continuous' ? 'scrolled-doc' : 'paginated';
        const manager = settings.readingMode === 'continuous' ? 'continuous' : 'default';

        const rendition = epubInstance.renderTo(containerRef.current, {
          width: '100%',
          height: '100%',
          flow,
          manager,
        });
        renditionRef.current = rendition;

        // Register custom theme
        const currentPalette = PALETTE_THEMES[settings.colorPalette];
        const fontStack =
          settings.fontFamily === 'Merriweather'
            ? 'Merriweather, Georgia, serif'
            : settings.fontFamily === 'Inter'
            ? 'Inter, system-ui, sans-serif'
            : 'OpenDyslexic, sans-serif';

        rendition.themes.register('activeTheme', {
          body: {
            color: currentPalette.text,
            background: currentPalette.bg,
            'font-family': fontStack,
            'font-size': `${settings.fontSize}px`,
            'line-height': `${settings.lineHeight}`,
            padding: '24px 32px',
          },
          p: {
            'margin-bottom': '1.25rem',
            'line-height': `${settings.lineHeight}`,
          },
          '::selection': {
            background: '#d4a37350',
          },
        });
        rendition.themes.select('activeTheme');

        // Restore initial location if saved CFI exists (Request 3: initialLocation={savedCfi})
        const savedProg = await api.getReadingProgress(book.id);
        const initialLoc = savedProg?.cfi || (book as any).lastCfi;

        if (initialLoc) {
          await rendition.display(initialLoc);
        } else {
          await rendition.display();
        }

        // Location change handler (Standard EPUB CFI navigation)
        rendition.on('relocated', (location: any) => {
          if (location && location.start) {
            const cfi = location.start.cfi;
            const pct = location.start.percentage ? Math.round(location.start.percentage * 100) : 0;
            onLocationChange(cfi, pct);

            // Get chapter title if available
            try {
              const chapter = epubInstance.spine.get(location.start.href);
              if (chapter && (chapter as any).title) {
                setCurrentChapterTitle((chapter as any).title);
              }
            } catch {}
          }
        });

        // Native hooks for 4-color text highlighting and selection annotations
        rendition.on('selected', (cfiRange: string, contents: any) => {
          const selection = contents.window.getSelection();
          const text = selection ? selection.toString().trim() : '';

          if (text) {
            // Get selection position
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setSelectedText({
              text,
              cfiRange,
              x: Math.min(window.innerWidth - 280, Math.max(20, rect.left)),
              y: Math.max(60, rect.top - 60),
            });
          }
        });

        // Apply saved annotations highlights onto the rendition
        annotations.forEach((ann) => {
          applyHighlightToRendition(rendition, ann);
        });

        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('EPUB Engine Error:', err);
          setErrorMessage('Error loading book with EPUB engine: ' + (err?.message || 'Unknown error'));
          setLoading(false);
        }
      }
    };

    initReader();

    return () => {
      isCancelled = true;
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch {}
      }
      if (epubBookRef.current) {
        try {
          epubBookRef.current.destroy();
        } catch {}
      }
    };
  }, [isOpen, book, activeEngine, settings.readingMode]);

  // Update theme & font dynamically when settings change
  useEffect(() => {
    if (!renditionRef.current) return;
    const currentPalette = PALETTE_THEMES[settings.colorPalette];
    const fontStack =
      settings.fontFamily === 'Merriweather'
        ? 'Merriweather, Georgia, serif'
        : settings.fontFamily === 'Inter'
        ? 'Inter, system-ui, sans-serif'
        : 'OpenDyslexic, sans-serif';

    renditionRef.current.themes.override('color', currentPalette.text);
    renditionRef.current.themes.override('background', currentPalette.bg);
    renditionRef.current.themes.override('font-family', fontStack);
    renditionRef.current.themes.override('font-size', `${settings.fontSize}px`);
    renditionRef.current.themes.override('line-height', `${settings.lineHeight}`);
  }, [settings]);

  // Render PDF Page when pageNum or doc changes
  useEffect(() => {
    if (activeEngine !== 'pdf' || !pdfDoc || !pdfCanvasRef.current) return;

    let isRenderCancelled = false;
    const renderPdfPage = async () => {
      try {
        const page = await pdfDoc.getPage(pdfPageNum);
        if (isRenderCancelled) return;

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;

        const viewport = page.getViewport({ scale: pdfScale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setProgressPercentage(Math.round((pdfPageNum / pdfTotalPages) * 100));
      } catch (err) {
        console.error('PDF Page render error:', err);
      }
    };

    renderPdfPage();

    return () => {
      isRenderCancelled = true;
    };
  }, [activeEngine, pdfDoc, pdfPageNum, pdfScale, pdfTotalPages]);

  // Highlight helper
  const applyHighlightToRendition = (rendition: Rendition, ann: BookAnnotation) => {
    const colorHex =
      ann.color === 'green'
        ? '#10b981'
        : ann.color === 'blue'
        ? '#0284c7'
        : ann.color === 'pink'
        ? '#f43f5e'
        : '#f59e0b';

    try {
      rendition.annotations.highlight(
        ann.cfi_range,
        {},
        () => {
          setIsAnnotationsDrawerOpen(true);
        },
        '',
        {
          fill: colorHex,
          'fill-opacity': '0.35',
          'mix-blend-mode': 'multiply',
        }
      );
    } catch {}
  };

  // Turn page forward / backward
  const handlePrevPage = () => {
    if (activeEngine === 'pdf') {
      setPdfPageNum((p) => Math.max(1, p - 1));
    } else if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

  const handleNextPage = () => {
    if (activeEngine === 'pdf') {
      setPdfPageNum((p) => Math.min(pdfTotalPages, p + 1));
    } else if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeEngine, pdfPageNum, pdfTotalPages]);

  // Add Annotation / Highlight
  const handleCreateHighlight = async (color: 'yellow' | 'green' | 'blue' | 'pink') => {
    if (!selectedText || !book) return;

    const newAnnotation = await api.saveAnnotation({
      book_id: book.id,
      cfi_range: selectedText.cfiRange,
      color,
      note: noteInput.trim() || undefined,
      highlighted_text: selectedText.text,
    });

    setAnnotations((prev) => [newAnnotation, ...prev]);

    // Apply to current rendition
    if (renditionRef.current) {
      applyHighlightToRendition(renditionRef.current, newAnnotation);
    }

    setSelectedText(null);
    setNoteInput('');
    setShowNoteField(false);
  };

  // Delete Annotation
  const handleDeleteAnnotation = async (id: string) => {
    await api.deleteAnnotation(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  // Jump to CFI location
  const handleJumpToCfi = (cfi: string) => {
    if (renditionRef.current && cfi) {
      renditionRef.current.display(cfi);
    }
  };

  // 5. Language Assistant via Gemini (Inline Explainer)
  const handleExplainSelection = async () => {
    if (!selectedText) return;
    setExplainerOpen(true);
    setExplainerLoading(true);

    try {
      const data = await api.explainTerm({
        term: selectedText.text,
        bookTitle: book?.title,
        author: (book as any)?.author,
      });
      setExplainerData(data);
    } catch (err: any) {
      setExplainerData({
        term: selectedText.text,
        definition: 'Literary term found in the text.',
        etymology: 'Classical origin',
        historicalContext: 'Referenced in context of the narrative.',
      });
    } finally {
      setExplainerLoading(false);
    }
  };

  // 5. Browser Native Text-to-Speech (TTS)
  const handleToggleTTS = () => {
    if (!synthRef.current) return;

    if (isTTSPlaying) {
      synthRef.current.cancel();
      setIsTTSPlaying(false);
      return;
    }

    // Extract text from active rendition or book excerpt
    let textToRead = '';
    if (selectedText?.text) {
      textToRead = selectedText.text;
    } else if ((book as any)?.excerpt) {
      textToRead = (book as any).excerpt;
    } else if ((book as any)?.blurb) {
      textToRead = `${book.title}. ${(book as any).blurb}`;
    }

    if (!textToRead) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsTTSPlaying(false);
    };
    utterance.onerror = () => {
      setIsTTSPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsTTSPlaying(true);
  };

  // File Upload (.epub / .pdf)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const fileType = isPdf ? 'pdf' : 'epub';

    setLoading(true);
    try {
      const res = await api.uploadFile(file, fileType);
      const updatedBook = {
        ...book,
        [isPdf ? 'pdfUrl' : 'epubUrl']: res.url,
        fileType,
      };

      if (onUpdateBook) {
        onUpdateBook(updatedBook);
      }

      setActiveEngine(fileType);
    } catch (err: any) {
      alert('File upload error: ' + (err?.message || 'Could not upload book'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !book) return null;

  const currentTheme = PALETTE_THEMES[settings.colorPalette];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col backdrop-blur-md select-text"
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
    >
      {/* 4. Top Navigation & Persistent Reader Controls Overlay */}
      <header
        className="px-4 py-2.5 border-b flex items-center justify-between shrink-0 shadow-xs z-30 transition-colors"
        style={{
          borderColor: settings.colorPalette === 'night' ? '#222' : '#ebd9c5',
          backgroundColor: currentTheme.bg,
        }}
      >
        {/* Left: Book Meta & Engine Toggle */}
        <div className="flex items-center space-x-3">
          <BookOpen className="w-5 h-5 text-[#d4a373] shrink-0" />
          <div className="hidden sm:block">
            <h2 className="font-serif font-bold text-sm sm:text-base leading-tight truncate max-w-xs sm:max-w-md">
              {book.title}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] opacity-70">
              <span>by {(book as any).author || 'Evelyn Vance'}</span>
              <span>•</span>
              <span className="font-mono text-[#d4a373]">
                {activeEngine.toUpperCase()} Engine
              </span>
              {currentChapterTitle && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[150px]">{currentChapterTitle}</span>
                </>
              )}
            </div>
          </div>

          {/* Engine Switcher if book has both or uploaded */}
          <div className="flex items-center space-x-1 p-0.5 rounded-lg border border-current/20 text-[10px] font-bold">
            <button
              onClick={() => setActiveEngine('epub')}
              className={`px-2 py-0.5 rounded ${
                activeEngine === 'epub' ? 'bg-[#d4a373] text-[#181614]' : 'opacity-60'
              }`}
            >
              EPUB
            </button>
            <button
              onClick={() => setActiveEngine('pdf')}
              className={`px-2 py-0.5 rounded ${
                activeEngine === 'pdf' ? 'bg-[#d4a373] text-[#181614]' : 'opacity-60'
              }`}
            >
              PDF
            </button>
          </div>
        </div>

        {/* Right: Controls Bar & Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* File Upload Button (.epub / .pdf) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".epub,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-current/20 hover:border-[#d4a373] text-xs font-bold transition opacity-80 hover:opacity-100"
            title="Upload an .epub or .pdf file for this book"
          >
            <Upload className="w-3.5 h-3.5 text-[#d4a373]" />
            <span>Upload File</span>
          </button>

          {/* Persistent Reader Display Controls Overlay */}
          <ReaderSettingsBar
            settings={settings}
            onChange={setSettings}
            isTTSPlaying={isTTSPlaying}
            onToggleTTS={handleToggleTTS}
            onOpenAnnotations={() => setIsAnnotationsDrawerOpen(true)}
            annotationCount={annotations.length}
          />

          {/* Close Reader */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition"
            title="Close Reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-center items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
            <div className="w-10 h-10 border-4 border-[#d4a373] border-t-transparent rounded-full animate-spin" />
            <p className="font-serif italic text-sm opacity-80">
              Loading {activeEngine.toUpperCase()} rendering engine...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-bold text-sm">{errorMessage}</p>
            <button
              onClick={() => setActiveEngine('epub')}
              className="px-4 py-2 bg-[#d4a373] text-[#181614] rounded-xl font-bold text-xs"
            >
              Switch to Standard Reader
            </button>
          </div>
        ) : activeEngine === 'pdf' ? (
          /* PDF CANVAS VIEWER (pdfjs-dist) */
          <div className="flex-1 w-full overflow-auto flex flex-col items-center justify-start p-4">
            <div className="flex items-center space-x-3 mb-3 bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
              <button
                onClick={() => setPdfScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 hover:opacity-75"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span>{Math.round(pdfScale * 100)}%</span>
              <button
                onClick={() => setPdfScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 hover:opacity-75"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span>•</span>
              <span>
                Page {pdfPageNum} / {pdfTotalPages}
              </span>
            </div>
            <div className="shadow-2xl rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <canvas ref={pdfCanvasRef} />
            </div>
          </div>
        ) : (
          /* EPUB.JS ENGINE CONTAINER */
          <div
            ref={containerRef}
            className="w-full h-full max-w-4xl mx-auto flex-1 overflow-hidden"
          />
        )}

        {/* Floating Text Selection Popup (4-color Highlighting & Gemini Explainer) */}
        {selectedText && (
          <div
            className="fixed z-50 bg-[#fffef2] dark:bg-[#1f1b18] p-2 rounded-2xl shadow-2xl border border-[#ebd9c5] dark:border-[#38332c] flex flex-col gap-2 text-xs animate-in zoom-in-90"
            style={{ left: selectedText.x, top: selectedText.y }}
          >
            <div className="flex items-center space-x-1.5">
              {/* 4-Color Highlighters (BookBuddy+ Feature) */}
              <button
                onClick={() => handleCreateHighlight('yellow')}
                className="w-6 h-6 rounded-full bg-amber-400 hover:scale-110 transition border border-amber-500 shadow-xs"
                title="Yellow Gold Highlight"
              />
              <button
                onClick={() => handleCreateHighlight('green')}
                className="w-6 h-6 rounded-full bg-emerald-400 hover:scale-110 transition border border-emerald-500 shadow-xs"
                title="Green Emerald Highlight"
              />
              <button
                onClick={() => handleCreateHighlight('blue')}
                className="w-6 h-6 rounded-full bg-sky-400 hover:scale-110 transition border border-sky-500 shadow-xs"
                title="Blue Sapphire Highlight"
              />
              <button
                onClick={() => handleCreateHighlight('pink')}
                className="w-6 h-6 rounded-full bg-rose-400 hover:scale-110 transition border border-rose-500 shadow-xs"
                title="Pink Rose Highlight"
              />

              <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

              {/* Note input toggle */}
              <button
                onClick={() => setShowNoteField(!showNoteField)}
                className="px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 font-bold text-[11px] flex items-center space-x-1"
                title="Add annotation note"
              >
                <Bookmark className="w-3 h-3 text-[#d4a373]" />
                <span>Note</span>
              </button>

              {/* 5. Language Assistant via Gemini */}
              <button
                onClick={handleExplainSelection}
                className="px-2.5 py-1 rounded-xl bg-[#d4a373] text-[#181614] font-bold text-[11px] flex items-center space-x-1 hover:bg-[#c39262] transition shadow-xs"
                title="Ask Gemini for contextual definition and etymology"
              >
                <Sparkles className="w-3 h-3" />
                <span>Explain Term</span>
              </button>

              <button
                onClick={() => setSelectedText(null)}
                className="p-1 opacity-50 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {showNoteField && (
              <div className="flex items-center space-x-1 pt-1 border-t border-[#ebd9c5] dark:border-[#38332c]">
                <input
                  type="text"
                  placeholder="Type margin note..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateHighlight('yellow')}
                  className="px-2 py-1 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] bg-white dark:bg-black/20 text-xs w-48 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => handleCreateHighlight('yellow')}
                  className="px-2 py-1 bg-[#d4a373] text-[#181614] font-bold rounded-lg text-[10px]"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}

        {/* Previous & Next Page Nav Buttons (Physical Book Click/Swipe feel) */}
        <button
          onClick={handlePrevPage}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 backdrop-blur-md opacity-70 hover:opacity-100 transition active:scale-95 z-20"
          title="Previous Page (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={handleNextPage}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 backdrop-blur-md opacity-70 hover:opacity-100 transition active:scale-95 z-20"
          title="Next Page (Right Arrow)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Reader Bottom Status & Progress Bar (CFI / Percentage Sync) */}
      <footer
        className="px-6 py-2.5 border-t flex items-center justify-between shrink-0 text-xs font-mono"
        style={{
          borderColor: settings.colorPalette === 'night' ? '#222' : '#ebd9c5',
          backgroundColor: currentTheme.bg,
        }}
      >
        <div className="flex items-center space-x-3 opacity-70">
          <span>{book.title}</span>
          {activeEngine === 'pdf' && (
            <span>
              • Page {pdfPageNum} / {pdfTotalPages}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center space-x-3 w-1/3 max-w-xs">
          <div className="flex-1 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#d4a373] h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-[#d4a373] shrink-0">
            {progressPercentage}%
          </span>
        </div>

        <div className="opacity-70 text-[10px] hidden sm:block">
          {currentCfi ? `CFI: ${currentCfi.slice(0, 18)}...` : 'Reflowable Layout'}
        </div>
      </footer>

      {/* 2. Annotations & Highlights Drawer */}
      <AnnotationsDrawer
        isOpen={isAnnotationsDrawerOpen}
        onClose={() => setIsAnnotationsDrawerOpen(false)}
        annotations={annotations}
        onDeleteAnnotation={handleDeleteAnnotation}
        onJumpToCfi={handleJumpToCfi}
        bookTitle={book.title}
      />

      {/* 5. Gemini Explainer Modal */}
      <GeminiExplainerModal
        isOpen={explainerOpen}
        onClose={() => setExplainerOpen(false)}
        data={explainerData}
        loading={explainerLoading}
        onSpeak={(text) => {
          if (!synthRef.current) return;
          synthRef.current.cancel();
          const u = new SpeechSynthesisUtterance(text);
          synthRef.current.speak(u);
        }}
      />
    </div>
  );
};
