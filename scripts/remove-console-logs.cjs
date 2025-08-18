#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to match console statements
const consolePatterns = [
  /console\.log\([^)]*\);?/g,
  /console\.warn\([^)]*\);?/g,
  /console\.error\([^)]*\);?/g,
  /console\.info\([^)]*\);?/g,
  /console\.debug\([^)]*\);?/g,
  /console\.trace\([^)]*\);?/g,
  /console\.dir\([^)]*\);?/g,
  /console\.time\([^)]*\);?/g,
  /console\.timeEnd\([^)]*\);?/g,
  /console\.group\([^)]*\);?/g,
  /console\.groupEnd\([^)]*\);?/g,
  /console\.table\([^)]*\);?/g,
  /console\.clear\([^)]*\);?/g,
  /console\.count\([^)]*\);?/g,
  /console\.countReset\([^)]*\);?/g,
  /console\.assert\([^)]*\);?/g,
  /console\.profile\([^)]*\);?/g,
  /console\.profileEnd\([^)]*\);?/g,
  /console\.timeStamp\([^)]*\);?/g,
  /console\.memory/g,
  /console\.exception\([^)]*\);?/g,
  /console\.markTimeline\([^)]*\);?/g,
  /console\.timeline\([^)]*\);?/g,
  /console\.timelineEnd\([^)]*\);?/g
];

// Directories to process
const directories = [
  'client/src',
  'server',
  'electron'
];

// File extensions to process
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
  '*.demo.*'
];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => {
    if (pattern.includes('*')) {
      return glob.sync(pattern, { cwd: path.dirname(filePath) }).some(match => 
        filePath.includes(match)
      );
    }
    return filePath.includes(pattern);
  });
}

function removeConsoleStatements(content) {
  let modifiedContent = content;
  let removedCount = 0;

  consolePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      removedCount += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '');
    }
  });

  // Remove empty lines that might be left after removing console statements
  modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  return { content: modifiedContent, removedCount };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, removedCount } = removeConsoleStatements(content);

    if (removedCount > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Removed ${removedCount} console statement(s) from ${filePath}`);
      return removedCount;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return 0;
  }

  let totalRemoved = 0;
  const files = glob.sync(`**/*.{${extensions.join(',')}}`, { 
    cwd: dirPath,
    absolute: true,
    ignore: skipPatterns
  });

  files.forEach(file => {
    if (!shouldSkipFile(file)) {
      totalRemoved += processFile(file);
    }
  });

  return totalRemoved;
}

function main() {
  console.log('🔍 Starting console.log removal process...\n');

  let grandTotal = 0;

  directories.forEach(dir => {
    console.log(`📁 Processing directory: ${dir}`);
    const removed = processDirectory(dir);
    grandTotal += removed;
    console.log(`📊 Removed ${removed} console statement(s) from ${dir}\n`);
  });

  console.log(`🎉 Process completed! Total console statements removed: ${grandTotal}`);
  
  if (grandTotal > 0) {
    console.log('\n💡 Tip: Consider using a proper logging library for production environments.');
    console.log('   Examples: winston, pino, or debug');
  }
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleStatements, processFile, processDirectory };
