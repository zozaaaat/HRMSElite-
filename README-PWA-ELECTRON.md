# HRMS Elite - نظام إدارة الموارد البشرية

نظام إدارة الموارد البشرية الشامل والمتقدم مع دعم PWA و Electron

## 🚀 الميزات

### 📱 Progressive Web App (PWA)
- ✅ التثبيت على الهاتف
- ✅ العمل بدون اتصال
- ✅ الإشعارات الفورية
- ✅ التحديث التلقائي
- ✅ التخزين المؤقت الذكي

### 🖥️ Desktop Application (Electron)
- ✅ تطبيق سطح المكتب المستقل
- ✅ دعم Windows, macOS, Linux
- ✅ قائمة تطبيق كاملة
- ✅ إدارة النوافذ المتقدمة

### 🌐 Web Application
- ✅ واجهة ويب متقدمة
- ✅ تصميم متجاوب
- ✅ دعم متصفحات حديثة
- ✅ أداء محسن

## 🛠️ التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- Git

### التثبيت
```bash
# استنساخ المشروع
git clone <repository-url>
cd HRMSElite

# تثبيت التبعيات
npm install

# تثبيت تبعيات Electron
cd electron && npm install && cd ..
```

## 🚀 التشغيل

### 1. تطبيق الويب (PWA)
```bash
# تشغيل خادم التطوير
npm run dev:client

# فتح المتصفح على
http://localhost:5173
```

### 2. تطبيق سطح المكتب (Electron)
```bash
# تشغيل Electron مع خادم التطوير
npm run dev:electron

# أو استخدام الملف الجاهز
scripts/START-ELECTRON.bat
```

### 3. التطبيق الكامل (ويب + خادم)
```bash
# تشغيل الخادم والعميل معاً
npm run dev:full
```

## 📦 البناء والتوزيع

### بناء التطبيق
```bash
# بناء تطبيق الويب
npm run build

# بناء تطبيق Electron
npm run build:electron

# بناء الكل
npm run build:electron
```

### إنشاء حزم التوزيع
```bash
# إنشاء حزمة Electron لجميع المنصات
npm run dist:electron

# إنشاء حزمة لنظام معين
cd electron
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## 📁 هيكل المشروع

```
HRMSElite/
├── client/                 # تطبيق React
│   ├── src/
│   ├── public/
│   └── index.html
├── server/                 # خادم Express
│   ├── routes/
│   ├── models/
│   └── index.ts
├── electron/              # تطبيق Electron
│   ├── main.ts
│   ├── preload.ts
│   └── package.json
├── public/                # الملفات العامة
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── scripts/               # ملفات التشغيل
│   └── START-ELECTRON.bat
└── package.json
```

## 🔧 الإعدادات

### PWA Configuration
- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Icons**: `public/icon-*.png`

### Electron Configuration
- **Main Process**: `electron/main.ts`
- **Preload**: `electron/preload.ts`
- **Build**: `electron/package.json`

### Vite Configuration
- **PWA Plugin**: `vite.config.ts`
- **Development**: `localhost:5173`
- **Production**: `dist/public/`

## 🧪 الاختبار

```bash
# اختبار الوحدة
npm run test

# اختبار الواجهة
npm run test:ui

# تشغيل الاختبارات
npm run test:run
```

## 📱 PWA Features

### التثبيت
1. افتح التطبيق في Chrome/Edge
2. انقر على أيقونة التثبيت في شريط العنوان
3. أو اختر "إضافة إلى الشاشة الرئيسية"

### العمل بدون اتصال
- التطبيق يعمل بدون اتصال بالإنترنت
- البيانات محفوظة محلياً
- المزامنة عند العودة للاتصال

### الإشعارات
- إشعارات فورية للأحداث المهمة
- إشعارات الحضور والانصراف
- إشعارات التقارير

## 🖥️ Electron Features

### النافذة
- حجم: 1200x800 بكسل
- الحد الأدنى: 800x600 بكسل
- قابل للتكبير والتصغير

### القائمة
- قائمة تطبيق كاملة
- اختصارات لوحة المفاتيح
- دعم macOS و Windows

### الأمان
- `nodeIntegration: false`
- `contextIsolation: true`
- `webSecurity: true`

## 🔒 الأمان

### PWA Security
- HTTPS مطلوب للإنتاج
- Content Security Policy
- Service Worker آمن

### Electron Security
- عزل العمليات
- منع الوصول المباشر لـ Node.js
- إدارة الروابط الخارجية

## 📊 الأداء

### PWA Performance
- التخزين المؤقت الذكي
- تحميل سريع للموارد
- ضغط الصور والملفات

### Electron Performance
- تحميل سريع للتطبيق
- استهلاك ذاكرة محسن
- إدارة النوافذ الفعالة

## 🐛 استكشاف الأخطاء

### مشاكل PWA
1. تأكد من HTTPS في الإنتاج
2. تحقق من manifest.json
3. تأكد من وجود Service Worker

### مشاكل Electron
1. تحقق من تثبيت التبعيات
2. تأكد من إعدادات TypeScript
3. تحقق من مسارات الملفات

### مشاكل عامة
1. تأكد من Node.js 18+
2. امسح cache المتصفح
3. أعد تشغيل الخادم

## 📞 الدعم

- **التوثيق**: راجع الملفات في مجلد `docs/`
- **المشاكل**: افتح issue في GitHub
- **المساهمة**: اتبع دليل المساهمة

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

---

**الإصدار**: 1.0.0
**التاريخ**: 2024
**المطور**: HRMS Elite Team 