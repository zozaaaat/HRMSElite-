import {useState, useEffect, useCallback} from 'react';
import {notificationService} from '../services/notifications';
import type {Notification} from '../../../shared/schema';
import {useToast} from './use-toast';

interface UseNotificationsOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications ({
  userId,
  autoRefresh = true,
  refreshInterval = 30000
}: UseNotificationsOptions) {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  // تحميل الإشعارات
  const loadNotifications = useCallback(async () => {

    if (!userId) {

      return;

    }

    try {

      setIsLoading(true);
      setError(null);

      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications({'limit': 50}),
        notificationService.getUnreadCount()
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحميل الإشعارات';
      setError(errorMessage);
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });

    } finally {

      setIsLoading(false);

    }

  }, [userId, toast]);

  // تحديث حالة الإشعار إلى مقروء
  const markAsRead = useCallback(async (notificationId: string) => {

    try {

      await notificationService.markAsRead(notificationId);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? {...notification, 'isRead': true}
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        'title': 'تم',
        'description': 'تم تحديث حالة الإشعار'
      });

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث حالة الإشعار';
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });

    }

  }, [toast]);

  // تحديث جميع الإشعارات إلى مقروءة
  const markAllAsRead = useCallback(async () => {

    try {

      await notificationService.markAllAsRead();

      setNotifications(prev =>
        prev.map(notification => ({...notification, 'isRead': true}))
      );
      setUnreadCount(0);

      toast({
        'title': 'تم',
        'description': 'تم تحديث جميع الإشعارات'
      });

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في تحديث الإشعارات';
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });

    }

  }, [toast]);

  // حذف إشعار
  const deleteNotification = useCallback(async (notificationId: string) => {

    try {

      await notificationService.deleteNotification(notificationId);

      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      if (notification && !notification.isRead) {

        setUnreadCount(prev => Math.max(0, prev - 1));

      }

      toast({
        'title': 'تم',
        'description': 'تم حذف الإشعار'
      });

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في حذف الإشعار';
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });

    }

  }, [notifications, toast]);

  // إنشاء إشعار جديد
  const createNotification = useCallback(async (notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    companyId?: string;
  }) => {

    try {

      const newNotification = await notificationService.createNotification({
        userId,
        ...notification,
        'data': JSON.stringify(notification.data ?? {})
      });

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      toast({
        'title': 'تم',
        'description': 'تم إنشاء الإشعار بنجاح'
      });

      return newNotification;

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في إنشاء الإشعار';
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });
      throw err;

    }

  }, [userId, toast]);

  // إنشاء إشعارات تلقائية للنظام
  const createSystemNotification = useCallback(async (
    type: 'license_expiry' | 'leave_request' | 'attendance_alert' | 'document_upload',
    title: string,
    message: string,
    data: Record<string, unknown> = {}
  ) => {

    try {

      const newNotification = await notificationService.createSystemNotification(
        userId,
        type,
        title,
        message,
        data
      );

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      return newNotification;

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'خطأ في إنشاء إشعار النظام';
      toast({
        'title': 'خطأ',
        'description': errorMessage,
        'variant': 'destructive'
      });
      throw err;

    }

  }, [userId, toast]);

  // تحميل الإشعارات عند بدء التطبيق
  useEffect(() => {

    loadNotifications();

  }, [loadNotifications]);

  // التحديث التلقائي للإشعارات
  useEffect(() => {

    if (!autoRefresh) {

      return;

    }

    const interval = setInterval(() => {

      loadNotifications();

    }, refreshInterval);

    return () => clearInterval(interval);

  }, [autoRefresh, refreshInterval, loadNotifications]);

  // تصفية الإشعارات
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return {
    // البيانات
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    error,

    // الإجراءات
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    createSystemNotification,

    // الحالة
    'hasNotifications': notifications.length > 0,
    'hasUnreadNotifications': unreadCount > 0
  };

}
