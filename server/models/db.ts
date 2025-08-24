import { secureDbManager } from '../utils/dbSecurity';
import { env } from '../utils/env';

await secureDbManager.initializeDatabase(env.DATABASE_URL);

export const db = secureDbManager.getDatabase();
export const sqlite = secureDbManager.getRawDatabase();
