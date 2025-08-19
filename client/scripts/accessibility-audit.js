#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * 
 * This script runs axe-core accessibility tests on key pages of the HRMS Elite application.
 * It checks for WCAG 2.1 AA compliance and generates detailed reports.
 * 
 * Usage:
 * npm run audit:a11y
 * 
 * Requirements:
 * - Puppeteer (for browser automation)
 * - axe-core
 * - fs-extra (for file operations)
 */

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:5173', // Vite dev server
  outputDir: './test-reports/accessibility',
  pages: [
    { name: 'login', path: '/login' },
    { name: 'company-selection', path: '/' },
    { name: 'dashboard', path: '/dashboard' },
    { name: 'employees', path: '/employees' },
    { name: 'documents', path: '/documents' },
    { name: 'attendance', path: '/attendance' },
    { name: 'payroll', path: '/payroll' },
    { name: 'reports', path: '/reports' },
    { name: 'settings', path: '/settings' }
  ],
  axeOptions: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice']
    },
    rules: {
      'color-contrast': { enabled: true },
      'focus-visible': { enabled: true },
      'heading-order': { enabled: true },
      'aria-allowed-attr': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-valid-attr-value': { enabled: true },
      'button-name': { enabled: true },
      'image-alt': { enabled: true },
      'label': { enabled: true },
      'link-name': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'tabindex': { enabled: true }
    }
  }
};

// Utility functions
const formatViolation = (violation) => {
  return {
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    helpUrl: violation.helpUrl,
    tags: violation.tags,
    nodes: violation.nodes.map(node => ({
      html: node.html,
      target: node.target,
      failureSummary: node.failureSummary,
      impact: node.impact
    }))
  };
};

const generateReport = (results, timestamp) => {
  const report = {
    timestamp,
    summary: {
      totalPages: results.length,
      pagesWithViolations: results.filter(r => r.violations.length > 0).length,
      totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
      criticalViolations: results.reduce((sum, r) => sum + r.violations.filter(v => v.impact === 'critical').length, 0),
      seriousViolations: results.reduce((sum, r) => sum + r.violations.filter(v => v.impact === 'serious').length, 0),
      moderateViolations: results.reduce((sum, r) => sum + r.violations.filter(v => v.impact === 'moderate').length, 0),
      minorViolations: results.reduce((sum, r) => sum + r.violations.filter(v => v.impact === 'minor').length, 0)
    },
    pages: results.map(result => ({
      name: result.pageName,
      url: result.url,
      violations: result.violations.map(formatViolation),
      passes: result.passes.length,
      incomplete: result.incomplete.length,
      inapplicable: result.inapplicable.length
    }))
  };

  return report;
};

