# Storizine & BookForest — Step-by-Step Front-End Development Plan
**Version:** 3.0  
**Date:** 29 October 2026  
**Purpose:** Turn the Unified Platform Blueprint into a practical front-end plan where every major section opens as its own page/window, with shared navigation and connected workflows.

---

## 1. Goal and interpretation

Build Storizine & BookForest as one web application with **separate navigable pages for each major section**, rather than one giant screen or a collection of disconnected applications.

In this plan, “new window” means a distinct app page/route inside the main application by default. Use normal same-tab navigation for core product sections. Open a true browser tab/window only when the user explicitly chooses an external link, a separate reading/presentation view, or another action where a separate window is genuinely useful. Do not force every navigation click to open a new browser tab; that harms accessibility and creates clutter.

Each page should:
- Have a unique URL and page title.
- Keep the shared app shell (header, navigation, account controls, responsive layout).
- Be refreshable and directly linkable.
- Preserve user state where appropriate.
- Reuse common components and canonical records.
- Provide a clear route back to its parent section.
- Respect permissions and private-by-default behavior.

This is a front-end plan, not a claim that every feature is already implemented. UI must not imply that a backend operation succeeded until the API confirms it.

---

## 2. Product navigation and window/route map

### 2.1 Primary navigation

Use these top-level routes in the persistent sidebar on desktop and a compact navigation/drawer on mobile:

| Main section | Suggested route | Primary purpose |
|---|---|---|
| Home | `/app` | Personalized overview and next actions |
| Read / BookForest | `/read` | Library, reader, reading lists, journal |
| Write / Writing Studio | `/write` | Projects, Story Composer, editor |
| Learn / Writing Academy | `/learn` | Lessons, prompts, workbooks, practice |
| Magazine / Literary Desk | `/magazine` | Stories, essays, reviews, interviews |
| Publish | `/publish` | Opportunities, query tools, submissions, rights education |
| My Space | `/me` | Profile, goals, private journal, saved items, settings |

### 2.2 Page route catalogue

Routes can be adjusted to match the existing React Router setup. Keep names consistent and avoid duplicate pages for the same capability.

```text
/app
  /app/onboarding
  /app/notifications

/read
  /read/library
  /read/discover
  /read/lists
  /read/reading-journal
  /read/insights
  /read/book/:bookId
  /read/reader/:libraryItemId

/write
  /write/projects
  /write/projects/new
  /write/projects/:projectId
  /write/projects/:projectId/compose
  /write/projects/:projectId/editor
  /write/projects/:projectId/versions
  /write/projects/:projectId/research
  /write/prompts
  /write/sessions
  /write/templates
  /write/screenplay/:projectId                 [later]

/learn
  /learn/catalog
  /learn/paths
  /learn/lesson/:lessonId
  /learn/exercises
  /learn/workbooks
  /learn/story-clinic

/magazine
  /magazine/latest
  /magazine/fiction
  /magazine/poetry
  /magazine/essays
  /magazine/reviews
  /magazine/interviews
  /magazine/series/:seriesSlug
  /magazine/story/:slug
  /magazine/authors/:authorSlug
  /magazine/submit

/publish
  /publish/dashboard
  /publish/opportunities
  /publish/opportunities/:opportunityId
  /publish/agents                              [later]
  /publish/query-studio
  /publish/proposal-studio                     [later]
  /publish/submissions
  /publish/readiness
  /publish/routes
  /publish/rights
  /publish/safety

/me
  /me/profile
  /me/portfolio
  /me/goals
  /me/journal
  /me/saved
  /me/settings
  /me/privacy
  /me/data-export
```

### 2.3 Shared page behaviors

Every route should support:
- Loading, empty, error, permission-denied, and success states.
- Responsive layout at desktop, tablet, and mobile widths.
- Breadcrumbs on deep pages.
- Keyboard focus and visible focus states.
- Page title and useful metadata.
- Confirmation before destructive actions.
- Unsaved-changes warning for editing pages.
- Deep links to books, articles, projects, opportunities, and submissions.
- A consistent back-navigation strategy.
- Skeleton/loading placeholders that do not jump the page layout.
- A clear distinction between draft, saved, submitted, published, and failed states.

---

## 3. Shared front-end shell

Build the shared shell before building individual sections.

### 3.1 App shell components

