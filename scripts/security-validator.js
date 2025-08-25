#!/usr/bin/env node

/**
 * Security Validator for HRMS Elite
 * Comprehensive security checks for CI/CD pipeline
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

class SecurityValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0,
        total: 0
      }
    };
  }

  async runCheck(name, checkFunction) {
    console.log(`🔍 Running ${name}...`);
    try {
      const result = await checkFunction();
      this.results.checks[name] = {
        status: 'passed',
        details: result,
        timestamp: new Date().toISOString()
      };
      this.results.summary.passed++;
      console.log(`✅ ${name} passed`);
      return true;
    } catch (error) {
      this.results.checks[name] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.results.summary.failed++;
      console.log(`❌ ${name} failed: ${error.message}`);
      return false;
    }
  }

  async runWarningCheck(name, checkFunction) {
    console.log(`⚠️  Running ${name}...`);
    try {
      const result = await checkFunction();
      this.results.checks[name] = {
        status: 'warning',
        details: result,
        timestamp: new Date().toISOString()
      };
      this.results.summary.warnings++;
      console.log(`⚠️  ${name} warning`);
      return true;
    } catch (error) {
      this.results.checks[name] = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      this.results.summary.failed++;
      console.log(`❌ ${name} failed: ${error.message}`);
      return false;
    }
  }

  async npmAudit() {
    return new Promise((resolve, reject) => {
      try {
        const output = execSync('npm audit --audit-level=moderate --json', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const auditData = JSON.parse(output);
        const vulnerabilities = auditData.metadata?.vulnerabilities || {};
        
        const high = vulnerabilities.high || 0;
        const critical = vulnerabilities.critical || 0;
        
        if (high > 0 || critical > 0) {
          reject(new Error(`Found ${high} high and ${critical} critical vulnerabilities`));
        }
        
        resolve({
          vulnerabilities,
          total: Object.values(vulnerabilities).reduce((a, b) => a + b, 0)
        });
      } catch (error) {
        if (error.status === 1) {
          // npm audit found vulnerabilities
          reject(new Error('High/Critical vulnerabilities found'));
        } else {
          reject(error);
        }
      }
    });
  }

  async osvScanner() {
    return new Promise((resolve, reject) => {
      try {
        // Check if OSV Scanner is installed
        execSync('osv-scanner --version', { stdio: 'ignore' });
        
        const output = execSync('osv-scanner --lockfile=package-lock.json --json', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const osvData = JSON.parse(output);
        const highVulns = osvData.results?.filter(r => 
          r.vulnerabilities?.some(v => 
            v.severity === 'HIGH' || v.severity === 'CRITICAL'
          )
        ) || [];
        
        if (highVulns.length > 0) {
          reject(new Error(`Found ${highVulns.length} high/critical vulnerabilities`));
        }
        
        resolve({
          results: osvData.results?.length || 0,
          highVulnerabilities: highVulns.length
        });
      } catch (error) {
        if (error.status === 1) {
          reject(new Error('High/Critical vulnerabilities found by OSV Scanner'));
        } else {
          reject(new Error(`OSV Scanner not available: ${error.message}`));
        }
      }
    });
  }

  async semgrepScan() {
    return new Promise((resolve, reject) => {
      try {
        // Check if Semgrep is installed
        execSync('semgrep --version', { stdio: 'ignore' });
        
        const output = execSync('semgrep --config=auto --json --quiet', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const semgrepData = JSON.parse(output);
        const securityFindings = semgrepData.results?.filter(r => 
          r.extra?.severity === 'ERROR' || 
          r.extra?.metadata?.category === 'security'
        ) || [];
        
        if (securityFindings.length > 0) {
          reject(new Error(`Found ${securityFindings.length} security violations`));
        }
        
        resolve({
          totalFindings: semgrepData.results?.length || 0,
          securityFindings: securityFindings.length
        });
      } catch (error) {
        if (error.status === 1) {
          reject(new Error('Security violations found by Semgrep'));
        } else {
          reject(new Error(`Semgrep not available: ${error.message}`));
        }
      }
    });
  }

  async typeCheck() {
    return new Promise((resolve, reject) => {
      try {
        execSync('npm run type-check:strict', { stdio: 'pipe' });
        resolve({ status: 'passed' });
      } catch (error) {
        reject(new Error('TypeScript type checking failed'));
      }
    });
  }

  async lintCheck() {
    return new Promise((resolve, reject) => {
      try {
        execSync('npm run lint:strict', { stdio: 'pipe' });
        resolve({ status: 'passed' });
      } catch (error) {
        reject(new Error('ESLint checking failed'));
      }
    });
  }

  async testSuite() {
    return new Promise((resolve, reject) => {
      try {
        execSync('npm run test:comprehensive', { stdio: 'pipe' });
        resolve({ status: 'passed' });
      } catch (error) {
        reject(new Error('Test suite failed'));
      }
    });
  }

  async sbomValidation() {
    return new Promise((resolve, reject) => {
      try {
        const sbomXml = join(process.cwd(), 'sbom.xml');
        const sbomJson = join(process.cwd(), 'sbom.json');
        
        if (!existsSync(sbomXml) || !existsSync(sbomJson)) {
          reject(new Error('SBOM files not found'));
        }
        
        // Basic validation
        const xmlContent = readFileSync(sbomXml, 'utf8');
        const jsonContent = readFileSync(sbomJson, 'utf8');
        
        if (!xmlContent.includes('<?xml version="1.0"')) {
          reject(new Error('Invalid XML SBOM format'));
        }
        
        const jsonData = JSON.parse(jsonContent);
        if (!jsonData.bomFormat || !jsonData.components) {
          reject(new Error('Invalid JSON SBOM format'));
        }
        
        resolve({
          xmlValid: true,
          jsonValid: true,
          componentCount: jsonData.components.length
        });
      } catch (error) {
        reject(new Error(`SBOM validation failed: ${error.message}`));
      }
    });
  }

  async secretsScan() {
    return new Promise((resolve, reject) => {
      try {
        // Check for hardcoded secrets
        const patterns = [
          'password.*=.*["\'][^"\']{8,}["\']',
          'secret.*=.*["\'][^"\']{8,}["\']',
          'key.*=.*["\'][^"\']{8,}["\']',
          'token.*=.*["\'][^"\']{8,}["\']'
        ];
        
        let foundSecrets = [];
        
        patterns.forEach(pattern => {
          try {
            const output = execSync(`grep -r "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | grep -v test | grep -v mock`, { 
              encoding: 'utf8',
              stdio: 'pipe'
            });
            
            if (output.trim()) {
              foundSecrets.push(...output.trim().split('\n'));
            }
          } catch (error) {
            // grep returns non-zero when no matches found
          }
        });
        
        if (foundSecrets.length > 0) {
          reject(new Error(`Found ${foundSecrets.length} potential hardcoded secrets`));
        }
        
        resolve({ secretsFound: 0 });
      } catch (error) {
        reject(new Error(`Secrets scan failed: ${error.message}`));
      }
    });
  }

  async dependencyCheck() {
    return new Promise((resolve, reject) => {
      try {
        const packageJson = readFileSync('package.json', 'utf8');
        const packageData = JSON.parse(packageJson);
        
        const dependencies = {
          ...packageData.dependencies,
          ...packageData.devDependencies
        };
        
        // Check for known vulnerable packages
        const vulnerablePackages = [
          'lodash', // if version < 4.17.21
          'axios', // if version < 1.6.0
        ];
        
        const issues = [];
        vulnerablePackages.forEach(pkg => {
          if (dependencies[pkg]) {
            issues.push(`Potentially vulnerable package: ${pkg}@${dependencies[pkg]}`);
          }
        });
        
        if (issues.length > 0) {
          reject(new Error(`Dependency issues: ${issues.join(', ')}`));
        }
        
        resolve({
          totalDependencies: Object.keys(dependencies).length,
          issuesFound: 0
        });
      } catch (error) {
        reject(new Error(`Dependency check failed: ${error.message}`));
      }
    });
  }

  async generateReport() {
    this.results.summary.total = 
      this.results.summary.passed + 
      this.results.summary.failed + 
      this.results.summary.warnings;
    
    const reportPath = join(process.cwd(), 'security-validation-report.json');
    writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Security Validation Summary:');
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.results.summary.warnings}`);
    console.log(`📋 Total: ${this.results.summary.total}`);
    
    if (this.results.summary.failed > 0) {
      console.log('\n🚨 Security validation failed!');
      console.log('Failed checks:');
      Object.entries(this.results.checks)
        .filter(([_, check]) => check.status === 'failed')
        .forEach(([name, check]) => {
          console.log(`  - ${name}: ${check.error}`);
        });
    } else {
      console.log('\n🎉 All security checks passed!');
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return this.results;
  }

  async runAllChecks() {
    console.log('🔒 Starting comprehensive security validation...\n');
    
    // Critical security checks (must pass)
    await this.runCheck('npm-audit', () => this.npmAudit());
    await this.runCheck('osv-scanner', () => this.osvScanner());
    await this.runCheck('semgrep-sast', () => this.semgrepScan());
    await this.runCheck('secrets-scan', () => this.secretsScan());
    
    // Code quality checks (must pass)
    await this.runCheck('type-check', () => this.typeCheck());
    await this.runCheck('lint-check', () => this.lintCheck());
    await this.runCheck('test-suite', () => this.testSuite());
    
    // Validation checks (must pass)
    await this.runCheck('sbom-validation', () => this.sbomValidation());
    
    // Warning checks (can warn)
    await this.runWarningCheck('dependency-check', () => this.dependencyCheck());
    
    const report = await this.generateReport();
    
    // Exit with appropriate code
    if (this.results.summary.failed > 0) {
      process.exit(1);
    } else if (this.results.summary.warnings > 0) {
      process.exit(0); // Pass with warnings
    } else {
      process.exit(0); // All passed
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SecurityValidator();
  validator.runAllChecks().catch(error => {
    console.error('❌ Security validation failed:', error.message);
    process.exit(1);
  });
}

export default SecurityValidator;
