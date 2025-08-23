/**
 * @fileoverview Security Check Script
 * @description Detects header-based authentication bypasses and other security issues
 * @author HRMS Elite Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Security patterns to detect
const SECURITY_PATTERNS = {
  // Header-based authentication bypass patterns
  headerAuthBypass: [
    /req\.headers\['x-user-role'\]/g,
    /req\.headers\['x-user-id'\]/g,
    /req\.headers\['x-user-email'\]/g,
    /headers\['x-user-role'\]/g,
    /headers\['x-user-id'\]/g,
    /headers\['x-user-email'\]/g,
    /x-user-role/g,
    /x-user-id/g,
    /x-user-email/g
  ],
  
  // Development authentication bypass patterns (should be gated)
  devAuthBypass: [
    /ALLOW_DEV_AUTH/g,
    /NODE_ENV.*development/g,
    /development.*auth/g,
    /dev.*auth/g
  ],
  
  // Hardcoded secrets or credentials
  hardcodedSecrets: [
    /password.*=.*['"][^'"]{3,}['"]/g,
    /secret.*=.*['"][^'"]{3,}['"]/g,
    /token.*=.*['"][^'"]{3,}['"]/g,
    /key.*=.*['"][^'"]{3,}['"]/g,
    /api_key.*=.*['"][^'"]{3,}['"]/g,
    /apikey.*=.*['"][^'"]{3,}['"]/g
  ],
  
  // Insecure CORS patterns
  insecureCORS: [
    /origin.*\*/g,
    /cors.*\*/g,
    /Access-Control-Allow-Origin.*\*/g
  ],
  
  // Debug/development code in production
  debugCode: [
    /console\.log/g,
    /console\.error/g,
    /console\.warn/g,
    /debugger/g,
    /DEBUG.*=.*true/g
  ]
};

// Files to exclude from security checks
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.vscode/,
  /\.idea/,
  /dist/,
  /build/,
  /coverage/,
  /test-reports/,
  /\.log$/,
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.map$/,
  /\.d\.ts$/,
  /\.test\./,
  /\.spec\./,
  /tests\//,
  /test\//,
  /__tests__\//,
  /__mocks__\//,
  /fixtures\//,
  /mocks\//,
  /stubs\//,
  /docs\//,
  /documentation\//,
  /README/,
  /CHANGELOG/,
  /LICENSE/,
  /\.md$/,
  /\.txt$/,
  /\.yml$/,
  /\.yaml$/,
  /\.json$/,
  /\.config\./,
  /\.env/,
  /\.example/,
  /\.template/,
  /\.sample/
];

// File extensions to check
const CHECK_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.php',
  '.py',
  '.rb',
  '.java',
  '.cs',
  '.go',
  '.rs',
  '.swift',
  '.kt',
  '.scala'
];

/**
 * Check if file should be excluded from security scan
 */
function shouldExcludeFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check exclude patterns
  for (const pattern of EXCLUDE_PATTERNS) {
    if (pattern.test(relativePath)) {
      return true;
    }
  }
  
  // Check file extension
  const ext = path.extname(filePath);
  if (!CHECK_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  return false;
}

/**
 * Scan file for security issues
 */
function scanFileForIssues(filePath) {
  const issues = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check each security pattern
    for (const [category, patterns] of Object.entries(SECURITY_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          // Find line numbers for matches
          const lineNumbers = [];
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              lineNumbers.push(i + 1);
            }
          }
          
          issues.push({
            category,
            pattern: pattern.source,
            matches: matches.length,
            lineNumbers,
            filePath: path.relative(process.cwd(), filePath)
          });
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
  }
  
  return issues;
}

/**
 * Recursively scan directory for security issues
 */
function scanDirectory(dirPath) {
  const allIssues = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        const subIssues = scanDirectory(fullPath);
        allIssues.push(...subIssues);
      } else if (stat.isFile()) {
        // Check if file should be excluded
        if (!shouldExcludeFile(fullPath)) {
          const issues = scanFileForIssues(fullPath);
          allIssues.push(...issues);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}:`, error.message);
  }
  
  return allIssues;
}

/**
 * Generate security report
 */
function generateReport(issues) {
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    categories: {},
    criticalIssues: [],
    warnings: [],
    recommendations: []
  };
  
  // Group issues by category
  for (const issue of issues) {
    if (!report.categories[issue.category]) {
      report.categories[issue.category] = [];
    }
    report.categories[issue.category].push(issue);
  }
  
  // Identify critical issues (header auth bypass in production)
  const headerAuthIssues = issues.filter(issue => 
    issue.category === 'headerAuthBypass' && 
    !issue.filePath.includes('test') &&
    !issue.filePath.includes('spec')
  );
  
  if (headerAuthIssues.length > 0) {
    report.criticalIssues.push({
      type: 'HEADER_AUTH_BYPASS',
      message: 'Header-based authentication bypass detected in production code',
      count: headerAuthIssues.length,
      files: headerAuthIssues.map(issue => issue.filePath)
    });
  }
  
  // Add recommendations
  if (headerAuthIssues.length > 0) {
    report.recommendations.push(
      'Remove all header-based authentication bypasses from production code',
      'Use proper authentication middleware with JWT tokens or sessions',
      'Gate any development authentication behind NODE_ENV and ALLOW_DEV_AUTH flags'
    );
  }
  
  return report;
}

/**
 * Main security check function
 */
function runSecurityCheck() {
  console.log('🔒 Running Security Check...\n');
  
  const startTime = Date.now();
  const issues = scanDirectory(process.cwd());
  const endTime = Date.now();
  
  const report = generateReport(issues);
  
  // Print report
  console.log('📊 Security Check Report');
  console.log('========================');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Duration: ${endTime - startTime}ms`);
  console.log(`Total Issues: ${report.totalIssues}`);
  console.log('');
  
  // Print categories
  for (const [category, categoryIssues] of Object.entries(report.categories)) {
    console.log(`${category.toUpperCase()}: ${categoryIssues.length} issues`);
    for (const issue of categoryIssues.slice(0, 5)) { // Show first 5 issues per category
      console.log(`  - ${issue.filePath}:${issue.lineNumbers.join(',')} (${issue.matches} matches)`);
    }
    if (categoryIssues.length > 5) {
      console.log(`  ... and ${categoryIssues.length - 5} more`);
    }
    console.log('');
  }
  
  // Print critical issues
  if (report.criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES DETECTED');
    console.log('===========================');
    for (const issue of report.criticalIssues) {
      console.log(`${issue.type}: ${issue.message}`);
      console.log(`Files affected: ${issue.files.join(', ')}`);
      console.log('');
    }
  }
  
  // Print recommendations
  if (report.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');
    for (const recommendation of report.recommendations) {
      console.log(`- ${recommendation}`);
    }
    console.log('');
  }
  
  // Exit with error code if critical issues found
  if (report.criticalIssues.length > 0) {
    console.log('❌ Security check failed! Critical issues must be resolved.');
    process.exit(1);
  } else if (report.totalIssues > 0) {
    console.log('⚠️  Security check completed with warnings. Review issues above.');
    process.exit(0);
  } else {
    console.log('✅ Security check passed! No issues found.');
    process.exit(0);
  }
}

// Run security check if this script is executed directly
if (require.main === module) {
  runSecurityCheck();
}

module.exports = {
  runSecurityCheck,
  scanFileForIssues,
  scanDirectory,
  generateReport,
  SECURITY_PATTERNS
};
