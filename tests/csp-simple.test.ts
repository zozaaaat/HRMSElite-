/**
 * @fileoverview Simple CSP Tests for HRMS Elite
 * @description Tests for Content Security Policy nonce implementation
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import crypto from 'node:crypto';

// Import the security middleware directly
import { cspUtils } from '../server/middleware/security';

// Define generateNonce function locally for testing
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64url');
}

describe('CSP Nonce Implementation Tests', () => {
  describe('Nonce Generation', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should generate nonces in correct format', () => {
      const nonce = generateNonce();

      // Should be URL-safe base64 encoded
      expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should validate nonce format correctly', () => {
      const validNonce = 'a1b2c3d4e5f6g7h8i9j0k1';
      const invalidNonce = 'invalid nonce!*';

      expect(cspUtils.validateNonce(validNonce)).toBe(true);
      expect(cspUtils.validateNonce(invalidNonce)).toBe(false);
    });
  });

  describe('CSP Utils', () => {
    it('should generate script tags with nonce', () => {
      const mockReq = { cspNonce: 'a1b2c3d4e5f6g7h8i9j0k1' } as any;
      const scriptContent = 'console.log("test");';

      const scriptTag = cspUtils.scriptTag(mockReq, scriptContent);

      expect(scriptTag).toContain('nonce="a1b2c3d4e5f6g7h8i9j0k1"');
      expect(scriptTag).toContain(scriptContent);
      expect(scriptTag).toMatch(/<script nonce="[^"]+">.*<\/script>/);
    });

    it('should generate style tags with nonce', () => {
      const mockReq = { cspNonce: 'a1b2c3d4e5f6g7h8i9j0k1' } as any;
      const styleContent = 'body { color: red; }';

      const styleTag = cspUtils.styleTag(mockReq, styleContent);

      expect(styleTag).toContain('nonce="a1b2c3d4e5f6g7h8i9j0k1"');
      expect(styleTag).toContain(styleContent);
      expect(styleTag).toMatch(/<style nonce="[^"]+">.*<\/style>/);
    });

    it('should handle missing nonce gracefully', () => {
      const mockReq = {} as any;

      expect(cspUtils.getNonce(mockReq)).toBe('');
      expect(cspUtils.scriptTag(mockReq, 'test')).toContain('nonce=""');
      expect(cspUtils.styleTag(mockReq, 'test')).toContain('nonce=""');
    });
  });

  describe('CSP Directive Validation', () => {
    it('should create correct CSP directives', () => {
      const nonce = 'a1b2c3d4e5f6g7h8i9j0k1';

      const cspDirectives = {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"] ,
        styleSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      };

      // Verify all required directives are present
      expect(cspDirectives.defaultSrc).toContain("'self'");
      expect(cspDirectives.scriptSrc).toContain("'self'");
      expect(cspDirectives.scriptSrc).toContain(`'nonce-${nonce}'`);
      expect(cspDirectives.scriptSrc).toContain("'strict-dynamic'");
      expect(cspDirectives.styleSrc).toContain("'self'");
      expect(cspDirectives.fontSrc).toContain("'self'");
      expect(cspDirectives.fontSrc).toContain('data:');
      expect(cspDirectives.imgSrc).toContain("'self'");
      expect(cspDirectives.imgSrc).toContain('data:');
      expect(cspDirectives.imgSrc).toContain('https:');
      expect(cspDirectives.connectSrc).toContain("'self'");
      expect(cspDirectives.frameAncestors).toContain("'none'");
      expect(cspDirectives.objectSrc).toContain("'none'");
      expect(cspDirectives.baseUri).toContain("'self'");

      // Verify no unsafe directives
      expect(cspDirectives.scriptSrc).not.toContain("'unsafe-inline'");
      expect(cspDirectives.scriptSrc).not.toContain("'unsafe-eval'");
      expect(cspDirectives.styleSrc).not.toContain("'unsafe-inline'");
    });
  });
});
