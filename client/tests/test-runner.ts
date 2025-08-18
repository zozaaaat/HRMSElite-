import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../src/lib/logger';


interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

interface TestReport {
  timestamp: string;
  totalSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  suites: TestSuite[];
  summary: {
    unitTests: TestSuite;
    integrationTests: TestSuite;
    e2eTests: TestSuite;
    performanceTests: TestSuite;
    accessibilityTests: TestSuite;
  };
}

class TestRunner {
  private report: TestReport;
  private outputDir: string;

  constructor() {
    this.outputDir = join(process.cwd(), 'test-reports');
    this.report = {
      timestamp: new Date().toISOString(),
      totalSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      suites: [],
      summary: {
        unitTests: this.createEmptySuite('Unit Tests'),
        integrationTests: this.createEmptySuite('Integration Tests'),
        e2eTests: this.createEmptySuite('End-to-End Tests'),
        performanceTests: this.createEmptySuite('Performance Tests'),
        accessibilityTests: this.createEmptySuite('Accessibility Tests'),
      }
    };
  }

  private createEmptySuite(name: string): TestSuite {
    return {
      name,
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
    };
  }

  private async runTestSuite(suiteName: string, testPattern: string): Promise<TestSuite> {
    logger.info(`\n🧪 Running ${suiteName}...`);
    
    const startTime = Date.now();
    const suite = this.createEmptySuite(suiteName);

    try {
      // Run vitest with specific pattern
      const command = `npx vitest run ${testPattern} --reporter=json --coverage`;
      const output = execSync(command, { 
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      // Try to parse test results from coverage file
      let results = { testResults: [] };
      if (existsSync('coverage/coverage.json')) {
        try {
          const coverageData = JSON.parse(readFileSync('coverage/coverage.json', 'utf8'));
          // Extract test results from coverage data
          results = {
            testResults: coverageData.testResults || []
          };
        } catch (parseError) {
          logger.warn(`Could not parse coverage data: ${parseError}`);
        }
      }
      
      suite.tests = results.testResults.map((test: Record<string, unknown>) => ({
        name: test.name || 'Unknown Test',
        status: test.status || 'unknown',
        duration: test.duration || 0,
        error: test.error?.message || undefined,
      }));

      suite.totalTests = suite.tests.length;
      suite.passedTests = suite.tests.filter(t => t.status === 'passed').length;
      suite.failedTests = suite.tests.filter(t => t.status === 'failed').length;
      suite.skippedTests = suite.tests.filter(t => t.status === 'skipped').length;
      suite.totalDuration = Date.now() - startTime;

      // Parse coverage if available
      if (existsSync('coverage/coverage-summary.json')) {
        const coverageData = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
        suite.coverage = coverageData.total;
      }

      logger.info(`✅ ${suiteName} completed: ${suite.passedTests}/${suite.totalTests} passed`);

    } catch (error: Record<string, unknown>) {
      logger.error(`❌ ${suiteName} failed:`, error.message);
      suite.failedTests = 1;
      suite.totalTests = 1;
    }

    return suite;
  }

  private async runUnitTests(): Promise<void> {
    const suite = await this.runTestSuite('Unit Tests', 'tests/**/*.test.ts tests/**/*.test.tsx');
    this.report.summary.unitTests = suite;
    this.report.suites.push(suite);
  }

  private async runIntegrationTests(): Promise<void> {
    const suite = await this.runTestSuite('Integration Tests', 'tests/api/**/*.test.ts');
    this.report.summary.integrationTests = suite;
    this.report.suites.push(suite);
  }

  private async runE2ETests(): Promise<void> {
    const suite = await this.runTestSuite('End-to-End Tests', 'tests/e2e/**/*.test.tsx');
    this.report.summary.e2eTests = suite;
    this.report.suites.push(suite);
  }

  private async runPerformanceTests(): Promise<void> {
    const suite = await this.runTestSuite('Performance Tests', 'tests/performance/**/*.test.ts');
    this.report.summary.performanceTests = suite;
    this.report.suites.push(suite);
  }

  private async runAccessibilityTests(): Promise<void> {
    const suite = await this.runTestSuite('Accessibility Tests', 'tests/accessibility/**/*.test.tsx');
    this.report.summary.accessibilityTests = suite;
    this.report.suites.push(suite);
  }

  private calculateTotals(): void {
    this.report.totalSuites = this.report.suites.length;
    this.report.totalTests = this.report.suites.reduce((sum, suite) => sum + suite.totalTests, 0);
    this.report.passedTests = this.report.suites.reduce((sum,
   suite) => sum + suite.passedTests,
   0);
    this.report.failedTests = this.report.suites.reduce((sum,
   suite) => sum + suite.failedTests,
   0);
    this.report.skippedTests = this.report.suites.reduce((sum,
   suite) => sum + suite.skippedTests,
   0);
    this.report.totalDuration = this.report.suites.reduce((sum,
   suite) => sum + suite.totalDuration,
   0);
  }

  private generateHTMLReport(): string {
    const passedPercentage = this.report.totalTests > 0 ? (this.report.passedTests / this.report.totalTests * 100).toFixed(1) : '0';
    const failedPercentage = this.report.totalTests > 0 ? (this.report.failedTests / this.report.totalTests * 100).toFixed(1) : '0';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HRMS Elite Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .timestamp {
            opacity: 0.8;
            margin-top: 10px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .summary-card .number {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        .summary-card.passed .number { color: #28a745; }
        .summary-card.failed .number { color: #dc3545; }
        .summary-card.skipped .number { color: #ffc107; }
        .summary-card.total .number { color: #007bff; }
        .suites {
            padding: 30px;
        }
        .suite {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-header h3 {
            margin: 0;
            color: #333;
        }
        .suite-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
        }
        .suite-stats span {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
        .suite-stats .passed { background: #d4edda; color: #155724; }
        .suite-stats .failed { background: #f8d7da; color: #721c24; }
        .suite-stats .skipped { background: #fff3cd; color: #856404; }
        .suite-stats .duration { background: #d1ecf1; color: #0c5460; }
        .test-list {
            padding: 0;
            margin: 0;
            list-style: none;
        }
        .test-item {
            padding: 10px 20px;
            border-bottom: 1px solid #f8f9fa;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .test-item.skipped { border-left: 4px solid #ffc107; }
        .test-name {
            font-weight: 500;
            color: #333;
        }
        .test-duration {
            color: #6c757d;
            font-size: 0.9em;
        }
        .test-error {
            color: #dc3545;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .coverage {
            background: #f8f9fa;
            padding: 20px;
            border-top: 1px solid #e9ecef;
        }
        .coverage h4 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .coverage-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
        }
        .coverage-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 4px;
        }
        .coverage-item .label {
            font-size: 0.8em;
            color: #6c757d;
            text-transform: uppercase;
        }
        .coverage-item .value {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 HRMS Elite Test Report</h1>
            <div class="timestamp">Generated on ${
  new Date(this.report.timestamp).toLocaleString()
}</div>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <div class="number">${this.report.totalTests}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div class="number">${this.report.passedTests}</div>
                <div>${passedPercentage}%</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div class="number">${this.report.failedTests}</div>
                <div>${failedPercentage}%</div>
            </div>
            <div class="summary-card skipped">
                <h3>Skipped</h3>
                <div class="number">${this.report.skippedTests}</div>
            </div>
        </div>
        
        <div class="suites">
            ${this.report.suites.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <h3>${suite.name}</h3>
                        <div class="suite-stats">
                            <span class="passed">${suite.passedTests} passed</span>
                            <span class="failed">${suite.failedTests} failed</span>
                            <span class="skipped">${suite.skippedTests} skipped</span>
                            <span class="duration">${suite.totalDuration}ms</span>
                        </div>
                    </div>
                    <ul class="test-list">
                        ${suite.tests.map(test => `
                            <li class="test-item ${test.status}">
                                <div>
                                    <div class="test-name">${test.name}</div>
                                    ${
  test.error ? `<div class="test-error">${
  test.error
}</div>` : ''
}
                                </div>
                                <div class="test-duration">${test.duration}ms</div>
                            </li>
                        `).join('')}
                    </ul>
                    ${suite.coverage ? `
                        <div class="coverage">
                            <h4>Coverage</h4>
                            <div class="coverage-grid">
                                <div class="coverage-item">
                                    <div class="label">Statements</div>
                                    <div class="value">${suite.coverage.statements}%</div>
                                </div>
                                <div class="coverage-item">
                                    <div class="label">Branches</div>
                                    <div class="value">${suite.coverage.branches}%</div>
                                </div>
                                <div class="coverage-item">
                                    <div class="label">Functions</div>
                                    <div class="value">${suite.coverage.functions}%</div>
                                </div>
                                <div class="coverage-item">
                                    <div class="label">Lines</div>
                                    <div class="value">${suite.coverage.lines}%</div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Test execution completed in ${this.report.totalDuration}ms</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private saveReport(): void {
    // Create output directory if it doesn't exist
    if (!existsSync(this.outputDir)) {
      execSync(`mkdir -p "${this.outputDir}"`);
    }

    // Save JSON report
    const jsonPath = join(this.outputDir, `test-report-${Date.now()}.json`);
    writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save HTML report
    const htmlPath = join(this.outputDir, `test-report-${Date.now()}.html`);
    writeFileSync(htmlPath, this.generateHTMLReport());

    logger.info(`\n📊 Test reports saved:`);
    logger.info(`   JSON: ${jsonPath}`);
    logger.info(`   HTML: ${htmlPath}`);
  }

  public async runAllTests(): Promise<void> {
    logger.info('🚀 Starting comprehensive test suite...\n');

    try {
      // Run all test suites
      await Promise.all([
        this.runUnitTests(),
        this.runIntegrationTests(),
        this.runE2ETests(),
        this.runPerformanceTests(),
        this.runAccessibilityTests(),
      ]);

      // Calculate totals
      this.calculateTotals();

      // Print summary
      logger.info('\n📋 Test Summary:');
      logger.info(`   Total Tests: ${this.report.totalTests}`);
      logger.info(`   Passed: ${this.report.passedTests}`);
      logger.info(`   Failed: ${this.report.failedTests}`);
      logger.info(`   Skipped: ${this.report.skippedTests}`);
      logger.info(`   Total Duration: ${this.report.totalDuration}ms`);

      // Save reports
      this.saveReport();

      // Exit with appropriate code
      if (this.report.failedTests > 0) {
        logger.info('\n❌ Some tests failed!');
        process.exit(1);
      } else {
        logger.info('\n✅ All tests passed!');
        process.exit(0);
      }

    } catch (error) {
      logger.error('\n💥 Test runner failed:', error);
      process.exit(1);
    }
  }

  public async runSpecificTests(testType: string): Promise<void> {
    logger.info(`🚀 Running ${testType} tests...\n`);

    try {
      switch (testType.toLowerCase()) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        case 'e2e':
          await this.runE2ETests();
          break;
        case 'performance':
          await this.runPerformanceTests();
          break;
        case 'accessibility':
          await this.runAccessibilityTests();
          break;
        default:
          logger.error(`Unknown test type: ${testType}`);
          process.exit(1);
      }

      this.calculateTotals();
      this.saveReport();

    } catch (error) {
      logger.error(`💥 ${testType} tests failed:`, error);
      process.exit(1);
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const testRunner = new TestRunner();

if (args.length === 0) {
  testRunner.runAllTests();
} else {
  testRunner.runSpecificTests(args[0]);
} 