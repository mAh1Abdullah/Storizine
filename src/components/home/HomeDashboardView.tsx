import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Feather,
  Compass,
  ArrowRight,
  Sparkles,
  Bookmark,
  Award,
  Send,
  Library,
  Flame,
  CheckCircle,
  Clock,
  Eye,
  FileText
} from 'lucide-react';
import { AuthorProfile, PublishedBook, UpcomingBook, BookForestEntry, ReadingGoal } from '../../types';
import { STORIZINE_ASSETS } from '../../data/storizineAssets';
import { INITIAL_WRITING_PROJECTS, INITIAL_WRITING_PROMPTS } from '../../data/writingStudioData';
import { INITIAL_ACADEMY_LESSONS } from '../../data/learningAcademyData';
import { INITIAL_PUBLISHING_OPPORTUNITIES, INITIAL_SUBMISSION_TRACKS } from '../../data/publishingCenterData';

interface HomeDashboardViewProps {
  author: AuthorProfile;
  publishedBooks: PublishedBook[];
  upcomingBooks: UpcomingBook[];
  bookForestEntries: BookForestEntry[];
  readingGoal?: ReadingGoal;
  onOpenSampleChapter: (book: any) => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  author,
  publishedBooks,
  upcomingBooks,
  bookForestEntries,
  readingGoal,
  onOpenSampleChapter,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const navigate = useNavigate();

  // Find book currently being read or highest progress
  const currentlyReading = bookForestEntries.find(b => b.readingStatus === 'currently-reading') 
    || bookForestEntries[0];

  // Active writing project
  const activeProject = INITIAL_WRITING_PROJECTS[0];

  // Daily prompt
  const dailyPrompt = INITIAL_WRITING_PROMPTS[0];

  // Featured academy craft lesson
  const featuredLesson = INITIAL_ACADEMY_LESSONS[0];

