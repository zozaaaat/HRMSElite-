# 📚 دليل استخدام التوثيق - HRMS Elite

## 🌐 نظرة عامة

هذا الدليل يوضح كيفية استخدام جميع ميزات التوثيق المتاحة في نظام HRMS Elite.

## 🚀 الوصول إلى التوثيق

### 1. Swagger UI API Documentation

#### الوصول المباشر
```bash
# تشغيل الخادم
npm run dev

# الوصول إلى Swagger UI
http://localhost:3000/api-docs
```

#### الميزات المتاحة
- **واجهة تفاعلية**: اختبار API مباشرة من المتصفح
- **توثيق شامل**: جميع نقاط النهاية موثقة
- **أمثلة**: أمثلة للاستخدام مع كل نقطة نهائية
- **المصادقة**: دعم Session و CSRF
- **الفلترة**: البحث في نقاط النهاية
- **التجربة**: تجربة API مباشرة

#### كيفية الاستخدام
1. **استكشاف API**:
   - تصفح نقاط النهاية حسب الفئة
   - اقرأ الوصف والأمثلة
   - جرب النقاط النهائية مباشرة

2. **اختبار API**:
   - انقر على "Try it out"
   - أدخل البيانات المطلوبة
   - اضغط "Execute"
   - شاهد النتيجة

3. **المصادقة**:
   - استخدم Session authentication
   - أضف CSRF token عند الحاجة

### 2. JSDoc Documentation

#### إنشاء التوثيق
```bash
# إنشاء التوثيق
npm run docs:generate

# تشغيل خادم التوثيق
npm run docs:serve

# مراقبة التغييرات
npm run docs:watch
```

#### الوصول إلى التوثيق
```bash
# بعد تشغيل الخادم
http://localhost:3000/docs/jsdoc
```

#### الميزات المتاحة
- **تصفح الكود**: استكشاف جميع الدوال والكلاسات
- **البحث**: البحث في التوثيق
- **التصفية**: تصفية حسب النوع
- **الروابط**: روابط للتنقل بين الملفات

### 3. README Files

#### للمطورين
- **DEVELOPER-GUIDE.md**: دليل شامل للمطورين
- **API-DOCUMENTATION.md**: توثيق API الأساسي
- **AUTHENTICATION-IMPLEMENTATION.md**: تفاصيل المصادقة

#### للمستخدمين
- **USER-MANUAL.md**: دليل المستخدم النهائي
- **COMPREHENSIVE-USER-DEVELOPER-GUIDE.md**: دليل شامل

## 📖 كيفية إضافة التوثيق

### 1. إضافة توثيق Swagger

#### في ملفات Routes
```typescript
/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: الحصول على قائمة الشركات
 *     description: استرجاع جميع الشركات مع إمكانية الفلترة والترتيب
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: رقم الصفحة
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: عدد العناصر في الصفحة
 *     responses:
 *       200:
 *         description: قائمة الشركات
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 companies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: غير مصرح
 *       500:
 *         description: خطأ في الخادم
 */
router.get('/companies', async (req, res) => {
  // التنفيذ
});
```

#### إضافة نماذج البيانات
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - commercialFileName
 *       properties:
 *         id:
 *           type: string
 *           description: معرف الشركة الفريد
 *           example: "company-1"
 *         name:
 *           type: string
 *           description: اسم الشركة
 *           example: "شركة الاتحاد الخليجي"
 *         commercialFileName:
 *           type: string
 *           description: الاسم التجاري
 *           example: "الاتحاد الخليجي للتجارة"
 */
```

### 2. إضافة توثيق JSDoc

#### للدوال
```typescript
/**
 * إنشاء شركة جديدة في النظام
 * @async
 * @function createCompany
 * @param {Object} companyData - بيانات الشركة
 * @param {string} companyData.name - اسم الشركة
 * @param {string} companyData.commercialFileName - الاسم التجاري
 * @param {string} companyData.department - قسم الشركة
 * @param {string} companyData.classification - تصنيف الشركة
 * @param {string} companyData.industry - الصناعة
 * @param {string} companyData.establishmentDate - تاريخ التأسيس
 * @param {string} [companyData.status='active'] - حالة الشركة
 * @returns {Promise<Company>} الشركة المنشأة
 * @throws {ValidationError} عند وجود أخطاء في البيانات
 * @throws {DatabaseError} عند فشل حفظ البيانات
 * 
 * @example
 * ```typescript
 * const newCompany = await createCompany({
 *   name: "شركة الاتحاد الخليجي",
 *   commercialFileName: "الاتحاد الخليجي للتجارة",
 *   department: "التجارة العامة",
 *   classification: "شركة ذات مسؤولية محدودة",
 *   industry: "التجارة",
 *   establishmentDate: "2020-01-15"
 * });
 * console.log(newCompany.id); // "company-1"
 * ```
 * 
 * @since 1.0.0
 * @author فريق التطوير
 * @category Companies
 */
