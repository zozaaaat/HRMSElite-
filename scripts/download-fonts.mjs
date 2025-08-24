import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function downloadFamily(family, weights, subset, prefix) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;
  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) {
    console.error(`Failed to fetch CSS for ${family}`);
    return;
  }
  const css = await res.text();
  const regex = /\/\*\s*(.*?)\s*\*\/[\s\S]*?font-weight:\s*(\d+);[\s\S]*?src: url\(([^)]+)\) format\('woff2'\)/g;
  const files = {};
  let match;
  while ((match = regex.exec(css)) !== null) {
    const blockSubset = match[1].trim();
    const weight = match[2];
    const url = match[3];
    if (blockSubset === subset && !files[weight]) {
      files[weight] = url;
    }
  }
  for (const [weight, url] of Object.entries(files)) {
    const fontRes = await fetch(url);
    if (!fontRes.ok) {
      console.error(`Failed to download ${url}`);
      continue;
    }
    const buffer = Buffer.from(await fontRes.arrayBuffer());
    const dest = path.join('public', 'fonts', `${prefix}-${weight}.woff2`);
    await writeFile(dest, buffer);
    console.log(`Downloaded ${prefix}-${weight}.woff2`);
  }
}

await mkdir('public/fonts', { recursive: true });
await downloadFamily('Roboto', [300,400,500,700], 'latin', 'roboto');
await downloadFamily('Noto Sans Arabic', [300,400,500,600,700], 'arabic', 'noto-sans-arabic');
