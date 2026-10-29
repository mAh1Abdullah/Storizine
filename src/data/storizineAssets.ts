/**
 * Storizine & BookForest Unified Assets & Blueprints Manifest
 * 
 * Central registry mapping all official illustration artwork, banners,
 * thematic category cards, and strategic architectural documentation
 * for the Storizine & BookForest platform.
 */

export interface StorizineVisualAsset {
  id: string;
  title: string;
  subtitle?: string;
  path: string;
  aspectRatio: '16:9' | '1:1' | 'banner';
  description: string;
  suggestedUsage: 'hero' | 'category' | 'author' | 'reader' | 'background';
}

export interface StorizineBlueprintDoc {
  id: string;
  title: string;
  version: string;
  date: string;
  path: string;
  summary: string;
  topics: string[];
}

export const STORIZINE_ASSETS = {
  // Main Hero Landscape Banner (16:9)
  heroFloatingWorlds: {
    id: 'hero-floating-worlds',
    title: 'Storizine: Books for Bigger Worlds',
    subtitle: 'by mAh Abdullah',
    path: '/assets/aistudio/Storizine__Floating_Worlds_Ahead_f5b659be.png',
    aspectRatio: '16:9',
    description: 'Panoramic fantasy vista featuring floating castle islands, waterfalls, and a wandering writer gazing into limitless horizons.',
    suggestedUsage: 'hero',
  } as StorizineVisualAsset,

  // Triptych Multi-Category Showcase Banner
  goldenFantasyWorld: {
    id: 'golden-fantasy-world',
    title: 'A Golden Fantasy World of Stories',
    subtitle: 'Story Lists • Short Stories • Guidebooks',
    path: '/assets/aistudio/A_Golden_Fantasy_World_of_Stories_4d20d286.png',
    aspectRatio: 'banner',
    description: 'Triptych showcase linking the three pillar story domains with celestial emblems.',
    suggestedUsage: 'category',
  } as StorizineVisualAsset,

  // Category Card: Guidebooks (1:1)
  guidebooksVista: {
    id: 'guidebooks-vista',
    title: 'Guidebooks',
    subtitle: 'Explore Places, Discover New Perspectives',
    path: '/assets/aistudio/Epic_Fantasy_Guidebook_Vista_9ace3353.png',
    aspectRatio: '1:1',
    description: 'Antique leatherbound grimoire and golden navigation compass on a cliff edge overlooking floating castles.',
    suggestedUsage: 'category',
  } as StorizineVisualAsset,

  // Category Card: Short Stories (1:1)
  shortStoriesCard: {
    id: 'short-stories-card',
    title: 'Short Stories',
    subtitle: 'Small Stories, Big Worlds',
    path: '/assets/aistudio/Short_Stories__Small_Stories__Big_Worlds_1b73abf2.png',
    aspectRatio: '1:1',
    description: 'Enchanted glowing quill writing on parchment with illuminated lantern beside books.',
    suggestedUsage: 'category',
  } as StorizineVisualAsset,

  // Category Card: Story Lists (1:1)
  storyListsCard: {
    id: 'story-lists-card',
    title: 'Story Lists',
    subtitle: 'An Organized Collection of Narratives & Books',
    path: '/assets/aistudio/Enchanted_Story_Lists_in_the_Sky_033ba96a.png',
    aspectRatio: '1:1',
    description: 'Ethereal open tome with quill insignia amidst airborne citadels and floral peaks.',
    suggestedUsage: 'category',
  } as StorizineVisualAsset,

  // Author Bio Artwork (1:1)
  authorBioLandscape: {
    id: 'author-bio-landscape',
    title: 'Author Bio',
    subtitle: 'mAh Abdullah — Fantasy, Sci-Fi & Adventure Novelist',
    path: '/assets/aistudio/Dreamy_Fantasy_Author_Bio_Landscape_df6b090c.png',
    aspectRatio: '1:1',
    description: 'The author with notebook in hand contemplating ancient towers and floating sky islands.',
    suggestedUsage: 'author',
  } as StorizineVisualAsset,

  // Magazine & Literary Desk: Cathedral Library of Stories (1:1)
  magicalLibrary: {
    id: 'magical-library',
    title: 'Storizine: A Magical Library of Stories',
    subtitle: 'A Magazine of Stories',
    path: '/assets/aistudio/Storizine__A_Magical_Library_of_Stories_6747f299.png',
    aspectRatio: '1:1',
    description: 'Grand sunlit library hall of endless books, ivy-draped arches, and high Gothic stained glass.',
    suggestedUsage: 'reader',
  } as StorizineVisualAsset,

  // Magazine Vista: Daylight Fantasy (1:1)
  magicalFantasyVista: {
    id: 'magical-fantasy-vista',
    title: 'Storizine: A Magical Fantasy Vista',
    subtitle: 'A Magazine of Stories',
    path: '/assets/aistudio/Storizine__A_Magical_Fantasy_Vista_6fc4625c.png',
    aspectRatio: '1:1',
    description: 'Daylight panorama of mountains and enchanted books under azure skies.',
    suggestedUsage: 'reader',
  } as StorizineVisualAsset,
};

