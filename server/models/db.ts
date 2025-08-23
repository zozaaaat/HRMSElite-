import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';
import { env } from '../utils/env';

const dbPath = env.DATABASE_URL || 'dev.db';
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
