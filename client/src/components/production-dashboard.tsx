import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealth } from "./system-health";
import { QuickStatsDashboard } from "./quick-stats-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Activity,
  TrendingUp,
  Users,
  Building,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  employeeGrowth: Array<{ month: string; count: number }>;
  departmentDistribution: Array<{ name: string; value: number; color: string }>;
  attendanceRate: number;
  performanceScore: number;
}

export function ProductionDashboard() {
  const { data: analytics, refetch: refetchAnalytics } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">لوحة المراقبة الإنتاجية</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refetchAnalytics()}
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث البيانات
        </Button>
      </div>
      
      <QuickStatsDashboard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>

        {/* Key Metrics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">معدل الحضور</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics?.attendanceRate || 0}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">درجة الأداء</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analytics?.performanceScore || 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="growth">نمو الموظفين</TabsTrigger>
          <TabsTrigger value="departments">توزيع الأقسام</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نمو عدد الموظفين خلال الأشهر الماضية</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.employeeGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.departmentDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.departmentDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}