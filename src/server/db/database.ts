import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = config.DATA_DIR;
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'storizine.db');
  dbInstance = new Database(dbPath);

  // High performance & data integrity pragmas
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  dbInstance.pragma('busy_timeout = 5000');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('cache_size = -64000'); // 64MB memory page cache
  dbInstance.pragma('temp_store = MEMORY');

  // Run schema migrations
  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const runMigration = (name: string, sql: string) => {
    const existing = db.prepare('SELECT id FROM _migrations WHERE name = ?').get(name);
    if (!existing) {
      db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO _migrations (name, applied_at) VALUES (?, ?)').run(
          name,
          new Date().toISOString()
        );
      })();
    }
  };

  // Migration 001: Core Users & Sessions
  runMigration(
    '001_core_users_and_auth',
    `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      locale TEXT NOT NULL DEFAULT 'en',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      pen_name TEXT,
      title TEXT,
      bio TEXT,
      avatar_url TEXT,
      banner_url TEXT,
      featured_quote TEXT,
      social_links_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    `
  );

  // Migration 002: Books, Library, Annotations, Reading Progress
  runMigration(
    '002_books_and_reading',
    `
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      author TEXT NOT NULL,
      genre TEXT,
      cover_url TEXT,
      alternate_covers_json TEXT,
      total_pages INTEGER,
      isbn TEXT,
      publisher TEXT,
      release_date TEXT,
      blurb TEXT,
      excerpt TEXT,
      epub_url TEXT,
      pdf_url TEXT,
      file_type TEXT,
      source TEXT NOT NULL DEFAULT 'custom',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

    CREATE TABLE IF NOT EXISTS library_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      reading_status TEXT NOT NULL DEFAULT 'want-to-read',
      user_rating REAL DEFAULT 0,
      owned_format TEXT DEFAULT 'Ebook',
      collection_location TEXT DEFAULT 'Kindle Library',
      edition_details TEXT,
      purchase_price REAL,
      review_comments TEXT,
      quotes_json TEXT,
      tags_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, book_id)
    );

    CREATE INDEX IF NOT EXISTS idx_library_user_id ON library_items(user_id);

    CREATE TABLE IF NOT EXISTS reading_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      cfi TEXT NOT NULL DEFAULT '',
      percentage REAL NOT NULL DEFAULT 0,
      current_page INTEGER DEFAULT 0,
      total_seconds_read INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, book_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);

    CREATE TABLE IF NOT EXISTS annotations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      cfi_range TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT 'yellow',
      note TEXT,
      highlighted_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_annotations_user_book ON annotations(user_id, book_id);
    `
  );

  // Migration 003: Writing Projects, Documents, Versions, Story Bible
  runMigration(
    '003_writing_workspace',
    `
    CREATE TABLE IF NOT EXISTS writing_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      format TEXT NOT NULL DEFAULT 'novel',
      language TEXT NOT NULL DEFAULT 'English',
      genre TEXT,
      premise TEXT,
      workflow TEXT DEFAULT 'hybrid',
      status TEXT NOT NULL DEFAULT 'drafting',
      word_count INTEGER NOT NULL DEFAULT 0,
      target_word_count INTEGER NOT NULL DEFAULT 80000,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_writing_projects_user ON writing_projects(user_id);

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES writing_projects(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL DEFAULT 'draft',
      content TEXT NOT NULL DEFAULT '',
      word_count INTEGER NOT NULL DEFAULT 0,
      version_number INTEGER NOT NULL DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

    CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      summary TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

    CREATE TABLE IF NOT EXISTS story_bible_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES writing_projects(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      summary TEXT,
      details_json TEXT,
      order_index INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_story_bible_project ON story_bible_items(project_id);

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      linked_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
      linked_project_id TEXT REFERENCES writing_projects(id) ON DELETE SET NULL,
      mood TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id);
    `
  );

  // Migration 004: Magazine Items, Contributor Submissions, and User Goals
  runMigration(
    '004_magazine_submissions_goals',
    `
    CREATE TABLE IF NOT EXISTS magazine_items (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      author_name TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      body_markdown TEXT NOT NULL,
      cover_image TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_magazine_slug ON magazine_items(slug);
    CREATE INDEX IF NOT EXISTS idx_magazine_status ON magazine_items(status);

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      synopsis TEXT NOT NULL,
      manuscript_url TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      editor_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'words',
      target_value INTEGER NOT NULL,
      current_value INTEGER NOT NULL DEFAULT 0,
      deadline TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
    `
  );

  // Migration 005: Learning Academy, Publishing Opportunities, Submission Tracker, Notifications, and Audit Trail
  runMigration(
    '005_learning_opportunities_notifications_audit',
    `
    CREATE TABLE IF NOT EXISTS learning_lessons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      estimated_minutes INTEGER NOT NULL,
      author TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      exercises_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id TEXT NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 0,
      response_text TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, lesson_id)
    );

    CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);

    CREATE TABLE IF NOT EXISTS publishing_opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      organizer TEXT NOT NULL,
      type TEXT NOT NULL,
      deadline TEXT NOT NULL,
      compensation TEXT NOT NULL,
      entry_fee TEXT NOT NULL,
      genres_json TEXT NOT NULL,
      languages_json TEXT NOT NULL,
      official_url TEXT NOT NULL,
      verified_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submission_tracks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      opportunity_title TEXT NOT NULL,
      recipient TEXT NOT NULL,
      project_title TEXT NOT NULL,
      date_sent TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Preparing',
      follow_up_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_submission_tracks_user ON submission_tracks(user_id);

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details_json TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);
    `
  );

  // Seed default author and migrate legacy database.json if necessary
  seedInitialData(db);
}

