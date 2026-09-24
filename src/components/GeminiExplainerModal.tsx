import React from 'react';
import { Sparkles, BookOpen, History, Compass, Feather, X, Volume2 } from 'lucide-react';

interface GeminiExplainerData {
  term: string;
  partOfSpeech?: string;
  definition: string;
  historicalContext?: string;
  etymology?: string;
  literarySignificance?: string;
}

interface GeminiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GeminiExplainerData | null;
  loading: boolean;
  onSpeak?: (text: string) => void;
}

export const GeminiExplainerModal: React.FC<GeminiExplainerModalProps> = ({
  isOpen,
  onClose,
  data,
  loading,
  onSpeak,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-[#fffef2] dark:bg-[#1c1917] p-6 shadow-2xl border border-[#ebd9c5] dark:border-[#38332c] space-y-4 text-[#2a2724] dark:text-[#f5f2e6] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ebd9c5] dark:border-[#38332c]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#d4a373]/20 border border-[#d4a373]/40 flex items-center justify-center text-[#d4a373]">
              <Sparkles className="w-4 h-4 text-[#d4a373]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">
                Gemini Literary Assistant
              </h3>
              <span className="text-[10px] text-[#b07843] dark:text-[#d4a373] font-mono">
                Contextual Vocabulary & Etymology
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-[#d4a373] animate-spin" />
            <p className="text-xs font-serif italic text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
              Consulting Gemini 2.5 Flash for literary context and etymology...
            </p>
          </div>
        ) : data ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            {/* Term Title & Pronunciation */}
            <div className="bg-[#f5f1e3] dark:bg-[#25221e] p-3.5 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
              <div>
                <span className="font-serif font-bold text-xl block capitalize">
                  {data.term}
                </span>
                {data.partOfSpeech && (
                  <span className="text-[11px] font-mono italic opacity-70">
                    {data.partOfSpeech}
                  </span>
                )}
              </div>
              {onSpeak && (
                <button
                  onClick={() => onSpeak(`${data.term}. ${data.definition}`)}
                  className="p-2 rounded-xl bg-[#fffef2] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] text-[#d4a373] hover:scale-105 transition"
                  title="Pronounce & read definition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Definition */}
            <div className="space-y-1">
              <span className="font-bold text-[11px] text-[#b07843] dark:text-[#d4a373] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Contextual Meaning
              </span>
              <p className="text-sm font-serif leading-relaxed pl-1">
                {data.definition}
              </p>
            </div>

            {/* Etymology */}
            {data.etymology && (
              <div className="space-y-1 pt-1">
                <span className="font-bold text-[11px] text-[#b07843] dark:text-[#d4a373] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Etymology & Origins
                </span>
                <p className="text-xs leading-relaxed pl-1 text-[#2a2724]/90 dark:text-[#f5f2e6]/90 font-mono text-[11px]">
                  {data.etymology}
                </p>
              </div>
            )}

            {/* Historical Context */}
            {data.historicalContext && (
              <div className="space-y-1 pt-1">
                <span className="font-bold text-[11px] text-[#b07843] dark:text-[#d4a373] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Historical & Cultural Context
                </span>
                <p className="text-xs leading-relaxed pl-1 text-[#2a2724]/90 dark:text-[#f5f2e6]/90">
                  {data.historicalContext}
                </p>
              </div>
            )}

            {/* Literary Significance */}
            {data.literarySignificance && (
              <div className="p-3 bg-[#ebd9c5]/30 dark:bg-[#38332c]/30 rounded-xl space-y-1 border-l-2 border-[#d4a373]">
                <span className="font-bold text-[11px] text-[#b07843] dark:text-[#d4a373] flex items-center gap-1.5">
                  <Feather className="w-3.5 h-3.5" />
                  Literary Vibe & Choice
                </span>
                <p className="text-xs italic pl-1 leading-relaxed">
                  “{data.literarySignificance}”
                </p>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 border-t border-[#ebd9c5] dark:border-[#38332c] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#d4a373] text-[#181614] rounded-xl font-bold text-xs hover:bg-[#c39262] transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