async function createCompany(companyData: CreateCompanyData): Promise<Company> {
  // التنفيذ
}
```

#### للكلاسات
```typescript
/**
 * كلاس إدارة الشركات
 * @class CompanyManager
 * @description يدير عمليات الشركات في النظام
 * 
 * @example
 * ```typescript
 * const companyManager = new CompanyManager();
 * const companies = await companyManager.getAllCompanies();
 * ```
 * 
 * @since 1.0.0
 * @author فريق التطوير
 */
class CompanyManager {
  /**
   * إنشاء شركة جديدة
   * @param {CreateCompanyData} data - بيانات الشركة
   * @returns {Promise<Company>} الشركة المنشأة
   */
  async createCompany(data: CreateCompanyData): Promise<Company> {
    // التنفيذ
  }
}
```

### 3. إضافة README

#### هيكل README
```markdown
# 📚 عنوان الوثيقة

## 🌐 نظرة عامة
وصف مختصر للوثيقة

## 🚀 البدء السريع
خطوات سريعة للبدء

## 📖 الدليل التفصيلي
تفاصيل شاملة

## 🔧 الإعداد
خطوات الإعداد

## 📊 الأمثلة
أمثلة عملية

## ❓ الأسئلة الشائعة
أسئلة وأجوبة شائعة

## 🔗 روابط مفيدة
روابط إضافية
```

## 🛠️ أدوات التوثيق

### 1. النصوص البرمجية المتاحة
```bash
# إنشاء توثيق JSDoc
npm run docs:generate

# تشغيل خادم التوثيق
npm run docs:serve

# مراقبة التغييرات
npm run docs:watch

# فتح Swagger UI
npm run docs:swagger

# إنشاء جميع التوثيق
npm run docs:all
```

### 2. إعدادات JSDoc
```json
{
  "source": {
    "include": [
      "client/src",
      "server",
      "shared"
    ],
    "includePattern": "\\.(js|ts|tsx)$",
    "excludePattern": "(node_modules/|docs/)"
  },
  "opts": {
    "destination": "./docs/jsdoc",
    "recurse": true,
    "readme": "./docs/README.md"
  }
}
```

### 3. إعدادات Swagger
```typescript
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Elite API',
      version: '1.0.0',
      description: 'نظام إدارة الموارد البشرية المتكامل'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./server/routes/*.ts']
};
```

## 📊 أفضل الممارسات

### 1. توثيق Swagger
- ✅ استخدم أوصاف واضحة ومفصلة
- ✅ أضف أمثلة واقعية
- ✅ وثق جميع المعاملات
- ✅ وثق جميع الاستجابات
- ✅ استخدم التصنيفات (Tags)

### 2. توثيق JSDoc
- ✅ وثق جميع المعاملات
- ✅ أضف أمثلة للاستخدام
- ✅ استخدم التصنيفات
- ✅ وثق الاستثناءات
- ✅ أضف معلومات الإصدار

### 3. README Files
- ✅ استخدم عناوين واضحة
- ✅ أضف أمثلة عملية
- ✅ استخدم قوائم منظمة
- ✅ أضف روابط مفيدة
- ✅ حافظ على التحديث

## 🔗 الروابط المهمة

### التوثيق المباشر
- **Swagger UI**: `http://localhost:3000/api-docs`
- **JSDoc**: `http://localhost:3000/docs/jsdoc`
- **API Spec**: `http://localhost:3000/api-docs/swagger.json`

### ملفات التوثيق
- **User Manual**: `docs/USER-MANUAL.md`
- **Developer Guide**: `docs/DEVELOPER-GUIDE.md`
- **API Documentation**: `docs/API-DOCUMENTATION.md`
- **Authentication**: `docs/AUTHENTICATION-IMPLEMENTATION.md`

## ✅ الخلاصة

نظام التوثيق في HRMS Elite يوفر:

- 🔧 **Swagger UI** تفاعلي وشامل
- 📝 **JSDoc** محسن مع قوالب جميلة
- 📖 **README** شاملة للمستخدمين والمطورين
- 🛠️ **أدوات** متقدمة للتوثيق
- 🌐 **دعم متعدد اللغات**
- 📊 **أمثلة عملية** وواقعية

النظام جاهز للاستخدام مع توثيق احترافي عالي الجودة.
