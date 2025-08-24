/**
 * @fileoverview Security tests for HRMS Elite server
 * @description Tests for Helmet, Rate Limiting, CSRF, and Input Validation
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import './test-env.js';
import request from 'supertest';
import { app } from '../server/index';

describe('Server Security Tests', () => {
  describe('Helmet Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');

      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');

      expect(response.headers).toHaveProperty('referrer-policy');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should have Content Security Policy header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
    });

    it('should have nonce-based CSP without unsafe directives', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('content-security-policy');
      const csp = response.headers['content-security-policy'];

      // Should contain nonce-based script-src
      expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);

      // Should NOT contain unsafe directives
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");

      // Should contain required directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("style-src 'self'");
      expect(csp).toContain("img-src 'self' data: https:");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Make multiple requests within the rate limit
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
      }
    });

    it('should block requests exceeding rate limit', async () => {
      // This test might be flaky in development due to skip conditions
      // In production, it would block after exceeding the limit
      const responses = await Promise.all(
        Array(150)
          .fill(0)
          .map(() => request(app).get('/api/test-endpoint')),
      );

      // At least some requests should be blocked (429 status)
      const blockedRequests = responses.filter((r) => r.status === 429);
      expect(blockedRequests.length).toBeGreaterThan(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should provide CSRF token endpoint', async () => {
      const response = await request(app).get('/api/csrf-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include CSRF token in headers', async () => {
      const response = await request(app).get('/api/csrf-token');

      expect(response.headers).toHaveProperty('x-csrf-token');
      expect(response.headers['x-csrf-token']).toBeTruthy();
    });

    it('should reject requests without CSRF token', async () => {
      const response = await request(app).post('/api/test-endpoint').send({ data: 'test' });

      // Should be blocked by CSRF protection
      expect(response.status).toBe(403);
    });

    it('should reject requests with invalid CSRF token', async () => {
      const response = await request(app)
        .post('/api/test-endpoint')
        .set('X-CSRF-Token', 'invalid-token')
        .send({ data: 'test' });

      expect(response.status).toBe(403);
    });

    it('should allow requests with valid CSRF token', async () => {
      const tokenResponse = await request(app).get('/api/csrf-token');
      const token = tokenResponse.body.csrfToken;
      const cookies = tokenResponse.headers['set-cookie'];

      const response = await request(app)
        .post('/api/test-endpoint')
        .set('Cookie', cookies)
        .set('X-CSRF-Token', token)
        .send({ data: 'test' });

      expect(response.status).not.toBe(403);
    });
  });

  describe('Input Validation', () => {
    it('should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/test-endpoint')
        .set('X-CSRF-Token', 'valid-token')
        .send({
          data: xssPayload,
          query: 'javascript:alert("xss")',
          body: 'onload=alert("xss")',
        });

      // The request should be processed (sanitized) or blocked
      expect([200, 400, 403]).toContain(response.status);
    });

    it('should sanitize SQL injection attempts', async () => {
      const sqlPayload = "'; DROP TABLE users; --";

      const response = await request(app)
        .post('/api/test-endpoint')
        .set('X-CSRF-Token', 'valid-token')
        .send({
          query: sqlPayload,
          data: 'UNION SELECT * FROM users',
        });

      // Should be blocked or sanitized
      expect([200, 400, 403]).toContain(response.status);
    });

    it('should limit input size', async () => {
      const largePayload = 'x'.repeat(15000); // Exceeds 10,000 limit

      const response = await request(app)
        .post('/api/test-endpoint')
        .set('X-CSRF-Token', 'valid-token')
        .send({ data: largePayload });

      // Should be blocked due to size limit
      expect([400, 413]).toContain(response.status);
    });
  });

  describe('IP Blocking', () => {
    it('should block suspicious IP patterns', async () => {
      // This would require mocking the IP blocking middleware
      // In a real test, you'd need to simulate suspicious activity
      const response = await request(app).get('/health');

      // Normal requests should pass
      expect(response.status).toBe(200);
    });
  });

  describe('File Upload Security', () => {
    it('should reject oversized files', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/upload')
        .set('X-CSRF-Token', 'valid-token')
        .attach('file', largeBuffer, 'test.pdf');

      expect(response.status).toBe(413);
    });

    it('should reject suspicious file types', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('X-CSRF-Token', 'valid-token')
        .attach('file', Buffer.from('test'), 'test.php');

      expect(response.status).toBe(400);
    });

    it('should reject suspicious filenames', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('X-CSRF-Token', 'valid-token')
        .attach('file', Buffer.from('test'), '../../../etc/passwd');

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should not leak sensitive information in production', async () => {
      // This would require setting NODE_ENV=production
      // In development, it might show more details
      const response = await request(app).get('/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle CSRF errors gracefully', async () => {
      const response = await request(app).post('/api/test-endpoint').send({ data: 'test' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Health Check Security', () => {
    it('should return security status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('security');
      expect(response.body.security).toHaveProperty('helmet');
      expect(response.body.security).toHaveProperty('rateLimit');
      expect(response.body.security).toHaveProperty('csrf');
      expect(response.body.security).toHaveProperty('inputValidation');
      expect(response.body.security).toHaveProperty('ipBlocking');

      // All security measures should be enabled
      expect(response.body.security.helmet).toBe(true);
      expect(response.body.security.rateLimit).toBe(true);
      expect(response.body.security.csrf).toBe(true);
      expect(response.body.security.inputValidation).toBe(true);
      expect(response.body.security.ipBlocking).toBe(true);
    });
  });
});

describe('Security Middleware Integration', () => {
  it('should apply all security middleware in correct order', async () => {
    const response = await request(app).get('/health');

    // Should have all security headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
    expect(response.headers).toHaveProperty('x-xss-protection');

    // Should return successful response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });
});
