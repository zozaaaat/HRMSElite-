import {drizzle} from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as optimizedSchema from '@shared/schema/optimized-schema';
import 'dotenv/config';

// Use DATABASE_URL if set, otherwise default to dev.db
const dbPath = process.env.DATABASE_URL || 'dev.db';
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 10000');
sqlite.pragma('temp_store = MEMORY');

export const db = drizzle(sqlite, {schema: optimizedSchema});

// Export schema for use in repositories
export { optimizedSchema as schema };

// Database connection health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await sqlite.prepare('SELECT 1').get();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Database optimization function
export const optimizeDatabase = async (): Promise<void> => {
  try {
    // Analyze tables for better query planning
    await sqlite.prepare('ANALYZE').run();
    
    // Vacuum database to reclaim space
    await sqlite.prepare('VACUUM').run();
  } catch (error) {
    console.error('Database optimization failed:', error);
  }
};

// Export database instance for direct access if needed
export { sqlite };
