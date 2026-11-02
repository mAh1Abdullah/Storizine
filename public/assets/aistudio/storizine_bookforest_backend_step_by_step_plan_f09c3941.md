# Storizine & BookForest — Step-by-Step Backend Development Plan

**Version:** 1.0  
**Date:** 2 November 2026  
**Purpose:** Turn the Unified Platform Blueprint into a small, ordered, implementation-ready backend plan. Complete and test each step before moving to the next.

---

## 1. Goal and guiding rules

Build one reliable backend for Storizine & BookForest that supports:

- **Read:** BookForest library, reading progress, notes, lists, and reading journal.
- **Write:** writing projects, Story Composer data, drafts, revisions, and exports.
- **Learn:** lessons, exercises, prompts, and progress.
- **Magazine:** public literary content, author profiles, submissions, and editorial publishing.
- **Publish:** opportunities, query/proposal tools, and submission tracking.
- **My Space:** profile, goals, private journal, settings, and data export.

These are connected product areas, not separate backends. They should share identity, permissions, canonical records, search, file handling, notifications, and audit practices.

### Non-negotiable rules

1. **Audit before replacing.** The existing app has been described as React/TypeScript/Vite with an Express backend and Gemini integration. Confirm the current repository and dependencies before making changes.
2. **Do not trust the client.** Validate inputs and enforce authorization on the server for every protected operation.
3. **Private by default.** Drafts, reading notes, journals, annotations, submissions, and AI conversations are private unless the user explicitly shares them.
4. **Use durable storage.** Replace file-based JSON persistence with a database before relying on the platform for important user data.
5. **One vertical slice at a time.** Finish a small user journey from API to database to tests before adding another module.
6. **No fake success.** The API must return a clear success or error response; the UI must not assume an operation succeeded.
7. **AI is optional and bounded.** Keep model calls behind a server-side service, with privacy controls, rate limits, usage tracking, and clear user consent.

---

## 2. Recommended backend shape

Start with a **modular monolith**: one deployable backend with clearly separated modules. Do not start with microservices; they add operational complexity before the product needs it.

```text
src/
  server.ts
  app.ts
  config/
  middleware/
    authentication
    authorization
    validation
    rateLimit
    errorHandler
    requestId
  modules/
    auth/
    users/
    books/
    library/
    reading/
    writingProjects/
    documents/
    storyComposer/
    learning/
    magazine/
    editorial/
    publishing/
    journal/
    goals/
    files/
    search/
    notifications/
    ai/
    admin/
  shared/
    database/
    logging/
    email/
    storage/
    schemas/
    errors/
  jobs/
  tests/
```

Keep route handlers thin. Put business rules in services, database access in repositories or focused data-access functions, and input schemas near each module. Use a consistent API response and error format.

### API conventions

- Prefix endpoints with `/api/v1`.
- Use JSON for normal requests and responses.
- Use stable IDs; do not expose internal database details.
- Validate request bodies, query parameters, route parameters, and uploaded files.
- Use pagination for lists (`limit` plus a cursor or page strategy).
- Filter and sort on the server for larger datasets.
- Return appropriate status codes (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `413`, `422`, `429`, `500`).
- Never return stack traces, secrets, password hashes, or private records in public error responses.
- Document endpoints with OpenAPI once the first core routes stabilize.

---

## 3. Small-step implementation roadmap

## Step 0 — Inspect the existing backend

**Goal:** Understand what already works before changing architecture.

Tasks:
- [ ] Inspect the repository, package scripts, Express entry point, route files, data models, and current tests.
- [ ] List every API endpoint and classify it as **working**, **partial**, **broken**, **unsafe**, or **missing**.
- [ ] Trace where user, book, writing, magazine, and AI data are currently stored.
- [ ] Check the current login implementation. Any demo login that accepts arbitrary passcodes must not be used in production.
- [ ] Inspect file upload/download endpoints, including whether advertised range requests are genuinely implemented.
- [ ] Record existing environment variables and external API integrations without copying secrets into documentation.
- [ ] Produce a short gap report and a migration plan.

**Done when:** There is a current-state inventory, security issue list, and agreed sequence of changes. Existing working behavior is covered by tests or documented before it is refactored.

