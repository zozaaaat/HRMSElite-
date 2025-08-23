import type { Request, Response } from 'express';
import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../../server/utils/antivirus', () => ({
  antivirusScanner: { scanBuffer: vi.fn(), getStatus: vi.fn() }
}));
vi.mock('../../server/utils/quarantine', () => ({ quarantineFile: vi.fn() }));
vi.mock('../../server/utils/logger', () => ({ log: { error: vi.fn(), info: vi.fn() } }));
vi.mock('../../server/utils/env', () => ({ default: { FILE_SIGNATURE_SECRET: 'test-secret' } }));

import { createScanFile } from '../../security/files';
import { antivirusScanner } from '../../server/utils/antivirus';

const createResponse = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  return res as Response;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scanFile middleware', () => {
  it('returns 400 when no file provided', async () => {
    const req = {} as Request;
    const res = createResponse();
    const next = vi.fn();

    const middleware = createScanFile();
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for clean files', async () => {
    const req = {
      file: { buffer: Buffer.from('test'), originalname: 'test.txt' }
    } as unknown as Request;
    const res = createResponse();
    const next = vi.fn();

    vi.spyOn(antivirusScanner, 'scanBuffer').mockResolvedValue({
      isClean: true,
      threats: [],
      scanTime: 1,
      provider: 'test'
    });

    const middleware = createScanFile();
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

