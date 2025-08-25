import { describe, it, expect, vi, beforeAll } from 'vitest';
import cron from 'node-cron';
import { maskPII, PII_CLASSIFICATION } from '../server/utils/pii';

let DataMaskingManager: any;
beforeAll(async () => {
  const dummy = 'x'.repeat(32);
  process.env.ACCESS_JWT_SECRET = dummy;
  process.env.REFRESH_JWT_SECRET = dummy;
  process.env.SESSION_SECRET = dummy;
  process.env.DB_ENCRYPTION_KEY = dummy;
  process.env.FILE_SIGNATURE_SECRET = dummy;
  process.env.METRICS_TOKEN = dummy;
  ({ DataMaskingManager } = await import('../server/utils/dataMasking'));
});

describe('PII utilities', () => {
  it('masks email, phone, and IDs', () => {
    const input = { email: 'test@example.com', phone: '1234567890', civilId: 'AB1234567' };
    const masked = maskPII(input);
    expect(masked.email).not.toBe(input.email);
    expect(masked.phone).not.toBe(input.phone);
    expect(masked.civilId).not.toBe(input.civilId);
  });

  it('classifies user email', () => {
    expect(PII_CLASSIFICATION.users.email).toBe('email');
  });

  it('schedules retention jobs', () => {
    const scheduleSpy = vi.spyOn(cron, 'schedule').mockReturnValue({} as any);
    const manager = new DataMaskingManager();
    manager.scheduleRetentionJobs('* * * * *');
    expect(scheduleSpy).toHaveBeenCalledWith('* * * * *', expect.any(Function));
    scheduleSpy.mockRestore();
  });
});
