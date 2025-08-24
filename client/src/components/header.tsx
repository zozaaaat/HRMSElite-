import React from 'react';
import {Button} from './ui/button';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {Badge} from './ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from './ui/dropdown-menu';
import {Search, Settings, User as UserIcon, LogOut, Moon, Sun} from 'lucide-react';
import {NotificationCenter} from './notification-center';
import {LanguageSwitcher} from './LanguageSwitcher';
import type {User} from '../lib/authUtils';
import type {Company} from '../../../shared/schema';
import { t } from "i18next";

interface HeaderProps {
  user?: User;
  company?: Company;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSearchClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export function Header ({
  user,
  company,
  onLogout,
  onSettingsClick,
  onSearchClick,
  onThemeToggle,
  isDarkMode = false
}: HeaderProps) {

  const getUserInitials = (user?: User) => {

    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  };

  const getUserDisplayName = (user?: User) => {

    const firstName = user?.firstName ?? '';
    const lastName = user?.lastName ?? '';
    return `${firstName} ${lastName}`.trim() || 'مستخدم';

  };

  const getRoleLabel = (role?: string) => {

    const roleLabels: Record<string, string> = {
      'super_admin': 'مدير عام',
      'admin': 'مدير',
      'hr_manager': 'مدير الموارد البشرية',
      'hr_staff': 'موظف الموارد البشرية',
      'manager': 'مدير',
      'employee': 'موظف',
      'accountant': 'محاسب',
      'payroll_specialist': 'متخصص الرواتب'
    };
    return roleLabels[role ?? ''] ?? 'مستخدم';

  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* الجانب الأيسر - معلومات الشركة */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {company?.name?.split(' ').slice(0, 2).map(word => word.charAt(0)).join('') ?? 'ش'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {company?.name ?? "نظام إدارة الموارد البشرية"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {getRoleLabel(user?.role)} • {company?.totalEmployees ?? 0} {t('auto.header.1')}</p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن - أزرار الإجراءات ومعلومات المستخدم */}
        <div className="flex items-center space-x-4">
          {/* زر البحث */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* مركز الإشعارات */}
          {user && (
            <NotificationCenter userId={user.id} />
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* زر تبديل المظهر */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl ?? undefined} alt={getUserDisplayName(user)} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? "user@example.com"}
                  </p>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {getRoleLabel(user?.role)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('auto.header.2')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>{t('auto.header.3')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('auto.header.4')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

}
