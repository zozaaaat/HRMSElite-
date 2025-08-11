# Layout Component Documentation

## نظرة عامة

تم إنشاء مكون `Layout` أساسي يجمع بين `Sidebar` و `Header` لتوفير تجربة مستخدم متسقة في جميع أنحاء التطبيق.

## المكونات المدرجة

### 1. Layout (المكون الرئيسي)
- **الملف**: `client/src/components/layout.tsx`
- **الوصف**: مكون رئيسي يجمع بين Sidebar و Header مع إدارة الحالة

### 2. Header (رأس الصفحة)
- **الملف**: `client/src/components/header.tsx`
- **الوصف**: شريط علوي يحتوي على معلومات الشركة والمستخدم وأزرار الإجراءات

### 3. Sidebar (الشريط الجانبي)
- **الملف**: `client/src/components/sidebar.tsx`
- **الوصف**: شريط جانبي للتنقل بين صفحات التطبيق

## كيفية الاستخدام

### الاستخدام الأساسي

```tsx
import { Layout } from '../components/layout';
import type { User, Company } from '../../../shared/schema';

function MyPage() {
  const user: User = {
    // بيانات المستخدم
  };

  const company: Company = {
    // بيانات الشركة
  };

  return (
    <Layout
      user={user}
      company={company}
      activeView="dashboard"
      onViewChange={(view) => console.log('تغيير العرض إلى:', view)}
      onLogout={() => console.log('تسجيل الخروج')}
    >
      {/* محتوى الصفحة */}
      <div>محتوى الصفحة هنا</div>
    </Layout>
  );
}
```

### الاستخدام المتقدم مع جميع الخيارات

```tsx
import { Layout } from '../components/layout';

function AdvancedPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Layout
      user={user}
      company={company}
      activeView={activeView}
      onViewChange={setActiveView}
      onLogout={() => {
        // منطق تسجيل الخروج
      }}
      onSettingsClick={() => {
        // فتح صفحة الإعدادات
      }}
      onSearchClick={() => {
        // فتح البحث
      }}
      onNotificationsClick={() => {
        // فتح الإشعارات
      }}
      onThemeToggle={() => {
        setIsDarkMode(!isDarkMode);
      }}
      isDarkMode={isDarkMode}
      // معالجات الميزات المتقدمة
      onAIAssistantOpen={() => console.log('فتح المساعد الذكي')}
      onBIDashboardOpen={() => console.log('فتح لوحة التحكم التحليلية')}
      onWorkflowBuilderOpen={() => console.log('فتح منشئ سير العمل')}
      onLearningManagementOpen={() => console.log('فتح إدارة التعلم')}
      onFinancialManagementOpen={() => console.log('فتح الإدارة المالية')}
      onMobileAppOpen={() => console.log('فتح التطبيق المحمول')}
      onEmployee360Open={() => console.log('فتح عرض الموظف 360')}
    >
      {/* محتوى الصفحة */}
    </Layout>
  );
}
```

## Props المتاحة

### Layout Props

| Prop | النوع | الافتراضي | الوصف |
|------|-------|-----------|-------|
| `children` | `React.ReactNode` | مطلوب | محتوى الصفحة |
| `user` | `User` | `undefined` | بيانات المستخدم |
| `company` | `Company` | `undefined` | بيانات الشركة |
| `activeView` | `string` | `'dashboard'` | العرض النشط حالياً |
| `onViewChange` | `(view: string) => void` | `undefined` | معالج تغيير العرض |
| `onLogout` | `() => void` | `undefined` | معالج تسجيل الخروج |
| `onSettingsClick` | `() => void` | `undefined` | معالج فتح الإعدادات |
| `onSearchClick` | `() => void` | `undefined` | معالج فتح البحث |
| `onNotificationsClick` | `() => void` | `undefined` | معالج فتح الإشعارات |
| `onThemeToggle` | `() => void` | `undefined` | معالج تبديل المظهر |
| `isDarkMode` | `boolean` | `false` | حالة المظهر الداكن |
| `onAIAssistantOpen` | `() => void` | `undefined` | معالج فتح المساعد الذكي |
| `onBIDashboardOpen` | `() => void` | `undefined` | معالج فتح لوحة التحكم التحليلية |
| `onWorkflowBuilderOpen` | `() => void` | `undefined` | معالج فتح منشئ سير العمل |
| `onLearningManagementOpen` | `() => void` | `undefined` | معالج فتح إدارة التعلم |
| `onFinancialManagementOpen` | `() => void` | `undefined` | معالج فتح الإدارة المالية |
| `onMobileAppOpen` | `() => void` | `undefined` | معالج فتح التطبيق المحمول |
| `onEmployee360Open` | `() => void` | `undefined` | معالج فتح عرض الموظف 360 |

### Header Props

| Prop | النوع | الافتراضي | الوصف |
|------|-------|-----------|-------|
| `user` | `User` | `undefined` | بيانات المستخدم |
| `company` | `Company` | `undefined` | بيانات الشركة |
| `onLogout` | `() => void` | `undefined` | معالج تسجيل الخروج |
| `onSettingsClick` | `() => void` | `undefined` | معالج فتح الإعدادات |
| `onSearchClick` | `() => void` | `undefined` | معالج فتح البحث |
| `onNotificationsClick` | `() => void` | `undefined` | معالج فتح الإشعارات |
| `onThemeToggle` | `() => void` | `undefined` | معالج تبديل المظهر |
| `isDarkMode` | `boolean` | `false` | حالة المظهر الداكن |

## الميزات

### Header Features
- عرض معلومات الشركة (الاسم، عدد الموظفين، الدور)
- أزرار الإجراءات السريعة (البحث، الإشعارات، تبديل المظهر)
- قائمة المستخدم مع خيارات الملف الشخصي والإعدادات
- دعم المظهر الداكن/الفاتح
- إشعارات مرئية

### Layout Features
- إدارة حالة Sidebar (قابل للطي)
- تخطيط متجاوب
- دعم جميع معالجات الأحداث
- بيانات افتراضية للمستخدم والشركة
- تنسيق متسق لجميع الصفحات

## مثال عملي

راجع ملف `client/src/pages/layout-example.tsx` للحصول على مثال كامل على كيفية استخدام Layout مع بيانات حقيقية.

## التخصيص

يمكن تخصيص Layout من خلال:

1. **تخصيص الألوان**: تعديل classes في Tailwind CSS
2. **إضافة ميزات جديدة**: إضافة props جديدة للمكونات
3. **تغيير التخطيط**: تعديل هيكل HTML/CSS
4. **إضافة animations**: إضافة transitions و animations

## ملاحظات مهمة

- تأكد من تمرير بيانات المستخدم والشركة الصحيحة
- استخدم معالجات الأحداث المناسبة لكل إجراء
- يمكن استخدام Layout في أي صفحة في التطبيق
- البيانات الافتراضية ستُستخدم إذا لم يتم تمرير بيانات حقيقية 