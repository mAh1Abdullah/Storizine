import React from 'react';
import { PublishedBook, BookForestEntry, BookForestItem } from '../types';
import { FoliateReader } from './reader/FoliateReader';

export interface SampleChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: PublishedBook | BookForestEntry | BookForestItem | any | null;
  onUpdateBook?: (book: any) => void;
}

/**
 * Foliate Core Reader replacing SampleChapterModal.tsx
 * Iframe-isolated reading component with display toolbar (12-72pt font size,
 * line-height sliders, margin padding, Parchment/Sepia/OLED Night themes),
 * multi-format binding (.epub, .pdf, .txt, .markdown), offline WordLens, and Gemini AI.
 */
export const SampleChapterModal: React.FC<SampleChapterModalProps> = ({
  isOpen,
  onClose,
  book,
  onUpdateBook,
}) => {
  if (!isOpen || !book) return null;

  return (
    <FoliateReader
      book={book}
      onClose={onClose}
      onUpdateBook={onUpdateBook}
    />
  );
};
