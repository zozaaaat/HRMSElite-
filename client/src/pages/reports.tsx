import React, {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {
  FileText,
  FolderOpen,
  Download,
  Upload,
  Eye,
  Plus,
  Search,
  Filter,
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity
} from 'lucide-react';

// Types for AI data
type InsightImpact = 'positive' | 'negative';
interface AIInsight {
  id: string | number;
  title: string;
  description: string;
  confidence: number;
  impact: InsightImpact;
}

type PredictionImpact = 'positive' | 'neutral';
interface AIPrediction {
  id: string | number;
  title: string;
  prediction: string;
  timeframe: string;
  impact: PredictionImpact;
  confidence: number;
  factors?: string[];
}

type TrendDirection = 'up' | 'down' | 'stable';
interface TrendItem {
  month: string;
  value: number;
  trend: TrendDirection;
}

interface AIInsightsResponse {
  insights: AIInsight[];
}
type AIPredictionsResponse = AIPrediction[];
type AITrendsResponse = TrendItem[];

// AI Summary Response Type
interface AISummaryResponse {
  summary: {
    overview: string;
    keyInsights: string[];
    recommendations: string[];
  };
  metrics: {
    totalEmployees: number;
    satisfactionScore: number;
    turnoverRate: number;
    avgSalary: number;
  };
}

// Simple PDF Reports Component
const PDFReports = ({ companyId: _companyId }: { companyId: string }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">تقارير PDF</h2>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        إنشاء تقرير جديد
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {'name': 'قائمة الموظفين', 'type': 'employee', 'date': '2024-01-15'},
        {'name': 'كشف المرتبات', 'type': 'payroll', 'date': '2024-01-10'},
        {'name': 'تقرير الحضور', 'type': 'attendance', 'date': '2024-01-12'},
        {'name': 'التقرير المالي', 'type': 'financial', 'date': '2024-01-08'},
        {'name': 'تقرير الإجازات', 'type': 'leave', 'date': '2024-01-05'},
        {'name': 'تقرير الأداء', 'type': 'performance', 'date': '2024-01-03'}
      ].map((report, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{report.name}</CardTitle>
            <Badge variant="outline">{report.type}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              تم إنشاؤه في {report.date}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                تحميل
              </Button>
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4 mr-1" />
                معاينة
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Simple Document Management Component
const DocumentManagement = ({ companyId: _companyId }: { companyId: string }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">إدارة المستندات</h2>
      <Button>
        <Upload className="h-4 w-4 mr-2" />
        رفع مستند جديد
      </Button>
    </div>

    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="البحث في المستندات..."
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>
      <Button variant="outline">
        <Filter className="h-4 w-4 mr-2" />
        تصفية
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
  'name': 'عقد العمل - أحمد محمد', 'type': 'contract', 'size': '2.5 MB', 'date': '2024-01-15'
},
        {'name': 'صورة الهوية - فاطمة علي', 'type': 'id', 'size': '1.2 MB', 'date': '2024-01-14'},
        {
  'name': 'شهادة الخبرة - محمد أحمد', 'type': 'certificate', 'size': '3.1 MB', 'date': '2024-01-13'
},
        {'name': 'الترخيص التجاري', 'type': 'license', 'size': '5.8 MB', 'date': '2024-01-12'},
        {'name': 'النموذج الحكومي 1', 'type': 'government', 'size': '1.8 MB', 'date': '2024-01-11'},
        {'name': 'تقرير التدريب', 'type': 'training', 'size': '2.3 MB', 'date': '2024-01-10'}
      ].map((doc, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{doc.name}</CardTitle>
            <Badge variant="outline">{doc.type}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              الحجم: {doc.size}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              تم الرفع في {doc.date}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                تحميل
              </Button>
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4 mr-1" />
                معاينة
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// AI Summary Component
const AISummary = ({companyId}: { companyId: string }) => {

  const { data: aiSummary, isLoading, error } = useQuery<AISummaryResponse>({
    queryKey: ['ai-summary', companyId],
    queryFn: () => fetch(`/api/ai/summary?companyId=${companyId}`).then(res => res.json())
  });

  if (isLoading) {

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="mr-3">جاري تحليل البيانات...</span>
          </div>
        </CardContent>
      </Card>
    );

  }

  if (error) {

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في تحميل التحليل الذكي. يرجى المحاولة مرة أخرى.
        </AlertDescription>
      </Alert>
    );

  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          التحليل الذكي الشامل
        </h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          محدث الآن
        </Badge>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            نظرة عامة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {aiSummary?.summary?.overview}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{
  aiSummary?.metrics?.totalEmployees
}</div>
              <div className="text-sm text-muted-foreground">إجمالي الموظفين</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{
  aiSummary?.metrics?.satisfactionScore
}%</div>
              <div className="text-sm text-muted-foreground">رضا الموظفين</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{
  aiSummary?.metrics?.turnoverRate
}%</div>
              <div className="text-sm text-muted-foreground">معدل الدوران</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{
  aiSummary?.metrics?.avgSalary
}</div>
              <div className="text-sm text-muted-foreground">متوسط الراتب</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            الرؤى الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiSummary?.summary?.keyInsights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-sm">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            التوصيات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiSummary?.summary?.recommendations?.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

};

// AI Insights Component
const AIInsights = ({companyId}: { companyId: string }) => {

  const [selectedType, setSelectedType] = useState('employee');

  const { data: insights, isLoading } = useQuery<AIInsightsResponse>({
    queryKey: ['ai-insights', companyId, selectedType],
    queryFn: () => fetch(`/api/ai/insights?companyId=${companyId}&type=${selectedType}`).then(res => res.json())
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          الرؤى الذكية
        </h2>
        <div className="flex gap-2">
          {['employee', 'financial', 'operational'].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type === 'employee' && 'الموظفين'}
              {type === 'financial' && 'المالية'}
              {type === 'operational' && 'التشغيلية'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="mr-3">جاري تحليل الرؤى...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights?.insights?.map((insight: AIInsight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  <Badge
                    variant={insight.impact === 'positive' ? 'default' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {insight.confidence}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{insight.description}</p>
                <div className="flex items-center gap-2">
                  {insight.impact === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {insight.impact === 'positive' ? 'تأثير إيجابي' : 'تأثير سلبي'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

};

// AI Predictions Component
const AIPredictions = ({companyId}: { companyId: string }) => {

  const [selectedTimeframe, setSelectedTimeframe] = useState('shortTerm');

  const { data: predictions, isLoading } = useQuery<AIPredictionsResponse>({
    queryKey: ['ai-predictions', companyId, selectedTimeframe],
    queryFn: () => fetch(`/api/ai/predictions?companyId=${companyId}&timeframe=${selectedTimeframe}`).then(res => res.json())
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          التوقعات الذكية
        </h2>
        <div className="flex gap-2">
          {[
            {'key': 'shortTerm', 'label': 'قصيرة المدى'},
            {'key': 'mediumTerm', 'label': 'متوسطة المدى'},
            {'key': 'longTerm', 'label': 'طويلة المدى'}
          ].map((timeframe) => (
            <Button
              key={timeframe.key}
              variant={selectedTimeframe === timeframe.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe.key)}
            >
              {timeframe.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="mr-3">جاري تحليل التوقعات...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions?.map((prediction: AIPrediction) => (
            <Card key={prediction.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prediction.title}</CardTitle>
                  <Badge
                    variant={prediction.impact === 'positive' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {prediction.confidence}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{prediction.prediction}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{prediction.timeframe}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {prediction.impact === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {prediction.impact === 'positive' ? 'تأثير إيجابي' : 'تأثير محايد'}
                    </span>
                  </div>
                </div>
                {prediction.factors && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm font-medium mb-2">العوامل المؤثرة:</p>
                    <div className="space-y-1">
                      {prediction.factors.map((factor: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          <span className="text-xs text-muted-foreground">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

};

// AI Trends Component
const AITrends = ({companyId}: { companyId: string }) => {

  const [selectedMetric, setSelectedMetric] = useState('employee');

  const { data: trends, isLoading } = useQuery<AITrendsResponse>({
    queryKey: ['ai-trends', companyId, selectedMetric],
    queryFn: () => fetch(`/api/ai/trends?companyId=${companyId}&metric=${selectedMetric}`).then(res => res.json())
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          تحليل الاتجاهات
        </h2>
        <div className="flex gap-2">
          {[
            {'key': 'employee', 'label': 'الموظفين', 'icon': Users},
            {'key': 'satisfaction', 'label': 'الرضا', 'icon': CheckCircle},
            {'key': 'attendance', 'label': 'الحضور', 'icon': Activity}
          ].map((metric) => (
            <Button
              key={metric.key}
              variant={selectedMetric === metric.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric.key)}
              className="flex items-center gap-1"
            >
              <metric.icon className="h-4 w-4" />
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="mr-3">جاري تحليل الاتجاهات...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>اتجاه {
  selectedMetric === 'employee' ? 'الموظفين' : selectedMetric === 'satisfaction' ? 'الرضا' : 'الحضور'
}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 p-4">
              {(() => {
                const maxValue = Math.max(...(trends ?? []).map((t) => t.value), 0);
                return trends?.map((trend: TrendItem, _index: number) => {
                  const height = maxValue ? (trend.value / maxValue) * 100 : 0;
                  return (
                    <div key={trend.month} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 rounded-t-sm transition-all hover:bg-primary/80 ${
                          trend.trend === 'up' ? 'bg-green-500'
                            : trend.trend === 'down' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{'height': `${height}%`}}
                      />
                      <span className="text-xs text-muted-foreground">{trend.month}</span>
                      <span className="text-xs font-medium">{trend.value}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

};

export default function ReportsPage () {

  const [activeTab, setActiveTab] = useState('ai-summary');

  // محاكاة دور المستخدم - في التطبيق الفعلي سيأتي من السياق
  const _userRole = 'company-manager'; // أو أي دور آخر
  const companyId = 'company-1';
  const _userId = 'user-1';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">التقارير والمستندات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة شاملة للتقارير والمستندات ولوحات التحكم المتخصصة مع الذكاء الاصطناعي
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ai-summary" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            التحليل الذكي
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            الرؤى الذكية
          </TabsTrigger>
          <TabsTrigger value="ai-predictions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            التوقعات
          </TabsTrigger>
          <TabsTrigger value="ai-trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            الاتجاهات
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            تقارير PDF
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            المستندات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-summary" className="space-y-6">
          <AISummary companyId={companyId} />
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsights companyId={companyId} />
        </TabsContent>

        <TabsContent value="ai-predictions" className="space-y-6">
          <AIPredictions companyId={companyId} />
        </TabsContent>

        <TabsContent value="ai-trends" className="space-y-6">
          <AITrends companyId={companyId} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <PDFReports companyId={companyId} />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentManagement companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );

}
