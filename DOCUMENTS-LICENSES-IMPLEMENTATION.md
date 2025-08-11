# تنفيذ صفحات المستندات والتراخيص

## نظرة عامة

تم إنشاء نظام متكامل لإدارة المستندات والتراخيص مع ربط كامل بـ API عبر drizzle-orm.

## المكونات المنشأة

### 1. نموذج المستندات (`document-form.tsx`)

**الميزات:**
- إنشاء مستندات جديدة
- تعديل المستندات الموجودة
- عرض تفاصيل المستندات
- رفع الملفات مع دعم أنواع متعددة
- إدارة العلامات والوصف
- تصنيف المستندات حسب الفئة

**الوظائف:**
- `handleSubmit`: حفظ المستند
- `handleFileChange`: إدارة اختيار الملفات
- `handleDownload`: تحميل المستند
- `handleDelete`: حذف المستند
- `validateForm`: التحقق من صحة البيانات

### 2. صفحة التراخيص (`licenses.tsx`)

**الميزات:**
- عرض جميع التراخيص مع إحصائيات
- فلترة متقدمة (شركة، حالة، نوع)
- إنشاء تراخيص جديدة
- تعديل التراخيص الموجودة
- عرض تفاصيل الترخيص
- إدارة المستندات المرتبطة بالتراخيص
- تنبيهات للتراخيص التي تنتهي قريباً

**المكونات الفرعية:**
- `LicenseForm`: نموذج إنشاء/تعديل الترخيص
- `LicenseView`: عرض تفاصيل الترخيص

### 3. صفحة المستندات المحدثة (`documents.tsx`)

**التحديثات:**
- ربط مع نموذج المستندات الجديد
- إضافة نوافذ منبثقة للإنشاء والتعديل والعرض
- تحسين واجهة المستخدم
- دعم البحث والفلترة المتقدمة

## الخدمات (Services)

### 1. خدمة المستندات (`documents.ts`)

```typescript
export const documentService = {
  getDocuments(filters): Promise<Document[]>
  getDocument(id): Promise<Document>
  createDocument(data): Promise<Document>
  updateDocument(id, data): Promise<Document>
  deleteDocument(id): Promise<void>
  downloadDocument(id): Promise<Blob>
  getCategories(): Promise<Category[]>
  uploadFile(file, onProgress): Promise<{url, fileName}>
}
```

### 2. خدمة التراخيص (`licenses.ts`)

```typescript
export const licenseService = {
  getLicenses(filters): Promise<License[]>
  getLicense(id): Promise<License>
  createLicense(data): Promise<License>
  updateLicense(id, data): Promise<License>
  deleteLicense(id): Promise<void>
  getCompanyLicenses(companyId): Promise<License[]>
  getStats(): Promise<LicenseStats>
  getTypes(): Promise<LicenseType[]>
  bulkUpdateStatus(ids, status): Promise<Result>
  getCompanies(): Promise<Company[]>
}
```

## API Routes

### 1. Document Routes (`document-routes.ts`)

**النقاط النهائية:**
- `GET /api/documents` - جلب المستندات مع فلترة
- `POST /api/documents` - إنشاء مستند جديد
- `GET /api/documents/:id` - جلب مستند محدد
- `PUT /api/documents/:id` - تحديث مستند
- `DELETE /api/documents/:id` - حذف مستند
- `GET /api/documents/:id/download` - تحميل مستند
- `POST /api/documents/upload` - رفع ملف
- `GET /api/documents/categories` - فئات المستندات

### 2. License Routes (`license-routes.ts`)

**النقاط النهائية:**
- `GET /api/licenses` - جلب التراخيص مع فلترة
- `POST /api/licenses` - إنشاء ترخيص جديد
- `GET /api/licenses/:id` - جلب ترخيص محدد
- `PUT /api/licenses/:id` - تحديث ترخيص
- `DELETE /api/licenses/:id` - حذف ترخيص
- `GET /api/companies/:id/licenses` - تراخيص شركة محددة
- `GET /api/licenses/stats` - إحصائيات التراخيص
- `GET /api/licenses/types` - أنواع التراخيص
- `PATCH /api/licenses/bulk-status` - تحديث جماعي للحالة