1. **`AppLayout`** — responsive frame for authenticated pages.
2. **`PrimarySidebar`** — main sections and active-route indicator.
3. **`TopBar`** — global search, create shortcut, notifications, account menu.
4. **`MobileNavigation`** — compact drawer or bottom navigation.
5. **`PageHeader`** — title, subtitle, breadcrumbs, main action.
6. **`CommandMenu`** — optional keyboard-friendly quick navigation and create actions.
7. **`GlobalSearch`** — searches books, articles, authors, projects, lessons, and opportunities according to permissions.
8. **`NotificationCenter`** — reminders and status updates, subject to user preferences.
9. **`ConfirmDialog`** — destructive actions and irreversible workflow steps.
10. **`Toast/InlineFeedback`** — success, error, and save-state feedback.
11. **`EmptyState`** — helpful next action, not a dead end.
12. **`PermissionGate`** — hides or disables actions based on actual permissions, while the server remains the authority.
13. **`ErrorBoundary`** — catches page-level UI failures and offers retry/navigation.
14. **`LoadingState`** — consistent loading and skeleton patterns.

### 3.2 Shared visual system

Create design tokens rather than hardcoding styles per page:
- Color tokens for primary, secondary, accent, surface, border, text, muted, success, warning, and danger.
- Typography scale supporting English and Bengali fonts.
- Spacing, radius, shadow, breakpoint, and content-width tokens.
- Reusable cards, tables, tabs, filters, badges, dialogs, drawers, forms, pagination, and menus.
- Theme preference if required, without allowing theme differences to reduce contrast.
- Accessible contrast and semantic status colors.

The visual system should feel literary and calm but remain functional. Do not make every page a decorative dashboard; text-heavy pages need readable line length, strong hierarchy, and generous whitespace.

### 3.3 Front-end technical foundations

