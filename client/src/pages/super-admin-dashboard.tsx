import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Plus, 
  Search,
  FileText,
  Shield,
  TrendingUp,
  Activity,
  Bell,
  Moon,
  Sun,
  Bot,
  Workflow,
  Brain,
  Smartphone,
  DollarSign,
  Archive,
  User as UserIcon,
  Target,
  PieChart,
  FolderOpen,
  Calculator,
  Package
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { StatsCard } from "@/components/stats-card";
import { CompanyCard } from "@/components/company-card";
import { AIAssistant } from "@/components/ai-assistant";
import { BIDashboard } from "@/components/bi-dashboard";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { LearningManagement } from "@/components/learning-management";
import { MobileAppIntegration } from "@/components/mobile-app-integration";
import { Employee360View } from "@/components/employee-360-view";
import { FinancialManagement } from "@/components/financial-management";
import { EmployeeArchiving } from "@/components/employee-archiving";
import { NotificationCenter } from "@/components/notification-center";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal states
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [biDashboardOpen, setBiDashboardOpen] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [learningManagementOpen, setLearningManagementOpen] = useState(false);
  const [mobileAppOpen, setMobileAppOpen] = useState(false);
  const [employee360Open, setEmployee360Open] = useState(false);
  const [financialManagementOpen, setFinancialManagementOpen] = useState(false);
  const [employeeArchivingOpen, setEmployeeArchivingOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = (companies as any[]).filter((company: any) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src={zeylabLogo} 
                alt="Zeylab Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Zeylab HRMS</h1>
                <p className="text-sm text-muted-foreground">لوحة تحكم المسؤول العام</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-reverse space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAiAssistantOpen(true)}
                className="flex items-center gap-2 relative"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden md:inline">المساعد الذكي</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setBiDashboardOpen(true)}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">التحليلات</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setWorkflowBuilderOpen(true)}
                className="flex items-center gap-2"
              >
                <Workflow className="h-4 w-4" />
                <span className="hidden md:inline">سير العمل</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setNotificationCenterOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {(user as any)?.name || 'المسؤول العام'}
                </span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <div className="bg-muted/20 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("companies")}
              className="gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Building2 className="h-4 w-4" />
              إدارة الشركات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/employees')}
              className="gap-2 hover:bg-green-50 hover:border-green-300"
            >
              <Users className="h-4 w-4" />
              إدارة الموظفين
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/ai-analytics')}
              className="gap-2 hover:bg-purple-50 hover:border-purple-300"
            >
              <Brain className="h-4 w-4" />
              الذكاء الاصطناعي
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileAppOpen(true)}
              className="gap-2 hover:bg-cyan-50 hover:border-cyan-300"
            >
              <Smartphone className="h-4 w-4" />
              التطبيق المحمول
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFinancialManagementOpen(true)}
              className="gap-2 hover:bg-orange-50 hover:border-orange-300"
            >
              <DollarSign className="h-4 w-4" />
              الإدارة المالية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmployee360Open(true)}
              className="gap-2 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <UserIcon className="h-4 w-4" />
              عرض 360°
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmployeeArchivingOpen(true)}
              className="gap-2 hover:bg-gray-50 hover:border-gray-300"
            >
              <Archive className="h-4 w-4" />
              الأرشيف
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/assets-management')}
              className="gap-2 hover:bg-purple-50 hover:border-purple-300"
            >
              <Package className="h-4 w-4" />
              إدارة الأصول
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/project-management')}
              className="gap-2 hover:bg-blue-500 hover:border-blue-600"
            >
              <FolderOpen className="h-4 w-4" />
              إدارة المشاريع
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/reports')}
              className="gap-2 hover:bg-green-500 hover:border-green-600"
            >
              <FileText className="h-4 w-4" />
              التقارير
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/accounting-systems')}
              className="gap-2 hover:bg-yellow-50 hover:border-yellow-300"
            >
              <Calculator className="h-4 w-4" />
              أنظمة المحاسبة
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/government-forms')}
              className="gap-2 hover:bg-red-50 hover:border-red-300"
            >
              <FileText className="h-4 w-4" />
              النماذج الحكومية
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLearningManagementOpen(true)}
              className="gap-2 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Target className="h-4 w-4" />
              التعلم والتطوير
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/settings')}
              className="gap-2 hover:bg-gray-50 hover:border-gray-300"
            >
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="companies">الشركات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="system">النظام</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="إجمالي الشركات"
                value={(stats as any)?.totalCompanies || 0}
                icon="building"
                color="blue"
                trend={{ value: 12, isPositive: true }}
                subtitle="نمو مستقر في التسجيلات"
                change="منذ الشهر الماضي"
              />
              <StatsCard
                title="إجمالي الموظفين"
                value={(stats as any)?.totalEmployees || 0}
                icon="users"
                color="green"
                trend={{ value: 8, isPositive: true }}
                subtitle="زيادة في التوظيف"
                change="هذا الشهر"
              />
              <StatsCard
                title="التراخيص النشطة"
                value={(stats as any)?.activeLicenses || 0}
                icon="certificate"
                color="orange"
                trend={{ value: 3, isPositive: false }}
                subtitle="تراخيص تحتاج تجديد"
                change="تحديث أسبوعي"
              />
              <StatsCard
                title="إيرادات النظام"
                value={(stats as any)?.systemRevenue || 0}
                icon="dollar"
                color="purple"
                trend={{ value: 15, isPositive: true }}
                subtitle="نمو في الإيرادات"
                change="هذا الربع"
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("companies")}>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة الشركات</h3>
                  <p className="text-sm text-muted-foreground">إضافة وإدارة الشركات المسجلة</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBiDashboardOpen(true)}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">لوحة التحليلات</h3>
                  <p className="text-sm text-muted-foreground">تحليلات متقدمة وتقارير شاملة</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setWorkflowBuilderOpen(true)}>
                <CardContent className="p-6 text-center">
                  <Workflow className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">منشئ سير العمل</h3>
                  <p className="text-sm text-muted-foreground">أتمتة العمليات والموافقات</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/project-management'}>
                <CardContent className="p-6 text-center">
                  <FolderOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة المشاريع</h3>
                  <p className="text-sm text-muted-foreground">متابعة المشاريع والمهام</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/mobile-apps'}>
                <CardContent className="p-6 text-center">
                  <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">التطبيق المحمول</h3>
                  <p className="text-sm text-muted-foreground">للمشرفين والعمال</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = '/accounting-systems'}>
                <CardContent className="p-6 text-center">
                  <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">أنظمة المحاسبة</h3>
                  <p className="text-sm text-muted-foreground">ربط QuickBooks و SAP</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة الشركات</h2>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة شركة جديدة
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث عن شركة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company: any) => (
                <CompanyCard 
                  key={company.id} 
                  company={company}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">التحليلات المتقدمة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBiDashboardOpen(true)}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">لوحة البيانات التفاعلية</h3>
                  <p className="text-sm text-muted-foreground">تحليلات وتقارير متقدمة</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">مؤشرات الأداء</h3>
                  <p className="text-sm text-muted-foreground">KPIs والمقاييس الرئيسية</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/ai-analytics')}>
                <CardContent className="p-6 text-center">
                  <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">الذكاء الاصطناعي</h3>
                  <p className="text-sm text-muted-foreground">تحليلات ذكية وتنبؤات مستقبلية</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/project-management')}>
                <CardContent className="p-6 text-center">
                  <FolderOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة المشاريع</h3>
                  <p className="text-sm text-muted-foreground">متابعة المشاريع والمهام</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/accounting-systems')}>
                <CardContent className="p-6 text-center">
                  <Calculator className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">أنظمة المحاسبة</h3>
                  <p className="text-sm text-muted-foreground">ربط أنظمة المحاسبة الخارجية</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/mobile-apps')}>
                <CardContent className="p-6 text-center">
                  <Smartphone className="h-12 w-12 text-cyan-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">التطبيق المحمول</h3>
                  <p className="text-sm text-muted-foreground">إدارة التطبيق المحمول والإشعارات</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <h2 className="text-2xl font-bold">إدارة النظام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/settings')}>
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إعدادات النظام</h3>
                  <p className="text-sm text-muted-foreground">تكوين النظام العام</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/employees')}>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">إدارة المستخدمين</h3>
                  <p className="text-sm text-muted-foreground">صلاحيات وأدوار المستخدمين</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation('/reports')}>
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">سجلات النظام</h3>
                  <p className="text-sm text-muted-foreground">مراقبة نشاط النظام</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <AIAssistant
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      <BIDashboard
        isOpen={biDashboardOpen}
        onClose={() => setBiDashboardOpen(false)}
      />

      <WorkflowBuilder
        isOpen={workflowBuilderOpen}
        onClose={() => setWorkflowBuilderOpen(false)}
      />

      <LearningManagement 
        isOpen={learningManagementOpen} 
        onClose={() => setLearningManagementOpen(false)} 
      />

      <MobileAppIntegration
        isOpen={mobileAppOpen}
        onClose={() => setMobileAppOpen(false)}
      />

      <Employee360View
        employeeId="demo"
        isOpen={employee360Open}
        onClose={() => setEmployee360Open(false)}
      />

      <FinancialManagement
        isOpen={financialManagementOpen}
        onClose={() => setFinancialManagementOpen(false)}
      />

      <EmployeeArchiving
        isOpen={employeeArchivingOpen}
        onClose={() => setEmployeeArchivingOpen(false)}
      />

      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
    </div>
  );
}