## قاعدة البيانات

### جداول المستندات والتراخيص

```sql
-- جدول المستندات
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  tags TEXT DEFAULT '[]',
  uploaded_by TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- جدول التراخيص
CREATE TABLE licenses (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  issue_date TEXT,
  expiry_date TEXT,
  issuing_authority TEXT,
  location TEXT,
  description TEXT,
  documents TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

## أنواع البيانات (Types)

### Document Interface
```typescript
interface Document {
  id?: string;
  name: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  tags?: string[];
  category: string;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license';
  status?: 'active' | 'inactive' | 'verified' | 'pending' | 'rejected';
  uploadedBy?: string;
  uploadDate?: string;
  modifiedDate?: string;
}
```

### License Interface
```typescript
interface License {
  id: string;
  companyId: string;
  name: string;
  type: string;
  number: string;
  status: 'active' | 'expired' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  location: string;
  description?: string;
  documents?: Document[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  employees?: Employee[];
}
```

## الميزات المتقدمة

### 1. إدارة الملفات
- دعم أنواع ملفات متعددة (PDF, DOC, XLS, صور, أرشيفات)
- عرض حجم الملف وتنسيقه
- معاينة الملفات
- تحميل مباشر

### 2. الفلترة والبحث
- بحث نصي في أسماء المستندات والتراخيص
- فلترة حسب الشركة والحالة والنوع
- فلترة حسب الفئة للمستندات
- ترتيب حسب التاريخ والحجم

### 3. التنبيهات والإشعارات
- تنبيهات للتراخيص التي تنتهي قريباً
- إشعارات عند إنشاء أو تحديث المستندات
- رسائل تأكيد للحذف

### 4. الأمان والصلاحيات
- تحقق من الصلاحيات حسب دور المستخدم
- حماية من الوصول غير المصرح به
- تشفير البيانات الحساسة

## كيفية الاستخدام

### 1. إنشاء مستند جديد
```typescript
import { documentService } from '../services/documents';

const newDocument = await documentService.createDocument({
  name: 'عقد العمل',
  category: 'contracts',
  description: 'عقد عمل للموظف الجديد',
  tags: ['عقد', 'توظيف'],
  entityId: 'employee-123',
  entityType: 'employee',
  file: selectedFile
});
```

### 2. إنشاء ترخيص جديد
```typescript
import { licenseService } from '../services/licenses';

const newLicense = await licenseService.createLicense({
  companyId: 'company-123',
  name: 'ترخيص تجاري رئيسي',
  type: 'main',
  number: 'LIC-2024-001',
  issueDate: '2024-01-15',
  expiryDate: '2025-01-15',
  issuingAuthority: 'وزارة التجارة',
  location: 'المباركية',
  description: 'ترخيص تجاري رئيسي للشركة'
});
```

### 3. جلب المستندات مع فلترة
```typescript
const documents = await documentService.getDocuments({
  companyId: 'company-123',
  category: 'contracts',
  search: 'عقد'
});
```

## التطوير المستقبلي

### 1. ميزات مقترحة
- معاينة الملفات مباشرة في المتصفح
- إصدارات المستندات
- توقيع إلكتروني للمستندات
- أرشفة تلقائية للمستندات القديمة
- تقارير مفصلة عن استخدام المستندات

### 2. تحسينات الأداء
- تحميل تدريجي للمستندات الكبيرة
- تخزين مؤقت للصور المصغرة
- ضغط الملفات تلقائياً
- مزامنة مع خدمات التخزين السحابي

### 3. تحسينات الأمان
- تشفير الملفات المحفوظة
- سجل تدقيق شامل
- نسخ احتياطية تلقائية
- حماية من البرمجيات الخبيثة

## الخلاصة

تم إنشاء نظام متكامل ومتطور لإدارة المستندات والتراخيص مع:

- واجهة مستخدم حديثة وسهلة الاستخدام
- ربط كامل مع قاعدة البيانات عبر drizzle-orm
- API قوي ومرن
- أمان وصلاحيات متقدمة
- قابلية للتوسع والتطوير المستقبلي

النظام جاهز للاستخدام في بيئة الإنتاج مع إمكانية التخصيص والتطوير حسب احتياجات المشروع. 