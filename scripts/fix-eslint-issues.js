#!/usr/bin/env node

/**
 * ESLint Issues Fix Script
 * Automatically fixes common ESLint issues in the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.info('🔧 Starting ESLint issues fix...');

// Function to recursively find all TypeScript and JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Function to fix common issues in a file
function fixFileIssues(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix 1: Remove unused imports
    const importRegex = /import\s+{[^}]*}\s+from\s+['"][^'"]+['"];?\s*\n?/g;
    const imports = content.match(importRegex) || [];
    
    for (const importStatement of imports) {
      // Check if any of the imported items are actually used
      const importedItems = importStatement.match(/\{([^}]+)\}/)?.[1]?.split(',').map(s => s.trim()) || [];
      
      for (const item of importedItems) {
        const itemName = item.split(' as ')[0].trim();
        if (!content.includes(itemName) || content.indexOf(itemName) === content.indexOf(importStatement)) {
          // Item is not used, remove it from import
          const newImport = importStatement.replace(itemName, '').replace(/,\s*,/g, ',').replace(/,\s*}/g, '}');
          if (newImport !== importStatement) {
            content = content.replace(importStatement, newImport);
            modified = true;
          }
        }
      }
    }
    
    // Fix 2: Remove duplicate imports
    const importLines = content.match(/import\s+.*from\s+['"][^'"]+['"];?\s*\n?/g) || [];
    const uniqueImports = new Set();
    const cleanedImports = [];
    
    for (const importLine of importLines) {
      if (!uniqueImports.has(importLine.trim())) {
        uniqueImports.add(importLine.trim());
        cleanedImports.push(importLine);
      }
    }
    
    if (cleanedImports.length !== importLines.length) {
      // Replace all imports with unique ones
      let newContent = content;
      for (const importLine of importLines) {
        newContent = newContent.replace(importLine, '');
      }
      for (const cleanImport of cleanedImports) {
        newContent = cleanImport + '\n' + newContent;
      }
      content = newContent;
      modified = true;
    }
    
    // Fix 3: Add missing semicolons
    content = content.replace(/([^;])\n(export|import|const|let|var|function|class)/g, '$1;\n$2');
    
    // Fix 4: Remove trailing spaces
    content = content.replace(/[ \t]+$/gm, '');
    
    // Fix 5: Add proper spacing around operators
    content = content.replace(/([^=!<>])=([^=])/g, '$1 = $2');
    content = content.replace(/([^=!<>])==([^=])/g, '$1 == $2');
    content = content.replace(/([^=!<>])===([^=])/g, '$1 === $2');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.info(`✅ Fixed issues in ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Main execution
try {
  console.log('📁 Scanning for files...');
  const files = findFiles('.');
  console.log(`📄 Found ${files.length} files to process`);
  
  let fixedCount = 0;
  for (const file of files) {
    try {
      fixFileIssues(file);
      fixedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`✅ Fixed issues in ${fixedCount} files`);
  
  // Run ESLint to check remaining issues
  console.log('🔍 Running ESLint to check remaining issues...');
  try {
    execSync('npx eslint . --ext .ts,.tsx,.js,.jsx --format=compact', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Some ESLint issues remain. Please fix them manually.');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

console.log('🎉 ESLint fix script completed!');