**Do not:** Rewrite the entire server before knowing what can be reused.

---

## Step 1 — Make configuration and startup reliable

**Goal:** Make the backend safe to run locally, in tests, and in production.

Tasks:
- [ ] Separate app creation from server startup (`app.ts` versus `server.ts`) so tests can import the app without opening a port.
- [ ] Validate required environment variables at startup.
- [ ] Keep secrets in environment/secret management; commit only an `.env.example` with placeholder values.
- [ ] Define separate development, test, and production configuration.
- [ ] Add a request ID, structured logs, a centralized error handler, and graceful shutdown.
- [ ] Add `/health/live` and `/health/ready` endpoints; readiness should verify essential dependencies without leaking configuration.
- [ ] Set appropriate CORS, security headers, request-size limits, and proxy settings for the actual deployment.

**Done when:** The app starts predictably, fails fast when required configuration is missing, and has smoke tests for health and error handling.

---

## Step 2 — Establish database and migrations

**Goal:** Replace fragile persistence with a durable data layer.

Tasks:
- [ ] Choose the production database based on the actual deployment and query needs. A relational database such as PostgreSQL is a strong default for users, projects, books, submissions, and editorial workflows.
- [ ] Select a compatible ORM/query layer only after checking the existing code and team familiarity.
- [ ] Add database connection management and migration scripts.
- [ ] Create a migration baseline for existing data.
- [ ] Move data from JSON files only through a repeatable migration/import script with validation and a backup.
- [ ] Add constraints and indexes for ownership, relationships, status, and common queries.
- [ ] Configure backups and test restoring a backup in a non-production environment.

**Done when:** Core data survives restarts, schema changes are versioned, migrations can be tested, and a restore procedure has been demonstrated.

**Important:** Do not delete the old data source until migration counts, relationships, and representative records have been verified.

---

## Step 3 — Define canonical data models

**Goal:** Ensure each concept has one shared identity across the product.

Create only the models needed for the first release. Suggested starting entities:

| Entity | Purpose |
|---|---|
| `User` | Account identity, status, locale, preferences |
| `Session` or auth-provider identity | Secure authenticated access |
| `UserProfile` | Public profile and author presentation |
| `Book` | Canonical bibliographic metadata, including external source IDs |
| `LibraryItem` | A user's relationship to a book and their reading status |
| `ReadingProgress` | Current location, percentage, and timestamps |
| `Annotation` | Private highlights and notes, with explicit visibility |
| `ReadingList` / `ReadingListItem` | User-created lists |
| `WritingProject` | Project title, type, status, owner, and metadata |
| `Document` | Draft or project text, with document type and revision metadata |
| `DocumentVersion` | Immutable saved revisions and recovery points |
| `StoryBibleItem` | Characters, locations, lore, themes, plot threads, and related notes |
| `JournalEntry` | Private reading or writing reflection |
| `Goal` / `GoalProgress` | User-defined goals and progress events |
| `MagazineItem` | Public editorial content and publication metadata |
| `Submission` | Contributor submission and editorial status |
| `Opportunity` | Contest, magazine, agent, grant, event, or residency listing |
| `PublishingSubmission` | A writer's submission to an external opportunity |
| `FileAsset` | Metadata and access rules for uploaded or generated files |
| `Notification` | User-targeted event and delivery status |
| `AuditEvent` | Security-sensitive and editorial action history |

Model guidance:
- Every user-owned record should have an explicit owner or a clear access relationship.
- Use foreign keys and uniqueness constraints where appropriate.
- Store timestamps consistently in UTC; render local time in the client.
- Support English and Bangla text with Unicode-safe storage and search.
- Keep public profile fields separate from private account data.
- Avoid putting all unrelated data into one untyped JSON blob.
- Use JSON columns only where the shape is genuinely flexible and validated.

**Done when:** A model diagram and migration files exist, and ownership/visibility rules are written for every private or publishable entity.

---

## Step 4 — Replace demo authentication and enforce authorization

**Goal:** Protect every user's data.