  // Next submission deadline
  const nextOpportunity = INITIAL_PUBLISHING_OPPORTUNITIES[0];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Editorial Panoramic Vista Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl bg-[#181614] text-[#fffef2]">
        <div className="absolute inset-0 z-0">
          <img
            src={STORIZINE_ASSETS.magicalLibrary.path}
            alt="Storizine & BookForest Sanctuary"
            className="w-full h-full object-cover object-center opacity-45 transform hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181614] via-[#181614]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181614] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#d4a373]">
            <Sparkles className="w-4 h-4" />
            <span>Unified Literary Ecosystem · v3.0</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight leading-tight text-[#fffef2]">
              Welcome back to <span className="italic font-serif text-[#f3d5b5]">Storizine &amp; BookForest</span>
            </h1>
            <p className="text-sm sm:text-base text-[#fffef2]/80 font-serif leading-relaxed">
              Curate your reading sanctuary, compose worlds across floating archipelagos, study high literary craft, and track submissions to international publications.
            </p>
          </div>

          {/* Quick Action Matrix (Zero-Pill Discipline: refined borders and clean typography) */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/read')}
              className="px-4 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Library className="w-4 h-4" />
              <span>Explore BookForest</span>
            </button>

            <button
              onClick={() => navigate('/write')}
              className="px-4 py-2.5 rounded-xl bg-[#fffef2]/10 hover:bg-[#fffef2]/20 border border-[#fffef2]/30 text-[#fffef2] font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Feather className="w-4 h-4 text-[#d4a373]" />
              <span>Writing Studio</span>
            </button>

            <button
              onClick={() => navigate('/magazine')}
              className="px-4 py-2.5 rounded-xl bg-[#fffef2]/10 hover:bg-[#fffef2]/20 border border-[#fffef2]/30 text-[#fffef2] font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#d4a373]" />
              <span>Magazine Desk</span>
            </button>

            <button
              onClick={() => navigate('/publish')}
              className="px-4 py-2.5 rounded-xl bg-[#fffef2]/10 hover:bg-[#fffef2]/20 border border-[#fffef2]/30 text-[#fffef2] font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#d4a373]" />
              <span>Publishing Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid: Reader & Writer Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Reading Life & Personal Shelf (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Reader Widget */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#15803d] dark:text-[#4ade80]" />
                <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Continue Reading
                </h2>
              </div>
              <button
                onClick={() => navigate('/read')}
                className="text-xs text-[#b07843] dark:text-[#d4a373] hover:underline flex items-center gap-1 font-sans cursor-pointer"
              >
                <span>View All in Library</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {currentlyReading ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={currentlyReading.coverUrl}
                  alt={currentlyReading.title}
                  className="w-24 h-36 object-cover rounded-xl shadow-md border border-[#ebd9c5] dark:border-[#38332c] shrink-0"
                />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                    {currentlyReading.author} · {currentlyReading.genre}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] leading-snug">
                    {currentlyReading.title}
                  </h3>
                  <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 line-clamp-2 italic">
                    "{currentlyReading.reviewComments || 'An immersive speculative journey across forgotten lands.'}"
                  </p>

                  {/* Progress Indicator */}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      <span>Progress: {currentlyReading.currentProgressPages || 142} of {currentlyReading.totalPages || 320} pages</span>
                      <span className="font-bold text-[#15803d] dark:text-[#4ade80]">
                        {Math.round(((currentlyReading.currentProgressPages || 142) / (currentlyReading.totalPages || 320)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#ebd9c5]/60 dark:bg-[#38332c] overflow-hidden">
                      <div
                        className="h-full bg-[#15803d] dark:bg-[#4ade80] rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((currentlyReading.currentProgressPages || 142) / (currentlyReading.totalPages || 320)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenSampleChapter(currentlyReading)}
                      className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] hover:bg-[#38332c] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 shadow-xs flex items-center justify-center sm:justify-start gap-2 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Resume in Core Reader</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                No active book in reading shelf. Browse the library to pick your next adventure.
              </div>
            )}
          </section>

          {/* Reading Goal & Forest Challenge */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#ea580c]" />
                <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  2026 Reading Voyage
                </h2>
              </div>
              <span className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                {readingGoal?.completedBooks || 14} of {readingGoal?.targetBooks || 25} books read
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40">
                <div className="text-xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                  {readingGoal?.completedBooks || 14}
                </div>
                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Books Finished</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40">
                <div className="text-xl font-bold font-serif text-[#2a2724] dark:text-[#f5f2e6]">
                  {readingGoal?.completedPages || 4250}
                </div>
                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Pages Explored</div>
              </div>
              <div className="p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40">
                <div className="text-xl font-bold font-serif text-[#15803d] dark:text-[#4ade80]">
                  {Math.round(((readingGoal?.completedBooks || 14) / (readingGoal?.targetBooks || 25)) * 100)}%
                </div>
                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Goal Achieved</div>
              </div>
            </div>

            {/* Active Challenge List */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                Curated Challenge Tracks:
              </div>
              {(readingGoal?.challenges || []).slice(0, 2).map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5]/40 dark:border-[#38332c]/40"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-3.5 h-3.5 ${ch.completed ? 'text-[#15803d]' : 'text-[#2a2724]/30 dark:text-[#f5f2e6]/30'}`} />
                    <span className="font-medium text-[#2a2724] dark:text-[#f5f2e6]">{ch.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    {ch.currentCount}/{ch.targetCount}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Storizine Literary Spotlight */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#d4a373]" />
                <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Storizine Literary Spotlight
                </h2>
              </div>
              <button
                onClick={() => navigate('/magazine')}
                className="text-xs text-[#b07843] dark:text-[#d4a373] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read Magazine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={STORIZINE_ASSETS.shortStoriesCard.path}
                alt="Short Stories & Articles"
                className="w-full sm:w-36 h-28 object-cover rounded-xl border border-[#ebd9c5] dark:border-[#38332c]"
              />
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="text-[11px] text-[#b07843] dark:text-[#d4a373] font-mono uppercase tracking-wide">
                  Speculative Fiction · Issue #42
                </div>
                <h3 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  The Cartographer's Final Meridian
                </h3>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 line-clamp-2">
                  When the magnetic poles of the floating archipelago reverse, an aging scholar and her automaton apprentice must map the skies before morning...
                </p>
                <div className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                  By Storizine Editorial Desk · 12 min read
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Writing Studio & Publishing Center (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Active Writing Project */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-[#d4a373]" />
                <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Writing Studio
                </h2>
              </div>
              <button
                onClick={() => navigate('/write')}
                className="text-xs text-[#b07843] dark:text-[#d4a373] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Projects</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] text-base">
                    {activeProject.title}
                  </h3>
                  <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    {activeProject.genre} · {activeProject.format}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#b07843] dark:text-[#d4a373]">
                  {activeProject.lastEdited}
                </span>
              </div>

              <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 line-clamp-2 italic">
                "{activeProject.premise}"
              </p>

              {/* Word Count Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  <span>{activeProject.wordCount.toLocaleString()} words</span>
                  <span>Target: {activeProject.targetWordCount.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#ebd9c5]/60 dark:bg-[#38332c] overflow-hidden">
                  <div
                    className="h-full bg-[#d4a373] rounded-full transition-all duration-300"
                    style={{ width: `${Math.round((activeProject.wordCount / activeProject.targetWordCount) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => navigate('/write')}
                  className="flex-1 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] hover:bg-[#38332c] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume Editor</span>
                </button>
              </div>
            </div>
          </section>

          {/* Daily Craft Prompt Card */}
          <section className="bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#b07843] dark:text-[#d4a373]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Today's Writing Prompt</span>
              </div>
              <span className="text-[10px] font-mono text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                {dailyPrompt.difficulty}
              </span>
            </div>

            <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
              {dailyPrompt.title}
            </h4>

            <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed italic border-l-2 border-[#d4a373] pl-3">
              "{dailyPrompt.promptText}"
            </p>

            <div className="pt-2 flex justify-between items-center text-[11px]">
              <span className="text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                Used by {dailyPrompt.timesUsed} writers
              </span>
              <button
                onClick={() => navigate('/write')}
                className="text-[#b07843] dark:text-[#d4a373] font-bold hover:underline cursor-pointer"
              >
                Draft Response →
              </button>
            </div>
          </section>

          {/* Publishing Opportunities & Submissions */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2563eb] dark:text-[#60a5fa]" />
                <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Publishing Submissions
                </h2>
              </div>
              <button
                onClick={() => navigate('/publish')}
                className="text-xs text-[#2563eb] dark:text-[#60a5fa] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Tracker</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                    {nextOpportunity.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#b07843] dark:text-[#d4a373]">
                    Due {nextOpportunity.deadline}
                  </span>
                </div>
                <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                  {nextOpportunity.organizer} · {nextOpportunity.compensation}
                </p>
              </div>

              {/* Active submission count */}
              <div className="flex items-center justify-between text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 pt-1">
                <span>Active Manuscripts in Review:</span>
                <span className="font-mono font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  {INITIAL_SUBMISSION_TRACKS.filter(s => s.status === 'Under Review' || s.status === 'Submitted').length}
                </span>
              </div>
            </div>
          </section>

          {/* Writing Academy Spotlight */}
          <section className="bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8b5cf6]" />
                <h3 className="text-sm font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Academy Craft Masterclass
                </h3>
              </div>
              <button
                onClick={() => navigate('/learn')}
                className="text-xs text-[#8b5cf6] hover:underline cursor-pointer"
              >
                Browse All →
              </button>
            </div>

            <p className="text-xs font-serif text-[#2a2724] dark:text-[#f5f2e6] font-medium">
              {featuredLesson.title}
            </p>
            <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 line-clamp-2">
              {featuredLesson.summary}
            </p>
            <div className="text-[10px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
              {featuredLesson.estimatedMinutes} min read · Level: {featuredLesson.level}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
