import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {storage} from '../server/models/storage';
import {db} from '../server/models/db';
import {notifications, documents} from '../shared/schema';

describe('DatabaseStorage utility methods', () => {
  beforeEach(async () => {
    await db.delete(notifications);
    await db.delete(documents);
  });

  afterEach(async () => {
    await db.delete(notifications);
    await db.delete(documents);
  });

  describe('getUnreadNotificationCount', () => {
    it('returns correct count of unread notifications', async () => {
      const userId = 'user-1';

      await db.insert(notifications).values([
        {
          userId,
          type: 'info',
          title: 't1',
          message: 'm1',
          isRead: false,
          data: '{}'
        },
        {
          userId,
          type: 'alert',
          title: 't2',
          message: 'm2',
          isRead: false,
          data: '{}'
        },
        {
          userId,
          type: 'info',
          title: 't3',
          message: 'm3',
          isRead: true,
          data: '{}'
        },
        {
          userId: 'other',
          type: 'info',
          title: 't4',
          message: 'm4',
          isRead: false,
          data: '{}'
        }
      ] as typeof notifications.$inferInsert[]);

      const count = await storage.getUnreadNotificationCount(userId);
      expect(count).toBe(2);
    });

    it('throws an error when database query fails', async () => {
      const spy = vi.spyOn(db, 'select').mockImplementation(() => {
        throw new Error('db failure');
      });
      await expect(storage.getUnreadNotificationCount('user-1'))
        .rejects.toThrow('Failed to fetch unread notification count');
      spy.mockRestore();
    });
  });

  describe('getEntityDocuments', () => {
    it('returns documents for the given entity', async () => {
      const uploader = 'uploader-1';

      await db.insert(documents).values([
        {
          entityId: 'emp-1',
          entityType: 'employee',
          name: 'Doc1',
          type: 'pdf',
          fileName: 'doc1.pdf',
          fileUrl: 'http://example.com/doc1.pdf',
          uploadedBy: uploader
        },
        {
          entityId: 'emp-1',
          entityType: 'employee',
          name: 'Doc2',
          type: 'image',
          fileName: 'doc2.png',
          fileUrl: 'http://example.com/doc2.png',
          uploadedBy: uploader
        },
        {
          entityId: 'emp-2',
          entityType: 'employee',
          name: 'Other',
          type: 'pdf',
          fileName: 'other.pdf',
          fileUrl: 'http://example.com/other.pdf',
          uploadedBy: uploader
        }
      ] as typeof documents.$inferInsert[]);

      const docs = await storage.getEntityDocuments('employee', 'emp-1');
      expect(docs).toHaveLength(2);
      expect(docs.every((d) => d.entityId === 'emp-1')).toBe(true);
    });

    it('throws an error when database query fails', async () => {
      const spy = vi.spyOn(db, 'select').mockImplementation(() => {
        throw new Error('db failure');
      });
      await expect(storage.getEntityDocuments('employee', 'emp-1'))
        .rejects.toThrow('Failed to fetch documents');
      spy.mockRestore();
    });
  });
});

