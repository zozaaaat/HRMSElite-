import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { SecureFileStorage, type StorageConfig } from '../server/utils/secureStorage';
import fs from 'fs/promises';
import path from 'path';

process.env.FILE_ENCRYPTION_KEY = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';

const tmpDir = path.join(process.cwd(), 'tmp-test-uploads');

const baseConfig: Omit<StorageConfig, 'provider'> = {
  s3Bucket: 'test-bucket',
  s3Region: 'us-east-1',
  localPath: tmpDir,
  urlExpiration: 60,
  maxFileSize: 1024,
  allowedMimeTypes: ['text/plain']
};

beforeEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('SecureFileStorage', () => {
  test('throws when S3 credentials are missing and does not store locally', async () => {
    const storage = new SecureFileStorage({
      ...baseConfig,
      provider: 's3'
    });
    const buffer = Buffer.from('hello');
    await expect(
      storage.storeFile(buffer, 'test.txt', 'text/plain', 'user1')
    ).rejects.toThrow();
    const filePath = path.join(tmpDir, 'private');
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  test('encrypts files and sets restrictive permissions for local storage', async () => {
    const storage = new SecureFileStorage({
      ...baseConfig,
      provider: 'local'
    });
    const buffer = Buffer.from('secret-data');
    const stored = await storage.storeFile(buffer, 'test.txt', 'text/plain', 'user1');
    const filePath = path.join(tmpDir, stored.key);
    const data = await fs.readFile(filePath);
    expect(data.equals(buffer)).toBe(false);
    const stats = await fs.stat(filePath);
    expect((stats.mode & 0o777)).toBe(0o600);
    const metaStats = await fs.stat(`${filePath}.meta.json`);
    expect((metaStats.mode & 0o777)).toBe(0o600);
  });
});
