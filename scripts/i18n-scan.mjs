#!/usr/bin/env node
import { glob } from 'glob';
import fs from 'fs/promises';

// Allowed words that can appear in source without translation
const ALLOWED = [
  'HRMSElite',
  'HRMS',
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js'
];

// Glob all .tsx files excluding tests and data directories
const files = await glob('**/*.tsx', {
  ignore: [
    '**/node_modules/**',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**',
    '**/data/**',
    '**/backup-console-logs/**'
  ]
});

const uncovered = [];
const stringRegex = /(['"`])((?:\\.|(?!\1).)*?)\1/g;

for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  let match;
  while ((match = stringRegex.exec(content)) !== null) {
    const text = match[2].trim();
    if (!/[A-Z\u0600-\u06FF]/.test(text)) continue; // Require uppercase Latin or any Arabic letters to reduce false positives
    if (ALLOWED.some((w) => text.includes(w))) continue;
    const before = content.slice(0, match.index);
    const prefix = before.slice(-20);
    if (/t\s*\($/.test(prefix)) continue; // Skip translation function calls
    if (/\w+\s*=\s*$/.test(prefix)) continue; // Skip attribute assignments like className=""
    if (text.includes('/') || text.includes('@')) continue; // Skip paths and scoped packages
    if (!text.includes(' ') && /^[A-Za-z0-9_-]+$/.test(text)) continue; // Likely non-display strings or class names
    uncovered.push({ file, text });
  }
}

if (uncovered.length > 0) {
  console.error('Non-externalized strings found:');
  for (const { file, text } of uncovered) {
    console.error(`- ${file}: "${text}"`);
  }
  console.error(`Total: ${uncovered.length}`);
  process.exit(1);
} else {
  console.log('No non-externalized strings found.');
}
