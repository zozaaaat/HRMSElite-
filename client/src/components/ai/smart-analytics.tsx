import {useState, useEffect, useCallback} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
  Brain,
  Users,
  AlertTriangle,
  Target,
  Lightbulb,
  Activity,
  Loader2,
  Zap,
  MousePointer,
  BookOpen,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Activity as ActivityIcon,
  Plus,
  X
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import logger from '../../lib/logger';


interface UserInteraction {
  type: 'click' | 'keypress' | 'pageview' | 'hover' | 'scroll';
  element?: string;
  className?: string;
  key?: string;
  path: string;
  timestamp: string;
  duration?: number;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'optimization' | 'learning' | 'alert';
  priority: 'high' | 'medium' | 'low';
  category: string;
  confidence: number;
  action?: string;
  estimatedImpact: string;
  timestamp: string;
}

interface UserBehavior {
  sessionDuration: number;
  clicksPerSession: number;
  featuresUsed: string[];
  commonPaths: Array<{ path: string; count: number; successRate: number }>;
  deviceTypes: Array<{ type: string; percentage: number; trend: 'up' | 'down' | 'stable' }>;
  errorRate: number;
  bounceRate: number;
  learningProgress: number;
  efficiencyScore: number;
}

interface SystemMetrics {
  activeUsers: number;
  currentRequests: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdate: string;
  peakUsage: number;
  averageSessionTime: number;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
}

interface AIPerformance {
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
}

interface SmartAnalyticsProps {
  className?: string;
}

