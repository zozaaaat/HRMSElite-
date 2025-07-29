import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Bell, LogOut, Menu, User } from "lucide-react";

interface SharedLayoutProps {
  children: ReactNode;
  userRole: string;
  userName: string;
  companyName: string;
}

export function SharedLayout({ children, userRole, userName, companyName }: SharedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Zeylab HRMS
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {companyName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {userRole === 'company_manager' ? 'مدير الشركة' :
                   userRole === 'super_admin' ? 'المسؤول العام' :
                   userRole === 'administrative_employee' ? 'موظف إداري' :
                   userRole === 'supervisor' ? 'مشرف' :
                   userRole === 'worker' ? 'عامل' : userRole}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
}