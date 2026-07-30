import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MessageSquare, 
  Flame, 
  Heart, 
  HelpCircle, 
  Award, 
  Plus, 
  Bookmark, 
  Check, 
  Eye, 
  EyeOff, 
  Send, 
  Share2, 
  ThumbsUp, 
  Download, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { StorizineWork, BookForestEntry } from '../types';

interface FableLoungeModalProps {
  isOpen: boolean;
  onClose: () => void;
  works: StorizineWork[];
  onImportToBookForest: (entry: BookForestEntry) => void;
}

interface ChapterComment {
  id: string;
  authorName: string;
  avatarUrl: string;
  chapterNumber: number;
  reaction: string;
  content: string;
  isSpoiler: boolean;
  likes: number;
  timestamp: string;
}

export const FableLoungeModal: React.FC<FableLoungeModalProps> = ({
  isOpen,
  onClose,
  works,
  onImportToBookForest,
}) => {
  const [selectedWork, setSelectedWork] = useState<StorizineWork>(works[0] || null);
  const [activeChapter, setActiveChapter] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'lounge' | 'folios'>('lounge');
  const [showSpoilers, setShowSpoilers] = useState<boolean>(false);
  const [selectedReaction, setSelectedReaction] = useState<string>('🔥 Mindblown');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [isNewCommentSpoiler, setIsNewCommentSpoiler] = useState<boolean>(false);
  const [importedIds, setImportedIds] = useState<Record<string, boolean>>({});

  // Mock initial Fable lounge comments
  const [comments, setComments] = useState<ChapterComment[]>([
    {
      id: 'c-1',
      authorName: 'Aria Vance (Fable Club Lead)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      chapterNumber: 1,
      reaction: '🔥 Mindblown',
      content: 'The world-building opening in Chapter 1 is incredible! Love how mAh Abdullah sets the tension immediately.',
      isSpoiler: false,
      likes: 12,
      timestamp: '2 hours ago',
    },
    {
      id: 'c-2',
      authorName: 'Nabil Rahman',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      chapterNumber: 1,
      reaction: '💡 Fan Theory',
      content: '[SPOILER WARNING] I suspect the mysterious AI protagonist in Virus <evo> isn\'t actually rogue at all!',
      isSpoiler: true,
      likes: 8,
      timestamp: '4 hours ago',
    },
    {
      id: 'c-3',
      authorName: 'Sophia Lin',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      chapterNumber: 2,
      reaction: '😱 Cliffhanger',
      content: 'Chapter 2 ended on such an intense cliffhanger! Cannot wait for the next serial release.',
      isSpoiler: false,
      likes: 15,
      timestamp: '1 day ago',
    },
  ]);

  if (!isOpen || !selectedWork) return null;

  const totalChapters = selectedWork.chapterCount || 10;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: ChapterComment = {
      id: `c-${Date.now()}`,
      authorName: 'You (Storizine Reader)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      chapterNumber: activeChapter,
      reaction: selectedReaction,
      content: newCommentText.trim(),
      isSpoiler: isNewCommentSpoiler,
      likes: 1,
      timestamp: 'Just now',
    };

    setComments((prev) => [newC, ...prev]);
    setNewCommentText('');
    setIsNewCommentSpoiler(false);
  };

  const handleLikeComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleImportToBookForest = (work: StorizineWork) => {
    const entry: BookForestEntry = {
      id: `fable-entry-${work.id}-${Date.now()}`,
      title: work.title,
      author: 'mAh Abdullah',
      coverUrl: work.coverUrl,
      genre: work.category,
      readingStatus: 'currently-reading',
      userRating: 5,
      currentProgressPages: Math.round((activeChapter / totalChapters) * 200),
      totalPages: 200,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Tracked in Fable Social Reading Club (Chapter ${activeChapter}/${totalChapters}).`,
      quotesSaved: [work.blurbEnglish || 'An immersive Storizine serial.'],
      tags: ['Fable Club', 'Storizine Serial', work.category],
      ownedFormats: ['Kindle/Ebook'],
      collectionLocation: 'Kindle Library',
      purchasePrice: 0,
      readCount: 1,
    };

    onImportToBookForest(entry);
    setImportedIds((prev) => ({ ...prev, [work.id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#2a2724] via-[#38332c] to-[#1f1d1a] text-[#f5f2e6] border-b border-[#d4a373]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4a373] text-[#181614] flex items-center justify-center font-bold shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
                  FABLE.CO SOCIAL CLUB
                </span>
                <span className="text-xs text-[#d4a373] font-handwriting">
                  Interactive Chapter Discussions
                </span>
              </div>
              <h2 className="font-serif text-xl font-bold leading-tight">
                Storizine Fable Reading Lounge
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('lounge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'lounge'
                  ? 'bg-[#d4a373] text-[#181614]'
                  : 'bg-[#38332c] text-[#f5f2e6]/80 hover:text-white'
              }`}
            >
              Chapter Lounge
            </button>
            <button
              onClick={() => setActiveTab('folios')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'folios'
                  ? 'bg-[#d4a373] text-[#181614]'
                  : 'bg-[#38332c] text-[#f5f2e6]/80 hover:text-white'
              }`}
            >
              Fable Folios / Reading Lists
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-[#f5f2e6]/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'lounge' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            
            {/* Left Sidebar: Select Work & Chapter */}
            <div className="lg:col-span-4 p-4 border-b lg:border-b-0 lg:border-r border-[#ebd9c5] dark:border-[#38332c] overflow-y-auto space-y-4 max-h-[35vh] lg:max-h-none">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                Select Storizine Serial:
              </label>

              <select
                value={selectedWork.id}
                onChange={(e) => {
                  const w = works.find((item) => item.id === e.target.value);
                  if (w) setSelectedWork(w);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#181614] text-xs font-bold font-serif outline-none"
              >
                {works.map((w) => (
                  <option key={w.id} value={w.id}>
                    #{w.number} - {w.title}
                  </option>
                ))}
              </select>

              {/* Work Card Preview */}
              <div className="p-3.5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedWork.coverUrl}
                    alt={selectedWork.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                      {selectedWork.title}
                    </h4>
                    <p className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                      {selectedWork.category} • {totalChapters} Chapters
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleImportToBookForest(selectedWork)}
                  disabled={importedIds[selectedWork.id]}
                  className="w-full py-2 rounded-xl bg-[#15803d] hover:bg-[#166534] disabled:bg-emerald-900/40 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  {importedIds[selectedWork.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tracking in BookForest</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Track in My BookForest</span>
                    </>
                  )}
                </button>
              </div>

              {/* Chapter Milestones Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#d4a373]">
                  Select Chapter Milestone:
                </label>

                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: Math.min(totalChapters, 15) }, (_, i) => i + 1).map((chNum) => (
                    <button
                      key={chNum}
                      onClick={() => setActiveChapter(chNum)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeChapter === chNum
                          ? 'bg-[#2a2724] text-[#d4a373] border-[#d4a373] shadow-xs'
                          : 'bg-[#fbf9ee] dark:bg-[#25221e] border-[#ebd9c5] dark:border-[#38332c] hover:bg-[#f5f1e3]'
                      }`}
                    >
                      Ch. {chNum}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Chapter Discussion & Reactions */}
            <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#d4a373]">
                      Reading Club Thread • Chapter {activeChapter} of {totalChapters}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                      {selectedWork.title}: Chapter {activeChapter} Reaction Lounge
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowSpoilers(!showSpoilers)}
                    className="px-3 py-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] text-xs font-bold flex items-center space-x-1.5 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 shrink-0"
                  >
                    {showSpoilers ? <Eye className="w-3.5 h-3.5 text-[#d4a373]" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}</span>
                  </button>
                </div>

                {/* Submit New Reaction/Comment */}
                <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">Share Chapter Reaction:</span>
                    <div className="flex items-center space-x-2">
                      <label className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 flex items-center space-x-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isNewCommentSpoiler}
                          onChange={(e) => setIsNewCommentSpoiler(e.target.checked)}
                          className="rounded text-[#d4a373]"
                        />
                        <span>Contains Spoiler</span>
                      </label>
                    </div>
                  </div>

                  {/* Reaction Pills */}
                  <div className="flex flex-wrap gap-2">
                    {['🔥 Mindblown', '😱 Cliffhanger', '💡 Fan Theory', '💖 Favorite', '💬 Discussion'].map((rx) => (
                      <button
                        key={rx}
                        type="button"
                        onClick={() => setSelectedReaction(rx)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          selectedReaction === rx
                            ? 'bg-[#d4a373] text-[#181614]'
                            : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border border-[#ebd9c5] dark:border-[#38332c]'
                        }`}
                      >
                        {rx}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder={`Discuss Chapter ${activeChapter} with fellow readers...`}
                      className="flex-1 px-3 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#25221e] text-xs outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] font-bold text-xs flex items-center space-x-1 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments
                    .filter((c) => c.chapterNumber === activeChapter || activeChapter === 1)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5] dark:border-[#38332c] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <img
                              src={c.avatarUrl}
                              alt={c.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">{c.authorName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373]">
                              {c.reaction}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">{c.timestamp}</span>
                        </div>

                        {c.isSpoiler && !showSpoilers ? (
                          <div
                            onClick={() => setShowSpoilers(true)}
                            className="p-3 rounded-xl bg-[#2a2724] text-[#d4a373] text-xs font-bold cursor-pointer text-center"
                          >
                            ⚠️ Spoiler Tagged Comment. Click to reveal.
                          </div>
                        ) : (
                          <p className="text-xs text-[#2a2724]/90 dark:text-[#f5f2e6]/90 font-serif leading-relaxed">
                            {c.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                          <span>Chapter {c.chapterNumber}</span>
                          <button
                            onClick={() => handleLikeComment(c.id)}
                            className="flex items-center space-x-1 hover:text-[#d4a373] transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{c.likes} Likes</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Folios / Curated Reading Lists Tab */
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
              <h3 className="font-serif font-bold text-xl text-[#2a2724] dark:text-[#f5f2e6]">
                Curated Fable Reading Folios & Lists
              </h3>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Explore themed reading recommendations curated by book clubs and mAh Abdullah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373]">
                    CURATED FOLIO #1
                  </span>
                  <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">5 Works</span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                  High-Octane Sci-Fi & Cyberpunk Marathon
                </h4>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                  Includes "Virus &lt;evo&gt;", "The Quantum Cipher", and "Frankenstein" from Gutenberg.
                </p>
                <button
                  onClick={() => {
                    handleImportToBookForest(works[0]);
                    alert('Folio works added to your BookForest library!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] font-bold text-xs flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Folio to BookForest</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-[#f5f1e3] dark:bg-[#25221e] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#15803d]/20 text-[#15803d] dark:text-[#4ade80]">
                    CURATED FOLIO #2
                  </span>
                  <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">8 Works</span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                  Bengali Heritage & Speculative Fiction
                </h4>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                  Featuring "Brave Boys Series", "Sylhet Mystery Chronicles", and classic Bengalee prose.
                </p>
                <button
                  onClick={() => {
                    handleImportToBookForest(works[1] || works[0]);
                    alert('Folio works added to your BookForest library!');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] font-bold text-xs flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Folio to BookForest</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
