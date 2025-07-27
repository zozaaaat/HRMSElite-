import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  Filter,
  Download,
  RefreshCcw,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BIDashboardProps {
  companyId: string;
}

export function BIDashboard({ companyId }: BIDashboardProps) {
  const [timeFilter, setTimeFilter] = useState("30d");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics', companyId, timeFilter, departmentFilter],
    refetchInterval: 30000, // Auto refresh every 30 seconds
  });

  const { data: kpis } = useQuery({
    queryKey: ['/api/analytics/kpis', companyId, timeFilter],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force refresh analytics data
    setTimeout(() => setRefreshing(false), 2000);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              لوحة ذكاء الأعمال
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 ml-1 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 ml-1" />
                تصدير
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">الفلاتر:</span>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">آخر 7 أيام</SelectItem>
                <SelectItem value="30d">آخر 30 يوم</SelectItem>
                <SelectItem value="90d">آخر 3 شهور</SelectItem>
                <SelectItem value="365d">آخر 12 شهر</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="hr">الموارد البشرية</SelectItem>
                <SelectItem value="finance">المالية</SelectItem>
                <SelectItem value="it">تقنية المعلومات</SelectItem>
                <SelectItem value="operations">العمليات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "معدل الدوران",
            value: kpis?.turnoverRate || "12.5%",
            change: -2.3,
            icon: Users,
            color: "text-red-600"
          },
          {
            title: "متوسط الحضور",
            value: kpis?.averageAttendance || "94.2%",
            change: +1.8,
            icon: Calendar,
            color: "text-green-600"
          },
          {
            title: "تكلفة الموظف الشهرية",
            value: kpis?.avgEmployeeCost || "1,250 ر.س",
            change: +3.2,
            icon: DollarSign,
            color: "text-blue-600"
          },
          {
            title: "مؤشر الإنتاجية",
            value: kpis?.productivityIndex || "87.3",
            change: +5.7,
            icon: TrendingUp,
            color: "text-purple-600"
          }
        ].map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Count Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">اتجاه عدد الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics?.employeeTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">توزيع الموظفين حسب القسم</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
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
                  {(analytics?.departmentDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">أنماط الحضور الأسبوعية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.attendancePattern || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#00C49F" />
                <Bar dataKey="absence" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">توزيع الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.salaryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">مؤشرات الأداء التفصيلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "معدل الاستقالات الشهري",
                current: "2.1%",
                target: "< 2.5%",
                status: "good"
              },
              {
                title: "متوسط مدة التوظيف",
                current: "2.8 سنة",
                target: "> 2.5 سنة",
                status: "good"
              },
              {
                title: "رضا الموظفين",
                current: "4.2/5",
                target: "> 4.0",
                status: "good"
              },
              {
                title: "معدل الترقيات السنوي",
                current: "15%",
                target: "12-18%",
                status: "good"
              },
              {
                title: "تكلفة التدريب الشهرية",
                current: "3,500 ر.س",
                target: "< 4,000 ر.س",
                status: "good"
              },
              {
                title: "معدل الغياب",
                current: "5.8%",
                target: "< 7%",
                status: "warning"
              }
            ].map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{metric.title}</h4>
                  <Badge 
                    variant={metric.status === 'good' ? 'default' : 'secondary'}
                    className={
                      metric.status === 'good' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {metric.status === 'good' ? 'جيد' : 'تحتاج انتباه'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>القيمة الحالية:</span>
                    <span className="font-medium">{metric.current}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>الهدف:</span>
                    <span>{metric.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            التحليلات التنبؤية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.predictions?.map((prediction: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    prediction.risk === 'high' ? 'text-red-500' :
                    prediction.risk === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`} />
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{prediction.title}</h4>
                    <p className="text-sm text-muted-foreground">{prediction.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        احتمالية: {prediction.probability}%
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          prediction.risk === 'high' ? 'border-red-500 text-red-500' :
                          prediction.risk === 'medium' ? 'border-yellow-500 text-yellow-500' : 
                          'border-green-500 text-green-500'
                        }`}
                      >
                        {prediction.risk === 'high' ? 'مخاطر عالية' :
                         prediction.risk === 'medium' ? 'مخاطر متوسطة' : 'مخاطر منخفضة'}
                      </Badge>
                    </div>
                    {prediction.recommendations && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">التوصيات:</p>
                        <ul className="text-xs text-muted-foreground space-y-1 mt-1">
                          {prediction.recommendations.map((rec: string, i: number) => (
                            <li key={i}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}