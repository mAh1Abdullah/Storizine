import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../db/database';
import {
  projectCreateSchema,
  projectUpdateSchema,
  documentCreateSchema,
  documentUpdateSchema,
  documentVersionCreateSchema,
  storyBibleItemSchema,
} from '../schemas';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const writingRouter = Router();
export const documentsRouter = Router();
export const storyBibleRouter = Router();

// All writing endpoints require authentication
writingRouter.use(requireAuth);
documentsRouter.use(requireAuth);
storyBibleRouter.use(requireAuth);

// Helper to count words
function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// ==========================================
// 1. PROJECTS
// ==========================================

// GET /api/v1/writing/projects
writingRouter.get('/projects', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const rows = db.prepare(`
    SELECT p.*, count(d.id) as documents_count
    FROM writing_projects p
    LEFT JOIN documents d ON d.project_id = p.id
    WHERE p.user_id = ?
    GROUP BY p.id
    ORDER BY p.updated_at DESC
  `).all(userId) as any[];

  const projects = rows.map((r) => ({
    id: r.id,
    title: r.title,
    format: r.format,
    language: r.language,
    genre: r.genre,
    premise: r.premise,
    workflow: r.workflow,
    status: r.status,
    wordCount: r.word_count,
    targetWordCount: r.target_word_count,
    documentsCount: r.documents_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return res.json({ success: true, projects });
});

// POST /api/v1/writing/projects
writingRouter.post('/projects', (req: Request, res: Response) => {
  const data = projectCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;
  const projectId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO writing_projects (
        id, user_id, title, format, language, genre, premise,
        workflow, status, word_count, target_word_count, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      projectId,
      userId,
      data.title,
      data.format,
      data.language,
      data.genre || null,
      data.premise || null,
      data.workflow,
      data.status,
      data.targetWordCount,
      now,
      now
    );

    // Create default primary draft document
    const docId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO documents (
        id, project_id, user_id, title, doc_type, content,
        word_count, version_number, order_index, created_at, updated_at
      )
      VALUES (?, ?, ?, 'Chapter 1', 'draft', '', 0, 1, 0, ?, ?)
    `).run(docId, projectId, userId, now, now);
  })();

  return res.status(201).json({
    success: true,
    project: {
      id: projectId,
      userId,
      ...data,
      wordCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// GET /api/v1/writing/projects/:id
writingRouter.get('/projects/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare(`
    SELECT * FROM writing_projects WHERE id = ?
  `).get(req.params.id) as any;

  if (!project) {
    throw new AppError('Writing project not found', 404, 'NOT_FOUND');
  }
  if (project.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not have permission to view this project.', 403, 'FORBIDDEN');
  }

  const documents = db.prepare(`
    SELECT id, title, doc_type, word_count, version_number, order_index, updated_at
    FROM documents
    WHERE project_id = ?
    ORDER BY order_index ASC, created_at ASC
  `).all(req.params.id) as any[];

  return res.json({
    success: true,
    project: {
      id: project.id,
      title: project.title,
      format: project.format,
      language: project.language,
      genre: project.genre,
      premise: project.premise,
      workflow: project.workflow,
      status: project.status,
      wordCount: project.word_count,
      targetWordCount: project.target_word_count,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        docType: d.doc_type,
        wordCount: d.word_count,
        versionNumber: d.version_number,
        orderIndex: d.order_index,
        updatedAt: d.updated_at,
      })),
    },
  });
});

// PATCH /api/v1/writing/projects/:id
writingRouter.patch('/projects/:id', (req: Request, res: Response) => {
  const data = projectUpdateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project) {
    throw new AppError('Writing project not found', 404, 'NOT_FOUND');
  }
  if (project.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this project.', 403, 'FORBIDDEN');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    params.push(data.title);
  }
  if (data.format !== undefined) {
    updates.push('format = ?');
    params.push(data.format);
  }
  if (data.language !== undefined) {
    updates.push('language = ?');
    params.push(data.language);
  }
  if (data.genre !== undefined) {
    updates.push('genre = ?');
    params.push(data.genre);
  }
  if (data.premise !== undefined) {
    updates.push('premise = ?');
    params.push(data.premise);
  }
  if (data.workflow !== undefined) {
    updates.push('workflow = ?');
    params.push(data.workflow);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.targetWordCount !== undefined) {
    updates.push('target_word_count = ?');
    params.push(data.targetWordCount);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(req.params.id);

  db.prepare(`UPDATE writing_projects SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Project updated successfully' });
});

// DELETE /api/v1/writing/projects/:id
writingRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project) {
    throw new AppError('Writing project not found', 404, 'NOT_FOUND');
  }
  if (project.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this project.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM writing_projects WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
});

// ==========================================
// 2. DOCUMENTS & AUTOSAVE VERSIONING
// ==========================================

