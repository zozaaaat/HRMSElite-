import React from 'react';
import {Sidebar} from './sidebar';
import {Header} from './header';
import type {User} from '../lib/authUtils';

interface SharedLayoutProps {
  children: React.ReactNode;
  user?: User;
  userRole?: string;
  userName?: string;
  companyName?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSearchClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export function SharedLayout ({
  children,
  user,
  companyName,
  onLogout,
  onSettingsClick,
  onSearchClick,
  onThemeToggle,
  isDarkMode = false
}: SharedLayoutProps) {

  // تمرير المستخدم كما هو أو undefined لتجنب إنشاء كائن غير متوافق مع نوع User
  const userData: User | undefined = user;

  // إنشاء كائن company افتراضي
  const defaultCompany = {
    'id': 'default',
    'name': companyName ?? 'شركة افتراضية',
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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={userData}
        company={defaultCompany}
        activeView="dashboard"
        onViewChange={() => {}}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          {...(userData && { user: userData })}
          company={defaultCompany}
          {...(onLogout && { onLogout })}
          {...(onSettingsClick && { onSettingsClick })}
          {...(onSearchClick && { onSearchClick })}
          {...(onThemeToggle && { onThemeToggle })}
          isDarkMode={isDarkMode}
        />
        <main role="main" className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );

}
