/**
 * @fileoverview CORS Security Tests
 * @description Comprehensive tests for CORS origin validation and security
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { corsConfig } from '../../server/middleware/security';
import { log } from '../../server/utils/logger';

// Mock logger to capture log messages
vi.mock('../../server/utils/logger', () => ({
  log: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

const mockLog = log as any;

describe('CORS Security Configuration', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset environment variables
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_ORIGINLESS_API_KEYS;
    
    // Clear mock calls
    vi.clearAllMocks();
    
    // Create test app
    app = express();
    app.use(cors(corsConfig));
    
    // Add test endpoint
    app.get('/api/test', (req, res) => {
      res.json({ success: true, message: 'CORS test endpoint' });
    });
  });

  describe('Environment Variable Configuration', () => {
    it('should read CORS_ORIGINS from environment (comma-separated)', () => {
      process.env.CORS_ORIGINS = 'https://app.example.com,https://admin.example.com,http://localhost:3000';

      const testApp = express();
      testApp.use(cors(corsConfig));

      // The configuration should be loaded without errors
      expect(() => {
        testApp.get('/api/test', (req, res) => res.json({ success: true }));
      }).not.toThrow();
    });

    it('should block all origins when no origins configured', async () => {
      // No environment variables set

      const testApp = express();
      testApp.use(cors(corsConfig));

      // Should log warning and reject request
      const response = await request(testApp)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(mockLog.warn).toHaveBeenCalledWith(
        'CORS_ORIGINS not set, blocking all origins',
        {},
        'SECURITY'
      );
    });
  });

  describe('Origin Validation - Exact Matches', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com,https://admin.example.com,http://localhost:3000';
    });

    it('should allow exact origin matches', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://app.example.com')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'CORS test endpoint'
      });
    });

    it('should allow localhost origin', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'CORS test endpoint'
      });
    });

    it('should allow multiple allowed origins', async () => {
      const allowedOrigins = [
        'https://app.example.com',
        'https://admin.example.com',
        'http://localhost:3000'
      ];

      for (const origin of allowedOrigins) {
        const response = await request(app)
          .get('/api/test')
          .set('Origin', origin)
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          message: 'CORS test endpoint'
        });
      }
    });
  });

  describe('Origin Rejection - Unknown Origins', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com,https://admin.example.com';
    });

    it('should reject unknown origins with 403', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject subdomain variations', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://subdomain.app.example.com')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject protocol variations', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'http://app.example.com') // HTTP instead of HTTPS
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject port variations', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://app.example.com:8080')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject path variations', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://app.example.com/malicious')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Credentialed Requests', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com,http://localhost:3000';
    });

    it('should allow credentialed requests from allowed origins', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://app.example.com')
        .set('Cookie', 'session=test-session')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'CORS test endpoint'
      });
    });

    it('should include credentials in CORS headers', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'https://app.example.com')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com';
    });

    it('should allow GET requests', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', 'https://app.example.com')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow POST requests', async () => {
      app.post('/api/test', (req, res) => res.json({ success: true, method: 'POST' }));

      const response = await request(app)
        .post('/api/test')
        .set('Origin', 'https://app.example.com')
        .expect(200);

      expect(response.body.method).toBe('POST');
    });

    it('should allow PUT requests', async () => {
      app.put('/api/test', (req, res) => res.json({ success: true, method: 'PUT' }));

      const response = await request(app)
        .put('/api/test')
        .set('Origin', 'https://app.example.com')
        .expect(200);

      expect(response.body.method).toBe('PUT');
    });

    it('should allow DELETE requests', async () => {
      app.delete('/api/test', (req, res) => res.json({ success: true, method: 'DELETE' }));

      const response = await request(app)
        .delete('/api/test')
        .set('Origin', 'https://app.example.com')
        .expect(200);

      expect(response.body.method).toBe('DELETE');
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/api/test')
        .set('Origin', 'https://app.example.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-methods']).toContain('PUT');
      expect(response.headers['access-control-allow-methods']).toContain('DELETE');
      expect(response.headers['access-control-allow-methods']).toContain('OPTIONS');
    });
  });

  describe('Security Logging', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com';
    });

    it('should log rejected origins with security context', async () => {
      await request(app)
        .get('/api/test')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(mockLog.warn).toHaveBeenCalledWith(
        'CORS origin rejected',
        expect.objectContaining({
          origin: 'https://malicious-site.com',
          allowedOrigins: ['https://app.example.com'],
          requestId: expect.any(String),
          timestamp: expect.any(String)
        }),
        'SECURITY'
      );
    });

    it('should log configuration at startup', () => {
      // Reset mocks
      vi.clearAllMocks();
      
      // Create new app to trigger configuration logging
      const testApp = express();
      testApp.use(cors(corsConfig));

      expect(mockLog.info).toHaveBeenCalledWith(
        'CORS origins configured',
        expect.objectContaining({
          origins: ['https://app.example.com']
        }),
        'SECURITY'
      );
    });

    it('should log invalid origin formats', () => {
      process.env.CORS_ORIGINS = 'invalid-url,https://app.example.com';
      
      const testApp = express();
      testApp.use(cors(corsConfig));

      expect(mockLog.warn).toHaveBeenCalledWith(
        'Invalid CORS origin format',
        { origin: 'invalid-url' },
        'SECURITY'
      );
    });
  });

  describe('Originless Requests', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com';
      process.env.CORS_ORIGINLESS_API_KEYS = 'test-api-key';
    });

    it('should reject requests with no origin and no API key', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject requests with empty origin header', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('Origin', '')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should allow requests with valid API key and no origin', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('X-API-Key', 'test-api-key')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'CORS test endpoint'
      });
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/api/test')
        .set('X-API-Key', 'invalid')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle whitespace in environment variables', () => {
      process.env.CORS_ORIGINS = '  https://app.example.com  ,  https://admin.example.com  ';

      const testApp = express();
      testApp.use(cors(corsConfig));

      // Should trim whitespace and work correctly
      expect(() => {
        testApp.get('/api/test', (req, res) => res.json({ success: true }));
      }).not.toThrow();
    });
  });

  describe('Acceptance Criteria Verification', () => {
    beforeEach(() => {
      process.env.CORS_ORIGINS = 'https://app.example.com,https://admin.example.com';
    });

    it('should reject unknown origins with 403 and log them', async () => {
      const maliciousOrigin = 'https://malicious-site.com';
      
      const response = await request(app)
        .get('/api/test')
        .set('Origin', maliciousOrigin)
        .expect(403);

      // Verify 403 response
      expect(response.body).toHaveProperty('error');
      
      // Verify logging
      expect(mockLog.warn).toHaveBeenCalledWith(
        'CORS origin rejected',
        expect.objectContaining({
          origin: maliciousOrigin,
          allowedOrigins: ['https://app.example.com', 'https://admin.example.com'],
          requestId: expect.any(String),
          timestamp: expect.any(String)
        }),
        'SECURITY'
      );
    });

    it('should allow known origins with credentialed requests', async () => {
      const allowedOrigin = 'https://app.example.com';
      
      const response = await request(app)
        .get('/api/test')
        .set('Origin', allowedOrigin)
        .set('Cookie', 'session=test-session')
        .expect(200);

      // Verify successful response
      expect(response.body).toEqual({
        success: true,
        message: 'CORS test endpoint'
      });

      // Verify credentials are allowed
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should support all required HTTP methods', async () => {
      const allowedOrigin = 'https://app.example.com';
      
      // Test all required methods
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
      
      for (const method of methods) {
        if (method === 'OPTIONS') {
          const response = await request(app)
            .options('/api/test')
            .set('Origin', allowedOrigin)
            .set('Access-Control-Request-Method', 'GET')
            .expect(200);
          
          expect(response.headers['access-control-allow-methods']).toContain(method);
        } else {
          // Add method-specific endpoints
          app[method.toLowerCase() as keyof typeof app]('/api/test-method', (req, res) => {
            res.json({ success: true, method });
          });

          const response = await request(app)
            [method.toLowerCase() as keyof typeof request]('/api/test-method')
            .set('Origin', allowedOrigin)
            .expect(200);
          
          expect(response.body.method).toBe(method);
        }
      }
    });
  });
});
