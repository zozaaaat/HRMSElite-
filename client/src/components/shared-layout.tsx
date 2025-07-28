import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { NotificationCenter } from "@/components/notification-center";
import { Link, useLocation } from "wouter";
import { 
  Menu,
  Home,
  Users,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Building2,
  Shield,
  Briefcase,
  GraduationCap,
  UserCheck,
  AlertTriangle,
  Brain,
  Smartphone,
  Calculator,
  Archive,
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react";

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavigationItem[];
}

interface SharedLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  userName?: string;
  companyName?: string;
}

export function SharedLayout({ 
  children, 
  userRole = "employee",
  userName = "المستخدم",
  companyName = "شركة النيل الأزرق"
}: SharedLayoutProps) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation items based on role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      {
        title: "الرئيسية",
        href: "/dashboard",
        icon: Home
      }
    ];

    if (userRole === "super_admin") {
      return [
        ...baseItems,
        {
          title: "إدارة الشركات",
          href: "/companies",
          icon: Building2
        },
        {
          title: "المستخدمين",
          href: "/users",
          icon: Users
        },
        {
          title: "التحليلات الذكية",
          href: "/ai-analytics",
          icon: Brain
        },
        {
          title: "التقارير العامة",
          href: "/reports",
          icon: BarChart3
        },
        {
          title: "الإعدادات العامة",
          href: "/settings",
          icon: Settings
        }
      ];
    }

    if (userRole === "company_manager") {
      return [
        ...baseItems,
        {
          title: "إدارة الموظفين",
          href: "/employees",
          icon: Users
        },
        {
          title: "الحضور والانصراف",
          href: "/attendance",
          icon: Clock
        },
        {
          title: "طلبات الإجازات",
          href: "/leave-requests",
          icon: Calendar,
          badge: "3"
        },
        {
          title: "الرواتب",
          href: "/payroll",
          icon: DollarSign
        },
        {
          title: "المستندات",
          href: "/documents",
          icon: FileText
        },
        {
          title: "التدريب والتطوير",
          href: "/training",
          icon: GraduationCap
        },
        {
          title: "التوظيف",
          href: "/recruitment",
          icon: UserCheck
        },
        {
          title: "تقييم الأداء",
          href: "/performance",
          icon: BarChart3
        },
        {
          title: "النماذج الحكومية",
          href: "/government-forms",
          icon: FileText
        },
        {
          title: "إدارة التراخيص",
          href: "/license-management",
          icon: Shield
        },
        {
          title: "إدارة الصلاحيات",
          href: "/permissions-management",
          icon: Shield
        },
        {
          title: "التطبيق المحمول",
          href: "/mobile-apps",
          icon: Smartphone
        },
        {
          title: "أنظمة المحاسبة",
          href: "/accounting-systems",
          icon: Calculator
        },
        {
          title: "إدارة المشاريع",
          href: "/project-management",
          icon: Briefcase
        },
        {
          title: "إدارة الأصول",
          href: "/assets-management",
          icon: Archive  
        },
        {
          title: "التحليلات الذكية",
          href: "/ai-analytics",
          icon: Brain
        },
        {
          title: "الإنذار المبكر",
          href: "/early-warning",
          icon: AlertTriangle
        },
        {
          title: "التقارير",
          href: "/reports",
          icon: BarChart3
        },
        {
          title: "الإعدادات",
          href: "/settings",
          icon: Settings
        }
      ];
    }

    if (userRole === "employee") {
      return [
        ...baseItems,
        {
          title: "الحضور والانصراف",
          href: "/attendance",
          icon: Clock
        },
        {
          title: "طلبات الإجازات",
          href: "/leave-requests",
          icon: Calendar
        },
        {
          title: "كشف الراتب",
          href: "/payroll",
          icon: DollarSign
        },
        {
          title: "المستندات الشخصية",
          href: "/documents",
          icon: FileText
        },
        {
          title: "التدريب",
          href: "/training",
          icon: GraduationCap
        },
        {
          title: "تقييم الأداء",
          href: "/performance",
          icon: BarChart3
        },
        {
          title: "الإعدادات الشخصية",
          href: "/settings",
          icon: Settings
        }
      ];
    }

    // Default for worker
    return [
      ...baseItems,
      {
        title: "تسجيل الحضور",
        href: "/attendance",
        icon: Clock
      },
      {
        title: "طلب إجازة",
        href: "/leave-requests",
        icon: Calendar
      },
      {
        title: "كشف الراتب",
        href: "/payroll",
        icon: DollarSign
      },
      {
        title: "الملف الشخصي",
        href: "/profile",
        icon: Users
      }
    ];
  };

  const navigationItems = getNavigationItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Zeylab HRMS</h2>
            <p className="text-sm text-muted-foreground">{companyName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {item.children && <ChevronRight className="h-4 w-4" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={userName} />
            <AvatarFallback>
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {userRole === "super_admin" ? "مسؤول عام" : 
               userRole === "company_manager" ? "مدير شركة" :
               userRole === "employee" ? "موظف" : "عامل"}
            </p>
          </div>
        </div>
        
        <Separator className="mb-3" />
        
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <HelpCircle className="h-4 w-4" />
            المساعدة
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <h1 className="font-semibold">Zeylab HRMS</h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={userName} />
              <AvatarFallback>
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-r bg-background">
          <SidebarContent />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-semibold">نظام إدارة الموارد البشرية</h1>
                <p className="text-sm text-muted-foreground">{companyName}</p>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <NotificationCenter />
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback>
                      {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {userRole === "super_admin" ? "مسؤول عام" : 
                       userRole === "company_manager" ? "مدير شركة" :
                       userRole === "employee" ? "موظف" : "عامل"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SharedLayout;