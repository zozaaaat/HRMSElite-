# 🏢 HRMS Elite - نظام إدارة موارد بشرية متكامل

> نظام إدارة موارد بشرية متكامل مع دعم الذكاء الاصطناعي، مصمم للشركات الحديثة

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 الميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- **AI Dashboard**: لوحة تحكم ذكية مع تحليلات متقدمة
- **AI Assistant**: مساعد ذكي للتقارير والاستعلامات
- **Smart Reports**: تقارير ذكية مع تحليل البيانات
- **Predictive Analytics**: تحليلات تنبؤية للموارد البشرية

### 👥 إدارة الموظفين
- **Employee Profiles**: ملفات شاملة للموظفين
- **Department Management**: إدارة الأقسام والهيكل التنظيمي
- **Performance Tracking**: تتبع الأداء والتقييمات
- **Training Management**: إدارة التدريب والتطوير

### 💰 إدارة الرواتب
- **Payroll System**: نظام رواتب متكامل
- **Salary Calculations**: حسابات الرواتب والمكافآت
- **Deductions Management**: إدارة الخصومات
- **Tax Calculations**: حسابات الضرائب

### 📄 إدارة التراخيص والمستندات
- **License Tracking**: تتبع التراخيص والتصاريح
- **Document Management**: إدارة المستندات والملفات
- **File Upload**: رفع وتخزين الملفات
- **Version Control**: التحكم في إصدارات المستندات

### ⏰ إدارة الحضور والإجازات
- **Attendance Tracking**: تتبع الحضور والانصراف
- **Leave Management**: إدارة الإجازات والطلبات
- **Time Tracking**: تتبع ساعات العمل
- **Overtime Management**: إدارة العمل الإضافي

### 🏢 إدارة الشركات
- **Multi-Company Support**: دعم متعدد الشركات
- **Company Profiles**: ملفات الشركات
- **Branch Management**: إدارة الفروع
- **Company Statistics**: إحصائيات الشركات

### 🔐 الأمان والصلاحيات
- **Role-Based Access Control**: نظام أدوار وصلاحيات متقدم
- **User Authentication**: مصادقة المستخدمين
- **Session Management**: إدارة الجلسات
- **Security Middleware**: وسائط الأمان

### 📊 التقارير والتحليلات
- **Advanced Reports**: تقارير متقدمة وقابلة للتخصيص
- **Real-time Dashboards**: لوحات تحكم فورية
- **Data Visualization**: تصور البيانات
- **Export Capabilities**: إمكانيات التصدير

### 🌐 واجهة المستخدم
- **Arabic RTL Support**: دعم كامل للغة العربية
- **Responsive Design**: تصميم متجاوب
- **Modern UI/UX**: واجهة حديثة وسهلة الاستخدام
- **Mobile Support**: دعم الأجهزة المحمولة

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة الآمنة
- **Vite** - أداة البناء السريعة
- **Tailwind CSS** - إطار العمل للتصميم
- **Radix UI** - مكونات واجهة المستخدم
- **React Query** - إدارة حالة البيانات
- **React Hook Form** - إدارة النماذج
- **Framer Motion** - الرسوم المتحركة

### Backend
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار العمل للخادم
- **TypeScript** - لغة البرمجة الآمنة
- **Drizzle ORM** - إدارة قاعدة البيانات
- **SQLite** - قاعدة البيانات
- **Session Authentication** - مصادقة الجلسات

### الأمان
- **Helmet** - حماية رؤوس HTTP
- **CSRF Protection** - حماية من هجمات CSRF
- **Rate Limiting** - تحديد معدل الطلبات
- **Input Validation** - التحقق من المدخلات
- **Security Headers** - رؤوس الأمان

### التطوير
- **ESLint** - فحص جودة الكود
- **Prettier** - تنسيق الكود
- **Vitest** - اختبارات الوحدة
- **Playwright** - اختبارات واجهة المستخدم

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js 18 أو أحدث
- npm أو yarn
- Git

### خطوات التثبيت

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd HRMSElite-
   ```

2. **تثبيت التبعيات**
   ```bash
   npm install
   ```

3. **تشغيل قاعدة البيانات**
   ```bash
   npm run db:push
   ```

4. **تشغيل خادم التطوير**
   ```bash
   npm run dev:full
   ```

5. **فتح المتصفح**
   ```
   http://localhost:5000
   ```

## 📁 هيكل المشروع

```
HRMSElite-/
├── 📁 client/                 # واجهة React الأمامية
│   ├── src/
│   │   ├── components/        # مكونات واجهة المستخدم
│   │   ├── pages/            # صفحات التطبيق
│   │   ├── hooks/            # Hooks مخصصة
│   │   ├── lib/              # أدوات مساعدة
│   │   ├── services/         # خدمات API
│   │   ├── stores/           # إدارة الحالة
│   │   └── types/            # أنواع TypeScript
│   └── tests/                # اختبارات الواجهة الأمامية
├── 📁 server/                # خادم Express الخلفي
│   ├── middleware/           # وسائط الخادم
│   ├── models/              # نماذج قاعدة البيانات
│   ├── routes/              # مسارات API
│   └── utils/               # أدوات مساعدة
├── 📁 electron/             # تطبيق سطح المكتب
├── 📁 tests/                # اختبارات API
└── 📁 docs/                 # الوثائق
```

## 🧪 الاختبارات

### تشغيل جميع الاختبارات
```bash
npm test
```

### اختبارات API
```bash
npm run test:api
```

### اختبارات واجهة المستخدم
```bash
npm run test:ui
```

### اختبارات التغطية
```bash
npm run test:run
```

## 🏗️ البناء والإنتاج

### بناء التطبيق
```bash
npm run build
```

### تشغيل الإنتاج
```bash
npm run start
```

### بناء تطبيق سطح المكتب
```bash
npm run build:electron
```

## 🔧 الأوامر المتاحة

| الأمر | الوصف |
|-------|--------|
| `npm run dev` | تشغيل خادم التطوير |
| `npm run dev:client` | تشغيل واجهة المستخدم |
| `npm run dev:full` | تشغيل كامل للتطبيق |
| `npm run build` | بناء التطبيق |
| `npm run start` | تشغيل الإنتاج |
| `npm test` | تشغيل الاختبارات |
| `npm run lint` | فحص جودة الكود |
| `npm run type-check` | فحص أنواع TypeScript |

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

- **البريد الإلكتروني**: support@hrmselite.com
- **المسائل**: [GitHub Issues](https://github.com/your-repo/issues)
- **الوثائق**: [Documentation](https://docs.hrmselite.com)

## 🙏 الشكر

شكر خاص لجميع المساهمين والمطورين الذين ساعدوا في تطوير هذا النظام.

---

**HRMS Elite** - نظام إدارة موارد بشرية متكامل مع دعم الذكاء الاصطناعي 🚀 