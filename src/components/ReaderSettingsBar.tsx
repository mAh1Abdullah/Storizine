import React from 'react';
import {
  Type,
  Sun,
  Moon,
  Coffee,
  Eye,
  BookOpen,
  Scroll,
  Minus,
  Plus,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ReaderSettings, ReaderPalette, ReaderFontFamily, ReadingMode } from '../types';

interface ReaderSettingsBarProps {
  settings: ReaderSettings;
  onChange: (updated: ReaderSettings) => void;
  isTTSPlaying?: boolean;
  onToggleTTS?: () => void;
  onOpenAnnotations?: () => void;
  annotationCount?: number;
  className?: string;
}

export const ReaderSettingsBar: React.FC<ReaderSettingsBarProps> = ({
  settings,
  onChange,
  isTTSPlaying = false,
  onToggleTTS,
  onOpenAnnotations,
  annotationCount = 0,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const palettes: { id: ReaderPalette; label: string; icon: any; bg: string; text: string; border: string }[] = [
    { id: 'day', label: 'Day (Parchment)', icon: Sun, bg: 'bg-[#fbf9ee]', text: 'text-[#2a2724]', border: 'border-[#ebd9c5]' },
    { id: 'night', label: 'Night (OLED)', icon: Moon, bg: 'bg-[#050505]', text: 'text-[#e5e5e5]', border: 'border-[#333]' },
    { id: 'sepia', label: 'Sepia (Paper)', icon: Coffee, bg: 'bg-[#f4ecd8]', text: 'text-[#3b2e2a]', border: 'border-[#d4c3a3]' },
    { id: 'blue-light', label: 'Amber Tint', icon: Eye, bg: 'bg-[#fef3c7]', text: 'text-[#451a03]', border: 'border-[#fcd34d]' },
  ];

  const fonts: { id: ReaderFontFamily; label: string; style: string }[] = [
    { id: 'Merriweather', label: 'Merriweather (Serif)', style: 'font-serif' },
    { id: 'Inter', label: 'Inter (Clean Sans)', style: 'font-sans' },
    { id: 'OpenDyslexic', label: 'OpenDyslexic', style: 'font-mono tracking-wide' },
  ];

  return (
    <div className={`relative z-40 ${className}`}>
      {/* Quick Compact Trigger Bar */}
      <div className="flex items-center space-x-2 bg-black/10 dark:bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-black/10 dark:border-white/10 text-xs">
        
        {/* Quick Font Size Buttons */}
        <div className="flex items-center space-x-1 bg-black/5 dark:bg-white/5 rounded-xl px-1.5 py-1">
          <button
            onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
            className="p-1 hover:opacity-80 active:scale-95 transition"
            title="Decrease font size"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono font-bold text-[11px] px-1 min-w-[28px] text-center">
            {settings.fontSize}px
          </span>
          <button
            onClick={() => updateSetting('fontSize', Math.min(48, settings.fontSize + 2))}
            className="p-1 hover:opacity-80 active:scale-95 transition"
            title="Increase font size"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Palette Toggles */}
        <div className="hidden sm:flex items-center space-x-1">
          {palettes.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => updateSetting('colorPalette', p.id)}
                className={`p-1.5 rounded-xl transition ${
                  settings.colorPalette === p.id
                    ? 'ring-2 ring-[#d4a373] shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                } ${p.bg} ${p.text} border ${p.border}`}
                title={p.label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* TTS Toggle Button */}
        {onToggleTTS && (
          <button
            onClick={onToggleTTS}
            className={`flex items-center space-x-1 px-2 py-1 rounded-xl font-bold transition ${
              isTTSPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
            }`}
            title={isTTSPlaying ? 'Pause text-to-speech audio' : 'Listen with native text-to-speech'}
          >
            {isTTSPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline text-[11px]">{isTTSPlaying ? 'Playing' : 'Listen'}</span>
          </button>
        )}

        {/* Annotations drawer button */}
        {onOpenAnnotations && (
          <button
            onClick={onOpenAnnotations}
            className="px-2 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100 transition flex items-center space-x-1"
            title="View Highlights & Notes"
          >
            <span>✍️</span>
            {annotationCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#d4a373] text-[#181614] text-[10px] font-bold">
                {annotationCount}
              </span>
            )}
          </button>
        )}

        {/* Expand Detailed Settings Menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1.5 rounded-xl transition ${
            isOpen ? 'bg-[#d4a373] text-[#181614]' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
          }`}
          title="Reader Display Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

      </div>

      {/* Floating Detailed Overlay Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#fffef2] dark:bg-[#1c1917] p-4 shadow-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-4 text-xs z-50 text-[#2a2724] dark:text-[#f5f2e6] animate-in fade-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between pb-2 border-b border-[#ebd9c5] dark:border-[#38332c]">
            <span className="font-serif font-bold text-sm flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#d4a373]" />
              Reader Display Controls
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs opacity-60 hover:opacity-100 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Color Palettes (Day, Night, Sepia, Blue-Light Shift) */}
          <div className="space-y-1.5">
            <span className="font-bold text-[11px] opacity-75 uppercase tracking-wider block">
              Color Palette
            </span>
            <div className="grid grid-cols-2 gap-2">
              {palettes.map((p) => {
                const Icon = p.icon;
                const isSelected = settings.colorPalette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => updateSetting('colorPalette', p.id)}
                    className={`flex items-center space-x-2 p-2 rounded-xl text-left font-bold transition border ${p.bg} ${p.text} ${p.border} ${
                      isSelected ? 'ring-2 ring-[#d4a373]' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Family Selector */}
          <div className="space-y-1.5">
            <span className="font-bold text-[11px] opacity-75 uppercase tracking-wider block">
              Font Family
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateSetting('fontFamily', f.id)}
                  className={`p-2 rounded-xl text-center font-bold text-xs transition border ${f.style} ${
                    settings.fontFamily === f.id
                      ? 'bg-[#d4a373] text-[#181614] border-[#d4a373]'
                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-[#ebd9c5] dark:hover:border-[#38332c]'
                  }`}
                >
                  {f.id}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Slider (12px to 48px) */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="opacity-75 uppercase tracking-wider">Font Size</span>
              <span className="font-mono text-[#d4a373]">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="48"
              step="1"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
          </div>

          {/* Line Height Slider (1.2 to 2.0) */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[11px]">
              <span className="opacity-75 uppercase tracking-wider">Line Spacing</span>
              <span className="font-mono text-[#d4a373]">{settings.lineHeight.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="2.0"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
              className="w-full accent-[#d4a373] cursor-pointer"
            />
          </div>

          {/* Reading Mode (Paginated vs Continuous) */}
          <div className="space-y-1.5 pt-1 border-t border-[#ebd9c5] dark:border-[#38332c]">
            <span className="font-bold text-[11px] opacity-75 uppercase tracking-wider block">
              Reading Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSetting('readingMode', 'paginated')}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl font-bold transition border ${
                  settings.readingMode === 'paginated'
                    ? 'bg-[#d4a373] text-[#181614] border-[#d4a373]'
                    : 'bg-black/5 dark:bg-white/5 border-transparent'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Paginated Book</span>
              </button>
              <button
                onClick={() => updateSetting('readingMode', 'continuous')}
                className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl font-bold transition border ${
                  settings.readingMode === 'continuous'
                    ? 'bg-[#d4a373] text-[#181614] border-[#d4a373]'
                    : 'bg-black/5 dark:bg-white/5 border-transparent'
                }`}
              >
                <Scroll className="w-3.5 h-3.5" />
                <span>Continuous Scroll</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
