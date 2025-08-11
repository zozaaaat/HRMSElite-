# دليل حل مشاكل تشغيل نظام إدارة الموارد البشرية

## المشكلة الأساسية
إذا كنت تواجه مشكلة في تشغيل النسخة المستقلة من البرنامج، إليك الحلول:

## الحل الأول: تثبيت Node.js
1. اذهب إلى الموقع الرسمي: https://nodejs.org/
2. حمل النسخة LTS (الأكثر استقراراً)
3. ثبت Node.js على جهازك
4. أعد تشغيل الكمبيوتر
5. جرب تشغيل النظام مرة أخرى

## الحل الثاني: استخدام ملفات التشغيل الجديدة
تم إنشاء ملفات تشغيل محدثة لحل مشكلة المسارات:

### الطريقة السريعة:
```
انقر نقراً مزدوجاً على: scripts/QUICK-START.bat
```

### الطريقة الكاملة:
```
انقر نقراً مزدوجاً على: scripts/START-FULL-VERSION.bat
```

### الطريقة مع الفحص:
```
انقر نقراً مزدوجاً على: scripts/CHECK-AND-RUN.bat
```

### الطريقة باستخدام PowerShell:
```
انقر بزر الماوس الأيمن على: scripts/START-HRMS.ps1
اختر: "Run with PowerShell"
```

## الحل الثالث: التشغيل اليدوي
1. افتح موجه الأوامر (Command Prompt)
2. انتقل إلى مجلد المشروع
3. اكتب الأوامر التالية:

```cmd
cd backup\standalone-versions
node ZeylabHRMS-Standalone.cjs
```

## الحل الرابع: استخدام PowerShell
1. افتح PowerShell
2. انتقل إلى مجلد المشروع
3. اكتب الأوامر التالية:

```powershell
cd backup\standalone-versions
node ZeylabHRMS-Standalone.cjs
```

## فحص النظام
للتأكد من أن كل شيء يعمل بشكل صحيح:

1. **فحص Node.js:**
   ```cmd
   node --version
   ```

2. **فحص وجود الملفات:**
   ```cmd
   dir backup\standalone-versions
   ```

3. **فحص المنفذ:**
   ```cmd
   netstat -an | findstr :5000
   ```

## حل المشاكل الشائعة

### المشكلة: "Node.js غير مثبت"
**الحل:** ثبت Node.js من الموقع الرسمي

### المشكلة: "الملفات غير موجودة"
**الحل:** تأكد من وجود مجلد `backup\standalone-versions`

### المشكلة: "المنفذ 5000 مشغول"
**الحل:** 
1. أوقف التطبيقات التي تستخدم المنفذ 5000
2. أو غير المنفذ في الملف

### المشكلة: "خطأ في الوصول للملفات"
**الحل:** 
1. تأكد من صلاحيات الوصول
2. جرب تشغيل كمسؤول

## الملفات المتاحة

### ملفات التشغيل:
- `scripts/QUICK-START.bat` - التشغيل السريع
- `scripts/START-FULL-VERSION.bat` - النسخة الكاملة
- `scripts/CHECK-AND-RUN.bat` - مع فحص النظام
- `scripts/START-HRMS.ps1` - PowerShell

### ملفات النظام:
- `backup/standalone-versions/ZeylabHRMS-Standalone.cjs` - النسخة البسيطة
- `backup/standalone-versions/ZeylabHRMS-Final.cjs` - النسخة الكاملة
- `backup/standalone-versions/TEST-STANDALONE.js` - اختبار النظام

## معلومات النظام
- **المنفذ:** 5000
- **الرابط:** http://localhost:5000
- **النسخة:** 2.1.0
- **النوع:** CommonJS Compatible

## الحسابات التجريبية
- admin / admin123
- manager / manager123
- employee / emp123
- supervisor / super123
- worker / work123

## الدعم التقني
إذا استمرت المشكلة، يرجى:
1. التقاط صورة للخطأ
2. تسجيل خطوات التكرار
3. التواصل مع فريق الدعم التقني 