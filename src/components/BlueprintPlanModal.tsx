import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Compass, 
  Layers, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Map, 
  ShieldCheck, 
  Code2, 
  Download,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';
import { STORIZINE_BLUEPRINT_DOCS, STORIZINE_ASSETS } from '../data/storizineAssets';

interface BlueprintPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintPlanModal: React.FC<BlueprintPlanModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'unified'>('frontend');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentDoc = activeTab === 'frontend' 
    ? STORIZINE_BLUEPRINT_DOCS.stepByStepFrontendPlan 
    : STORIZINE_BLUEPRINT_DOCS.unifiedPlatformBlueprint;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentDoc.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#181614]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#fffef2] dark:bg-[#1f1d1a] w-full max-w-5xl rounded-3xl border border-[#ebd9c5] dark:border-[#38332c] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center justify-between bg-[#fbf9ee] dark:bg-[#25221e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d4a373]/20 border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373]">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold text-[#2a2724] dark:text-[#f5f2e6]">
                  Storizine & BookForest Blueprints
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d4a373] text-[#fffef2]">
                  v3.0 Active Plan
                </span>
              </div>
              <p className="text-xs text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
                Architectural guidelines, route catalogues, and non-duplicative implementation roadmap
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyPath}
              className="px-3 py-1.5 rounded-xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fffef2] dark:bg-[#1f1d1a] text-xs text-[#2a2724] dark:text-[#f5f2e6] hover:border-[#d4a373] flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Copy local markdown path"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[#d4a373]" />}
              <span>{copied ? 'Copied Path' : 'Copy File Path'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:bg-[#ebd9c5]/30 dark:hover:bg-[#38332c] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-[#ebd9c5] dark:border-[#38332c] flex items-center space-x-4 bg-[#fffef2] dark:bg-[#1f1d1a]">
          <button
            onClick={() => setActiveTab('frontend')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'frontend'
                ? 'border-[#d4a373] text-[#d4a373]'
                : 'border-transparent text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Step-by-Step Front-End Plan</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#d4a373]/20 text-[10px]">16 Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('unified')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'unified'
                ? 'border-[#d4a373] text-[#d4a373]'
                : 'border-transparent text-[#2a2724]/60 dark:text-[#f5f2e6]/60 hover:text-[#2a2724] dark:hover:text-[#f5f2e6]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Unified Platform Blueprint</span>
            <span className="px-1.5 py-0.2 rounded-md bg-[#d4a373]/20 text-[10px]">51 Sites Synthesis</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2a2724] dark:text-[#f5f2e6]">
          
          {/* Top Document Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#d4a373]/10 to-transparent border border-[#d4a373]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#2a2724] dark:text-[#f5f2e6]">
                {currentDoc.title}
              </h3>
              <p className="text-xs text-[#2a2724]/80 dark:text-[#f5f2e6]/80 max-w-2xl">
                {currentDoc.summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-[#d4a373]">
                <span>Version {currentDoc.version}</span>
                <span>•</span>
                <span>Date: {currentDoc.date}</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60 bg-[#ebd9c5]/30 dark:bg-[#38332c] px-2 py-0.5 rounded">
                  {currentDoc.path}
                </span>
              </div>
            </div>
            
            <a
              href={currentDoc.path}
              download
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-[#d4a373] hover:bg-[#c39262] text-[#fffef2] text-xs font-bold shrink-0 flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          </div>

          {activeTab === 'frontend' ? (
            /* Front-End Step-by-Step Plan Outline */
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Section A: Read */}
                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <div className="flex items-center space-x-2 text-[#d4a373] font-bold text-sm">
                    <BookOpen className="w-4 h-4" />
                    <h4>Section A — Read: BookForest</h4>
                  </div>
                  <ul className="space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 list-disc list-inside">
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A1 — Library</strong> (/read/library)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A2 — Discover</strong> (/read/discover)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A3 — Book Detail</strong> (/read/book/:bookId)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A4 — Reader</strong> (/read/reader/:libraryItemId)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A5 — Reading Lists & Lending</strong> (/read/lists)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A6 — Reading Journal</strong> (/read/reading-journal)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page A7 — Reading Insights</strong> (/read/insights)</li>
                  </ul>
                </div>

                {/* Section B: Create */}
                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <div className="flex items-center space-x-2 text-[#d4a373] font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <h4>Section B — Create: Writing Studio</h4>
                  </div>
                  <ul className="space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 list-disc list-inside">
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B1 — Projects Shelf</strong> (/write/projects)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B2 — New Project Flow</strong> (/write/projects/new)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B3 — Project Overview</strong> (/write/projects/:id)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B4 — Story Composer</strong> (/write/projects/:id/compose)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B5 — Writing Editor</strong> (/write/projects/:id/editor)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B6 — Version History</strong> (/write/projects/:id/versions)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page B7–B10 — Prompts & Sessions</strong></li>
                  </ul>
                </div>

                {/* Section C: Learn */}
                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <div className="flex items-center space-x-2 text-[#d4a373] font-bold text-sm">
                    <Layers className="w-4 h-4" />
                    <h4>Section C — Learn: Writing Academy</h4>
                  </div>
                  <ul className="space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 list-disc list-inside">
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C1 — Learning Catalog</strong> (/learn/catalog)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C2 — Learning Paths</strong> (/learn/paths)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C3 — Lesson Detail</strong> (/learn/lesson/:id)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C4 — Practice Exercises</strong> (/learn/exercises)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C5 — Workbooks</strong> (/learn/workbooks)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page C6 — Story Clinic</strong> (/learn/story-clinic)</li>
                  </ul>
                </div>

                {/* Section D: Magazine */}
                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <div className="flex items-center space-x-2 text-[#d4a373] font-bold text-sm">
                    <FileText className="w-4 h-4" />
                    <h4>Section D — Magazine: Literary Desk</h4>
                  </div>
                  <ul className="space-y-1 text-[#2a2724]/80 dark:text-[#f5f2e6]/80 list-disc list-inside">
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D1 — Magazine Home</strong> (/magazine/latest)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D2 — Category Pages</strong> (Fiction, Poetry, Essays)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D3 — Story Detail</strong> (/magazine/story/:slug)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D4 — Series Pages</strong> (/magazine/series/:slug)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D5 — Author Page</strong> (/magazine/authors/:slug)</li>
                    <li><strong className="text-[#2a2724] dark:text-[#f5f2e6]">Page D6 — Contributor Submit</strong> (/magazine/submit)</li>
                  </ul>
                </div>

              </div>

              {/* Recommended First Slice */}
              <div className="p-5 rounded-2xl bg-[#ebd9c5]/20 dark:bg-[#2a2724]/60 border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                  Five Vertical Slices Implemented First
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#d4a373]">1. /app</span> — Home Dashboard
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#d4a373]">2. /read/library</span> — Library & Book Detail
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#d4a373]">3. /write/projects</span> — Project Overview
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#d4a373]">4. /write/compose</span> — Story Composer
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5]/60 dark:border-[#38332c]">
                    <span className="font-bold text-[#d4a373]">5. /magazine/story</span> — Save to BookForest
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Unified Platform Blueprint Outline */
            <div className="space-y-6 text-xs leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#d4a373]">1. Read — BookForest</h4>
                  <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                    Personal and virtual library, canonical book/edition records, EPUB/PDF reader, highlights, reading journal, lending tracker, and StoryGraph reading insights.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#d4a373]">2. Create — Writing Studio</h4>
                  <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                    One reliable place for ideas, Story Composer / Story Bible, character arcs, worldbuilding, distraction-free editor, Fountain screenplay mode, and version diffs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#221f1c] space-y-2">
                  <h4 className="font-serif font-bold text-sm text-[#d4a373]">3. Learn — Academy</h4>
                  <p className="text-[#2a2724]/70 dark:text-[#f5f2e6]/70">
                    Craft knowledge base, structured learning paths, Prompt Studio, practice exercises, Story Clinic manuscript diagnostics, and project-connected reflections.
                  </p>
                </div>
              </div>

              {/* Core Principles */}
              <div className="p-5 rounded-2xl bg-[#fffef2] dark:bg-[#1f1d1a] border border-[#ebd9c5] dark:border-[#38332c] space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
                  Key Architectural Principles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#2a2724]/80 dark:text-[#f5f2e6]/80">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                    <span><strong>One capability, one home:</strong> Prevent duplicating tools across features.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                    <span><strong>Private by default:</strong> Drafts, journals, and annotations never leak into public search.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                    <span><strong>Canonical records:</strong> Books, authors, and projects share IDs across modules.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#d4a373] shrink-0 mt-0.5" />
                    <span><strong>Bilingual by design:</strong> First-class English & Bengali typography and search.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Assets Registry Section */}
          <div className="pt-4 border-t border-[#ebd9c5] dark:border-[#38332c] space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#2a2724] dark:text-[#f5f2e6]">
              Associated High-Fidelity Visual Assets (Saved in /public/assets/aistudio)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(STORIZINE_ASSETS).slice(0, 4).map((asset) => (
                <div key={asset.id} className="rounded-xl overflow-hidden border border-[#ebd9c5] dark:border-[#38332c] bg-[#181614] group relative">
                  <img src={asset.path} alt={asset.title} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                  <div className="p-2 text-[10px] bg-[#fffef2] dark:bg-[#1f1d1a]">
                    <p className="font-bold truncate text-[#2a2724] dark:text-[#f5f2e6]">{asset.title}</p>
                    <p className="text-[9px] text-[#d4a373] truncate">{asset.subtitle || asset.aspectRatio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#ebd9c5] dark:border-[#38332c] bg-[#fbf9ee] dark:bg-[#25221e] flex items-center justify-between">
          <span className="text-[11px] text-[#2a2724]/60 dark:text-[#f5f2e6]/60">
            Saved in local project at <code className="bg-[#ebd9c5]/40 dark:bg-[#38332c] px-1.5 py-0.5 rounded text-[#d4a373]">public/assets/aistudio/</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2a2724] hover:bg-[#3d3834] text-[#fffef2] text-xs font-bold transition-all cursor-pointer"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
