import React from 'react';
import {NotificationCenter} from '../components/notification-center';
import {NotificationDemo} from '../components/notification-demo';
import {useNotifications} from '../hooks/useNotifications';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Separator} from '../components/ui/separator';

function NotificationTestPage () {

  // استخدام معرف مستخدم تجريبي
  const userId = 'test-user-123';
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications({userId});

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار نظام الإشعارات</h1>
          <p className="text-muted-foreground">
            صفحة لاختبار وظائف نظام الإشعارات
          </p>
        </div>

        {/* مركز الإشعارات في الهيدر */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            الإشعارات غير المقروءة: <Badge variant="destructive">{unreadCount}</Badge>
          </div>
          <NotificationCenter userId={userId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مكون إنشاء الإشعارات التجريبية */}
        <NotificationDemo userId={userId} />

        {/* إحصائيات الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الإشعارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي الإشعارات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {unreadCount}
                </div>
                <div className="text-sm text-muted-foreground">غير مقروءة</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">إشعارات انتهاء الترخيص:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.type === 'license_expiry').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">طلبات الإجازة:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.type === 'leave_request').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">تنبيهات الحضور:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.type === 'attendance_alert').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">مستندات جديدة:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.type === 'document_upload').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة الإشعارات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>جميع الإشعارات</CardTitle>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد إشعارات
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? 'bg-muted/30' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="destructive" className="text-xs">
                            جديد
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          تحديد كمقروء
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* تعليمات الاستخدام */}
      <Card>
        <CardHeader>
          <CardTitle>كيفية استخدام نظام الإشعارات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">1. إنشاء إشعارات تجريبية:</h4>
              <p className="text-muted-foreground">
                استخدم الزر "إنشاء إشعارات تجريبية" لإنشاء إشعارات من جميع الأنواع
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. عرض الإشعارات:</h4>
              <p className="text-muted-foreground">
                انقر على أيقونة الجرس في الأعلى لعرض قائمة الإشعارات
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. إدارة الإشعارات:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>انقر على "تحديد كمقروء" لتحديد إشعار كمقروء</li>
                <li>انقر على "حذف" لحذف إشعار</li>
                <li>استخدم "تحديد الكل كمقروء" لتحديد جميع الإشعارات</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. أنواع الإشعارات المدعومة:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>انتهاء الترخيص:</strong> تنبيهات بموعد انتهاء التراخيص</li>
                <li><strong>طلب إجازة:</strong> إشعارات بطلبات الإجازة الجديدة</li>
                <li><strong>تنبيه الحضور:</strong> تنبيهات بتأخير الموظفين</li>
                <li><strong>مستند جديد:</strong> إشعارات برفع مستندات جديدة</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}

export default NotificationTestPage;
