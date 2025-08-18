#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to match console.log specifically
const consolePatterns = [
  { pattern: /console\.log\([^)]*\);?/g, name: 'console.log' }
];

// Directories to check
const directories = [
  'client/src',
  'server',
  'electron',
  'hrms-mobile'
];

// File extensions to check
const extensions = ['js', 'ts', 'tsx', 'jsx'];

// Skip these files/directories
const skipPatterns = [
  'node_modules',
  '.vite',
  'dist',
  'build',
  'coverage',
  'test-reports',
  '*.test.*',
  '*.spec.*',
  '*.config.*',
  '*.setup.*',
  '*.mock.*',
  '*.stub.*',
  '*.fixture.*',
  '*.example.*',
  '*.demo.*',
  'backup-console-logs',
  '.backup'
];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => {
    if (pattern.includes('*')) {
      return filePath.includes(pattern.replace('*', ''));
    }
    return filePath.includes(pattern);
  });
}

function findConsoleStatements(content, filePath) {
  const results = [];
  
  consolePatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      results.push({
        file: filePath,
        type: name,
        count: matches.length,
        lines: matches.map(match => {
          const lines = content.split('\n');
          const lineIndex = lines.findIndex(line => line.includes(match.trim()));
          return lineIndex >= 0 ? lineIndex + 1 : 'unknown';
        })
      });
    }
  });
  
  return results;
}

async function checkDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return [];
  }

  const results = [];
  const files = await glob(`**/*.{${extensions.join(',')}}`, { 
    cwd: dirPath,
    absolute: true,
    ignore: skipPatterns
  });

  for (const file of files) {
    if (!shouldSkipFile(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileResults = findConsoleStatements(content, file);
        results.push(...fileResults);
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error.message);
      }
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Checking for console.log statements in codebase...\n');

  let allResults = [];

  for (const dir of directories) {
    console.log(`📁 Checking directory: ${dir}`);
    const results = await checkDirectory(dir);
    allResults.push(...results);
    
    if (results.length > 0) {
      console.log(`❌ Found ${results.length} console.log statement(s) in ${dir}`);
    } else {
      console.log(`✅ No console.log statements found in ${dir}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('===========');
  
  if (allResults.length === 0) {
    console.log('🎉 No console.log statements found! Codebase is clean.');
    process.exit(0);
  }

  console.log(`❌ Found ${allResults.length} console.log statement(s) total`);
  
  // Group by file
  const byFile = {};
  allResults.forEach(result => {
    if (!byFile[result.file]) {
      byFile[result.file] = [];
    }
    byFile[result.file].push(result);
  });

  console.log('\n📋 Console.log statements by file:');
  console.log('==================================');
  
  Object.entries(byFile).forEach(([file, results]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\n📄 ${relativePath}:`);
    results.forEach(result => {
      console.log(`   - ${result.type}: ${result.count} occurrence(s) on line(s): ${result.lines.join(', ')}`);
    });
  });

  console.log('\n💡 Recommendations:');
  console.log('==================');
  console.log('1. Replace console.log with proper logging library');
  console.log('2. Use logger from @/lib/logger for client-side logging');
  console.log('3. Use winston or pino for server-side logging');
  console.log('4. Run: node scripts/remove-console-logs.js to remove them');
  
  process.exit(1);
}

main().catch(console.error);
