import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  FileText,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";
import type { Company, User } from "@shared/schema";

interface SidebarProps {
  company: Company;
  user: User | undefined;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ company, user, activeView, onViewChange }: SidebarProps) {
  const getCompanyInitials = (name: string) => {
    const words = name.split(' ');
    return words.slice(0, 2).map(word => word.charAt(0)).join(' ');
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "لوحة التحكم",
      icon: Home,
      section: "main",
    },
    {
      id: "employees",
      label: "إدارة العمال",
      icon: Users,
      section: "main",
    },
    {
      id: "licenses",
      label: "التراخيص",
      icon: FileText,
      section: "main",
    },
    {
      id: "leaves",
      label: "الإجازات",
      icon: Calendar,
      section: "main",
    },
    {
      id: "payroll",
      label: "المرتبات",
      icon: DollarSign,
      section: "main",
    },
    {
      id: "reports",
      label: "التقارير",
      icon: BarChart3,
      section: "main",
    },
    {
      id: "company-settings",
      label: "إعدادات الشركة",
      icon: Settings,
      section: "settings",
    },
    {
      id: "permissions",
      label: "الصلاحيات",
      icon: Shield,
      section: "settings",
    },
  ];

  const mainMenuItems = menuItems.filter(item => item.section === "main");
  const settingsMenuItems = menuItems.filter(item => item.section === "settings");

  return (
    <div className="w-64 bg-card shadow-lg border-l border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {getCompanyInitials(company.name)}
            </span>
          </div>
          <div className="mr-3">
            <h3 className="font-bold text-foreground text-sm truncate">
              {company.name}
            </h3>
            <p className="text-xs text-muted-foreground">مدير الشركة</p>
          </div>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            القائمة الرئيسية
          </p>
          <ul className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className="ml-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="px-3 mt-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            الإعدادات
          </p>
          <ul className="space-y-1">
            {settingsMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <li key={item.id}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon className="ml-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
