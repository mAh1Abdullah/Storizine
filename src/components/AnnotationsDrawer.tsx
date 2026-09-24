import React from 'react';
import { X, Trash2, Bookmark, MessageSquare, ExternalLink } from 'lucide-react';
import { BookAnnotation } from '../types';

interface AnnotationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: BookAnnotation[];
  onDeleteAnnotation: (id: string) => void;
  onJumpToCfi?: (cfi: string) => void;
  onNavigateToCfi?: (cfi: string) => void;
  bookTitle?: string;
}

const COLOR_MAP: Record<string, { bg: string; border: string; label: string; text: string }> = {
  yellow: { bg: 'bg-amber-100 dark:bg-amber-950/60', border: 'border-amber-400', label: 'Gold Highlight', text: 'text-amber-800 dark:text-amber-300' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', border: 'border-emerald-400', label: 'Emerald Highlight', text: 'text-emerald-800 dark:text-emerald-300' },
  blue: { bg: 'bg-sky-100 dark:bg-sky-950/60', border: 'border-sky-400', label: 'Sapphire Highlight', text: 'text-sky-800 dark:text-sky-300' },
  pink: { bg: 'bg-rose-100 dark:bg-rose-950/60', border: 'border-rose-400', label: 'Rose Highlight', text: 'text-rose-800 dark:text-rose-300' },
};

export const AnnotationsDrawer: React.FC<AnnotationsDrawerProps> = ({
  isOpen,
  onClose,
  annotations,
  onDeleteAnnotation,
  onJumpToCfi,
  onNavigateToCfi,
  bookTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#fffef2] dark:bg-[#1a1816] shadow-2xl border-l border-[#ebd9c5] dark:border-[#38332c] flex flex-col text-xs text-[#2a2724] dark:text-[#f5f2e6] animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-[#d4a373]" />
          <div>
            <h3 className="font-serif font-bold text-base leading-snug">
              Notes & Highlights
            </h3>
            <p className="text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 truncate max-w-[200px]">
              {bookTitle || 'Current Book'} • {annotations.length} items
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-black dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {annotations.length === 0 ? (
          <div className="py-16 text-center space-y-2 opacity-60">
            <Bookmark className="w-8 h-8 mx-auto text-[#d4a373]" />
            <p className="font-serif font-bold text-sm">No highlights yet</p>
            <p className="text-[11px] max-w-[200px] mx-auto">
              Select any text in the reader to highlight in 4 colors or attach margin notes.
            </p>
          </div>
        ) : (
          annotations.map((ann) => {
            const colorMeta = COLOR_MAP[ann.color] || COLOR_MAP.yellow;
            return (
              <div
                key={ann.id}
                className={`p-3 rounded-2xl border ${colorMeta.bg} ${colorMeta.border} space-y-2 transition shadow-xs`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className={`uppercase tracking-wider ${colorMeta.text}`}>
                    {colorMeta.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    {(onJumpToCfi || onNavigateToCfi) && (
                      <button
                        onClick={() => (onNavigateToCfi || onJumpToCfi)!(ann.cfi_range)}
                        className="p-1 text-[#2a2724]/60 hover:text-black dark:text-[#f5f2e6]/60 dark:hover:text-white"
                        title="Jump to location"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteAnnotation(ann.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete highlight"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {ann.highlighted_text && (
                  <p className="font-serif italic text-xs leading-relaxed border-l-2 border-current pl-2">
                    “{ann.highlighted_text}”
                  </p>
                )}

                {ann.note && (
                  <div className="bg-white/60 dark:bg-black/30 p-2 rounded-xl text-[11px] space-y-0.5">
                    <span className="font-bold flex items-center gap-1 opacity-75">
                      <MessageSquare className="w-3 h-3" /> Note:
                    </span>
                    <p className="font-sans leading-normal">{ann.note}</p>
                  </div>
                )}

                <div className="text-[9px] font-mono opacity-50 text-right">
                  {new Date(ann.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
