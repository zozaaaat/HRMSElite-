import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
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
import AccountingSystems from "@/pages/accounting-systems";
import GovernmentForms from "@/pages/government-forms";
import AttendancePage from "@/pages/attendance";
import LeaveRequestsPage from "@/pages/leave-requests";
import PayrollPage from "@/pages/payroll";
import DocumentsPage from "@/pages/documents";
import TrainingPage from "@/pages/training";
import RecruitmentPage from "@/pages/recruitment";
import PerformancePage from "@/pages/performance";
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
      <Route path="/accounting-systems" component={AccountingSystems} />
      <Route path="/government-forms" component={GovernmentForms} />
      <Route path="/attendance" component={AttendancePage} />
      <Route path="/leave-requests" component={LeaveRequestsPage} />
      <Route path="/payroll" component={PayrollPage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/recruitment" component={RecruitmentPage} />
      <Route path="/performance" component={PerformancePage} />
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
