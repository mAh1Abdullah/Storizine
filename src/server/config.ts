import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  SESSION_SECRET: z.string().default('storizine-bookforest-secure-session-key-2026'),
  GEMINI_API_KEY: z.string().optional(),
  APP_URL: z.string().optional().default('http://localhost:3000'),
  DATA_DIR: z.string().default(path.resolve(process.cwd(), 'data')),
  UPLOADS_DIR: z.string().default(path.resolve(process.cwd(), 'uploads')),
});

const rawConfig = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  SESSION_SECRET: process.env.SESSION_SECRET || 'storizine-bookforest-secure-session-key-2026',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  APP_URL: process.env.APP_URL,
  DATA_DIR: process.env.DATA_DIR || path.resolve(process.cwd(), 'data'),
  UPLOADS_DIR: process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads'),
};

const parsed = configSchema.safeParse(rawConfig);

if (!parsed.success) {
  console.error('Invalid backend environment configuration:', parsed.error.format());
  throw new Error('Configuration validation failed');
}

export const config = parsed.data;
