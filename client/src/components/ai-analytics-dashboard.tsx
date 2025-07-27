import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Lightbulb, BarChart3, PieChart, LineChart, Target, Clock, UserCheck, Building2, Calendar, Zap, ChevronRight, Bot, Activity, Sparkles } from "lucide-react";
import { LineChart as RechartsLineChart, AreaChart, BarChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Area, Bar, Cell, Pie } from "recharts";

interface AIAnalyticsProps {
  companyId?: string;
}

interface Prediction {
  id: string;
  title: string;
  type: "turnover" | "recruitment" | "performance" | "cost" | "satisfaction";
  prediction: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  timeframe: string;
  recommendation: string;
  data: any[];
}

interface AIInsight {
  id: string;
  category: "performance" | "attendance" | "cost" | "satisfaction" | "risk";
  title: string;
  description: string;
  severity: "critical" | "warning" | "info" | "success";
  actionRequired: boolean;
  suggestion: string;
  confidence: number;
}

export function AIAnalyticsDashboard({ companyId }: AIAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("predictions");
  
  // Mock AI predictions data
  const mockPredictions: Prediction[] = [
    {
      id: "1",
      title: "معدل دوران الموظفين",
      type: "turnover",
      prediction: "ارتفاع متوقع بنسبة 15% خلال الربع القادم",
      confidence: 85,
      impact: "high",
      timeframe: "3 أشهر",
      recommendation: "تطبيق برامج الاحتفاظ بالمواهب وتحسين بيئة العمل",
      data: [
        { month: "يناير", actual: 5, predicted: 6 },
        { month: "فبراير", actual: 7, predicted: 8 },
        { month: "مارس", actual: 6, predicted: 9 },
        { month: "أبريل", actual: null, predicted: 12 },
        { month: "مايو", actual: null, predicted: 14 },
        { month: "يونيو", actual: null, predicted: 15 }
      ]
    },
    {
      id: "2", 
      title: "احتياجات التوظيف",
      type: "recruitment",
      prediction: "الحاجة لتوظيف 25 موظف جديد خلال الشهرين القادمين",
      confidence: 78,
      impact: "medium",
      timeframe: "2 شهر",
      recommendation: "بدء حملة توظيف مبكرة والتواصل مع وكالات التوظيف",
      data: [
        { month: "أبريل", openings: 8, filled: 5 },
        { month: "مايو", openings: 12, filled: 0 },
        { month: "يونيو", openings: 15, filled: 0 }
      ]
    },
    {
      id: "3",
      title: "التكاليف التشغيلية", 
      type: "cost",
      prediction: "توفير محتمل 12% من تكاليف الموارد البشرية",
      confidence: 72,
      impact: "medium",
      timeframe: "6 أشهر",
      recommendation: "أتمتة العمليات الإدارية وتحسين كفاءة الفرق",
      data: [
        { month: "يناير", current: 45000, optimized: 42000 },
        { month: "فبراير", current: 47000, optimized: 43000 },
        { month: "مارس", current: 46000, optimized: 41000 }
      ]
    }
  ];

  const mockInsights: AIInsight[] = [
    {
      id: "1",
      category: "attendance", 
      title: "انخفاض في معدل الحضور",
      description: "انخفاض ملحوظ في معدل الحضور بنسبة 8% خلال الأسبوعين الماضيين في قسم التسويق",
      severity: "warning",
      actionRequired: true,
      suggestion: "مراجعة سياسات الحضور والتحدث مع مديري القسم لفهم الأسباب",
      confidence: 92
    },
    {
      id: "2",
      category: "performance",
      title: "تحسن في الأداء العام",
      description: "ارتفاع في مؤشرات الأداء بنسبة 12% بعد تطبيق البرنامج التدريبي الجديد",
      severity: "success", 
      actionRequired: false,
      suggestion: "مواصلة البرنامج التدريبي وتوسيعه لأقسام أخرى",
      confidence: 88
    },
    {
      id: "3",
      category: "risk",
      title: "مخاطر فقدان المواهب الرئيسية",
      description: "3 موظفين من كبار المطورين يظهرون علامات عدم رضا وفقاً لتحليل البيانات",
      severity: "critical",
      actionRequired: true,
      suggestion: "إجراء مقابلات شخصية وتقديم حوافز أو ترقيات للاحتفاظ بهم",
      confidence: 85
    },
    {
      id: "4",
      category: "cost",
      title: "فرصة لتوفير التكاليف",
      description: "إمكانية توفير 18,000 ريال شهرياً من خلال إعادة تنظيم ساعات العمل الإضافية",
      severity: "info",
      actionRequired: false,
      suggestion: "مراجعة جداول العمل وتوزيع المهام بكفاءة أكبر",
      confidence: 76
    }
  ];

  const performanceMetrics = [
    { name: "يناير", productivity: 85, satisfaction: 78, retention: 92 },
    { name: "فبراير", productivity: 88, satisfaction: 82, retention: 89 },
    { name: "مارس", productivity: 91, satisfaction: 85, retention: 87 },
    { name: "أبريل", productivity: 87, satisfaction: 79, retention: 90 },
    { name: "مايو", productivity: 93, satisfaction: 88, retention: 94 },
    { name: "يونيو", productivity: 89, satisfaction: 86, retention: 91 }
  ];

  const departmentAnalysis = [
    { name: "الموارد البشرية", employees: 12, avgSalary: 8500, satisfaction: 88, turnover: 5 },
    { name: "التسويق", employees: 18, avgSalary: 7200, satisfaction: 75, turnover: 12 },
    { name: "المبيعات", employees: 25, avgSalary: 6800, satisfaction: 82, turnover: 8 },
    { name: "التطوير", employees: 15, avgSalary: 9200, satisfaction: 91, turnover: 3 },
    { name: "المالية", employees: 8, avgSalary: 8800, satisfaction: 85, turnover: 6 }
  ];

  const generateNewInsights = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success": return <UserCheck className="h-4 w-4 text-green-500" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "border-red-200 bg-red-50 dark:bg-red-950";
      case "warning": return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950"; 
      case "success": return "border-green-200 bg-green-50 dark:bg-green-950";
      default: return "border-blue-200 bg-blue-50 dark:bg-blue-950";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            تحليلات الذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground">
            تحليل البيانات والتنبؤات الذكية لاتخاذ قرارات أفضل
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={generateNewInsights}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                تحليل جديد
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">دقة التنبؤات</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التوصيات النشطة</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المخاطر المكتشفة</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التوفير المتوقع</p>
                <p className="text-2xl font-bold text-purple-600">85K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="insights">الرؤى الذكية</TabsTrigger>
          <TabsTrigger value="performance">تحليل الأداء</TabsTrigger>
          <TabsTrigger value="departments">تحليل الأقسام</TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {mockPredictions.map((prediction) => (
              <Card key={prediction.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{prediction.title}</CardTitle>
                      <CardDescription>{prediction.prediction}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-white ${getImpactColor(prediction.impact)}`}>
                        {prediction.impact === "high" ? "تأثير عالي" : 
                         prediction.impact === "medium" ? "تأثير متوسط" : "تأثير منخفض"}
                      </Badge>
                      <Badge variant="secondary">
                        {prediction.confidence}% دقة
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prediction Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={prediction.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {prediction.type === "turnover" && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="actual"
                              stroke="#8884d8"
                              name="البيانات الفعلية"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="predicted"
                              stroke="#ff7300"
                              strokeDasharray="5 5"
                              name="التنبؤات"
                              strokeWidth={2}
                            />
                          </>
                        )}
                        {prediction.type === "recruitment" && (
                          <>
                            <Bar dataKey="openings" fill="#8884d8" name="الوظائف المتاحة" />
                            <Bar dataKey="filled" fill="#82ca9d" name="تم شغلها" />
                          </>
                        )}
                        {prediction.type === "cost" && (
                          <>
                            <Line
                              type="monotone"
                              dataKey="current"
                              stroke="#ff7300"
                              name="التكلفة الحالية"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="optimized"
                              stroke="#82ca9d"
                              name="التكلفة المحسنة"
                              strokeWidth={2}
                            />
                          </>
                        )}
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">التوصية</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{prediction.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {mockInsights.map((insight) => (
              <Card key={insight.id} className={getSeverityColor(insight.severity)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(insight.severity)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                        <Badge variant="outline">{insight.confidence}% ثقة</Badge>
                      </div>
                      
                      {insight.actionRequired && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">يتطلب إجراءً</span>
                        </div>
                      )}
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">الاقتراح: </span>
                          {insight.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Analysis Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء الشهري</CardTitle>
              <CardDescription>
                مؤشرات الأداء الرئيسية خلال الستة أشهر الماضية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="productivity"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="الإنتاجية"
                    />
                    <Area
                      type="monotone"
                      dataKey="satisfaction"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="الرضا الوظيفي"
                    />
                    <Area
                      type="monotone"
                      dataKey="retention"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                      name="الاحتفاظ بالموظفين"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Analysis Tab */}
        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأقسام</CardTitle>
                <CardDescription>
                  تحليل مفصل لأداء الأقسام المختلفة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentAnalysis.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{dept.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{dept.employees} موظف</span>
                          <span>{dept.avgSalary.toLocaleString()} ر.س</span>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">الرضا:</span>
                          <Badge variant={dept.satisfaction > 85 ? "default" : "secondary"}>
                            {dept.satisfaction}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">الدوران:</span>
                          <Badge variant={dept.turnover > 10 ? "destructive" : "default"}>
                            {dept.turnover}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الموظفين</CardTitle>
                <CardDescription>
                  التوزيع الحالي للموظفين حسب القسم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={departmentAnalysis}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="employees"
                      >
                        {departmentAnalysis.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}