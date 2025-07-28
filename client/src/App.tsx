import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

// Import pages
import CompanySelection from "@/pages/company-selection";
import Login from "@/pages/login";
import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import CompanyManagerDashboard from "@/pages/company-manager-dashboard";
import EmployeeDashboard from "@/pages/employee-dashboard";
import SupervisorDashboard from "@/pages/supervisor-dashboard";
import WorkerDashboard from "@/pages/worker-dashboard";
import Companies from "@/pages/companies";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";
import AIAnalyticsPage from "@/pages/ai-analytics";
import EarlyWarningPage from "@/pages/early-warning";
import ProjectManagement from "@/pages/project-management";
import MobileApps from "@/pages/mobile-apps";
import AccountingSystems from "@/pages/accounting-systems";
import AssetsManagement from "@/pages/assets-management";
import GovernmentForms from "@/pages/government-forms";
import PermissionsManagement from "@/pages/permissions-management";
import LicenseManagementPage from "@/pages/license-management";
import IntelligentDashboard from "@/pages/intelligent-dashboard";
// Focus on comprehensive HRMS with enhanced support for gold and fabrics companies

function Router() {
  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/" component={CompanySelection} />
      <Route path="/login" component={Login} />
      
      {/* All dashboard routes - no auth check for now */}
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/super-admin-dashboard" component={SuperAdminDashboard} />
      <Route path="/company-manager" component={CompanyManagerDashboard} />
      <Route path="/company-manager-dashboard" component={CompanyManagerDashboard} />
      <Route path="/employee" component={EmployeeDashboard} />
      <Route path="/employee-dashboard" component={EmployeeDashboard} />
      <Route path="/supervisor" component={SupervisorDashboard} />
      <Route path="/supervisor-dashboard" component={SupervisorDashboard} />
      <Route path="/worker" component={WorkerDashboard} />
      <Route path="/worker-dashboard" component={WorkerDashboard} />
      
      {/* Shared routes */}
      <Route path="/companies" component={Companies} />
      <Route path="/employees" component={Employees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/ai-analytics" component={AIAnalyticsPage} />
      <Route path="/early-warning" component={EarlyWarningPage} />
      <Route path="/project-management" component={ProjectManagement} />
      <Route path="/mobile-apps" component={MobileApps} />
      <Route path="/accounting-systems" component={AccountingSystems} />
      <Route path="/assets-management" component={AssetsManagement} />
      <Route path="/government-forms" component={GovernmentForms} />
      <Route path="/permissions-management" component={PermissionsManagement} />
      <Route path="/license-management" component={LicenseManagementPage} />
      <Route path="/intelligent-dashboard" component={IntelligentDashboard} />
      {/* Removed specialized pages - keeping system unified */}
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="hrms-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground" dir="rtl">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
