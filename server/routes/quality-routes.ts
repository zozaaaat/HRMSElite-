import express from 'express';
import {execSync} from 'child_process';
import {readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {log} from '../utils/logger';

// Type definitions for quality metrics
interface QualityMetrics {
  eslint: {
    errors: number;
    warnings: number;
    status: 'pending' | 'pass' | 'fail' | 'error';
  };
  typescript: {
    errors: number;
    warnings: number;
    status: 'pending' | 'pass' | 'fail' | 'error';
  };
  lighthouse: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    status: 'pending' | 'pass' | 'fail' | 'error';
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
    status: 'pending' | 'pass' | 'fail' | 'error';
  };
  overall: {
    score: number;
    status: 'pending' | 'excellent' | 'good' | 'fair' | 'poor' | 'error';
  };
}

interface QualityReport {
  results: QualityMetrics;
  timestamp?: string;
  version?: string;
}

const router = express.Router();

/**
 * GET /api/quality-metrics
 * Returns comprehensive quality metrics including ESLint, TypeScript, Lighthouse, and test coverage
 */
router.get('/quality-metrics', async (req, res) => {

  try {

    // Run quality monitoring script
    const qualityResults: QualityMetrics = await runQualityMonitor();

    res.json(qualityResults);

  } catch (error) {

    log.error('Error fetching quality metrics:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      'error': 'Failed to fetch quality metrics',
      'message': error instanceof Error ? error.message : 'Unknown error'
    });

  }

});

/**
 * GET /api/quality-report
 * Returns the latest quality report file
 */
router.get('/quality-report', (req, res) => {

  try {

    const reportPath = join(process.cwd(), 'quality-report.json');

    if (!existsSync(reportPath)) {

      return res.status(404).json({
        'error': 'Quality report not found',
        'message': 'No quality report has been generated yet'
      });

    }

    const reportData = JSON.parse(readFileSync(reportPath, 'utf8')) as QualityReport;
    res.json(reportData);

  } catch (error) {

    log.error('Error reading quality report:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      'error': 'Failed to read quality report',
      'message': error instanceof Error ? error.message : 'Unknown error'
    });

  }

});

/**
 * POST /api/quality-metrics/run
 * Manually trigger quality monitoring
 */
router.post('/quality-metrics/run', async (req, res) => {

  try {

    // Run quality monitoring script
    const qualityResults: QualityMetrics = await runQualityMonitor();

    res.json({
      'message': 'Quality monitoring completed successfully',
      'results': qualityResults
    });

  } catch (error) {

    log.error('Error running quality monitoring:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      'error': 'Failed to run quality monitoring',
      'message': error instanceof Error ? error.message : 'Unknown error'
    });

  }

});

/**
 * Helper function to run quality monitoring
 */
async function runQualityMonitor(): Promise<QualityMetrics> {

  try {

    // Run the quality monitoring script
    const output = execSync('node scripts/quality-monitor.js', {
      'encoding': 'utf8',
      'stdio': 'pipe'
    });

    // Try to read the generated report
    const reportPath = join(process.cwd(), 'quality-report.json');

    if (existsSync(reportPath)) {

      const reportData = JSON.parse(readFileSync(reportPath, 'utf8')) as QualityReport;
      return reportData.results;

    }

    // Fallback: parse output manually if report file doesn't exist
    return parseQualityOutput(output);

  } catch (error) {

    log.error('Error running quality monitor:', error instanceof Error ? error : new Error(String(error)));

    // Return default metrics if script fails
    return {
      'eslint': {'errors': 0, 'warnings': 0, 'status': 'error'},
      'typescript': {'errors': 0, 'warnings': 0, 'status': 'error'},
      'lighthouse': {
  'performance': 0, 'accessibility': 0, 'bestPractices': 0, 'seo': 0, 'status': 'error'
},
      'coverage': {'lines': 0, 'functions': 0, 'branches': 0, 'statements': 0, 'status': 'error'},
      'overall': {'score': 0, 'status': 'poor'}
    };

  }

}

/**
 * Helper function to parse quality monitoring output
 */
function parseQualityOutput (output: string): QualityMetrics {

  // This is a fallback parser for when the JSON report isn't available
  const lines = output.split('\n');

  const results: QualityMetrics = {
    'eslint': {'errors': 0, 'warnings': 0, 'status': 'pending'},
    'typescript': {'errors': 0, 'warnings': 0, 'status': 'pending'},
    'lighthouse': {
  'performance': 0, 'accessibility': 0, 'bestPractices': 0, 'seo': 0, 'status': 'pending'
},
    'coverage': {
  'lines': 0, 'functions': 0, 'branches': 0, 'statements': 0, 'status': 'pending'
},
    'overall': {'score': 0, 'status': 'pending'}
  };

  for (const line of lines) {

    // Parse ESLint results
    if (line.includes('ESLint:')) {

      const match = line.match(/ESLint: (\d+) errors?, (\d+) warnings?/);
      if (match?.[1] && match?.[2]) {

        results.eslint.errors = parseInt(match[1]);
        results.eslint.warnings = parseInt(match[2]);
        results.eslint.status = results.eslint.errors === 0 ? 'pass' : 'fail';

      }

    }

    // Parse TypeScript results
    if (line.includes('TypeScript:')) {

      const match = line.match(/TypeScript: (\d+) errors?, (\d+) warnings?/);
      if (match?.[1] && match?.[2]) {

        results.typescript.errors = parseInt(match[1]);
        results.typescript.warnings = parseInt(match[2]);
        results.typescript.status = results.typescript.errors === 0 ? 'pass' : 'fail';

      }

    }

    // Parse Lighthouse results
    if (line.includes('Lighthouse:')) {

      const match = line.match(/Lighthouse: Performance (\d+)%, Accessibility (\d+)%/);
      if (match?.[1] && match?.[2]) {

        results.lighthouse.performance = parseInt(match[1]);
        results.lighthouse.accessibility = parseInt(match[2]);
        results.lighthouse.status = 'pass';

      }

    }

    // Parse Coverage results
    if (line.includes('Coverage:')) {

      const match = line.match(/Coverage: (\d+)% lines, (\d+)% functions/);
      if (match?.[1] && match?.[2]) {

        results.coverage.lines = parseInt(match[1]);
        results.coverage.functions = parseInt(match[2]);
        results.coverage.status = results.coverage.lines >= 80 ? 'pass' : 'fail';

      }

    }

    // Parse Overall Score
    if (line.includes('Overall Quality Score:')) {

      const match = line.match(/Overall Quality Score: (\d+)%/);
      if (match?.[1]) {

        const score = parseInt(match[1]);
        results.overall.score = score;
        results.overall.status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

      }

    }

  }

  return results;

}

export default router;
