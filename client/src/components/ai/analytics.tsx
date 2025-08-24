import {useState, useEffect} from 'react';
import type {ReactElement} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Brain,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Activity,
  BarChart3,
  Loader2,
  RefreshCw,
  Download,
  AlertCircle,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import logger from '../../lib/logger';


interface AnalyticsData {
  usageStats: {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    popularFeatures: Array<{ name: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  };
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'neutral' | 'warning';
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
    category: string;
    confidence: number;
  }>;
  trends: {
    dailyUsage: Array<{ date: string; requests: number; users: number }>;
    featureUsage: Array<{ feature: string; percentage: number; growth: number }>;
    performanceMetrics: {
      responseTime: number;
      accuracy: number;
      userSatisfaction: number;
      systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    };
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    estimatedImpact: string;
    implementationTime: string;
    cost: string;
  }>;
  userInteractions: {
    sessionDuration: number;
    clicksPerSession: number;
    featuresUsed: string[];
    commonPaths: Array<{ path: string; count: number; successRate: number }>;
    deviceTypes: Array<{ type: string; percentage: number; trend: 'up' | 'down' | 'stable' }>;
    errorRate: number;
    bounceRate: number;
    learningProgress: number;
    efficiencyScore: number;
  };
  realTimeMetrics: {
    activeUsers: number;
    currentRequests: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
    lastUpdate: string;
    peakUsage: number;
    averageSessionTime: number;
  };
  aiPerformance: {
    modelAccuracy: number;
    responseQuality: number;
    userSatisfaction: number;
    learningRate: number;
    improvementAreas: string[];
    successMetrics: {
      correctResponses: number;
      helpfulResponses: number;
      userFeedback: number;
    };
  };
}

interface AnalyticsProps {
  className?: string;
}

