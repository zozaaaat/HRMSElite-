// Migration script to encrypt or re-encrypt an existing SQLite database
// Usage: DB_ENCRYPTION_KEY=newkey [DB_ENCRYPTION_KEY_PREVIOUS=oldkey] node scripts/migrate-sqlite-encryption.js [dbPath]

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.argv[2] || process.env.DATABASE_URL || 'dev.db';
const newKey = process.env.DB_ENCRYPTION_KEY;
const oldKey = process.env.DB_ENCRYPTION_KEY_PREVIOUS || '';

if (!newKey || newKey.length < 32) {
  console.error('DB_ENCRYPTION_KEY must be at least 32 characters long');
  process.exit(1);
}

const resolvedPath = path.resolve(dbPath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`Database file not found at ${resolvedPath}`);
  process.exit(1);
}

const db = new Database(resolvedPath);
try {
  // Open database with old key or as unencrypted
  db.pragma(`key = '${oldKey}'`);
  // Verify that the database is accessible
  db.prepare('SELECT 1').get();
  // Rekey database with new encryption key
  db.pragma(`rekey = '${newKey}'`);
  console.log('Database encryption migrated successfully');
} catch (err) {
  console.error('Failed to migrate database encryption:', err.message);
  process.exit(1);
} finally {
  db.close();
}
