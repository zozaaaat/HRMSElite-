import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { StatsCard } from "@/components/stats-card";
import { EmployeesTable } from "@/components/employees-table";
import type { Employee } from "@shared/schema";

export default function CompanyDashboard() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeView, setActiveView] = useState("dashboard");
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const { data: company } = useQuery({
    queryKey: ["/api/companies", companyId],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/companies", companyId, "stats"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/companies", companyId, "employees"],
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    select: (data: any) => data?.filter((n: any) => n.companyId === companyId) || [],
  });

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!company) {
    return <div>Loading...</div>;
  }

  const companyData = company as any;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        company={company} 
        user={user} 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground">لوحة تحكم الشركة</h1>
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
                <div className="relative">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <div className="flex items-center space-x-reverse space-x-2">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">
                    {user?.firstName || 'مستخدم'} {user?.lastName || ''}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="p-6">
            {activeView === "dashboard" && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatsCard
                    title="إجمالي العمال"
                    value={(stats as any)?.totalEmployees || 0}
                    icon="users"
                    color="blue"
                  />
                  <StatsCard
                    title="العمال النشطين"
                    value={(stats as any)?.activeEmployees || 0}
                    icon="user-check"
                    color="green"
                  />
                  <StatsCard
                    title="طلبات الإجازة"
                    value={(stats as any)?.pendingLeaves || 0}
                    icon="calendar"
                    color="orange"
                  />
                  <StatsCard
                    title="تنبيهات عاجلة"
                    value={(stats as any)?.urgentAlerts || 0}
                    icon="alert"
                    color="red"
                  />
                </div>
                
                {/* Add navigation tabs for different views */}
                <div className="mb-6">
                  <nav className="flex space-x-reverse space-x-4">
                    {[
                      { id: "overview", name: "نظرة عامة", icon: Users2 },
                      { id: "analytics", name: "التحليلات", icon: BarChart3 },
                      { id: "workflows", name: "سير العمل", icon: Workflow },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeView === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </>
            )}

            {activeView === "analytics" && companyId && (
              <BIDashboard companyId={companyId} />
            )}

            {activeView === "workflows" && companyId && (
              <WorkflowBuilder companyId={companyId} />
            )}

            {activeView === "overview" && (
              <>
                {/* Employee Management Section */}
                <div className="space-y-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Users2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">إدارة الموظفين</h3>
                    <p className="text-sm">سيتم عرض قائمة الموظفين وإدارتهم هنا</p>
                  </div>
                </div>
                    color="yellow"
                  />
                  <StatsCard
                    title="التنبيهات العاجلة"
                    value={stats?.urgentAlerts || 0}
                    icon="alert"
                    color="red"
                  />
                </div>

                {/* Recent Activities and Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Recent Activities */}
                  <div className="bg-card rounded-lg shadow border border-border">
                    <div className="p-6 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground">النشاطات الأخيرة</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-reverse space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <i className="fas fa-user-plus text-blue-600 text-sm"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">تم إضافة موظف جديد</p>
                            <p className="text-xs text-muted-foreground">منذ ساعتين</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-reverse space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-green-600 text-sm"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">تم الموافقة على إجازة</p>
                            <p className="text-xs text-muted-foreground">منذ 4 ساعات</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Urgent Alerts */}
                  <div className="bg-card rounded-lg shadow border border-border">
                    <div className="p-6 border-b border-border">
                      <h3 className="text-lg font-bold text-foreground">التنبيهات العاجلة</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <div className="flex">
                            <i className="fas fa-exclamation-triangle text-destructive mt-1 ml-3"></i>
                            <div>
                              <h4 className="text-sm font-medium text-destructive">انتهاء إقامة عامل</h4>
                              <p className="text-sm text-destructive/80 mt-1">ستنتهي إقامة عامل خلال 10 أيام</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex">
                            <i className="fas fa-clock text-yellow-600 mt-1 ml-3"></i>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">ترخيص قريب الانتهاء</h4>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">ترخيص سينتهي خلال شهر واحد</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employees Table */}
                <EmployeesTable employees={employees} companyId={companyId!} />
              </>
            )}

            {activeView === "employees" && (
              <EmployeesTable employees={employees} companyId={companyId!} showActions />
            )}

            {/* Other views can be implemented here */}
          </div>
        </main>
      </div>

      {/* AI Assistant Modal for Company */}
      {companyId && (
        <AIAssistant
          companyId={companyId}
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
        />
      )}
    </div>
  );
}
