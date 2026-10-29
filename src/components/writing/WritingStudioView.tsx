import React, { useState } from 'react';
import {
  Feather,
  Plus,
  BookOpen,
  Sparkles,
  Clock,
  Save,
  CheckCircle2,
  FileText,
  Layers,
  Compass,
  Play,
  RotateCcw,
  Check,
  Edit3,
  Trash2,
  Sliders
} from 'lucide-react';
import { WritingProject, WritingPrompt, WritingSessionLog, WritingTemplate } from '../../types';
import {
  INITIAL_WRITING_PROJECTS,
  INITIAL_WRITING_PROMPTS,
  INITIAL_WRITING_SESSIONS,
  INITIAL_WRITING_TEMPLATES
} from '../../data/writingStudioData';
import { STORIZINE_ASSETS } from '../../data/storizineAssets';

type StudioTab = 'projects' | 'composer' | 'editor' | 'prompts' | 'sessions' | 'templates';

interface WritingStudioViewProps {
  onOpenSampleChapter?: (book: any) => void;
}

export const WritingStudioView: React.FC<WritingStudioViewProps> = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>('projects');
  const [projects, setProjects] = useState<WritingProject[]>(INITIAL_WRITING_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(INITIAL_WRITING_PROJECTS[0].id);

  // Active project selection
  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Editor states
  const [editorText, setEditorText] = useState<string>(selectedProject.currentDraft || '');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Writing sprint timer
  const [timerSeconds, setTimerSeconds] = useState<number>(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // New project modal state
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    format: 'novel' as WritingProject['format'],
    genre: '',
    premise: '',
    targetWordCount: 80000,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectProject = (proj: WritingProject) => {
    setSelectedProjectId(proj.id);
    setEditorText(proj.currentDraft || '');
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorText(e.target.value);
    setIsSaved(false);
  };

  const handleSaveDraft = () => {
    const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;
    setProjects(prev =>
      prev.map(p =>
        p.id === selectedProjectId
          ? { ...p, currentDraft: editorText, wordCount: p.wordCount + 10, lastEdited: 'Just now' }
          : p
      )
    );
    setIsSaved(true);
    showToast(`Draft saved successfully (${wordCount} words)`);
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.title.trim()) return;

    const newProj: WritingProject = {
      id: `proj-${Date.now()}`,
      title: newProjectForm.title.trim(),
      format: newProjectForm.format,
      language: 'English',
      genre: newProjectForm.genre || 'Speculative Fiction',
      premise: newProjectForm.premise || 'An unwritten voyage awaits.',
      workflow: 'hybrid',
      status: 'planning',
      wordCount: 0,
      targetWordCount: Number(newProjectForm.targetWordCount) || 80000,
      lastEdited: 'Just created',
      charactersCount: 1,
      scenesCount: 1,
      currentDraft: `# ${newProjectForm.title.trim()}\n\nChapter 1\n\nBegin your journey here...`,
    };

    setProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.id);
    setEditorText(newProj.currentDraft || '');
    setIsCreatingProject(false);
    showToast(`Created project "${newProj.title}"`);
    setActiveTab('composer');
  };

  // Timer tick
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      showToast('Sprint session finished! Time to stretch and log your words.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#ebd9c5] dark:border-[#38332c] shadow-xl bg-[#181614] text-[#fffef2]">
        <div className="absolute inset-0 z-0">
          <img
            src={STORIZINE_ASSETS.goldenFantasyWorld.path}
            alt="Writing Studio"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181614] via-[#181614]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#d4a373]">
            <Feather className="w-4 h-4" />
            <span>Section B · Writing Studio &amp; Story Composer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#fffef2]">
            Craft Worlds With Precision
          </h1>
          <p className="text-xs sm:text-sm text-[#fffef2]/80 font-serif leading-relaxed">
            Distraction-free manuscript drafting, living character bibles, structure worksheets, and daily writing sprints designed for speculative authors.
          </p>
        </div>
      </div>

      {/* Section Sub-Navigation Tabs (Zero-Pill: clean underline/tile) */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'projects', label: 'Projects & Outlines', icon: Layers },
          { key: 'composer', label: 'Story Composer', icon: Compass },
          { key: 'editor', label: 'Focus Editor', icon: FileText },
          { key: 'prompts', label: 'Prompt Studio', icon: Sparkles },
          { key: 'sessions', label: 'Writing Sprints', icon: Clock },
          { key: 'templates', label: 'Craft Templates', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as StudioTab)}
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

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                Manuscript Portfolio
              </h2>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Active novels, serials, short stories, and speculative outlines.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="px-4 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Writing Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(proj => {
              const isCurrent = proj.id === selectedProjectId;
              const progressPct = Math.min(100, Math.round((proj.wordCount / proj.targetWordCount) * 100));
              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelectProject(proj)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                    isCurrent
                      ? 'bg-[#fbf9ee] dark:bg-[#221f1c] border-[#d4a373] shadow-md'
                      : 'bg-[#fffef2] dark:bg-[#1a1715] border-[#ebd9c5] dark:border-[#38332c] hover:border-[#d4a373]/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-sans">
                        {proj.genre} · {proj.format}
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] pt-0.5">
                        {proj.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#b07843] dark:text-[#d4a373] capitalize">
                      {proj.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 line-clamp-3 italic">
                    "{proj.premise}"
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                      <span>{proj.wordCount.toLocaleString()} words</span>
                      <span>Target: {proj.targetWordCount.toLocaleString()} ({progressPct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#ebd9c5]/60 dark:bg-[#38332c] overflow-hidden">
                      <div
                        className="h-full bg-[#d4a373] rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                    <span>Last edited {proj.lastEdited}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProject(proj);
                        setActiveTab('editor');
                      }}
                      className="text-[#b07843] dark:text-[#d4a373] font-bold hover:underline"
                    >
                      Open Editor →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STORY COMPOSER */}
      {activeTab === 'composer' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <div>
              <div className="text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
                Active Story Bible
              </div>
              <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                {selectedProject.title} — Lore &amp; Beat Architecture
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('editor')}
                className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 cursor-pointer"
              >
                Jump to Focus Editor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#d4a373]" />
                <span>Central Stance &amp; Question</span>
              </h3>
              <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 leading-relaxed italic border-l-2 border-[#d4a373] pl-3">
                "{selectedProject.storyBible?.centralQuestion || 'What price will the realm pay to remember its celestial past?'}"
              </p>
              <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 pt-2">
                <strong>Setting:</strong> {selectedProject.storyBible?.setting || 'The Astral Skylands'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#15803d]" />
                <span>Characters &amp; Foils</span>
              </h3>
              <div className="space-y-1.5 text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
                <p><strong>Protagonist:</strong> {selectedProject.storyBible?.protagonist || 'Arion'}</p>
                <p><strong>Antagonist:</strong> {selectedProject.storyBible?.antagonist || 'The Archon'}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
              <h3 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                <span>Thematic Motifs</span>
              </h3>
              <ul className="space-y-1 text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                {(selectedProject.storyBible?.keyThemes || ['Legacy', 'Cosmic Wonder', 'The Memory of Stars']).map((theme, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#d4a373]" />
                    <span>{theme}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Plot Beat Sheet Preview */}
          <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
              Three-Act Structural Outline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f5f1e3]/50 dark:bg-[#25221e]/50 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-2">
                <div className="font-bold text-[#d4a373]">Act I: The Anomaly</div>
                <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Introduction to the dying bridges. The celestial parchment unsealed.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#f5f1e3]/50 dark:bg-[#25221e]/50 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-2">
                <div className="font-bold text-[#d4a373]">Act II-A: The Ascent</div>
                <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">Navigating the Sunken Spire. First skirmish with void acolytes.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#f5f1e3]/50 dark:bg-[#25221e]/50 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-2">
                <div className="font-bold text-[#d4a373]">Act II-B: Devastation</div>
                <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">The leviathan awakens. The cost of ancient language revealed.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#f5f1e3]/50 dark:bg-[#25221e]/50 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 space-y-2">
                <div className="font-bold text-[#d4a373]">Act III: Convergence</div>
                <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">The final bridge ceremony. A new constellation etched into sky.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FOCUS EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fbf9ee] dark:bg-[#1a1715] p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c]">
            <div className="flex items-center gap-3">
              <span className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                Editing: {selectedProject.title}
              </span>
              <span className="text-xs text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                · {editorText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono ${isSaved ? 'text-[#15803d]' : 'text-[#ea580c]'}`}>
                {isSaved ? '● All changes saved' : '○ Unsaved changes'}
              </span>

              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] overflow-hidden bg-[#fffef2] dark:bg-[#181614] shadow-inner p-6 sm:p-12">
            <textarea
              value={editorText}
              onChange={handleEditorChange}
              rows={22}
              className="w-full bg-transparent resize-y outline-none font-serif text-base sm:text-lg leading-relaxed text-[#2a2724] dark:text-[#f5f2e6] placeholder:text-[#2a2724]/30"
              placeholder="Begin writing your scene here..."
            />
          </div>
        </div>
      )}

      {/* TAB 4: PROMPT STUDIO */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Prompt Studio &amp; Idea Randomizer
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Curated creative prompts across speculative fiction, sensory craft, and worldbuilding dilemmas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_WRITING_PROMPTS.map(p => (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
                    {p.category} · {p.difficulty}
                  </span>
                  <span className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                    Used {p.timesUsed} times
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                  {p.title}
                </h3>

                <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 italic border-l-2 border-[#d4a373] pl-3 leading-relaxed">
                  "{p.promptText}"
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    Source: {p.author}
                  </div>
                  <button
                    onClick={() => {
                      setEditorText(prev => `${prev}\n\n## Prompt Exercise: ${p.title}\n\n${p.promptText}\n\n---\n\n`);
                      setActiveTab('editor');
                      showToast(`Loaded "${p.title}" into Focus Editor!`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 cursor-pointer"
                  >
                    Draft with this Prompt →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: WRITING SPRINT SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#fbf9ee] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-center max-w-xl mx-auto space-y-5">
            <h2 className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Focused Writing Sprint
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              No guilt, no public shame. Just a dedicated quiet window between you and the blank page.
            </p>

            <div className="text-5xl font-mono font-bold text-[#2a2724] dark:text-[#f5f2e6] tracking-wider py-4">
              {formatTimer(timerSeconds)}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="px-6 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4" />
                <span>{isTimerRunning ? 'Pause Sprint' : 'Start Sprint'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(15 * 60);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] text-xs font-medium cursor-pointer"
              >
                Reset (15m)
              </button>
            </div>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
              Recent Sprint History
            </h3>
            {INITIAL_WRITING_SESSIONS.map(sess => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                    {sess.projectTitle} · {sess.wordsWritten} words
                  </div>
                  <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                    {sess.notes}
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                  <div>{sess.durationMinutes} mins</div>
                  <div>{sess.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CRAFT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Craft &amp; Architecture Worksheets
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Battle-tested structural frameworks for worldbuilding, character matrices, and revision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_WRITING_TEMPLATES.map(t => (
              <div
                key={t.id}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4"
              >
                <div className="text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
                  {t.category} Template
                </div>
                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                  {t.title}
                </h3>
                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                  {t.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-[#ebd9c5]/60 dark:border-[#38332c]/60">
                  <div className="text-[11px] font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                    Sequence Highlights:
                  </div>
                  {t.structure.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 flex items-start gap-1.5">
                      <span className="font-mono text-[#d4a373]">{idx + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setEditorText(prev => `${prev}\n\n# ${t.title}\n\n${t.structure.map((s, i) => `### ${i + 1}. ${s}\n\n[Write notes here...]\n`).join('\n')}\n`);
                      setActiveTab('editor');
                      showToast(`Loaded ${t.title} worksheet into Editor!`);
                    }}
                    className="w-full py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 cursor-pointer"
                  >
                    Use in Active Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fffef2] dark:bg-[#1f1c19] border border-[#ebd9c5] dark:border-[#38332c] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Create New Writing Project
            </h3>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Glass Dunes of Arion"
                  value={newProjectForm.title}
                  onChange={e => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none focus:ring-2 focus:ring-[#d4a373]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                    Format
                  </label>
                  <select
                    value={newProjectForm.format}
                    onChange={e => setNewProjectForm({ ...newProjectForm, format: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                  >
                    <option value="novel">Novel</option>
                    <option value="short-story">Short Story</option>
                    <option value="serial">Web Serial</option>
                    <option value="poetry">Poetry Collection</option>
                    <option value="article">Essay / Article</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                    Target Word Count
                  </label>
                  <input
                    type="number"
                    value={newProjectForm.targetWordCount}
                    onChange={e => setNewProjectForm({ ...newProjectForm, targetWordCount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                  Genre &amp; Mood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Astral Fantasy, Eco-Fiction"
                  value={newProjectForm.genre}
                  onChange={e => setNewProjectForm({ ...newProjectForm, genre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                  Premise or Central Hook
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the irreversible fracture that sparks the journey?"
                  value={newProjectForm.premise}
                  onChange={e => setNewProjectForm({ ...newProjectForm, premise: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-4 py-2 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs cursor-pointer shadow-md"
                >
                  Initialize Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
