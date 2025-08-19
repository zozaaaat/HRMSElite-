/**
 * @fileoverview CI Security Guard Tests for HRMS Elite
 * @description Tests for the CI security validation system
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { validateSecurityConfiguration, validateFile, isProductionBuild, SECURITY_RULES } from '../scripts/security-ci-guard.js';

describe('CI Security Guard Tests', () => {
  const testFilesDir = path.join(__dirname, 'temp-test-files');
  
  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testFilesDir)) {
      fs.rmSync(testFilesDir, { recursive: true, force: true });
    }
  });

  describe('Production Build Detection', () => {
    it('should detect production environment from NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      expect(isProductionBuild()).toBe(true);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should detect production from BUILD_TARGET', () => {
      const originalTarget = process.env.BUILD_TARGET;
      process.env.BUILD_TARGET = 'production';
      
      expect(isProductionBuild()).toBe(true);
      
      process.env.BUILD_TARGET = originalTarget;
    });

    it('should not detect production in development', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalTarget = process.env.BUILD_TARGET;
      
      process.env.NODE_ENV = 'development';
      delete process.env.BUILD_TARGET;
      
      expect(isProductionBuild()).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
      if (originalTarget) process.env.BUILD_TARGET = originalTarget;
    });
  });

  describe('Security Violation Detection', () => {
    it('should detect secure:false violations', () => {
      const testFile = path.join(testFilesDir, 'insecure-config.json');
      const insecureConfig = JSON.stringify({
        cookie: {
          secure: false,
          httpOnly: true
        }
      }, null, 2);
      
      fs.writeFileSync(testFile, insecureConfig);
      
      const violations = validateFile(testFile);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule.includes('secure:false'))).toBe(true);
      expect(violations.some(v => v.severity === 'error')).toBe(true);
    });

    it('should detect httpOnly:false violations', () => {
      const testFile = path.join(testFilesDir, 'insecure-httponly.json');
      const insecureConfig = JSON.stringify({
        cookie: {
          secure: true,
          httpOnly: false
        }
      }, null, 2);
      
      fs.writeFileSync(testFile, insecureConfig);
      
      const violations = validateFile(testFile);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule.includes('httpOnly:false'))).toBe(true);
    });

    it('should detect unsafe CSP directives', () => {
      const testFile = path.join(testFilesDir, 'unsafe-csp.js');
      const unsafeCode = `
        const csp = {
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
        };
      `;
      
      fs.writeFileSync(testFile, unsafeCode);
      
      const violations = validateFile(testFile);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule.includes('unsafe-inline'))).toBe(true);
      expect(violations.some(v => v.rule.includes('unsafe-eval'))).toBe(true);
    });

    it('should warn about sameSite:none', () => {
      const testFile = path.join(testFilesDir, 'samesite-none.json');
      const config = JSON.stringify({
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: "none"
        }
      }, null, 2);
      
      fs.writeFileSync(testFile, config);
      
      const violations = validateFile(testFile);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.rule.includes('sameSite:none'))).toBe(true);
      expect(violations.some(v => v.severity === 'warning')).toBe(true);
    });

    it('should pass with secure configuration', () => {
      const testFile = path.join(testFilesDir, 'secure-config.json');
      const secureConfig = JSON.stringify({
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: "lax"
        }
      }, null, 2);
      
      fs.writeFileSync(testFile, secureConfig);
      
      const violations = validateFile(testFile);
      
      expect(violations.length).toBe(0);
    });
  });

  describe('Required Pattern Validation', () => {
    it('should require __Host- prefix in production session config', () => {
      const testFile = path.join(testFilesDir, 'index.ts');
      const codeWithoutHostPrefix = `
        app.use(session({
          name: 'regular-session-name'
        }));
      `;
      
      fs.writeFileSync(testFile, codeWithoutHostPrefix);
      
      const violations = validateFile(testFile);
      
      // Check if __Host- pattern is required for this file
      const requiresHostPrefix = SECURITY_RULES.requiredPatterns.some(rule => 
        rule.files.includes('index.ts')
      );
      
      if (requiresHostPrefix) {
        expect(violations.some(v => v.rule.includes('__Host-'))).toBe(true);
      }
    });

    it('should pass with __Host- prefix in session config', () => {
      const testFile = path.join(testFilesDir, 'index.ts');
      const codeWithHostPrefix = `
        app.use(session({
          name: '__Host-hrms-elite-session'
        }));
      `;
      
      fs.writeFileSync(testFile, codeWithHostPrefix);
      
      const violations = validateFile(testFile);
      
      // Should not have __Host- violations
      expect(violations.filter(v => v.rule.includes('__Host-')).length).toBe(0);
    });
  });

  describe('Security Rules Configuration', () => {
    it('should have all required forbidden patterns', () => {
      const expectedPatterns = [
        'secure:false',
        'httpOnly:false',
        'unsafe-inline',
        'unsafe-eval'
      ];
      
      expectedPatterns.forEach(pattern => {
        const hasPattern = SECURITY_RULES.forbiddenPatterns.some(rule => 
          rule.message.toLowerCase().includes(pattern.toLowerCase()) ||
          rule.pattern.source.includes(pattern)
        );
        expect(hasPattern).toBe(true);
      });
    });

    it('should have required patterns for critical files', () => {
      expect(SECURITY_RULES.requiredPatterns.length).toBeGreaterThan(0);
      
      const hasSessionPattern = SECURITY_RULES.requiredPatterns.some(rule =>
        rule.message.includes('__Host-') && rule.message.includes('session')
      );
      expect(hasSessionPattern).toBe(true);
    });

    it('should check all critical files', () => {
      const expectedFiles = [
        'security-config.json',
        'server/index.ts',
        'server/middleware/security.ts'
      ];
      
      expectedFiles.forEach(file => {
        expect(SECURITY_RULES.files).toContain(file);
      });
    });
  });

  describe('File Handling', () => {
    it('should handle missing files gracefully', () => {
      const nonExistentFile = path.join(testFilesDir, 'does-not-exist.json');
      
      const violations = validateFile(nonExistentFile);
      
      // Should return empty array for missing files
      expect(violations).toEqual([]);
    });

    it('should handle file read errors', () => {
      // Create a directory instead of a file to cause read error
      const invalidFile = path.join(testFilesDir, 'invalid-file');
      fs.mkdirSync(invalidFile);
      
      const violations = validateFile(invalidFile);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].rule).toContain('Failed to read file');
      expect(violations[0].severity).toBe('error');
    });
  });
});
