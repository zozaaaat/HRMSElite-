import { drizzle } from 'drizzle-orm/better-sqlite3';
import SQLCipher from '@journeyapps/sqlcipher';
import * as schema from '@shared/schema';
import { env } from '../utils/env';

// Use DATABASE_URL if set, otherwise default to dev.db
const dbPath = env.DATABASE_URL || 'dev.db';

// Fail fast if encryption key is missing or too short
if (!env.DB_ENCRYPTION_KEY || env.DB_ENCRYPTION_KEY.length < 32) {
  throw new Error('DB_ENCRYPTION_KEY must be at least 32 characters long');
}

// Initialize encrypted database
const sqlite = new SQLCipher(dbPath);
sqlite.pragma(`key = '${env.DB_ENCRYPTION_KEY}'`);

export const db = drizzle(sqlite, { schema });
