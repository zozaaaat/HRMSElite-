import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// ScrollArea component will be added when needed
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Building2
} from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'انتهاء صلاحية ترخيص',
      message: 'ترخيص شركة النيل الأزرق ينتهي خلال 7 أيام',
      timestamp: '2025-07-29T09:00:00Z',
      read: false,
      actionRequired: true,
      priority: 'high'
    },
    {
      id: '2',
      type: 'info',
      title: 'طلب إجازة جديد',
      message: 'أحمد محمد قدم طلب إجازة لمدة 5 أيام',
      timestamp: '2025-07-29T08:45:00Z',
      read: false,
      actionRequired: true,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'success',
      title: 'تم إضافة موظف جديد',
      message: 'تم إضافة فاطمة أحمد في قسم المحاسبة',
      timestamp: '2025-07-29T08:30:00Z',
      read: true,
      actionRequired: false,
      priority: 'low'
    },
    {
      id: '4',
      type: 'error',
      title: 'خطأ في النظام',
      message: 'فشل في تحديث بيانات الموظف رقم 1234',
      timestamp: '2025-07-29T08:15:00Z',
      read: false,
      actionRequired: true,
      priority: 'high'
    }
  ]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'low': return 'bg-gray-100 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
      default: return 'bg-gray-100 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (minutes < 1440) return `منذ ${Math.floor(minutes / 60)} ساعة`;
    return `منذ ${Math.floor(minutes / 1440)} يوم`;
  };

  return (
    <Card className="w-full max-w-md" dir="rtl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              قراءة الكل
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-96 overflow-y-auto">
          <div className="space-y-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              مطلوب إجراء
                            </Badge>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                            }`}
                          >
                            {notification.priority === 'high' ? 'عاجل' : 
                             notification.priority === 'medium' ? 'متوسط' : 'عادي'}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}