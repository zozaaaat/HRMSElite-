import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Define proper types for the test results and reports
interface TestResult {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: number;
}

interface TestExecutionResult {
  category: string;
  command: string;
  success: boolean;
  results?: TestResult;
  error?: string;
  duration: number;
}

interface TestReport {
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
    totalDuration: number;
    averageCoverage: number;
  };
  categories: {
    [key: string]: {
      passed: number;
      failed: number;
      duration: number;
      coverage: number;
    };
  };
  details: TestExecutionResult[];
}

// Test execution utilities
const runTestCommand = (command: string): {
   success: boolean; output: string; duration: number 
} => {
  
  const startTime = Date.now();
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    const duration = Date.now() - startTime;
    return { success: true, output, duration };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorObj = error as { stdout?: string; stderr?: string; message?: string };
    return { 
      success: false, 
      output: errorObj.stdout ?? errorObj.stderr ?? errorObj.message ?? 'Unknown error', 
      duration 
    };
  }
};

const parseTestResults = (output: string): TestResult => {
  const lines = output.split('\n');
  const results: TestResult = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    coverage: 0
  };

  for (const line of lines) {
    if (line.includes('Tests:')) {
      const match = line.match(/(\d+) passed, (\d+) failed, (\d+) skipped/);
      if (match) {
        results.passed = parseInt(match[1]);
        results.failed = parseInt(match[2]);
        results.skipped = parseInt(match[3]);
        results.total = results.passed + results.failed + results.skipped;
      }
    }
    if (line.includes('Time:')) {
      const match = line.match(/Time:\s*([\d.]+)s/);
      if (match) {
        results.duration = parseFloat(match[1]);
      }
    }
    if (line.includes('Coverage:')) {
      const match = line.match(/Coverage:\s*([\d.]+)%/);
      if (match) {
        results.coverage = parseFloat(match[1]);
      }
    }
  }

  return results;
};

const generateTestReport = (results: TestExecutionResult[]): TestReport => {
  const report: TestReport = {
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      totalDuration: 0,
      averageCoverage: 0
    },
    categories: {
      components: { passed: 0, failed: 0, duration: 0, coverage: 0 },
      api: { passed: 0, failed: 0, duration: 0, coverage: 0 },
      performance: { passed: 0, failed: 0, duration: 0, coverage: 0 },
      concurrent: { passed: 0, failed: 0, duration: 0, coverage: 0 }
    },
    details: results
  };

  results.forEach(result => {
    if (result.results) {
      report.summary.totalTests += result.results.total;
      report.summary.totalPassed += result.results.passed;
      report.summary.totalFailed += result.results.failed;
      report.summary.totalSkipped += result.results.skipped;
      report.summary.totalDuration += result.duration;

      if (result.category in report.categories) {
        report.categories[result.category].passed += result.results.passed;
        report.categories[result.category].failed += result.results.failed;
        report.categories[result.category].duration += result.duration;
        report.categories[result.category].coverage = result.results.coverage;
      }
    }
  });

  if (results.length > 0) {
    const totalCoverage = results.reduce((sum, r) => {
      return sum + (r.results?.coverage || 0);
    }, 0);
    report.summary.averageCoverage = totalCoverage / results.length;
  }

  return report;
};

// Simple logger function to avoid console.log linter errors
const logInfo = (_message: string): void => {
  // In a real environment, this would use a proper logger
  // For now, we'll use a no-op to avoid linter errors
  // console.log(message);
};

const saveReport = (report: TestReport, filename: string): void => {
  const reportPath = join(__dirname, filename);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logInfo(`Test report saved to: ${reportPath}`);
};

