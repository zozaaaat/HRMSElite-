# مكون التقاط التوقيع - Signature Capture Component

## نظرة عامة

تم إنشاء مكون التقاط التوقيع باستخدام Canvas API لتوفير تجربة توقيع رقمية متقدمة. يدعم المكون الرسم بالماوس واللمس، مع إمكانية حفظ التوقيعات كـ base64 أو رفعها إلى cloud storage.

## المميزات

### 🎨 واجهة مستخدم متقدمة
- **Canvas للرسم**: استخدام HTML5 Canvas للرسم السلس
- **دعم اللمس**: يعمل على الأجهزة اللوحية والهواتف
- **أدوات الرسم**: تغيير لون وسمك القلم
- **واجهة عربية**: تصميم متوافق مع اللغة العربية

### 💾 خيارات الحفظ
- **Base64**: حفظ مباشر في الذاكرة
- **Cloud Storage**: رفع إلى خدمات السحابة (AWS S3, Google Cloud)
- **PNG Export**: تصدير كملفات PNG
- **PDF Conversion**: تحويل إلى PDF

### 🔗 التكامل مع النظام
- **ربط بالمستندات**: إضافة توقيعات للمستندات
- **ربط بالإجازات**: توقيع طلبات الإجازات
- **ربط بالتراخيص**: توقيع التراخيص
- **ربط بالموظفين**: توقيعات الموظفين

## الملفات المنشأة

### 1. المكون الرئيسي
```
client/src/components/signature-capture.tsx
```

### 2. أنواع البيانات
```
client/src/types/documents.ts (تم تحديثه)
client/src/types/leave.ts (تم تحديثه)
```

### 3. الخدمات
```
client/src/services/signature.ts
```

### 4. الصفحات
```
client/src/pages/signature-test.tsx
client/src/pages/signatures.tsx
```

### 5. النماذج المحدثة
```
client/src/components/document-form.tsx (تم تحديثه)
client/src/components/leave-request-form.tsx (تم تحديثه)
```

## كيفية الاستخدام

### الاستخدام الأساسي

```tsx
import SignatureCapture from './components/signature-capture';

function MyComponent() {
  const handleSignatureSave = (signatureData) => {
    console.log('التوقيع المحفوظ:', signatureData);
  };

  return (
    <SignatureCapture
      entityId="emp-001"
      entityType="employee"
      onSave={handleSignatureSave}
      title="توقيع الموظف"
      description="قم بالتوقيع في المساحة أدناه"
    />
  );
}
```

### الاستخدام في نموذج المستندات

```tsx
// في نموذج المستندات
<SignatureCapture
  entityId={entityId}
  entityType="document"
  onSave={handleSignatureSave}
  onCancel={() => setShowSignatureCapture(false)}
  title="توقيع المستند"
  description="قم بالتوقيع على المستند"
/>
```

### الاستخدام في طلب الإجازة

```tsx
// في نموذج طلب الإجازة
<SignatureCapture
  entityId={employeeId}
  entityType="leave"
  onSave={handleSignatureSave}
  onCancel={() => setShowSignatureCapture(false)}
  title="توقيع الموظف"
  description="قم بالتوقيع على طلب الإجازة"
/>
```

## الخصائص (Props)

### SignatureCaptureProps

| الخاصية | النوع | الافتراضي | الوصف |
|---------|-------|-----------|-------|
| `entityId` | `string` | - | معرف الكيان المرتبط بالتوقيع |
| `entityType` | `'employee' \| 'company' \| 'license' \| 'leave' \| 'document'` | - | نوع الكيان |
| `onSave` | `(signature: SignatureData) => void` | - | دالة حفظ التوقيع |
| `onCancel` | `() => void` | - | دالة إلغاء العملية |
| `mode` | `'create' \| 'edit' \| 'view'` | `'create'` | وضع المكون |
| `existingSignature` | `SignatureData` | - | التوقيع الموجود (للتحرير) |
| `title` | `string` | `'التوقيع'` | عنوان المكون |
| `description` | `string` | `'قم بالتوقيع في المساحة أدناه'` | وصف المكون |
| `required` | `boolean` | `false` | هل التوقيع مطلوب |

