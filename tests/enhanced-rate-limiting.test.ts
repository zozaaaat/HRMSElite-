/**
 * @fileoverview Enhanced Rate Limiting Tests
 * @description Tests for the enhanced rate limiting middleware with per-IP and per-user limits
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import request from 'supertest';
import express from 'express';
import { createEnhancedRateLimiter } from '../server/middleware/security';

// Mock Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware
const mockAuth = (req: any, res: any, next: any) => {
  // Simulate authenticated user
  if (req.headers['x-test-user-id']) {
    req.user = {
      id: req.headers['x-test-user-id'],
      role: 'user',
      email: 'test@example.com'
    };
  }
  next();
};

// Apply enhanced rate limiting
const enhancedLimiter = createEnhancedRateLimiter('general');
app.use('/api/test', mockAuth, enhancedLimiter);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Success',
    userId: req.user?.id || 'anonymous',
    ip: req.ip
  });
});

describe('Enhanced Rate Limiting', () => {
  const testIP = '192.168.1.1';
  const testUserId = 'user123';

  beforeEach(() => {
    // Reset rate limit counters (in a real implementation, this would clear Redis/memory store)
    jest.clearAllMocks();
  });

  describe('IP-based Rate Limiting', () => {
    test('should limit requests by IP address', async () => {
      // Make 101 requests (exceeding the 100 IP limit)
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body).toMatchObject({
        error: 'تم تجاوز حد الطلبات',
        code: 'RATE_LIMIT_IP_GENERAL',
        limitType: 'IP'
      });
    });

    test('should allow requests within IP limit', async () => {
      // Make 50 requests (within the 100 IP limit)
      const requests = Array(50).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
      );

      const responses = await Promise.all(requests);
      const successful = responses.filter(r => r.status === 200);

      expect(successful.length).toBe(50);
    });
  });

  describe('User-based Rate Limiting', () => {
    test('should limit authenticated user requests', async () => {
      // Make 201 requests (exceeding the 200 user limit)
      const requests = Array(201).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          .set('X-Test-User-Id', testUserId)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body).toMatchObject({
        error: 'تم تجاوز حد الطلبات',
        code: 'RATE_LIMIT_USER_GENERAL',
        limitType: 'USER'
      });
    });

    test('should allow authenticated user requests within limit', async () => {
      // Make 100 requests (within the 200 user limit)
      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          .set('X-Test-User-Id', testUserId)
      );

      const responses = await Promise.all(requests);
      const successful = responses.filter(r => r.status === 200);

      expect(successful.length).toBe(100);
    });
  });

  describe('Dual Rate Limiting', () => {
    test('should apply both IP and user limits independently', async () => {
      // Test scenario: User hits IP limit before user limit
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          .set('X-Test-User-Id', testUserId)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      // Should be rate limited by IP (100 limit) before hitting user limit (200)
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.limitType).toBe('IP');
    });

    test('should handle different users from same IP', async () => {
      const user1 = 'user1';
      const user2 = 'user2';

      // User 1 makes 50 requests
      const user1Requests = Array(50).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          .set('X-Test-User-Id', user1)
      );

      // User 2 makes 50 requests
      const user2Requests = Array(50).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          .set('X-Test-User-Id', user2)
      );

      const user1Responses = await Promise.all(user1Requests);
      const user2Responses = await Promise.all(user2Requests);

      // Both users should succeed (50 requests each, within both IP and user limits)
      expect(user1Responses.every(r => r.status === 200)).toBe(true);
      expect(user2Responses.every(r => r.status === 200)).toBe(true);
    });
  });

  describe('Anonymous Users', () => {
    test('should only apply IP limits to anonymous users', async () => {
      // Anonymous user makes 101 requests (exceeding IP limit)
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
          // No X-Test-User-Id header = anonymous user
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.limitType).toBe('IP');
    });
  });

  describe('Response Headers', () => {
    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('X-Forwarded-For', testIP)
        .set('X-Test-User-Id', testUserId);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Error Messages', () => {
    test('should return Arabic error messages', async () => {
      // Exceed rate limit
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .get('/api/test')
          .set('X-Forwarded-For', testIP)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.find(r => r.status === 429);

      expect(rateLimited?.body).toMatchObject({
        error: 'تم تجاوز حد الطلبات',
        message: 'يرجى المحاولة مرة أخرى بعد فترة',
        retryAfter: '15 دقيقة'
      });
    });
  });

  describe('Configuration Validation', () => {
    test('should handle missing user ID gracefully', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('X-Forwarded-For', testIP);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe('anonymous');
    });

    test('should handle missing IP address gracefully', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('X-Test-User-Id', testUserId);

      expect(response.status).toBe(200);
    });
  });
});

describe('Rate Limiting Configuration', () => {
  test('should support different rate limit types', () => {
    const loginLimiter = createEnhancedRateLimiter('login');
    const documentLimiter = createEnhancedRateLimiter('document');
    const searchLimiter = createEnhancedRateLimiter('search');

    expect(loginLimiter).toBeDefined();
    expect(documentLimiter).toBeDefined();
    expect(searchLimiter).toBeDefined();
  });
});

describe('Performance Tests', () => {
  test('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 50;
    const startTime = Date.now();

    const requests = Array(concurrentRequests).fill(null).map(() =>
      request(app)
        .get('/api/test')
        .set('X-Forwarded-For', testIP)
        .set('X-Test-User-Id', testUserId)
    );

    const responses = await Promise.all(requests);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (adjust based on your requirements)
    expect(duration).toBeLessThan(5000); // 5 seconds
    expect(responses.every(r => r.status === 200)).toBe(true);
  });
});

export {};
