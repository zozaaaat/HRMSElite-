import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sun, Bell, Settings, Users, FileText, Plus, Search, Bot, BarChart3, Workflow, Brain, Building2, TrendingUp, Activity, Target, PieChart, Zap } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { StatsCard } from "@/components/stats-card";
import { CompanyCard } from "@/components/company-card";
import { AdvancedCompanyCard } from "@/components/advanced-company-card";
import { AIAssistant } from "@/components/ai-assistant";
import { BIDashboard } from "@/components/bi-dashboard";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { LearningManagement } from "@/components/learning-management";
import { NotificationCenter } from "@/components/notification-center";
import { useState } from "react";
import type { CompanyWithStats } from "@shared/schema";
// Additional advanced components will be imported as needed

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [biDashboardOpen, setBiDashboardOpen] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [learningManagementOpen, setLearningManagementOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: companies = [] } = useQuery<CompanyWithStats[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-primary-foreground"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">نظام إدارة الموارد البشرية</h1>
                <p className="text-sm text-muted-foreground">إدارة متكاملة للشركات والموظفين</p>
              </div>
            </div>
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
                size="sm"
                onClick={() => setLearningManagementOpen(true)}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden md:inline">التعلم</span>
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
              <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <span className="text-sm font-medium text-foreground">
                  {(user as any)?.name || 'مستخدم'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-reverse space-x-8">
            {[
              { id: "overview", name: "نظرة عامة", icon: Users },
              { id: "analytics", name: "التحليلات", icon: BarChart3 },
              { id: "workflows", name: "سير العمل", icon: Workflow },
              { id: "ai-insights", name: "الرؤى الذكية", icon: Brain }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                  activeView === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Quick Navigation Bar */}
      <div className="bg-muted/20 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/companies'}
              className="gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Building2 className="h-4 w-4" />
              الشركات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/employees'}
              className="gap-2 hover:bg-green-50 hover:border-green-300"
            >
              <Users className="h-4 w-4" />
              الموظفين
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/reports'}
              className="gap-2 hover:bg-purple-50 hover:border-purple-300"
            >
              <FileText className="h-4 w-4" />
              التقارير
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/settings'}
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
        {activeView === "overview" && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="إجمالي الشركات"
                value={(stats as any)?.totalCompanies || 0}
                icon="building"
                color="blue"
                trend={{ value: 12, isPositive: true }}
                subtitle="نمو مستقر في التسجيلات الجديدة"
                change="منذ الشهر الماضي"
              />
              <StatsCard
                title="إجمالي العمال"
                value={(stats as any)?.totalEmployees || 0}
                icon="users"
                color="green"
                trend={{ value: 8, isPositive: true }}
                subtitle="زيادة في التوظيف عبر جميع الشركات"
                change="هذا الشهر"
              />
              <StatsCard
                title="إجمالي التراخيص"
                value={(stats as any)?.totalLicenses || 0}
                icon="certificate"
                color="orange"
                trend={{ value: 3, isPositive: false }}
                subtitle="بعض التراخيص تحتاج تجديد"
                change="تحديث أسبوعي"
              />
              <StatsCard
                title="تنبيهات عاجلة"
                value={(stats as any)?.urgentAlerts || 0}
                icon="alert"
                color="red"
                trend={{ value: 25, isPositive: false }}
                subtitle="يتطلب انتباه فوري من الإدارة"
                change="اليوم"
                onClick={() => console.log('View alerts')}
              />
            </div>

            {/* Company Cards Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">الشركات المسجلة</h2>
              <div className="flex items-center space-x-reverse space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="البحث عن شركة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-80 pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة شركة
                </Button>
              </div>
            </div>

            {/* Advanced Company Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCompanies.map((company) => (
                <AdvancedCompanyCard 
                  key={company.id} 
                  company={company}
                  onViewDetails={() => console.log('View details:', company.name)}
                  onManage={() => console.log('Manage:', company.name)}
                />
              ))}
            </div>
          </>
        )}

        {activeView === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">التحليلات المتقدمة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setBiDashboardOpen(true)}>
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-800">لوحة البيانات التفاعلية</h3>
                  <p className="text-sm text-blue-600 mt-2">تحليلات وتقارير متقدمة</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-800">مؤشرات الأداء</h3>
                  <p className="text-sm text-green-600 mt-2">KPIs والمقاييس الرئيسية</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-800">التحليل التنبؤي</h3>
                  <p className="text-sm text-purple-600 mt-2">توقعات ذكية وتوصيات</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeView === "workflows" && (
          <WorkflowBuilder companyId="system" />
        )}

        {activeView === "ai-insights" && (
          <div className="text-center text-muted-foreground py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">الرؤى الذكية على مستوى النظام</h3>
            <p className="text-sm">سيتم عرض التحليلات الذكية والتنبؤات هنا</p>
            <Button 
              className="mt-4"
              onClick={() => setAiAssistantOpen(true)}
            >
              <Bot className="ml-2 h-4 w-4" />
              فتح المساعد الذكي
            </Button>
          </div>
        )}
      </main>

      {/* AI Assistant Modal */}
      <AIAssistant
        companyId="system"
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />

      {/* Modals */}
      <LearningManagement 
        isOpen={learningManagementOpen} 
        onClose={() => setLearningManagementOpen(false)} 
      />
      
      <NotificationCenter 
        isOpen={notificationCenterOpen} 
        onClose={() => setNotificationCenterOpen(false)} 
      />
    </div>
  );
}
