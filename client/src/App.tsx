import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import CompanyDashboard from "@/pages/company-dashboard";
import Companies from "@/pages/companies";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import CompanySelection from "@/pages/company-selection";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={CompanySelection} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/companies" component={Companies} />
          <Route path="/employees" component={Employees} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/company/:companyId" component={CompanyDashboard} />
        </>
      )}
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
