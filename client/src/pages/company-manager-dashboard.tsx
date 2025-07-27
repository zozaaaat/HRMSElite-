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
  LogOut
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";

export default function CompanyManagerDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");

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
              <Button variant="ghost" size="icon">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="employees">الموظفين</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="employees">
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">إدارة الموظفين</h3>
              <p className="text-muted-foreground mb-4">قم بإدارة موظفي الشركة من هنا</p>
              <Button onClick={() => window.location.href = '/employees'}>
                عرض جميع الموظفين
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">التقارير</h3>
              <p className="text-muted-foreground mb-4">اطلع على تقارير الشركة المفصلة</p>
              <Button onClick={() => window.location.href = '/reports'}>
                عرض التقارير
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">إعدادات الشركة</h3>
              <p className="text-muted-foreground mb-4">تكوين إعدادات الشركة</p>
              <Button onClick={() => window.location.href = '/settings'}>
                فتح الإعدادات
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}