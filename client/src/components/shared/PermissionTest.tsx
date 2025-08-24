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
import { t } from "i18next";

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
            {t('auto.PermissionTest.1')}</CardTitle>
          <CardDescription>
            {t('auto.PermissionTest.2')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">{t('auto.PermissionTest.3')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('auto.PermissionTest.4')}</span>
                  <Badge variant="secondary">{roleLabel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('auto.PermissionTest.5')}</span>
                  <Badge variant="outline">{roleLevel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('auto.PermissionTest.6')}</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{currentRole}</code>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">{t('auto.PermissionTest.7')}</h4>
              <p className="text-sm text-muted-foreground">{roleDescription}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3">{t('auto.PermissionTest.8')}</h4>
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin() && <Badge variant="destructive">{t('auto.PermissionTest.9')}</Badge>}
              {isCompanyManager() && <Badge variant="default">{t('auto.PermissionTest.10')}</Badge>}
              {isEmployee() && <Badge variant="secondary">{t('auto.PermissionTest.11')}</Badge>}
              {isSupervisor() && <Badge variant="outline">{t('auto.PermissionTest.12')}</Badge>}
              {isWorker() && <Badge variant="outline">{t('auto.PermissionTest.13')}</Badge>}

              {hasAdminPermissions() && <Badge variant="destructive">{t('auto.PermissionTest.14')}</Badge>}
              {hasManagerPermissions() && <Badge variant="default">{t('auto.PermissionTest.15')}</Badge>}
              {hasSupervisorPermissions() && <Badge variant="secondary">{t('auto.PermissionTest.16')}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auto.PermissionTest.17')}</CardTitle>
          <CardDescription>
            {t('auto.PermissionTest.18')}{permissions.length} {t('auto.PermissionTest.19')}</CardDescription>
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
          <CardTitle>{t('auto.PermissionTest.20')}</CardTitle>
          <CardDescription>
            {t('auto.PermissionTest.21')}{accessiblePages.length} {t('auto.PermissionTest.22')}</CardDescription>
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
                    <div className="text-xs text-muted-foreground">{t('auto.PermissionTest.23')}</div>
                  </div>
                </div>
              );

            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('auto.PermissionTest.24')}</CardTitle>
          <CardDescription>
            {t('auto.PermissionTest.25')}</CardDescription>
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
