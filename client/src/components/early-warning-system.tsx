import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Shield,
  Users,
  DollarSign,
  Calendar,
  Target,
  Eye,
  Zap,
  Activity,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EarlyWarningSystemProps {
  companyId?: string;
}

export function EarlyWarningSystem({ companyId = "1" }: EarlyWarningSystemProps) {
  const [activeTab, setActiveTab] = useState("alerts");
  const [alertSettings, setAlertSettings] = useState({
    turnoverRate: { enabled: true, threshold: 5.0 },
    absenteeism: { enabled: true, threshold: 8.0 },
    satisfaction: { enabled: true, threshold: 70.0 },
    overtime: { enabled: true, threshold: 20.0 },
    budgetVariance: { enabled: true, threshold: 15.0 }
  });
  const queryClient = useQueryClient();

  // Fetch early warning alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: [`/api/early-warnings/${companyId}`],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch trend analysis
  const { data: trends } = useQuery({
    queryKey: [`/api/trend-analysis/${companyId}`],
  });

  // Update alert settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch(`/api/early-warnings/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, companyId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/early-warnings/${companyId}`] });
    }
  });

  // Mock data for demonstration
  const mockAlerts = [
    {
      id: 1,
      type: "turnover_risk",
      severity: "high",
      title: "خطر ارتفاع معدل دوران الموظفين",
      description: "معدل دوران الموظفين في قسم المبيعات وصل إلى 8.5% هذا الشهر",
      impact: "قد يؤثر على الأداء العام للقسم",
      recommendation: "مراجعة رواتب ومكافآت قسم المبيعات",
      timestamp: "2025-01-28T10:30:00Z",
      department: "المبيعات",
      value: 8.5,
      threshold: 5.0,
      trend: "increasing"
    },
    {
      id: 2,
      type: "budget_variance",
      severity: "medium",
      title: "تجاوز الميزانية المخصصة للرواتب",
      description: "الإنفاق على الرواتب تجاوز الميزانية بنسبة 12%",
      impact: "ضغط على الميزانية العامة للشركة",
      recommendation: "مراجعة هيكل الرواتب والمكافآت",
      timestamp: "2025-01-28T09:15:00Z",
      department: "المالية",
      value: 112,
      threshold: 100,
      trend: "increasing"
    },
    {
      id: 3,
      type: "satisfaction_drop",
      severity: "medium",
      title: "انخفاض رضا الموظفين",
      description: "رضا الموظفين في قسم التسويق انخفض إلى 68%",
      impact: "قد يؤدي إلى زيادة معدل الاستقالات",
      recommendation: "إجراء جلسات استماع مع موظفي التسويق",
      timestamp: "2025-01-28T08:45:00Z",
      department: "التسويق",
      value: 68,
      threshold: 70,
      trend: "decreasing"
    },
    {
      id: 4,
      type: "overtime_spike",
      severity: "low",
      title: "زيادة ساعات العمل الإضافية",
      description: "ساعات العمل الإضافية زادت بنسبة 18% في قسم تقنية المعلومات",
      impact: "إرهاق الموظفين وزيادة التكاليف",
      recommendation: "توظيف موظفين إضافيين أو إعادة توزيع المهام",
      timestamp: "2025-01-28T07:20:00Z",
      department: "تقنية المعلومات",
      value: 18,
      threshold: 15,
      trend: "increasing"
    }
  ];

  const mockTrends = {
    turnover: [
      { month: 'سبتمبر', value: 3.2, threshold: 5.0 },
      { month: 'أكتوبر', value: 4.1, threshold: 5.0 },
      { month: 'نوفمبر', value: 5.8, threshold: 5.0 },
      { month: 'ديسمبر', value: 6.2, threshold: 5.0 },
      { month: 'يناير', value: 7.1, threshold: 5.0 }
    ],
    satisfaction: [
      { month: 'سبتمبر', value: 85, threshold: 70 },
      { month: 'أكتوبر', value: 82, threshold: 70 },
      { month: 'نوفمبر', value: 78, threshold: 70 },
      { month: 'ديسمبر', value: 74, threshold: 70 },
      { month: 'يناير', value: 71, threshold: 70 }
    ],
    budget: [
      { month: 'سبتمبر', value: 95, threshold: 100 },
      { month: 'أكتوبر', value: 98, threshold: 100 },
      { month: 'نوفمبر', value: 103, threshold: 100 },
      { month: 'ديسمبر', value: 108, threshold: 100 },
      { month: 'يناير', value: 112, threshold: 100 }
    ]
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <Eye className="h-5 w-5 text-blue-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-green-200 bg-green-50 dark:bg-green-900/20';
    }
  };

  const alertsData = alerts || mockAlerts;
  const trendsData = trends || mockTrends;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p>جاري تحليل الاتجاهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">نظام التنبيه المبكر</h1>
            <p className="text-muted-foreground">مراقبة الاتجاهات والتنبيه للمخاطر المحتملة</p>
          </div>
        </div>
        <div className="flex space-x-reverse space-x-2">
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/early-warnings/${companyId}`] })}
          >
            <Activity className="h-4 w-4 ml-2" />
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">تنبيهات عالية</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  {alertsData.filter(a => a.severity === 'high').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">تنبيهات متوسطة</p>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                  {alertsData.filter(a => a.severity === 'medium').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">تنبيهات منخفضة</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {alertsData.filter(a => a.severity === 'low').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">المؤشرات الآمنة</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">12</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">التنبيهات النشطة</TabsTrigger>
          <TabsTrigger value="trends">تحليل الاتجاهات</TabsTrigger>
          <TabsTrigger value="settings">إعدادات التنبيه</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alertsData.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-reverse space-x-4">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-reverse space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                        <Badge variant="outline">{alert.department}</Badge>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'default'}>
                          {alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{alert.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">التأثير المتوقع:</p>
                          <p className="text-sm">{alert.impact}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">التوصية:</p>
                          <p className="text-sm">{alert.recommendation}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-reverse space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Target className="h-4 w-4" />
                          <span>القيمة: {alert.value}{alert.type === 'budget_variance' ? '%' : alert.type === 'satisfaction_drop' ? '%' : '%'}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>الحد الآمن: {alert.threshold}{alert.type === 'budget_variance' ? '%' : alert.type === 'satisfaction_drop' ? '%' : '%'}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(alert.timestamp).toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-reverse space-x-2">
                    <Button size="sm" variant="outline">
                      عرض التفاصيل
                    </Button>
                    <Button size="sm">
                      اتخاذ إجراء
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 ml-2 text-red-500" />
                  اتجاه معدل دوران الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trendsData.turnover}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#fecaca" name="معدل الدوران %" />
                    <Line type="monotone" dataKey="threshold" stroke="#dc2626" strokeDasharray="5 5" name="الحد الآمن" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingDown className="h-5 w-5 ml-2 text-yellow-500" />
                  اتجاه رضا الموظفين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trendsData.satisfaction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#fde68a" name="الرضا %" />
                    <Line type="monotone" dataKey="threshold" stroke="#d97706" strokeDasharray="5 5" name="الحد الأدنى" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 ml-2 text-blue-500" />
                  تجاوز الميزانية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData.budget}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" name="نسبة الإنفاق %" />
                    <Line type="monotone" dataKey="threshold" stroke="#1d4ed8" strokeDasharray="5 5" name="الميزانية المحددة" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 ml-2" />
                إعدادات التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">معدل دوران الموظفين</Label>
                      <p className="text-sm text-muted-foreground">تنبيه عند تجاوز النسبة المحددة</p>
                    </div>
                    <Switch 
                      checked={alertSettings.turnoverRate.enabled}
                      onCheckedChange={(checked) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          turnoverRate: { ...prev.turnoverRate, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Input 
                      type="number" 
                      value={alertSettings.turnoverRate.threshold}
                      onChange={(e) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          turnoverRate: { ...prev.turnoverRate, threshold: parseFloat(e.target.value) }
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">نسبة الغياب</Label>
                      <p className="text-sm text-muted-foreground">تنبيه عند ارتفاع معدل الغياب</p>
                    </div>
                    <Switch 
                      checked={alertSettings.absenteeism.enabled}
                      onCheckedChange={(checked) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          absenteeism: { ...prev.absenteeism, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Input 
                      type="number" 
                      value={alertSettings.absenteeism.threshold}
                      onChange={(e) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          absenteeism: { ...prev.absenteeism, threshold: parseFloat(e.target.value) }
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">رضا الموظفين</Label>
                      <p className="text-sm text-muted-foreground">تنبيه عند انخفاض الرضا</p>
                    </div>
                    <Switch 
                      checked={alertSettings.satisfaction.enabled}
                      onCheckedChange={(checked) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          satisfaction: { ...prev.satisfaction, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Input 
                      type="number" 
                      value={alertSettings.satisfaction.threshold}
                      onChange={(e) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          satisfaction: { ...prev.satisfaction, threshold: parseFloat(e.target.value) }
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">ساعات العمل الإضافية</Label>
                      <p className="text-sm text-muted-foreground">تنبيه عند زيادة الساعات الإضافية</p>
                    </div>
                    <Switch 
                      checked={alertSettings.overtime.enabled}
                      onCheckedChange={(checked) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          overtime: { ...prev.overtime, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Input 
                      type="number" 
                      value={alertSettings.overtime.threshold}
                      onChange={(e) => 
                        setAlertSettings(prev => ({
                          ...prev,
                          overtime: { ...prev.overtime, threshold: parseFloat(e.target.value) }
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-reverse space-x-2">
                <Button variant="outline">إعادة تعيين</Button>
                <Button 
                  onClick={() => updateSettingsMutation.mutate(alertSettings)}
                  disabled={updateSettingsMutation.isPending}
                >
                  <Zap className="h-4 w-4 ml-2" />
                  حفظ الإعدادات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}