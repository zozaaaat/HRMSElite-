import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calendar,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  RefreshCw
} from "lucide-react";

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'activity' | 'progress';
  size: 'small' | 'medium' | 'large';
  data: any;
  refreshInterval?: number;
}

interface LiveMetric {
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

export default function InteractiveDashboard() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([
    { label: 'الموظفين النشطين', value: 847, target: 850, trend: 'up', change: 2.3, unit: 'موظف' },
    { label: 'معدل الحضور', value: 94.2, target: 95, trend: 'up', change: 1.5, unit: '%' },
    { label: 'الإنتاجية', value: 87.8, target: 90, trend: 'stable', change: 0.2, unit: '%' },
    { label: 'رضا الموظفين', value: 91.5, target: 85, trend: 'up', change: 3.7, unit: '%' }
  ]);

  const widgets: DashboardWidget[] = [
    {
      id: '1',
      title: 'المؤشرات الحية',
      type: 'metric',
      size: 'large',
      data: liveMetrics
    },
    {
      id: '2',
      title: 'نمو الفريق',
      type: 'chart',
      size: 'medium',
      data: {
        months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        values: [820, 835, 842, 851, 847, 850],
        target: 850
      }
    },
    {
      id: '3',
      title: 'الأنشطة الحديثة',
      type: 'activity',
      size: 'medium',
      data: [
        { time: '09:15', action: 'انضم موظف جديد', user: 'أحمد محمد', type: 'success' },
        { time: '09:10', action: 'تم اعتماد طلب إجازة', user: 'فاطمة علي', type: 'info' },
        { time: '09:05', action: 'تحديث بيانات الراتب', user: 'محمد أحمد', type: 'warning' },
        { time: '09:00', action: 'إنشاء تقرير شهري', user: 'النظام', type: 'info' }
      ]
    },
    {
      id: '4',
      title: 'تقدم المشاريع',
      type: 'progress',
      size: 'small',
      data: [
        { name: 'نظام الحضور الجديد', progress: 85, status: 'active' },
        { name: 'تطوير التطبيق المحمول', progress: 62, status: 'active' },
        { name: 'تحديث قاعدة البيانات', progress: 100, status: 'completed' },
        { name: 'تدريب الموظفين', progress: 34, status: 'planning' }
      ]
    }
  ];

  useEffect(() => {
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      // Simulate live data updates
      setLiveMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 2,
        change: (Math.random() - 0.5) * 5
      })));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const refreshData = () => {
    setLiveMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, metric.value + (Math.random() - 0.5) * 10),
      change: (Math.random() - 0.5) * 8
    })));
    setLastUpdate(new Date());
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                لوحة التحكم التفاعلية
              </h2>
              <Badge variant={isAutoRefresh ? "default" : "secondary"}>
                {isAutoRefresh ? 'تحديث تلقائي' : 'تحديث يدوي'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
              >
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button
                variant={isAutoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                <Activity className="h-4 w-4 ml-2" />
                {isAutoRefresh ? 'إيقاف التلقائي' : 'تفعيل التلقائي'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* المؤشرات الحية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            المؤشرات الحية
            {isAutoRefresh && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {liveMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {metric.label}
                  </span>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="text-2xl font-bold mb-1">
                  {metric.value.toFixed(1)} {metric.unit}
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    الهدف: {metric.target} {metric.unit}
                  </span>
                  <span className={`flex items-center gap-1 ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={(metric.value / metric.target) * 100} 
                  className="mt-2 h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* الرسوم البيانية والأنشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مخطط النمو */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              نمو الفريق
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">العدد الحالي</span>
                <span className="font-bold text-lg">850 موظف</span>
              </div>
              
              {/* Simple chart representation */}
              <div className="space-y-2">
                {widgets[1].data.months.slice(-4).map((month: string, index: number) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs w-16">{month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(widgets[1].data.values[index + 2] / 870) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium w-12">
                      {widgets[1].data.values[index + 2]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الأنشطة الحديثة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              الأنشطة الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {widgets[2].data.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تقدم المشاريع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            تقدم المشاريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {widgets[3].data.map((project: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{project.name}</h4>
                  <Badge variant={
                    project.status === 'completed' ? 'default' :
                    project.status === 'active' ? 'secondary' : 'outline'
                  }>
                    {project.status === 'completed' ? 'مكتمل' :
                     project.status === 'active' ? 'نشط' : 'مخطط'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>التقدم</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}