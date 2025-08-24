#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

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
      violations.push(`${file}:${idx + 1} contains placeholder secret`);
      return;
    }
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
    if (match) {
      const [_, key, value] = match;
      const cleaned = value.trim().replace(/^['"]|['"]$/g, '');
      if ((key.includes('SECRET') || key.includes('KEY')) && cleaned && cleaned.length < 32) {
        violations.push(`${file}:${idx + 1} ${key} is too short`);
      }
    }
  });
}

if (violations.length > 0) {
  console.error('❌ Weak or placeholder secrets detected:');
  violations.forEach(v => console.error(` - ${v}`));
  process.exit(1);
}

console.log('✅ Secrets check passed.');
