/**
 * @fileoverview CSP Nonce Tests for HRMS Elite
 * @description Tests for Content Security Policy nonce implementation and validation
 * @author HRMS Elite Team
 * @version 1.0.0
 */

// Setup test environment
import './test-env.js';

import request from 'supertest';
import { app } from '../server/index';

describe('CSP Nonce Implementation Tests', () => {
  describe('Nonce Generation and Validation', () => {
    it('should generate unique nonces for each request', async () => {
      const response1 = await request(app).get('/health');
      const response2 = await request(app).get('/health');

      expect(response1.headers).toHaveProperty('content-security-policy');
      expect(response2.headers).toHaveProperty('content-security-policy');

      const csp1 = response1.headers['content-security-policy'];
      const csp2 = response2.headers['content-security-policy'];

      // Extract nonces from CSP headers
      const nonce1 = csp1.match(/'nonce-([^']+)'/)?.[1];
      const nonce2 = csp2.match(/'nonce-([^']+)'/)?.[1];

      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2); // Nonces should be unique
    });

    it('should validate nonce format', async () => {
      const response = await request(app).get('/health');
      const csp = response.headers['content-security-policy'];

      const nonce = csp.match(/'nonce-([^']+)'/)?.[1];

      expect(nonce).toBeDefined();
      expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('CSP Directive Validation', () => {
    it('should have correct CSP directives without unsafe options', async () => {
      const response = await request(app).get('/health');
      const csp = response.headers['content-security-policy'];

      // Required directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self'");
      expect(csp).toContain("img-src 'self' data: https:");
      expect(csp).toContain("connect-src 'self'");
      expect(csp).toContain("frame-src 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");

      // Should NOT contain unsafe directives
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('should have nonce-based script-src directive', async () => {
      const response = await request(app).get('/health');
      const csp = response.headers['content-security-policy'];

      // Should contain nonce in script-src
      expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
    });
  });

  describe('CSP Header Consistency', () => {
    it('should maintain consistent CSP across different endpoints', async () => {
      const endpoints = ['/health', '/api/csrf-token'];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        const csp = response.headers['content-security-policy'];

        // All endpoints should have CSP
        expect(csp).toBeDefined();

        // Should not contain unsafe directives
        expect(csp).not.toContain("'unsafe-inline'");
        expect(csp).not.toContain("'unsafe-eval'");

        // Should contain required directives
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("frame-src 'none'");
        expect(csp).toContain("object-src 'none'");
      }
    });
  });

  describe('Security Headers Integration', () => {
    it('should have all required security headers', async () => {
      const response = await request(app).get('/health');

      // Required security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');

      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');

      expect(response.headers).toHaveProperty('referrer-policy');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');

      // CSP header
      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('Nonce Availability in Response', () => {
    it('should make nonce available in response locals', async () => {
      // This test would require access to response.locals
      // In a real implementation, you might want to expose this via an endpoint
      const response = await request(app).get('/health');

      // The nonce should be available in the CSP header
      const csp = response.headers['content-security-policy'];
      const nonce = csp.match(/'nonce-([^']+)'/)?.[1];

      expect(nonce).toBeDefined();
      expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });
});

describe('CSP Violation Prevention', () => {
  it('should prevent inline script execution without nonce', async () => {
    // This test verifies that the CSP is strict enough
    // In a real browser, inline scripts without nonce would be blocked
    const response = await request(app).get('/health');
    const csp = response.headers['content-security-policy'];

    // Should not allow unsafe-inline
    expect(csp).not.toContain("'unsafe-inline'");

    // Should require nonce for inline scripts
    expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
  });

  it('should prevent eval() execution', async () => {
    const response = await request(app).get('/health');
    const csp = response.headers['content-security-policy'];

    // Should not allow unsafe-eval
    expect(csp).not.toContain("'unsafe-eval'");
  });
});
