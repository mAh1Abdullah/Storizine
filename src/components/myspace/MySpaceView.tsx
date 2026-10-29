import React, { useState } from 'react';
import {
  User,
  Award,
  Target,
  BookMarked,
  Settings,
  Shield,
  Download,
  CheckCircle2,
  Lock,
  Eye,
  Trash2,
  Save,
  Feather,
  Library,
  Upload
} from 'lucide-react';
import { AuthorProfile, PublishedBook, UpcomingBook, BookForestEntry, ReadingGoal } from '../../types';
import { exportBookForestJSON, exportBookForestCSV } from '../../utils/exportUtils';
import { STORIZINE_ASSETS } from '../../data/storizineAssets';

type MySpaceTab = 'profile' | 'portfolio' | 'goals' | 'journal' | 'saved' | 'settings' | 'privacy' | 'export';

interface MySpaceViewProps {
  author: AuthorProfile;
  onUpdateAuthor: (updated: AuthorProfile) => void;
  publishedBooks: PublishedBook[];
  upcomingBooks: UpcomingBook[];
  bookForestEntries: BookForestEntry[];
  readingGoal?: ReadingGoal;
  onUpdateReadingGoal?: (goal: ReadingGoal) => void;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
}

export const MySpaceView: React.FC<MySpaceViewProps> = ({
  author,
  onUpdateAuthor,
  publishedBooks,
  upcomingBooks,
  bookForestEntries,
  readingGoal,
  onUpdateReadingGoal,
  isLoggedIn,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<MySpaceTab>('profile');
  const [profileForm, setProfileForm] = useState<AuthorProfile>({ ...author });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Journal entries
  const [journalEntries, setJournalEntries] = useState<Array<{
    id: string;
    date: string;
    title: string;
    text: string;
    linkedBook?: string;
  }>>([
    {
      id: 'j-1',
      date: '2026-10-28',
      title: 'Observations on Non-Linear Astral Worldbuilding',
      text: 'Explored how celestial bridges can represent ancestral generational trauma. The sky islands do not float on magic; they float on forgotten grief.',
      linkedBook: 'The Chronicles of Saptarshi',
    },
    {
      id: 'j-2',
      date: '2026-10-24',
      title: 'Reflections after Finishing "A Stranger in Olondria"',
      text: 'The acoustic prose style is breathtaking. Need to bring more sensory scent and weather texture into chapter 14.',
      linkedBook: 'A Stranger in Olondria',
    },
  ]);

  const [newJournalTitle, setNewJournalTitle] = useState('');
  const [newJournalText, setNewJournalText] = useState('');

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    shelfPublic: false,
    notesPublic: false,
    allowAiDataUse: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAuthor(profileForm);
    showToast('Profile updated successfully!');
  };

  const handleAddJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalTitle.trim() || !newJournalText.trim()) return;
    const entry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: newJournalTitle.trim(),
      text: newJournalText.trim(),
    };
    setJournalEntries([entry, ...journalEntries]);
    setNewJournalTitle('');
    setNewJournalText('');
    showToast('Saved private journal entry.');
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-[#fbf9ee] dark:bg-[#221f1c] p-12 rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] text-center max-w-lg mx-auto my-12 space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-[#d4a373]/20 border border-[#d4a373]/40 flex items-center justify-center text-[#d4a373] mx-auto">
          <Lock className="w-6 h-6 text-[#d4a373]" />
        </div>
        <h2 className="text-2xl font-serif text-[#2a2724] dark:text-[#f5f2e6]">
          My Space Authentication Required
        </h2>
        <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
          Your private journal, personal goals, privacy configurations, and data export are protected. Sign in to access your personal space.
        </p>
        <button
          onClick={onOpenLoginModal}
          className="px-6 py-2.5 rounded-xl font-bold bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] text-xs shadow-md transition-all cursor-pointer"
        >
          Sign In to Access My Space
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a2724] text-[#f5f2e6] border border-[#d4a373] px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#d4a373]" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="relative rounded-3xl overflow-hidden border border-[#ebd9c5] dark:border-[#38332c] shadow-xl bg-[#181614] text-[#fffef2]">
        <div className="absolute inset-0 z-0">
          <img
            src={author.bannerUrl || STORIZINE_ASSETS.authorBioLandscape.path}
            alt={author.name}
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181614] via-[#181614]/85 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#fffef2]/20 shadow-xl shrink-0 bg-[#25221e]">
            {author.avatarUrl ? (
              <img src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl font-serif text-[#d4a373]">
                {author.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#fffef2]">
                {author.name}
              </h1>
              <span className="text-xs text-[#d4a373] font-mono">
                · Verified Literary Creator
              </span>
            </div>
            <p className="text-xs text-[#fffef2]/80 font-serif max-w-xl line-clamp-2">
              {author.bio}
            </p>
            <div className="text-[11px] text-[#fffef2]/60 pt-1">
              {publishedBooks.length} Published Books · {bookForestEntries.length} In Personal Forest · {readingGoal?.completedBooks || 0} Books Read in 2026
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs (Zero-Pill: quiet tile) */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'profile', label: 'Author Profile', icon: User },
          { key: 'portfolio', label: 'Published Portfolio', icon: Award },
          { key: 'goals', label: 'Reading & Craft Goals', icon: Target },
          { key: 'journal', label: 'Private Journal', icon: BookMarked },
          { key: 'saved', label: 'Saved Items', icon: Feather },
          { key: 'settings', label: 'Account Settings', icon: Settings },
          { key: 'privacy', label: 'Privacy & Permissions', icon: Shield },
          { key: 'export', label: 'Data Export', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as MySpaceTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] border border-[#d4a373]/30 shadow-xs'
                  : 'text-[#2a2724]/70 dark:text-[#f5f2e6]/70 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE EDIT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-4 p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-xs">
          <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
            Public Author Profile Details
          </h2>

          <div>
            <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">Author Name *</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">Author Title / Subtitle</label>
            <input
              type="text"
              value={profileForm.title}
              onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">Biography</label>
            <textarea
              rows={4}
              value={profileForm.bio}
              onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">Featured Philosophical Quote</label>
            <input
              type="text"
              value={profileForm.featuredQuote}
              onChange={e => setProfileForm({ ...profileForm, featuredQuote: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs cursor-pointer shadow-md"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PORTFOLIO */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Published Works ({publishedBooks.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publishedBooks.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] flex gap-4 items-start"
              >
                <img
                  src={b.coverUrl}
                  alt={b.title}
                  className="w-20 h-28 object-cover rounded-xl border border-[#ebd9c5] dark:border-[#38332c] shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <div className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                    {b.title}
                  </div>
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    {b.genre} · {b.publisher} · {b.pages} pages
                  </div>
                  <p className="text-[11px] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 line-clamp-2 italic pt-1">
                    "{b.blurb}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOALS */}
      {activeTab === 'goals' && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Annual Reading Targets (2026)
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Books Read: {readingGoal?.completedBooks || 14}</span>
                <span>Target: {readingGoal?.targetBooks || 25}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#ebd9c5]/60 dark:bg-[#38332c] overflow-hidden">
                <div
                  className="h-full bg-[#15803d] rounded-full"
                  style={{ width: `${Math.round(((readingGoal?.completedBooks || 14) / (readingGoal?.targetBooks || 25)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVATE JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-[#ebd9c5] dark:border-[#38332c] pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#d4a373]" />
                <span>Private Writer's Reflection Journal</span>
              </h2>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Encrypted and private by default. Notes here never appear in public search or portfolio pages.
              </p>
            </div>
          </div>

          {/* New Entry Form */}
          <form onSubmit={handleAddJournalEntry} className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-3 text-xs">
            <input
              type="text"
              placeholder="Entry Title / Central Epiphany"
              value={newJournalTitle}
              onChange={e => setNewJournalTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none font-bold"
            />
            <textarea
              rows={3}
              placeholder="Record reflections on craft, passages read, or story fragments..."
              value={newJournalText}
              onChange={e => setNewJournalText(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 cursor-pointer"
              >
                Log Reflection
              </button>
            </div>
          </form>

          {/* Journal Entries List */}
          <div className="space-y-4">
            {journalEntries.map(j => (
              <div
                key={j.id}
                className="p-5 rounded-2xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                    {j.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                    {j.date}
                  </span>
                </div>
                <p className="text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed italic">
                  "{j.text}"
                </p>
                {j.linkedBook && (
                  <div className="text-[10px] text-[#b07843] dark:text-[#d4a373] font-mono">
                    Linked Reference: {j.linkedBook}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SAVED ITEMS */}
      {activeTab === 'saved' && (
        <div className="space-y-6 max-w-3xl">
          <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
            Saved Collections &amp; Articles
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">The Cartographer's Final Meridian</div>
                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Storizine Magazine · Speculative Fiction</div>
              </div>
              <span className="text-[11px] text-[#b07843] dark:text-[#d4a373]">Saved 2 days ago</span>
            </div>

            <div className="p-4 rounded-xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between">
              <div>
                <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">Architecting Astral Geographies</div>
                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">Writing Academy · Worldbuilding Masterclass</div>
              </div>
              <span className="text-[11px] text-[#b07843] dark:text-[#d4a373]">Saved 1 week ago</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-4 p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-xs">
          <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
            Platform Preferences &amp; Typography Scale
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60">
              <span>Default Reading Typography</span>
              <span className="font-bold font-serif">Merriweather &amp; Cormorant Garamond</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60">
              <span>Bilingual Bengali Glyph Rendering</span>
              <span className="font-bold text-[#15803d]">Enabled (SolaimanLipi &amp; Noto Serif Bengali)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PRIVACY & PERMISSIONS */}
      {activeTab === 'privacy' && (
        <div className="max-w-2xl space-y-4 p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-xs">
          <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
            Privacy &amp; Data Governance
          </h2>
          <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
            By design, your drafts, story composer outlines, journal reflections, and personal reading status remain completely private unless you explicitly choose to share or publish.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { key: 'profilePublic', title: 'Public Author Portfolio', desc: 'Allow readers to view your published books and public bio' },
              { key: 'shelfPublic', title: 'Public Reading Shelf', desc: 'Share your finished books list in BookForest' },
              { key: 'allowAiDataUse', title: 'Exclude Manuscripts from Model Training', desc: 'Guarantees your creative text is never used for foundation model training' },
            ].map(item => (
              <div key={item.key} className="flex items-start justify-between p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60">
                <div className="space-y-0.5 max-w-md">
                  <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">{item.title}</div>
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">{item.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(privacySettings as any)[item.key] ?? false}
                  onChange={e => {
                    setPrivacySettings({ ...privacySettings, [item.key]: e.target.checked });
                    showToast('Privacy preference updated.');
                  }}
                  className="rounded border-[#ebd9c5] mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: DATA EXPORT */}
      {activeTab === 'export' && (
        <div className="max-w-2xl space-y-4 p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-xs">
          <h2 className="text-base font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
            Data Export &amp; Ownership
          </h2>
          <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
            You own your manuscripts, reading data, and journal notes. Export standard JSON or CSV files at any time with a single click.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                exportBookForestJSON(bookForestEntries);
                showToast('Exported BookForest library (JSON)');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Library (JSON)</span>
            </button>

            <button
              onClick={() => {
                exportBookForestCSV(bookForestEntries);
                showToast('Exported BookForest library (CSV)');
              }}
              className="px-4 py-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] text-xs font-medium flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Library (CSV)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
