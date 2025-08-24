import {useLocation} from 'wouter';
import {useAuth} from '@/hooks/useAuth';
import {useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Calendar, Users, FileText, TrendingUp, Building2} from 'lucide-react';
import { t } from "i18next";

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
      <h1 className="text-3xl font-bold">{t('auto.role-based-dashboard.1')}</h1>
      <Badge variant="secondary">{t('auto.role-based-dashboard.2')}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.3')}</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.4')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.5')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.6')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.7')}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">89</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.8')}</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const CompanyManagerDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">{t('auto.role-based-dashboard.9')}</h1>
      <Badge variant="secondary">{t('auto.role-based-dashboard.10')}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.11')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">156</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.12')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.13')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.14')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.15')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{t('auto.role-based-dashboard.16')}</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.17')}</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const EmployeeDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">{t('auto.role-based-dashboard.18')}</h1>
      <Badge variant="secondary">{t('auto.role-based-dashboard.19')}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.20')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">18</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.21')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.22')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">168</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.23')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.24')}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{t('auto.role-based-dashboard.25')}</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.26')}</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SupervisorDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">{t('auto.role-based-dashboard.27')}</h1>
      <Badge variant="secondary">{t('auto.role-based-dashboard.28')}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.29')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.30')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.31')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.32')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.33')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">94%</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.34')}</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const WorkerDashboard = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">{t('auto.role-based-dashboard.35')}</h1>
      <Badge variant="secondary">{t('auto.role-based-dashboard.36')}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.37')}</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8.5</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.38')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.39')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.40')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('auto.role-based-dashboard.41')}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{t('auto.role-based-dashboard.42')}</div>
          <p className="text-xs text-muted-foreground">{t('auto.role-based-dashboard.43')}</p>
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