// GET /api/v1/writing/projects/:id/documents
writingRouter.get('/projects/:id/documents', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project || (project.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Project not found or inaccessible', 404, 'NOT_FOUND');
  }

  const docs = db.prepare(`
    SELECT id, title, doc_type, word_count, version_number, order_index, created_at, updated_at
    FROM documents
    WHERE project_id = ?
    ORDER BY order_index ASC, created_at ASC
  `).all(req.params.id) as any[];

  return res.json({ success: true, documents: docs });
});

// POST /api/v1/writing/projects/:id/documents
writingRouter.post('/projects/:id/documents', (req: Request, res: Response) => {
  const data = documentCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project || (project.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Project not found or inaccessible', 404, 'NOT_FOUND');
  }

  const docId = crypto.randomUUID();
  const wordCount = countWords(data.content || '');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO documents (
      id, project_id, user_id, title, doc_type, content,
      word_count, version_number, order_index, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(
    docId,
    req.params.id,
    userId,
    data.title,
    data.docType,
    data.content || '',
    wordCount,
    data.orderIndex || 0,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    document: {
      id: docId,
      projectId: req.params.id,
      title: data.title,
      docType: data.docType,
      wordCount,
      versionNumber: 1,
      orderIndex: data.orderIndex,
      createdAt: now,
      updatedAt: now,
    },
  });
});

// ==========================================
// 2. DOCUMENTS & AUTOSAVE VERSIONING
// ==========================================

const handleGetDocument = (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!doc) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }
  if (doc.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this document.', 403, 'FORBIDDEN');
  }

  return res.json({
    success: true,
    document: {
      id: doc.id,
      projectId: doc.project_id,
      title: doc.title,
      docType: doc.doc_type,
      content: doc.content,
      wordCount: doc.word_count,
      versionNumber: doc.version_number,
      orderIndex: doc.order_index,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    },
  });
};

const handleUpdateDocument = (req: Request, res: Response) => {
  const data = documentUpdateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const currentDoc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!currentDoc) {
    throw new AppError('Document not found', 404, 'NOT_FOUND');
  }
  if (currentDoc.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this document.', 403, 'FORBIDDEN');
  }

  // Optimistic concurrency check
  if (data.expectedVersion !== undefined && data.expectedVersion !== currentDoc.version_number) {
    throw new AppError(
      `Conflict: document was modified by another session (expected version ${data.expectedVersion}, but current is ${currentDoc.version_number}).`,
      409,
      'VERSION_CONFLICT'
    );
  }

  const newContent = data.content !== undefined ? data.content : currentDoc.content;
  const newTitle = data.title !== undefined ? data.title : currentDoc.title;
  const newDocType = data.docType !== undefined ? data.docType : currentDoc.doc_type;
  const newOrderIndex = data.orderIndex !== undefined ? data.orderIndex : currentDoc.order_index;
  const newVersion = currentDoc.version_number + 1;
  const newWordCount = countWords(newContent);
  const now = new Date().toISOString();

  db.transaction(() => {
    // Update document
    db.prepare(`
      UPDATE documents
      SET title = ?, doc_type = ?, content = ?, word_count = ?, version_number = ?, order_index = ?, updated_at = ?
      WHERE id = ?
    `).run(newTitle, newDocType, newContent, newWordCount, newVersion, newOrderIndex, now, req.params.id);

    // Recalculate project total word count
    const totalWords = db.prepare(`
      SELECT sum(word_count) as total FROM documents WHERE project_id = ?
    `).get(currentDoc.project_id) as any;

    db.prepare(`
      UPDATE writing_projects SET word_count = ?, updated_at = ? WHERE id = ?
    `).run(totalWords?.total || 0, now, currentDoc.project_id);
  })();

  return res.json({
    success: true,
    document: {
      id: currentDoc.id,
      title: newTitle,
      docType: newDocType,
      wordCount: newWordCount,
      versionNumber: newVersion,
      updatedAt: now,
    },
  });
};

const handleGetDocumentVersions = (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const doc = db.prepare('SELECT id, user_id FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!doc || (doc.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Document not found or inaccessible', 404, 'NOT_FOUND');
  }

  const versions = db.prepare(`
    SELECT id, version_number, word_count, summary, created_at
    FROM document_versions
    WHERE document_id = ?
    ORDER BY version_number DESC
  `).all(req.params.id) as any[];

  return res.json({ success: true, versions });
};

const handleCreateDocumentVersion = (req: Request, res: Response) => {
  const data = documentVersionCreateSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id) as any;
  if (!doc || (doc.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Document not found or inaccessible', 404, 'NOT_FOUND');
  }

  const versionId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO document_versions (id, document_id, version_number, content, word_count, summary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    versionId,
    doc.id,
    doc.version_number,
    doc.content,
    doc.word_count,
    data.summary || `Snapshot v${doc.version_number}`,
    now
  );

  return res.status(201).json({
    success: true,
    version: {
      id: versionId,
      documentId: doc.id,
      versionNumber: doc.version_number,
      wordCount: doc.word_count,
      summary: data.summary || `Snapshot v${doc.version_number}`,
      createdAt: now,
    },
  });
};

