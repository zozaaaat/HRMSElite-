import React, {useState} from 'react';
import {Layout} from '../components/layout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Users, Building, FileText, Calendar, DollarSign, TrendingUp} from 'lucide-react';
import {log} from '../lib/logger';
import type {Company} from '../../../shared/schema';
import type {User as FrontendUser} from '../lib/authUtils';

function LayoutExample () {

  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // بيانات المستخدم الافتراضية (واجهة الويب)
  const sampleUser: FrontendUser = {
    id: 'user-1',
    sub: 'user-1',
    email: 'admin@company.com',
    firstName: 'أحمد',
    lastName: 'محمد',
    role: 'super_admin',
    companies: [
      {
        id: 'company-1',
        name: 'شركة النيل الأزرق للمجوهرات',
        commercialFileName: 'commercial_file.pdf',
        department: 'الجهراء',
        classification: 'تجارة',
        status: 'active',
        employeeCount: 45,
        industry: 'مجوهرات',
        establishmentDate: '2023-01-15',
        userRole: 'super_admin',
        userPermissions: ['view_reports', 'manage_employees'],
        logoUrl: undefined
      }
    ],
    permissions: ['view_reports', 'manage_employees'],
    companyId: 'company-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: undefined,
    isActive: true,
    emailVerified: false,
    profileImageUrl: undefined,
    claims: null
  };

  // بيانات الشركة الافتراضية
  const sampleCompany: Company = {
    'id': 'company-1',
    'name': 'شركة النيل الأزرق للمجوهرات',
    'commercialFileNumber': 'CF-2023-001',
    'commercialFileName': 'commercial_file.pdf',
    'commercialFileStatus': true,
    'establishmentDate': '2023-01-15',
    'commercialRegistrationNumber': 'CR-2023-001',
    'classification': 'تجارة',
    'department': 'الجهراء',
    'fileType': 'تجاري',
    'legalEntity': 'شركة ذات مسؤولية محدودة',
    'ownershipCategory': 'كويتي',
    'logoUrl': null,
    'address': 'الجهراء، شارع البحر، مجمع 123',
    'phone': '+965-12345678',
    'email': 'info@nileblue.com',
    'website': 'www.nileblue.com',
    'totalEmployees': 45,
    'totalLicenses': 3,
    'isActive': true,
    'industryType': 'مجوهرات',
    'businessActivity': 'تجارة المجوهرات والذهب',
    'location': 'الجهراء',
    'taxNumber': 'TAX-2023-001',
    'chambers': 'غرفة تجارة الكويت',
    'partnerships': '[]',
    'importExportLicense': 'IE-2023-001',
    'specialPermits': '[]',
    'createdAt': new Date('2023-01-15'),
    'updatedAt': new Date()
  };

  // معالجات الأحداث
  const handleLogout = () => {

    log.user('تسجيل الخروج', sampleUser.id);
    // هنا يمكن إضافة منطق تسجيل الخروج

  };

  const handleSettingsClick = () => {

    log.user('فتح الإعدادات', sampleUser.id);
    setActiveView('settings');

  };

  const handleSearchClick = () => {

    log.user('فتح البحث', sampleUser.id);

  };

  const handleNotificationsClick = () => {

    log.user('فتح الإشعارات', sampleUser.id);

  };

  const handleThemeToggle = () => {

    setIsDarkMode(!isDarkMode);
    log.user('تبديل المظهر', sampleUser.id, {'theme': !isDarkMode ? 'داكن' : 'فاتح'});

  };

  const handleViewChange = (view: string) => {

    setActiveView(view);
    log.user('تغيير العرض', sampleUser.id, {view});

  };

  // معالجات الميزات المتقدمة
  const handleAIAssistantOpen = () => {

    log.user('فتح المساعد الذكي', sampleUser.id);

  };

  const handleBIDashboardOpen = () => {

    log.user('فتح لوحة التحكم التحليلية', sampleUser.id);

  };

  const handleWorkflowBuilderOpen = () => {

    log.user('فتح منشئ سير العمل', sampleUser.id);

  };

  const handleLearningManagementOpen = () => {

    log.user('فتح إدارة التعلم', sampleUser.id);

  };

  const handleFinancialManagementOpen = () => {

    log.user('فتح الإدارة المالية', sampleUser.id);

  };

  const handleMobileAppOpen = () => {

    log.user('فتح التطبيق المحمول', sampleUser.id);

  };

  const handleEmployee360Open = () => {

    log.user('فتح عرض الموظف 360', sampleUser.id);

  };

  return (
    <Layout
      user={sampleUser}
      company={sampleCompany}
      activeView={activeView}
      onViewChange={handleViewChange}
      onLogout={handleLogout}
      onSettingsClick={handleSettingsClick}
      onSearchClick={handleSearchClick}
      onNotificationsClick={handleNotificationsClick}
      onThemeToggle={handleThemeToggle}
      isDarkMode={isDarkMode}
      onAIAssistantOpen={handleAIAssistantOpen}
      onBIDashboardOpen={handleBIDashboardOpen}
      onWorkflowBuilderOpen={handleWorkflowBuilderOpen}
      onLearningManagementOpen={handleLearningManagementOpen}
      onFinancialManagementOpen={handleFinancialManagementOpen}
      onMobileAppOpen={handleMobileAppOpen}
      onEmployee360Open={handleEmployee360Open}
    >
      {/* محتوى الصفحة */}
      <div className="space-y-6">
        {/* عنوان الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">
              مرحباً بك في نظام إدارة الموارد البشرية
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            العرض النشط: {activeView}
          </Badge>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleCompany.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                +12% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التراخيص النشطة</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleCompany.totalLicenses}</div>
              <p className="text-xs text-muted-foreground">
                جميع التراخيص سارية
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستندات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +8 مستندات جديدة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                تحتاج مراجعة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* معلومات الشركة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
              <CardDescription>
                تفاصيل الشركة الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">اسم الشركة:</span>
                <span className="text-sm font-medium">{sampleCompany.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">رقم الملف التجاري:</span>
                <span className="text-sm font-medium">{sampleCompany.commercialFileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">النشاط التجاري:</span>
                <span className="text-sm font-medium">{sampleCompany.businessActivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">الموقع:</span>
                <span className="text-sm font-medium">{sampleCompany.location}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>
                الوصول السريع للميزات المهمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                إدارة الموظفين
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                إدارة الإجازات
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                الرواتب والمكافآت
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                التقارير والإحصائيات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );

}

export default LayoutExample;
