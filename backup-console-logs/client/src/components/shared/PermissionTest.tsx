import {usePermissions} from '../../hooks/usePermissions';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {Separator} from '../ui/separator';
import {
  Shield,
  User,
  Users,
  Settings,
  FileText,
  BarChart3,
  Calendar,
  DollarSign,
  GraduationCap,
  Eye,
  Bot
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

export function PermissionTest () {

  const {
    currentRole,
    roleLabel,
    roleDescription,
    roleLevel,
    getCurrentRolePermissions,
    getAccessiblePagesForCurrentRole,
    isSuperAdmin,
    isCompanyManager,
    isEmployee,
    isSupervisor,
    isWorker,
    hasAdminPermissions,
    hasManagerPermissions,
    hasSupervisorPermissions
  } = usePermissions();

  const permissions = getCurrentRolePermissions();
  const accessiblePages = getAccessiblePagesForCurrentRole();

  const permissionIcons: Record<string, LucideIcon> = {
    'dashboard:view': Eye,
    'companies:view': Users,
    'employees:view': User,
    'reports:view': BarChart3,
    'settings:view': Settings,
    'attendance:view': Calendar,
    'payroll:view': DollarSign,
    'documents:view': FileText,
    'training:view': GraduationCap,
    'ai_dashboard:view': Bot
  };

  const getPermissionIcon = (permission: string): LucideIcon => {

    const basePermission = permission.split(':')[0];
    return permissionIcons[`${basePermission}:view`] ?? Shield;

  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            معلومات الدور الحالي
          </CardTitle>
          <CardDescription>
            عرض تفاصيل الدور والصلاحيات المتاحة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">معلومات الدور</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الدور:</span>
                  <Badge variant="secondary">{roleLabel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المستوى:</span>
                  <Badge variant="outline">{roleLevel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الرمز:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentRole}</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">الوصف</h4>
              <p className="text-sm text-muted-foreground">{roleDescription}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">نوع الصلاحيات</h4>
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin() && <Badge variant="destructive">مسؤول عام</Badge>}
              {isCompanyManager() && <Badge variant="default">مدير شركة</Badge>}
              {isEmployee() && <Badge variant="secondary">موظف إداري</Badge>}
              {isSupervisor() && <Badge variant="outline">مشرف</Badge>}
              {isWorker() && <Badge variant="outline">عامل</Badge>}

              {hasAdminPermissions() && <Badge variant="destructive">صلاحيات إدارية</Badge>}
              {hasManagerPermissions() && <Badge variant="default">صلاحيات إدارية متوسطة</Badge>}
              {hasSupervisorPermissions() && <Badge variant="secondary">صلاحيات مشرف</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الصلاحيات المتاحة</CardTitle>
          <CardDescription>
            جميع الصلاحيات الممنوحة للدور الحالي ({permissions.length} صلاحية)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissions.map((permission) => {

              const Icon = getPermissionIcon(permission);
              const [resource, action] = permission.split(':');

              return (
                <div
                  key={permission}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{resource}</div>
                    <div className="text-xs text-muted-foreground">{action}</div>
                  </div>
                </div>
              );

            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الصفحات المتاحة</CardTitle>
          <CardDescription>
            الصفحات التي يمكن الوصول إليها ({accessiblePages.length} صفحة)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accessiblePages.map((page) => {

              const Icon = getPermissionIcon(page);

              return (
                <div
                  key={page}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{page}</div>
                    <div className="text-xs text-muted-foreground">صفحة متاحة</div>
                  </div>
                </div>
              );

            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اختبار الصلاحيات</CardTitle>
          <CardDescription>
            اختبار الوصول للصفحات المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {'id': 'companies', 'label': 'إدارة الشركات', 'icon': Users},
              {'id': 'employees', 'label': 'إدارة الموظفين', 'icon': User},
              {'id': 'reports', 'label': 'التقارير', 'icon': BarChart3},
              {'id': 'settings', 'label': 'الإعدادات', 'icon': Settings},
              {'id': 'attendance', 'label': 'الحضور', 'icon': Calendar},
              {'id': 'payroll', 'label': 'الرواتب', 'icon': DollarSign},
              {'id': 'documents', 'label': 'المستندات', 'icon': FileText},
              {'id': 'training', 'label': 'التدريب', 'icon': GraduationCap},
              {'id': 'ai-dashboard', 'label': 'لوحة التحكم الذكية', 'icon': Bot}
            ].map((page) => {

              const Icon = page.icon;
              const canAccess = accessiblePages.includes(page.id);

              return (
                <div
                  key={page.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    canAccess
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${canAccess ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{page.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {canAccess ? 'متاح' : 'غير متاح'}
                    </div>
                  </div>
                  <Badge variant={canAccess ? 'default' : 'secondary'}>
                    {canAccess ? '✓' : '✗'}
                  </Badge>
                </div>
              );

            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
