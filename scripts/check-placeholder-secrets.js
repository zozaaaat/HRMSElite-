#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

const PLACEHOLDERS = [
  'default-secret',
  '__REPLACE_WITH_STRONG_SECRET__',
  'changeme',
  'your-secret',
  'placeholder-secret',
  'defaultpassword'
];

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter(f => {
    const lower = f.toLowerCase();
    if (lower.includes('node_modules')) return false;
    if (lower.startsWith('docs/')) return false;
    if (lower.endsWith('.md')) return false;
    if (lower === 'scripts/check-placeholder-secrets.js') return false;
    if (lower === 'server/utils/env.ts') return false;
    if (lower === 'package.json') return false;
    if (lower.startsWith('.env')) return true;
    return /(\.ts|\.js|\.tsx|\.jsx|\.cjs|\.mjs|\.json)$/i.test(lower);
  });

const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const placeholder of PLACEHOLDERS) {
    if (content.includes(placeholder)) {
      violations.push({ file, placeholder });
    }
  }
}

if (violations.length > 0) {
  console.error('❌ Placeholder secrets detected:');
  for (const v of violations) {
    console.error(` - ${v.placeholder} found in ${v.file}`);
  }
  process.exit(1);
}

console.log('✅ No placeholder secrets found.');
