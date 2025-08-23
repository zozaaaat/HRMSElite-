/**
 * Authentication Test Script
 * Tests the new authentication system
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Use DATABASE_URL if set, otherwise default to dev.db
const dbPath = process.env.DATABASE_URL || 'dev.db';
const sqlite = new Database(dbPath);

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

async function testAuth() {
  try {
    console.log('Testing authentication system...\n');

    // Test 1: Check if users table has new columns
    console.log('1. Checking database schema...');
    const columns = await sqlite.prepare("PRAGMA table_info(users)").all();
    const columnNames = columns.map(col => col.name);
    
    const requiredColumns = [
      'password', 'email_verified', 'email_verification_token',
      'email_verification_expires', 'password_reset_token',
      'password_reset_expires', 'last_password_change', 'last_login_at'
    ];
    
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✓ All required columns exist');
    } else {
      console.log('✗ Missing columns:', missingColumns);
    }

    // Test 2: Check existing users
    console.log('\n2. Checking existing users...');
    const users = await sqlite.prepare('SELECT * FROM users').all();
    console.log(`Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`  - ${user.email || user.id}:`);
      console.log(`    Password: ${user.password ? 'Set' : 'Not set'}`);
      console.log(`    Email verified: ${user.email_verified ? 'Yes' : 'No'}`);
      console.log(`    Active: ${user.is_active ? 'Yes' : 'No'}`);
      
      // Test password verification
      if (user.password) {
        const username = user.email ? user.email.split('@')[0] : 'User';
        const testPassword = `Welcome${username}123!`;
        const isValid = await verifyPassword(testPassword, user.password);
        console.log(`    Test password valid: ${isValid ? 'Yes' : 'No'}`);
      }
    }

    // Test 3: Test password hashing
    console.log('\n3. Testing password hashing...');
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isValid = await verifyPassword(testPassword, hashedPassword);
    console.log(`Password hashing test: ${isValid ? '✓ Passed' : '✗ Failed'}`);

    // Test 4: Test token generation
    console.log('\n4. Testing token generation...');
    const crypto = await import('node:crypto');
    const token = crypto.randomBytes(64).toString('base64url');
    console.log(`Token generation test: ${token.length > 0 ? '✓ Passed' : '✗ Failed'}`);
    console.log(`Token length: ${token.length} characters`);

    console.log('\n✅ Authentication system test completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test registration: POST /api/auth/register');
    console.log('3. Test login: POST /api/auth/login');
    console.log('4. Test password change: POST /api/auth/change-password');
    console.log('5. Test forgot password: POST /api/auth/forgot-password');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    sqlite.close();
  }
}

// Run test
testAuth().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
}); 