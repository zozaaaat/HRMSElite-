import express from 'express';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { logger } from '@utils/logger';


const router = express.Router();

/**
 * GET /api/quality-metrics
 * Returns comprehensive quality metrics including ESLint,
   TypeScript,
   Lighthouse,
   and test coverage
 */
router.get('/quality-metrics', async (req, res) => {
  try {
    // Run quality monitoring script
    const qualityResults = await runQualityMonitor();
    
    res.json(qualityResults);
  } catch (error) {
    logger.error('Error fetching quality metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch quality metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
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
        error: 'Quality report not found',
        message: 'No quality report has been generated yet'
      });
    }
    
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    res.json(report);
  } catch (error) {
    logger.error('Error reading quality report:', error);
    res.status(500).json({
      error: 'Failed to read quality report',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/quality-metrics/run
 * Manually trigger quality monitoring
 */
router.post('/quality-metrics/run', async (req, res) => {
  try {
    logger.info('🔄 Manual quality monitoring triggered');
    
    // Run quality monitoring script
    const qualityResults = await runQualityMonitor();
    
    res.json({
      message: 'Quality monitoring completed successfully',
      results: qualityResults
    });
  } catch (error) {
    logger.error('Error running quality monitoring:', error);
    res.status(500).json({
      error: 'Failed to run quality monitoring',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Helper function to run quality monitoring
 */
async function runQualityMonitor() {
  try {
    // Run the quality monitoring script
    const output = execSync('node scripts/quality-monitor.js', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Try to read the generated report
    const reportPath = join(process.cwd(), 'quality-report.json');
    
    if (existsSync(reportPath)) {
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));
      return report.results;
    }
    
    // Fallback: parse output manually if report file doesn't exist
    return parseQualityOutput(output);
  } catch (error) {
    logger.error('Error running quality monitor:', error);
    
    // Return default metrics if script fails
    return {
      eslint: { errors: 0, warnings: 0, status: 'error' },
      typescript: { errors: 0, warnings: 0, status: 'error' },
      lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, status: 'error' },
      coverage: { lines: 0, functions: 0, branches: 0, statements: 0, status: 'error' },
      overall: { score: 0, status: 'poor' }
    };
  }
}

/**
 * Helper function to parse quality monitoring output
 */
function parseQualityOutput(output: string) {
  // This is a fallback parser for when the JSON report isn't available
  const lines = output.split('\n');
  
  const results = {
    eslint: { errors: 0, warnings: 0, status: 'pending' as const },
    typescript: { errors: 0, warnings: 0, status: 'pending' as const },
    lighthouse: {
   performance: 0, accessibility: 0, bestPractices: 0, seo: 0, status: 'pending' as const 
},
    coverage: { lines: 0, functions: 0, branches: 0, statements: 0, status: 'pending' as const },
    overall: { score: 0, status: 'pending' as const }
  };
  
  for (const line of lines) {
    // Parse ESLint results
    if (line.includes('ESLint:')) {
      const match = line.match(/ESLint: (\d+) errors?, (\d+) warnings?/);
      if (match) {
        results.eslint.errors = parseInt(match[1]);
        results.eslint.warnings = parseInt(match[2]);
        results.eslint.status = results.eslint.errors === 0 ? 'pass' : 'fail';
      }
    }
    
    // Parse TypeScript results
    if (line.includes('TypeScript:')) {
      const match = line.match(/TypeScript: (\d+) errors?, (\d+) warnings?/);
      if (match) {
        results.typescript.errors = parseInt(match[1]);
        results.typescript.warnings = parseInt(match[2]);
        results.typescript.status = results.typescript.errors === 0 ? 'pass' : 'fail';
      }
    }
    
    // Parse Lighthouse results
    if (line.includes('Lighthouse:')) {
      const match = line.match(/Lighthouse: Performance (\d+)%, Accessibility (\d+)%/);
      if (match) {
        results.lighthouse.performance = parseInt(match[1]);
        results.lighthouse.accessibility = parseInt(match[2]);
        results.lighthouse.status = 'pass';
      }
    }
    
    // Parse Coverage results
    if (line.includes('Coverage:')) {
      const match = line.match(/Coverage: (\d+)% lines, (\d+)% functions/);
      if (match) {
        results.coverage.lines = parseInt(match[1]);
        results.coverage.functions = parseInt(match[2]);
        results.coverage.status = results.coverage.lines >= 80 ? 'pass' : 'fail';
      }
    }
    
    // Parse Overall Score
    if (line.includes('Overall Quality Score:')) {
      const match = line.match(/Overall Quality Score: (\d+)%/);
      if (match) {
        const score = parseInt(match[1]);
        results.overall.score = score;
        results.overall.status = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';
      }
    }
  }
  
  return results;
}

export default router; 