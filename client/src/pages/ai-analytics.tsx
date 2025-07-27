import { AIAnalyticsDashboard } from "@/components/ai-analytics-dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function AIAnalyticsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-6">
      <AIAnalyticsDashboard companyId="1" />
    </div>
  );
}