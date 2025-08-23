import React, {useState, useEffect} from 'react';
import {Button} from './ui/button';
import {Badge} from './ui/badge';
import {ScrollArea} from './ui/scroll-area';
import {Separator} from './ui/separator';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Check,
  Trash2,
  X,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from './ui/popover';
import {notificationService} from '../services/notifications';
import type {Notification} from '../../../shared/schema';
import {useToast} from '../hooks/use-toast';
import logger from '../lib/logger';
import {useTranslation} from 'react-i18next';


interface NotificationCenterProps {
  userId: string;
  className?: string;
}

export function NotificationCenter ({userId, className: _className}: NotificationCenterProps) {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const {t} = useTranslation();

  // Load notifications
  const loadNotifications = async () => {

    try {

      setIsLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationService.getNotifications({'limit': 50}),
        notificationService.getUnreadCount()
      ]);
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      logger.error('Error loading notifications:', error as Error);
      toast({
        'title': t('dashboard.notifications.error'),
        'description': t('dashboard.notifications.loadError'),
        'variant': 'destructive'
      });
    } finally {
      setIsLoading(false);
    }

  };

  // Reload notifications when the popover is opened
  useEffect(() => {

    if (isOpen) {

      loadNotifications();

    }

  }, [isOpen, userId]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [userId]);

  // Mark single notification as read
  const handleMarkAsRead = async (notificationId: string) => {

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

    } catch (error) {
      logger.error('Error updating notification:', error as Error);
      toast({
        'title': t('dashboard.notifications.error'),
        'description': t('dashboard.notifications.updateError'),
        'variant': 'destructive'
      });
    }

  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {

    try {

      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({...notification, 'isRead': true}))
      );
      setUnreadCount(0);
      toast({
        'title': t('dashboard.notifications.success'),
        'description': t('dashboard.notifications.updateAllSuccess')
      });
    } catch (error) {
      logger.error('Error updating all notifications:', error as Error);
      toast({
        'title': t('dashboard.notifications.error'),
        'description': t('dashboard.notifications.updateAllError'),
        'variant': 'destructive'
      });
    }

  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {

    try {

      await notificationService.deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast({
        'title': t('dashboard.notifications.success'),
        'description': t('dashboard.notifications.deleteSuccess')
      });
    } catch (error) {
      logger.error('Error deleting notification:', error as Error);
      toast({
        'title': t('dashboard.notifications.error'),
        'description': t('dashboard.notifications.deleteError'),
        'variant': 'destructive'
      });
    }

  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {

    const iconMap: Record<string, React.ReactNode> = {
      'license_expiry': <AlertTriangle className="h-4 w-4" />,
      'leave_request': <Calendar className="h-4 w-4" />,
      'attendance_alert': <Clock className="h-4 w-4" />,
      'document_upload': <FileText className="h-4 w-4" />
    };
    return iconMap[type] ?? <Bell className="h-4 w-4" />;

  };

  // Get color for notification type
  const getNotificationColor = (type: string) => {

    const colorMap: Record<string, string> = {
      'license_expiry': 'text-red-600',
      'leave_request': 'text-blue-600',
      'attendance_alert': 'text-yellow-600',
      'document_upload': 'text-green-600'
    };
    return colorMap[type] ?? 'text-gray-600';

  };

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t('dashboard.notifications.now');
    } else if (diffInHours < 24) {
      return t('dashboard.notifications.hoursAgo', {count: diffInHours});
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('dashboard.notifications.daysAgo', {count: diffInDays});
    }
  };

  // Filter unread notifications
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full min-w-0"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">{t('dashboard.notifications.title')}</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                {t('dashboard.notifications.markAllAsRead')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('dashboard.notifications.none')}</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Unread notifications */}
              {unreadNotifications.length > 0 && (
                <>
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {t('dashboard.notifications.unread', {count: unreadNotifications.length})}
                    </h4>
                  </div>
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      formatDate={formatDate}
                    />
                  ))}
                  {readNotifications.length > 0 && <Separator className="my-2" />}
                </>
              )}

              {/* Read notifications */}
              {readNotifications.length > 0 && (
                <>
                  <div className="mb-2">
                    <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">
                      {t('dashboard.notifications.read')}
                    </h4>
                  </div>
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDeleteNotification}
                      getNotificationIcon={getNotificationIcon}
                      getNotificationColor={getNotificationColor}
                      formatDate={formatDate}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

}

// Notification item component
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getNotificationIcon: (type: string) => React.ReactNode;
  getNotificationColor: (type: string) => string;
  formatDate: (date: string) => string;
}

function NotificationItem ({
  notification,
  onMarkAsRead,
  onDelete,
  getNotificationIcon,
  getNotificationColor,
  formatDate
}: NotificationItemProps) {
  const {t} = useTranslation();
  return (
    <div className={`p-3 rounded-lg transition-colors ${
      notification.isRead ? 'bg-transparent' : 'bg-muted/50'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium leading-tight mb-1">
                {notification.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(notification.createdAt.toString())}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.isRead && (
                  <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                    <Check className="mr-2 h-3 w-3" />
                    {t('dashboard.notifications.markAsRead')}
                  </DropdownMenuItem>
                )}
                  <DropdownMenuItem
                  onClick={() => onDelete(notification.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  {t('dashboard.notifications.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

}
