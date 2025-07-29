const fs = require('fs');
const path = require('path');

console.log('🚀 إنشاء النسخة التجريبية من Zeylab HRMS...');

// إنشاء مجلد النسخة التجريبية
const demoDir = 'zeylab-hrms-demo';
if (fs.existsSync(demoDir)) {
  fs.rmSync(demoDir, { recursive: true });
}
fs.mkdirSync(demoDir);

// نسخ الملفات المطلوبة
console.log('📂 نسخ الملفات...');

// نسخ مجلد dist
if (fs.existsSync('dist')) {
  fs.cpSync('dist', `${demoDir}/dist`, { recursive: true });
  console.log('✅ تم نسخ: dist');
}

// نسخ ملفات electron
if (fs.existsSync('demo-electron')) {
  fs.cpSync('demo-electron', `${demoDir}/electron`, { recursive: true });
  console.log('✅ تم نسخ: electron');
}

// نسخ ملفات البيانات
if (fs.existsSync('server/all-extracted-data.json')) {
  fs.copyFileSync('server/all-extracted-data.json', `${demoDir}/all-extracted-data.json`);
  console.log('✅ تم نسخ: all-extracted-data.json');
}

if (fs.existsSync('server/real-documents.json')) {
  fs.copyFileSync('server/real-documents.json', `${demoDir}/real-documents.json`);
  console.log('✅ تم نسخ: real-documents.json');
}

// إنشاء package.json للنسخة التجريبية
const demoPackage = {
  name: "zeylab-hrms-demo",
  version: "1.0.0",
  description: "نظام إدارة الموارد البشرية الشامل - نسخة تجريبية",
  author: "Zeylab Technologies",
  main: "electron/main.js",
  scripts: {
    start: "node electron/main.js",
    install: "echo تم تثبيت النسخة التجريبية بنجاح"
  }
};

fs.writeFileSync(`${demoDir}/package.json`, JSON.stringify(demoPackage, null, 2));
console.log('✅ تم إنشاء package.json');

// إنشاء ملف تشغيل للويندوز
const batContent = `@echo off
chcp 65001 >nul
title Zeylab HRMS Demo - نسخة تجريبية
color 0A
cls
echo.
echo ===============================================
echo        Zeylab HRMS - نسخة تجريبية  
echo        نظام إدارة الموارد البشرية الشامل
echo ===============================================
echo.
echo 🚀 جاري تشغيل النظام...
echo.
echo 💡 سيتم فتح النظام في نافذة جديدة
echo ⏱️  يرجى الانتظار...
echo.

node electron/main.js

if errorlevel 1 (
    echo.
    echo ❌ خطأ في التشغيل
    echo 📋 تأكد من تثبيت Node.js على النظام
    echo 🌐 يمكنك تحميله من: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo ✅ تم إغلاق النظام بنجاح
    echo 📧 للحصول على النسخة الكاملة: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul
)`;

fs.writeFileSync(`${demoDir}/تشغيل-النظام.bat`, batContent);
console.log('✅ تم إنشاء ملف التشغيل: تشغيل-النظام.bat');

// إنشاء ملف تشغيل إنجليزي أيضاً
const batEnContent = `@echo off
chcp 65001 >nul
title Zeylab HRMS Demo
color 0A
cls
echo.
echo ===============================================
echo           Zeylab HRMS Demo
echo      Human Resources Management System
echo ===============================================
echo.
echo 🚀 Starting system...
echo.
echo 💡 The system will open in a new window
echo ⏱️  Please wait...
echo.

node electron/main.js

if errorlevel 1 (
    echo.
    echo ❌ Error starting application
    echo 📋 Make sure Node.js is installed
    echo 🌐 Download from: https://nodejs.org
    echo.
    pause
) else (
    echo.
    echo ✅ System closed successfully  
    echo 📧 For full version: info@zeylab.com
    echo.
    timeout /t 3 /nobreak >nul
)`;

fs.writeFileSync(`${demoDir}/start-demo.bat`, batContent);
console.log('✅ تم إنشاء ملف التشغيل: start-demo.bat');

