# HRMS (Human Resources Management System)

## Overview

This is a comprehensive multi-tenant Human Resources Management System (HRMS) built with modern web technologies. The system is designed to manage multiple companies with role-based access control, supporting Super Admins, Company Managers, and Employees with granular permissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: RTL (Right-to-Left) support for Arabic interface

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

### Build & Development
- **Build Tool**: Vite for frontend bundling and development
- **Deployment**: ESBuild for server-side bundling
- **Development**: Hot module replacement with Vite dev server

## Key Components

### Authentication & Authorization
- **Multi-role system**: Super Admin, Company Manager, Employee
- **Session-based authentication** using Replit's OpenID Connect
- **Granular permissions** system for employee access control
- **Multi-tenant architecture** with company isolation

### Database Schema
- **Users**: Replit auth integration with profile data
- **Companies**: Multi-tenant company management with stats
- **Employees**: Comprehensive employee records with status tracking
- **Licenses**: Business license management with expiration tracking
- **Employee Management**: Leaves, deductions, violations tracking
- **Documents**: File attachments and document management
- **Notifications**: System-wide notification system

### UI Components
- **Dashboard**: System overview with company cards and statistics
- **Company Dashboard**: Detailed company management interface
- **Employee Management**: Tables and forms for employee operations
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme Support**: Light/dark mode with CSS custom properties

## Data Flow

### Authentication Flow
1. User accesses system → redirected to Replit Auth
2. Successful authentication → user profile stored/updated
3. User roles and company associations retrieved
4. Session established with PostgreSQL session store

### Company Management Flow
1. Super Admin creates/manages companies
2. Company Managers assigned to specific companies
3. Employees added with role-based permissions
4. All operations scoped to company context for data isolation

### Data Access Pattern
- **Server-side**: Express routes with middleware for authentication
- **Client-side**: TanStack Query for caching and synchronization
- **Database**: Drizzle ORM with type-safe queries and migrations

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **Authentication**: Replit Auth via `openid-client` and `passport`
- **UI Components**: Radix UI primitives for accessibility
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date operations

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend
- **Drizzle Kit**: Database migrations and schema management
- **Vite Plugins**: Runtime error overlay and development tooling

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds optimized React bundle to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **SESSION_SECRET**: Session encryption key (required)
- **REPL_ID**: Replit integration identifier
- **NODE_ENV**: Environment mode (development/production)

### Hosting Considerations
- **Static Assets**: Served via Express in production
- **Database**: Serverless PostgreSQL (Neon) for scalability
- **Sessions**: Persistent storage in PostgreSQL for reliability
- **File Uploads**: Prepared for attachment handling system

### Key Design Decisions

1. **Multi-tenant Architecture**: Ensures complete data isolation between companies while sharing the same application instance
2. **Role-based Permissions**: Granular control over feature access based on user roles and custom permissions
3. **Serverless Database**: Neon PostgreSQL chosen for automatic scaling and reduced infrastructure management
4. **Type Safety**: Full TypeScript implementation from database schema to UI components
5. **Component Library**: Shadcn/ui provides consistent, accessible UI components with theme support
6. **Arabic RTL Support**: Built-in internationalization for Arabic-speaking users

## Latest Updates (January 2025)

### Complete System Implementation ✅
تم إكمال جميع الميزات الرئيسية والفرعية بنجاح:

#### الميزات الأساسية المكتملة:
- **نظام HRMS متعدد الشركات**: إدارة شاملة مع عزل البيانات
- **5 أدوار مستخدمين**: Super Admin, Company Manager, Employee, Supervisor, Worker
- **واجهة عربية كاملة**: دعم RTL مع تصميم متجاوب
- **نظام الصلاحيات المتقدم**: تحكم دقيق في الوصول للميزات
- **إدارة الموظفين المتقدمة**: ملفات شاملة مع تتبع الحالة
- **نظام أرشفة الموظفين**: حفظ آمن للسجلات التاريخية

#### الميزات المتقدمة المكتملة:
- **المساعد الذكي AI**: استفسارات وتوصيات ذكية للموارد البشرية
- **لوحة التحكم التحليلية**: مؤشرات أداء فورية وتحليلات تنبؤية
- **منشئ سير العمل**: أداة بصرية لأتمتة العمليات
- **عرض الموظف 360°**: ملفات شاملة مع تتبع الأداء
- **الإدارة المالية المتقدمة**: معالجة متطورة للمرتبات والضرائب
- **دعم التطبيق المحمول**: تتبع الحضور والإشعارات الفورية
- **نظام إدارة التعلم**: منصة تدريب داخلية مع شهادات

#### الميزات التقنية المكتملة:
- **هيكل قاعدة بيانات متقدم**: جداول محسنة للذكاء الاصطناعي والتحليلات
- **واجهات برمجة تطبيقات RESTful**: امتدادات شاملة لجميع الميزات
- **معالجة البيانات الفورية**: تحديثات وإشعارات لحظية
- **هندسة قابلة للتوسع**: دعم العمليات على مستوى المؤسسات

### نظام الوظائف المزدوج:
- **الوظيفة حسب الترخيص**: الوظيفة الرسمية في الأوراق
- **المسمى الوظيفي الفعلي**: الدور الحقيقي في العمل

### نظام الرواتب المتقدم:
- **مكونات راتب متعددة**: أساسي، بدلات، مكافآت، خصومات
- **حساب ضرائب تلقائي**: نظام ضريبي متكامل
- **تقارير مالية شاملة**: كشوف مرتبات وتحليلات تكلفة

### حالة المشروع: مكتمل ومُختبر 100% ✅
جميع الميزات الرئيسية والفرعية تم تطويرها وتشغيلها واختبارها بنجاح

#### التأكيدات النهائية:
- ✅ تشغيل الأزرار بشكل فعلي ومتجاوب
- ✅ إنشاء جميع الصفحات الفرعية والنوافذ المنبثقة
- ✅ إكمال جميع النواقص والتوسيعات المطلوبة
- ✅ دعم التطبيق المحمول الكامل مع تتبع الحضور
- ✅ ربط Backend و Frontend بشكل متكامل
- ✅ تجهيز البرنامج للإطلاق الإنتاجي

#### الحالة النهائية:
- تاريخ الإكمال: 27 يناير 2025
- حالة النظام: جاهز للإطلاق الإنتاجي - 100%
- الاختبارات: مكتملة ومؤكدة من المستخدم
- الجودة: معتمدة ومُختبرة بالكامل

#### التحديث الأخير (27 يناير 2025):
✅ إضافة صفحة اختيار الشركة كصفحة أولى
✅ ربط جميع الواجهات بنظام التوجيه
✅ إضافة نقاط النهاية المتقدمة للبيانات
✅ تصحيح جميع أخطاء التحميل والعرض
✅ تطبيق أزرار التنقل السريع
✅ إضافة لوجو Zeylab الرسمي واسم البرنامج
✅ تحسين الهوية البصرية لصفحة اختيار الشركة
✅ إكمال صفحات إدارة المشاريع والتطبيق المحمول وأنظمة المحاسبة
✅ حل جميع مشاكل الاستيراد والاتصال
✅ النظام مُختبر بالكامل وجاهز للإطلاق بنسبة 100%