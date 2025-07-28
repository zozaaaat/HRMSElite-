import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BarChart3, 
  FileText,
  Settings,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Bell,
  Moon,
  Sun,
  LogOut,
  Brain,
  Package,
  Shield,
  ClipboardList,
  Calculator
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";
import { useLocation } from "wouter";

export default function CompanyManagerDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  const { data: companyStats } = useQuery({
    queryKey: [`/api/companies/${companyId}/stats`],
  });

  const { data: company } = useQuery({
    queryKey: [`/api/companies/${companyId}`],
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

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
                <p className="text-sm text-muted-foreground">
                  {(company as any)?.name || 'لوحة تحكم مدير الشركة'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="ghost" size="icon" onClick={() => console.log('فتح مركز الإشعارات')}>
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">
                  {(user as any)?.name || 'مدير الشركة'}
                </span>
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
            <TabsTrigger value="ai">الذكاء الاصطناعي</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Company Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                      <p className="text-2xl font-bold">{(companyStats as any)?.totalEmployees || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">الموظفين النشطين</p>
                      <p className="text-2xl font-bold">{(companyStats as any)?.activeEmployees || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">طلبات الإجازة</p>
                      <p className="text-2xl font-bold">{(companyStats as any)?.pendingLeaves || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">الراتب الشهري</p>
                      <p className="text-2xl font-bold">{(companyStats as any)?.monthlyPayroll?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Core Management Actions - Company Manager Focus */}
            <div>
              <h3 className="text-xl font-semibold mb-4">الأدوات الأساسية لإدارة الشركة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/employees?company=${companyId}`)}>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">إدارة الموظفين</h3>
                    <p className="text-sm text-muted-foreground">إضافة وإدارة موظفي الشركة</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/permissions-management?company=${companyId}`)}>
                  <CardContent className="p-6 text-center">
                    <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">إدارة الصلاحيات</h3>
                    <p className="text-sm text-muted-foreground">تخصيص صلاحيات الموظفين الإداريين</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/government-forms?company=${companyId}`)}>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">النماذج الحكومية</h3>
                    <p className="text-sm text-muted-foreground">النماذج الرسمية الكويتية</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/employees?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">قائمة الموظفين</h3>
                  <p className="text-sm text-muted-foreground">عرض وإدارة جميع الموظفين</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/permissions-management?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة الصلاحيات</h3>
                  <p className="text-sm text-muted-foreground">تخصيص صلاحيات الموظفين الإداريين</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/mobile-apps?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">التطبيق المحمول</h3>
                  <p className="text-sm text-muted-foreground">للمشرفين والعمال</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/ai-analytics?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">تحليلات الذكاء الاصطناعي</h3>
                  <p className="text-sm text-muted-foreground">تحليلات ذكية وتنبؤات مستقبلية</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/project-management?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة المشاريع</h3>
                  <p className="text-sm text-muted-foreground">متابعة المشاريع والمهام</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/accounting-systems?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Calculator className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">أنظمة المحاسبة</h3>
                  <p className="text-sm text-muted-foreground">ربط أنظمة المحاسبة الخارجية</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/assets-management?company=${companyId}`)}>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة الأصول</h3>
                  <p className="text-sm text-muted-foreground">إدارة أصول ومعدات الشركة</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">التقارير</h3>
              <p className="text-muted-foreground mb-4">اطلع على تقارير الشركة المفصلة</p>
              <Button onClick={() => setLocation(`/reports?company=${companyId}`)}>
                عرض التقارير
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">إعدادات الشركة</h3>
              <p className="text-muted-foreground mb-4">تكوين إعدادات الشركة</p>
              <Button onClick={() => setLocation(`/settings?company=${companyId}`)}>
                فتح الإعدادات
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}