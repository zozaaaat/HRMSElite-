import { AIAnalyticsDashboard } from "@/components/ai-analytics-dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AIAnalyticsPage() {
  const [, setLocation] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button
              variant="ghost"
              onClick={() => setLocation(`/super-admin-dashboard?company=${companyId}`)}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              العودة للوحة التحكم
            </Button>
          </div>
        </div>
      </div>

      <AIAnalyticsDashboard companyId={companyId} />
    </div>
  );
}