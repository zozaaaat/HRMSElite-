#!/usr/bin/env node

/**
 * @fileoverview Console Log Cleanup Script for HRMS Elite
 * @description Automatically removes console.log and console.debug statements from the codebase
 * @author HRMS Elite Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || args.includes('-d');
const isVerbose = args.includes('--verbose') || args.includes('-v');
const shouldShowHelp = args.includes('--help') || args.includes('-h');

// Configuration
const CONFIG = {
  // Directories to scan
  directories: [
    'client/src',
    'server',
    'hrms-mobile',
    'tests'
  ],
  
  // File extensions to process
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  
  // Console methods to remove (keep console.error for error handling)
  consoleMethodsToRemove: ['console.log', 'console.debug', 'console.info', 'console.warn'],
  
  // Console methods to preserve
  consoleMethodsToPreserve: ['console.error'],
  
  // Backup directory
  backupDir: 'backup-console-logs',
  
  // Log file
  logFile: 'console-cleanup-report.md',
  
  // Runtime options
  dryRun: isDryRun,
  verbose: isVerbose
};

/**
 * Check if file should be processed
 * @param {string} filePath - File path to check
 * @returns {boolean} Whether file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return CONFIG.extensions.includes(ext) && 
         !filePath.includes('node_modules') &&
         !filePath.includes('.git') &&
         !filePath.includes(CONFIG.backupDir);
}

/**
 * Create backup of file
 * @param {string} filePath - Path to file to backup
 */
function createBackup(filePath) {
  const backupPath = path.join(CONFIG.backupDir, filePath);
  const backupDir = path.dirname(backupPath);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  fs.copyFileSync(filePath, backupPath);
}

/**
 * Remove console statements from file content
 * @param {string} content - File content
 * @returns {Object} Object with cleaned content and statistics
 */
function removeConsoleStatements(content) {
  const originalLines = content.split('\n');
  const cleanedLines = [];
  let removedCount = 0;
  let preservedCount = 0;
  
  for (let i = 0; i < originalLines.length; i++) {
    const line = originalLines[i];
    const trimmedLine = line.trim();
    
    // Check if line contains console statements to remove
    const hasConsoleToRemove = CONFIG.consoleMethodsToRemove.some(method => 
      trimmedLine.includes(method)
    );
    
    // Check if line contains console statements to preserve
    const hasConsoleToPreserve = CONFIG.consoleMethodsToPreserve.some(method => 
      trimmedLine.includes(method)
    );
    
    if (hasConsoleToRemove) {
      // Skip this line (remove it)
      removedCount++;
      continue;
    }
    
    if (hasConsoleToPreserve) {
      preservedCount++;
    }
    
    cleanedLines.push(line);
  }
  
  return {
    content: cleanedLines.join('\n'),
    removedCount,
    preservedCount
  };
}

/**
 * Process a single file
 * @param {string} filePath - Path to file to process
 * @returns {Object} Processing statistics
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: cleanedContent, removedCount, preservedCount } = removeConsoleStatements(content);
    
    if (removedCount > 0) {
      if (CONFIG.dryRun) {
        // In dry run mode, just report what would be done
        if (CONFIG.verbose) {
          console.log(`  🔍 Would remove ${removedCount} console statements from: ${filePath}`);
        }
        return {
          filePath,
          removedCount,
          preservedCount,
          success: true,
          dryRun: true
        };
      } else {
        // Create backup before modifying
        createBackup(filePath);
        
        // Write cleaned content back to file
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        
        if (CONFIG.verbose) {
          console.log(`  ✅ Removed ${removedCount} console statements from: ${filePath}`);
        }
        
        return {
          filePath,
          removedCount,
          preservedCount,
          success: true
        };
      }
    }
    
    return {
      filePath,
      removedCount: 0,
      preservedCount,
      success: true
    };
  } catch (error) {
    return {
      filePath,
      error: error.message,
      success: false
    };
  }
}

/**
 * Recursively find all files in directory
 * @param {string} dir - Directory to scan
 * @returns {string[]} Array of file paths
 */
function findFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath));
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Generate cleanup report
 * @param {Array} results - Processing results
 */