describe('Enhanced Test Runner', () => {
  const testResults: TestExecutionResult[] = [];

  describe('Component Tests', () => {
    it('should run comprehensive component tests', () => {
      const command = 'npm run test:components';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'components',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
        expect(parsedResults.coverage).toBeGreaterThan(70);
      } else {
        testResults.push({
          category: 'components',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });

    it('should run UI component tests', () => {
      const command = 'npm run test:ui-components';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'components',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
      } else {
        testResults.push({
          category: 'components',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('API Tests', () => {
    it('should run API integration tests', () => {
      const command = 'npm run test:api';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'api',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
        expect(parsedResults.coverage).toBeGreaterThan(80);
      } else {
        testResults.push({
          category: 'api',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });

    it('should run authentication API tests', () => {
      const command = 'npm run test:auth-api';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'api',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
      } else {
        testResults.push({
          category: 'api',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should run performance tests', () => {
      const command = 'npm run test:performance';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'performance',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
        expect(result.duration).toBeLessThan(60000); // Should complete within 60 seconds
      } else {
        testResults.push({
          category: 'performance',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });

    it('should run concurrent request tests', () => {
      const command = 'npm run test:concurrent';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'concurrent',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
        expect(result.duration).toBeLessThan(120000); // Should complete within 2 minutes
      } else {
        testResults.push({
          category: 'concurrent',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Coverage Tests', () => {
    it('should generate coverage report', () => {
      const command = 'npm run test:coverage';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'coverage',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.coverage).toBeGreaterThan(70);
        
        // Check if coverage report files exist
        const coverageDir = join(__dirname, '../coverage');
        expect(existsSync(coverageDir)).toBe(true);
        
        const htmlReport = join(coverageDir, 'index.html');
        expect(existsSync(htmlReport)).toBe(true);
      } else {
        testResults.push({
          category: 'coverage',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Accessibility Tests', () => {
    it('should run accessibility tests', () => {
      const command = 'npm run test:accessibility';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'accessibility',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
      } else {
        testResults.push({
          category: 'accessibility',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('End-to-End Tests', () => {
    it('should run end-to-end tests', () => {
      const command = 'npm run test:e2e';
      const result = runTestCommand(command);
      
      if (result.success) {
        const parsedResults = parseTestResults(result.output);
        testResults.push({
          category: 'e2e',
          command,
          success: true,
          results: parsedResults,
          duration: result.duration
        });
        
        expect(parsedResults.passed).toBeGreaterThan(0);
        expect(parsedResults.failed).toBe(0);
      } else {
        testResults.push({
          category: 'e2e',
          command,
          success: false,
          error: result.output,
          duration: result.duration
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Test Report Generation', () => {
    it('should generate comprehensive test report', () => {
      const report = generateTestReport(testResults);
      
      // Validate report structure
      expect(report.summary).toBeDefined();
      expect(report.categories).toBeDefined();
      expect(report.details).toBeDefined();
      
      // Validate summary calculations
      expect(report.summary.totalTests).toBeGreaterThan(0);
      expect(report.summary.totalPassed).toBeGreaterThan(0);
      expect(report.summary.totalFailed).toBe(0);
      expect(report.summary.averageCoverage).toBeGreaterThan(70);
      
      // Validate category data
      expect(report.categories.components).toBeDefined();
      expect(report.categories.api).toBeDefined();
      expect(report.categories.performance).toBeDefined();
      
      // Save report
      saveReport(report, 'test-report.json');
      
      // Generate HTML report
      const htmlReport = generateHTMLReport(report);
      const htmlPath = join(__dirname, 'test-report.html');
      writeFileSync(htmlPath, htmlReport);
      logInfo(`HTML report saved to: ${htmlPath}`);
      
      expect(report.summary.totalPassed).toBeGreaterThan(0);
    });
  });
});

// HTML Report Generator
const generateHTMLReport = (report: TestReport): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HRMS Elite Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary {
   display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; 
}
        .metric {
   background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
}
        .category { margin: 20px 0; }
        .category h3 { color: #333; }
        .success { color: #28a745; }
        .failure { color: #dc3545; }
        .coverage { color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HRMS Elite Test Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p class="success">${report.summary.totalTests}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p class="success">${report.summary.totalPassed}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p class="failure">${report.summary.totalFailed}</p>
        </div>
        <div class="metric">
            <h3>Coverage</h3>
            <p class="coverage">${report.summary.averageCoverage.toFixed(1)}%</p>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <p>${(report.summary.totalDuration / 1000).toFixed(1)}s</p>
        </div>
    </div>
    
    <div class="category">
        <h3>Test Categories</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Duration</th>
                    <th>Coverage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(report.categories).map(([category, data]) => `
                    <tr>
                        <td>${category}</td>
                        <td class="success">${data.passed}</td>
                        <td class="failure">${data.failed}</td>
                        <td>${(data.duration / 1000).toFixed(1)}s</td>
                        <td class="coverage">${data.coverage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="category">
        <h3>Test Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Command</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Coverage</th>
                </tr>
            </thead>
            <tbody>
                ${report.details.map((detail) => `
                    <tr>
                        <td>${detail.category}</td>
                        <td>${detail.command}</td>
                        <td class="${
  detail.success ? 'success' : 'failure'
}">${
  detail.success ? 'PASS' : 'FAIL'
}</td>
                        <td>${(detail.duration / 1000).toFixed(1)}s</td>
                        <td class="coverage">${detail.results?.coverage?.toFixed(1) || 'N/A'}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>
  `;
};
