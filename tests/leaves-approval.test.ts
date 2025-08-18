import {describe, it, expect, beforeAll} from 'vitest';
import Database from 'better-sqlite3';
import {storage} from '../server/models/storage';

const approverId = 'approver-1';
let db: Database;

beforeAll(() => {
  db = new Database('dev.db');
  db.exec(`CREATE TABLE IF NOT EXISTS employee_leaves (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'pending',
    start_date TEXT,
    end_date TEXT,
    days INTEGER,
    reason TEXT,
    approved_by TEXT,
    approved_at INTEGER,
    rejection_reason TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );`);
});

function insertLeave(): string {
  const id = Math.random().toString(36).slice(2);
  db.prepare(`INSERT INTO employee_leaves (id, employee_id, type, status, start_date, end_date, days, reason)
    VALUES (?, 'emp1', 'annual', 'pending', '2025-01-01', '2025-01-02', 2, 'vacation')`).run(id);
  return id;
}

describe('Leave approval and rejection', () => {
  it('approves a leave request', async () => {
    const leaveId = insertLeave();
    const result = await storage.approveLeave(leaveId, approverId);
    expect(result.status).toBe('approved');
    expect(result.approvedBy).toBe(approverId);
    expect(result.rejectionReason).toBeNull();
  });

  it('rejects a leave request with reason', async () => {
    const leaveId = insertLeave();
    const result = await storage.rejectLeave(leaveId, approverId, 'No balance');
    expect(result.status).toBe('rejected');
    expect(result.rejectionReason).toBe('No balance');
    expect(result.approvedBy).toBe(approverId);
  });

  it('throws error when approving non-existent leave', async () => {
    await expect(storage.approveLeave('non-existent', approverId)).rejects.toThrow('Leave not found');
  });

  it('throws error when rejecting non-existent leave', async () => {
    await expect(storage.rejectLeave('non-existent', approverId, 'reason')).rejects.toThrow('Leave not found');
  });
});