const generateHTMLReport = (report) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report - HRMS Elite</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
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
        .summary {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
            color: #333;
        }
        .summary-card p {
            margin: 0;
            color: #666;
            font-weight: 500;
        }
        .critical { color: #dc3545; }
        .serious { color: #fd7e14; }
        .moderate { color: #ffc107; }
        .minor { color: #28a745; }
        .pages {
            padding: 30px;
        }
        .page {
            margin-bottom: 30px;
            border: 1px solid #eee;
            border-radius: 8px;
            overflow: hidden;
        }
        .page-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .page-name {
            font-weight: 600;
            color: #333;
        }
        .page-stats {
            display: flex;
            gap: 15px;
            font-size: 0.9em;
            color: #666;
        }
        .violations {
            padding: 20px;
        }
        .violation {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 4px solid #dc3545;
            background: #f8f9fa;
        }
        .violation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .violation-id {
            font-weight: 600;
            color: #333;
        }
        .violation-impact {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 500;
            text-transform: uppercase;
        }
        .impact-critical { background: #dc3545; color: white; }
        .impact-serious { background: #fd7e14; color: white; }
        .impact-moderate { background: #ffc107; color: #333; }
        .impact-minor { background: #28a745; color: white; }
        .violation-description {
            color: #666;
            margin-bottom: 10px;
        }
        .violation-help {
            color: #007bff;
            text-decoration: none;
        }
        .violation-help:hover {
            text-decoration: underline;
        }
        .nodes {
            margin-top: 15px;
        }
        .node {
            background: white;
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .node-html {
            font-family: monospace;
            background: #f1f3f4;
            padding: 5px;
            border-radius: 3px;
            font-size: 0.9em;
            margin: 5px 0;
        }
        .no-violations {
            text-align: center;
            padding: 40px;
            color: #28a745;
            font-size: 1.2em;
        }
        .timestamp {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 0.9em;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Accessibility Audit Report</h1>
            <p>HRMS Elite Application</p>
        </div>
        
        <div class="summary">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3 class="critical">${report.summary.criticalViolations}</h3>
                    <p>Critical Violations</p>
                </div>
                <div class="summary-card">
                    <h3 class="serious">${report.summary.seriousViolations}</h3>
                    <p>Serious Violations</p>
                </div>
                <div class="summary-card">
                    <h3 class="moderate">${report.summary.moderateViolations}</h3>
                    <p>Moderate Violations</p>
                </div>
                <div class="summary-card">
                    <h3 class="minor">${report.summary.minorViolations}</h3>
                    <p>Minor Violations</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.pagesWithViolations}</h3>
                    <p>Pages with Issues</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.totalPages}</h3>
                    <p>Total Pages Tested</p>
                </div>
            </div>
        </div>
        
        <div class="pages">
            <h2>Page Details</h2>
            ${report.pages.map(page => `
                <div class="page">
                    <div class="page-header">
                        <div class="page-name">${page.name}</div>
                        <div class="page-stats">
                            <span>Violations: ${page.violations.length}</span>
                            <span>Passes: ${page.passes}</span>
                        </div>
                    </div>
                    <div class="violations">
                        ${page.violations.length === 0 ? 
                            '<div class="no-violations">✅ No accessibility violations found</div>' :
                            page.violations.map(violation => `
                                <div class="violation">
                                    <div class="violation-header">
                                        <span class="violation-id">${violation.id}</span>
                                        <span class="violation-impact impact-${violation.impact}">${violation.impact}</span>
                                    </div>
                                    <div class="violation-description">${violation.description}</div>
                                    <a href="${violation.helpUrl}" class="violation-help" target="_blank">Learn more about this rule</a>
                                    <div class="nodes">
                                        <h4>Affected Elements (${violation.nodes.length})</h4>
                                        ${violation.nodes.map(node => `
                                            <div class="node">
                                                <div class="node-html">${node.html}</div>
                                                <div><strong>Issue:</strong> ${node.failureSummary}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Report generated on ${new Date(report.timestamp).toLocaleString()}
        </div>
    </div>
</body>
</html>
  `;

  return html;
};

// Main audit function
async function runAccessibilityAudit() {
  console.log('🚀 Starting Accessibility Audit...');
  console.log(`📊 Testing ${CONFIG.pages.length} pages`);
  console.log(`🌐 Base URL: ${CONFIG.baseUrl}`);
  console.log('');

  // Ensure output directory exists
  await fs.ensureDir(CONFIG.outputDir);

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Inject axe-core
    await page.addScriptTag({
      path: require.resolve('axe-core/axe.min.js')
    });

    const results = [];
    const timestamp = new Date().toISOString();

    // Test each page
    for (const pageConfig of CONFIG.pages) {
      console.log(`🔍 Testing: ${pageConfig.name}`);
      
      try {
        const url = `${CONFIG.baseUrl}${pageConfig.path}`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for page to be fully loaded
        await page.waitForTimeout(2000);

        // Run axe-core
        const axeResults = await page.evaluate((options) => {
          return new Promise((resolve) => {
            axe.run(options, (err, results) => {
              if (err) {
                resolve({ error: err.message });
              } else {
                resolve(results);
              }
            });
          });
        }, CONFIG.axeOptions);

        if (axeResults.error) {
          console.log(`❌ Error testing ${pageConfig.name}: ${axeResults.error}`);
          results.push({
            pageName: pageConfig.name,
            url,
            error: axeResults.error,
            violations: [],
            passes: [],
            incomplete: [],
            inapplicable: []
          });
        } else {
          const violationCount = axeResults.violations.length;
          const status = violationCount === 0 ? '✅' : `⚠️  (${violationCount} violations)`;
          console.log(`  ${status} ${pageConfig.name} - ${violationCount} violations`);

          results.push({
            pageName: pageConfig.name,
            url,
            violations: axeResults.violations,
            passes: axeResults.passes,
            incomplete: axeResults.incomplete,
            inapplicable: axeResults.inapplicable
          });
        }
      } catch (error) {
        console.log(`❌ Failed to test ${pageConfig.name}: ${error.message}`);
        results.push({
          pageName: pageConfig.name,
          url: `${CONFIG.baseUrl}${pageConfig.path}`,
          error: error.message,
          violations: [],
          passes: [],
          incomplete: [],
          inapplicable: []
        });
      }
    }

    // Generate reports
    const report = generateReport(results, timestamp);
    
    // Save JSON report
    const jsonPath = path.join(CONFIG.outputDir, `accessibility-audit-${Date.now()}.json`);
    await fs.writeJson(jsonPath, report, { spaces: 2 });
    
    // Save HTML report
    const htmlReport = generateHTMLReport(report);
    const htmlPath = path.join(CONFIG.outputDir, `accessibility-audit-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);

    // Print summary
    console.log('');
    console.log('📋 Audit Summary:');
    console.log(`  Total Pages: ${report.summary.totalPages}`);
    console.log(`  Pages with Violations: ${report.summary.pagesWithViolations}`);
    console.log(`  Critical Violations: ${report.summary.criticalViolations}`);
    console.log(`  Serious Violations: ${report.summary.seriousViolations}`);
    console.log(`  Moderate Violations: ${report.summary.moderateViolations}`);
    console.log(`  Minor Violations: ${report.summary.minorViolations}`);
    console.log('');
    console.log('📁 Reports saved to:');
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  HTML: ${htmlPath}`);

    // Exit with error code if there are critical violations
    if (report.summary.criticalViolations > 0) {
      console.log('');
      console.log('❌ Critical accessibility violations found!');
      process.exit(1);
    } else if (report.summary.seriousViolations > 0) {
      console.log('');
      console.log('⚠️  Serious accessibility violations found!');
      process.exit(1);
    } else {
      console.log('');
      console.log('✅ No critical or serious accessibility violations found!');
    }

  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the audit if this script is executed directly
if (require.main === module) {
  runAccessibilityAudit();
}

module.exports = { runAccessibilityAudit, CONFIG };
