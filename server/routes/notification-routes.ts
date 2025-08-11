import {Router} from 'express';
import {db} from '../models/db';
import {notifications, type Notification, type InsertNotification} from '../../shared/schema';
import {eq, and, desc, count} from 'drizzle-orm';
import {log} from '../utils/logger';

const router = Router();

// تعريف أنواع البيانات للـ query parameters
interface GetNotificationsQuery {
  isRead?: 'true' | 'false';
  type?: string;
  limit?: string;
  offset?: string;
}

// الحصول على جميع إشعارات المستخدم
router.get<{}, Notification[] | {error: string}, {}, GetNotificationsQuery>('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    const {isRead, type, limit = '50', offset = '0'} = req.query;
    const limitNum = Math.min(200, Math.max(0, Number(limit) || 50));
    const offsetNum = Math.max(0, Number(offset) || 0);

    const whereConditions = [eq(notifications.userId, userId)];

    if (isRead !== undefined) {
      whereConditions.push(eq(notifications.isRead, isRead === 'true'));
    }

    if (type) {
      whereConditions.push(eq(notifications.type, type));
    }

    const notificationsData = await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    res.json(notificationsData);
  } catch (error) {
    log.error('خطأ في الحصول على الإشعارات:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

// الحصول على عدد الإشعارات غير المقروءة
router.get<{}, number | {error: string}>('/unread-count', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    const result = await db
      .select({count: count()})
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    res.json(result[0]?.count ?? 0);
  } catch (error) {
    log.error('خطأ في الحصول على عدد الإشعارات غير المقروءة:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

// تحديث حالة الإشعار إلى مقروء
router.patch<{id: string}, Notification | {error: string}>('/:id/read', async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    if (!notificationId) {
      return res.status(400).json({'error': 'معرف الإشعار مطلوب'});
    }

    const [updatedNotification] = await db
      .update(notifications)
      .set({isRead: true})
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (!updatedNotification) {
      return res.status(404).json({'error': 'الإشعار غير موجود'});
    }

    res.json(updatedNotification);
  } catch (error) {
    log.error('خطأ في تحديث حالة الإشعار:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

// تحديث جميع إشعارات المستخدم إلى مقروءة
router.patch<{}, {message: string} | {error: string}>('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    await db
      .update(notifications)
      .set({isRead: true})
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({'message': 'تم تحديث جميع الإشعارات'});
  } catch (error) {
    log.error('خطأ في تحديث جميع الإشعارات:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

// حذف إشعار
router.delete<{id: string}, {message: string} | {error: string}>('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    if (!notificationId) {
      return res.status(400).json({'error': 'معرف الإشعار مطلوب'});
    }

    const [deletedNotification] = await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .returning();

    if (!deletedNotification) {
      return res.status(404).json({'error': 'الإشعار غير موجود'});
    }

    res.json({'message': 'تم حذف الإشعار بنجاح'});
  } catch (error) {
    log.error('خطأ في حذف الإشعار:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

// إنشاء إشعار جديد
interface CreateNotificationBody {
  type: string;
  title: string;
  message: string;
  data?: unknown;
  companyId?: string | null;
}

router.post<{}, Notification | {error: string}, CreateNotificationBody>('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({'error': 'غير مصرح'});
    }

    const {type, title, message, data, companyId} = req.body;
    if (!type || !title || !message) {
      return res.status(400).json({'error': 'جميع الحقول مطلوبة'});
    }

    const payload: InsertNotification = {
      userId,
      companyId: companyId ?? null,
      type,
      title,
      message,
      data: typeof data === 'string' ? data : JSON.stringify(data ?? {}),
      isRead: false,
      createdAt: new Date()
    };

    const [created] = await db.insert(notifications).values(payload).returning();
    res.status(201).json(created);
  } catch (error) {
    log.error('خطأ في إنشاء الإشعار:', error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({'error': 'خطأ في الخادم'});
  }
});

export default router;
