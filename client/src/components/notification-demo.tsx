import React from 'react';
import {Button} from './ui/button';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {useNotifications} from '../hooks/useNotifications';
import {useToast} from '../hooks/use-toast';

interface NotificationDemoProps {
  userId: string;
}

export function NotificationDemo ({userId}: NotificationDemoProps) {

  const {createSystemNotification} = useNotifications({userId, 'autoRefresh': false});
  const {toast} = useToast();

  const createDemoNotifications = async () => {

    try {

      // إنشاء إشعار انتهاء ترخيص
      await createSystemNotification(
        'license_expiry',
        'تنبيه انتهاء الترخيص',
        'ترخيص التجارة الإلكترونية سينتهي خلال 30 يوم. يرجى تجديده قبل انتهاء الصلاحية.',
        {'licenseId': 'license-123', 'expiryDate': '2025-03-15'}
      );

      // إنشاء إشعار طلب إجازة
      await createSystemNotification(
        'leave_request',
        'طلب إجازة جديد',
        'أحمد محمد علي قدّم طلب إجازة سنوية لمدة 5 أيام من 15 فبراير إلى 19 فبراير.',
        {'employeeId': 'emp-123', 'leaveId': 'leave-456', 'leaveType': 'annual'}
      );

      // إنشاء إشعار تأخير الحضور
      await createSystemNotification(
        'attendance_alert',
        'تنبيه تأخير الحضور',
        '3 موظفين متأخرين في الحضور اليوم: فاطمة أحمد، محمد خالد، سارة علي.',
        {'delayedEmployees': ['emp-456', 'emp-789', 'emp-012'], 'delayTime': 15}
      );

      // إنشاء إشعار رفع مستند جديد
      await createSystemNotification(
        'document_upload',
        'تم رفع مستند جديد',
        'تم رفع تقرير الأداء الشهري بنجاح بواسطة مدير الموارد البشرية.',
        {'documentId': 'doc-789', 'documentName': 'تقرير الأداء الشهري - يناير 2025'}
      );

      toast({
        'title': 'تم',
        'description': 'تم إنشاء 4 إشعارات تجريبية بنجاح'
      });

    } catch {

      toast({
        'title': 'خطأ',
        'description': 'فشل في إنشاء الإشعارات التجريبية',
        'variant': 'destructive'
      });

    }

  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">إنشاء إشعارات تجريبية</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          انقر على الزر أدناه لإنشاء إشعارات تجريبية لاختبار نظام الإشعارات
        </p>
        <Button
          onClick={createDemoNotifications}
          className="w-full"
          variant="outline"
        >
          إنشاء إشعارات تجريبية
        </Button>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>سيتم إنشاء:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>إشعار انتهاء ترخيص</li>
            <li>إشعار طلب إجازة</li>
            <li>إشعار تأخير الحضور</li>
            <li>إشعار رفع مستند جديد</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

}
