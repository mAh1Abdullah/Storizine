import React, { useState } from 'react';
import { X, Type, BookOpen, Sun, Moon, Coffee, Sparkles } from 'lucide-react';
import { PublishedBook } from '../types';

interface SampleChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: PublishedBook | null;
}

export const SampleChapterModal: React.FC<SampleChapterModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readerTheme, setReaderTheme] = useState<'sepia' | 'light' | 'dark'>('sepia');

  if (!isOpen || !book) return null;

  const fontClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  };

  const themeClasses = {
    sepia: 'bg-[#fffef2] text-[#2a2724] border-[#ebd9c5]',
    light: 'bg-[#fbf9ee] text-[#2a2724] border-[#ebd9c5]',
    dark: 'bg-[#181614] text-[#f5f2e6] border-[#38332c]',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-colors ${themeClasses[readerTheme]}`}>
        
        {/* Reader Top Toolbar */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 opacity-80" />
            <div>
              <h3 className="font-serif font-bold text-base leading-snug">
                {book.title}
              </h3>
              <p className="text-xs opacity-75">
                Sample Excerpt • {book.series ? `${book.series} #${book.seriesNumber}` : book.genre}
              </p>
            </div>
          </div>

          {/* Reader Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Font Size Controls */}
            <div className="flex items-center space-x-1 border rounded-lg p-1 bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'sm' ? 'bg-amber-800 text-white' : 'opacity-70'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'base' ? 'bg-amber-800 text-white' : 'opacity-70'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 text-xs font-bold rounded ${fontSize === 'lg' ? 'bg-amber-800 text-white' : 'opacity-70'}`}
              >
                A+
              </button>
            </div>

            {/* Theme Switches */}
            <div className="flex items-center space-x-1 border rounded-lg p-1 bg-black/5 dark:bg-white/5">
              <button
                onClick={() => setReaderTheme('sepia')}
                className={`p-1 rounded ${readerTheme === 'sepia' ? 'bg-[#e7d7b8] text-[#433422]' : 'opacity-70'}`}
                title="Sepia Mode"
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('light')}
                className={`p-1 rounded ${readerTheme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-70'}`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReaderTheme('dark')}
                className={`p-1 rounded ${readerTheme === 'dark' ? 'bg-slate-900 text-white' : 'opacity-70'}`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Reading Canvas */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-serif">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 pb-6 border-b border-black/10 dark:border-white/10">
              <span className="text-xs tracking-widest font-sans uppercase font-bold opacity-60">
                Exclusive Preview Excerpt
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {book.title}
              </h2>
              <p className="text-xs font-sans opacity-75">
                Published by {book.publisher} • Release: {book.releaseDate}
              </p>
            </div>

            <div className={`${fontClasses[fontSize]} whitespace-pre-line tracking-normal space-y-4`}>
              {book.excerpt || 'Sample chapter excerpt is currently being updated by the publisher.'}
            </div>

            <div className="pt-8 mt-8 border-t border-black/10 dark:border-white/10 text-center space-y-4">
              <p className="text-xs font-sans opacity-70">
                Enjoyed reading this preview? Grab your full edition below:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {book.buyLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-sans font-bold transition-colors shadow-sm"
                  >
                    Buy on {link.vendor} {link.price && `(${link.price})`}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
