import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Bell, Settings, Users, FileText, Plus, Search, Bot, BarChart3, Workflow, Brain } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { StatsCard } from "@/components/stats-card";
import { CompanyCard } from "@/components/company-card";
import { AIAssistant } from "@/components/ai-assistant";
import { BIDashboard } from "@/components/bi-dashboard";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { useState } from "react";
import type { CompanyWithStats } from "@shared/schema";
import { LearningManagement } from "@/components/learning-management";
import { FinancialManagement } from "@/components/financial-management";
import { MobileApp } from "@/components/mobile-app";
import { Employee360 } from "@/components/employee-360";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [biDashboardOpen, setBiDashboardOpen] = useState(false);
  const [workflowBuilderOpen, setWorkflowBuilderOpen] = useState(false);
  const [learningManagementOpen, setLearningManagementOpen] = useState(false);
  const [financialManagementOpen, setFinancialManagementOpen] = useState(false);
  const [mobileAppOpen, setMobileAppOpen] = useState(false);
  const [employee360Open, setEmployee360Open] = useState(false);

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
            <div className="flex items-center space-x-reverse space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setAiAssistantOpen(true)}
                className="relative"
              >
                <Bot className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <span className="text-sm font-medium text-foreground">
                  {user?.firstName || 'مستخدم'} {user?.lastName || ''}
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
              />
              <StatsCard
                title="إجمالي العمال"
                value={(stats as any)?.totalEmployees || 0}
                icon="users"
                color="green"
              />
              <StatsCard
                title="إجمالي التراخيص"
                value={(stats as any)?.totalLicenses || 0}
                icon="certificate"
                color="orange"
              />
              <StatsCard
                title="تنبيهات عاجلة"
                value={(stats as any)?.urgentAlerts || 0}
                icon="alert"
                color="red"
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

            {/* Company Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </>
        )}

        {activeView === "analytics" && (
          <BIDashboard companyId="system" />
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

      {/* Additional Modals */}
      <LearningManagement 
        companyId="system" 
        isOpen={learningManagementOpen} 
        onClose={() => setLearningManagementOpen(false)} 
      />

      <FinancialManagement 
        companyId="system" 
        isOpen={financialManagementOpen} 
        onClose={() => setFinancialManagementOpen(false)} 
      />

      <MobileApp 
        companyId="system" 
        isOpen={mobileAppOpen} 
        onClose={() => setMobileAppOpen(false)} 
      />

      <Employee360 
        employeeId="demo-employee" 
        isOpen={employee360Open} 
        onClose={() => setEmployee360Open(false)} 
      />
    </div>
  );
}
