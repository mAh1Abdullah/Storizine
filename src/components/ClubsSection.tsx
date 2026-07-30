import React, { useState } from 'react';
import { 
  Users, 
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
  Sparkles 
} from 'lucide-react';
import { STORIZINE_WORKS } from '../data/storizineData';
import { StorizineWork, BookForestEntry } from '../types';

interface ClubsSectionProps {
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

export const ClubsSection: React.FC<ClubsSectionProps> = ({
  onImportToBookForest,
}) => {
  const [selectedWork, setSelectedWork] = useState<StorizineWork>(STORIZINE_WORKS[0]);
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
      likes: 14,
      timestamp: '2 hours ago',
    },
    {
      id: 'c-2',
      authorName: 'Nabil Rahman',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      chapterNumber: 1,
      reaction: '💡 Fan Theory',
      content: '[SPOILER WARNING] I suspect the mysterious protagonist isn\'t actually rogue at all!',
      isSpoiler: true,
      likes: 9,
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
      likes: 18,
      timestamp: '1 day ago',
    },
  ]);

  const totalChapters = selectedWork.chapterCount || 10;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: ChapterComment = {
      id: `c-${Date.now()}`,
      authorName: 'You (BookForest Member)',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      chapterNumber: activeChapter,
      reaction: selectedReaction,
      content: newCommentText.trim(),
      isSpoiler: isNewCommentSpoiler,
      likes: 1,
      timestamp: 'Just now',
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    setIsNewCommentSpoiler(false);
  };

  const handleLike = (id: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  const handleImportWork = (work: StorizineWork) => {
    const entry: BookForestEntry = {
      id: `fable-club-${work.id}-${Date.now()}`,
      title: work.title,
      author: 'mAh Abdullah',
      coverUrl: work.coverUrl,
      genre: work.category,
      readingStatus: 'currently-reading',
      userRating: 5,
      currentProgressPages: 12,
      totalPages: 320,
      dateAdded: new Date().toISOString().slice(0, 10),
      reviewComments: `Joined Fable Reading Club discussion folio for "${work.title}". Subcategory: ${work.subcategory}.`,
      quotesSaved: [work.excerpt?.slice(0, 120) || ''],
      tags: ['Fable Club', 'Social Lounge', work.series || 'Fiction'],
      ownedFormats: ['Kindle/Ebook'],
      collectionLocation: 'Kindle Library',
      purchasePrice: 0,
      readCount: 0,
    };

    onImportToBookForest(entry);
    setImportedIds((prev) => ({ ...prev, [work.id]: true }));
  };

  const filteredComments = comments.filter((c) => c.chapterNumber === activeChapter);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-[#25221e] text-[#f5f2e6] rounded-3xl border border-[#d4a373]/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
              FABLE READING CLUBS
            </span>
            <span className="text-xs text-[#d4a373] font-handwriting">
              Social Chapter Reactions & Community Folios
            </span>
          </div>
          <h2 className="font-serif font-bold text-2xl mt-1 leading-tight">
            BookForest Reading Lounge & Clubs
          </h2>
          <p className="text-xs text-[#f5f2e6]/70 mt-1 max-w-xl">
            Discuss serial releases chapter-by-chapter, share spoiler-tagged theories, react with custom vibe badges, and track reading club progress together.
          </p>
        </div>

        {/* Club Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-[#181614] rounded-2xl border border-[#d4a373]/30 shrink-0">
          <button
            onClick={() => setActiveTab('lounge')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'lounge'
                ? 'bg-[#d4a373] text-[#181614] shadow-md'
                : 'text-[#f5f2e6]/70 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chapter Reactions</span>
          </button>

          <button
            onClick={() => setActiveTab('folios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'folios'
                ? 'bg-[#d4a373] text-[#181614] shadow-md'
                : 'text-[#f5f2e6]/70 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Club Reading Folios</span>
          </button>
        </div>
      </div>

      {/* Book Selection Bar */}
      <div className="p-4 bg-[#fbf9ee] dark:bg-[#221f1c] rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-[#d4a373]">Active Club Book:</span>
          <select
            value={selectedWork.id}
            onChange={(e) => {
              const found = STORIZINE_WORKS.find((w) => w.id === e.target.value);
              if (found) setSelectedWork(found);
            }}
            className="px-3 py-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-xs font-bold font-serif outline-none"
          >
            {STORIZINE_WORKS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.series || w.category})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => handleImportWork(selectedWork)}
          disabled={importedIds[selectedWork.id]}
          className="px-3.5 py-1.5 rounded-xl bg-[#d4a373] text-[#181614] hover:bg-[#c39262] text-xs font-bold flex items-center space-x-1.5 shadow-xs"
        >
          {importedIds[selectedWork.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{importedIds[selectedWork.id] ? 'Added to BookForest' : 'Join Reading Club'}</span>
        </button>
      </div>

      {/* TAB 1: CHAPTER REACTIONS LOUNGE */}
      {activeTab === 'lounge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chapter Selector sidebar */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
              Select Chapter Discussion
            </h3>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {Array.from({ length: totalChapters }).map((_, idx) => {
                const chNum = idx + 1;
                const isCurrent = activeChapter === chNum;
                const count = comments.filter((c) => c.chapterNumber === chNum).length;

                return (
                  <button
                    key={chNum}
                    onClick={() => setActiveChapter(chNum)}
                    className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between text-xs ${
                      isCurrent
                        ? 'bg-[#2a2724] text-[#d4a373] shadow-md'
                        : 'bg-[#f5f1e3] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] hover:bg-[#ebd9c5]/50'
                    }`}
                  >
                    <span className="font-bold font-serif">Chapter {chNum}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCurrent ? 'bg-[#d4a373] text-[#181614]' : 'bg-[#d4a373]/20 text-[#d4a373]'
                    }`}>
                      {count} Posts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discussion feed & post form */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* New Comment Box */}
            <form
              onSubmit={handleAddComment}
              className="p-5 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#d4a373] font-serif">
                  Post Chapter {activeChapter} Reaction
                </span>

                {/* Reaction Vibe Selector */}
                <div className="flex items-center space-x-1.5">
                  {['🔥 Mindblown', '😱 Cliffhanger', '💡 Fan Theory', '💖 Heartbreak'].map((vibe) => (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => setSelectedReaction(vibe)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        selectedReaction === vibe
                          ? 'bg-[#d4a373] text-[#181614]'
                          : 'bg-[#f5f1e3] dark:bg-[#181614] text-[#2a2724]/70 dark:text-[#f5f2e6]/70'
                      }`}
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`What was your reaction to Chapter ${activeChapter} of ${selectedWork.title}?`}
                rows={3}
                className="w-full p-3 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#181614] text-[#2a2724] dark:text-[#f5f2e6] text-xs font-serif outline-none resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewCommentSpoiler}
                    onChange={(e) => setIsNewCommentSpoiler(e.target.checked)}
                    className="rounded border-[#ebd9c5] text-[#d4a373] focus:ring-0"
                  />
                  <span>Mark as Spoiler</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share Reaction</span>
                </button>
              </div>
            </form>

            {/* Spoiler Global Toggle Bar */}
            <div className="flex items-center justify-between text-xs px-2">
              <span className="font-bold text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Chapter {activeChapter} Community Feed ({filteredComments.length})
              </span>

              <button
                onClick={() => setShowSpoilers(!showSpoilers)}
                className="flex items-center space-x-1 text-[#d4a373] font-bold hover:underline"
              >
                {showSpoilers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSpoilers ? 'Hide Spoilers' : 'Reveal Spoilers'}</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {filteredComments.length === 0 ? (
                <div className="p-8 text-center bg-[#fbf9ee] dark:bg-[#221f1c] rounded-3xl border border-dashed border-[#ebd9c5] dark:border-[#38332c] text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  No reactions posted for Chapter {activeChapter} yet. Be the first to share your thoughts!
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={comment.avatarUrl}
                          alt={comment.authorName}
                          className="w-7 h-7 rounded-full object-cover border border-[#d4a373]/50"
                        />
                        <div>
                          <span className="font-bold text-xs text-[#2a2724] dark:text-[#f5f2e6] block">
                            {comment.authorName}
                          </span>
                          <span className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                            {comment.timestamp}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/30">
                        {comment.reaction}
                      </span>
                    </div>

                    {comment.isSpoiler && !showSpoilers ? (
                      <div
                        onClick={() => setShowSpoilers(true)}
                        className="p-3 rounded-xl bg-[#2a2724]/10 dark:bg-[#181614] border border-dashed border-[#d4a373]/40 text-center text-xs font-bold text-[#d4a373] cursor-pointer"
                      >
                        [SPOILER HIDDEN - Click to Reveal]
                      </div>
                    ) : (
                      <p className="text-xs text-[#2a2724]/90 dark:text-[#f5f2e6]/90 font-serif leading-relaxed">
                        {comment.content}
                      </p>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center space-x-1 text-[11px] font-bold text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#d4a373]"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{comment.likes} Likes</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: CLUB READING FOLIOS */}
      {activeTab === 'folios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STORIZINE_WORKS.map((work) => (
            <div
              key={work.id}
              className="p-5 rounded-3xl bg-[#fbf9ee] dark:bg-[#221f1c] border border-[#ebd9c5] dark:border-[#38332c] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <img
                    src={work.coverUrl}
                    alt={work.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-md border border-[#ebd9c5] shrink-0"
                  />
                  <div className="min-w-0 space-y-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373]/20 text-[#d4a373]">
                      {work.series || work.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] leading-tight">
                      {work.title}
                    </h4>
                    <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      by mAh Abdullah
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 line-clamp-3 font-serif">
                  {work.blurbEnglish}
                </p>
              </div>

              <div className="pt-2 border-t border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#d4a373]">
                  {work.chapterCount || 10} Serial Chapters
                </span>

                <button
                  onClick={() => handleImportWork(work)}
                  disabled={importedIds[work.id]}
                  className="px-3 py-1.5 rounded-xl bg-[#2a2724] text-[#d4a373] hover:bg-[#3d3834] text-xs font-bold flex items-center space-x-1"
                >
                  {importedIds[work.id] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{importedIds[work.id] ? 'Joined' : 'Join Club'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
