import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Brain,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { SmartAssistant } from "./smart-assistant";

interface AIAnalyticsDashboardProps {
  companyId: string;
}

// Mock data for AI analytics
const performanceData = [
  { month: 'يناير', productivity: 85, satisfaction: 78, retention: 92 },
  { month: 'فبراير', productivity: 88, satisfaction: 82, retention: 89 },
  { month: 'مارس', productivity: 92, satisfaction: 85, retention: 94 },
  { month: 'أبريل', productivity: 89, satisfaction: 80, retention: 91 },
  { month: 'مايو', productivity: 94, satisfaction: 88, retention: 96 },
  { month: 'يونيو', productivity: 96, satisfaction: 91, retention: 98 }
];

const turnoverPrediction = [
  { department: 'المبيعات', risk: 85, employees: 24, prediction: 'عالي' },
  { department: 'التقنية', risk: 35, employees: 18, prediction: 'منخفض' },
  { department: 'المحاسبة', risk: 62, employees: 12, prediction: 'متوسط' },
  { department: 'الموارد البشرية', risk: 28, employees: 8, prediction: 'منخفض' },
  { department: 'التسويق', risk: 71, employees: 15, prediction: 'متوسط' }
];

const salaryAnalysis = [
  { position: 'مطور برمجيات', current: 8500, market: 9200, gap: 700, recommendation: 'زيادة راتب' },
  { position: 'مدير مبيعات', current: 12000, market: 11500, gap: -500, recommendation: 'راتب مناسب' },
  { position: 'محاسب', current: 6500, market: 7000, gap: 500, recommendation: 'مراجعة راتب' },
  { position: 'مصمم جرافيك', current: 5500, market: 5800, gap: 300, recommendation: 'زيادة طفيفة' }
];