// إنشاء ملف README شامل
const readmeContent = `# Zeylab HRMS - نسخة تجريبية
## نظام إدارة الموارد البشرية الشامل

### 🌟 المميزات الرئيسية:
- 🏢 **إدارة متعددة الشركات** - دعم عدد لا محدود من الشركات
- 👥 **نظام صلاحيات متقدم** - 5 أدوار مختلفة مع صلاحيات قابلة للتخصيص
- 🌐 **واجهة عربية كاملة** - دعم RTL ولغة عربية شاملة
- 📊 **تقارير وتحليلات ذكية** - لوحات تحكم تفاعلية ومؤشرات أداء
- 📱 **تطبيق محمول** - PWA يعمل على جميع الأجهزة
- 🔒 **نظام أمان متقدم** - تشفير وحماية شاملة للبيانات
- 🤖 **ذكاء اصطناعي** - مساعد ذكي وتوصيات تلقائية
- 📋 **النماذج الحكومية** - ملء تلقائي للنماذج الرسمية

### 🚀 طريقة التشغيل:

#### للمستخدمين العرب:
انقر مضاعف على: \`تشغيل-النظام.bat\`

#### For English users:
Double-click: \`start-demo.bat\`

#### التشغيل اليدوي:
1. تأكد من تثبيت Node.js (https://nodejs.org)
2. افتح Command Prompt في هذا المجلد  
3. شغل الأمر: \`npm start\`

### 🔑 بيانات الدخول التجريبية:

| الدور | اسم المستخدم | كلمة المرور | الوصف |
|-------|-------------|------------|-------|
| **المسؤول العام** | admin | admin123 | إدارة النظام والشركات |
| **مدير الشركة** | manager | manager123 | إدارة شركة محددة |
| **موظف إداري** | employee | emp123 | موظف بصلاحيات محددة |
| **مشرف** | supervisor | super123 | مشرف على فريق العمل |
| **عامل** | worker | work123 | موظف عادي |

### 🏢 الشركات التجريبية:
1. **شركة الاتحاد الخليجي للأقمشة والذهب**
   - 120 موظف
   - متخصصة في الأقمشة الفاخرة والمجوهرات

2. **شركة النيل الأزرق للمجوهرات**  
   - 85 موظف
   - متخصصة في المجوهرات الذهبية والفضية

### 🎯 الميزات المتاحة في النسخة التجريبية:
- ✅ لوحات التحكم التفاعلية
- ✅ إدارة الموظفين والأقسام
- ✅ نظام الحضور والانصراف
- ✅ إدارة الإجازات والطلبات
- ✅ كشوف المرتبات والتقارير المالية
- ✅ إدارة المستندات والملفات
- ✅ النماذج الحكومية مع الملء التلقائي
- ✅ التحليلات الذكية والمؤشرات
- ✅ نظام الإشعارات المتقدم

### 💼 النسخة الكاملة تشمل:
- 🔧 تخصيص كامل للواجهة والحقول
- 🌐 ربط مع APIs خارجية (البنوك، الحكومة)
- 📈 تقارير متقدمة ولوحات تحكم مخصصة
- 👨‍💻 دعم تقني مستمر وتدريب
- 🔄 تحديثات دورية ومميزات جديدة
- ☁️ نسخة سحابية مع نسخ احتياطي تلقائي

### 📞 للحصول على النسخة الكاملة:
- 📧 **البريد الإلكتروني**: info@zeylab.com
- 🌐 **الموقع الإلكتروني**: https://zeylab.com  
- 📱 **واتساب**: +966-XX-XXX-XXXX
- 💬 **تيليجرام**: @ZeylabSupport

### 🛠️ المتطلبات التقنية:
- **النظام**: Windows 10/11, macOS, Linux
- **المعالج**: Intel i3 أو أعلى
- **الذاكرة**: 4GB RAM (8GB مفضل)
- **المساحة**: 500MB مساحة فارغة
- **الإنترنت**: اتصال للتحديثات (اختياري)

### 🔧 استكشاف الأخطاء:
1. **إذا لم يعمل التطبيق**: تأكد من تثبيت Node.js
2. **إذا ظهرت رسالة خطأ**: أعد تشغيل الملف كمسؤول
3. **للدعم التقني**: راسلنا على support@zeylab.com

---
### 📝 ملاحظات مهمة:
- هذه نسخة تجريبية محدودة الميزات
- البيانات المعروضة تجريبية وليست حقيقية  
- للاستخدام التجاري تحتاج النسخة الكاملة المرخصة

---
**© 2025 Zeylab Technologies. جميع الحقوق محفوظة.**

*نحن نساعد الشركات على تطوير أنظمة إدارة الموارد البشرية بأحدث التقنيات*`;

fs.writeFileSync(`${demoDir}/README.md`, readmeContent);
console.log('✅ تم إنشاء ملف README.md');

// إنشاء ملف تعليمات سريعة
const quickStartContent = `# تعليمات سريعة - Zeylab HRMS Demo

## 🚀 التشغيل السريع:
1. انقر مضاعف على: تشغيل-النظام.bat
2. انتظر حتى يفتح النظام (30 ثانية تقريباً)
3. استخدم بيانات الدخول: admin / admin123

## 🎯 أول استخدام:
1. سجل دخول كمسؤول عام
2. اختر شركة من القائمة
3. تصفح لوحة التحكم والميزات
4. جرب إضافة موظف جديد
5. شاهد التقارير والتحليلات

## 📧 تواصل معنا:
info@zeylab.com | https://zeylab.com

استمتع بتجربة النظام! 🎉`;

fs.writeFileSync(`${demoDir}/تعليمات-سريعة.txt`, quickStartContent);
console.log('✅ تم إنشاء ملف التعليمات السريعة');

console.log('\n🎉 تم إنشاء النسخة التجريبية بنجاح!');
console.log('📁 المجلد: zeylab-hrms-demo/');
console.log('💡 لتشغيل النسخة: انقر مضاعف على "تشغيل-النظام.bat"');
console.log('📖 اقرأ ملف README.md للتفاصيل الكاملة');
console.log('\n🔗 ملفات التشغيل المتاحة:');
console.log('   - تشغيل-النظام.bat (عربي)');
console.log('   - start-demo.bat (English)');
console.log('   - README.md (دليل شامل)');
console.log('   - تعليمات-سريعة.txt (تعليمات مختصرة)');