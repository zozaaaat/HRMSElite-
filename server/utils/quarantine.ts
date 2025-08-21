import { promises as fs } from 'fs';
import path from 'path';
import { log } from './logger';

const QUARANTINE_DIR = process.env.QUARANTINE_PATH || './quarantine';

export async function quarantineFile(buffer: Buffer, filename: string): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const filePath = path.join(QUARANTINE_DIR, `${timestamp}-${safeName}`);
  await fs.mkdir(QUARANTINE_DIR, { recursive: true });
  await fs.writeFile(filePath, buffer);
  log.warn('File quarantined', { filePath, filename: filename }, 'SECURITY');
  return filePath;
}
