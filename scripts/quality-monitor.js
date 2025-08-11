#!/usr/bin/env node

/**
 * 📊 HRMS Elite Quality Monitor
 * Comprehensive quality monitoring dashboard
 * 
 * Features:
 * - ESLint error checking
 * - TypeScript type checking
 * - Lighthouse performance analysis
 * - Test coverage reporting
 * - Quality score calculation
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

class QualityMonitor {
  constructor() {
    this.results = {
      eslint: { errors: 0, warnings: 0, status: 'pending' },
      typescript: { errors: 0, warnings: 0, status: 'pending' },
      lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, status: 'pending' },
      coverage: { lines: 0, functions: 0, branches: 0, statements: 0, status: 'pending' },
      overall: { score: 0, status: 'pending' }
    };
    
    this.startTime = Date.now();
  }

  async runAllChecks() {
    console.log(chalk.blue.bold('\n🔍 HRMS Elite Quality Monitor'));
    console.log(chalk.gray('Running comprehensive quality checks...\n'));

    try {
      await this.checkESLint();
      await this.checkTypeScript();
      await this.checkLighthouse();
      await this.checkTestCoverage();
      this.calculateOverallScore();
      this.generateReport();
    } catch (error) {
      console.error(chalk.red('❌ Quality monitoring failed:', error.message));
      process.exit(1);
    }
  }

  async checkESLint() {
    console.log(chalk.yellow('🔍 Checking ESLint...'));
    
    try {
      const output = execSync('npx eslint . --ext .ts,.tsx --format=json --quiet', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const results = JSON.parse(output);
      let totalErrors = 0;
      let totalWarnings = 0;
      
      results.forEach(file => {
        totalErrors += file.errorCount;
        totalWarnings += file.warningCount;
      });
      
      this.results.eslint = {
        errors: totalErrors,
        warnings: totalWarnings,
        status: totalErrors === 0 ? 'pass' : 'fail'
      };
      
      console.log(chalk.green(`✅ ESLint: ${totalErrors} errors, ${totalWarnings} warnings`));
    } catch (error) {
      // ESLint found errors
      try {
        const output = error.stdout?.toString() || error.stderr?.toString() || '';
        const results = JSON.parse(output);
        let totalErrors = 0;
        let totalWarnings = 0;
        
        results.forEach(file => {
          totalErrors += file.errorCount;
          totalWarnings += file.warningCount;
        });
        
        this.results.eslint = {
          errors: totalErrors,
          warnings: totalWarnings,
          status: 'fail'
        };
        
        console.log(chalk.red(`❌ ESLint: ${totalErrors} errors, ${totalWarnings} warnings`));
      } catch (parseError) {
        this.results.eslint = { errors: 1, warnings: 0, status: 'error' };
        console.log(chalk.red('❌ ESLint: Failed to parse results'));
      }
    }
  }

  async checkTypeScript() {
    console.log(chalk.yellow('🔍 Checking TypeScript...'));
    
    try {
      execSync('npx tsc --noEmit', {
        stdio: 'pipe'
      });
      
      this.results.typescript = {
        errors: 0,
        warnings: 0,
        status: 'pass'
      };
      
      console.log(chalk.green('✅ TypeScript: No errors'));
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorLines = output.split('\n').filter(line => line.includes('error'));
      const warningLines = output.split('\n').filter(line => line.includes('warning'));
      
      this.results.typescript = {
        errors: errorLines.length,
        warnings: warningLines.length,
        status: 'fail'
      };
      
      console.log(chalk.red(`❌ TypeScript: ${errorLines.length} errors, ${warningLines.length} warnings`));
    }
  }

  async checkLighthouse() {
    console.log(chalk.yellow('🔍 Checking Lighthouse Performance...'));
    
    try {
      // Check if server is running, if not start it
      const isServerRunning = await this.checkServerRunning();
      
      if (!isServerRunning) {
        console.log(chalk.yellow('⚠️  Starting server for Lighthouse test...'));
        this.startServer();
        await this.waitForServer();
      }
      
      const output = execSync('npx lighthouse http://localhost:3000 --output=json --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless --no-sandbox"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const results = JSON.parse(output);
      const categories = results.categories;
      
      this.results.lighthouse = {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        status: 'pass'
      };
      
      console.log(chalk.green(`✅ Lighthouse: Performance ${this.results.lighthouse.performance}%, Accessibility ${this.results.lighthouse.accessibility}%`));
    } catch (error) {
      this.results.lighthouse = {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        status: 'error'
      };
      
      console.log(chalk.red('❌ Lighthouse: Failed to run performance test'));
    }
  }

  async checkTestCoverage() {
    console.log(chalk.yellow('🔍 Checking Test Coverage...'));
    
    try {
      const output = execSync('npm run test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Parse coverage from output or coverage files
      const coverageData = this.parseCoverageData();
      
      this.results.coverage = {
        lines: coverageData.lines || 0,
        functions: coverageData.functions || 0,
        branches: coverageData.branches || 0,
        statements: coverageData.statements || 0,
        status: coverageData.lines >= 80 ? 'pass' : 'fail'
      };
      
      console.log(chalk.green(`✅ Coverage: ${this.results.coverage.lines}% lines, ${this.results.coverage.functions}% functions`));
    } catch (error) {
      this.results.coverage = {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
        status: 'error'
      };
      
      console.log(chalk.red('❌ Coverage: Failed to run tests'));
    }
  }

  parseCoverageData() {
    // Try to read coverage data from various possible locations
    const coverageFiles = [
      'coverage/coverage-summary.json',
      'client/coverage/coverage-summary.json',
      'tests/coverage/coverage-summary.json',
      'coverage/lcov.info'
    ];
    
    for (const file of coverageFiles) {
      if (existsSync(file)) {
        try {
          const data = readFileSync(file, 'utf8');
          if (file.endsWith('.json')) {
            const json = JSON.parse(data);
            return json.total || json;
          } else if (file.endsWith('.info')) {
            return this.parseLcovData(data);
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    return { lines: 0, functions: 0, branches: 0, statements: 0 };
  }

  parseLcovData(data) {
    const lines = data.split('\n');
    let totalLines = 0;
    let coveredLines = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    
    for (const line of lines) {
      if (line.startsWith('LF:')) {
        totalLines += parseInt(line.split(':')[1]);
      } else if (line.startsWith('LH:')) {
        coveredLines += parseInt(line.split(':')[1]);
      } else if (line.startsWith('FNF:')) {
        totalFunctions += parseInt(line.split(':')[1]);
      } else if (line.startsWith('FNH:')) {
        coveredFunctions += parseInt(line.split(':')[1]);
      }
    }
    
    return {
      lines: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0,
      functions: totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0,
      branches: 0,
      statements: totalLines > 0 ? Math.round((coveredLines / totalLines) * 100) : 0
    };
  }

  async checkServerRunning() {
    try {
      const response = await fetch('http://localhost:3000/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  startServer() {
    // Start server in background
    spawn('npm', ['run', 'dev'], {
      stdio: 'ignore',
      detached: true
    });
  }

  async waitForServer() {
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  calculateOverallScore() {
    let score = 0;
    let totalChecks = 0;
    
    // ESLint score (25% weight)
    if (this.results.eslint.status === 'pass') {
      score += 25;
    } else if (this.results.eslint.errors === 0) {
      score += 20; // Some warnings but no errors
    }
    totalChecks++;
    
    // TypeScript score (25% weight)
    if (this.results.typescript.status === 'pass') {
      score += 25;
    }
    totalChecks++;
    
    // Lighthouse score (25% weight)
    if (this.results.lighthouse.status === 'pass') {
      const avgScore = (this.results.lighthouse.performance + 
                       this.results.lighthouse.accessibility + 
                       this.results.lighthouse.bestPractices + 
                       this.results.lighthouse.seo) / 4;
      score += (avgScore / 100) * 25;
    }
    totalChecks++;
    
    // Coverage score (25% weight)
    if (this.results.coverage.status === 'pass') {
      score += (this.results.coverage.lines / 100) * 25;
    }
    totalChecks++;
    
    this.results.overall = {
      score: Math.round(score),
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor'
    };
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    
    console.log(chalk.blue.bold('\n📊 Quality Report'));
    console.log(chalk.gray('='.repeat(50)));
    
    // ESLint Status
    const eslintIcon = this.results.eslint.status === 'pass' ? '✅' : '❌';
    console.log(`${eslintIcon} ESLint: ${this.results.eslint.errors} errors, ${this.results.eslint.warnings} warnings`);
    
    // TypeScript Status
    const tsIcon = this.results.typescript.status === 'pass' ? '✅' : '❌';
    console.log(`${tsIcon} TypeScript: ${this.results.typescript.errors} errors, ${this.results.typescript.warnings} warnings`);
    
    // Lighthouse Status
    const lhIcon = this.results.lighthouse.status === 'pass' ? '✅' : '❌';
    console.log(`${lhIcon} Lighthouse: Performance ${this.results.lighthouse.performance}%, Accessibility ${this.results.lighthouse.accessibility}%`);
    
    // Coverage Status
    const covIcon = this.results.coverage.status === 'pass' ? '✅' : '❌';
    console.log(`${covIcon} Test Coverage: ${this.results.coverage.lines}% lines, ${this.results.coverage.functions}% functions`);
    
    // Overall Score
    const scoreColor = this.results.overall.score >= 80 ? 'green' : 
                      this.results.overall.score >= 60 ? 'yellow' : 'red';
    console.log(chalk[scoreColor].bold(`\n🎯 Overall Quality Score: ${this.results.overall.score}% (${this.results.overall.status})`));
    
    console.log(chalk.gray(`\n⏱️  Total time: ${duration}ms`));
    
    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalChecks: 4,
        passedChecks: Object.values(this.results).filter(r => r.status === 'pass').length,
        failedChecks: Object.values(this.results).filter(r => r.status === 'fail').length,
        errorChecks: Object.values(this.results).filter(r => r.status === 'error').length
      }
    };
    
    const reportPath = 'quality-report.json';
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }
}

// Run quality monitor
const monitor = new QualityMonitor();
monitor.runAllChecks().catch(console.error); 