// Password hashing utility using crypto.scryptSync
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function seedInitialData(db: Database.Database) {
  // Check if default author exists
  const existingAuthor = db.prepare('SELECT id FROM users WHERE email = ?').get('author@storizine.com');
  let authorId = 'author-mah-abdullah';

  if (!existingAuthor) {
    const { salt, hash } = hashPassword('writer1234');
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, password_salt, display_name, role, locale, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      authorId,
      'author@storizine.com',
      hash,
      salt,
      'mAh Abdullah',
      'author',
      'en',
      now,
      now
    );

    db.prepare(`
      INSERT INTO user_profiles (user_id, pen_name, title, bio, avatar_url, banner_url, featured_quote, social_links_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      authorId,
      'mAh Abdullah',
      'Fantasy, Science Fiction & Adventure Novelist',
      'Author of Sherif, Swan Villa, The Virus <evo>, and more.',
      '/assets/aistudio/Dreamy_Fantasy_Author_Bio_Landscape_df6b090c.png',
      '/assets/aistudio/Dreamy_Fantasy_Author_Bio_Landscape_df6b090c.png',
      '“Writing is the compass that navigates the uncharted realms of imagination.”',
      JSON.stringify([
        { platform: 'Wattpad', url: 'https://www.wattpad.com' },
        { platform: 'Webnovel', url: 'https://www.webnovel.com' },
      ]),
      now,
      now
    );
  }

  // Import existing data/database.json if books table is empty
  const bookCount = db.prepare('SELECT count(*) as cnt FROM books').get() as { cnt: number };
  if (bookCount.cnt === 0) {
    const legacyJsonPath = path.join(config.DATA_DIR, 'database.json');
    if (fs.existsSync(legacyJsonPath)) {
      try {
        const raw = fs.readFileSync(legacyJsonPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const now = new Date().toISOString();

        if (Array.isArray(parsed.books)) {
          const insertBook = db.prepare(`
            INSERT OR IGNORE INTO books (id, title, author, genre, cover_url, total_pages, blurb, source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const insertLib = db.prepare(`
            INSERT OR IGNORE INTO library_items (id, user_id, book_id, reading_status, user_rating, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          for (const b of parsed.books) {
            // Strictly exclude removed #31-#60 books
            if (b && typeof b.number === 'number' && b.number >= 31 && b.number <= 60) continue;
            if (b && typeof b.id === 'string' && /^(book|sz|pub-sz|bf)-(3[1-9]|[45][0-9]|60)$/i.test(b.id)) continue;

            const bookId = b.id || crypto.randomUUID();
            insertBook.run(
              bookId,
              b.title || 'Untitled',
              b.author || 'Unknown',
              b.genre || 'General Fiction',
              b.coverUrl || b.coverImage || '',
              b.totalPages || 0,
              b.reviewComments || b.blurb || '',
              'legacy_import',
              now,
              now
            );

            insertLib.run(
              crypto.randomUUID(),
              authorId,
              bookId,
              b.readingStatus || 'want-to-read',
              b.userRating || 0,
              now,
              now
            );
          }
        }
      } catch (err) {
        console.warn('Could not migrate legacy database.json:', err);
      }
    }
  }

  // Seed Learning Academy Lessons if empty
  const lessonCount = db.prepare('SELECT count(*) as cnt FROM learning_lessons').get() as { cnt: number };
  if (lessonCount.cnt === 0) {
    const now = new Date().toISOString();
    const insertLesson = db.prepare(`
      INSERT INTO learning_lessons (id, title, category, level, estimated_minutes, author, summary, content, exercises_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertLesson.run(
      'lesson-1',
      'Architecting Astral Geographies: Non-Euclidean Fantasy Settings',
      'Worldbuilding',
      'Intermediate',
      20,
      'Storizine Craft Desk',
      'How to build floating archipelagos, inverted mountains, and starlight rivers without losing emotional groundedness.',
      'When drafting speculative geographies—whether sky-realms, submerged civilizations, or pocket dimensions—the danger is rarely a lack of imagination. The real hazard is aesthetic drift, where infinite possibility robs the reader of gravity and stakes.\n\n1. Tie Geography to Labor\n2. Limit Magic with Physical Tolls\n3. Use Intimate Sensory Anchor Points',
      3,
      now,
      now
    );

    insertLesson.run(
      'lesson-2',
      'The Resonance of Syntax: Rhythm and Cadence in Speculative Prose',
      'Voice & Style',
      'Masterclass',
      18,
      'Literary Desk Fellow',
      'Mastering sentence variety, parataxis, and lyric pauses to evoke mythological reverence and visceral dread.',
      'Syntax is the invisible choreography of narrative emotion. A reader does not just absorb facts; they breathe with your punctuation.\n\n- Short, staccato clauses heighten danger.\n- Extended cadences lull the reader into philosophical contemplation.',
      2,
      now,
      now
    );

    insertLesson.run(
      'lesson-3',
      'The Dual-Track Narrative: Intertwining Myth and Modernity',
      'Craft & Structure',
      'Intermediate',
      25,
      'Bengali Speculative Collective',
      'Techniques for alternating between contemporary personal trauma and ancient celestial mythology to create resonance.',
      'When juxtaposing two timelines—such as an archivist in modern Old Dhaka and a celestial warrior from Vedic cosmic lore—the transition must not feel like two unacquainted books forced under one spine.\n\nThe secret lies in echo objects and shared dilemmas.',
      3,
      now,
      now
    );
  }

  // Seed Publishing Opportunities if empty
  const oppCount = db.prepare('SELECT count(*) as cnt FROM publishing_opportunities').get() as { cnt: number };
  if (oppCount.cnt === 0) {
    const now = new Date().toISOString();
    const insertOpp = db.prepare(`
      INSERT INTO publishing_opportunities (id, title, organizer, type, deadline, compensation, entry_fee, genres_json, languages_json, official_url, verified_date, status, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOpp.run(
      'opp-1',
      'The Nebula Astral Horizon Anthology Call',
      'SFWA / Speculative Visions Press',
      'Anthology',
      '2026-11-30',
      '$0.10/word (Pro SFWA rate)',
      'None ($0.00)',
      JSON.stringify(['Science Fiction', 'Astrolore', 'Bilingual Speculative']),
      JSON.stringify(['English', 'Bengali Translations Welcome']),
      'https://sfwa.org/calls/astral-horizon',
      '2026-10-25',
      'Open',
      'Seeking stories between 3,000 and 7,500 words exploring non-Western mythologies and astronomical futures.',
      now
    );

    insertOpp.run(
      'opp-2',
      'Bengal Sea Annual Short Fiction Prize 2026',
      'Storizine Literary Trust & Dhaka Review',
      'Contest',
      '2026-12-15',
      '$2,500 First Prize + Publication',
      '$10 (Fee-waivers available)',
      JSON.stringify(['Literary Fiction', 'Magical Realism', 'Eco-Fiction']),
      JSON.stringify(['English', 'Bengali with English summary']),
      'https://storizine.org/awards/bengal-sea-prize',
      '2026-10-28',
      'Open',
      'Honoring exceptional narrative voices depicting riverine landscapes, post-colonial diaspora, or surreal ecological transformation.',
      now
    );

    insertOpp.run(
      'opp-3',
      'Solstice Speculative Novella Fellowship',
      'Tor / Foundry Literary Guild',
      'Grant',
      '2026-11-15',
      '$5,000 Grant + Mentorship',
      'None ($0.00)',
      JSON.stringify(['Fantasy', 'Sci-Fi Novella']),
      JSON.stringify(['English']),
      'https://foundryliterary.com/fellowships/solstice',
      '2026-10-20',
      'Closing Soon',
      'Designed for emerging authors working on debut fantasy or sci-fi novellas.',
      now
    );
  }
}