function generateReport(results) {
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  const totalRemoved = successfulResults.reduce((sum, r) => sum + r.removedCount, 0);
  const totalPreserved = successfulResults.reduce((sum, r) => sum + r.preservedCount, 0);
  
  const report = `# Console Log Cleanup Report

## Summary
- **Total files processed:** ${results.length}
- **Successful operations:** ${successfulResults.length}
- **Failed operations:** ${failedResults.length}
- **Total console statements removed:** ${totalRemoved}
- **Total console statements preserved:** ${totalPreserved}

## Console Methods Removed
${CONFIG.consoleMethodsToRemove.map(method => `- \`${method}\``).join('\n')}

## Console Methods Preserved
${CONFIG.consoleMethodsToPreserve.map(method => `- \`${method}\``).join('\n')}

## Files Modified
${successfulResults
  .filter(r => r.removedCount > 0)
  .map(r => `- **${r.filePath}**: ${r.removedCount} removed, ${r.preservedCount} preserved`)
  .join('\n')}

## Files with Errors
${failedResults.map(r => `- **${r.filePath}**: ${r.error}`).join('\n')}

## Backup Location
Backups of modified files are stored in: \`${CONFIG.backupDir}/\`

## Timestamp
Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(CONFIG.logFile, report, 'utf8');
  console.log(`📄 Report generated: ${CONFIG.logFile}`);
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🧹 HRMS Elite Console Log Cleanup Tool

USAGE:
  node scripts/cleanup-console-logs.js [OPTIONS]

OPTIONS:
  --dry-run, -d     Show what would be removed without making changes
  --verbose, -v     Show detailed output for each file
  --help, -h        Show this help message

EXAMPLES:
  node scripts/cleanup-console-logs.js                    # Remove console statements
  node scripts/cleanup-console-logs.js --dry-run          # Preview changes only
  node scripts/cleanup-console-logs.js --verbose          # Detailed output
  node scripts/cleanup-console-logs.js --dry-run --verbose # Preview with details

FEATURES:
  ✅ Automatically removes console.log, console.debug, console.info, console.warn
  ✅ Preserves console.error statements for error handling
  ✅ Creates backups of modified files
  ✅ Generates detailed cleanup report
  ✅ Supports TypeScript, JavaScript, TSX, and JSX files
  ✅ Processes client, server, mobile, and test directories

`);
}

/**
 * Main execution function
 */
function main() {
  // Show help if requested
  if (shouldShowHelp) {
    showHelp();
    return;
  }
  
  const mode = CONFIG.dryRun ? 'DRY RUN' : 'LIVE';
  console.log(`🧹 Starting Console Log Cleanup (${mode})...\n`);
  
  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  // Create backup directory only if not in dry run mode
  if (!CONFIG.dryRun && !fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // Find all files to process
  const allFiles = [];
  for (const dir of CONFIG.directories) {
    if (fs.existsSync(dir)) {
      allFiles.push(...findFiles(dir));
    }
  }
  
  console.log(`📁 Found ${allFiles.length} files to process\n`);
  
  // Process each file
  const results = [];
  let processedCount = 0;
  
  for (const filePath of allFiles) {
    if (!CONFIG.verbose) {
      process.stdout.write(`\r🔄 Processing: ${path.basename(filePath)} (${processedCount + 1}/${allFiles.length})`);
    }
    
    const result = processFile(filePath);
    results.push(result);
    processedCount++;
  }
  
  if (!CONFIG.verbose) {
    console.log('\n');
  }
  
  console.log('✅ Processing completed!\n');
  
  // Generate report
  generateReport(results);
  
  // Display summary
  const successfulResults = results.filter(r => r.success);
  const totalRemoved = successfulResults.reduce((sum, r) => sum + r.removedCount, 0);
  const dryRunResults = results.filter(r => r.dryRun);
  
  console.log('📊 Summary:');
  console.log(`   Files processed: ${results.length}`);
  console.log(`   Console statements ${CONFIG.dryRun ? 'that would be removed' : 'removed'}: ${totalRemoved}`);
  
  if (!CONFIG.dryRun) {
    console.log(`   Backup directory: ${CONFIG.backupDir}/`);
  }
  console.log(`   Report file: ${CONFIG.logFile}`);
  
  if (totalRemoved > 0) {
    if (CONFIG.dryRun) {
      console.log('\n🔍 Dry run completed! Review the report and run without --dry-run to apply changes.');
    } else {
      console.log('\n🎉 Console log cleanup completed successfully!');
      console.log('💡 Remember to test your application after cleanup.');
    }
  } else {
    console.log('\n✨ No console statements found to remove.');
  }
}

// Run the script
main();

export {
  removeConsoleStatements,
  processFile,
  findFiles,
  generateReport
}; 