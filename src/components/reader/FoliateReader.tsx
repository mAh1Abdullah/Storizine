import React, { useEffect, useRef, useState, useCallback } from 'react';
import ePub, { Book as EpubBookInstance, Rendition as EpubRenditionInstance } from 'epubjs';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import {
  ReaderSettings,
  BookAnnotation,
  BookForestEntry,
  BookForestItem,
  PublishedBook,
  ReadingProgressRecord
} from '../../types';
import { ReaderToolbar } from './ReaderToolbar';
import { SelectionToolbar } from './SelectionToolbar';
import { AnnotationsDrawer } from '../AnnotationsDrawer';
import { api } from '../../utils/api';
import { createEpubBlob } from '../../utils/createEpub';
import { cacheFileBlobOffline, getCachedFileBlobOffline } from '../../utils/offlineDb';

// PDF worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

interface FoliateReaderProps {
  book: PublishedBook | BookForestEntry | BookForestItem | any;
  onClose: () => void;
  onUpdateBook?: (updatedBook: any) => void;
}

export const FoliateReader: React.FC<FoliateReaderProps> = ({
  book,
  onClose,
  onUpdateBook,
}) => {
  // Settings state with Foliate extensions
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 22,
    lineHeight: 1.65,
    marginPadding: 44,
    fontFamily: 'Merriweather',
    colorPalette: 'day',
    readingMode: 'paginated',
  });

  // Navigation & Progress States
  const [readingPercentage, setReadingPercentage] = useState(0);
  const [currentCfi, setCurrentCfi] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(book?.pages || 320);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Annotations
  const [annotations, setAnnotations] = useState<BookAnnotation[]>([]);
  const [isAnnotationsOpen, setIsAnnotationsOpen] = useState(false);

  // Selection & Popups
  const [selectionData, setSelectionData] = useState<{
    text: string;
    cfiRange?: string;
    coords: { x: number; y: number };
  } | null>(null);

  // Audio & TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Engines Refs
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const epubContainerRef = useRef<HTMLDivElement | null>(null);
  const bookInstanceRef = useRef<EpubBookInstance | null>(null);
  const renditionRef = useRef<EpubRenditionInstance | null>(null);

  // PDF Engine Refs
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfScale, setPdfScale] = useState(1.2);
  const [pdfPageNum, setPdfPageNum] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(1);

  // Local File Upload trigger
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadedFileUrl, setLoadedFileUrl] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<'epub' | 'pdf' | 'text' | 'mobi' | 'markdown'>('text');

  // Format determination
  const determineFormat = (targetBook: any): 'epub' | 'pdf' | 'text' | 'mobi' | 'markdown' => {
    if (targetBook?.readingEngine?.format) return targetBook.readingEngine.format;
    if (targetBook?.fileType) return targetBook.fileType;
    if (targetBook?.pdfUrl || targetBook?.readingEngine?.fileUrl?.endsWith('.pdf')) return 'pdf';
    if (targetBook?.epubUrl || targetBook?.readingEngine?.fileUrl?.endsWith('.epub')) return 'epub';
    if (targetBook?.txtUrl || targetBook?.readingEngine?.fileUrl?.endsWith('.txt')) return 'text';
    return 'text';
  };

  // Palette Color Map
  const paletteThemeMap = {
    day: { bg: '#fbf9ee', text: '#2a2724', link: '#b07843', selection: 'rgba(212, 163, 115, 0.35)' },
    sepia: { bg: '#ede2cc', text: '#3c3429', link: '#8c5825', selection: 'rgba(180, 130, 80, 0.4)' },
    night: { bg: '#181614', text: '#ece8df', link: '#d4a373', selection: 'rgba(212, 163, 115, 0.3)' },
    oled: { bg: '#000000', text: '#e2ded6', link: '#d4a373', selection: 'rgba(255, 255, 255, 0.25)' },
    'blue-light': { bg: '#2b1f17', text: '#fae5c3', link: '#f0b368', selection: 'rgba(240, 179, 104, 0.35)' },
  };

  const activeTheme = paletteThemeMap[settings.colorPalette] || paletteThemeMap.day;

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Load Saved Reading Progress & Annotations
  useEffect(() => {
    if (!book?.id) return;

    // Load reading progress
    api.getReadingProgress(book.id).then((progress) => {
      if (progress) {
        if (progress.cfi) setCurrentCfi(progress.cfi);
        if (progress.percentage) setReadingPercentage(progress.percentage);
      }
    });

    // Load annotations
    api.getAnnotations(book.id).then((items) => {
      if (items) setAnnotations(items);
    });
  }, [book?.id]);

  // Handle Local File Selection (.epub, .pdf, .txt, .mobi, .markdown)
  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const objectUrl = URL.createObjectURL(file);
    setLoadedFileUrl(objectUrl);

    // Cache file blob to offline IndexedDB
    cacheFileBlobOffline(`book-${book.id || 'local'}-${file.name}`, file).catch(() => {});

    if (fileName.endsWith('.pdf')) {
      setActiveFormat('pdf');
    } else if (fileName.endsWith('.epub')) {
      setActiveFormat('epub');
    } else {
      setActiveFormat('text');
    }
  };

  // Render PDF Engine
  const renderPdfPage = useCallback(
    async (pageNumber: number, pdf: any) => {
      if (!pdf || !pdfCanvasRef.current) return;
      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: pdfScale });
        const canvas = pdfCanvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
        setPdfPageNum(pageNumber);
        const percent = Math.round((pageNumber / pdf.numPages) * 100);
        setReadingPercentage(percent);
        api.saveReadingProgress({
          bookId: book.id,
          cfi: `page-${pageNumber}`,
          percentage: percent,
        });
      } catch (err) {
        console.error('PDF Page render error', err);
      }
    },
    [book.id, pdfScale]
  );

  // Initialize Isolated Iframe Reader for Text/Markdown/Fallback
  const initIframeIsolatedReader = useCallback(
    (textContent: string) => {
      if (!iframeRef.current) return;
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const paragraphs = textContent
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => {
          if (p.startsWith('# ')) {
            return `<h1>${p.replace('# ', '')}</h1>`;
          } else if (p.startsWith('## ')) {
            return `<h2>${p.replace('## ', '')}</h2>`;
          }
          return `<p>${p}</p>`;
        })
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Fira+Code&family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=OpenDyslexic&display=swap" rel="stylesheet">
          <style id="foliate-styles">
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background-color: ${activeTheme.bg};
              color: ${activeTheme.text};
              font-family: ${settings.fontFamily}, Merriweather, Georgia, serif;
              font-size: ${settings.fontSize}pt;
              line-height: ${settings.lineHeight};
              transition: background-color 0.2s, color 0.2s;
              overflow-x: hidden;
            }
            body {
              padding: 40px ${settings.marginPadding}px 120px ${settings.marginPadding}px;
              max-width: 900px;
              margin: 0 auto;
            }
            h1 {
              font-family: 'Cinzel', Georgia, serif;
              font-size: 1.8em;
              text-align: center;
              margin-bottom: 1.5em;
              color: ${activeTheme.link};
            }
            h2 {
              font-size: 1.3em;
              margin-top: 1.8em;
              margin-bottom: 0.8em;
              color: ${activeTheme.link};
            }
            p {
              margin-bottom: 1.4em;
              text-indent: 1.8em;
              text-align: justify;
              hyphens: auto;
            }
            p:first-of-type {
              text-indent: 0;
            }
            p:first-of-type::first-letter {
              float: left;
              font-family: 'Cinzel', serif;
              font-size: 3.2em;
              line-height: 0.8;
              padding-top: 4px;
              padding-right: 8px;
              padding-bottom: 4px;
              color: ${activeTheme.link};
              font-weight: bold;
            }
            ::selection {
              background: ${activeTheme.selection};
            }
            .foliate-highlight-yellow { background-color: rgba(251, 191, 36, 0.45); border-bottom: 2px solid #f59e0b; }
            .foliate-highlight-green { background-color: rgba(52, 211, 153, 0.45); border-bottom: 2px solid #10b981; }
            .foliate-highlight-blue { background-color: rgba(56, 189, 248, 0.45); border-bottom: 2px solid #0284c7; }
            .foliate-highlight-pink { background-color: rgba(244, 114, 182, 0.45); border-bottom: 2px solid #ec4899; }
          </style>
        </head>
        <body>
          <h1>${book.title || 'Untitled Work'}</h1>
          ${paragraphs}
        </body>
        </html>
      `);
      doc.close();

      // Listen for text selections inside iframe
      const handleIframeSelection = () => {
        const selection = doc.getSelection();
        const selectedStr = selection?.toString().trim();
        if (!selectedStr || selectedStr.length === 0) {
          return;
        }

        const range = selection?.getRangeAt(0);
        if (!range) return;

        const rect = range.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();

        setSelectionData({
          text: selectedStr,
          coords: {
            x: iframeRect.left + rect.left + rect.width / 2,
            y: iframeRect.top + rect.top,
          },
        });
      };

      doc.addEventListener('mouseup', handleIframeSelection);
      doc.addEventListener('touchend', handleIframeSelection);

      // Track scroll progress inside iframe
      const handleScroll = () => {
        const scrollEl = doc.documentElement;
        const total = scrollEl.scrollHeight - scrollEl.clientHeight;
        if (total > 0) {
          const current = scrollEl.scrollTop;
          const pct = Math.min(100, Math.round((current / total) * 100));
          setReadingPercentage(pct);
          api.saveReadingProgress({
            bookId: book.id,
            cfi: `scroll-${current}`,
            percentage: pct,
          });
        }
      };

      iframe.contentWindow?.addEventListener('scroll', handleScroll);
      setLoading(false);
    },
    [activeTheme, book.id, book.title, settings]
  );

  // Main Loader Effect
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setErrorMessage(null);

    const format = loadedFileUrl ? activeFormat : determineFormat(book);
    setActiveFormat(format);

    const initEngine = async () => {
      try {
        if (format === 'pdf') {
          // PDF Engine
          const pdfUrl = loadedFileUrl || book.pdfUrl || book?.readingEngine?.fileUrl || '/sample.pdf';
          const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
          const pdf = await loadingTask.promise;
          if (isCancelled) return;
          setPdfDoc(pdf);
          setPdfTotalPages(pdf.numPages);
          setPdfPageNum(1);
          renderPdfPage(1, pdf);
          setLoading(false);
        } else if (format === 'epub') {
          // EPUB Engine
          let epubSource = loadedFileUrl || book.epubUrl || book?.readingEngine?.fileUrl;

          // If no direct epub URL, dynamically bundle into EPUB blob
          if (!epubSource) {
            const buffer = await createEpubBlob(
              book.title || 'Storizine Edition',
              book.author || 'Author',
              [
                {
                  title: book.title || 'Chapter 1',
                  content: book.excerpt || book.blurb || 'Sample chapter text for Storizine Reader.',
                },
              ]
            );
            epubSource = buffer as any;
          }

          if (epubContainerRef.current) {
            epubContainerRef.current.innerHTML = '';
            const bookInstance = ePub(epubSource);
            bookInstanceRef.current = bookInstance;

            const rendition = bookInstance.renderTo(epubContainerRef.current, {
              width: '100%',
              height: '100%',
              flow: settings.readingMode === 'continuous' ? 'scrolled-doc' : 'paginated',
              spread: 'none',
            });
            renditionRef.current = rendition;

            rendition.themes.register('custom', {
              body: {
                'background-color': activeTheme.bg,
                color: activeTheme.text,
                'font-family': `${settings.fontFamily}, Georgia, serif !important`,
                'font-size': `${settings.fontSize}pt !important`,
                'line-height': `${settings.lineHeight} !important`,
                padding: `0 ${settings.marginPadding}px !important`,
              },
              p: {
                'margin-bottom': '1.3em !important',
                'text-indent': '1.5em !important',
              },
            });
            rendition.themes.select('custom');

            // Hook text selection in EPUB
            rendition.on('selected', (cfiRange: string, contents: any) => {
              const text = rendition.getRange(cfiRange).toString();
              if (text && text.trim()) {
                const rect = contents.window.getSelection()?.getRangeAt(0)?.getBoundingClientRect();
                const containerRect = epubContainerRef.current?.getBoundingClientRect();
                if (rect && containerRect) {
                  setSelectionData({
                    text: text.trim(),
                    cfiRange,
                    coords: {
                      x: containerRect.left + rect.left + rect.width / 2,
                      y: containerRect.top + rect.top,
                    },
                  });
                }
              }
            });

            // Track location
            rendition.on('relocated', (location: any) => {
              if (location?.start?.cfi) {
                setCurrentCfi(location.start.cfi);
                const pct = Math.round((location.start.percentage || 0) * 100);
                setReadingPercentage(pct);
                api.saveReadingProgress({
                  bookId: book.id,
                  cfi: location.start.cfi,
                  percentage: pct,
                });
              }
            });

            await rendition.display(currentCfi || undefined);
            setLoading(false);
          }
        } else {
          // Text / Markdown isolated iframe fallback
          const rawText =
            book.excerpt ||
            book.blurb ||
            `# ${book.title}\n\nBy ${book.author || 'Author'}\n\n` +
              'The ancient scriptorium smelled of aged parchment, dried lavender, and beeswax candles. ' +
              'Outside the high leaded-glass windows, autumn twilight settled across the cloistered courtyards of Veridia.\n\n' +
              'Evelyn ran her fingertips across the embossed morocco leather of the codex. ' +
              'Within these leaves lay secrets older than empires, waiting for a reader with the patience to unlock them.\n\n' +
              'Every word felt alive, humming with forgotten enchantments and the quiet rhythm of history.';
          initIframeIsolatedReader(rawText);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Reader load fallback', err);
          initIframeIsolatedReader(book.excerpt || book.blurb || 'Sample text loaded in Foliate isolation.');
        }
      }
    };

    initEngine();

    return () => {
      isCancelled = true;
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [book, loadedFileUrl, activeFormat, settings.readingMode]);

  // Update Iframe Styles dynamically when settings change
  useEffect(() => {
    if (activeFormat === 'text' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      const styleEl = doc?.getElementById('foliate-styles');
      if (styleEl) {
        styleEl.innerHTML = `
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background-color: ${activeTheme.bg};
            color: ${activeTheme.text};
            font-family: ${settings.fontFamily}, Merriweather, Georgia, serif;
            font-size: ${settings.fontSize}pt;
            line-height: ${settings.lineHeight};
            transition: background-color 0.2s, color 0.2s;
            overflow-x: hidden;
          }
          body {
            padding: 40px ${settings.marginPadding}px 120px ${settings.marginPadding}px;
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 1.8em;
            text-align: center;
            margin-bottom: 1.5em;
            color: ${activeTheme.link};
          }
          h2 {
            font-size: 1.3em;
            margin-top: 1.8em;
            margin-bottom: 0.8em;
            color: ${activeTheme.link};
          }
          p {
            margin-bottom: 1.4em;
            text-indent: 1.8em;
            text-align: justify;
            hyphens: auto;
          }
          p:first-of-type {
            text-indent: 0;
          }
          p:first-of-type::first-letter {
            float: left;
            font-family: 'Cinzel', serif;
            font-size: 3.2em;
            line-height: 0.8;
            padding-top: 4px;
            padding-right: 8px;
            padding-bottom: 4px;
            color: ${activeTheme.link};
            font-weight: bold;
          }
          ::selection {
            background: ${activeTheme.selection};
          }
          .foliate-highlight-yellow { background-color: rgba(251, 191, 36, 0.45); border-bottom: 2px solid #f59e0b; }
          .foliate-highlight-green { background-color: rgba(52, 211, 153, 0.45); border-bottom: 2px solid #10b981; }
          .foliate-highlight-blue { background-color: rgba(56, 189, 248, 0.45); border-bottom: 2px solid #0284c7; }
          .foliate-highlight-pink { background-color: rgba(244, 114, 182, 0.45); border-bottom: 2px solid #ec4899; }
        `;
      }
    } else if (activeFormat === 'epub' && renditionRef.current) {
      renditionRef.current.themes.override('background-color', activeTheme.bg, true);
      renditionRef.current.themes.override('color', activeTheme.text, true);
      renditionRef.current.themes.override('font-size', `${settings.fontSize}pt`, true);
      renditionRef.current.themes.override('font-family', `${settings.fontFamily}, Georgia, serif`, true);
      renditionRef.current.themes.override('line-height', `${settings.lineHeight}`, true);
    }
  }, [settings, activeTheme, activeFormat]);

  // Turn Pages Handlers
  const handlePrevPage = () => {
    if (activeFormat === 'epub' && renditionRef.current) {
      renditionRef.current.prev();
    } else if (activeFormat === 'pdf' && pdfDoc && pdfPageNum > 1) {
      renderPdfPage(pdfPageNum - 1, pdfDoc);
    } else if (activeFormat === 'text' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.scrollBy({
        top: -window.innerHeight * 0.8,
        behavior: 'smooth',
      });
    }
  };

  const handleNextPage = () => {
    if (activeFormat === 'epub' && renditionRef.current) {
      renditionRef.current.next();
    } else if (activeFormat === 'pdf' && pdfDoc && pdfPageNum < pdfTotalPages) {
      renderPdfPage(pdfPageNum + 1, pdfDoc);
    } else if (activeFormat === 'text' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.scrollBy({
        top: window.innerHeight * 0.8,
        behavior: 'smooth',
      });
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (selectionData) {
          setSelectionData(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectionData, activeFormat, pdfPageNum, pdfDoc]);

  // Handle Highlights
  const handleHighlight = async (color: 'yellow' | 'green' | 'blue' | 'pink') => {
    if (!selectionData?.text) return;

    const newAnnotation: BookAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      book_id: book.id,
      user_id: 'local-reader',
      cfi_range: selectionData.cfiRange || `text-${Date.now()}`,
      color,
      highlighted_text: selectionData.text,
      created_at: new Date().toISOString(),
    };

    // Save annotation
    await api.saveAnnotation(newAnnotation);
    setAnnotations((prev) => [newAnnotation, ...prev]);

    // Apply highlight class inside iframe
    if (activeFormat === 'text' && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      const sel = doc?.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const span = doc.createElement('span');
        span.className = `foliate-highlight-${color}`;
        try {
          range.surroundContents(span);
        } catch {
          // surroundContents can fail across tags, fall back gracefully
        }
      }
    }

    setSelectionData(null);
  };

  // Text-to-Speech Handler
  const handleSpeakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen overflow-hidden transition-colors"
    >
      {/* Hidden File Input for .epub, .pdf, .txt, .mobi, .markdown */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLocalFileSelect}
        accept=".epub,.pdf,.txt,.markdown,.md"
        className="hidden"
      />

      {/* Foliate Display Toolbar */}
      <ReaderToolbar
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        isSpeaking={isSpeaking}
        onToggleSpeech={() => {
          if (isSpeaking) {
            synthRef.current?.cancel();
            setIsSpeaking(false);
          } else {
            handleSpeakText(selectionData?.text || book.excerpt || book.blurb || book.title);
          }
        }}
        onToggleAnnotations={() => setIsAnnotationsOpen(!isAnnotationsOpen)}
        annotationCount={annotations.length}
        onClose={onClose}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        currentTitle={book.title || 'Untitled'}
        currentAuthor={book.author}
        readingPercentage={readingPercentage}
      />

      {/* Main Reading Surface */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-inherit">
            <Loader2 className="w-8 h-8 text-[#d4a373] animate-spin mb-3" />
            <p className="text-sm font-serif italic opacity-75">Opening Foliate Core Reader...</p>
          </div>
        )}

        {/* 1. EPUB Container */}
        {activeFormat === 'epub' && (
          <div
            ref={epubContainerRef}
            className="w-full h-full max-w-4xl mx-auto px-4"
          />
        )}

        {/* 2. PDF Engine */}
        {activeFormat === 'pdf' && (
          <div className="w-full h-full overflow-auto flex flex-col items-center p-6 space-y-4">
            <div className="flex items-center space-x-3 bg-[#ebd9c5]/30 dark:bg-[#2e2a25]/60 px-4 py-1.5 rounded-full text-xs font-mono">
              <button
                onClick={() => setPdfScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 hover:text-[#d4a373]"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span>{Math.round(pdfScale * 100)}%</span>
              <button
                onClick={() => setPdfScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 hover:text-[#d4a373]"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="border-l border-[#ebd9c5] pl-3">
                Page {pdfPageNum} of {pdfTotalPages}
              </span>
            </div>
            <div className="shadow-2xl rounded-lg overflow-hidden border border-[#ebd9c5]/40">
              <canvas ref={pdfCanvasRef} />
            </div>
          </div>
        )}

        {/* 3. Iframe Isolated Text / Markdown Engine */}
        {activeFormat !== 'epub' && activeFormat !== 'pdf' && (
          <iframe
            ref={iframeRef}
            title="Foliate Reader Core"
            sandbox="allow-same-origin allow-scripts"
            className="w-full h-full border-0 select-text"
          />
        )}

        {/* Navigation Gutters (Click to Turn Page) */}
        <button
          onClick={handlePrevPage}
          title="Previous Page (ArrowLeft)"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 hover:bg-[#d4a373] hover:text-white shadow-md z-20 hidden md:block"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextPage}
          title="Next Page (ArrowRight)"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity bg-black/10 dark:bg-white/10 hover:bg-[#d4a373] hover:text-white shadow-md z-20 hidden md:block"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </main>

      {/* Contextual WordLens & AI Selection Toolbar */}
      {selectionData && (
        <SelectionToolbar
          selectedText={selectionData.text}
          position={selectionData.coords}
          onClose={() => setSelectionData(null)}
          onHighlight={handleHighlight}
          onSpeak={handleSpeakText}
          bookTitle={book.title}
          author={book.author}
        />
      )}

      {/* Annotations Drawer */}
      <AnnotationsDrawer
        isOpen={isAnnotationsOpen}
        onClose={() => setIsAnnotationsOpen(false)}
        annotations={annotations}
        onDeleteAnnotation={async (id) => {
          await api.deleteAnnotation(id);
          setAnnotations((prev) => prev.filter((a) => a.id !== id));
        }}
        onNavigateToCfi={(cfi) => {
          if (activeFormat === 'epub' && renditionRef.current) {
            renditionRef.current.display(cfi);
          }
        }}
      />

      {/* Bottom Progress Bar */}
      <footer className="relative z-30 flex items-center justify-between px-4 py-2 border-t border-[#ebd9c5] dark:border-[#2e2a25] bg-[#fbf9ee]/90 dark:bg-[#181614]/90 backdrop-blur-md text-[11px] font-mono select-none">
        <div className="flex items-center space-x-2">
          <span className="capitalize">{activeFormat} Engine</span>
          <span>•</span>
          <span className="text-[#d4a373] font-bold">{Math.round(readingPercentage)}%</span>
        </div>

        {/* Scrub Bar */}
        <div className="flex-1 max-w-xs mx-4">
          <div className="w-full bg-[#ebd9c5]/50 dark:bg-[#2e2a25] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#d4a373] h-full transition-all duration-300"
              style={{ width: `${readingPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            className="p-1 hover:text-[#d4a373]"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={handleNextPage}
            className="p-1 hover:text-[#d4a373]"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