// Mount handlers on documentsRouter (/api/v1/documents)
documentsRouter.get('/:id', handleGetDocument);
documentsRouter.put('/:id', handleUpdateDocument);
documentsRouter.get('/:id/versions', handleGetDocumentVersions);
documentsRouter.post('/:id/versions', handleCreateDocumentVersion);

// Also mount aliases on writingRouter (/api/v1/writing/documents/...)
writingRouter.get('/documents/:id', handleGetDocument);
writingRouter.put('/documents/:id', handleUpdateDocument);
writingRouter.get('/documents/:id/versions', handleGetDocumentVersions);
writingRouter.post('/documents/:id/versions', handleCreateDocumentVersion);

// ==========================================
// 3. STORY COMPOSER (STORY BIBLE)
// ==========================================

// GET /api/v1/writing/projects/:id/story-bible
writingRouter.get('/projects/:id/story-bible', (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project || (project.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Project not found or inaccessible', 404, 'NOT_FOUND');
  }

  const items = db.prepare(`
    SELECT * FROM story_bible_items
    WHERE project_id = ?
    ORDER BY order_index ASC, name ASC
  `).all(req.params.id) as any[];

  return res.json({
    success: true,
    items: items.map((i) => ({
      id: i.id,
      category: i.category,
      name: i.name,
      summary: i.summary,
      details: i.details_json ? JSON.parse(i.details_json) : {},
      orderIndex: i.order_index,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    })),
  });
});

// POST /api/v1/writing/projects/:id/story-bible
writingRouter.post('/projects/:id/story-bible', (req: Request, res: Response) => {
  const data = storyBibleItemSchema.parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const project = db.prepare('SELECT id, user_id FROM writing_projects WHERE id = ?').get(req.params.id) as any;
  if (!project || (project.user_id !== userId && req.user!.role !== 'admin')) {
    throw new AppError('Project not found or inaccessible', 404, 'NOT_FOUND');
  }

  const itemId = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO story_bible_items (id, project_id, user_id, category, name, summary, details_json, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    itemId,
    req.params.id,
    userId,
    data.category,
    data.name,
    data.summary || '',
    JSON.stringify(data.details || {}),
    data.orderIndex || 0,
    now,
    now
  );

  return res.status(201).json({
    success: true,
    item: {
      id: itemId,
      projectId: req.params.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    },
  });
});

const handleUpdateStoryBibleItem = (req: Request, res: Response) => {
  const data = storyBibleItemSchema.partial().parse(req.body);
  const db = getDatabase();
  const userId = req.user!.id;

  const item = db.prepare('SELECT id, user_id FROM story_bible_items WHERE id = ?').get(req.params.id) as any;
  if (!item) {
    throw new AppError('Story bible item not found', 404, 'NOT_FOUND');
  }
  if (item.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this item.', 403, 'FORBIDDEN');
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.category) {
    updates.push('category = ?');
    params.push(data.category);
  }
  if (data.name) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.summary !== undefined) {
    updates.push('summary = ?');
    params.push(data.summary);
  }
  if (data.details !== undefined) {
    updates.push('details_json = ?');
    params.push(JSON.stringify(data.details));
  }
  if (data.orderIndex !== undefined) {
    updates.push('order_index = ?');
    params.push(data.orderIndex);
  }

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());

  params.push(req.params.id);

  db.prepare(`UPDATE story_bible_items SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  return res.json({ success: true, message: 'Story bible item updated successfully' });
};

const handleDeleteStoryBibleItem = (req: Request, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.id;

  const item = db.prepare('SELECT id, user_id FROM story_bible_items WHERE id = ?').get(req.params.id) as any;
  if (!item) {
    throw new AppError('Story bible item not found', 404, 'NOT_FOUND');
  }
  if (item.user_id !== userId && req.user!.role !== 'admin') {
    throw new AppError('Forbidden: you do not own this item.', 403, 'FORBIDDEN');
  }

  db.prepare('DELETE FROM story_bible_items WHERE id = ?').run(req.params.id);
  return res.json({ success: true, id: req.params.id });
};

// Mount on storyBibleRouter (/api/v1/story-bible)
storyBibleRouter.patch('/:id', handleUpdateStoryBibleItem);
storyBibleRouter.delete('/:id', handleDeleteStoryBibleItem);

// Also mount on writingRouter (/api/v1/writing/story-bible/...)
writingRouter.patch('/story-bible/:id', handleUpdateStoryBibleItem);
writingRouter.delete('/story-bible/:id', handleDeleteStoryBibleItem);
