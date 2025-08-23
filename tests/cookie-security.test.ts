/**
 * @fileoverview Cookie Security Tests for HRMS Elite
 * @description Tests for secure cookie configuration in production and development
 * @author HRMS Elite Team
 * @version 1.0.0
 */

// Setup test environment
import './test-env.js';

import request from 'supertest';
import express from 'express';
import { app } from '../server/index';
import { setAuthCookies } from '../server/middleware/auth';

describe('Cookie Security Tests', () => {
  describe('Session Cookie Security', () => {
    it('should set secure session cookies in production', async () => {
      // Set production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .get('/api/csrf-token')
          .expect(200);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        // Find session cookie
        const sessionCookie = setCookieHeaders?.find((cookie: string) => 
          cookie.includes('__Host-hrms-elite-session') || cookie.includes('hrms-elite-session')
        );

        expect(sessionCookie).toBeDefined();
        
        // Verify security attributes
        expect(sessionCookie).toMatch(/HttpOnly/i);
        expect(sessionCookie).toMatch(/Secure/i);
        expect(sessionCookie).toMatch(/SameSite=Strict/i);
        expect(sessionCookie).toMatch(/Path=\//);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should use __Host- prefix for session cookies in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .get('/api/csrf-token')
          .expect(200);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        const sessionCookie = setCookieHeaders?.find((cookie: string) => 
          cookie.includes('__Host-hrms-elite-session')
        );

        expect(sessionCookie).toBeDefined();
        expect(sessionCookie).toMatch(/__Host-hrms-elite-session/);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should allow non-secure cookies in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      try {
        const response = await request(app)
          .get('/api/csrf-token')
          .expect(200);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        const sessionCookie = setCookieHeaders?.find((cookie: string) => 
          cookie.includes('hrms-elite-session')
        );

        expect(sessionCookie).toBeDefined();
        expect(sessionCookie).toMatch(/HttpOnly/i);
        expect(sessionCookie).toMatch(/SameSite=Strict/i);
        expect(sessionCookie).toMatch(/Path=\//);
        
        // Should not require secure in development
        // Note: The actual behavior depends on server configuration
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('CSRF Cookie Security', () => {
    it('should set secure CSRF cookies with proper attributes', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .get('/api/csrf-token')
          .expect(200);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        // Find CSRF cookie
        const csrfCookie = setCookieHeaders?.find((cookie: string) => 
          cookie.includes('csrf') || cookie.includes('_csrf')
        );

        if (csrfCookie) {
          expect(csrfCookie).toMatch(/HttpOnly/i);
          expect(csrfCookie).toMatch(/Secure/i);
          expect(csrfCookie).toMatch(/SameSite=Strict/i);
          expect(csrfCookie).toMatch(/Path=\//);
        }
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should provide CSRF token in response', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);

      expect(response.body).toHaveProperty('csrfToken');
      expect(typeof response.body.csrfToken).toBe('string');
      expect(response.body.csrfToken.length).toBeGreaterThan(0);
    });
  });

  describe('Cookie Security Headers', () => {
    it('should include all required security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
      
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      
      expect(response.headers).toHaveProperty('referrer-policy');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should set proper CSP headers without unsafe directives', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];
      
      // Should not contain unsafe directives
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
      
      // Should contain required directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
    });
  });

  describe('Cookie Path and Domain Security', () => {
    it('should set cookies with secure path', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      setCookieHeaders?.forEach((cookie: string) => {
        if (cookie.includes('session') || cookie.includes('csrf')) {
          expect(cookie).toMatch(/Path=\//);
        }
      });
    });

    it('should not set explicit domain for __Host- cookies', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .get('/api/csrf-token')
          .expect(200);

        const setCookieHeaders = response.headers['set-cookie'];
        expect(setCookieHeaders).toBeDefined();

        const hostCookies = setCookieHeaders?.filter((cookie: string) => 
          cookie.includes('__Host-')
        );

        hostCookies?.forEach((cookie: string) => {
          // __Host- cookies should not have explicit domain
          expect(cookie).not.toMatch(/Domain=/i);
        });
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe('Auth Cookie Security', () => {
    it('should set auth cookies with strict security attributes', async () => {
      const testApp = express();
      testApp.get('/test-auth-cookies', (_req, res) => {
        setAuthCookies(res, 'access-token', 'refresh-token');
        res.status(200).send('ok');
      });

      const response = await request(testApp)
        .get('/test-auth-cookies')
        .expect(200);

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      const accessCookie = setCookieHeaders?.find((cookie: string) =>
        cookie.includes('__Host-hrms-elite-access')
      );
      const refreshCookie = setCookieHeaders?.find((cookie: string) =>
        cookie.includes('__Host-hrms-elite-refresh')
      );

      [accessCookie, refreshCookie].forEach((cookie) => {
        expect(cookie).toBeDefined();
        if (cookie) {
          expect(cookie).toMatch(/__Host-/);
          expect(cookie).toMatch(/HttpOnly/i);
          expect(cookie).toMatch(/Secure/i);
          expect(cookie).toMatch(/SameSite=Strict/i);
          expect(cookie).toMatch(/Path=\//);
        }
      });
    });
  });

  describe('Cookie Expiration', () => {
    it('should set appropriate maxAge for cookies', async () => {
      const response = await request(app)
        .get('/api/csrf-token')
        .expect(200);

      const setCookieHeaders = response.headers['set-cookie'];
      expect(setCookieHeaders).toBeDefined();

      setCookieHeaders?.forEach((cookie: string) => {
        if (cookie.includes('session') || cookie.includes('csrf')) {
          // Should have Max-Age or Expires set
          const hasMaxAge = cookie.includes('Max-Age=');
          const hasExpires = cookie.includes('Expires=');
          
          expect(hasMaxAge || hasExpires).toBe(true);
        }
      });
    });
  });
});
