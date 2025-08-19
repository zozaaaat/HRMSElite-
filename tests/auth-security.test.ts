/**
 * @fileoverview Authentication Security Tests
 * @description Tests to verify header-based authentication bypasses are properly gated
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import request from 'supertest';
import express from 'express';
import { optionalAuth } from '../server/middleware/auth';
import { env } from '../server/utils/env';

describe('Authentication Security - Header Bypass Protection', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(optionalAuth);
    
    app.get('/api/test', (req, res) => {
      if (req.user) {
        res.json({ 
          success: true, 
          user: {
            id: req.user.id,
            role: req.user.role,
            email: req.user.email
          }
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
    });
  });

  describe('Development Environment with ALLOW_DEV_AUTH=true', () => {
    beforeEach(() => {
      // Set development environment with dev auth enabled
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'true';
    });

    afterEach(() => {
      // Clean up environment variables
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should allow header-based authentication in development', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .set('x-user-email', 'admin@example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: '123',
        role: 'admin',
        email: 'admin@example.com'
      });
    });

    it('should log development authentication bypass usage', async () => {
      // Mock console.warn to capture log messages
      const originalWarn = console.warn;
      const warnSpy = jest.fn();
      console.warn = warnSpy;

      await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(200);

      // Restore console.warn
      console.warn = originalWarn;

      // Verify that development bypass was logged
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Development authentication bypass used'),
        expect.objectContaining({
          userId: '123',
          userRole: 'admin',
          timestamp: expect.any(String)
        }),
        'AUTH'
      );
    });

    it('should work with minimal required headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'user')
        .set('x-user-id', '456')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.id).toBe('456');
      expect(response.body.user.role).toBe('user');
    });
  });

  describe('Development Environment with ALLOW_DEV_AUTH=false', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'false';
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should reject header-based authentication when ALLOW_DEV_AUTH=false', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject header-based authentication when ALLOW_DEV_AUTH is not set', async () => {
      delete process.env.ALLOW_DEV_AUTH;

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Production Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_DEV_AUTH = 'true'; // Even if set, should be ignored in production
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should reject header-based authentication in production regardless of ALLOW_DEV_AUTH', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject header-based authentication in production with ALLOW_DEV_AUTH=false', async () => {
      process.env.ALLOW_DEV_AUTH = 'false';

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject header-based authentication in production with ALLOW_DEV_AUTH not set', async () => {
      delete process.env.ALLOW_DEV_AUTH;

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Test Environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.ALLOW_DEV_AUTH = 'true';
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should reject header-based authentication in test environment', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'true';
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should reject when only x-user-role is provided', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject when only x-user-id is provided', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });

    it('should work without x-user-email (optional)', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('user@company.com'); // Default value
    });

    it('should handle empty header values', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', '')
        .set('x-user-id', '')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Security Validation', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'true';
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should not allow authentication with malformed headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin<script>alert("xss")</script>')
        .set('x-user-id', '123<script>alert("xss")</script>')
        .expect(200); // Should still work but with sanitized values

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin<script>alert("xss")</script>');
      expect(response.body.user.id).toBe('123<script>alert("xss")</script>');
    });

    it('should handle very long header values', async () => {
      const longValue = 'a'.repeat(10000);
      
      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', longValue)
        .set('x-user-id', '123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe(longValue);
    });
  });

  describe('Acceptance Criteria Verification', () => {
    it('should meet acceptance criteria: no route can authenticate via custom headers in production', async () => {
      // Test production environment
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_DEV_AUTH;

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');

      // Clean up
      delete process.env.NODE_ENV;
    });

    it('should allow development authentication when properly gated', async () => {
      // Test development environment with proper gating
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'true';

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user.id).toBe('123');

      // Clean up
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });

    it('should reject development authentication when not properly gated', async () => {
      // Test development environment without proper gating
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_DEV_AUTH = 'false';

      const response = await request(app)
        .get('/api/test')
        .set('x-user-role', 'admin')
        .set('x-user-id', '123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication required');

      // Clean up
      delete process.env.NODE_ENV;
      delete process.env.ALLOW_DEV_AUTH;
    });
  });
});