export const STORIZINE_BLUEPRINT_DOCS = {
  stepByStepFrontendPlan: {
    id: 'frontend-step-by-step-plan',
    title: 'Storizine & BookForest — Step-by-Step Front-End Development Plan',
    version: '3.0',
    date: '29 October 2026',
    path: '/assets/aistudio/storizine_bookforest_frontend_step_by_step_plan_28ef9361.md',
    summary: 'Concrete front-end delivery roadmap breaking the platform into distinct navigable pages/routes under a shared shell, with 5 core vertical slices.',
    topics: [
      'Shared App Shell & Routing Map',
      'Read (BookForest Pages A1–A7)',
      'Create (Writing Studio Pages B1–B10)',
      'Learn (Writing Academy Pages C1–C6)',
      'Magazine (Literary Desk Pages D1–D6)',
      'Publish (Publishing Center Pages E1–E9)',
      'My Space (Profile & Goals Pages F1–F8)',
      'Testing & Accessibility Checklist',
    ],
  } as StorizineBlueprintDoc,

  unifiedPlatformBlueprint: {
    id: 'unified-platform-blueprint',
    title: 'Storizine & BookForest — Unified Platform Blueprint',
    version: '3.0',
    date: '29 October 2026',
    path: '/assets/aistudio/storizine_bookforest_unified_platform_blueprint_f7d62563.md',
    summary: 'Comprehensive architectural consolidation synthesizing 51 reference platforms into a coherent, non-duplicative, 5-pillar ecosystem.',
    topics: [
      'Read (BookForest Library, Reader, Annotations)',
      'Create (Writing Studio & Story Composer)',
      'Learn (Writing Academy & Craft Clinic)',
      'Publish (Literary Desk & Submission Tracker)',
      'Connect & Grow (Author Development & Circles)',
      'Canonical Data Model & Privacy-by-Default',
      'AI Service Boundary & Safety Rules',
      'Phase 0–5 Phased Implementation Roadmap',
    ],
  } as StorizineBlueprintDoc,
};

/**
 * Category-to-artwork mapping helper for dynamic showcases
 */
export const CATEGORY_ARTWORK_MAP: Record<string, StorizineVisualAsset> = {
  'Short Stories': STORIZINE_ASSETS.shortStoriesCard,
  'Guides & Features': STORIZINE_ASSETS.guidebooksVista,
  'Novels & Series': STORIZINE_ASSETS.storyListsCard,
  'Sci-Fi & Cyberpunk': STORIZINE_ASSETS.heroFloatingWorlds,
  'Articles & Essays': STORIZINE_ASSETS.magicalLibrary,
  'Stories': STORIZINE_ASSETS.magicalFantasyVista,
};
