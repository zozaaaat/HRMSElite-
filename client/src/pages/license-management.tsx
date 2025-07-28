import { LicenseManagement } from "@/components/license-management";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, ArrowRight } from "lucide-react";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LicenseManagementPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "غير مسجل دخول",
        description: "يتم تسجيل الدخول...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [user, toast]);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'super_admin':
        return `/super-admin-dashboard?company=${companyId}`;
      case 'company_manager':
        return `/company-manager-dashboard?company=${companyId}`;
      case 'employee':
        return `/employee-dashboard?company=${companyId}`;
      case 'supervisor':
        return `/supervisor-dashboard?company=${companyId}`;
      case 'worker':
        return `/worker-dashboard?company=${companyId}`;
      default:
        return '/';
    }
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
                <p className="text-sm text-muted-foreground">إدارة التراخيص</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button 
                variant="ghost"
                onClick={() => setLocation(getDashboardRoute())}
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                العودة للوحة التحكم
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LicenseManagement companyId={companyId} />
      </main>
    </div>
  );
}