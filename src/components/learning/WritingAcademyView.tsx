import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Send,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { AcademyLesson, AcademyLearningPath, AcademyExercise } from '../../types';
import {
  INITIAL_ACADEMY_LESSONS,
  INITIAL_ACADEMY_PATHS,
  INITIAL_ACADEMY_EXERCISES
} from '../../data/learningAcademyData';
import { STORIZINE_ASSETS } from '../../data/storizineAssets';

type AcademyTab = 'catalog' | 'paths' | 'lesson' | 'exercises' | 'clinic';

export const WritingAcademyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AcademyTab>('catalog');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(INITIAL_ACADEMY_LESSONS[0].id);

  // Active lesson
  const activeLesson = INITIAL_ACADEMY_LESSONS.find(l => l.id === selectedLessonId) || INITIAL_ACADEMY_LESSONS[0];

  // Story Clinic states
  const [clinicExcerpt, setClinicExcerpt] = useState<string>(
    'The sky was red. The dragon roared as it landed on the rock. Arion drew his sword and yelled at it.'
  );
  const [clinicMode, setClinicMode] = useState<string>('clarity');
  const [clinicFeedback, setClinicFeedback] = useState<{
    strengths: string[];
    observations: string[];
    recommendations: string[];
  } | null>(null);

  // Exercise practice text
  const [exerciseText, setExerciseText] = useState<string>('');
  const [submittedExercise, setSubmittedExercise] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenLesson = (lesson: AcademyLesson) => {
    setSelectedLessonId(lesson.id);
    setActiveTab('lesson');
  };

  const handleRunStoryClinic = () => {
    // Generate craft diagnostic based on mode
    if (clinicMode === 'sensory') {
      setClinicFeedback({
        strengths: ['Immediate action verb present', 'Clear subject focus'],
        observations: [
          'Visual descriptions ("red", "rock") are generic and lack tactile or olfactory texture',
          'Action lacks physical resistance or consequences on the character’s posture',
        ],
        recommendations: [
          'Replace "The sky was red" with sensory atmosphere: "The twilight had curdled into the raw bronze of heated copper"',
          'Add visceral resonance to the arrival: "The downdraft crushed wild sage beneath talons, filling the gorge with the bitter scent of bruised herbs"',
        ],
      });
    } else if (clinicMode === 'pacing') {
      setClinicFeedback({
        strengths: ['High-tempo sentence construction'],
        observations: [
          'All three sentences have identical cadence (Subject + Verb + Object)',
          'No anticipation built before the confrontation',
        ],
        recommendations: [
          'Vary sentence lengths to choreograph reader heartbeat',
          'Insert an involuntary somatic beat before the character acts (e.g. breathless pause, hand trembling on the pommel)',
        ],
      });
    } else {
      setClinicFeedback({
        strengths: ['Unambiguous narrative objective'],
        observations: [
          'Telling rather than showing emotional state ("yelled at it")',
          'Lacks subtext or relationship context between human and beast',
        ],
        recommendations: [
          'Ground the shout with specific linguistic weight or ancient command',
          'Anchor the character’s positioning relative to the environment',
        ],
      });
    }
    showToast('Story Clinic diagnostic generated.');
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
            alt="Writing Academy"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181614] via-[#181614]/80 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#d4a373]">
            <Award className="w-4 h-4" />
            <span>Section C · Storizine Writing Academy &amp; Story Clinic</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#fffef2]">
            High Literary Craft for Speculative Voices
          </h1>
          <p className="text-xs sm:text-sm text-[#fffef2]/80 font-serif leading-relaxed">
            Deconstruct astral worldbuilding, master sentence cadence, complete focused sensory drills, and submit excerpts to the diagnostic Story Clinic.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation (Zero-Pill: quiet tile) */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-[#ebd9c5] dark:border-[#38332c] pb-2 overflow-x-auto text-xs font-bold">
        {[
          { key: 'catalog', label: 'Craft Catalog', icon: BookOpen },
          { key: 'paths', label: 'Curated Paths', icon: Compass },
          { key: 'lesson', label: 'Active Lesson', icon: FileText },
          { key: 'exercises', label: 'Practical Drills', icon: Sparkles },
          { key: 'clinic', label: 'Story Clinic', icon: Sliders },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AcademyTab)}
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

      {/* TAB 1: CRAFT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Masterclass Master List
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Essays and lessons compiled by the Storizine editorial board and visiting master authors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ACADEMY_LESSONS.map(lesson => (
              <div
                key={lesson.id}
                onClick={() => handleOpenLesson(lesson)}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] hover:border-[#d4a373] transition-all cursor-pointer space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
                    {lesson.category} · {lesson.level}
                  </span>
                  <span className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                    {lesson.estimatedMinutes} min read
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6] leading-snug">
                  {lesson.title}
                </h3>

                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                  {lesson.summary}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#ebd9c5]/60 dark:border-[#38332c]/60 text-xs">
                  <span className="text-[#2a2724]/60 dark:text-[#f5f2e6]/60 font-serif">
                    By {lesson.author}
                  </span>
                  <span className="text-[#b07843] dark:text-[#d4a373] font-bold flex items-center gap-1">
                    Study Lesson <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CURATED PATHS */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Structured Apprenticeships
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Multi-month modular pathways guiding you from raw impulse to publication-ready manuscript.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ACADEMY_PATHS.map(path => (
              <div
                key={path.id}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#15803d] dark:text-[#4ade80] font-mono uppercase">
                    {path.level}
                  </span>
                  <span className="text-[11px] text-[#2a2724]/50 dark:text-[#f5f2e6]/50">
                    {path.completedLessons}/{path.totalLessons} modules completed
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                  {path.title}
                </h3>

                <p className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                  {path.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                    Syllabus Overview:
                  </div>
                  {path.modules.map((m, idx) => (
                    <div key={idx} className="text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 flex items-center gap-2">
                      <CheckCircle className={`w-3.5 h-3.5 ${idx < path.completedLessons ? 'text-[#15803d]' : 'text-[#2a2724]/30'}`} />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      showToast(`Enrolled in ${path.title}`);
                      setActiveTab('catalog');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 cursor-pointer"
                  >
                    Resume Apprenticeship Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE LESSON DETAIL */}
      {activeTab === 'lesson' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <div className="flex items-center gap-2 text-xs text-[#b07843] dark:text-[#d4a373] font-mono uppercase">
              <span>{activeLesson.category}</span>
              <span>·</span>
              <span>{activeLesson.level}</span>
              <span>·</span>
              <span>{activeLesson.estimatedMinutes} min read</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              {activeLesson.title}
            </h2>
            <div className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Instructor: {activeLesson.author}
            </div>
          </div>

          {/* Lesson Body */}
          <div className="p-8 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] text-sm leading-relaxed space-y-4 font-serif text-[#2a2724] dark:text-[#f5f2e6] whitespace-pre-line">
            {activeLesson.content}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:underline cursor-pointer"
            >
              ← Back to Catalog
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#181614] font-bold text-xs shadow-md cursor-pointer"
            >
              Practice with Linked Exercises →
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: EXERCISES */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Targeted Craft Drills
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Specific muscle-building exercises to elevate your prose beyond familiar clichés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ACADEMY_EXERCISES.map(ex => (
              <div
                key={ex.id}
                className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4"
              >
                <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6]">
                  {ex.title}
                </h3>

                <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 font-medium leading-relaxed">
                  <strong>Assignment:</strong> {ex.prompt}
                </p>

                <div className="p-3 rounded-xl bg-[#f5f1e3]/60 dark:bg-[#25221e]/60 border border-[#ebd9c5]/40 dark:border-[#38332c]/40 text-xs text-[#2a2724]/70 dark:text-[#f5f2e6]/70 leading-relaxed">
                  <div className="font-bold text-[#d4a373] mb-1">Craft Guidance:</div>
                  {ex.guidance}
                </div>

                <div className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 italic border-l-2 border-[#15803d] pl-3">
                  <strong>Exemplar Excerpt:</strong> "{ex.sampleExemplar}"
                </div>

                <div className="space-y-2 pt-2">
                  <textarea
                    rows={4}
                    placeholder="Type your response here to test your prose..."
                    value={exerciseText}
                    onChange={e => setExerciseText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent text-xs outline-none"
                  />
                  <button
                    onClick={() => {
                      if (!exerciseText.trim()) return;
                      setSubmittedExercise(true);
                      showToast('Exercise response logged to your craft journal!');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] text-xs font-bold border border-[#d4a373]/30 cursor-pointer"
                  >
                    Submit Drill Response
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STORY CLINIC */}
      {activeTab === 'clinic' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2 border-b border-[#ebd9c5] dark:border-[#38332c] pb-4">
            <h2 className="text-2xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
              Manuscript Story Clinic
            </h2>
            <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
              Paste a difficult scene or sentence to run a diagnostic across pacing, sensory immersion, and clarity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#fffef2] dark:bg-[#1a1715] border border-[#ebd9c5] dark:border-[#38332c] space-y-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Diagnostic Focus:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'clarity', label: 'Clarity & Subtext' },
                  { key: 'sensory', label: 'Sensory Depth & Atmosphere' },
                  { key: 'pacing', label: 'Cadence & Micro-Tension' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setClinicMode(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      clinicMode === opt.key
                        ? 'bg-[#d4a373] text-[#181614]'
                        : 'bg-[#f5f1e3] dark:bg-[#25221e] text-[#2a2724]/70 dark:text-[#f5f2e6]/70 border border-[#ebd9c5] dark:border-[#38332c]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6] mb-1">
                Manuscript Passage (Max 500 words):
              </label>
              <textarea
                rows={5}
                value={clinicExcerpt}
                onChange={e => setClinicExcerpt(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-transparent text-sm font-serif outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleRunStoryClinic}
              className="px-5 py-2.5 rounded-xl bg-[#2a2724] dark:bg-[#25221e] text-[#d4a373] font-bold text-xs border border-[#d4a373]/30 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sliders className="w-4 h-4 text-[#d4a373]" />
              <span>Run Craft Diagnostic</span>
            </button>
          </div>

          {/* Feedback Display */}
          {clinicFeedback && (
            <div className="p-6 rounded-2xl bg-[#fbf9ee] dark:bg-[#181614] border border-[#ebd9c5] dark:border-[#38332c] space-y-4 animate-in fade-in">
              <h3 className="font-serif font-bold text-base text-[#2a2724] dark:text-[#f5f2e6] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4a373]" />
                <span>Story Clinic Diagnostic Report</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-[#15803d] dark:text-[#4ade80]">Strengths:</div>
                <ul className="list-disc pl-5 space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
                  {clinicFeedback.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-[#ea580c]">Diagnostic Observations:</div>
                <ul className="list-disc pl-5 space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
                  {clinicFeedback.observations.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-[#d4a373]">Craft Recommendations:</div>
                <ul className="list-disc pl-5 space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
                  {clinicFeedback.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
