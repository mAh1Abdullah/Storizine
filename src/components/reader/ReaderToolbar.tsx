import React, { useState } from 'react';
import {
  Type,
  Sun,
  Moon,
  Coffee,
  Flame,
  Columns,
  Scroll,
  Volume2,
  VolumeX,
  Bookmark,
  Maximize2,
  Minimize2,
  X,
  Upload,
  Settings,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { ReaderSettings, ReaderPalette, ReaderFontFamily, ReadingMode } from '../../types';

interface ReaderToolbarProps {
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onToggleAnnotations: () => void;
  annotationCount: number;
  onClose: () => void;
  onOpenFilePicker: () => void;
  currentTitle: string;
  currentAuthor?: string;
  readingPercentage: number;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  settings,
  onUpdateSettings,
  isSpeaking,
  onToggleSpeech,
  onToggleAnnotations,
  annotationCount,
  onClose,
  onOpenFilePicker,
  currentTitle,
  currentAuthor,
  readingPercentage,
}) => {
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const palettes: { id: ReaderPalette; label: string; bgClass: string; textClass: string; icon: any }[] = [
    { id: 'day', label: 'Parchment', bgClass: 'bg-[#fbf9ee]', textClass: 'text-[#2a2724]', icon: Sun },
    { id: 'sepia', label: 'Sepia Paper', bgClass: 'bg-[#ede2cc]', textClass: 'text-[#3c3429]', icon: Coffee },
    { id: 'night', label: 'Night Slate', bgClass: 'bg-[#181614]', textClass: 'text-[#ece8df]', icon: Moon },
    { id: 'oled', label: 'OLED Night', bgClass: 'bg-[#000000]', textClass: 'text-[#e2ded6]', icon: Moon },
    { id: 'blue-light', label: 'Warm Amber', bgClass: 'bg-[#2b1f17]', textClass: 'text-[#fae5c3]', icon: Flame },
  ];

  const fontFamilies: { id: ReaderFontFamily; label: string; sample: string }[] = [
    { id: 'Merriweather', label: 'Merriweather', sample: 'Serif Classic' },
    { id: 'Georgia', label: 'Georgia', sample: 'Editorial' },
    { id: 'Inter', label: 'Inter', sample: 'Modern Sans' },
    { id: 'OpenDyslexic', label: 'OpenDyslexic', sample: 'High Legibility' },
    { id: 'Cinzel', label: 'Cinzel', sample: 'Mythic Roman' },
    { id: 'Fira Code', label: 'Fira Code', sample: 'Monospace' },
  ];

  return (
    <>
      <header className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-[#fbf9ee]/95 dark:bg-[#181614]/95 backdrop-blur-md border-b border-[#ebd9c5] dark:border-[#2e2a25] transition-colors select-none">
        {/* Left: Title & File Info */}
        <div className="flex items-center space-x-3 max-w-[45%]">
          <div className="w-8 h-8 rounded-lg bg-[#d4a373]/20 flex items-center justify-center text-[#d4a373] shrink-0 font-serif font-bold text-xs">
            F
          </div>
          <div className="truncate">
            <h1 className="text-sm font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] truncate leading-tight">
              {currentTitle}
            </h1>
            <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate">
              {currentAuthor ? `${currentAuthor} • ` : ''}
              <span className="font-mono text-[#d4a373] font-medium">{Math.round(readingPercentage)}% read</span>
            </p>
          </div>
        </div>

        {/* Center / Right: Quick Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Open Local Book */}
          <button
            onClick={onOpenFilePicker}
            title="Open local book (.epub, .pdf, .txt, .mobi)"
            className="p-2 rounded-xl text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25] transition-colors"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Text-to-Speech */}
          <button
            onClick={onToggleSpeech}
            title={isSpeaking ? 'Stop Audio Narration' : 'Listen with Text-to-Speech'}
            className={`p-2 rounded-xl transition-all ${
              isSpeaking
                ? 'bg-amber-500 text-white shadow-sm animate-pulse'
                : 'text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25]'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Annotations Drawer Toggle */}
          <button
            onClick={onToggleAnnotations}
            title="Saved Annotations & Notes"
            className="relative p-2 rounded-xl text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25] transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            {annotationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4a373] text-[#fffef2] text-[9px] font-bold flex items-center justify-center">
                {annotationCount}
              </span>
            )}
          </button>

          {/* Quick Font Size Buttons */}
          <div className="hidden md:flex items-center bg-[#ebd9c5]/30 dark:bg-[#2e2a25]/60 rounded-xl p-0.5 border border-[#ebd9c5]/50 dark:border-[#2e2a25]">
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
              className="px-2 py-1 text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] hover:bg-white/50 dark:hover:bg-black/30 rounded-lg transition-colors"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[11px] font-mono px-1.5 text-[#d4a373] font-semibold">{settings.fontSize}pt</span>
            <button
              onClick={() => onUpdateSettings({ fontSize: Math.min(72, settings.fontSize + 2) })}
              className="px-2 py-1 text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] hover:bg-white/50 dark:hover:bg-black/30 rounded-lg transition-colors"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Reading Mode Switcher (Paginated vs Continuous) */}
          <button
            onClick={() => onUpdateSettings({ readingMode: settings.readingMode === 'paginated' ? 'continuous' : 'paginated' })}
            title={settings.readingMode === 'paginated' ? 'Switch to Continuous Scroll' : 'Switch to Paginated View'}
            className="p-2 rounded-xl text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25] transition-colors hidden sm:block"
          >
            {settings.readingMode === 'paginated' ? <Columns className="w-4 h-4" /> : <Scroll className="w-4 h-4" />}
          </button>

          {/* Display & Typography Drawer Button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Reader Display Settings (Theme, Margins, Typography)"
            className={`p-2 rounded-xl transition-all ${
              showSettingsDrawer
                ? 'bg-[#d4a373] text-white shadow-sm'
                : 'text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25]'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-xl text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-[#ebd9c5]/50 dark:hover:bg-[#2e2a25] transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Reader */}
          <button
            onClick={onClose}
            title="Close Reader"
            className="p-2 rounded-xl text-[#2a2724]/75 dark:text-[#f5f2e6]/75 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Display Controls Overlay */}
      {showSettingsDrawer && (
        <div className="absolute top-14 right-4 z-40 w-80 sm:w-96 rounded-2xl bg-[#fbf9ee] dark:bg-[#1a1714] border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#2e2a25] pb-3">
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-[#d4a373]" />
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                Foliate Display Controls
              </h3>
            </div>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-[#2a2724]/50 dark:text-[#f5f2e6]/50 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Theme Switchers */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Color Palettes
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {palettes.map((p) => {
                const isSelected = settings.colorPalette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onUpdateSettings({ colorPalette: p.id })}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${p.bgClass} ${
                      isSelected
                        ? 'border-[#d4a373] ring-2 ring-[#d4a373]/30 scale-102'
                        : 'border-[#ebd9c5] dark:border-[#38332c] hover:border-[#d4a373]/60'
                    }`}
                  >
                    <p.icon className={`w-4 h-4 ${p.textClass} mb-1`} />
                    <span className={`text-[9px] font-medium ${p.textClass} leading-tight truncate w-full`}>
                      {p.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Typeface Family */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {fontFamilies.map((f) => {
                const isSelected = settings.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ fontFamily: f.id })}
                    className={`px-3 py-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#d4a373]/15 border-[#d4a373] text-[#2a2724] dark:text-[#f5f2e6]'
                        : 'border-[#ebd9c5] dark:border-[#38332c] hover:bg-[#ebd9c5]/20 dark:hover:bg-[#221f1c] text-[#2a2724]/80 dark:text-[#f5f2e6]/80'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{f.label}</div>
                    <div className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">{f.sample}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Font Size Scaler (12pt to 72pt) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Font Size Scaler</span>
              <span className="font-mono text-xs text-[#d4a373] font-bold">{settings.fontSize} pt</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              step="1"
              value={settings.fontSize}
              onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#2a2724]/40 dark:text-[#f5f2e6]/40">
              <span>12pt (Dense)</span>
              <span>24pt (Standard)</span>
              <span>48pt</span>
              <span>72pt (Grand)</span>
            </div>
          </div>

          {/* 4. Line-Height Slider (1.0 to 2.8) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Line Height</span>
              <span className="font-mono text-xs text-[#d4a373] font-bold">{settings.lineHeight.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.8"
              step="0.05"
              value={settings.lineHeight}
              onChange={(e) => onUpdateSettings({ lineHeight: Number(e.target.value) })}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#2a2724]/40 dark:text-[#f5f2e6]/40">
              <span>1.0x (Tight)</span>
              <span>1.6x (Optimal)</span>
              <span>2.8x (Airy)</span>
            </div>
          </div>

          {/* 5. Margin Padding Slider (12px to 96px) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Page Margin Padding</span>
              <span className="font-mono text-xs text-[#d4a373] font-bold">{settings.marginPadding} px</span>
            </div>
            <input
              type="range"
              min="12"
              max="96"
              step="4"
              value={settings.marginPadding}
              onChange={(e) => onUpdateSettings({ marginPadding: Number(e.target.value) })}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#2a2724]/40 dark:text-[#f5f2e6]/40">
              <span>12px (Full Bleed)</span>
              <span>48px (Balanced)</span>
              <span>96px (Narrow Column)</span>
            </div>
          </div>

          {/* 6. Reading Mode */}
          <div className="pt-2 border-t border-[#ebd9c5]/60 dark:border-[#2e2a25] flex items-center justify-between">
            <span className="text-xs font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Pagination Style</span>
            <div className="flex items-center bg-[#ebd9c5]/40 dark:bg-[#2e2a25] p-1 rounded-xl space-x-1">
              <button
                onClick={() => onUpdateSettings({ readingMode: 'paginated' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.readingMode === 'paginated'
                    ? 'bg-white dark:bg-[#181614] text-[#d4a373] shadow-sm font-bold'
                    : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70'
                }`}
              >
                Paginated
              </button>
              <button
                onClick={() => onUpdateSettings({ readingMode: 'continuous' })}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  settings.readingMode === 'continuous'
                    ? 'bg-white dark:bg-[#181614] text-[#d4a373] shadow-sm font-bold'
                    : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70'
                }`}
              >
                Continuous
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