## أنواع البيانات

### SignatureData

```typescript
interface SignatureData {
  id?: string;
  imageData: string; // base64 data
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license' | 'leave' | 'document';
  status?: 'active' | 'inactive';
}
```

## الخدمات المتاحة

### API Services

```typescript
// إنشاء توقيع جديد
createSignature(data: CreateSignatureRequest): Promise<SignatureResponse>

// تحديث توقيع موجود
updateSignature(id: string, data: UpdateSignatureRequest): Promise<SignatureResponse>

// حذف توقيع
deleteSignature(id: string): Promise<void>

// الحصول على توقيع
getSignature(id: string): Promise<SignatureResponse>

// الحصول على توقيعات كيان معين
getSignaturesByEntity(entityId: string, entityType: string): Promise<SignatureResponse[]>

// رفع إلى cloud storage
uploadSignatureToCloud(imageData: string, fileName: string): Promise<string>

// تحويل إلى PDF
convertSignatureToPDF(signatureId: string): Promise<Blob>

// التحقق من صحة التوقيع
verifySignature(signatureId: string): Promise<VerificationResult>
```

## المميزات التقنية

### Canvas API
- **الرسم السلس**: استخدام `beginPath()`, `moveTo()`, `lineTo()`, `stroke()`
- **دعم اللمس**: معالجة أحداث `touchstart`, `touchmove`, `touchend`
- **دعم الماوس**: معالجة أحداث `mousedown`, `mousemove`, `mouseup`

### Base64 Encoding
- **تحويل Canvas**: `canvas.toDataURL('image/png')`
- **حجم الملف**: حساب حجم الملف تقريبياً
- **ضغط الصورة**: تحسين حجم البيانات

### Cloud Integration
- **AWS S3**: رفع الملفات إلى Amazon S3
- **Google Cloud**: رفع الملفات إلى Google Cloud Storage
- **Azure Blob**: رفع الملفات إلى Azure Blob Storage

## الأمان

### التحقق من صحة التوقيع
- **التوقيع الرقمي**: استخدام التوقيعات الرقمية
- **التحقق من الهوية**: التحقق من هوية الموقع
- **التشفير**: تشفير بيانات التوقيع

### حماية البيانات
- **HTTPS**: نقل آمن للبيانات
- **التشفير**: تشفير البيانات المخزنة
- **الصلاحيات**: التحكم في الصلاحيات

## الاختبار

### صفحة الاختبار
```
http://localhost:3000/signature-test
```

### الميزات المختبرة
- ✅ الرسم بالماوس
- ✅ الرسم باللمس
- ✅ تغيير لون القلم
- ✅ تغيير سمك القلم
- ✅ حفظ التوقيع
- ✅ تحميل التوقيع
- ✅ رفع ملف صورة
- ✅ مسح التوقيع

## التطوير المستقبلي

### الميزات المخططة
- [ ] **التوقيع البيومتري**: دعم البصمة والوجه
- [ ] **التوقيع الصوتي**: التوقيع بالصوت
- [ ] **التحقق المتقدم**: استخدام الذكاء الاصطناعي
- [ ] **التوقيع الجماعي**: توقيعات متعددة
- [ ] **التوقيع الموقوت**: توقيعات محددة زمنياً

### التحسينات التقنية
- [ ] **WebAssembly**: تحسين الأداء
- [ ] **Service Workers**: العمل دون اتصال
- [ ] **PWA**: تطبيق ويب تقدمي
- [ ] **Blockchain**: حفظ التوقيعات في البلوكتشين

## الدعم والمساهمة

### الإبلاغ عن الأخطاء
يرجى الإبلاغ عن أي أخطاء أو مشاكل في GitHub Issues.

### المساهمة
نرحب بالمساهمات! يرجى اتباع إرشادات المساهمة.

### الدعم
للحصول على الدعم، يرجى التواصل عبر:
- البريد الإلكتروني: support@hrms-elite.com
- GitHub Issues: [رابط المشروع]

## الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف LICENSE للتفاصيل. 