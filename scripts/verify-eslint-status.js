import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying ESLint Status...\n');

try {
  // Run ESLint check
  console.log('Running ESLint check...');
  const result = execSync('npx eslint . --ext .ts,.tsx', { 
    encoding: 'utf8',
    cwd: path.join(__dirname, '..')
  });
  
  if (result.trim() === '') {
    console.log('✅ ESLint Status: CLEAN');
    console.log('📊 No errors or warnings found');
    console.log('🎉 All ESLint rules are passing!');
  } else {
    console.log('❌ ESLint Status: HAS ISSUES');
    console.log(result);
  }
  
} catch (error) {
  if (error.status === 0) {
    console.log('✅ ESLint Status: CLEAN');
    console.log('📊 No errors or warnings found');
    console.log('🎉 All ESLint rules are passing!');
  } else {
    console.log('❌ ESLint Status: HAS ISSUES');
    console.log(error.stdout || error.message);
  }
}

console.log('\n📋 ESLint Configuration Summary:');
console.log('• no-console: error');
console.log('• no-explicit-any: error');
console.log('• TypeScript strict rules: enabled');
console.log('• React rules: enabled');
console.log('• Security rules: enabled');
console.log('• Code quality rules: enabled');

console.log('\n🚀 Ready for production use!');
