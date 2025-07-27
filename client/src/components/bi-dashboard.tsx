import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

interface BIDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BIDashboard({ isOpen, onClose }: BIDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const kpiData = [
    {
      title: 'إجمالي الموظفين',
      value: '450',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'معدل الرضا',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'الإنتاجية',
      value: '94%',
      change: '+8%',
      trend: 'up',
      icon: Zap,
      color: 'bg-purple-500'
    },
    {
      title: 'التكاليف الشهرية',
      value: '2.1M ريال',
      change: '-3%',
      trend: 'down',
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ];

  const analyticsCards = [
    {
      title: 'تحليل الأداء التنبؤي',
      description: 'توقعات الأداء للربع القادم',
      metrics: [
        { label: 'نمو متوقع', value: '+15%', status: 'positive' },
        { label: 'احتمالية التحسن', value: '89%', status: 'positive' },
        { label: 'المخاطر المحتملة', value: '3%', status: 'warning' }
      ]
    },
    {
      title: 'تحليل سلوك الموظفين',
      description: 'رؤى عميقة حول أنماط العمل',
      metrics: [
        { label: 'وقت الذروة', value: '10-12 ص', status: 'info' },
        { label: 'الإنتاجية العالية', value: '2-4 م', status: 'positive' },
        { label: 'احتياج للراحة', value: '85%', status: 'warning' }
      ]
    },
    {
      title: 'ذكاء الرواتب والمكافآت',
      description: 'تحليل متقدم لهيكل التعويضات',
      metrics: [
        { label: 'توفير محتمل', value: '120K ريال', status: 'positive' },
        { label: 'رضا التعويضات', value: '92%', status: 'positive' },
        { label: 'مراجعة مطلوبة', value: '12 موظف', status: 'warning' }
      ]
    }
  ];

  const performanceInsights = [
    {
      department: 'تقنية المعلومات',
      performance: 96,
      trend: 'up',
      insights: 'أداء متميز، يُنصح بزيادة المشاريع',
      employees: 85
    },
    {
      department: 'المبيعات',
      performance: 88,
      trend: 'up',
      insights: 'نمو جيد، تحتاج تدريب إضافي',
      employees: 120
    },
    {
      department: 'الموارد البشرية',
      performance: 92,
      trend: 'stable',
      insights: 'أداء مستقر، فرص للتطوير',
      employees: 45
    },
    {
      department: 'المالية',
      performance: 85,
      trend: 'down',
      insights: 'يحتاج مراجعة العمليات',
      employees: 32
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            لوحة التحليلات الذكية والذكاء الاصطناعي
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="predictive">التحليل التنبؤي</TabsTrigger>
            <TabsTrigger value="performance">تحليل الأداء</TabsTrigger>
            <TabsTrigger value="insights">الرؤى الذكية</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {kpi.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{kpi.value}</p>
                          <Badge variant={kpi.trend === 'up' ? 'default' : 'secondary'}>
                            {kpi.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 ml-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 ml-1" />
                            )}
                            {kpi.change}
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full ${kpi.color}`}>
                        <kpi.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>المؤشرات الحية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">الحضور اليومي</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">معدل إكمال المهام</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">مستوى الرضا</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <Progress value={91} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {analyticsCards.map((card, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {card.metrics.map((metric, metricIndex) => (
                      <div key={metricIndex} className="flex justify-between items-center">
                        <span className="text-sm">{metric.label}</span>
                        <Badge variant={
                          metric.status === 'positive' ? 'default' :
                          metric.status === 'warning' ? 'destructive' :
                          'secondary'
                        }>
                          {metric.value}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل أداء الأقسام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceInsights.map((dept, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{dept.department}</h4>
                          <p className="text-sm text-muted-foreground">{dept.employees} موظف</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{dept.performance}%</span>
                          {dept.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                          {dept.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                          {dept.trend === 'stable' && <Target className="h-5 w-5 text-blue-500" />}
                        </div>
                      </div>
                      <Progress value={dept.performance} className="mb-2" />
                      <p className="text-sm text-muted-foreground">{dept.insights}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    رؤى فورية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20">
                    <p className="text-sm font-medium">فرصة تحسين</p>
                    <p className="text-sm text-muted-foreground">
                      يمكن تحسين الإنتاجية بنسبة 12% من خلال تطبيق نظام عمل مرن
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-sm font-medium">توقع إيجابي</p>
                    <p className="text-sm text-muted-foreground">
                      معدل الاحتفاظ بالموظفين سيرتفع إلى 95% خلال الربع القادم
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                    <p className="text-sm font-medium">تنبيه مبكر</p>
                    <p className="text-sm text-muted-foreground">
                      3 موظفين قد يحتاجون إلى برامج تطوير إضافية
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    التوصيات الذكية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">تطبيق نظام المكافآت المرنة</p>
                      <p className="text-xs text-muted-foreground">سيزيد الرضا بنسبة 15%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">تحسين جدولة الاجتماعات</p>
                      <p className="text-xs text-muted-foreground">سيوفر 8 ساعات أسبوعياً</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">مراجعة عبء العمل</p>
                      <p className="text-xs text-muted-foreground">لتجنب الإرهاق في قسم المبيعات</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}