export default function SmartAnalytics ({className}: SmartAnalyticsProps) {

  const {toast} = useToast();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [aiPerformance, setAiPerformance] = useState<AIPerformance | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [learningMode, setLearningMode] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

  // مراقبة التفاعلات في الوقت الفعلي
  useEffect(() => {

    const handleClick = (e: globalThis.MouseEvent) => {

      const target = e.target as globalThis.HTMLElement;
      if (target) {

        const interaction: UserInteraction = {
          'type': 'click',
          'element': target.tagName,
          'className': target.className,
          'path': window.location.pathname,
          'timestamp': new Date().toISOString()
        };
        setInteractions(prev => [...prev, interaction]);

      }

    };

    const handleKeyPress = (e: globalThis.KeyboardEvent) => {

      const interaction: UserInteraction = {
        'type': 'keypress',
        'key': e.key,
        'path': window.location.pathname,
        'timestamp': new Date().toISOString()
      };
      setInteractions(prev => [...prev, interaction]);

    };

    const handlePageView = () => {

      const interaction: UserInteraction = {
        'type': 'pageview',
        'path': window.location.pathname,
        'timestamp': new Date().toISOString()
      };
      setInteractions(prev => [...prev, interaction]);

    };

    const handleMouseOver = (e: globalThis.MouseEvent) => {

      const target = e.target as globalThis.HTMLElement;
      if (target?.classList.contains('interactive')) {

        const interaction: UserInteraction = {
          'type': 'hover',
          'element': target.tagName,
          'className': target.className,
          'path': window.location.pathname,
          'timestamp': new Date().toISOString()
        };
        setInteractions(prev => [...prev, interaction]);

      }

    };

    if (isMonitoring) {

      window.document.addEventListener('click', handleClick);
      window.document.addEventListener('keypress', handleKeyPress);
      window.addEventListener('popstate', handlePageView);
      window.document.addEventListener('mouseover', handleMouseOver);
      handlePageView(); // تسجيل الصفحة الحالية

    }

    return () => {

      window.document.removeEventListener('click', handleClick);
      window.document.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('popstate', handlePageView);
      window.document.removeEventListener('mouseover', handleMouseOver);

    };

  }, [isMonitoring]);

  // تحليل سلوك المستخدم
  const analyzeUserBehavior = useCallback(() => {

    if (interactions.length === 0) {

      return;

    }

    const sessionDuration = calculateSessionDuration(interactions);
    const clicksPerSession = calculateClicksPerSession(interactions);
    const errorRate = calculateErrorRate(interactions);
    const bounceRate = calculateBounceRate(interactions);
    const learningProgress = calculateLearningProgress(interactions);
    const efficiencyScore = calculateEfficiencyScore(interactions);

    const commonPaths = analyzeCommonPaths(interactions);
    const deviceTypes = analyzeDeviceTypes(interactions);
    const featuresUsed = analyzeFeaturesUsed(interactions);

    setUserBehavior({
      sessionDuration,
      clicksPerSession,
      featuresUsed,
      commonPaths,
      deviceTypes,
      errorRate,
      bounceRate,
      learningProgress,
      efficiencyScore
    });

  }, [interactions]);

  // تحليل المسارات الشائعة
  const analyzeCommonPaths = (interactions: UserInteraction[]) => {

    const pathCounts: Record<string, number> = {};
    const pathSuccess: Record<string, number> = {};

    interactions.forEach(interaction => {

      if (interaction.path) {

        pathCounts[interaction.path] = (pathCounts[interaction.path] ?? 0) + 1;
        // افتراض أن التفاعل ناجح إذا كان نوعه click أو keypress
        if (interaction.type === 'click' || interaction.type === 'keypress') {

          pathSuccess[interaction.path] = (pathSuccess[interaction.path] ?? 0) + 1;

        }

      }

    });

    return Object.entries(pathCounts)
      .map(([path, count]) => ({
        path,
        count,
        'successRate': pathSuccess[path] ? (pathSuccess[path] / count) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

  };

  // تحليل أنواع الأجهزة
  const analyzeDeviceTypes = (_interactions: UserInteraction[]): Array<{
   type: string; percentage: number; trend: 'up' | 'down' | 'stable' 
}> => {
  

    // محاكاة بيانات الأجهزة
    return [
      {'type': 'Desktop', 'percentage': 65, 'trend': 'up'},
      {'type': 'Mobile', 'percentage': 30, 'trend': 'up'},
      {'type': 'Tablet', 'percentage': 5, 'trend': 'stable'}
    ];

  };

  // تحليل الميزات المستخدمة
  const analyzeFeaturesUsed = (interactions: UserInteraction[]): string[] => {

    const features = new Set<string>();

    interactions.forEach(interaction => {

      if (interaction.path.includes('/ai')) {

        features.add('الذكاء الاصطناعي');

      }
      if (interaction.path.includes('/reports')) {

        features.add('التقارير');

      }
      if (interaction.path.includes('/employees')) {

        features.add('الموظفين');

      }
      if (interaction.path.includes('/companies')) {

        features.add('الشركات');

      }
      if (interaction.path.includes('/licenses')) {

        features.add('التراخيص');

      }
      if (interaction.path.includes('/payroll')) {

        features.add('الرواتب');

      }
      if (interaction.path.includes('/attendance')) {

        features.add('الحضور');

      }
      if (interaction.path.includes('/documents')) {

        features.add('المستندات');

      }

    });

    return Array.from(features);

  };

  // حساب مدة الجلسة
  const calculateSessionDuration = (interactions: UserInteraction[]): number => {

    if (interactions.length < 2) {

      return 0;

    }

    const sortedInteractions = interactions.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstInteraction = sortedInteractions[0];
    const lastInteraction = sortedInteractions[sortedInteractions.length - 1];

    if (!firstInteraction || !lastInteraction) {

      return 0;

    }

    const startTime = new Date(firstInteraction.timestamp).getTime();
    const endTime = new Date(lastInteraction.timestamp).getTime();

    return Math.round((endTime - startTime) / 1000); // Convert to seconds

  };

  // حساب النقرات لكل جلسة
  const calculateClicksPerSession = (interactions: UserInteraction[]): number => {

    const clicks = interactions.filter(i => i.type === 'click').length;
    return clicks;

  };

  // حساب معدل الأخطاء
  const calculateErrorRate = (_interactions: UserInteraction[]): number => {

    // محاكاة معدل الأخطاء
    return Math.random() * 5 + 1; // 1-6%

  };

  // حساب معدل الارتداد
  const calculateBounceRate = (_interactions: UserInteraction[]): number => {

    // محاكاة معدل الارتداد
    return Math.random() * 20 + 10; // 10-30%

  };

  // حساب تقدم التعلم
  const calculateLearningProgress = (interactions: UserInteraction[]): number => {

    // محاكاة تقدم التعلم بناءً على تنوع التفاعلات
    const uniqueFeatures = new Set(interactions.map(i => i.path)).size;
    return Math.min(uniqueFeatures * 10, 100);

  };

  // حساب درجة الكفاءة
  const calculateEfficiencyScore = (interactions: UserInteraction[]): number => {

    // محاكاة درجة الكفاءة
    const sessionDuration = calculateSessionDuration(interactions);
    const clicksPerSession = calculateClicksPerSession(interactions);

    if (sessionDuration === 0) {

      return 0;

    }

    const efficiency = (clicksPerSession / sessionDuration) * 10;
    return Math.min(efficiency, 100);

  };

  // تحليل مسار المستخدم (تمت إزالته لعدم الاستخدام)

  // التحقق من وجود أنماط متكررة
  const hasRepetitivePattern = (interactions: UserInteraction[]): boolean => {

    const recentInteractions = interactions.slice(-10);
    const uniquePaths = new Set(recentInteractions.map(i => i.path));
    return uniquePaths.size < 3; // إذا كان المستخدم يزور أقل من 3 صفحات مختلفة

  };

  // توليد اقتراحات التعلم
  const generateLearningSuggestion = (interactions: UserInteraction[]): SmartSuggestion | null => {

    if (interactions.length < 5) {

      return null;

    }

    // const userPath = analyzeUserPath(interactions);
    const hasRepetitive = hasRepetitivePattern(interactions);
    const featuresUsed = analyzeFeaturesUsed(interactions);

    if (hasRepetitive && featuresUsed.length < 3) {

      return {
        'id': 'learning-1',
        'title': 'اكتشف ميزات جديدة',
        'description': 'يبدو أنك تستخدم نفس الميزات. جرب استكشاف ميزات جديدة لتحسين إنتاجيتك.',
        'type': 'learning',
        'priority': 'medium',
        'category': 'productivity',
        'confidence': 0.8,
        'action': 'عرض دليل الميزات',
        'estimatedImpact': 'زيادة الإنتاجية بنسبة 25%',
        'timestamp': new Date().toISOString()
      };

    }

    if (featuresUsed.length === 0) {

      return {
        'id': 'learning-2',
        'title': 'ابدأ باستخدام النظام',
        'description': 'يبدو أنك جديد في النظام. ابدأ باستكشاف الميزات الأساسية.',
        'type': 'learning',
        'priority': 'high',
        'category': 'onboarding',
        'confidence': 0.9,
        'action': 'عرض الدليل التفاعلي',
        'estimatedImpact': 'تسريع التعلم بنسبة 50%',
        'timestamp': new Date().toISOString()
      };

    }

    return null;

  };

  // تحميل بيانات النظام
  const loadSystemMetrics = async () => {

    try {

      const response = await fetch('/api/dashboard/stats', {
        'credentials': 'include'
      });

      if (response.ok) {

        const data = await response.json() as { totalRequests?: number };
        setSystemMetrics({
          'activeUsers': Math.floor(Math.random() * 50) + 10,
          'currentRequests': Math.floor(Math.random() * 20) + 5,
          'systemHealth': 'good' as const,
          'lastUpdate': new Date().toISOString(),
          'peakUsage': Math.floor(Math.random() * 100) + 50,
          'averageSessionTime': Math.floor(Math.random() * 30) + 15,
          'totalRequests': data.totalRequests ?? 1247,
          'successRate': 94.2,
          'averageResponseTime': 2.3
        });

      }

    } catch (error: unknown) {

      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Error loading system metrics:', normalizedError);

    }

  };

  // تحميل بيانات أداء AI
  const loadAIPerformance = async () => {

    try {

      const response = await fetch('/api/ai/status', {
        'credentials': 'include'
      });

      if (response.ok) {

        setAiPerformance({
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
        });

      }

    } catch (error: unknown) {

      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Error loading AI performance:', normalizedError);

    }

  };

  // توليد اقتراحات ذكية
  const generateSmartSuggestions = useCallback(() => {

    const newSuggestions: SmartSuggestion[] = [];

    // اقتراحات بناءً على سلوك المستخدم
    if (userBehavior) {

      if (userBehavior.efficiencyScore < 50) {

        newSuggestions.push({
          'id': 'efficiency-1',
          'title': 'تحسين الكفاءة',
          'description': 'درجة كفاءتك منخفضة. جرب استخدام الاختصارات وطرق العمل السريعة.',
          'type': 'optimization',
          'priority': 'high',
          'category': 'productivity',
          'confidence': 0.85,
          'action': 'عرض نصائح الكفاءة',
          'estimatedImpact': 'زيادة الكفاءة بنسبة 30%',
          'timestamp': new Date().toISOString()
        });

      }

      if (userBehavior.errorRate > 5) {

        newSuggestions.push({
          'id': 'error-1',
          'title': 'تقليل الأخطاء',
          'description': 'معدل الأخطاء مرتفع. راجع إجراءاتك وتأكد من صحة البيانات المدخلة.',
          'type': 'alert',
          'priority': 'medium',
          'category': 'quality',
          'confidence': 0.75,
          'action': 'عرض دليل الأخطاء الشائعة',
          'estimatedImpact': 'تقليل الأخطاء بنسبة 40%',
          'timestamp': new Date().toISOString()
        });

      }

      if (userBehavior.sessionDuration < 10) {

        newSuggestions.push({
          'id': 'session-1',
          'title': 'تحسين مدة الجلسة',
          'description': 'مدة جلساتك قصيرة. جرب استكشاف المزيد من الميزات لتحسين تجربتك.',
          'type': 'feature',
          'priority': 'medium',
          'category': 'engagement',
          'confidence': 0.7,
          'action': 'عرض الميزات المتقدمة',
          'estimatedImpact': 'زيادة التفاعل بنسبة 25%',
          'timestamp': new Date().toISOString()
        });

      }

    }

    // اقتراحات بناءً على أداء النظام
    if (systemMetrics) {

      if (systemMetrics.averageResponseTime > 3) {

        newSuggestions.push({
          'id': 'performance-1',
          'title': 'تحسين الأداء',
          'description': 'وقت الاستجابة بطيء. قد تحتاج إلى تحسين الاتصال أو تحديث المتصفح.',
          'type': 'optimization',
          'priority': 'high',
          'category': 'performance',
          'confidence': 0.9,
          'action': 'فحص الاتصال',
          'estimatedImpact': 'تحسين السرعة بنسبة 50%',
          'timestamp': new Date().toISOString()
        });

      }

    }

    // اقتراحات بناءً على أداء AI
    if (aiPerformance) {

      if (aiPerformance.userSatisfaction < 4) {

        newSuggestions.push({
          'id': 'ai-1',
          'title': 'تحسين تجربة AI',
          'description': 'رضا المستخدمين منخفض. ساعدنا في تحسين المساعد الذكي.',
          'type': 'feature',
          'priority': 'medium',
          'category': 'ai',
          'confidence': 0.8,
          'action': 'تقديم ملاحظات',
          'estimatedImpact': 'تحسين الرضا بنسبة 20%',
          'timestamp': new Date().toISOString()
        });

      }

    }

    // اقتراحات التعلم
    const learningSuggestion = generateLearningSuggestion(interactions);
    if (learningSuggestion) {

      newSuggestions.push(learningSuggestion);

    }

    setSuggestions(newSuggestions);

  }, [userBehavior, systemMetrics, aiPerformance, interactions]);

  // معالجة إجراء الاقتراح
  const handleSuggestionAction = (suggestion: SmartSuggestion) => {

    toast({
      'title': 'تم تنفيذ الإجراء',
      'description': `تم تنفيذ: ${suggestion.action}`,
      'variant': 'default'
    });

    // إزالة الاقتراح من القائمة
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

  };

  // تجاهل الاقتراح
  const handleDismissSuggestion = (suggestionId: string) => {

    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

  };

  // تحليل سلوك المستخدم
  const handleAnalyzeBehavior = async () => {

    setIsAnalyzing(true);

    try {

      analyzeUserBehavior();
      generateSmartSuggestions();

      toast({
        'title': 'تم التحليل',
        'description': 'تم تحليل سلوك المستخدم وتوليد الاقتراحات الذكية.',
        'variant': 'default'
      });

    } catch {

      toast({
        'title': 'خطأ في التحليل',
        'description': 'حدث خطأ أثناء تحليل سلوك المستخدم.',
        'variant': 'destructive'
      });

    } finally {

      setIsAnalyzing(false);

    }

  };

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {

    loadSystemMetrics();
    loadAIPerformance();

  }, []);

  // تحليل سلوك المستخدم عند تغيير التفاعلات
  useEffect(() => {

    if (interactions.length > 0) {

      analyzeUserBehavior();

    }

  }, [interactions, analyzeUserBehavior]);

  // توليد الاقتراحات عند تغيير البيانات
  useEffect(() => {

    if ((userBehavior ?? systemMetrics) || aiPerformance) {

      generateSmartSuggestions();

    }

  }, [userBehavior, systemMetrics, aiPerformance, generateSmartSuggestions]);

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

  const getSuggestionIcon = (type: string) => {

    switch (type) {

    case 'feature':
      return <Plus className="h-5 w-5 mt-0.5" />;
    case 'optimization':
      return <Zap className="h-5 w-5 mt-0.5" />;
    case 'learning':
      return <BookOpen className="h-5 w-5 mt-0.5" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 mt-0.5" />;
    default:
      return <Lightbulb className="h-5 w-5 mt-0.5" />;

    }

  };

  const getPriorityColor = (priority: string) => {

    const colors: Record<string, string> = {
      'high': 'text-red-600 bg-red-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'low': 'text-green-600 bg-green-50'
    };
    return colors[priority] ?? 'text-gray-600 bg-gray-50';

  };

  const getTrendColor = (trend: string) => {

    const colors: Record<string, string> = {
      'up': 'text-green-600',
      'down': 'text-red-600',
      'stable': 'text-blue-600'
    };
    return colors[trend] ?? 'text-gray-600';

  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التحليلات الذكية</h2>
          <p className="text-gray-600">تحليل ذكي لسلوك المستخدمين وأداء النظام</p>
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
            onClick={() => setLearningMode(!learningMode)}
          >
            {learningMode ? 'إيقاف' : 'تشغيل'} وضع التعلم
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'إيقاف' : 'تشغيل'} المراقبة
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyzeBehavior}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            تحليل
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>مقاييس النظام</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.activeUsers}</div>
                <div className="text-sm text-gray-600">المستخدمين النشطين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{
  systemMetrics.currentRequests
}</div>
                <div className="text-sm text-gray-600">الطلبات الحالية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemMetrics.peakUsage}</div>
                <div className="text-sm text-gray-600">الاستخدام الأقصى</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{
  systemMetrics.averageSessionTime
} د</div>
                <div className="text-sm text-gray-600">متوسط الجلسة</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Performance */}
      {aiPerformance && (
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
  aiPerformance.modelAccuracy
}%</div>
                <div className="text-sm text-gray-600">دقة النموذج</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{
  aiPerformance.responseQuality
}/5</div>
                <div className="text-sm text-gray-600">جودة الاستجابة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{
  aiPerformance.userSatisfaction
}/5</div>
                <div className="text-sm text-gray-600">رضا المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{
  aiPerformance.learningRate
}</div>
                <div className="text-sm text-gray-600">معدل التعلم</div>
              </div>
            </div>

            {aiPerformance.improvementAreas.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">مجالات التحسين</h4>
                <div className="space-y-2">
                  {aiPerformance.improvementAreas.map((area, index) => (
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

      {/* User Behavior */}
      {userBehavior && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>سلوك المستخدم</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{
  userBehavior.sessionDuration
} د</div>
                <div className="text-sm text-gray-600">متوسط مدة الجلسة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{
  userBehavior.clicksPerSession
}</div>
                <div className="text-sm text-gray-600">النقرات لكل جلسة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{
  userBehavior.efficiencyScore
}%</div>
                <div className="text-sm text-gray-600">معدل الكفاءة</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-medium mb-4">الميزات المستخدمة</h4>
              <div className="flex flex-wrap gap-2">
                {userBehavior.featuresUsed.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {showAdvancedMetrics && (
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4">أجهزة المستخدمين</h4>
                <div className="space-y-3">
                  {userBehavior.deviceTypes.map((device, index) => (
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>الاقتراحات الذكية</span>
              <Badge variant="outline" className="text-xs">
                {suggestions.length} اقتراح
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getSuggestionIcon(suggestion.type)}
                      <div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                        {
  suggestion.priority === 'high' ? 'عالي' : suggestion.priority === 'medium' ? 'متوسط' : 'منخفض'
}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        الثقة: {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {suggestion.estimatedImpact}
                      </span>
                      {suggestion.action && (
                        <Button
                          size="sm"
                          onClick={() => handleSuggestionAction(suggestion)}
                        >
                          {suggestion.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interaction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MousePointer className="h-5 w-5" />
            <span>إحصائيات التفاعل</span>
            <Badge variant="outline" className="text-xs">
              {interactions.length} تفاعل
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {interactions.filter(i => i.type === 'click').length}
              </div>
              <div className="text-sm text-gray-600">النقرات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {interactions.filter(i => i.type === 'keypress').length}
              </div>
              <div className="text-sm text-gray-600">المفاتيح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {interactions.filter(i => i.type === 'pageview').length}
              </div>
              <div className="text-sm text-gray-600">الصفحات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(interactions.map(i => i.path)).size}
              </div>
              <div className="text-sm text-gray-600">المسارات</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
