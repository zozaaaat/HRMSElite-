#!/usr/bin/env node

/**
 * @fileoverview CI Security Guard for HRMS Elite
 * @description Prevents insecure cookie configurations from shipping to production
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Security validation rules for production builds
 */
const SECURITY_RULES = {
  // Files to check for insecure configurations
  files: [
    'security-config.json',
    'server/index.ts',
    'server/middleware/security.ts',
    'server/middleware/security-config.ts'
  ],
  
  // Patterns that should NOT exist in production code
  forbiddenPatterns: [
    {
      pattern: /secure:\s*false/gi,
      message: 'SECURITY VIOLATION: secure:false found in production build',
      severity: 'error'
    },
    {
      pattern: /"secure":\s*false/gi,
      message: 'SECURITY VIOLATION: "secure":false found in production build',
      severity: 'error'
    },
    {
      pattern: /httpOnly:\s*false/gi,
      message: 'SECURITY VIOLATION: httpOnly:false found in production build',
      severity: 'error'
    },
    {
      pattern: /"httpOnly":\s*false/gi,
      message: 'SECURITY VIOLATION: "httpOnly":false found in production build',
      severity: 'error'
    },
    {
      pattern: /sameSite:\s*['"]none['"]/gi,
      message: 'SECURITY WARNING: sameSite:none found - consider using "lax" or "strict"',
      severity: 'warning'
    },
    {
      pattern: /'unsafe-inline'/gi,
      message: 'SECURITY VIOLATION: unsafe-inline CSP directive found in production build',
      severity: 'error'
    },
    {
      pattern: /'unsafe-eval'/gi,
      message: 'SECURITY VIOLATION: unsafe-eval CSP directive found in production build',
      severity: 'error'
    }
  ],

  // Required patterns that MUST exist in production
  requiredPatterns: [
    {
      pattern: /__Host-.*session/gi,
      files: ['server/index.ts'],
      message: 'SECURITY REQUIREMENT: __Host- prefix required for session cookies in production',
      severity: 'error'
    }
  ]
};

/**
 * Check if we're in a production build context
 */
function isProductionBuild() {
  const nodeEnv = process.env.NODE_ENV;
  const buildTarget = process.env.BUILD_TARGET;
  const ciEnv = process.env.CI;
  
  return nodeEnv === 'production' || 
         buildTarget === 'production' || 
         (ciEnv && process.argv.includes('--production'));
}

/**
 * Read and validate a file for security violations
 */
function validateFile(filePath) {
  const violations = [];
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath} (skipping)`);
    return violations;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check forbidden patterns
    SECURITY_RULES.forbiddenPatterns.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        violations.push({
          file: filePath,
          rule: rule.message,
          severity: rule.severity,
          matches: matches,
          line: getLineNumber(content, rule.pattern)
        });
      }
    });

    // Check required patterns
    SECURITY_RULES.requiredPatterns.forEach(rule => {
      if (rule.files.includes(path.basename(filePath))) {
        const matches = content.match(rule.pattern);
        if (!matches) {
          violations.push({
            file: filePath,
            rule: rule.message,
            severity: rule.severity,
            matches: null,
            line: null
          });
        }
      }
    });

  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error.message);
    violations.push({
      file: filePath,
      rule: `Failed to read file: ${error.message}`,
      severity: 'error',
      matches: null,
      line: null
    });
  }

  return violations;
}

/**
 * Get line number for a pattern match
 */
function getLineNumber(content, pattern) {
  try {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
  } catch (error) {
    // Ignore errors in line number detection
  }
  return null;
}

/**
 * Main security validation function
 */
function validateSecurityConfiguration() {
  console.log('🔒 Running Security CI Guard...\n');
  
  if (!isProductionBuild()) {
    console.log('ℹ️  Not a production build - skipping security validation');
    return 0;
  }

  console.log('🏭 Production build detected - running security validation\n');

  let totalViolations = 0;
  let errorCount = 0;
  let warningCount = 0;

  // Check each file for security violations
  SECURITY_RULES.files.forEach(file => {
    console.log(`📁 Checking: ${file}`);
    const violations = validateFile(file);
    
    if (violations.length === 0) {
      console.log(`✅ ${file} - No violations found`);
    } else {
      violations.forEach(violation => {
        totalViolations++;
        
        if (violation.severity === 'error') {
          errorCount++;
          console.log(`❌ ERROR: ${violation.rule}`);
        } else if (violation.severity === 'warning') {
          warningCount++;
          console.log(`⚠️  WARNING: ${violation.rule}`);
        }
        
        console.log(`   📍 File: ${violation.file}`);
        if (violation.line) {
          console.log(`   📏 Line: ${violation.line}`);
        }
        if (violation.matches && violation.matches.length > 0) {
          console.log(`   🔍 Found: ${violation.matches.join(', ')}`);
        }
        console.log('');
      });
    }
  });

  // Summary
  console.log('\n📊 Security Validation Summary:');
  console.log(`   Total violations: ${totalViolations}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Warnings: ${warningCount}`);

  if (errorCount > 0) {
    console.log('\n❌ SECURITY VALIDATION FAILED');
    console.log('   Production build blocked due to security violations.');
    console.log('   Please fix all security errors before deploying to production.');
    return 1;
  } else if (warningCount > 0) {
    console.log('\n⚠️  SECURITY WARNINGS DETECTED');
    console.log('   Please review security warnings before deploying to production.');
    return 0;
  } else {
    console.log('\n✅ SECURITY VALIDATION PASSED');
    console.log('   No security violations detected. Safe to deploy to production.');
    return 0;
  }
}

/**
 * CLI interface
 */
const isMainModule = import.meta.url.endsWith(process.argv[1]) || 
                     import.meta.url === `file://${process.argv[1]}` ||
                     process.argv[1].endsWith('security-ci-guard.js');

if (isMainModule) {
  console.log('🔒 Starting Security CI Guard...');
  const exitCode = validateSecurityConfiguration();
  process.exit(exitCode);
}

export {
  validateSecurityConfiguration,
  isProductionBuild,
  validateFile,
  SECURITY_RULES
};