export default function Analytics ({className}: AnalyticsProps) {

  const {toast} = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // Monitor real-time interactions
  useEffect(() => {

    const handleClick = (e: globalThis.MouseEvent) => {

      // Log clicks for analytics
      const target = e.target as globalThis.HTMLElement;
      if (target) {

        logger.info('User click:', {
          'element': target.tagName,
          'className': target.className,
          'path': window.location.pathname,
          'timestamp': new Date().toISOString()
        });

      }

    };

    const handleKeyPress = (e: globalThis.KeyboardEvent) => {

      // Log keyboard usage
      logger.info('User keypress:', {
        'key': e.key,
        'path': window.location.pathname,
        'timestamp': new Date().toISOString()
      });

    };

    const handlePageView = () => {

      // Log page views
      logger.info('Page view:', {
        'path': window.location.pathname,
        'timestamp': new Date().toISOString()
      });

    };

    // Add event listeners (browser environment only)
    const doc = typeof window !== 'undefined' ? window.document : undefined;
    if (doc) {
      doc.addEventListener('click', handleClick);
      doc.addEventListener('keypress', handleKeyPress);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePageView);
    }

    // Log initial page view
    handlePageView();

    return () => {

      const cleanupDoc = typeof window !== 'undefined' ? window.document : undefined;
      if (cleanupDoc) {
        cleanupDoc.removeEventListener('click', handleClick);
        cleanupDoc.removeEventListener('keypress', handleKeyPress);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePageView);
      }

    };

  }, []);

  const fetchAnalyticsData = async () => {

    try {

      setLoading(true);
      const response = await fetch(`/api/ai/analytics?period=${
  selectedPeriod
}&category=${
  selectedCategory
}`, {
  
        'credentials': 'include'
      });

      if (!response.ok) {

        throw new Error('Failed to fetch analytics data');

      }

      const analyticsData = await response.json() as AnalyticsData;
      setData(analyticsData);

    } catch {
      toast({
        'title': 'خطأ في تحميل البيانات',
        'description': 'حدث خطأ أثناء تحميل بيانات التحليلات. يرجى المحاولة مرة أخرى.',
        'variant': 'destructive'
      });

      // Fallback mock data
      setData(generateMockData());

    } finally {

      setLoading(false);

    }

  };

  const generateMockData = (): AnalyticsData => ({
    'usageStats': {
      'totalRequests': 1247,
      'averageResponseTime': 2.3,
      'successRate': 94.2,
      'popularFeatures': [
        {'name': 'تحليل النصوص', 'count': 456, 'trend': 'up'},
        {'name': 'توليد التقارير', 'count': 342, 'trend': 'up'},
        {'name': 'تحليل المشاعر', 'count': 289, 'trend': 'stable'},
        {'name': 'استخراج الكلمات المفتاحية', 'count': 160, 'trend': 'down'},
        {'name': 'المساعد الذكي', 'count': 523, 'trend': 'up'}
      ]
    },
    'insights': [
      {
        'id': '1',
        'title': 'زيادة في استخدام تحليل النصوص',
        'description': 'ارتفع استخدام ميزة تحليل النصوص بنسبة 23% هذا الأسبوع، مما يدل على زيادة الاهتمام بالتحليل المتقدم',
  
        'type': 'positive',
        'impact': 'high',
        'timestamp': new Date().toISOString(),
        'category': 'feature-usage',
        'confidence': 0.95
      },
      {
        'id': '2',
        'title': 'تحسن في وقت الاستجابة',
        'description': 'انخفض متوسط وقت الاستجابة من 3.2 إلى 2.3 ثانية، مما يحسن تجربة المستخدم بشكل كبير',
  
        'type': 'positive',
        'impact': 'medium',
        'timestamp': new Date(Date.now() - 86400000).toISOString(),
        'category': 'performance',
        'confidence': 0.88
      },
      {
        'id': '3',
        'title': 'انخفاض في دقة تحليل المشاعر',
        'description': 'انخفضت دقة تحليل المشاعر بنسبة 5% - يحتاج إلى مراجعة وتحسين الخوارزمية',
        'type': 'warning',
        'impact': 'medium',
        'timestamp': new Date(Date.now() - 172800000).toISOString(),
        'category': 'accuracy',
        'confidence': 0.82
      },
      {
        'id': '4',
        'title': 'زيادة في استخدام المساعد الذكي',
        'description': 'ارتفع استخدام المساعد الذكي بنسبة 45%، مما يدل على نجاح الميزة',
        'type': 'positive',
        'impact': 'high',
        'timestamp': new Date().toISOString(),
        'category': 'ai-usage',
        'confidence': 0.92
      },
      {
        'id': '5',
        'title': 'تحسن في معدل رضا المستخدمين',
        'description': 'ارتفع معدل رضا المستخدمين من 4.2 إلى 4.6 من 5، مما يدل على تحسن جودة الخدمة',
  
        'type': 'positive',
        'impact': 'high',
        'timestamp': new Date().toISOString(),
        'category': 'satisfaction',
        'confidence': 0.89
      }
    ],
    'trends': {
      'dailyUsage': [
        {'date': '2024-01-01', 'requests': 45, 'users': 12},
        {'date': '2024-01-02', 'requests': 52, 'users': 15},
        {'date': '2024-01-03', 'requests': 48, 'users': 14},
        {'date': '2024-01-04', 'requests': 61, 'users': 18},
        {'date': '2024-01-05', 'requests': 58, 'users': 17},
        {'date': '2024-01-06', 'requests': 67, 'users': 20},
        {'date': '2024-01-07', 'requests': 73, 'users': 22}
      ],
      'featureUsage': [
        {'feature': 'تحليل النصوص', 'percentage': 36.6, 'growth': 23},
        {'feature': 'توليد التقارير', 'percentage': 27.4, 'growth': 15},
        {'feature': 'تحليل المشاعر', 'percentage': 23.2, 'growth': 5},
        {'feature': 'استخراج الكلمات المفتاحية', 'percentage': 12.8, 'growth': -8}
      ],
      'performanceMetrics': {
        'responseTime': 2.3,
        'accuracy': 94.2,
        'userSatisfaction': 4.6,
        'systemHealth': 'good'
      }
    },
    'recommendations': [
      {
        'id': '1',
        'title': 'تحسين خوارزمية تحليل المشاعر',
        'description': 'استثمار في تحسين دقة تحليل المشاعر لتحسين تجربة المستخدم وزيادة الثقة في النتائج',
  
        'priority': 'high',
        'category': 'performance',
        'estimatedImpact': 'زيادة الدقة بنسبة 15%',
        'implementationTime': '2-3 أسابيع',
        'cost': 'متوسط'
      },
      {
        'id': '2',
        'title': 'إضافة ميزة الترجمة التلقائية',
        'description': 'إضافة دعم للترجمة التلقائية لتحسين إمكانية الوصول وتوسيع نطاق الاستخدام',
        'priority': 'medium',
        'category': 'accessibility',
        'estimatedImpact': 'زيادة المستخدمين بنسبة 25%',
        'implementationTime': '4-6 أسابيع',
        'cost': 'عالي'
      },
      {
        'id': '3',
        'title': 'تحسين واجهة المستخدم',
        'description': 'تحسين تصميم واجهة المستخدم بناءً على تحليل سلوك المستخدمين',
        'priority': 'medium',
        'category': 'ui-ux',
        'estimatedImpact': 'زيادة رضا المستخدمين بنسبة 20%',
        'implementationTime': '3-4 أسابيع',
        'cost': 'متوسط'
      },
      {
        'id': '4',
        'title': 'إضافة ميزات تحليل متقدمة',
        'description': 'إضافة ميزات تحليل متقدمة مثل التنبؤ والتحليل التنبؤي',
        'priority': 'low',
        'category': 'advanced-features',
        'estimatedImpact': 'زيادة القيمة المضافة بنسبة 30%',
        'implementationTime': '6-8 أسابيع',
        'cost': 'عالي'
      }
    ],
    'userInteractions': {
      'sessionDuration': 25.5,
      'clicksPerSession': 18.3,
      'featuresUsed': ['تحليل النصوص', 'توليد التقارير', 'المساعد الذكي', 'تحليل المشاعر'],
      'commonPaths': [
        {'path': '/dashboard', 'count': 156, 'successRate': 95},
        {'path': '/analytics', 'count': 89, 'successRate': 88},
        {'path': '/reports', 'count': 134, 'successRate': 92},
        {'path': '/ai-chatbot', 'count': 234, 'successRate': 96}
      ],
      'deviceTypes': [
        {'type': 'Desktop', 'percentage': 65, 'trend': 'up'},
        {'type': 'Mobile', 'percentage': 30, 'trend': 'up'},
        {'type': 'Tablet', 'percentage': 5, 'trend': 'stable'}
      ],
      'errorRate': 2.1,
      'bounceRate': 15.3,
      'learningProgress': 78.5,
      'efficiencyScore': 85.2
    },
    'realTimeMetrics': {
      'activeUsers': 23,
      'currentRequests': 8,
      'systemHealth': 'good',
      'lastUpdate': new Date().toISOString(),
      'peakUsage': 45,
      'averageSessionTime': 28.5
    },
    'aiPerformance': {
      'modelAccuracy': 94.2,
      'responseQuality': 4.6,
      'userSatisfaction': 4.5,
      'learningRate': 0.15,
      'improvementAreas': [
        'تحليل المشاعر للغة العربية',
        'دقة التوصيات',
        'سرعة الاستجابة للاستعلامات المعقدة'
      ],
      'successMetrics': {
        'correctResponses': 94.2,
        'helpfulResponses': 89.5,
        'userFeedback': 4.6
      }
    }
  });

  const handleRefresh = async () => {

    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast({
      'title': 'تم تحديث البيانات',
      'description': 'تم تحديث بيانات التحليلات بنجاح.',
      'variant': 'default'
    });

  };

  const handleExport = () => {

    if (!data) {

      return;

    }

    const exportData = {
      'timestamp': new Date().toISOString(),
      'period': selectedPeriod,
      'category': selectedCategory,
      data
    };

    if (typeof window === 'undefined' || !window.document || !window.Blob || !window.URL) {
      return;
    }

    const blob = new window.Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedPeriod}-${selectedCategory}-${new Date().toISOString().split('T')[0]}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      'title': 'تم تصدير البيانات',
      'description': 'تم تصدير بيانات التحليلات بنجاح.',
      'variant': 'default'
    });

  };

  const getInsightIcon = (type: string): ReactElement => {
    const icons: Record<string, ReactElement> = {
      positive: <TrendingUpIcon className="h-4 w-4" />,
      negative: <TrendingDownIcon className="h-4 w-4" />,
      neutral: <Info className="h-4 w-4" />,
      warning: <AlertTriangleIcon className="h-4 w-4" />
    };
    return icons[type] ?? <Info className="h-4 w-4" />;
  };

  const getInsightColor = (type: string) => {

    const colors: Record<string, string> = {
      'positive': 'text-green-600 bg-green-50',
      'negative': 'text-red-600 bg-red-50',
      'neutral': 'text-blue-600 bg-blue-50',
      'warning': 'text-yellow-600 bg-yellow-50'
    };
    return colors[type] ?? 'text-gray-600 bg-gray-50';

  };

  const getPriorityColor = (priority: string) => {

    const colors: Record<string, string> = {
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'low': 'text-green-600 bg-green-50'
    };
    return colors[priority] ?? 'text-gray-600 bg-gray-50';

  };

  const getSystemHealthIcon = (health: string): ReactElement => {
    const icons: Record<string, ReactElement> = {
      excellent: <CheckCircleIcon className="h-4 w-4" />,
      good: <CheckCircleIcon className="h-4 w-4" />,
      warning: <AlertTriangleIcon className="h-4 w-4" />,
      critical: <XCircleIcon className="h-4 w-4" />
    };
    return icons[health] ?? <AlertCircle className="h-4 w-4" />;
  };

  const getTrendIcon = (trend: string) => {

    switch (trend) {

    case 'up':
      return <TrendingUpIcon className="h-3 w-3 mr-1" />;
    case 'down':
      return <TrendingDownIcon className="h-3 w-3 mr-1" />;
    case 'stable':
      return <ActivityIcon className="h-3 w-3 mr-1" />;
    default:
      return <ActivityIcon className="h-3 w-3 mr-1" />;

    }

  };

  const getTrendColor = (trend: string) => {

    const colors: Record<string, string> = {
      'up': 'text-green-600',
      'down': 'text-red-600',
      'stable': 'text-blue-600'
    };
    return colors[trend] ?? 'text-gray-600';

  };

  useEffect(() => {

    fetchAnalyticsData();

  }, [selectedPeriod, selectedCategory]);

  if (loading) {

    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري تحميل بيانات التحليلات...</span>
        </div>
      </div>
    );

  }

  if (!data) {

    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
          <p className="text-gray-500">لم يتم العثور على بيانات التحليلات.</p>
        </div>
      </div>
    );

  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التحليلات الذكية</h2>
          <p className="text-gray-600">تحليل شامل لاستخدام النظام والأداء</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          >
            {showAdvancedMetrics ? 'إخفاء' : 'إظهار'} المقاييس المتقدمة
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">الفترة:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'day' | 'week' | 'month')}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="day">اليوم</option>
            <option value="week">الأسبوع</option>
            <option value="month">الشهر</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">الفئة:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">الكل</option>
            <option value="performance">الأداء</option>
            <option value="usage">الاستخدام</option>
            <option value="ai">الذكاء الاصطناعي</option>
            <option value="user">المستخدمين</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="realtime"
            checked={realTimeMode}
            onChange={(e) => setRealTimeMode(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="realtime" className="text-sm">الوقت الفعلي</label>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMode && data.realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>المقاييس في الوقت الفعلي</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{
  data.realTimeMetrics.activeUsers
}</div>
                <div className="text-sm text-gray-600">المستخدمين النشطين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{
  data.realTimeMetrics.currentRequests
}</div>
                <div className="text-sm text-gray-600">الطلبات الحالية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{
  data.realTimeMetrics.peakUsage
}</div>
                <div className="text-sm text-gray-600">الاستخدام الأقصى</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{
  data.realTimeMetrics.averageSessionTime
} د</div>
                <div className="text-sm text-gray-600">متوسط الجلسة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>إحصائيات الاستخدام</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{
  data.usageStats.totalRequests.toLocaleString()
}</div>
              <div className="text-sm text-gray-600">إجمالي الطلبات</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{
  data.usageStats.averageResponseTime
}s</div>
              <div className="text-sm text-gray-600">متوسط وقت الاستجابة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{
  data.usageStats.successRate
}%</div>
              <div className="text-sm text-gray-600">معدل النجاح</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-medium mb-4">الميزات الأكثر استخداماً</h4>
            <div className="space-y-3">
              {data.usageStats.popularFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{feature.name}</span>
                    <Badge className={`text-xs ${getTrendColor(feature.trend)}`}>
                      {getTrendIcon(feature.trend)}
                      {
  feature.trend === 'up' ? 'زيادة' : feature.trend === 'down' ? 'انخفاض' : 'مستقر'
}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{feature.count.toLocaleString()}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={
  {
  'width': `${
  (feature.count / Math.max(...data.usageStats.popularFeatures.map(f => f.count))) * 100
}%`
}
}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance */}
      {data.aiPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>أداء الذكاء الاصطناعي</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{
  data.aiPerformance.modelAccuracy
}%</div>
                <div className="text-sm text-gray-600">دقة النموذج</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{
  data.aiPerformance.responseQuality
}/5</div>
                <div className="text-sm text-gray-600">جودة الاستجابة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{
  data.aiPerformance.userSatisfaction
}/5</div>
                <div className="text-sm text-gray-600">رضا المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{
  data.aiPerformance.learningRate
}</div>
                <div className="text-sm text-gray-600">معدل التعلم</div>
              </div>
            </div>

            {data.aiPerformance.improvementAreas.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">مجالات التحسين</h4>
                <div className="space-y-2">
                  {data.aiPerformance.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>الرؤى والتوصيات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.insights.map((insight) => (
              <div key={
  insight.id
} className={
  `p-4 rounded-lg border ${
  getInsightColor(insight.type)
}`
}>
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={`text-xs ${getInsightColor(insight.type)}`}>
                          {
  insight.impact === 'high' ? 'عالي' : insight.impact === 'medium' ? 'متوسط' : 'منخفض'
}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.timestamp).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        الثقة: {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>التوصيات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recommendations.map((recommendation) => (
              <div key={recommendation.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(recommendation.priority)}`}>
                    {
  recommendation.priority === 'high' ? 'عالي' : recommendation.priority === 'medium' ? 'متوسط' : 'منخفض'
}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">التأثير المتوقع:</span>
                    <div className="font-medium">{recommendation.estimatedImpact}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">وقت التنفيذ:</span>
                    <div className="font-medium">{recommendation.implementationTime}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">التكلفة:</span>
                    <div className="font-medium">{recommendation.cost}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">الفئة:</span>
                    <div className="font-medium">{recommendation.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Metrics */}
      {showAdvancedMetrics && (
        <>
          {/* User Interactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>تفاعلات المستخدمين</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{
  data.userInteractions.sessionDuration
} د</div>
                  <div className="text-sm text-gray-600">متوسط مدة الجلسة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{
  data.userInteractions.clicksPerSession
}</div>
                  <div className="text-sm text-gray-600">النقرات لكل جلسة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{
  data.userInteractions.efficiencyScore
}%</div>
                  <div className="text-sm text-gray-600">معدل الكفاءة</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">أجهزة المستخدمين</h4>
                <div className="space-y-3">
                  {data.userInteractions.deviceTypes.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{device.type}</span>
                        <Badge className={`text-xs ${getTrendColor(device.trend)}`}>
                          {getTrendIcon(device.trend)}
                          {
  device.trend === 'up' ? 'زيادة' : device.trend === 'down' ? 'انخفاض' : 'مستقر'
}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{device.percentage}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{'width': `${device.percentage}%`}}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>اتجاهات الأداء</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{
  data.trends.performanceMetrics.responseTime
}s</div>
                  <div className="text-sm text-gray-600">وقت الاستجابة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{
  data.trends.performanceMetrics.accuracy
}%</div>
                  <div className="text-sm text-gray-600">الدقة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{
  data.trends.performanceMetrics.userSatisfaction
}/5</div>
                  <div className="text-sm text-gray-600">رضا المستخدمين</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {getSystemHealthIcon(data.trends.performanceMetrics.systemHealth)}
                  </div>
                  <div className="text-sm text-gray-600">صحة النظام</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

}
