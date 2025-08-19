// Node script to enforce bundle size budgets after Vite build
// Fails the build if the main entry chunk exceeds the gzipped threshold.

import fs from 'fs';
import path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const MANIFEST_PATH = path.join(DIST_DIR, '.vite', 'manifest.json');

// Default 170KB gz limit for main entry chunk
const MAIN_GZIP_LIMIT_BYTES = Number(process.env.MAIN_GZIP_LIMIT_BYTES || 170 * 1024);

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function gzipSize(filePath) {
  const source = fs.createReadStream(filePath);
  const gz = createGzip({ level: 9 });
  let size = 0;
  gz.on('data', (chunk) => {
    size += chunk.length;
  });
  await pipe(source, gz);
  return size;
}

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest not found at ${MANIFEST_PATH}. Ensure Vite build with manifest enabled.`);
    process.exit(1);
  }

  const manifestRaw = fs.readFileSync(MANIFEST_PATH, 'utf-8');
  const manifest = JSON.parse(manifestRaw);

  // Find the entry for src/main.tsx or src/main.ts
  const entryKey = Object.keys(manifest).find((k) => manifest[k]?.isEntry);
  if (!entryKey) {
    console.error('No entry chunk found in manifest.');
    process.exit(1);
  }

  const entryFileRel = manifest[entryKey]?.file;
  if (!entryFileRel) {
    console.error('Entry file not found in manifest.');
    process.exit(1);
  }

  const entryFilePath = path.join(DIST_DIR, entryFileRel);
  if (!fs.existsSync(entryFilePath)) {
    console.error(`Entry file not found at ${entryFilePath}`);
    process.exit(1);
  }

  const gzSize = await gzipSize(entryFilePath);

  const limit = MAIN_GZIP_LIMIT_BYTES;
  const ok = gzSize <= limit;
  const status = ok ? 'OK' : 'FAIL';
  console.log(`Main entry gzipped size: ${formatKb(gzSize)} (limit ${formatKb(limit)}) -> ${status}`);

  if (!ok) {
    console.error(`Bundle budget exceeded: main entry gz size ${formatKb(gzSize)} > ${formatKb(limit)}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


