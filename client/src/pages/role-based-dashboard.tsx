import {useLocation} from 'wouter';
import {useAuth} from '@/hooks/useAuth';
import {useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, Users, FileText, TrendingUp, Building2} from 'lucide-react';

interface RoleBasedDashboardProps {
  role?: string;
  params?: {
    role?: string;
  };
}

// Simple dashboard components for each role
const SuperAdminDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">لوحة تحكم المدير العام</h1>
      <Badge variant="secondary">مدير عام</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الشركات</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 من الشهر الماضي</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+12 من الشهر الماضي</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">التقارير النشطة</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">+5 من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const CompanyManagerDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">لوحة تحكم مدير الشركة</h1>
      <Badge variant="secondary">مدير شركة</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الموظفين النشطين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">156</div>
          <p className="text-xs text-muted-foreground">+3 من الشهر الماضي</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground">91% نسبة الحضور</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,000 د.ك</div>
          <p className="text-xs text-muted-foreground">+2.5% من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const EmployeeDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">لوحة تحكم الموظف</h1>
      <Badge variant="secondary">موظف</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أيام الإجازة المتبقية</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">من أصل 30 يوم</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ساعات العمل</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">168</div>
          <p className="text-xs text-muted-foreground">هذا الشهر</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الراتب الشهري</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">850 د.ك</div>
          <p className="text-xs text-muted-foreground">+50 د.ك من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SupervisorDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">لوحة تحكم المشرف</h1>
      <Badge variant="secondary">مشرف</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الفريق المباشر</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">جميعهم نشطين</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">طلبات الإجازات</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">في انتظار الموافقة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل الأداء</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">94%</div>
          <p className="text-xs text-muted-foreground">+2% من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const WorkerDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">لوحة تحكم العامل</h1>
      <Badge variant="secondary">عامل</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ساعات العمل</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8.5</div>
          <p className="text-xs text-muted-foreground">اليوم</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">من أصل 18 مهمة</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الراتب الشهري</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">650 د.ك</div>
          <p className="text-xs text-muted-foreground">+25 د.ك من الشهر الماضي</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default function RoleBasedDashboard ({role}: RoleBasedDashboardProps) {

  const [, setLocation] = useLocation();
  const {user} = useAuth();

  // Get role from props, URL params, or user data
  const getRole = () => {

    // First check props
    if (role) {

      return role;

    }

    // Check URL path parameter
    const pathSegments = window.location.pathname.split('/');
    const roleFromPath = pathSegments[pathSegments.length - 1];
    if (roleFromPath && roleFromPath !== 'dashboard') {

      return roleFromPath;

    }

    // Extract role from URL search params
    const urlParams = new window.URLSearchParams(window.location.search);
    const urlRole = urlParams.get('role');
    if (urlRole) {

      return urlRole;

    }

    // Get role from user data
    if (user?.role) {

      return user.role;

    }

    // Default role
    return 'worker';

  };

  const currentRole = getRole();

  // Redirect to appropriate dashboard based on role if needed
  useEffect(() => {

    const roleMap: Record<string, string> = {
      'super_admin': '/dashboard/super-admin',
      'company_manager': '/dashboard/company-manager',
      'employee': '/dashboard/employee',
      'supervisor': '/dashboard/supervisor',
      'worker': '/dashboard/worker'
    };

    const targetPath = roleMap[currentRole];
    const currentPath = window.location.pathname;

    // Only redirect if we're not already on the correct path
    if (targetPath && currentPath !== targetPath && !currentPath.includes('/dashboard/')) {

      setLocation(targetPath);

    }

  }, [currentRole, setLocation]);

  // Render appropriate dashboard component
  const renderDashboard = () => {

    switch (currentRole) {

    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'company_manager':
      return <CompanyManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'worker':
      return <WorkerDashboard />;
    default:
      return <WorkerDashboard />;

    }

  };

  return renderDashboard();

}