const hiringForecast = [
  { month: 'يوليو', planned: 8, predicted: 6, budget: 45000 },
  { month: 'أغسطس', planned: 12, predicted: 10, budget: 68000 },
  { month: 'سبتمبر', planned: 6, predicted: 8, budget: 52000 },
  { month: 'أكتوبر', planned: 15, predicted: 12, budget: 82000 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AIAnalyticsDashboard({ companyId }: AIAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date>(new Date());

  // Fetch data from API
  const { data: apiPerformanceData, refetch: refetchPerformance } = useQuery({
    queryKey: [`/api/ai/performance-data`],
    enabled: false
  });

  const { data: turnoverData } = useQuery({
    queryKey: [`/api/ai/turnover-prediction`],
    enabled: false
  });

  const { data: salaryData } = useQuery({
    queryKey: [`/api/ai/salary-analysis`],
    enabled: false
  });

  const { data: hiringData } = useQuery({
    queryKey: [`/api/ai/hiring-forecast`],
    enabled: false
  });

  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // Refetch all data
    refetchPerformance();
    
    setTimeout(() => {
      setIsAnalyzing(false);  
      setLastAnalysis(new Date());
    }, 3000);
  };

  const insights = [
    {
      type: 'success',
      title: 'تحسن الإنتاجية',
      description: 'ارتفاع الإنتاجية بنسبة 12% خلال الشهرين الماضيين',
      impact: 'إيجابي',
      confidence: 94
    },
    {
      type: 'warning',
      title: 'خطر دوران عالي',
      description: 'قسم المبيعات يواجه خطر دوران موظفين عالي (85%)',
      impact: 'سلبي',
      confidence: 87
    },
    {
      type: 'info',
      title: 'فجوة رواتب',
      description: 'متوسط فجوة الرواتب 8% تحت معدل السوق',
      impact: 'متوسط',
      confidence: 92
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              الذكاء الاصطناعي للموارد البشرية
            </h1>
            <p className="text-muted-foreground">
              تحليلات ذكية وتنبؤات مستقبلية لبيانات الموارد البشرية
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  تشغيل التحليل
                </>
              )}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            آخر تحليل: {lastAnalysis.toLocaleString('ar-SA')}
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            دقة التنبؤات: 92%
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {insights.map((insight, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{insight.title}</CardTitle>
                <Badge variant={insight.type === 'success' ? 'default' : insight.type === 'warning' ? 'destructive' : 'secondary'}>
                  {insight.impact}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span>مستوى الثقة</span>
                <span className="font-medium">{insight.confidence}%</span>
              </div>
              <Progress value={insight.confidence} className="mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Different Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">تحليل الأداء</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="assistant">المساعد الذكي</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  اتجاهات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiPerformanceData || performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="productivity" stroke="#8884d8" name="الإنتاجية" />
                    <Line type="monotone" dataKey="satisfaction" stroke="#82ca9d" name="الرضا الوظيفي" />
                    <Line type="monotone" dataKey="retention" stroke="#ffc658" name="الاحتفاظ بالموظفين" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Turnover Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  تحليل مخاطر الدوران
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {turnoverPrediction.map((dept: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-sm text-muted-foreground">{dept.employees} موظف</div>
                      </div>
                      <div className="text-left">
                        <Badge variant={dept.risk > 70 ? 'destructive' : dept.risk > 50 ? 'secondary' : 'default'}>
                          {dept.prediction}
                        </Badge>
                        <div className="text-sm mt-1">{dept.risk}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productivity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل الإنتاجية حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={turnoverPrediction}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="employees" fill="#8884d8" name="عدد الموظفين" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>الإنتاجية العامة</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>رضا الموظفين</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>معدل الاحتفاظ</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>كفاءة التوظيف</span>
                      <span>82%</span>
                    </div>
                    <Progress value={82} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hiring Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  توقعات التوظيف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hiringForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned" fill="#8884d8" name="مخطط" />
                    <Bar dataKey="predicted" fill="#82ca9d" name="متوقع" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  توقعات الميزانية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hiringForecast.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{month.month}</div>
                        <div className="text-sm text-muted-foreground">
                          {month.predicted} موظف متوقع
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{month.budget.toLocaleString()} ر.س</div>
                        <div className="text-sm text-muted-foreground">ميزانية متوقعة</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  توصيات الرواتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryAnalysis.map((position: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{position.position}</div>
                        <Badge variant={position.gap > 0 ? 'destructive' : 'default'}>
                          {position.recommendation}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">الراتب الحالي:</span>
                          <div className="font-medium">{position.current.toLocaleString()} ر.س</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">راتب السوق:</span>
                          <div className="font-medium">{position.market.toLocaleString()} ر.س</div>
                        </div>
                      </div>
                      {position.gap !== 0 && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">الفجوة:</span>
                          <span className={`font-medium ml-1 ${position.gap > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {position.gap > 0 ? '+' : ''}{position.gap.toLocaleString()} ر.س
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  خطة العمل المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-700 dark:text-red-300">عاجل</div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        مراجعة أسباب دوران الموظفين في قسم المبيعات
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-700 dark:text-yellow-300">متوسط الأولوية</div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">
                        مراجعة رواتب المطورين لتقليل فجوة السوق
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-300">مقترح</div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        تطوير برامج تدريب لتحسين الإنتاجية
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">تحسين مستقبلي</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        إنشاء برنامج تقدير الموظفين المتميزين
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <SmartAssistant companyId={companyId} />
            </div>
            
            {/* AI Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">إحصائيات الذكاء الاصطناعي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">دقة التنبؤات</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">التحليلات المكتملة</span>
                    <span className="font-bold">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">التوفير المحقق</span>
                    <span className="font-bold text-blue-600">245,000 ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">وقت الاستجابة</span>
                    <span className="font-bold">0.8 ثانية</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">التوصيات السريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">تنبيه</span>
                    </div>
                    <p className="text-xs text-muted-foreground">مراجعة سياسات الحضور في قسم التسويق</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">فرصة</span>
                    </div>
                    <p className="text-xs text-muted-foreground">توسيع برنامج التدريب للأقسام الأخرى</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">توفير</span>
                    </div>
                    <p className="text-xs text-muted-foreground">أتمتة العمليات يوفر 15% من التكاليف</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}