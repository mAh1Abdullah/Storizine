import React, { useState } from 'react';
import { X, Sparkles, Wand2, Compass, BookOpen, MessageSquare, Loader2, Star, CheckCircle } from 'lucide-react';
import { BookForestEntry } from '../types';

interface AICompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookForestEntries: BookForestEntry[];
  onAddRecommendationToWantToRead: (rec: { title: string; author: string; genre: string; blurb: string }) => void;
}

export const AICompanionModal: React.FC<AICompanionModalProps> = ({
  isOpen,
  onClose,
  bookForestEntries,
  onAddRecommendationToWantToRead,
}) => {
  const [activeTab, setActiveTab] = useState<'review' | 'recommend'>('review');

  // Review Assistant state
  const [selectedBookId, setSelectedBookId] = useState<string>(bookForestEntries[0]?.id || '');
  const [rawNotes, setRawNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Recommendations state
  const [recLoading, setRecLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleGenerateReview = async () => {
    setReviewLoading(true);
    setReviewResult(null);

    const targetBook = bookForestEntries.find((b) => b.id === selectedBookId) || bookForestEntries[0];

    try {
      const res = await fetch('/api/ai/review-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: targetBook?.title || 'Unknown Title',
          author: targetBook?.author || 'Unknown Author',
          userRating: targetBook?.userRating || 5,
          notes: rawNotes || targetBook?.reviewComments || 'Great pacing, rich worldbuilding, and emotional depth.',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setReviewResult(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setRecLoading(true);
    setRecommendations([]);

    const readBooks = bookForestEntries
      .filter((b) => b.readingStatus === 'read')
      .map((b) => ({ title: b.title, author: b.author, genre: b.genre, rating: b.userRating }));

    try {
      const res = await fetch('/api/ai/recommend-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readHistory: readBooks,
          preferredGenres: ['Speculative Fiction', 'Sci-Fi', 'Fantasy', 'Classics'],
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.recommendations) {
        setRecommendations(data.data.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#2a2724] text-[#f5f2e6] flex items-center justify-between border-b border-[#d4a373]/30">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#d4a373]" />
            <div>
              <h3 className="font-serif font-normal text-xl text-[#fffef2]">BookForest AI Reading Companion</h3>
              <p className="text-xs text-[#d4a373] font-handwriting">Powered by Gemini AI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#f5f2e6]/70 hover:text-[#fffef2]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#ebd9c5] dark:border-[#38332c] bg-[#f5f1e3] dark:bg-[#25221e]">
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'review'
                ? 'border-[#d4a373] text-[#b07843] dark:text-[#d4a373] bg-[#fffef2] dark:bg-[#1f1d1a]'
                : 'border-transparent text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Wand2 className="w-4 h-4 text-[#d4a373]" />
            <span>AI Review Polisher</span>
          </button>

          <button
            onClick={() => setActiveTab('recommend')}
            className={`flex-1 py-3 text-xs font-bold border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'recommend'
                ? 'border-[#d4a373] text-[#b07843] dark:text-[#d4a373] bg-[#fffef2] dark:bg-[#1f1d1a]'
                : 'border-transparent text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Compass className="w-4 h-4 text-[#d4a373]" />
            <span>Next Read Recommendations</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {activeTab === 'review' ? (
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Select Book from BookForest</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                >
                  {bookForestEntries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} by {b.author} ({b.readingStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Your Raw Notes or Thoughts</label>
                <textarea
                  rows={3}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g. Loved the plot twist in chapter 12, worldbuilding felt very atmospheric, pacing slowed a bit near the middle but the climax was incredible!"
                  className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] outline-none"
                />
              </div>

              <button
                onClick={handleGenerateReview}
                disabled={reviewLoading}
                className="w-full py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {reviewLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Polishing Review with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate Polished Review</span>
                  </>
                )}
              </button>

              {reviewResult && (
                <div className="p-4 bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#b07843] dark:text-[#d4a373] flex items-center space-x-1 font-handwriting text-base">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
                      <span>Polished Literary Review</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#d4a373]/20 text-[#2a2724] dark:text-[#f5f2e6] font-handwriting font-bold">
                      Vibe: {reviewResult.suggestedReadingVibe}
                    </span>
                  </div>

                  <p className="text-[#2a2724] dark:text-[#f5f2e6] font-serif leading-relaxed text-sm whitespace-pre-line">
                    {reviewResult.polishedReview}
                  </p>

                  {reviewResult.keyThemes && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#ebd9c5] dark:border-[#38332c]">
                      <span className="font-bold text-[#b07843] dark:text-[#d4a373] font-handwriting text-sm">Themes:</span>
                      {reviewResult.keyThemes.map((theme: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#d4a373]/20 text-[#2a2724] dark:text-[#f5f2e6] text-xs font-handwriting font-bold">
                          #{theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#f5f1e3] dark:bg-[#25221e] rounded-xl border border-[#ebd9c5] dark:border-[#38332c] space-y-1">
                <p className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Analyze Reading Taste
                </p>
                <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 text-xs">
                  Gemini will examine your {bookForestEntries.filter((b) => b.readingStatus === 'read').length} finished books in BookForest to curate 3 personalized reading recommendations.
                </p>
              </div>

              <button
                onClick={handleGetRecommendations}
                disabled={recLoading}
                className="w-full py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-md"
              >
                {recLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Library & Curating...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Get 3 Tailored Book Recommendations</span>
                  </>
                )}
              </button>

              {recommendations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-[#2a2724] dark:text-[#f5f2e6] text-xs font-serif">
                    Curated for your BookForest:
                  </h4>
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif font-normal text-base text-[#2a2724] dark:text-[#f5f2e6]">
                            {rec.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#d4a373]/20 text-[#b07843] dark:text-[#d4a373] font-handwriting font-bold">
                            {rec.vibeTag || rec.genre}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                          by {rec.author}
                        </p>
                        <p className="text-[#2a2724]/80 dark:text-[#f5f2e6]/80 text-xs leading-snug">
                          {rec.blurb}
                        </p>
                        <p className="text-xs text-[#b07843] dark:text-[#d4a373] font-handwriting italic">
                          Why: {rec.whyRecommended}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onAddRecommendationToWantToRead(rec);
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-[#2a2724] hover:bg-[#3d3834] text-[#d4a373] font-bold text-xs flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Add to Want To Read</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
