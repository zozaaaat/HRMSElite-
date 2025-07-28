import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Calendar, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Moon,
  Sun,
  LogOut,
  Users,
  BarChart3,
  DollarSign,
  Building2,
  ClipboardList,
  Package,
  Briefcase,
  TrendingUp,
  Settings,
  Shield,
  BookOpen,
  Award
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { useTheme } from "@/components/theme-provider";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";
import { useLocation } from "wouter";

export default function EmployeeDashboard() {
  return (
    <SharedLayout 
      userRole="employee" 
      userName="أحمد محمد علي" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <EmployeeDashboardContent />
    </SharedLayout>
  );
}

function EmployeeDashboardContent() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Mock data for admin employee
  const employeeStats = {
    totalEmployees: 450,
    activeEmployees: 425,
    pendingRequests: 12,
    leaveRequests: 8,
    documentsToProcess: 15,
    upcomingReviews: 6,
    attendanceRate: 94.5,
    trainingPrograms: 3
  };

  const permissions = [
    "إدارة الموظفين",
    "معالجة الطلبات",
    "إصدار التقارير",
    "إدارة المستندات",
    "النماذج الحكومية",
    "متابعة الحضور",
    "تنظيم التدريب"
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src={zeylabLogo} 
                alt="Zeylab Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">Zeylab HRMS</h1>
                <p className="text-sm text-muted-foreground">لوحة تحكم الموظف الإداري</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => console.log('فتح مركز الإشعارات - 5 إشعارات جديدة')}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  5
                </span>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-medium block">
                    {(user as any)?.name || 'الموظف الإداري'}
                  </span>
                  <span className="text-xs text-muted-foreground">قسم الموارد البشرية</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="employees">الموظفين</TabsTrigger>
            <TabsTrigger value="requests">الطلبات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                      <p className="text-2xl font-bold">{employeeStats.totalEmployees}</p>
                      <p className="text-xs text-green-600 mt-1">+5% من الشهر الماضي</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">الطلبات المعلقة</p>
                      <p className="text-2xl font-bold">{employeeStats.pendingRequests}</p>
                      <p className="text-xs text-orange-600 mt-1">تحتاج معالجة</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">معدل الحضور</p>
                      <p className="text-2xl font-bold">{employeeStats.attendanceRate}%</p>
                      <p className="text-xs text-green-600 mt-1">أداء ممتاز</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">المستندات</p>
                      <p className="text-2xl font-bold">{employeeStats.documentsToProcess}</p>
                      <p className="text-xs text-purple-600 mt-1">للمعالجة</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Actions - expanded to 5 columns to fit all */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-10 w-10 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">إدارة الموظفين</h3>
                  <p className="text-sm text-muted-foreground mb-3">إضافة وتعديل بيانات الموظفين</p>
                  <Button className="w-full" size="sm" onClick={() => setLocation(`/employees?company=${companyId}`)}>
                    فتح الإدارة
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <ClipboardList className="h-10 w-10 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">معالجة الطلبات</h3>
                  <p className="text-sm text-muted-foreground mb-3">الموافقة على الإجازات والطلبات</p>
                  <Button className="w-full" size="sm" onClick={() => setActiveTab("requests")}>
                    عرض الطلبات
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BarChart3 className="h-10 w-10 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">التقارير والإحصائيات</h3>
                  <p className="text-sm text-muted-foreground mb-3">إنشاء تقارير شاملة</p>
                  <Button className="w-full" size="sm" onClick={() => setLocation(`/reports?company=${companyId}`)}>
                    إنشاء تقرير
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <BookOpen className="h-10 w-10 text-purple-500 mb-3" />
                  <h3 className="font-semibold mb-2">برامج التدريب</h3>
                  <p className="text-sm text-muted-foreground mb-3">تنظيم وإدارة التدريب</p>
                  <Button className="w-full" size="sm" onClick={() => setActiveTab("documents")}>
                    إدارة التدريب
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <ClipboardList className="h-10 w-10 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">النماذج الحكومية</h3>
                  <p className="text-sm text-muted-foreground mb-3">النماذج الرسمية الكويتية</p>
                  <Button className="w-full" size="sm" onClick={() => setLocation(`/government-forms?company=${companyId}`)}>
                    عرض النماذج
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Permissions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  صلاحياتك الإدارية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="justify-center p-2">
                      <CheckCircle className="h-3 w-3 ml-1" />
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>قائمة الموظفين</span>
                  <Button size="sm">
                    <Users className="h-4 w-4 ml-2" />
                    إضافة موظف
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="البحث عن موظف..."
                      className="flex-1 px-3 py-2 rounded-md border bg-background"
                    />
                    <Button variant="outline">بحث</Button>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>يتم تحميل قائمة الموظفين...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الطلبات المعلقة ({employeeStats.pendingRequests})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample request items */}
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">طلب إجازة سنوية</h4>
                        <p className="text-sm text-muted-foreground">محمد أحمد - قسم المبيعات</p>
                        <p className="text-sm">من 15/02/2025 إلى 20/02/2025</p>
                      </div>
                      <Badge variant="outline">معلق</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        <CheckCircle className="h-4 w-4 ml-1" />
                        موافقة
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <XCircle className="h-4 w-4 ml-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>إدارة المستندات</span>
                  <Button size="sm">
                    <FileText className="h-4 w-4 ml-2" />
                    رفع مستند
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <FileText className="h-8 w-8 text-blue-500 mb-2" />
                      <h4 className="font-semibold">عقود العمل</h4>
                      <p className="text-sm text-muted-foreground">125 مستند</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <FileText className="h-8 w-8 text-green-500 mb-2" />
                      <h4 className="font-semibold">الشهادات</h4>
                      <p className="text-sm text-muted-foreground">89 مستند</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إنشاء التقارير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <h4 className="font-semibold">تقرير الحضور الشهري</h4>
                      <Button className="mt-3" size="sm" onClick={() => setLocation(`/reports?company=${companyId}&type=attendance`)}>إنشاء</Button>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h4 className="font-semibold">تقرير الرواتب</h4>
                      <Button className="mt-3" size="sm" onClick={() => setLocation(`/reports?company=${companyId}&type=salary`)}>إنشاء</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">طلباتي</h3>
              <p className="text-muted-foreground mb-4">عرض وإدارة طلباتك</p>
              <Button onClick={() => setLocation(`/employees?company=${companyId}&tab=requests`)}>
                عرض جميع الطلبات
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="text-center py-12">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">الملف الشخصي</h3>
              <p className="text-muted-foreground mb-4">عرض وتحديث البيانات الشخصية</p>
              <Button onClick={() => setLocation(`/settings?company=${companyId}&tab=profile`)}>
                تحديث الملف الشخصي
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}