# Storizine & BookForest — Step 0: Backend Audit & Gap Report

**Audit Date:** 2 November 2026  
**Status:** Completed  
**Reference Document:** `/public/assets/aistudio/storizine_bookforest_backend_step_by_step_plan_f09c3941.md`

---

## 1. Executive Summary

This audit assesses the current state of the Storizine & BookForest backend before transitioning to the modular architecture outlined in the Step-by-Step Backend Development Plan.

The current system is a Node.js Express server running with Vite middleware in development. While several client-facing reading and AI analysis features are functional, the backend currently lacks durable database storage, request validation, proper authentication, and user-scoped data isolation.

---

## 2. API Endpoint Inventory & Classification

| Endpoint | Method | Status | Audit Findings & Security Vulnerabilities |
|---|---|---|---|
| `/api/health` | GET | **Working** | Returns status, app name, and Gemini key availability. Lacks separated `/health/live` and `/health/ready` probe endpoints. |
| `/api/upload` | POST | **Partial / Unsafe** | Accepts base64 encoded payload up to 50MB in JSON body. No authentication. No magic byte/signature verification. High memory overhead. |
| `/api/files/:filename` | GET | **Broken Range / Unsafe** | Advertises `Accept-Ranges: bytes` but does not implement HTTP 206 Partial Content range requests (streams entire file). No authentication or download authorization. |
| `/api/books` | GET | **Working** | Reads all books from `data/database.json`. No pagination, filtering, or ownership scoping. |
| `/api/books` | POST | **Partial / Unsafe** | No input validation or schema. Unauthenticated callers can create or overwrite arbitrary book records. |
| `/api/books/:id` | DELETE | **Partial / Unsafe** | Unauthenticated callers can delete any book without ownership or authorization checks. |
| `/api/annotations` | GET | **Partial / Unsafe** | Returns annotations filtered by `bookId`. Lacks user isolation; anyone can read another reader's private annotations. |
| `/api/annotations` | POST | **Partial / Unsafe** | Unauthenticated; accepts client-provided `user_id` or falls back to `"reader-default"`. No validation of CFI range or color. |
| `/api/annotations/:id` | DELETE | **Partial / Unsafe** | Unauthenticated; anyone can delete any annotation by ID. |
| `/api/reading-progress/:bookId` | GET | **Partial / Unsafe** | Keyed solely by `bookId` in a shared dictionary. Multiple users overwrite each other's reading progress. |
| `/api/reading-progress` | POST | **Partial / Unsafe** | Unauthenticated; overwrites global progress for the book across all users. |
| `/api/ai/explain-term` | POST | **Working** | Connects to `@google/genai` (model: `gemini-3.6-flash`). Reliable JSON parsing & fallback. Lacks user rate limiting, quotas, and authentication. |
| `/api/ai/explain` | POST | **Working** | Comprehensive cultural & literary analysis. Same safety gaps: no auth, rate limits, or per-user cost tracking. |
| `/api/ai/review-assistant` | POST | **Working** | Assisted review drafting for BookForest. Unauthenticated and unthrottled. |
| `/api/ai/recommend-books` | POST | **Working** | Curated recommendations. Unauthenticated and unthrottled. |

---

## 3. Data Storage Trace

- **Books, Annotations, Progress:** Stored in a single flat file `data/database.json` read/written synchronously with `fs.writeFileSync`.
- **File Uploads:** Stored on the local filesystem under `uploads/`.
- **Writing Projects & Story Composer:** Stored exclusively in client-side memory and browser IndexedDB (`src/data/writingStudioData.ts`). No backend persistence exists yet for writing projects.
- **Reading Goals & User Space:** Stored exclusively in client memory (`src/data/initialData.ts`).
- **WordLens Dictionary:** Stored in `data/wordlens/dictionary.json`.

---

## 4. Authentication & Security Audit

### 4.1 Demo Authentication Flaw
In `src/components/LoginModal.tsx` (lines 27–35):
```typescript
// Demo authentication: allow any passcode or default "writer" / "1234"
if (passcode.trim() === '' || passcode.length >= 0) {
  onLoginSuccess();
  onClose();
}
```
Authentication currently operates entirely in the browser without server verification, cookies, tokens, or session state. Anyone clicking "Sign In" receives unrestricted client-side access.

### 4.2 Critical Security Issues
1. **Broken Object-Level Authorization (BOLA):** No endpoints verify whether the caller owns the resource they are querying, updating, or deleting.
2. **Missing Input Validation:** Route handlers take `req.body` directly without schema checks or sanitization.
3. **No Rate Limiting:** AI endpoints can be invoked without restrictions, posing potential denial-of-service or quota exhaustion risks.
4. **Range Request Non-Compliance:** `GET /api/files/:filename` sends `Accept-Ranges: bytes` but returns the full file with status 200 rather than slicing buffer bytes for status 206.

---

## 5. Existing Environment & Integrations

- `GEMINI_API_KEY`: Configured in process environment for `@google/genai` SDK.
- `PORT`: Set to 3000 (compliant with runtime environment).
- `NODE_ENV`: Used to distinguish Vite middleware mode from static production serving.

---

## 6. Implementation Sequence (Phased Roadmap)

1. **Step 1 — Configuration & Server Reliability:**
   - Decouple `server.ts` (listener & process lifecycle) from `app.ts` (Express application, middleware, route registration).
   - Add structured logging, request ID tracking, centralized error handling, and clean shutdown hooks.
   - Implement `/health/live` and `/health/ready` probe endpoints.
   - Configure security headers, CORS, and request size limits.

2. **Step 2 & 3 — Durable Data Layer & Canonical Models:**
   - Implement durable relational/repository storage with schema migration.
   - Migrate initial database data from `data/database.json` cleanly into durable records.
   - Establish canonical entity schemas (`User`, `Book`, `LibraryItem`, `ReadingProgress`, `Annotation`, `WritingProject`, `Document`, `DocumentVersion`, `StoryBibleItem`, `JournalEntry`).

3. **Step 4 & 5 — Secure Authentication & Schema Validation:**
   - Replace the demo login with secure server-side session/token authentication, password hashing, and role checks (`user`, `author`, `editor`).
   - Implement `requireAuth` and object-level permission middleware (`requireOwnerOrAdmin`).
   - Introduce schema validation (e.g. Zod or standardized JSON schema) on every route.

4. **Step 6 & 7 — Core Workspaces (Release A):**
   - BookForest reading workflow: user-scoped library, progress, annotations, and lists.
   - Writing Studio backend: projects, documents, version history, and conflict-safe autosaving.
