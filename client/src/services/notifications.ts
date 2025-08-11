import {apiRequest} from '../lib/apiRequest';
import type {Notification, InsertNotification} from '../../../shared/schema';

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export const notificationService = {
  // الحصول على جميع إشعارات المستخدم
  async getNotifications (filters: NotificationFilters = {}): Promise<Notification[]> {

    const params = new globalThis.URLSearchParams();
    if (filters.isRead !== undefined) {

      params.append('isRead', filters.isRead.toString());

    }
    if (filters.type) {

      params.append('type', filters.type);

    }
    if (filters.limit) {

      params.append('limit', filters.limit.toString());

    }
    if (filters.offset) {

      params.append('offset', filters.offset.toString());

    }

    return apiRequest<Notification[]>(`/notifications?${params.toString()}`);

  },

  // الحصول على عدد الإشعارات غير المقروءة
  async getUnreadCount (): Promise<number> {

    return apiRequest<number>('/notifications/unread-count');

  },

  // تحديث حالة الإشعار إلى مقروء
  async markAsRead (notificationId: string): Promise<void> {

    return apiRequest<void>(`/notifications/${notificationId}/read`, {
      'method': 'PATCH'
    });

  },

  // تحديث جميع الإشعارات إلى مقروءة
  async markAllAsRead (): Promise<void> {

    return apiRequest<void>('/notifications/mark-all-read', {
      'method': 'PATCH'
    });

  },

  // حذف إشعار
  async deleteNotification (notificationId: string): Promise<void> {

    return apiRequest<void>(`/notifications/${notificationId}`, {
      'method': 'DELETE'
    });

  },

  // إنشاء إشعار جديد
  async createNotification (notification: InsertNotification): Promise<Notification> {

    return apiRequest<Notification>('/notifications', {
      'method': 'POST',
      'body': JSON.stringify(notification)
    });

  },

  // إنشاء إشعارات تلقائية
  async createSystemNotification (
    userId: string,
    type: 'license_expiry' | 'leave_request' | 'attendance_alert' | 'document_upload',
    title: string,
    message: string,
    data: Record<string, unknown> = {}
  ): Promise<Notification> {

    return this.createNotification({
      userId,
      type,
      title,
      message,
      'data': JSON.stringify(data)
    });

  }
};

// أنواع الإشعارات المدعومة
export const NOTIFICATION_TYPES = {
  'LICENSE_EXPIRY': 'license_expiry',
  'LEAVE_REQUEST': 'leave_request',
  'ATTENDANCE_ALERT': 'attendance_alert',
  'DOCUMENT_UPLOAD': 'document_upload'
} as const;

// أيقونات الإشعارات
export const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.LICENSE_EXPIRY]: 'alert-triangle',
  [NOTIFICATION_TYPES.LEAVE_REQUEST]: 'calendar',
  [NOTIFICATION_TYPES.ATTENDANCE_ALERT]: 'clock',
  [NOTIFICATION_TYPES.DOCUMENT_UPLOAD]: 'file-text'
} as const;

// ألوان الإشعارات
export const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.LICENSE_EXPIRY]: 'destructive',
  [NOTIFICATION_TYPES.LEAVE_REQUEST]: 'default',
  [NOTIFICATION_TYPES.ATTENDANCE_ALERT]: 'warning',
  [NOTIFICATION_TYPES.DOCUMENT_UPLOAD]: 'success'
} as const;
