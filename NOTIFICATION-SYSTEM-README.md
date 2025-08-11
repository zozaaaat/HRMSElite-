# نظام الإشعارات - HRMS Elite

## نظرة عامة

تم تطوير نظام إشعارات شامل لنظام إدارة الموارد البشرية (HRMS Elite) يدعم جميع أنواع الإشعارات المطلوبة مع واجهة مستخدم حديثة وسهلة الاستخدام.

## المميزات الرئيسية

### 🔔 أنواع الإشعارات المدعومة

1. **إشعارات انتهاء الترخيص** (`license_expiry`)
   - تنبيهات بموعد انتهاء التراخيص
   - أيقونة تحذير حمراء
   - أولوية عالية

2. **إشعارات طلب الإجازة** (`leave_request`)
   - إشعارات بطلبات الإجازة الجديدة
   - أيقونة تقويم زرقاء
   - للمديرين والمشرفين

3. **تنبيهات تأخير الحضور** (`attendance_alert`)
   - تنبيهات بتأخير الموظفين
   - أيقونة ساعة صفراء
   - للمديرين والمشرفين

4. **إشعارات رفع المستندات** (`document_upload`)
   - إشعارات برفع مستندات جديدة
   - أيقونة ملف أخضر
   - للمستخدمين المعنيين

### 🎨 واجهة المستخدم

- **زر الجرس**: موجود في الهيدر مع عداد الإشعارات غير المقروءة
- **قائمة منبثقة**: عرض جميع الإشعارات مع إمكانية التصفية
- **ألوان مميزة**: كل نوع إشعار له لون وأيقونة خاصة
- **تصميم متجاوب**: يعمل على جميع أحجام الشاشات

### ⚡ الوظائف المتقدمة

- **تحديث تلقائي**: تحديث الإشعارات كل 30 ثانية
- **تحديد كمقروء**: تحديد إشعار واحد أو جميع الإشعارات
- **حذف الإشعارات**: إمكانية حذف الإشعارات غير المرغوب فيها
- **تصفية الإشعارات**: عرض الإشعارات المقروءة وغير المقروءة منفصلة
- **تنسيق التاريخ**: عرض الوقت النسبي (منذ ساعة، منذ يوم، إلخ)

## الملفات المضافة

### الخدمات (Services)
```
client/src/services/notifications.ts
```
- خدمة شاملة لإدارة الإشعارات
- دعم جميع عمليات CRUD
- إنشاء إشعارات تلقائية للنظام

### المكونات (Components)
```
client/src/components/notification-center.tsx
client/src/components/notification-demo.tsx
```
- `NotificationCenter`: المكون الرئيسي لعرض الإشعارات
- `NotificationDemo`: مكون لإنشاء إشعارات تجريبية

### Hooks
```
client/src/hooks/useNotifications.ts
```
- Hook لإدارة حالة الإشعارات
- دعم التحديث التلقائي
- إدارة الأخطاء والتحميل

### الصفحات (Pages)
```
client/src/pages/notification-test.tsx
```
- صفحة لاختبار نظام الإشعارات
- عرض إحصائيات مفصلة
- تعليمات الاستخدام

### مسارات الخادم (Server Routes)
```
server/routes/notification-routes.ts
```
- API شامل للإشعارات
- دعم جميع العمليات
- إنشاء إشعارات تلقائية

## كيفية الاستخدام

### 1. إضافة مركز الإشعارات للهيدر

```tsx
import { NotificationCenter } from './components/notification-center';

// في مكون الهيدر
{user && (
  <NotificationCenter userId={user.id} />
)}
```

### 2. استخدام Hook الإشعارات

```tsx
import { useNotifications } from './hooks/useNotifications';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    createSystemNotification 
  } = useNotifications({ userId: "user-123" });

  // استخدام الوظائف
}
```

### 3. إنشاء إشعار جديد

```tsx
// إنشاء إشعار انتهاء ترخيص
await createSystemNotification(
  'license_expiry',
  'تنبيه انتهاء الترخيص',
  'ترخيص التجارة سينتهي خلال 30 يوم',
  { licenseId: 'license-123' }
);
```

## API Endpoints

### الحصول على الإشعارات
```
GET /api/notifications
GET /api/notifications?isRead=false&type=license_expiry
```

### عدد الإشعارات غير المقروءة
```
GET /api/notifications/unread-count
```

### تحديث حالة الإشعار
```
PATCH /api/notifications/:id/read
PATCH /api/notifications/mark-all-read
```

### حذف إشعار
```
DELETE /api/notifications/:id
```

### إنشاء إشعار جديد
```
POST /api/notifications
```

### إنشاء إشعارات تلقائية
```
POST /api/notifications/license-expiry
POST /api/notifications/leave-request
POST /api/notifications/attendance-alert
POST /api/notifications/document-upload
```

## قاعدة البيانات

### جدول الإشعارات
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  companyId TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT DEFAULT '{}',
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## التخصيص

### إضافة نوع إشعار جديد

1. إضافة النوع في `NOTIFICATION_TYPES`
2. إضافة الأيقونة في `NOTIFICATION_ICONS`
3. إضافة اللون في `NOTIFICATION_COLORS`
4. إنشاء مسار API جديد إذا لزم الأمر

### تخصيص التصميم

يمكن تخصيص الألوان والأيقونات من خلال تعديل:
- `NOTIFICATION_COLORS` في `notifications.ts`
- `NOTIFICATION_ICONS` في `notifications.ts`
- CSS classes في `notification-center.tsx`

## الاختبار

### صفحة الاختبار
```
/notification-test
```
- إنشاء إشعارات تجريبية
- عرض إحصائيات مفصلة
- اختبار جميع الوظائف

### إنشاء إشعارات تجريبية
```tsx
import { NotificationDemo } from './components/notification-demo';

<NotificationDemo userId="test-user-123" />
```

## الأمان

- التحقق من صحة المستخدم في جميع المسارات
- التحقق من ملكية الإشعار قبل التعديل/الحذف
- حماية من SQL Injection
- التحقق من صحة البيانات المدخلة

## الأداء

- تحديث تلقائي كل 30 ثانية (قابل للتخصيص)
- تحميل الإشعارات عند الطلب فقط
- تخزين مؤقت للبيانات
- تحسين استعلامات قاعدة البيانات

## الدعم التقني

### المتطلبات
- React 18+
- TypeScript 4.5+
- Node.js 16+
- SQLite (أو أي قاعدة بيانات مدعومة)

### التثبيت
```bash
# تثبيت التبعيات
npm install

# تشغيل الخادم
npm run dev

# تشغيل العميل
npm run dev:client
```

### استكشاف الأخطاء

1. **الإشعارات لا تظهر**: تحقق من معرف المستخدم
2. **خطأ في الاتصال**: تحقق من تشغيل الخادم
3. **أخطاء قاعدة البيانات**: تحقق من صحة الجداول

## التطوير المستقبلي

- [ ] إشعارات في الوقت الفعلي (WebSocket)
- [ ] إشعارات البريد الإلكتروني
- [ ] إشعارات الهاتف المحمول
- [ ] تخصيص إعدادات الإشعارات
- [ ] تصدير الإشعارات
- [ ] أرشفة الإشعارات القديمة

## المساهمة

للمساهمة في تطوير نظام الإشعارات:

1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التعديلات
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. 