/**
 * Authentication Migration Script
 * Adds password and email verification fields to existing users table
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import 'dotenv/config';

// Use DATABASE_URL if set, otherwise default to dev.db
const dbPath = process.env.DATABASE_URL || 'dev.db';
const sqlite = new Database(dbPath);

// Password utility functions
const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const generateSecureToken = (length = 64) => {
  return crypto.randomBytes(length).toString('base64url');
};

async function migrateAuth() {
  try {
    console.info('Starting authentication migration...');

    // Add new columns to users table
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN password TEXT',
      'ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0',
      'ALTER TABLE users ADD COLUMN email_verification_token TEXT',
      'ALTER TABLE users ADD COLUMN email_verification_expires INTEGER',
      'ALTER TABLE users ADD COLUMN password_reset_token TEXT',
      'ALTER TABLE users ADD COLUMN password_reset_expires INTEGER',
      'ALTER TABLE users ADD COLUMN last_password_change INTEGER',
      'ALTER TABLE users ADD COLUMN last_login_at INTEGER'
    ];

    for (const query of alterQueries) {
      try {
        await sqlite.exec(query);
        console.info(`✓ Executed: ${query}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.info(`- Column already exists: ${query}`);
        } else {
          console.error(`✗ Error executing: ${query}`, error.message);
        }
      }
    }

    // Get all existing users
    const existingUsers = await sqlite.prepare('SELECT * FROM users').all();
    console.info(`Found ${existingUsers.length} existing users`);

    // Update existing users with default passwords and verification tokens
    for (const user of existingUsers) {
      try {
        // Generate default password (email-based)
        const username = user.email ? user.email.split('@')[0] : 'User';
        const defaultPassword = `Welcome${username}123!`;
        const hashedPassword = await hashPassword(defaultPassword);
        
        // Generate verification token if email exists
        const verificationToken = user.email ? generateSecureToken() : null;
        const verificationExpires = user.email ? Math.floor(Date.now() / 1000) + (24 * 60 * 60) : null;

        // Update user with new fields
        await sqlite.prepare(`
          UPDATE users 
          SET password = ?, 
              email_verified = ?, 
              email_verification_token = ?, 
              email_verification_expires = ?,
              last_password_change = ?,
              last_login_at = ?
          WHERE id = ?
        `).run(
          hashedPassword,
          user.email ? 0 : 1, // Mark users without email as verified
          verificationToken,
          verificationExpires,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000),
          user.id
        );

        console.info(`✓ Updated user: ${user.email || user.id}`);
      } catch (error) {
        console.error(`✗ Error updating user ${user.id}:`, error.message);
      }
    }

    console.info('Authentication migration completed successfully!');
    console.info('\nDefault passwords for existing users:');
    console.info('Format: Welcome{username}123!');
    console.info('Example: Welcomejohn123! for john@example.com');
    console.info('\nUsers should change their passwords on first login.');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

// Run migration
migrateAuth().then(() => {
  console.info('Migration completed');
  process.exit(0);
}).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 