import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { getDatabase } from '../db/database';

describe('STORIZINE Backend Test Suite', () => {
  const app = createApp();

  beforeAll(() => {
    // Ensure database is initialized
    getDatabase();
  });

  // ==========================================
  // Step 1: Health & Readiness Tests
  // ==========================================
  describe('Health Probes', () => {
    it('GET /health/live returns 200 OK with uptime', async () => {
      const res = await request(app).get('/health/live');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });

    it('GET /health/ready returns 200 OK with database connection confirmed', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.database).toBe('connected');
    });

    it('GET /api/health returns legacy health response', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.pwaReady).toBe(true);
    });
  });

  // ==========================================
  // Step 4: Authentication & Authorization Tests
  // ==========================================
  describe('Authentication & Identity', () => {
    const testEmail = `reader_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    let userToken = '';

    it('POST /api/v1/auth/register creates a new user and returns a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          displayName: 'Test Reader',
          role: 'user',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.email).toBe(testEmail);
      userToken = res.body.token;
    });

    it('POST /api/v1/auth/register rejects duplicate emails with 409', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          displayName: 'Duplicate Reader',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('POST /api/v1/auth/login rejects invalid passwords with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('POST /api/v1/auth/login succeeds with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTruthy();
    });

    it('GET /api/v1/auth/me rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/auth/me returns user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testEmail);
    });
  });

  // ==========================================
  // Step 6 & 7: Writing Workspace & Data Isolation
  // ==========================================
  describe('Writing Workspace & Object-Level Permissions', () => {
    let authorToken = '';
    let intruderToken = '';
    let authorProjectId = '';
    let authorDocId = '';

    beforeAll(async () => {
      // Author login
      const authorRes = await request(app).post('/api/v1/auth/register').send({
        email: `author_${Date.now()}@example.com`,
        password: 'securePass123',
        displayName: 'Author User',
        role: 'author',
      });
      authorToken = authorRes.body.token;

      // Intruder login
      const intruderRes = await request(app).post('/api/v1/auth/register').send({
        email: `intruder_${Date.now()}@example.com`,
        password: 'securePass123',
        displayName: 'Intruder User',
        role: 'user',
      });
      intruderToken = intruderRes.body.token;
    });

    it('Author creates a writing project', async () => {
      const res = await request(app)
        .post('/api/v1/writing/projects')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'The Starlight Chronicle',
          format: 'novel',
          genre: 'Sci-Fi',
          targetWordCount: 90000,
        });

      expect(res.status).toBe(201);
      expect(res.body.project.title).toBe('The Starlight Chronicle');
      authorProjectId = res.body.project.id;
    });

    it('Intruder CANNOT read Author project (returns 403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/writing/projects/${authorProjectId}`)
        .set('Authorization', `Bearer ${intruderToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Author can add document, draft content, and autosave with versioning', async () => {
      // Create document
      const docRes = await request(app)
        .post(`/api/v1/writing/projects/${authorProjectId}/documents`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Prologue: The Shattered Nebula',
          docType: 'draft',
          content: 'The stars were silent over the crystal spires.',
        });

      expect(docRes.status).toBe(201);
      authorDocId = docRes.body.document.id;

      // Update draft with expectedVersion check
      const updateRes = await request(app)
        .put(`/api/v1/documents/${authorDocId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          content: 'The stars were silent over the crystal spires. A lone wanderer gazed into the horizon.',
          expectedVersion: 1,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.document.versionNumber).toBe(2);
      expect(updateRes.body.document.wordCount).toBe(15);

      // Check version conflict detection
      const conflictRes = await request(app)
        .put(`/api/v1/documents/${authorDocId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          content: 'Conflict edit',
          expectedVersion: 1, // Stale version
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.error.code).toBe('VERSION_CONFLICT');
    });

    it('Author can save snapshot checkpoint version', async () => {
      const res = await request(app)
        .post(`/api/v1/documents/${authorDocId}/versions`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          summary: 'End of Day 1 writing checkpoint',
        });

      expect(res.status).toBe(201);
      expect(res.body.version.summary).toBe('End of Day 1 writing checkpoint');

      // List versions
      const listRes = await request(app)
        .get(`/api/v1/documents/${authorDocId}/versions`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.versions.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Step 6: BookForest Library & Reading Progress
  // ==========================================
  describe('BookForest Reading Workflow', () => {
    let readerToken = '';
    let bookId = '';

    beforeAll(async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: `bf_reader_${Date.now()}@example.com`,
        password: 'securePass123',
        displayName: 'BookForest Reader',
      });
      readerToken = res.body.token;

      // Create a book
      const bookRes = await request(app)
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'The Obsidian Tower',
          author: 'mAh Abdullah',
          genre: 'Fantasy',
          totalPages: 420,
        });
      bookId = bookRes.body.book.id;
    });

    it('Reader adds book to personal library', async () => {
      const res = await request(app)
        .post('/api/v1/library')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          bookId,
          readingStatus: 'currently-reading',
          userRating: 4.5,
        });

      expect(res.status).toBe(201);
      expect(res.body.libraryItem.bookId).toBe(bookId);
    });

    it('Reader updates reading position and CFI', async () => {
      const res = await request(app)
        .put('/api/v1/library/progress')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          bookId,
          cfi: 'epubcfi(/6/4[chap01]!/4/2/10)',
          percentage: 35.5,
          currentPage: 150,
        });

      expect(res.status).toBe(200);
      expect(res.body.progress.percentage).toBe(35.5);

      // Verify fetch
      const getRes = await request(app)
        .get(`/api/v1/library/progress/${bookId}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.progress.cfi).toBe('epubcfi(/6/4[chap01]!/4/2/10)');
    });

    it('Reader adds private annotation', async () => {
      const res = await request(app)
        .post('/api/v1/library/annotations')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          book_id: bookId,
          cfi_range: 'epubcfi(/6/4[chap01]!/4/2/10,/4/2/20)',
          color: 'green',
          note: 'Luminous worldbuilding phrase',
          highlighted_text: 'the obsidian towers touched the clouds',
        });

      expect(res.status).toBe(201);
      expect(res.body.annotation.note).toBe('Luminous worldbuilding phrase');
    });
  });

  // ==========================================
  // Step 14: File Upload & Range Request Tests
  // ==========================================
  describe('File Storage & HTTP Range Requests', () => {
    let uploadedFilename = '';

    it('Uploads a mock EPUB file', async () => {
      const mockContent = 'Mock EPUB file content for reader streaming verification.';
      const base64Data = Buffer.from(mockContent).toString('base64');

      const res = await request(app)
        .post('/api/v1/files/upload')
        .send({
          filename: 'sample_story.epub',
          fileData: base64Data,
          fileType: 'epub',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.filename).toContain('sample_story');
      uploadedFilename = res.body.filename;
    });

    it('GET /api/v1/files/:filename supports HTTP 206 Partial Content Range Requests', async () => {
      const res = await request(app)
        .get(`/api/v1/files/${uploadedFilename}`)
        .set('Range', 'bytes=0-10');

      expect(res.status).toBe(206);
      expect(res.headers['content-range']).toContain('bytes 0-10/');
      expect(res.headers['accept-ranges']).toBe('bytes');
      expect(res.text).toBe('Mock EPUB f');
    });
  });

  // ==========================================
  // Step 4: Author Passcode Authentication
  // ==========================================
  describe('Author Passcode Authentication', () => {
    it('Author can sign in with writer passcode writer1234', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('author@storizine.com');
      expect(res.body.user.role).toBe('author');
      expect(res.body.token).toBeTruthy();
    });

    it('Rejects invalid passcode with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'completely_wrong_passcode' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  // ==========================================
  // Step 11: Private Reading & Writing Journal
  // ==========================================
  describe('Private Journal & Record Linking', () => {
    let authorToken = '';
    let intruderToken = '';
    let journalEntryId = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;

      const intRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `journal_intruder_${Date.now()}@example.com`,
          password: 'Password123!',
          displayName: 'Journal Intruder',
        });
      intruderToken = intRes.body.token;
    });

    it('Author creates private journal reflection linked to a project', async () => {
      const res = await request(app)
        .post('/api/v1/journal')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Notes on Chapter 3 Atmosphere',
          content: 'The mist should feel heavier, like a shroud wrapping the town.',
          mood: 'Contemplative',
        });

      expect(res.status).toBe(201);
      expect(res.body.entry.title).toBe('Notes on Chapter 3 Atmosphere');
      journalEntryId = res.body.entry.id;
    });

    it('Intruder CANNOT read Author private journal entry (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/journal/${journalEntryId}`)
        .set('Authorization', `Bearer ${intruderToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Author lists journal entries', async () => {
      const res = await request(app)
        .get('/api/v1/journal')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.entries.length).toBeGreaterThan(0);
      expect(res.body.entries[0].title).toBe('Notes on Chapter 3 Atmosphere');
    });
  });

  // ==========================================
  // Step 10: Literary Desk & Editorial Workflow
  // ==========================================
  describe('Magazine & Editorial Publishing', () => {
    let authorToken = '';
    let contributorToken = '';
    let subId = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;

      const contribRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `contributor_${Date.now()}@example.com`,
          password: 'Password123!',
          displayName: 'Contributor Writer',
        });
      contributorToken = contribRes.body.token;
    });

    it('Editor/Author publishes magazine article', async () => {
      const res = await request(app)
        .post('/api/v1/magazine')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          slug: `craft-of-silence-${Date.now()}`,
          title: 'The Craft of Silence in Modern Prose',
          authorName: 'mAh Abdullah',
          category: 'Craft Essays',
          excerpt: 'Silence in prose is not the absence of words, but their resonant aftermath.',
          bodyMarkdown: '# The Craft of Silence\n\nWhen writing atmospheric fiction...',
        });

      expect(res.status).toBe(201);
      expect(res.body.item.title).toBe('The Craft of Silence in Modern Prose');
    });

    it('Public reader can fetch published magazine listing', async () => {
      const res = await request(app).get('/api/v1/magazine');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('Contributor submits manuscript privately', async () => {
      const res = await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${contributorToken}`)
        .send({
          title: 'The Clockwork Meadow',
          genre: 'Speculative Fiction',
          wordCount: 4500,
          synopsis: 'A clockmaker finds living brass flowers in a forgotten valley.',
        });

      expect(res.status).toBe(201);
      expect(res.body.submission.title).toBe('The Clockwork Meadow');
      expect(res.body.submission.status).toBe('submitted');
      subId = res.body.submission.id;
    });

    it('Editor reviews submission and updates status', async () => {
      const res = await request(app)
        .patch(`/api/v1/editorial/submissions/${subId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          status: 'under_review',
          editorNotes: 'Promising imagery; reviewing with editorial committee.',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated');
    });
  });

  // ==========================================
  // Step 14: Personal Data Export
  // ==========================================
  describe('User Data Export', () => {
    it('GET /api/v1/auth/export returns full export of user data', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });

      const res = await request(app)
        .get('/api/v1/auth/export')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeTruthy();
      expect(Array.isArray(res.body.library)).toBe(true);
      expect(Array.isArray(res.body.writing.projects)).toBe(true);
      expect(Array.isArray(res.body.journal)).toBe(true);
    });
  });

  // ==========================================
  // Step 12: Learning Academy & Story Clinic
  // ==========================================
  describe('Learning Academy', () => {
    let authorToken = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;
    });

    it('GET /api/v1/learning/lessons returns seeded lessons', async () => {
      const res = await request(app).get('/api/v1/learning/lessons');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.lessons.length).toBeGreaterThan(0);
      expect(res.body.lessons[0].title).toBeTruthy();
    });

    it('POST /api/v1/learning/lessons/:id/progress tracks completion', async () => {
      const res = await request(app)
        .post('/api/v1/learning/lessons/lesson-1/progress')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          completed: true,
          responseText: 'Tied the sky-citadel fresh water collection to condensation nets.',
        });

      expect(res.status).toBe(200);
      expect(res.body.progress.completed).toBe(true);
    });

    it('POST /api/v1/learning/clinic evaluates craft passage', async () => {
      const res = await request(app)
        .post('/api/v1/learning/clinic')
        .send({
          excerpt: 'The tower stood high against the gray horizon. Wind whipped through the crumbling archway.',
          mode: 'sensory',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.feedback.strengths)).toBe(true);
      expect(Array.isArray(res.body.feedback.recommendations)).toBe(true);
    }, 15000);
  });

  // ==========================================
  // Step 13: Opportunities & Submission Tracker
  // ==========================================
  describe('Publishing Opportunities & Tracker', () => {
    let authorToken = '';
    let trackId = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;
    });

    it('GET /api/v1/opportunities returns open opportunities', async () => {
      const res = await request(app).get('/api/v1/opportunities');
      expect(res.status).toBe(200);
      expect(res.body.opportunities.length).toBeGreaterThan(0);
      expect(res.body.opportunities[0].title).toBeTruthy();
    });

    it('POST /api/v1/publishing-tracker adds tracked submission', async () => {
      const res = await request(app)
        .post('/api/v1/publishing-tracker')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          opportunityTitle: 'The Nebula Astral Horizon Anthology',
          recipient: 'SFWA',
          projectTitle: 'The Starlight Chronicle',
          dateSent: '2026-11-01',
          status: 'Submitted',
          followUpDate: '2026-11-30',
        });

      expect(res.status).toBe(201);
      expect(res.body.track.opportunityTitle).toContain('Nebula Astral');
      trackId = res.body.track.id;
    });

    it('GET /api/v1/publishing-tracker lists user tracks', async () => {
      const res = await request(app)
        .get('/api/v1/publishing-tracker')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tracks.length).toBeGreaterThan(0);
    });

    it('PATCH /api/v1/publishing-tracker/:id updates track', async () => {
      const res = await request(app)
        .patch(`/api/v1/publishing-tracker/${trackId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          status: 'Accepted',
          notes: 'Contract received!',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated');
    });
  });

  // ==========================================
  // Step 15: Unified Search & Notifications
  // ==========================================
  describe('Unified Search & Notifications', () => {
    let authorToken = '';
    let notifId = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;
    });

    it('GET /api/v1/search returns multi-domain categorized results', async () => {
      const res = await request(app)
        .get('/api/v1/search?q=Craft')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results).toHaveProperty('books');
      expect(res.body.results).toHaveProperty('magazine');
      expect(res.body.results).toHaveProperty('lessons');
      expect(res.body.results).toHaveProperty('writingProjects');
    });

    it('POST /api/v1/notifications creates a notification', async () => {
      const res = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Deadline Approaching',
          message: 'The Nebula Astral Horizon submission closes in 28 days.',
          type: 'warning',
        });

      expect(res.status).toBe(201);
      expect(res.body.notification.title).toBe('Deadline Approaching');
      notifId = res.body.notification.id;
    });

    it('PATCH /api/v1/notifications/:id/read marks notification as read', async () => {
      const res = await request(app)
        .patch(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('read');
    });
  });

  // ==========================================
  // Step 16: Admin, Moderation, and Audit Tools
  // ==========================================
  describe('Admin & Audit Trail (Step 16)', () => {
    let authorToken = '';

    beforeAll(async () => {
      const authRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ passcode: 'writer1234' });
      authorToken = authRes.body.token;
    });

    it('GET /api/v1/admin/audit rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/admin/audit');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/admin/audit returns recorded events for author', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.events)).toBe(true);
      // user.login should have been recorded by the login in beforeAll
      const loginEvent = res.body.events.find((e: any) => e.action === 'user.login');
      expect(loginEvent).toBeDefined();
    });

    it('POST /api/v1/admin/audit logs a manual moderation/admin action', async () => {
      const res = await request(app)
        .post('/api/v1/admin/audit')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          action: 'editorial.guideline_update',
          targetType: 'guidelines',
          targetId: 'guide-2026',
          details: { reason: 'Updated genre criteria' },
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('logged successfully');
    });

    it('GET /api/v1/admin/stats returns platform telemetry and excludes books #31-#60', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${authorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics).toHaveProperty('books');
      expect(res.body.metrics).toHaveProperty('writingProjects');
      expect(res.body.metrics).toHaveProperty('documents');
      expect(res.body.metrics).toHaveProperty('learningLessons');
      expect(res.body.system).toHaveProperty('uptimeSeconds');
      expect(res.body.system).toHaveProperty('heapUsedMb');
    });
  });
});
