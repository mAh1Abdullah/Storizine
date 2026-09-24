import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Highlighter,
  Languages,
  Layers,
  X,
  Loader2,
  Check,
  ExternalLink
} from 'lucide-react';
import { WordLensDefinition } from '../../types';
import { lookupWordLensOffline } from '../../utils/wordLens';
import { api } from '../../utils/api';

interface SelectionToolbarProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onHighlight: (color: 'yellow' | 'green' | 'blue' | 'pink') => void;
  onSpeak: (text: string) => void;
  bookTitle?: string;
  author?: string;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  selectedText,
  position,
  onClose,
  onHighlight,
  onSpeak,
  bookTitle,
  author,
}) => {
  const [offlineLensData, setOfflineLensData] = useState<WordLensDefinition | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    subtext?: string;
    literaryThemes?: string[];
    stylisticDevices?: string[];
    bengaliTranslation?: string;
    historicalOrAtmosphericVibe?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'none' | 'wordlens' | 'ai-subtext' | 'ai-translate'>('none');
  const [loadingAi, setLoadingAi] = useState(false);
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'blue' | 'pink'>('yellow');

  const words = selectedText.trim().split(/\s+/);
  const isSingleWord = words.length === 1;

  // Trigger Offline WordLens
  const handleOpenWordLens = () => {
    const data = lookupWordLensOffline(selectedText);
    setOfflineLensData(data);
    setActiveTab('wordlens');
  };

  // Trigger Gemini AI Literary Analysis
  const handleTriggerAiAnalysis = async (mode: 'subtext' | 'translate') => {
    setActiveTab(mode === 'translate' ? 'ai-translate' : 'ai-subtext');
    setLoadingAi(true);
    try {
      const data = await api.explainPassage({
        text: selectedText,
        bookTitle,
        author,
        mode,
      });
      setAiAnalysis(data);
    } catch (err) {
      console.warn('AI analysis error', err);
      setAiAnalysis({
        subtext: 'Could not connect to Gemini service. The passage captures evocative themes of human reflection and setting atmosphere.',
        literaryThemes: ['Atmosphere', 'Introspection'],
        bengaliTranslation: 'অনুবাদ সম্পন্ন করা যায়নি।',
      });
    } finally {
      setLoadingAi(false);
    }
  };

  // Adjust positioning to stay within viewport
  const left = Math.max(16, Math.min(window.innerWidth - 380, position.x - 160));
  const top = Math.max(64, Math.min(window.innerHeight - 360, position.y - 56));

  return (
    <div
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 w-auto max-w-[92vw] sm:max-w-md bg-[#fbf9ee] dark:bg-[#1a1714] border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#2a2724] dark:text-[#f5f2e6]"
    >
      {/* Top Action Bar */}
      <div className="flex items-center space-x-1.5 p-2 bg-[#ebd9c5]/30 dark:bg-[#2e2a25]/60 border-b border-[#ebd9c5]/50 dark:border-[#2e2a25]">
        {/* Offline WordLens (Primary if 1 word) */}
        {isSingleWord && (
          <button
            onClick={handleOpenWordLens}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'wordlens'
                ? 'bg-[#d4a373] text-white shadow-sm'
                : 'hover:bg-[#ebd9c5] dark:hover:bg-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>WordLens</span>
          </button>
        )}

        {/* Gemini Literary Subtext */}
        <button
          onClick={() => handleTriggerAiAnalysis('subtext')}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai-subtext'
              ? 'bg-[#d4a373] text-white shadow-sm'
              : 'hover:bg-[#ebd9c5] dark:hover:bg-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span>{isSingleWord ? 'AI Literary Subtext' : 'Unpack Subtext'}</span>
        </button>

        {/* Gemini English <-> Bengali Translation */}
        <button
          onClick={() => handleTriggerAiAnalysis('translate')}
          title="Translate between English and Bengali"
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai-translate'
              ? 'bg-[#d4a373] text-white shadow-sm'
              : 'hover:bg-[#ebd9c5] dark:hover:bg-[#38332c] text-[#2a2724] dark:text-[#f5f2e6]'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bengali/Eng</span>
        </button>

        {/* Text-to-Speech */}
        <button
          onClick={() => onSpeak(selectedText)}
          title="Listen to this selection"
          className="p-1.5 rounded-xl hover:bg-[#ebd9c5] dark:hover:bg-[#38332c] transition-colors"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>

        {/* 4-Color Highlighters */}
        <div className="flex items-center space-x-1 pl-1 border-l border-[#ebd9c5]/60 dark:border-[#2e2a25]">
          {(['yellow', 'green', 'blue', 'pink'] as const).map((color) => {
            const bgClass =
              color === 'yellow'
                ? 'bg-amber-400'
                : color === 'green'
                ? 'bg-emerald-400'
                : color === 'blue'
                ? 'bg-sky-400'
                : 'bg-rose-400';
            return (
              <button
                key={color}
                onClick={() => {
                  setHighlightColor(color);
                  onHighlight(color);
                }}
                title={`Highlight in ${color}`}
                className={`w-4 h-4 rounded-full ${bgClass} hover:scale-125 transition-transform shadow-xs`}
              />
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#2a2724]/50 dark:text-[#f5f2e6]/50 hover:text-red-500 transition-colors ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded Content Panels */}
      {activeTab === 'wordlens' && offlineLensData && (
        <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="font-serif font-bold text-base text-[#d4a373]">{offlineLensData.word}</span>
              {offlineLensData.phonetic && (
                <span className="text-xs font-mono text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  {offlineLensData.phonetic}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ebd9c5]/50 dark:bg-[#38332c] text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
              {offlineLensData.partOfSpeech}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-[#2a2724]/90 dark:text-[#f5f2e6]/90 font-serif">
            {offlineLensData.definition}
          </p>

          {offlineLensData.bengaliTranslation && (
            <div className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 bg-[#ebd9c5]/20 dark:bg-[#221f1c] p-2 rounded-xl border border-[#ebd9c5]/40 dark:border-[#38332c]">
              <span className="font-bold text-[#d4a373]">বাংলা অর্থ: </span>
              <span>{offlineLensData.bengaliTranslation}</span>
            </div>
          )}

          {offlineLensData.example && (
            <p className="text-[11px] italic text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border-l-2 border-[#d4a373]/60 pl-2">
              "{offlineLensData.example}"
            </p>
          )}

          {offlineLensData.grammarTags && offlineLensData.grammarTags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {offlineLensData.grammarTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#ebd9c5]/30 dark:bg-[#2e2a25] text-[#2a2724]/60 dark:text-[#f5f2e6]/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {(activeTab === 'ai-subtext' || activeTab === 'ai-translate') && (
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {loadingAi ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#d4a373]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-serif italic text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Gemini Flash is unpacking literary subtext & atmosphere...
              </span>
            </div>
          ) : aiAnalysis ? (
            <>
              {activeTab === 'ai-translate' && aiAnalysis.bengaliTranslation && (
                <div className="space-y-1 bg-[#ebd9c5]/25 dark:bg-[#221f1c] p-3 rounded-xl border border-[#ebd9c5]/50 dark:border-[#38332c]">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#d4a373]">
                    <Languages className="w-3.5 h-3.5" />
                    <span>বাংলা সাহিত্যিক অনুবাদ (Bengali Translation)</span>
                  </div>
                  <p className="text-xs font-serif leading-relaxed text-[#2a2724] dark:text-[#f5f2e6]">
                    {aiAnalysis.bengaliTranslation}
                  </p>
                </div>
              )}

              {aiAnalysis.subtext && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a373]">
                    Literary Subtext & Implied Meaning
                  </span>
                  <p className="text-xs font-serif leading-relaxed text-[#2a2724]/90 dark:text-[#f5f2e6]/90">
                    {aiAnalysis.subtext}
                  </p>
                </div>
              )}

              {aiAnalysis.literaryThemes && aiAnalysis.literaryThemes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    Key Themes
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiAnalysis.literaryThemes.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ebd9c5]/40 dark:bg-[#2e2a25] text-[#2a2724] dark:text-[#f5f2e6]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiAnalysis.historicalOrAtmosphericVibe && (
                <div className="text-[11px] italic text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border-l-2 border-[#d4a373] pl-2.5">
                  {aiAnalysis.historicalOrAtmosphericVibe}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
