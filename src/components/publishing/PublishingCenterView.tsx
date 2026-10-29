import React, { useState } from 'react';
import {
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  FileText,
  DollarSign,
  Calendar,
  ExternalLink,
  Plus,
  Compass,
  ArrowRight,
  Filter,
  Layers
} from 'lucide-react';
import { PublishingOpportunity, SubmissionTrack } from '../../types';
import {
  INITIAL_PUBLISHING_OPPORTUNITIES,
  INITIAL_SUBMISSION_TRACKS,
  AUTHOR_SAFETY_RULES
} from '../../data/publishingCenterData';
import { STORIZINE_ASSETS } from '../../data/storizineAssets';

type PublishTab = 'dashboard' | 'opportunities' | 'query' | 'submissions' | 'rights' | 'safety';

export const PublishingCenterView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PublishTab>('dashboard');
  const [opportunities, setOpportunities] = useState<PublishingOpportunity[]>(INITIAL_PUBLISHING_OPPORTUNITIES);
  const [submissions, setSubmissions] = useState<SubmissionTrack[]>(INITIAL_SUBMISSION_TRACKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Query Studio state
  const [queryForm, setQueryForm] = useState({
    title: 'The Chronicles of Saptarshi',
    genre: 'Epic Astral Fantasy',
    wordCount: '95,000 words',
    comps: 'THE PRIORY OF THE ORANGE TREE meets INVISIBLE CITIES',
    hook: 'When the astral bridges connecting seven floating civilizations begin to collapse, an apprentice astrolabe cartographer must restore the forgotten songs of sleeping celestial leviathans before perpetual void consumes them.',
    synopsis: 'Arion of the Seventh Sphere has spent his youth memorizing the starlight constellations etched into brass navigational spheres. When an ancient rift opens above the Sunken Spire, he discovers that the empire is fueled by stolen star-memories—including his own mother’s final words.',
    bio: 'I am a speculative fiction writer whose work explores astral cartography, diaspora folklore, and ecological resilience. My short fiction has appeared in Storizine.',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || opp.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleTrackOpportunity = (opp: PublishingOpportunity) => {
    const newTrack: SubmissionTrack = {
      id: `track-${Date.now()}`,
      opportunityTitle: opp.title,
      recipient: opp.organizer,
      projectTitle: 'The Chronicles of Saptarshi',
      dateSent: new Date().toISOString().split('T')[0],
      status: 'Preparing',
      followUpDate: opp.deadline,
      notes: `Targeting deadline: ${opp.deadline}. Rate: ${opp.compensation}`,
    };
    setSubmissions([newTrack, ...submissions]);
    showToast(`Added "${opp.title}" to your Submission Tracker.`);
    setActiveTab('submissions');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a2724] text-[#f5f2e6] border border-[#d4a373] px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#d4a373]" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#ebd9c5] dark:border-[#38332c] shadow-xl bg-[#181614] text-[#fffef2]">
        <div className="absolute inset-0 z-0">
          <img
            src={STORIZINE_ASSETS.guidebooksVista.path}
            alt="Publishing Center"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181614] via-[#181614]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#d4a373]">
            <Send className="w-4 h-4" />
            <span>Section E · Storizine Publishing Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#fffef2]">
            Submission Tracker &amp; Opportunities Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#fffef2]/80 font-serif leading-relaxed">
            Discover verified literary calls, craft professional agent query packages, manage live submission pipelines, and navigate contracts with safety.
          </p>
        </div>
      </div>

      {/* Sub-Tabs (Zero-Pill: quiet tile) */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'dashboard', label: 'Readiness & Overview', icon: Layers },
          { key: 'opportunities', label: 'Calls & Directory', icon: Search },
          { key: 'query', label: 'Query Studio', icon: FileText },
          { key: 'submissions', label: 'Submission Tracker', icon: Send },
          { key: 'rights', label: 'Rights & Contracts', icon: ShieldAlert },
          { key: 'safety', label: 'Author Safety Center', icon: AlertTriangle },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as PublishTab)}
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

      {/* TAB 1: DASHBOARD & READINESS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <div className="text-xs font-mono uppercase text-[#15803d] dark:text-[#4ade80]">
                Live Submissions
              </div>
              <div className="text-3xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                {submissions.filter(s => s.status === 'Under Review' || s.status === 'Submitted').length}
              </div>
              <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Manuscripts currently under active editorial review.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <div className="text-xs font-mono uppercase text-[#d4a373]">
                Upcoming Deadlines
              </div>
              <div className="text-3xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                {opportunities.filter(o => o.status === 'Open' || o.status === 'Closing Soon').length}
              </div>
              <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Verified calls closing within the next 60 days.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <div className="text-xs font-mono uppercase text-[#8b5cf6]">
                Average Response Time
              </div>
              <div className="text-3xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                42 days
              </div>
              <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Typical industry cycle for speculative fiction calls.
              </p>
            </div>
          </div>

          {/* Manuscript Readiness Checklist */}
          <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
              Standard Submission Readiness Checklist
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { title: 'Standard Manuscript Formatting', desc: 'Times New Roman/Garamond, double spaced, 1-inch margins, continuous line numbering' },
                { title: 'Logline & One-Sentence Hook', desc: 'Clear protagonist, stakes, and irreversible dilemma under 35 words' },
                { title: '1-Page Synopsis Completed', desc: 'Discloses full plot including climax and resolution without marketing hype' },
                { title: 'Comparable Titles (Comps) Selected', desc: '2-3 published works from the last 3-5 years balancing genre and tone' },
                { title: 'Author Biography (75-100 Words)', desc: 'Concise publication history, awards, background, and cultural stance' },
                { title: 'Rights Verification', desc: 'Confirming story has not been published elsewhere, including personal blogs' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-1">
                  <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CALLS & DIRECTORY */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                Verified Publishing Opportunities
              </h2>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Paying markets, pro anthologies, reputable grants, and open magazine calls.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search market, genre..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
              />
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
              >
                <option value="All">All Types</option>
                <option value="Anthology">Anthology</option>
                <option value="Contest">Contest</option>
                <option value="Grant">Grant</option>
                <option value="Literary Magazine">Literary Magazine</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOpportunities.map(opp => (
              <div
                key={opp.id}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebd9c5]/60 dark:border-[#38332c]/60 pb-3">
                  <div>
                    <div className="text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
                      {opp.type} · Deadline: {opp.deadline}
                    </div>
                    <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                      {opp.title}
                    </h3>
                    <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      Organized by {opp.organizer}
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div className="text-sm font-serif font-bold text-[#15803d] dark:text-[#4ade80]">
                      {opp.compensation}
                    </div>
                    <div className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                      Entry fee: {opp.entryFee}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed">
                  {opp.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    <strong>Genres:</strong> {opp.genres.join(' · ')}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-[#ebd9c5] dark:border-[#38332c] text-xs font-medium flex items-center gap-1.5"
                    >
                      <span>Guidelines</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => handleTrackOpportunity(opp)}
                      className="px-3 py-1.5 rounded-lg bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 cursor-pointer"
                    >
                      Track in Pipeline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUERY STUDIO */}
      {activeTab === 'query' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Query Studio &amp; Pitch Builder
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Compose, refine, and export literary agent query letters without marketing jargon or fluff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Project Title &amp; Metadata
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={queryForm.title}
                  onChange={e => setQueryForm({ ...queryForm, title: e.target.value })}
                  placeholder="Title"
                  className="p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                />
                <input
                  type="text"
                  value={queryForm.genre}
                  onChange={e => setQueryForm({ ...queryForm, genre: e.target.value })}
                  placeholder="Genre"
                  className="p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                />
                <input
                  type="text"
                  value={queryForm.wordCount}
                  onChange={e => setQueryForm({ ...queryForm, wordCount: e.target.value })}
                  placeholder="Word Count"
                  className="p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Comparable Titles (Comps)
              </label>
              <input
                type="text"
                value={queryForm.comps}
                onChange={e => setQueryForm({ ...queryForm, comps: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                The Core Hook (1-2 sentences)
              </label>
              <textarea
                rows={3}
                value={queryForm.hook}
                onChange={e => setQueryForm({ ...queryForm, hook: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Synopsis / Book Blurb
              </label>
              <textarea
                rows={5}
                value={queryForm.synopsis}
                onChange={e => setQueryForm({ ...queryForm, synopsis: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Author Bio
              </label>
              <textarea
                rows={3}
                value={queryForm.bio}
                onChange={e => setQueryForm({ ...queryForm, bio: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Dear [Agent Name],\n\nI am seeking representation for my ${queryForm.genre} novel, ${queryForm.title}, complete at ${queryForm.wordCount}. It will appeal to readers of ${queryForm.comps}.\n\n${queryForm.hook}\n\n${queryForm.synopsis}\n\n${queryForm.bio}\n\nThank you for your consideration.\n\nSincerely,\n[Author Name]`);
                  showToast('Full formatted query letter copied to clipboard!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs cursor-pointer shadow-md"
              >
                Copy Formatted Query Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUBMISSION TRACKER */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                Manuscript Pipeline Tracker
              </h2>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Live statuses, follow-up alarms, and notes for all dispatched materials.
              </p>
            </div>

            <button
              onClick={() => {
                const manual: SubmissionTrack = {
                  id: `track-${Date.now()}`,
                  opportunityTitle: 'Direct Agent Query',
                  recipient: 'Literary Agency',
                  projectTitle: 'The Chronicles of Saptarshi',
                  dateSent: new Date().toISOString().split('T')[0],
                  status: 'Submitted',
                  notes: 'Query letter and opening 3 chapters sent via QueryManager.',
                };
                setSubmissions([manual, ...submissions]);
                showToast('Added manual submission log.');
              }}
              className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 cursor-pointer self-start sm:self-auto"
            >
              + Log New Submission
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#ebd9c5] dark:border-[#38332c]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#f5f1e3]/80 dark:bg-[#25221e]/80 border-b border-[#ebd9c5] dark:border-[#38332c] text-[#2a2724] dark:text-[#f5f2e6] font-serif">
                <tr>
                  <th className="p-3.5">Market / Opportunity</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Date Dispatched</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebd9c5]/60 dark:divide-[#38332c]/60 bg-[#fffef2] dark:bg-[#1a1715]">
                {submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-[#fbf9ee] dark:hover:bg-[#221f1c]">
                    <td className="p-3.5 font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                      <div>{sub.opportunityTitle}</div>
                      <div className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50 font-normal">{sub.recipient}</div>
                    </td>
                    <td className="p-3.5 text-[#2a2724]/80 dark:text-[#f5f2e6]/80">{sub.projectTitle}</td>
                    <td className="p-3.5 font-mono text-[#2a2724]/60 dark:text-[#f5f2e6]/60">{sub.dateSent}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] text-[#d4a373]">
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#2a2724]/70 dark:text-[#f5f2e6]/70 italic">{sub.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RIGHTS & CONTRACTS */}
      {activeTab === 'rights' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Literary Rights &amp; Contract Foundations
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Plain-language guidelines on intellectual property, reversion clauses, and subsidiary rights.
            </p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                First North American Serial Rights (FNASR)
              </h3>
              <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Standard for literary journals and magazines. Grants the publication the exclusive right to publish the story first, typically reverting after 30 to 90 days, after which you may resell it as a reprint.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                Reversion of Rights Clause
              </h3>
              <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Crucial for book deals. When a book goes out of print or fails to sell a minimum threshold of copies annually, all publication rights must legally revert back to the author.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-2">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                Subsidiary Rights (Audio, Translation, Film/TV)
              </h3>
              <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                Retain these rights whenever possible. If granted to a publisher, ensure split royalties are equitable (typically 50/50 or 80/20 in author's favor) and subject to active exploitation deadlines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUTHOR SAFETY CENTER */}
      {activeTab === 'safety' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#ea580c]" />
              <span>Author Safety &amp; Scam Detection Center</span>
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Protect your craft, money, and intellectual property from predatory vanity presses.
            </p>
          </div>

          <div className="space-y-4">
            {AUTHOR_SAFETY_RULES.map(rule => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                    {rule.title}
                  </h3>
                  <span className="text-[10px] font-mono text-[#ea580c] uppercase">
                    {rule.dangerLevel}
                  </span>
                </div>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                  {rule.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
