import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export const filesRouter = Router();

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOADS_DIR)) {
  fs.mkdirSync(config.UPLOADS_DIR, { recursive: true });
}

// POST /api/v1/files/upload and /api/upload
export function handleFileUpload(req: Request, res: Response) {
  const { filename, fileData, fileType } = req.body;
  if (!fileData) {
    throw new AppError('Missing fileData (base64 string required)', 400, 'BAD_REQUEST');
  }

  // Strip potential data URL prefix
  const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Max 50MB check
  if (buffer.length > 50 * 1024 * 1024) {
    throw new AppError('File size exceeds 50MB limit', 413, 'PAYLOAD_TOO_LARGE');
  }

  const cleanExt = fileType === 'pdf' ? '.pdf' : '.epub';
  const baseName = (filename || 'book').replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const safeFilename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${
    baseName.endsWith(cleanExt) ? baseName : baseName + cleanExt
  }`;
  const filePath = path.join(config.UPLOADS_DIR, safeFilename);

  fs.writeFileSync(filePath, buffer);

  const mimeType = fileType === 'pdf' ? 'application/pdf' : 'application/epub+zip';

  return res.json({
    success: true,
    url: `/api/files/${safeFilename}`,
    filename: safeFilename,
    size: buffer.length,
    mimeType,
  });
}

// GET /api/v1/files/:filename and /api/files/:filename with PROPER HTTP Range Support!
export function handleFileDownload(req: Request, res: Response) {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(config.UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    throw new AppError('File not found', 404, 'NOT_FOUND');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const mimeType = isPdf ? 'application/pdf' : 'application/epub+zip';

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const range = req.headers.range;

  if (range) {
    // Parse Range header e.g. "bytes=0-1024"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).end();
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    });

    return file.pipe(res);
  }

  // Full file stream
  res.setHeader('Content-Length', fileSize);
  const stream = fs.createReadStream(filePath);
  return stream.pipe(res);
}

filesRouter.post('/upload', handleFileUpload);
filesRouter.get('/:filename', handleFileDownload);
