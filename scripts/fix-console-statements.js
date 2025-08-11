import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to replace console statements with logger
function replaceConsoleStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace console.log with logger.info
    if (content.includes('console.log')) {
      content = content.replace(/console\.log\(/g, 'logger.info(');
      modified = true;
    }
    
    // Replace console.error with logger.error
    if (content.includes('console.error')) {
      content = content.replace(/console\.error\(/g, 'logger.error(');
      modified = true;
    }
    
    // Replace console.warn with logger.warn
    if (content.includes('console.warn')) {
      content = content.replace(/console\.warn\(/g, 'logger.warn(');
      modified = true;
    }
    
    // Replace console.info with logger.info
    if (content.includes('console.info')) {
      content = content.replace(/console\.info\(/g, 'logger.info(');
      modified = true;
    }
    
    // Replace console.debug with logger.debug
    if (content.includes('console.debug')) {
      content = content.replace(/console\.debug\(/g, 'logger.debug(');
      modified = true;
    }
    
    // Add logger import if needed
    if (modified && !content.includes('import.*logger')) {
      const importStatement = "import { logger } from '@utils/logger';\n";
      const lines = content.split('\n');
      
      // Find the last import statement
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
      } else {
        lines.unshift(importStatement);
      }
      
      content = lines.join('\n');
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed console statements in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const rootDir = path.join(__dirname, '..');
const tsFiles = findTsFiles(rootDir);

console.log(`Found ${tsFiles.length} TypeScript files to process...`);

for (const file of tsFiles) {
  replaceConsoleStatements(file);
}

console.log('Console statement replacement completed!');
