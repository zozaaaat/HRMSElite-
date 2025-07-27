import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Bell, Settings, Users, FileText, Plus, Search } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { StatsCard } from "@/components/stats-card";
import { CompanyCard } from "@/components/company-card";
import { useState } from "react";
import type { CompanyWithStats } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

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
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <span className="text-sm font-medium text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="إجمالي الشركات"
            value={stats?.totalCompanies || 0}
            icon="building"
            color="blue"
          />
          <StatsCard
            title="إجمالي العمال"
            value={stats?.totalEmployees || 0}
            icon="users"
            color="green"
          />
          <StatsCard
            title="إجمالي التراخيص"
            value={stats?.totalLicenses || 0}
            icon="certificate"
            color="orange"
          />
          <StatsCard
            title="تنبيهات عاجلة"
            value={stats?.urgentAlerts || 0}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-6">الإجراءات السريعة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col space-y-2 text-center">
              <Plus className="h-8 w-8 text-primary" />
              <span className="text-sm">إضافة شركة جديدة</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 text-center">
              <FileText className="h-8 w-8 text-green-600" />
              <span className="text-sm">التقارير العامة</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 text-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <span className="text-sm">إعدادات النظام</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col space-y-2 text-center">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-sm">إدارة المستخدمين</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
