import { AcademyLesson, AcademyLearningPath, AcademyExercise } from '../types';

export const INITIAL_ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'lesson-1',
    title: 'Architecting Astral Geographies: Non-Euclidean Fantasy Settings',
    category: 'Worldbuilding',
    level: 'Intermediate',
    estimatedMinutes: 20,
    author: 'Storizine Craft Desk',
    summary: 'How to build floating archipelagos, inverted mountains, and starlight rivers without losing emotional groundedness or narrative clarity.',
    content: `### The Principle of Grounded Wonder

When drafting speculative geographies—whether sky-realms, submerged civilizations, or pocket dimensions—the danger is rarely a lack of imagination. The real hazard is **aesthetic drift**, where infinite possibility robs the reader of gravity and stakes.

To ground extraordinary landscapes:
1. **Tie Geography to Labor and Subsistence:** Who mines the sky-bridges? How is fresh water harvested from cloud condensates?
2. **Limit Magic with Physical Tolls:** If islands float on song-frequencies, what happens to the vocal cords of the chanters over generations?
3. **Use Intimate Sensory Anchor Points:** Rather than describing three mountain ranges at once, focus on the scent of ozone dampening wool cloaks or the grit of pulverized basalt beneath boots.

> *"The grandest floating citadel is meaningless until a street baker drops a hot loaf of bread and we watch which way it falls."*`,
    exercisesCount: 3,
    completed: true,
  },
  {
    id: 'lesson-2',
    title: 'The Resonance of Syntax: Rhythm and Cadence in Speculative Prose',
    category: 'Voice & Style',
    level: 'Masterclass',
    estimatedMinutes: 18,
    author: 'Literary Desk Fellow',
    summary: 'Mastering sentence variety, parataxis, and lyric pauses to evoke mythological reverence and visceral dread.',
    content: `### Prose as Musical Score

Syntax is the invisible choreography of narrative emotion. A reader does not just absorb facts; they breathe with your punctuation.

- **Short, staccato clauses** heighten danger, sensory overload, and tactical immediacy:
  *The latch clicked. He froze. The wind stopped.*
- **Extended, hypotactic cadences** lull the reader into philosophical contemplation or grandeur:
  *Beneath the vaults of the ancient observatory, where centuries of tallow smoke had darkened the astrological glyphs into shadows of shadows, the old cartographer worked with fingers stiffened by the autumn draft.*

Pay attention to phonetic texture: guttural stops (*k, t, p*) for conflict; fricatives and sibilants (*s, f, sh*) for atmospheric isolation.`,
    exercisesCount: 2,
    completed: false,
  },
  {
    id: 'lesson-3',
    title: 'The Dual-Track Narrative: Intertwining Myth and Modernity',
    category: 'Craft & Structure',
    level: 'Intermediate',
    estimatedMinutes: 25,
    author: 'Bengali Speculative Collective',
    summary: 'Techniques for alternating between contemporary personal trauma and ancient celestial mythology to create resonance.',
    content: `### Parallel Thematic Bridges

When juxtaposing two timelines—such as an archivist in modern Old Dhaka and a celestial warrior from Vedic cosmic lore—the transition must not feel like two unacquainted books forced under one spine.

The secret lies in **echo objects and shared dilemmas**:
- If the mythic hero is wrestling with the burden of prophecy, give the contemporary protagonist a medical diagnosis or family will that they refuse to sign.
- When an object appears in chapter 1 (a brass water vessel), let its mythic ancestor appear in chapter 2 with its origin story.`,
    exercisesCount: 4,
    completed: false,
  },
  {
    id: 'lesson-4',
    title: 'Querying Literary Agents Without Losing Your Soul',
    category: 'Publishing Strategy',
    level: 'Beginner',
    estimatedMinutes: 15,
    author: 'Storizine Editorial Board',
    summary: 'Demystifying the query letter: crafting hooks, choosing comps, and distinguishing genuine agencies from predatory vanity presses.',
    content: `### The Anatomy of an Irresistible Query

A query letter is not an academic synopsis; it is a film trailer in prose.

1. **The Personalization & Metadata (1 Paragraph):** Mention why you targeted this agent, project word count, genre, and comps.
2. **The Hook (1 Sentence):** Who is your protagonist, what is their status quo, and what catalyst explodes it?
3. **The Core Dilemma (1-2 Paragraphs):** What does the character want, what stands in their way, and what catastrophic consequence looms if they fail?
4. **Bio & Credentials (1 Paragraph):** Writing credentials, relevant life experience, and publication history.`,
    exercisesCount: 2,
    completed: false,
  },
];

export const INITIAL_ACADEMY_PATHS: AcademyLearningPath[] = [
  {
    id: 'path-1',
    title: 'The Speculative Novelist Apprenticeship',
    level: 'Complete Curriculum (12 Modules)',
    totalLessons: 12,
    completedLessons: 4,
    description: 'From central premise and non-derivative worldbuilding to act-two momentum and literary agency query preparation.',
    modules: [
      'Foundational Premise & Core Stance',
      'Geographies of Wonder & Systemic Rules',
      'Character Paradoxes & Sacred Wounds',
      'Scene Engineering & Micro-Tension',
      'Revision Strategies & Substantive Trimming',
    ],
  },
  {
    id: 'path-2',
    title: 'Voice, Style, and Lyrical World-Telling',
    level: 'Intensive Masterclass (6 Modules)',
    totalLessons: 6,
    completedLessons: 2,
    description: 'Elevate genre fiction into timeless literary art through syntax choreography, defamiliarization, and sensual specificity.',
    modules: [
      'The Defamiliarized Image',
      'Cadence, Breath & Punctuation',
      'Polyphonic Dialogue & Vernacular Dignity',
      'Subtext: What Stays Unspoken',
    ],
  },
];

export const INITIAL_ACADEMY_EXERCISES: AcademyExercise[] = [
  {
    id: 'ex-1',
    title: 'Sensory Subversion Exercise',
    lessonId: 'lesson-1',
    prompt: 'Describe a battle scene or impending crisis using ONLY smell, temperature, and touch—do not use sight or sound.',
    guidance: 'Avoid generic visual terms like "the blade glinted". Focus on the sharp tang of copper on the tongue, cold rain penetrating collar seams, or gravel shifting under bootheels.',
    sampleExemplar: 'The air grew dense with vinegar and wet wool. Iron grease coated his teeth as heat rushed along the leather reins...',
  },
  {
    id: 'ex-2',
    title: 'The 3-Sentence High Stakes Hook',
    lessonId: 'lesson-4',
    prompt: 'Condense your novel or short story premise into 3 sentences: 1) The Status Quo & Sacred Rule, 2) The Irreversible Fracture, 3) The Terrible Choice.',
    guidance: 'Ensure the choice is between two painful sacrifices, not between good and bad. True drama is sacrifice vs sacrifice.',
    sampleExemplar: 'In the cloud-mines of Saptarshi, miners surrender one memory of home for every ounce of starlight they extract. When apprentice Arion unearths a forbidden memory of his own sister, he must choose whether to sell it to buy her medicine or burn the mine to the ground.',
  },
];
