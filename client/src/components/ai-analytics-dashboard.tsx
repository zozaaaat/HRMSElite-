import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Users, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bot,
  MessageSquare,
  Sparkles,
  Target,
  Eye,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface AIAnalyticsDashboardProps {
  companyId?: string;
}

export function AIAnalyticsDashboard({ companyId = "1" }: AIAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch AI analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: [`/api/ai-analytics/${companyId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch predictions
  const { data: predictions } = useQuery({
    queryKey: [`/api/ai-predictions/${companyId}`],
  });

  // AI Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, companyId })
      });
      return response.json();
    },
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/ai-analytics/${companyId}`] });
    }
  });

  // Generate insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await fetch(`/api/ai-insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, companyId })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/ai-analytics/${companyId}`] });
    }
  });

  // Mock data for demonstration
  const mockAnalyticsData = {
    overview: {
      totalEmployees: 450,
      employeeTrend: 12.5,
      avgSalary: 2800,
      salaryTrend: 8.3,
      turnoverRate: 3.2,
      turnoverTrend: -15.4,
      satisfaction: 87,
      satisfactionTrend: 5.7
    },
    charts: {
      employeeGrowth: [
        { month: 'يناير', employees: 420, predictions: 435 },
        { month: 'فبراير', employees: 425, predictions: 440 },
        { month: 'مارس', employees: 430, predictions: 445 },
        { month: 'أبريل', employees: 435, predictions: 450 },
        { month: 'مايو', employees: 440, predictions: 455 },
        { month: 'يونيو', employees: 450, predictions: 465 }
      ],
      departmentDistribution: [
        { name: 'تقنية المعلومات', value: 150, color: '#0088FE' },
        { name: 'المبيعات', value: 120, color: '#00C49F' },
        { name: 'التسويق', value: 80, color: '#FFBB28' },
        { name: 'الموارد البشرية', value: 50, color: '#FF8042' },
        { name: 'المالية', value: 50, color: '#8884d8' }
      ],
      salaryAnalysis: [
        { department: 'تقنية المعلومات', current: 3500, predicted: 3700 },
        { department: 'المبيعات', current: 2800, predicted: 2950 },
        { department: 'التسويق', current: 2600, predicted: 2750 },
        { department: 'الموارد البشرية', current: 2400, predicted: 2520 },
        { department: 'المالية', current: 3200, predicted: 3350 }
      ]
    }
  };

  const mockPredictions = [
    {
      id: 1,
      type: "employee_turnover",
      title: "توقع معدل دوران الموظفين",
      prediction: "انخفاض بنسبة 15% في الربع القادم",
      confidence: 85,
      impact: "positive",
      timeframe: "3 أشهر",
      details: "بناء على تحليل رضا الموظفين وسياسات الشركة الجديدة"
    },
    {
      id: 2,
      type: "salary_optimization",
      title: "تحسين هيكل الرواتب",
      prediction: "إمكانية توفير 180,000 ريال سنوياً",
      confidence: 78,
      impact: "positive",
      timeframe: "6 أشهر",
      details: "من خلال إعادة توزيع الرواتب وتحسين نظام المكافآت"
    },
    {
      id: 3,
      type: "recruitment_needs",
      title: "احتياجات التوظيف",
      prediction: "الحاجة لتوظيف 25 موظف جديد",
      confidence: 92,
      impact: "neutral",
      timeframe: "4 أشهر",
      details: "لمواكبة النمو المتوقع في المشاريع الجديدة"
    }
  ];

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      chatMutation.mutate(chatMessage);
    }
  };

  const data = analyticsData || mockAnalyticsData;
  const predictionData = predictions || mockPredictions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p>جاري تحليل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">الذكاء الاصطناعي للتحليلات</h1>
            <p className="text-muted-foreground">تحليل البيانات والتنبؤات الذكية</p>
          </div>
        </div>
        <div className="flex space-x-reverse space-x-2">
          <Button 
            onClick={() => generateInsightsMutation.mutate('comprehensive')}
            disabled={generateInsightsMutation.isPending}
          >
            <Sparkles className="h-4 w-4 ml-2" />
            توليد رؤى جديدة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="predictions">التنبؤات</TabsTrigger>
          <TabsTrigger value="insights">الرؤى الذكية</TabsTrigger>
          <TabsTrigger value="chat">المساعد الذكي</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                    <p className="text-2xl font-bold">{data.overview.totalEmployees}</p>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-1">
                    {data.overview.employeeTrend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${data.overview.employeeTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(data.overview.employeeTrend)}%
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">متوسط الراتب</p>
                    <p className="text-2xl font-bold">{data.overview.avgSalary} ريال</p>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {data.overview.salaryTrend}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">معدل دوران الموظفين</p>
                    <p className="text-2xl font-bold">{data.overview.turnoverRate}%</p>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-1">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {Math.abs(data.overview.turnoverTrend)}%
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-orange-500 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">رضا الموظفين</p>
                    <p className="text-2xl font-bold">{data.overview.satisfaction}%</p>
                  </div>
                  <div className="flex items-center space-x-reverse space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {data.overview.satisfactionTrend}%
                    </span>
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500 mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 ml-2" />
                  نمو الموظفين والتنبؤات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.charts.employeeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="employees" stroke="#8884d8" name="الموظفين الحاليين" />
                    <Line type="monotone" dataKey="predictions" stroke="#82ca9d" strokeDasharray="5 5" name="التنبؤات" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 ml-2" />
                  توزيع الموظفين حسب الأقسام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={data.charts.departmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.charts.departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Salary Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 ml-2" />
                تحليل الرواتب والتوقعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.charts.salaryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#8884d8" name="الراتب الحالي" />
                  <Bar dataKey="predicted" fill="#82ca9d" name="الراتب المتوقع" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {predictionData.map((prediction) => (
              <Card key={prediction.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-reverse space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{prediction.title}</h3>
                        <Badge variant={prediction.impact === 'positive' ? 'default' : prediction.impact === 'negative' ? 'destructive' : 'secondary'}>
                          {prediction.impact === 'positive' ? 'إيجابي' : prediction.impact === 'negative' ? 'سلبي' : 'محايد'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{prediction.details}</p>
                      <div className="flex items-center space-x-reverse space-x-4">
                        <div className="flex items-center space-x-reverse space-x-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">التوقع: {prediction.prediction}</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-2">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="text-sm">الإطار الزمني: {prediction.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-primary">{prediction.confidence}%</span>
                      </div>
                      <Progress value={prediction.confidence} className="w-20" />
                      <p className="text-xs text-muted-foreground mt-1">درجة الثقة</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 ml-2" />
                  رؤى الأداء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-300">أداء متميز</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    قسم تقنية المعلومات يحقق أعلى معدلات الإنتاجية بنسبة 15% فوق المتوسط
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-reverse space-x-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">يحتاج انتباه</span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    قسم المبيعات يواجه تحديات في تحقيق الأهداف الشهرية
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 ml-2" />
                  توصيات ذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">تحسين الرواتب</h4>
                  <p className="text-sm text-muted-foreground">
                    إعادة هيكلة نظام المكافآت يمكن أن يزيد الرضا الوظيفي بنسبة 12%
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">برامج التدريب</h4>
                  <p className="text-sm text-muted-foreground">
                    الاستثمار في برامج التطوير المهني سيقلل معدل دوران الموظفين
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 ml-2" />
                المساعد الذكي للموارد البشرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-muted/10">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-reverse space-x-2">
                      <Bot className="h-6 w-6 text-primary mt-1" />
                      <div className="bg-primary/10 rounded-lg p-3 max-w-xs">
                        <p className="text-sm">
                          مرحباً! أنا مساعدك الذكي للموارد البشرية. يمكنني مساعدتك في تحليل البيانات، توليد التقارير، والإجابة على أسئلتك حول الموظفين والأداء.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleChatSubmit} className="flex space-x-reverse space-x-2">
                  <Input
                    placeholder="اسأل عن أي شيء متعلق بالموارد البشرية..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={chatMutation.isPending}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </form>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChatMessage("ما هو معدل دوران الموظفين الحالي؟")}
                  >
                    معدل دوران الموظفين
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChatMessage("أعطني تحليل رضا الموظفين")}
                  >
                    رضا الموظفين
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setChatMessage("ما هي توقعات النمو للشهر القادم؟")}
                  >
                    توقعات النمو
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}