Tasks:
- [ ] Select a maintained authentication approach compatible with the current stack (managed identity provider or a well-reviewed session-based implementation).
- [ ] Implement sign-in, sign-out, session expiry, and account status checks.
- [ ] Add secure password reset and email verification if using password-based accounts.
- [ ] Use secure, HTTP-only cookies for browser sessions where appropriate; configure `Secure`, `SameSite`, CSRF protection, and session rotation correctly.
- [ ] Never store raw passwords or long-lived tokens in logs or browser storage.
- [ ] Add server-side authorization helpers such as `requireUser`, `requireRole`, and `canAccessResource`.
- [ ] Define roles such as user, editor, moderator, and admin only where each role has a documented purpose.
- [ ] Check object-level access for every request (for example, a user must not read another user's project by changing an ID).
- [ ] Add login and password-reset rate limits and generic responses that reduce account enumeration.
- [ ] Test unauthenticated, unauthorized, wrong-owner, disabled-account, and expired-session cases.

**Done when:** Automated tests prove that a user can access their own private records but cannot access another user's records by guessing or changing IDs.

**Release blocker:** Do not launch real accounts or private writing data while demo authentication remains active.

---

## Step 5 — Add validation, error handling, and API contracts

**Goal:** Make endpoints predictable and resistant to malformed input.

Tasks:
- [ ] Choose a runtime schema validator compatible with TypeScript.
- [ ] Define schemas for all inputs and important outputs.
- [ ] Normalize and validate IDs, strings, enums, dates, pagination, and file metadata.
- [ ] Apply maximum lengths and request-body limits.
- [ ] Reject unsupported fields where that prevents accidental or malicious mass assignment.
- [ ] Standardize error responses with a stable error code, safe message, and request ID.
- [ ] Add endpoint-level authorization and validation tests.
- [ ] Generate or maintain OpenAPI documentation for stable endpoints.

**Done when:** Every implemented route has input validation, a documented response shape, and tests for invalid inputs and permission failures.

---

## Step 6 — Build the first complete BookForest workflow

**Goal:** Deliver a small, useful reading feature from API through database.

Implement in this order:
1. [ ] Search/import book metadata from approved providers; cache external results and respect provider limits and terms.
2. [ ] Add a book to a user's library.
3. [ ] List, filter, and paginate library items.
4. [ ] Update reading status (want to read, reading, paused, completed, abandoned).
5. [ ] Save reading progress and last-read timestamp.
6. [ ] Create, update, and delete private annotations.
7. [ ] Create reading lists and add/remove books.
8. [ ] Add tests for ownership, duplicate imports, pagination, and concurrent progress updates.

**Suggested API routes**
```text
GET    /api/v1/books/search
GET    /api/v1/books/:bookId
GET    /api/v1/library
POST   /api/v1/library
PATCH  /api/v1/library/:libraryItemId
DELETE /api/v1/library/:libraryItemId
PUT    /api/v1/library/:libraryItemId/progress
GET    /api/v1/library/:libraryItemId/annotations
POST   /api/v1/library/:libraryItemId/annotations
PATCH  /api/v1/annotations/:annotationId
DELETE /api/v1/annotations/:annotationId
```

**Done when:** A signed-in user can add a book, update progress, create a private note, and reload the app without losing data.

---

## Step 7 — Build writing projects and reliable draft saving

**Goal:** Protect the user's most important content: their writing.

Tasks:
- [ ] Create, list, update, archive, and delete writing projects.
- [ ] Create documents within projects, including a clear document type (draft, outline, synopsis, scene, note).
- [ ] Save drafts with revision numbers or version records.
- [ ] Implement optimistic concurrency or version checks so two edits do not silently overwrite each other.
- [ ] Add autosave support with explicit save status, retry behavior, and conflict handling.
- [ ] Keep a recoverable recent-version history.
- [ ] Add project tags, status, and optional metadata without making them mandatory.
- [ ] Test large documents, interrupted requests, duplicate retries, and cross-user access.

**Suggested API routes**
```text
GET    /api/v1/writing/projects
POST   /api/v1/writing/projects
GET    /api/v1/writing/projects/:projectId
PATCH  /api/v1/writing/projects/:projectId
DELETE /api/v1/writing/projects/:projectId
GET    /api/v1/writing/projects/:projectId/documents
POST   /api/v1/writing/projects/:projectId/documents
GET    /api/v1/documents/:documentId
PUT    /api/v1/documents/:documentId
GET    /api/v1/documents/:documentId/versions
POST   /api/v1/documents/:documentId/versions
```

**Done when:** A user can create a project, draft, reload, restore a previous version, and never access another user's private work.

---

## Step 8 — Add Story Composer data

**Goal:** Make story planning structured, linked, and reusable.

Tasks:
- [ ] Store characters, settings, worldbuilding, themes, plot threads, scenes, and research notes as project-linked records.
- [ ] Allow links between records (for example, a scene involves two characters and one location).
- [ ] Support ordering and status for scenes and plot threads.
- [ ] Keep free-form notes possible; do not force every writer into one rigid story method.
- [ ] Add project-level export of selected Story Bible data.
- [ ] Add tests for ordering, linking, deletion behavior, and project access.

**Suggested routes**
```text
GET    /api/v1/writing/projects/:projectId/story-bible
POST   /api/v1/writing/projects/:projectId/story-bible/items
PATCH  /api/v1/story-bible/items/:itemId
DELETE /api/v1/story-bible/items/:itemId
```

**Done when:** A user can plan characters and scenes, link them to a project, and retrieve the same structure later.

---

## Step 9 — Centralize AI features behind one service

**Goal:** Support AI assistance without leaking secrets or sending user content unexpectedly.

Tasks:
- [ ] Route all model calls through a single server-side AI module; never expose provider API keys to the browser.
- [ ] Create a registry of approved AI tasks (brainstorm, organize notes, explain a craft concept, optional critique).
- [ ] Require the relevant user's action/consent before sending private text to a model.
- [ ] Send only the minimum content needed for the selected task.
- [ ] Define whether prompts, inputs, outputs, and provider responses are stored; make retention explicit.
- [ ] Add per-user rate limits, quotas, token/cost tracking, timeouts, retries with limits, and provider-error handling.
- [ ] Version prompts and record which task version produced a result.
- [ ] Treat AI output as suggestions, not authoritative facts; distinguish generated material from saved user writing.
- [ ] Do not use private manuscripts or journals for training without explicit, informed consent.
- [ ] Add tests for consent, authorization, rate limits, provider failures, and data minimization.

**Suggested routes**
```text
POST /api/v1/ai/story-ideas
POST /api/v1/ai/organize-notes
POST /api/v1/ai/craft-feedback
GET  /api/v1/ai/usage
```

**Done when:** AI tasks work through the backend, can be disabled by the user, enforce limits, and do not expose provider credentials.

---

## Step 10 — Build the Literary Desk and editorial workflow

**Goal:** Publish curated work safely with clear editorial control.

Tasks:
- [ ] Create magazine content records for stories, essays, poems, interviews, reviews, and translations.
- [ ] Support statuses such as draft, submitted, in review, revision requested, accepted, scheduled, published, rejected, and withdrawn.
- [ ] Separate public content from contributor submissions and internal editorial notes.
- [ ] Add author attribution, language, category, publication date, rights/permission records, and canonical URL/slug.
- [ ] Enforce editor permissions for review, scheduling, publication, and takedown.
- [ ] Record editorial status changes and important actions in an audit log.
- [ ] Validate that content is rights-cleared before publication.
- [ ] Add public listing, detail, and author-profile endpoints.
- [ ] Add moderation/reporting hooks before opening public submissions at scale.

**Suggested routes**
```text
GET    /api/v1/magazine
GET    /api/v1/magazine/:slug
GET    /api/v1/authors/:username
POST   /api/v1/submissions
GET    /api/v1/editorial/submissions
PATCH  /api/v1/editorial/submissions/:submissionId
POST   /api/v1/editorial/magazine/:itemId/publish
```

**Done when:** A contributor can submit work privately and an authorized editor can review and publish it without exposing internal notes or other contributors' submissions.

---

## Step 11 — Add journal, goals, and reading/writing connections

**Goal:** Connect reading and writing without duplicating records.

Tasks:
- [ ] Create private journal entries with optional links to books, annotations, lessons, or writing projects.
- [ ] Add user-defined goals and progress events.
- [ ] Use flexible goals rather than only streaks or word-count targets.
- [ ] Let users link a reading reflection to a writing project without copying the underlying record.
- [ ] Add private-by-default visibility and explicit sharing controls.
- [ ] Test export and deletion behavior for linked records.

**Done when:** Users can create a reflection, connect it to a book or project, and control its visibility.

---

## Step 12 — Add Learning and prompt content

**Goal:** Provide reusable educational content and track progress.

Tasks:
- [ ] Model lessons, learning paths, exercises, workbooks, and writing prompts.
- [ ] Distinguish platform-authored content from user responses.
- [ ] Store exercise completion and optional private answers separately.
- [ ] Link lessons and exercises to projects only with the user's choice.
- [ ] Add content versioning so a lesson can be updated without corrupting historical progress.
- [ ] Add pagination, language metadata, and accessible content formats.

**Done when:** Users can complete a lesson or exercise, resume later, and optionally connect the result to a writing project.

---

## Step 13 — Add publishing opportunities and submission tracking

**Goal:** Help writers organize external submissions without implying endorsement or guaranteed outcomes.

Tasks:
- [ ] Create opportunity records with source URL, type, eligibility, fees, deadline, region, language, rights notes, and last-verified timestamp.
- [ ] Track source and verification status; expire or flag stale listings.
- [ ] Allow users to save opportunities and create private submission records.
- [ ] Track submitted date, response date, status, notes, and next follow-up date.
- [ ] Keep personal submission notes private.
- [ ] Add reminders only after notification preferences are implemented.
- [ ] Distinguish verified facts, user-entered information, and editorial guidance.

**Done when:** A user can save an opportunity and track their own submission privately; stale opportunities are visibly flagged.

---

## Step 14 — Secure file storage and exports

**Goal:** Make uploads, downloads, and exports dependable.

Tasks:
- [ ] Choose local storage for development and private object storage or an equivalent production solution as appropriate.
- [ ] Store file metadata separately from file bytes.
- [ ] Validate MIME type, extension, file signature where feasible, file size, and ownership.
- [ ] Use generated storage keys rather than trusting user-supplied paths or filenames.
- [ ] Prevent path traversal and unauthorized file access.
- [ ] Use short-lived signed links or an authorized download handler for private files.
- [ ] Implement actual HTTP range support only if required by the reader, and test it end to end.
- [ ] Add exports for a user's library metadata, writing projects, versions, Story Bible, and journal in documented formats.
- [ ] Make exports access-controlled and time-limited where generated as files.
- [ ] Define deletion and backup-retention rules for uploaded files.

**Done when:** Users can export their own data and cannot download another user's private assets by guessing a filename or URL.

---

## Step 15 — Add search, notifications, and background jobs

**Goal:** Add shared infrastructure once core records are stable.

Tasks:
- [ ] Implement database-backed search across permitted books, public magazine content, lessons, and the current user's private records.
- [ ] Enforce visibility and ownership filters inside search queries, not just in the UI.
- [ ] Add notification preferences and delivery status.
- [ ] Add a background job mechanism for slow exports, reminders, metadata refreshes, and other retryable work.
- [ ] Use idempotency or deduplication for jobs that might run more than once.
- [ ] Add retry limits, failure logs, and a way to inspect failed jobs.
- [ ] Do not send marketing emails without consent and an unsubscribe mechanism.

**Done when:** Search cannot leak private content, jobs can safely retry, and users can control non-essential notifications.

---

## Step 16 — Add admin, moderation, and audit tools

**Goal:** Support responsible operation before opening community features.

Tasks:
- [ ] Add role-protected admin endpoints with least-privilege access.
- [ ] Record security-sensitive and editorial actions, including actor, action, target, and timestamp.
- [ ] Avoid placing manuscript text, passwords, tokens, or other secrets in audit logs.
- [ ] Add report intake, review status, and documented moderation actions before public comments or peer critique.
- [ ] Restrict access to internal editorial notes and moderation records.
- [ ] Add retention and access rules for audit records.
- [ ] Test that regular users cannot call admin endpoints or manipulate roles.

**Done when:** Admin access is restricted, important actions are traceable, and moderation has a defined process before community expansion.

---

## Step 17 — Test security, reliability, and performance

**Goal:** Make the backend dependable before broad release.

Minimum test layers:
- **Unit tests:** business rules and data transformations.
- **Integration tests:** routes, database constraints, authentication, authorization, and storage.
- **End-to-end tests:** complete user journeys.
- **Security tests:** wrong-owner access, injection attempts, mass assignment, rate limits, file access, session behavior, and role escalation.
- **Migration tests:** fresh database setup and upgrade from the previous schema.
- **Recovery tests:** restore backups and recover failed jobs.
- **Performance tests:** paginated lists, search, large documents, and concurrent autosaves.

Critical user journeys to test:
1. Sign in → add book → save progress → add private annotation.
2. Create project → write draft → autosave → restore previous version.
3. Use Story Composer → link a character and scene → export project notes.
4. Submit magazine work → editor requests revision → editor publishes rights-cleared work.
5. Create a private journal entry → link it to a project → export personal data.
6. Ask for AI assistance → confirm privacy behavior → handle a provider timeout safely.

**Done when:** All critical journeys pass in CI, access-control tests are green, and no known critical/high-severity security issue remains unresolved.

---

## Step 18 — Prepare production operations

**Goal:** Operate and maintain the service safely.

Tasks:
- [ ] Set up CI checks for linting, type checking, tests, and migration validation.
- [ ] Use separate development, staging, and production environments.
- [ ] Keep production secrets in a secret manager or deployment platform's secret storage.
- [ ] Add error monitoring, structured logs, uptime checks, and alerts for failed jobs.
- [ ] Establish database backup frequency, retention, and restore objectives.
- [ ] Add a deployment and rollback checklist.
- [ ] Document incident response, account deletion, data export, and credential rotation.
- [ ] Review privacy policy, terms, content rights, and AI disclosures before public launch.
- [ ] Record API versioning and deprecation policy.

**Done when:** A release can be deployed and rolled back predictably, failures are observable, and backups can be restored.

---

## 4. Suggested first-release scope

Do **not** build every backend module before launching. The recommended first slice is:

### Release A — Secure personal workspace
- Steps 0–5: audit, configuration, database, models, authentication, validation.
- BookForest: add books, library list, reading status/progress, private annotations.
- Writing Studio: projects, documents, version history, safe autosave.
- Basic export of a user's own core records.
- Automated tests for privacy and ownership.

### Release B — Connected creative workflow
- Story Composer data.
- Private reading/writing journal.
- Link a reading reflection to a project.
- Central AI service with explicit user action, limits, and privacy controls.

### Release C — Editorial publishing
- Magazine records and public endpoints.
- Contributor submissions and editor review workflow.
- Rights metadata, audit trail, and publishing controls.

### Release D — Expansion
- Learning Academy progress.
- Publishing opportunities and private submission tracker.
- Notifications, advanced search, background jobs.
- Community only after moderation, reporting, and privacy controls are ready.

---

## 5. Definition of done for every small step

A step is complete only when:

- [ ] The API contract is documented.
- [ ] Inputs are validated and outputs are predictable.
- [ ] Authentication and ownership checks are tested.
- [ ] Database migrations and constraints are included where needed.
- [ ] Errors and logs are safe and useful.
- [ ] Unit or integration tests cover normal and failure cases.
- [ ] No secret or private content is accidentally exposed.
- [ ] The front end can call the endpoint without relying on mock success.
- [ ] The README or developer notes explain how to run and test it.

---

## 6. Practical implementation order

Use this sequence for each task:

1. **Inspect** existing code and identify what can be reused.
2. **Specify** the endpoint, schema, permissions, and expected errors.
3. **Model** the data and write the migration.
4. **Implement** the service and route.
5. **Test** success, validation failures, and unauthorized access.
6. **Connect** the relevant front-end page.
7. **Verify** the full journey with persistent data.
8. **Document** the change and update the backlog.

Prefer small pull requests that each deliver one testable capability. Avoid implementing many routes at once without end-to-end verification.

## Final recommendation

Start with **Step 0: audit the current backend**, then secure the foundations before expanding features. The first meaningful milestone is not “all endpoints exist”; it is that one user can securely manage a book and a writing project, save their work reliably, and prove through automated tests that another user cannot access it.
