import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app, startServer } from '../../server/index';
import type { Server } from 'http';
import { db } from '../../server/models/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

let server: Server;

beforeAll(async () => {
  server = await startServer(0);
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(err => (err ? reject(err) : resolve()));
  });
});

// Avoid `any`: allow arbitrary fields while keeping `id` typed
type TestUser = { id?: string } & Record<string, unknown>;

// Define response types for better type safety
interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

interface ErrorResponse {
  error: string;
}

interface MessageResponse {
  message: string;
}

interface UserResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

describe('Authentication API', () => {
  let testUser: TestUser;
  let authToken: string;

  beforeEach(async () => {
    // Clean up database
    await db.delete(users);

    // Create test user
    testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'employee',
      company_id: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert test user (cast to the insert type to satisfy TypeScript without using `any`)
    const [insertedUser] = await db
      .insert(users)
      .values(testUser as unknown as typeof users.$inferInsert)
      .returning();
    testUser.id = insertedUser.id;
  });

  afterEach(async () => {
    // Clean up
    await db.delete(users);
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        })
        .expect(200);

      const responseBody = response.body as LoginResponse;
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toHaveProperty('id');
      expect(responseBody.user).toHaveProperty('username', 'testuser');
      expect(responseBody.user).toHaveProperty('email', 'test@example.com');
      expect(responseBody.user).toHaveProperty('role', 'employee');
      expect(responseBody.user).not.toHaveProperty('password');

      authToken = responseBody.token;
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'TestPassword123!'
        })
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'WrongPassword123!'
        })
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid credentials');
    });

    it('should reject login with missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'TestPassword123!'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Username and password are required');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Username and password are required');
    });

    it('should reject login for inactive user', async () => {
      // Deactivate user
      await db.update(users)
        .set({ is_active: false } as unknown as Partial<typeof users.$inferInsert>)
        .where(eq(users.id, testUser.id as string));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        })
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Account is inactive');
    });

    it('should handle server errors gracefully', async () => {
      // Mock database error
      const originalInsert = db.insert;
      db.insert = vi.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        })
        .expect(500);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Internal server error');

      // Restore original function
      db.insert = originalInsert;
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });

      const loginBody = loginResponse.body as LoginResponse;
      authToken = loginBody.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseBody = response.body as MessageResponse;
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toContain('Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('No token provided');
    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid token');
    });

    it('should reject logout with expired token', async () => {
      // Create expired token (this would require JWT secret and proper token creation)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTYxNjE2MjQwMCwiZXhwIjoxNjE2MTYyNDAwfQ.invalid';

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });

      const loginBody = loginResponse.body as LoginResponse;
      authToken = loginBody.token;
    });

    it('should return current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseBody = response.body as UserResponse;
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user).toHaveProperty('id', testUser.id);
      expect(responseBody.user).toHaveProperty('username', 'testuser');
      expect(responseBody.user).toHaveProperty('email', 'test@example.com');
      expect(responseBody.user).toHaveProperty('role', 'employee');
      expect(responseBody.user).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid token');
    });

    it('should return 404 for non-existent user', async () => {
      // Delete user but keep token
      await db.delete(users).where(eq(users.id, testUser.id));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('User not found');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });

      const loginBody = loginResponse.body as LoginResponse;
      authToken = loginBody.token;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const responseBody = response.body as LoginResponse;
      expect(responseBody).toHaveProperty('token');
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.token).not.toBe(authToken); // New token should be different
    });

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('No token provided');
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/change-password', () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });

      const loginBody = loginResponse.body as LoginResponse;
      authToken = loginBody.token;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      const responseBody = response.body as MessageResponse;
      expect(responseBody).toHaveProperty('message');
      expect(responseBody.message).toContain('Password changed successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'NewPassword123!'
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      expect(loginBody).toHaveProperty('token');
    });

    it('should reject change password with wrong current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Current password is incorrect');
    });

    it('should reject change password without current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Current password is required');
    });

    it('should reject change password without new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('New password is required');
    });

    it('should reject change password with weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'weak'
        })
        .expect(400);

      const responseBody = response.body as ErrorResponse;
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Password must be at least 8 characters');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit login attempts', async () => {
      const attempts = 6; // Assuming rate limit is 5 per minute

      for (let i = 0; i < attempts; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'testuser',
            password: 'WrongPassword123!'
          });

        if (i < 5) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429); // Too Many Requests
          const responseBody = response.body as ErrorResponse;
          expect(responseBody).toHaveProperty('error');
          expect(responseBody.error).toContain('Too many requests');
        }
      }
    });

    it('should limit password change attempts', async () => {
      const attempts = 6;

      for (let i = 0; i < attempts; i++) {
        const response = await request(app)
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            currentPassword: 'WrongPassword123!',
            newPassword: 'NewPassword123!'
          });

        if (i < 5) {
          expect(response.status).toBe(400);
        } else {
          expect(response.status).toBe(429);
          const responseBody = response.body as ErrorResponse;
          expect(responseBody).toHaveProperty('error');
          expect(responseBody.error).toContain('Too many requests');
        }
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'TestPassword123!'
        });

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });
}); 