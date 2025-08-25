import fs from 'fs';

const required = [
  'ACCESS_JWT_SECRET',
  'REFRESH_JWT_SECRET',
  'SESSION_SECRET',
  'DB_ENCRYPTION_KEY',
  'FILE_SIGNATURE_SECRET'
];

const examplePath = fs.existsSync('.env.example') ? '.env.example' : 'env.example';
const envExample = fs.readFileSync(examplePath,'utf8');
const missing = [];

for (const key of required) {
  const m = envExample.match(new RegExp(`^${key}=.*$`, 'm'));
  if (!m) missing.push(`${key} missing in .env.example`);
  else if (/=\s*$/.test(m[0]) || /<|replace|change-me/i.test(m[0])) {
    missing.push(`${key} is empty/placeholder in .env.example`);
  }
}

if (missing.length) {
  console.error('❌ Secret template check failed:\n' + missing.map(s => '- ' + s).join('\n'));
  process.exit(1);
}
console.log('✅ Secret template check passed');
