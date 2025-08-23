import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as optimizedSchema from '@shared/schema/optimized-schema';
import { env } from '../utils/env';

const dbPath = env.DATABASE_URL || 'dev.db';
const sqlite = new Database(dbPath);

// Enable WAL mode and other performance tweaks
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 10000');
sqlite.pragma('temp_store = MEMORY');

export const db = drizzle(sqlite, {schema: optimizedSchema});
export { optimizedSchema as schema };

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await sqlite.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export const optimizeDatabase = async (): Promise<void> => {
  try {
    await sqlite.prepare('ANALYZE').run();
    await sqlite.prepare('VACUUM').run();
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Database optimization failed:', error);
  }
};

export { sqlite };
