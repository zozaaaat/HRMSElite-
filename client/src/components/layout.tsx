import React, {useState} from 'react';
import {Sidebar} from './sidebar';
import {Header} from './header';
import type {Company} from '../../../shared/schema';
import type {User as FrontendUser, Company as AuthCompany} from '../lib/authUtils';

interface LayoutProps {
  children: React.ReactNode;
  user?: FrontendUser;
  company?: Company;
  activeView?: string;
  onViewChange?: (view: string) => void;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  // Sidebar callbacks
  onAIAssistantOpen?: () => void;
  onBIDashboardOpen?: () => void;
  onWorkflowBuilderOpen?: () => void;
  onLearningManagementOpen?: () => void;
  onFinancialManagementOpen?: () => void;
  onMobileAppOpen?: () => void;
  onEmployee360Open?: () => void;
}

export function Layout ({
  children,
  user,
  company,
  activeView = 'dashboard',
  onViewChange,
  onLogout,
  onSettingsClick,
  onSearchClick,
  onNotificationsClick: _onNotificationsClick,
  onThemeToggle,
  isDarkMode = false,
  onAIAssistantOpen,
  onBIDashboardOpen,
  onWorkflowBuilderOpen,
  onLearningManagementOpen,
  onFinancialManagementOpen,
  onMobileAppOpen,
  onEmployee360Open
}: LayoutProps) {

  const [sidebarCollapsed, _setSidebarCollapsed] = useState(false);

  // إنشاء بيانات افتراضية إذا لم يتم تمريرها
  const defaultUser: FrontendUser = user ?? {
    id: 'default-user',
    email: 'user@example.com',
    firstName: 'مستخدم',
    lastName: 'افتراضي',
    role: 'worker',
    companies: [
      {
        id: 'default-company',
        name: 'نظام إدارة الموارد البشرية',
        commercialFileName: '',
        department: '',
        classification: '',
        status: 'active',
        employeeCount: 0,
        industry: '',
        establishmentDate: new Date().toISOString(),
        userRole: 'worker',
        userPermissions: []
      } as AuthCompany
    ],
    permissions: [],
    companyId: 'default-company',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    emailVerified: false,
    sub: 'default-user',
    claims: null
  } as FrontendUser;

  const defaultCompany: Company = company ?? {
    'id': 'default-company',
    'name': 'نظام إدارة الموارد البشرية',
    'commercialFileNumber': null,
    'commercialFileName': null,
    'commercialFileStatus': true,
    'establishmentDate': null,
    'commercialRegistrationNumber': null,
    'classification': null,
    'department': null,
    'fileType': null,
    'legalEntity': null,
    'ownershipCategory': null,
    'logoUrl': null,
    'address': null,
    'phone': null,
    'email': null,
    'website': null,
    'totalEmployees': 0,
    'totalLicenses': 0,
    'isActive': true,
    'industryType': null,
    'businessActivity': null,
    'location': null,
    'taxNumber': null,
    'chambers': null,
    'partnerships': '[]',
    'importExportLicense': null,
    'specialPermits': '[]',
    'createdAt': new Date(),
    'updatedAt': new Date()
  };

  const handleViewChange = (view: string) => {
    onViewChange?.(view);
  };

  // مبدّل الشريط الجانبي غير مستخدم حاليًا، لذا تمت إزالته لتجنّب أخطاء اللينتر

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={
  `${
  sidebarCollapsed ? 'w-16' : 'w-64'
} transition-all duration-300 ease-in-out`
}>
        <Sidebar
          user={defaultUser}
          company={defaultCompany}
          activeView={activeView}
          onViewChange={handleViewChange}
          onAIAssistantOpen={onAIAssistantOpen ?? (() => {})}
          onBIDashboardOpen={onBIDashboardOpen ?? (() => {})}
          onWorkflowBuilderOpen={onWorkflowBuilderOpen ?? (() => {})}
          onLearningManagementOpen={onLearningManagementOpen ?? (() => {})}
          onFinancialManagementOpen={onFinancialManagementOpen ?? (() => {})}
          onMobileAppOpen={onMobileAppOpen ?? (() => {})}
          onEmployee360Open={onEmployee360Open ?? (() => {})}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          user={defaultUser}
          company={defaultCompany}
          onLogout={onLogout ?? (() => {})}
          onSettingsClick={onSettingsClick ?? (() => {})}
          onSearchClick={onSearchClick ?? (() => {})}
          onThemeToggle={onThemeToggle ?? (() => {})}
          isDarkMode={isDarkMode}
        />

        {/* Main Content */}
        <main role="main" className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

}