- Use React Router for nested routes and layouts.
- Use TypeScript types for route params, API responses, forms, and shared entities.
- Use a consistent server-state approach (for example, the project's existing data-fetching pattern or a query/cache library already adopted by the codebase).
- Keep local UI state separate from server-owned data.
- Use URL query parameters for shareable filters, sorting, tabs, and pagination where sensible.
- Keep drafts in local recovery storage only as a supplement, never as the sole durable store.
- Add route-level lazy loading for large sections such as the EPUB/PDF reader and editor.
- Build a small API client with typed methods, error normalization, auth handling, and cancellation where relevant.
- Do not call the AI provider directly from browser components; use the server-side AI service.
- Avoid global state for data that belongs to one page. Use shared state only for genuinely global concerns.

---

## 4. Step-by-step implementation sequence

### Step 0 — Audit the existing front end

**Goal:** Avoid rebuilding what already works.

Tasks:
1. List all existing routes, screens, layouts, components, and design tokens.
2. Map each current screen to the route catalogue in this document.
3. Label every feature `working`, `partial`, `broken`, `missing`, or `duplicate`.
4. Inspect mobile behavior and keyboard navigation.
5. Identify existing reader/editor components that can be reused.
6. Record API dependencies for each page and whether the endpoint is reliable.
7. Identify pages that currently use hardcoded/mock data.
8. Create a screen inventory and route matrix.

**Deliverable:** `frontend-current-state.md` and a feature gap table.

**Done when:** Each blueprint feature has a known current status and an identified owner/route.

### Step 1 — Establish the app shell and routing

Build:
- `AppLayout`
- Main sidebar and mobile navigation
- Top bar and account menu
- Page header and breadcrumbs
- Route-level loading/error/not-found pages
- Protected routes and permission-aware UI
- Global design tokens and shared component primitives

Create all top-level routes with placeholder pages before filling them in. This proves the navigation architecture early.

**Done when:** Users can navigate between all main sections, refresh a deep route, use browser back/forward, and see the correct active navigation state.

### Step 2 — Authentication, onboarding, and user setup screens

Pages:
- `/login`, `/register`, `/forgot-password` if supported
- `/app/onboarding`
- `/me/profile`
- `/me/settings`
- `/me/privacy`

Front-end tasks:
- Form validation and clear error states.
- Language preference (English/Bangla) and accessibility settings.
- Optional initial intent selection: Read, Write, Learn, Publish, or Explore.
- Profile visibility controls.
- Explain privacy defaults before the user shares content.
- Show account loading/expired-session states.

**Important:** Front-end form validation improves usability but does not replace server-side validation or authorization.

**Done when:** New users can set preferences and understand their privacy controls without being forced to enable every module.

### Step 3 — Home dashboard

Route: `/app`

Components:
- Welcome/header area
- Continue reading
- Resume a writing project
- Next task or goal
- Saved articles/stories
- Recent notes/reflections
- Recommended lessons or prompts
- Submission reminders if the user has submissions
- Quick actions: Add book, New project, Find a prompt, Browse magazine

Rules:
- Personalize by user activity and preferences, not by assuming all users are authors.
- Hide empty modules or replace them with helpful onboarding actions.
- Let users dismiss or customize dashboard widgets later.
- Do not show sensitive journal text or private draft excerpts in shared/public contexts.

**Done when:** The home screen is useful to a reader, writer, contributor, or author without showing irrelevant empty cards.

---

## 5. Section A — Read: BookForest pages

### Page A1 — Library (`/read/library`)

Purpose: Browse the user's books.

UI:
- Grid/list toggle.
- Search, sort, and filters for status, format, language, genre, author, and shelf.
- Book cover, title, author, reading status, and progress.
- Add/import book action.
- Empty state with a clear add-book path.

Interactions:
- Selecting a book opens its detail page.
- “Continue reading” opens the correct reader location.
- Bulk actions only where safe and accessible.
- Filters persist in the URL where useful.

### Page A2 — Discover (`/read/discover`)

Purpose: Find books and curated collections.

UI:
- Search field.
- Featured collections, trending/curated shelves, genre/language filters.
- Recommendation explanation (“selected by editors”, “related to this book”, etc.).
- Add-to-library/save controls.

Interactions:
- Book detail opens `/read/book/:bookId`.
- Save to a list or library.
- Clearly label editorial recommendations, user popularity, and algorithmic recommendations separately.

### Page A3 — Book detail (`/read/book/:bookId`)

UI:
- Cover, title, author, edition/format, description, language, publisher/year when known.
- Reading status and progress.
- Start/continue reading, add to list, edit personal metadata.
- Related works and editorial content.

Interactions:
- Start reading opens `/read/reader/:libraryItemId`.
- Author links open author profile.
- “Read Like a Writer” can link to a project or lesson without forcing the user into it.

### Page A4 — Reader (`/read/reader/:libraryItemId`)

Purpose: Read EPUB/PDF and persist progress.

UI:
- Reading canvas with a quiet toolbar.
- Table of contents where supported.
- Font size, theme, margins, and reading layout controls.
- Progress indicator and bookmark action.
- Highlight/note tools.
- Reader settings panel.

Interactions:
- Autosave progress with visible save state.
- Annotation opens a side panel or focused dialog.
- Return to book detail/library without losing position.
- Handle unsupported/corrupt files and unavailable content gracefully.

Requirements:
- Lazy-load reader libraries.
- Keyboard and screen-reader support.
- Do not assume every PDF has text selection or reflow.
- Do not claim offline support unless cached files and state are actually available.

### Page A5 — Reading lists (`/read/lists`)

UI:
- User shelves and named lists.
- Create/edit list, reorder items, privacy settings.
- List cards with counts and descriptions.

Interactions:
- Add/remove a book from a list.
- Share a list only after explicit visibility selection.
- Preserve private lists from public search.

### Page A6 — Reading journal (`/read/reading-journal`)

UI:
- Chronological reflections and annotations.
- Filters by book, date, tag, or project.
- Private-by-default note editor.
- Link note to a book, passage, topic, or writing project.

Interactions:
- “Use as writing inspiration” copies or links a selected note only after user confirmation.
- Editing a note must not alter the original passage or book record.
- Private content must not appear in global public search.

### Page A7 — Reading insights (`/read/insights`)

UI:
- Reading sessions, books finished, pages/time where reliably tracked, language/genre breakdowns.
- Date range selector and accessible charts.
- Personal goal progress.

Rules:
- Explain what each metric means and how it is collected.
- Do not infer reading comprehension from reading time.
- Avoid shame-based streaks and public leaderboards.

### Read section completion criteria

- Library and book detail use canonical records.
- Reading progress survives refresh and re-login.
- Annotations are private unless shared.
- Filters, loading states, and empty states work.
- Reading data can be exported or deleted according to account controls.

---

## 6. Section B — Create: Writing Studio pages

### Page B1 — Projects (`/write/projects`)

UI:
- Active, paused, completed, and archived project views.
- Search, type/status filters, sort.
- Project card with format, last edited, next task, goal.
- New project action.

Interactions:
- Create project through a short guided flow.
- Open `/write/projects/:projectId`.
- Archive rather than permanently delete by default.
- Show recovery and deletion options clearly.

### Page B2 — New project (`/write/projects/new`)

Fields:
- Title (can be provisional).
- Format: novel, short story, serial, poetry, article, screenplay, other.
- Language.
- Optional genre and short premise.
- Workflow preference: outline-first, discovery, or hybrid.
- Privacy setting (private by default).

After creation, open the project dashboard or Story Composer.

### Page B3 — Project overview (`/write/projects/:projectId`)

UI:
- Project title and status.
- Premise/summary.
- Linked characters, settings, scenes, documents, and research.
- Word/time goals and recent versions.
- Suggested next action, dismissible.
- Tabs or secondary navigation for Compose, Editor, Versions, Research.

This is the central project page; do not create separate competing dashboards for the same project.

### Page B4 — Story Composer (`/write/projects/:projectId/compose`)

Purpose: Plan and connect story elements.

Views:
- Premise and central question.
- Characters and arcs.
- Setting/worldbuilding.
- Plot beats and outline.
- Themes and relationships.
- Scenes/chapters.
- Story Bible summary.

Interaction rules:
- All sections link to the same project model.
- Allow users to skip, reorder, or leave fields blank.
- Offer starter templates without enforcing one plotting formula.
- Save changes and show save status.
- Link craft lessons contextually.
- AI suggestions appear as proposals and require explicit acceptance.

### Page B5 — Writing editor (`/write/projects/:projectId/editor`)

UI:
- Distraction-free writing area.
- Optional project outline/notes panel.
- Word count and session timer if enabled.
- Save state and version action.
- Search/replace and accessible editing controls.

Requirements:
- Autosave with recovery after failed requests.
- Handle concurrent tabs or version conflicts.
- Warn before navigation when unsaved changes remain.
- Keep content editing separate from AI suggestion review.
- Test large documents and mobile/tablet layouts.

### Page B6 — Version history (`/write/projects/:projectId/versions`)

UI:
- Timeline/list of versions.
- Date, version note, and source (manual save, autosave checkpoint, imported).
- Compare selected versions.
- Restore as a new version rather than silently overwriting history.

Interactions:
- Diff view should be readable and accessible.
- Preserve the original.
- Explain whether comparisons are word-level, character-level, or block-level.

### Page B7 — Research and notes (`/write/projects/:projectId/research`)

UI:
- Research links, source notes, observations, reference files, project notes.
- Tags and search.
- Citation/source fields where relevant.

Interactions:
- Link notes to scenes, characters, or chapters.
- Separate verified facts from creative speculation.
- Respect file permissions and source copyright.

### Page B8 — Prompt Studio (`/write/prompts`)

UI:
- Prompt categories by format, genre, theme, language, and difficulty.
- “Give me an idea” randomizer.
- Saved prompts and completed exercises.
- Optional timed session.

Interactions:
- “Start writing” creates or selects a project and opens the editor.
- Prompt content needs source/license metadata.
- Label AI-generated prompts if applicable.

### Page B9 — Writing sessions (`/write/sessions`)

UI:
- Start/stop session, chosen goal, session history, optional reflection.
- Flexible 5/10/20-minute presets plus custom duration.
- Weekly progress without guilt-based streak pressure.

### Page B10 — Templates (`/write/templates`)

UI:
- Character sheets, plot outline, scene planner, worldbuilding, revision checklist, screenplay starter.
- Preview, use template, duplicate/customize.
- Printable/exportable versions where supported.

### Writing section completion criteria

- Project creation and editing are reliable.
- Story Composer and editor share the same project data.
- Version history is preserved.
- Exports are tested.
- AI never overwrites user text without explicit action.

---

## 7. Section C — Learn: Writing Academy pages

### Page C1 — Learning catalog (`/learn/catalog`)

UI:
- Searchable lessons/articles with filters for topic, level, format, language, and reading time.
- Clear distinction between free, paid, editorial, and AI-assisted material.
- Related lessons and projects.

### Page C2 — Learning paths (`/learn/paths`)

UI:
- Beginner-to-advanced paths or goal-based curricula.
- Estimated effort, prerequisites, lessons, and practical outcome.
- Enroll/start, pause, resume, or leave path.

Avoid implying that a course is accredited unless it actually is.

### Page C3 — Lesson detail (`/learn/lesson/:lessonId`)

UI:
- Readable lesson body, examples, source links, estimated time.
- Related exercises and next/previous lessons.
- “Apply to a project” action.
- Bookmark and completion status.

Interactions:
- If applied to a project, create a linked task or open the relevant Story Composer field.
- Preserve the lesson page position when returning from an exercise.

### Page C4 — Exercises (`/learn/exercises`)

UI:
- Exercise catalog and interactive quiz/player.
- Immediate feedback and explanation.
- Retry and review history.

Requirements:
- Correct answers and scoring logic must be testable.
- Allow multiple valid answers where appropriate.
- Do not grade creative writing with false precision.

### Page C5 — Workbooks (`/learn/workbooks`)

UI:
- Interactive worksheets and printable templates.
- Save progress, resume later, export if available.
- Clear note about whether content is private or submitted for review.

### Page C6 — Story Clinic (`/learn/story-clinic`)

UI:
- Select a project/document and a specific concern.
- Choose feedback mode: first impression, clarity, scene structure, pacing, dialogue, character motivation, or general craft.
- Display feedback by anchored passage or issue.
- Strengths, questions, potential issues, and revision options.

Requirements:
- Ask before sending private text to AI.
- Distinguish AI assistance from human editorial services.
- Do not silently rewrite the manuscript.
- Provide “ignore”, “save note”, and “apply selected change” actions.

### Learning section completion criteria

- Lessons and exercises connect to real writing projects.
- Progress is saved without forcing a rigid path.
- Feedback is transparent and user-controlled.
- Rights and source information are retained for third-party examples.

---

## 8. Section D — Magazine: Literary Desk pages

### Page D1 — Magazine home/latest (`/magazine/latest`)

UI:
- Featured story or essay.
- Latest fiction, poetry, criticism, interviews, and reviews.
- Themed editorial series.
- Language filters and clear reading-time labels.
- Related books/authors.

Keep editorial curation distinct from paid promotion.

### Page D2 — Content category pages

Routes:
- `/magazine/fiction`
- `/magazine/poetry`
- `/magazine/essays`
- `/magazine/reviews`
- `/magazine/interviews`

Each category uses the same reusable listing component with category-specific metadata and filters. Do not implement five separate, duplicated page systems.

### Page D3 — Story/article detail (`/magazine/story/:slug`)

UI:
- Title, subtitle, byline, publication date, language, type, reading time.
- Article content with accessible typography.
- Author link, series link, related reading, save-to-BookForest action.
- Clear rights/attribution information where needed.
- Comments only if moderation and privacy systems are ready.

Interactions:
- Save article to a reading list.
- Add a private reflection.
- Follow an author only with explicit opt-in.
- Do not expose private notes in the article page.

### Page D4 — Series page (`/magazine/series/:seriesSlug`)

UI:
- Series overview, editor's note, ordered collection of articles/stories.
- Archive and publication schedule where relevant.
- Related themes and authors.

### Page D5 — Author page (`/magazine/authors/:authorSlug`)

UI:
- Public bio, selected work, published contributions, links, optional contact method.
- Only display information the author has chosen to publish.
- Distinguish verified credentials from self-authored biography.

### Page D6 — Contributor submission (`/magazine/submit`)

UI:
- Submission guidelines and rights terms.
- Supported formats and word limits.
- Upload/paste flow, genre/language fields, author bio, consent confirmation.
- Submission receipt and status page.

Requirements:
- Show the current terms before submission.
- Do not promise acceptance dates unless the editorial team commits to them.
- Submitted manuscripts are private to the author and authorized editors.
- Keep editorial decision records and permission to publish excerpts separate.

### Magazine section completion criteria

- Editors can publish and schedule content.
- Public pages show correct author, date, language, and rights metadata.
- Readers can save articles to BookForest.
- Contributor submissions remain private and track their actual status.

---

## 9. Section E — Publish: Publishing Center pages

### Page E1 — Publishing dashboard (`/publish/dashboard`)

UI:
- Current readiness checklist.
- Saved opportunities and upcoming deadlines.
- Recent submission statuses and follow-up reminders.
- Quick links to Query Studio, publishing route guide, rights education.

Hide panels with no relevant user data rather than displaying empty warnings.

### Page E2 — Opportunity directory (`/publish/opportunities`)

UI:
- Search/filter by type, genre, language, location/market, eligibility, fee, compensation, deadline, and status.
- Official source and last-verified date.
- Saved opportunities.
- Clear expired/closed/unconfirmed labels.

Operations:
- Listings require a source and verification process.
- Avoid presenting scraped or stale data as current.
- Sponsorship and paid listing status must be visible.

### Page E3 — Opportunity detail (`/publish/opportunities/:opportunityId`)

UI:
- Organizer and official link.
- Guidelines, eligible formats/genres/languages, dates, fees, compensation, rights terms where known.
- Last-verified date and correction/report action.
- Save and “track submission” actions.

### Page E4 — Query Studio (`/publish/query-studio`)

UI:
- Select linked project.
- Fields for title, genre, word count, hook, synopsis, comps, author bio.
- Version history and recipient-specific variants.
- Checklist and export.

Interactions:
- Preserve the original query.
- Link agent-specific versions to the recipient record.
- Show AI suggestions as optional comments, not automatic replacements.

### Page E5 — Submission tracker (`/publish/submissions`)

UI:
- Table/board/calendar views.
- Recipient, project, version sent, submission date, status, follow-up date, notes.
- Filters and export.

Statuses should be configurable but have a clear default set, e.g. preparing, ready, submitted, acknowledged, requested material, rejected, accepted, withdrawn, no response/closed. Do not equate “no response” with rejection unless the user records that outcome.

### Page E6 — Readiness (`/publish/readiness`)

UI:
- Checklist templates for manuscript, query, proposal, ebook, and launch.
- Progress by checklist.
- Tasks linked to the relevant project.

Avoid a single “publication readiness score” that implies certainty. Explain the checklist's purpose and limitations.

### Page E7 — Publishing routes (`/publish/routes`)

UI:
- Compare traditional, small/independent press, self-publishing, hybrid, and serial/online-first routes.
- Show trade-offs for control, costs, rights, timeline, distribution, and marketing responsibility.
- Link to detailed guides and relevant next steps.

### Page E8 — Rights (`/publish/rights`)

UI:
- Searchable glossary and plain-language guides.
- Contract checklist.
- Translation, audio, print, digital, and adaptation rights explainer.
- Source/date and professional-review labels.

Clearly state that the UI is educational, not legal advice.

### Page E9 — Author Safety Center (`/publish/safety`)

UI:
- Scam warning library.
- Suspicious-offer checklist.
- Evidence/documentation guide.
- How to report or correct a listing.
- Country-specific resources only where reviewed and reliable.

Never label a named person/company a scam based solely on an unverified user report.

### Publishing section completion criteria

- Users can save a verified opportunity and track a submission.
- Official requirements and dates are clearly shown.
- Stale information is labeled.
- Private submission history is not publicly visible.
- Legal and financial information includes appropriate caveats.

---

## 10. Section F — My Space: profile, goals, and privacy

### Page F1 — Profile (`/me/profile`)

UI:
- Name/display name, biography, language preferences, avatar if supported.
- Public/private profile preview.
- Clear save state and field validation.

### Page F2 — Portfolio (`/me/portfolio`)

UI:
- Published works, selected projects that the user has explicitly made public, external links, author bio.
- Preview public profile.
- Never expose drafts by default.

### Page F3 — Goals (`/me/goals`)

UI:
- Reading, writing, learning, and publishing goals.
- Flexible weekly targets and reminders.
- Edit, pause, or remove goals.
- Personal milestones.

Do not make a single score represent a user's overall worth or writing ability.

### Page F4 — Private journal (`/me/journal`)

UI:
- Personal reflection and writing-life notes.
- Filters and search.
- Export/delete controls.
- Explicit warning before changing visibility.

### Page F5 — Saved items (`/me/saved`)

UI:
- Saved books, articles, lessons, prompts, and opportunities.
- Unified search and type filters.
- Remove from saved list without deleting the original content.

### Page F6 — Settings (`/me/settings`)

UI:
- Language, accessibility, theme, notifications, reader preferences.
- Connected services where applicable.
- Account security and session controls if supported.

### Page F7 — Privacy (`/me/privacy`)

UI:
- Profile visibility.
- Draft and project sharing.
- Journal and annotation privacy.
- Reader-follow and newsletter preferences.
- AI data-use choices and plain-language explanation.
- Blocked users and moderation controls if community exists.

### Page F8 — Data export (`/me/data-export`)

UI:
- Request export and display processing state.
- Explain included data and file format.
- Delete-account flow with confirmation and clear consequences.

### My Space completion criteria

- Users can see and control what is public.
- Private notes/drafts remain private in UI and API.
- Settings persist and are reflected across sections.
- Export/delete controls are functional, not decorative.

---

## 11. Cross-feature interaction rules

### 11.1 Use canonical records

- A book saved from a magazine article should link to the same Book record used in BookForest.
- A writing project linked to a lesson should not be duplicated.
- A submission should reference a project and a specific exported/versioned document.
- An author profile should be reused across magazine contributions and the public portfolio.
- A published article and a private draft must be distinct records or states with explicit access rules.

### 11.2 Use a consistent action pattern

Actions should be named consistently:
- **Open** — view details.
- **Continue** — resume a reader/project.
- **Save** — add to a user's private collection.
- **Link to project** — establish a relationship, do not duplicate content.
- **Share/Publish** — explicit visibility transition with confirmation.
- **Submit** — send a snapshot to a recipient or editor.
- **Export** — generate a downloadable copy.
- **Archive** — hide from active views without destroying history.
- **Delete** — destructive action requiring confirmation.

### 11.3 State feedback

For any server action:
1. Show a pending state.
2. Disable duplicate submissions where appropriate.
3. Confirm success only after the server confirms it.
4. On failure, preserve user input and offer retry.
5. Make retry safe for operations that may have succeeded despite a network interruption.

### 11.4 Search behavior

Global search results should be grouped by type:
- Books and editions
- Magazine content
- Authors
- Lessons and prompts
- Public opportunities
- The user's own projects and notes (only visible to that user)

Never expose private notes or drafts through public search suggestions, indexing, or result counts.

---

## 12. Component architecture

Suggested front-end organization (adapt to the current repo; do not blindly reorganize working code):

```text
src/
  app/
    App.tsx
    router.tsx
    layouts/
      AppLayout.tsx
      PublicLayout.tsx
    navigation/
      PrimarySidebar.tsx
      MobileNavigation.tsx
      TopBar.tsx
    providers/
    error/
  components/
    ui/
    forms/
    feedback/
    data-display/
    privacy/
    search/
  features/
    home/
    auth/
    bookforest/
      library/
      discover/
      book-detail/
      reader/
      lists/
      journal/
      insights/
    writing/
      projects/
      story-composer/
      editor/
      versions/
      research/
      prompts/
      sessions/
      templates/
    learning/
      catalog/
      paths/
      lessons/
      exercises/
      workbooks/
      story-clinic/
    magazine/
      listings/
      article-detail/
      series/
      authors/
      submissions/
    publishing/
      dashboard/
      opportunities/
      query-studio/
      submissions/
      readiness/
      routes/
      rights/
      safety/
    my-space/
      profile/
      portfolio/
      goals/
      journal/
      saved/
      settings/
      privacy/
  services/
    api/
    auth/
    analytics/
    ai/
  hooks/
  types/
  utils/
  styles/
```

Use feature folders for code ownership, but keep truly shared UI components in `components/ui`. Avoid circular imports between features; shared entity types should live in a neutral domain/types layer.

---

## 13. Front-end delivery phases

### Phase 0 — Audit and prototype
- Create route and screen inventory.
- Identify existing reusable components.
- Build clickable low-fidelity flows for Home, BookForest Library, Project Dashboard, Story Composer, and Magazine Article.
- Validate labels, navigation, and user journeys before polishing.
- Agree on design tokens and bilingual typography.

**Exit:** approved screen map, route map, and current-state gap matrix.

### Phase 1 — Shared shell and foundation
- App layout, navigation, route guards, page states.
- Design tokens and reusable UI primitives.
- Typed API client and normalized error handling.
- Authentication, settings, privacy, onboarding screens.
- Responsive and accessibility baseline.

**Exit:** every major section opens at its own URL; deep links and browser navigation work.

### Phase 2 — Core reader and writer
- BookForest Library, book detail, reader, lists, journal.
- Writing Projects, project overview, Story Composer, editor, versions.
- Save/recovery states, export controls, privacy gates.

**Exit:** a user can read, annotate, create, revise, and export without losing data.

### Phase 3 — Learning and magazine
- Learning catalog, lesson detail, prompt studio, workbooks.
- Magazine listing/detail, author profiles, series.
- Save-to-BookForest and link-to-project interactions.
- Editorial submission UI and editor views where backend support exists.

**Exit:** a reader can discover, save, reflect, and use a lesson in a writing project.

### Phase 4 — Publishing workflows
- Opportunity directory/detail.
- Query Studio and submission tracker.
- Readiness, publishing routes, rights, safety pages.
- Deadline and status reminders.

**Exit:** a writer can prepare materials and track a submission through a coherent flow.

### Phase 5 — My Space and growth
- Portfolio, goals, saved items, private journal.
- Reader follows, newsletters, campaigns, community only when privacy/moderation is ready.
- Advanced analytics and specialist features after usage validation.

**Exit:** profile, goals, and sharing are user-controlled and reliable.

---

## 14. Testing checklist

### Route and navigation
- Every route opens directly and refreshes correctly.
- Browser back/forward works.
- Unknown IDs show not-found states.
- Sidebar and mobile navigation reflect the current route.
- No action unexpectedly opens a new tab.

### Forms and state
- Required fields and errors are accessible.
- Loading and duplicate-submit states work.
- Failed requests preserve entered content.
- Unsaved changes warn before navigation.
- Empty states provide useful next actions.

### Privacy and authorization
- Private projects are inaccessible to other users.
- Private annotations and journals never appear in public search.
- Public portfolio includes only selected items.
- Submission and editor notes are visible only to authorized parties.
- UI restrictions are backed by server-side authorization.

### Reading and writing
- Reader progress survives refresh and sign-in changes.
- Annotations attach to the right document location.
- Large drafts do not freeze the page.
- Version restore preserves previous versions.
- Exported files open correctly.
- Offline indicators are truthful.

### Accessibility and localization
- Keyboard-only navigation works.
- Focus is visible and not trapped.
- Dialogs announce labels and errors.
- Bengali text renders correctly and does not break layouts.
- Charts have text alternatives.
- Text remains readable at zoom and on mobile.

### Performance and resilience
- Large reader/editor bundles are lazy-loaded.
- Images have appropriate sizing and loading behavior.
- API errors are recoverable.
- Refresh during editing does not silently discard data.
- Empty, slow, and offline API states are tested.

---

## 15. Definition of done for every page

A page is not complete merely because it looks finished. Each page must have:

- [ ] Route and page title
- [ ] Responsive desktop/tablet/mobile layout
- [ ] Loading, empty, error, and permission states
- [ ] Form validation and accessible error messages where applicable
- [ ] Real API integration or clearly labeled prototype data
- [ ] No fake success states
- [ ] Keyboard and screen-reader basics
- [ ] Privacy and permissions reviewed
- [ ] Analytics/events defined only where useful and privacy-appropriate
- [ ] Unit/component or integration tests for critical behavior
- [ ] Deep-link, refresh, back/forward tests
- [ ] Documentation of known limitations

---

## 16. Recommended first implementation slice

Build these five routes first as a vertical slice:

1. `/app` — Home dashboard.
2. `/read/library` and `/read/book/:bookId` — Library and book detail.
3. `/write/projects` and `/write/projects/:projectId` — Project list and overview.
4. `/write/projects/:projectId/compose` — Story Composer.
5. `/magazine/story/:slug` — Article/story detail with Save to BookForest.

Why this slice:
- It proves the navigation and page-shell architecture.
- It uses shared records across reading, writing, and editorial content.
- It validates the core cross-module journey without prematurely building the entire opportunity directory or community.
- It can expose data-model problems before dozens of screens depend on them.

After this slice works end-to-end, add the reader and editor, then versioning, learning, editorial submission, and publishing workflows.

---

## Final implementation principle

Treat each major section as its own **page/route**, not its own isolated application. Keep one shared shell, one coherent design system, canonical data, and consistent privacy and state behavior. Build one end-to-end user journey at a time, and only expose UI actions that the backend can actually support.
