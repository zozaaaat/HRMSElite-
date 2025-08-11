import {Button} from './ui/button';
import {usePermissions} from '../hooks/usePermissions';
import {useNavigation} from '../hooks/useNavigation';
import {getMenuItems, getAdvancedFeatures} from '../lib/navigation-config';
import type {Company} from '../../../shared/schema';
import type {User} from '../lib/authUtils';

interface SidebarProps {
  company: Company;
  user: User | undefined;
  activeView: string;
  onViewChange: (view: string) => void;
  onAIAssistantOpen?: () => void;
  onBIDashboardOpen?: () => void;
  onWorkflowBuilderOpen?: () => void;
  onLearningManagementOpen?: () => void;
  onFinancialManagementOpen?: () => void;
  onMobileAppOpen?: () => void;
  onEmployee360Open?: () => void;
}

export function Sidebar ({
  company,
  user: _user,
  activeView,
  onViewChange: _onViewChange,
  onAIAssistantOpen,
  onBIDashboardOpen,
  onWorkflowBuilderOpen,
  onLearningManagementOpen,
  onFinancialManagementOpen,
  onMobileAppOpen,
  onEmployee360Open
}: SidebarProps) {

  const {currentRole, roleLabel} = usePermissions();
  const {navigateToItem} = useNavigation();

  const getCompanyInitials = (name: string) => {

    const words = name.split(' ');
    return words.slice(0, 2).map(word => word.charAt(0)).join(' ');

  };

  // تحديد معرف الشركة
  const companyId = company?.id ?? '1';

  // الحصول على عناصر القائمة حسب الدور
  const menuItems = getMenuItems(currentRole);

  // الحصول على الميزات المتقدمة حسب الدور
  const advancedFeatures = getAdvancedFeatures(currentRole);

  // معالج التنقل المبسط
  const handleNavigation = (view: string) => {

    navigateToItem(view, companyId, company?.name ?? '');

  };

  // معالج الميزات المتقدمة
  const handleAdvancedFeature = (featureId: string) => {

    switch (featureId) {

    case 'ai-assistant':
      onAIAssistantOpen?.();
      break;
    case 'bi-dashboard':
      onBIDashboardOpen?.();
      break;
    case 'workflow-builder':
      onWorkflowBuilderOpen?.();
      break;
    case 'learning-management':
      onLearningManagementOpen?.();
      break;
    case 'financial-management':
      onFinancialManagementOpen?.();
      break;
    case 'mobile-app':
      onMobileAppOpen?.();
      break;
    case 'employee-360':
      onEmployee360Open?.();
      break;
    default:
      break;

    }

  };

  // تصنيف عناصر القائمة
  const mainMenuItems = menuItems.filter(item => item.section === 'main');
  const settingsMenuItems = menuItems.filter(item => item.section === 'settings');

  return (
    <div className="w-64 bg-card shadow-lg border-l border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {getCompanyInitials(company?.name ?? '')}
            </span>
          </div>
          <div className="mr-3">
            <h3 className="font-bold text-foreground text-sm truncate">
              {company?.name ?? 'غير محدد'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {roleLabel}
            </p>
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
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start ${
                      isActive
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="ml-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );

            })}
          </ul>
        </div>

        {settingsMenuItems.length > 0 && (
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
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive
                          ? 'bg-primary/10 text-primary hover:bg-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <Icon className="ml-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </li>
                );

              })}
            </ul>
          </div>
        )}

        {advancedFeatures.length > 0 && (
          <div className="px-3 mt-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              الميزات المتقدمة
            </p>
            <ul className="space-y-1">
              {advancedFeatures.map((feature) => {

                const Icon = feature.icon;

                return (
                  <li key={feature.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => handleAdvancedFeature(feature.id)}
                    >
                      <Icon className="ml-3 h-4 w-4" />
                      {feature.label}
                    </Button>
                  </li>
                );

              })}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );

}
