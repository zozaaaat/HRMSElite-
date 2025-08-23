#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

// Regex to find placeholder secrets after '=' or ':'
const PLACEHOLDER_PATTERN = /(=|:\s*)(["']?)(default|changeme|__REPLACE_WITH_STRONG_SECRET__)(?:\2)/i;

const files = execSync('git ls-files -z', { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter(f => f.startsWith('.env'));

const violations = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (PLACEHOLDER_PATTERN.test(line)) {
      violations.push({ file, line: idx + 1 });
    }
  });
}

if (violations.length > 0) {
  console.error('❌ Placeholder secrets detected:');
  violations.forEach(v => {
    console.error(` - ${v.file}:${v.line}`);
  });
  process.exit(1);
}

console.log('✅ No placeholder secrets found.');
