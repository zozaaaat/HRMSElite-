import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../server/index';
import { db } from '../../server/models/db';
import { users } from '../../shared/schema';
import { hashPassword } from '../../server/utils/password';

// Mock email utilities to avoid sending actual emails during tests
vi.mock('../../server/utils/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));

describe('Authentication API - Cookie Based', () => {
  beforeEach(async () => {
    await db.delete(users);
  });

  it('should register and set auth cookies without returning tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User'
      })
      .expect(200);

    // Ensure cookies are set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.join(';')).toContain('__Host-hrms-elite-access');

    // Ensure tokens are not present in the body
    expect(res.body).not.toHaveProperty('accessToken');
    expect(res.body).not.toHaveProperty('refreshToken');
  });

  it('should refresh tokens via cookies without returning them in the body', async () => {
    const hashed = await hashPassword('Password123!');
    await db.insert(users).values({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: hashed,
      isActive: true,
      emailVerified: true,
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' })
      .expect(200);

    const cookieHeader = loginRes.headers['set-cookie']
      .map((c: string) => c.split(';')[0])
      .join('; ');

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader)
      .expect(200);

    expect(refreshRes.headers['set-cookie']).toBeDefined();
    expect(refreshRes.body).not.toHaveProperty('accessToken');
    expect(refreshRes.body).not.toHaveProperty('refreshToken');
  });
});
