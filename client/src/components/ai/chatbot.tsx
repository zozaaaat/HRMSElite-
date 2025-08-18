import React, {useState, useRef, useEffect} from 'react';
import type {ChangeEvent, FormEvent, KeyboardEvent} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
import { Brain, Send, Bot, User, Calendar, AlertTriangle, Target, Lightbulb, FileText, Activity, X, Minimize2, Maximize2, Loader2, BookOpen, Search, BarChart3, PieChart, Building, CreditCard, Shield } from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import logger from '../../lib/logger';

// Type definitions for API responses
interface ChatApiResponse {
  id?: string;
  content: string;
  createdAt?: string;
}

interface KnowledgeApiResponse {
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  lastUpdated: string;
  usageCount: number;
  source: 'api' | 'documentation' | 'user' | 'system';
}

interface DashboardStatsResponse {
  totalEmployees?: number;
  totalCompanies?: number;
}

// Lightweight local chat hook to replace missing `ai/react`
interface UseLocalChatOptions {
  api: string;
  onError?: (error: unknown) => void;
}

interface ChatMessage {
  id?: string | undefined;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string | undefined;
}

function useLocalChat (options: UseLocalChatOptions) {
  const {api, onError} = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<{ value: string }>) => {
    setInput(e.target.value);
  };

  const submit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, {'role': 'user', 'content': trimmed}];
    setMessages(nextMessages);
    setIsLoading(true);
    try {
      const res = await fetch(api, {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'credentials': 'include',
        'body': JSON.stringify({'messages': nextMessages})
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json() as ChatApiResponse;
      const assistantMessage: ChatMessage = {
        'id': data.id,
        'role': 'assistant',
        'content': data.content,
        'createdAt': data.createdAt
      };
      setMessages(prev => [...prev, assistantMessage]);
      setInput('');
    } catch (err) {
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (_e?: FormEvent) => {
    if (_e) _e.preventDefault();
    await submit();
  };

  return {messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput};
}

interface ChatbotProps {
  className?: string;
}

interface KnowledgeBaseItem {
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  lastUpdated: string;
  usageCount: number;
  source: 'api' | 'documentation' | 'user' | 'system';
}

interface QuickAction {
  title: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>; // Lucide React icon type
  description: string;
  action: string;
  category: string;
  usageCount: number;
  lastUsed?: string;
}

interface SystemData {
  employees: number;
  companies: number;
  licenses: number;
  attendance: number;
  payroll: number;
  documents: number;
  reports: number;
  activeUsers: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

const quickActions: QuickAction[] = [
  {
    'title': 'تقرير الغياب',
    'icon': Calendar,
    'description': 'احصل على تقرير مفصل عن الغياب',
    'action': 'أعطني تقرير الغياب لهذا الشهر',
    'category': 'reports',
    'usageCount': 156
  },
  {
    'title': 'التراخيص المنتهية',
    'icon': AlertTriangle,
    'description': 'تحقق من التراخيص التي ستنتهي قريباً',
    'action': 'كم رخصة ستنتهي خلال الشهر القادم؟',
    'category': 'licenses',
    'usageCount': 89
  },
  {
    'title': 'تحليل الأداء',
    'icon': Target,
    'description': 'تحليل أداء الموظفين',
    'action': 'أعطني تحليل أداء الموظفين',
    'category': 'analytics',
    'usageCount': 234
  },
  {
    'title': 'التوصيات الذكية',
    'icon': Lightbulb,
    'description': 'توصيات ذكية للتحسين',
    'action': 'ما هي التوصيات لتحسين الأداء؟',
    'category': 'recommendations',
    'usageCount': 67
  },
  {
    'title': 'إحصائيات الحضور',
    'icon': Activity,
    'description': 'إحصائيات مفصلة عن الحضور',
    'action': 'أعطني إحصائيات الحضور',
    'category': 'attendance',
    'usageCount': 198
  },
  {
    'title': 'تحليل التراخيص',
    'icon': FileText,
    'description': 'تحليل شامل للتراخيص',
    'action': 'حلل حالة جميع التراخيص',
    'category': 'licenses',
    'usageCount': 145
  },
  {
    'title': 'دليل النظام',
    'icon': BookOpen,
    'description': 'دليل شامل لاستخدام النظام',
    'action': 'أعطني دليل شامل لاستخدام النظام',
    'category': 'help',
    'usageCount': 78
  },
  {
    'title': 'تحليل البيانات',
    'icon': BarChart3,
    'description': 'تحليل شامل لبيانات النظام',
    'action': 'أعطني تحليل شامل لبيانات النظام',
    'category': 'analytics',
    'usageCount': 123
  },
  {
    'title': 'إدارة الشركات',
    'icon': Building,
    'description': 'معلومات عن إدارة الشركات',
    'action': 'كيف يمكنني إدارة الشركات؟',
    'category': 'companies',
    'usageCount': 92
  },
  {
    'title': 'إدارة الرواتب',
    'icon': CreditCard,
    'description': 'معلومات عن إدارة الرواتب',
    'action': 'كيف يمكنني إدارة الرواتب؟',
    'category': 'payroll',
    'usageCount': 167
  },
  {
    'title': 'الأمان والحماية',
    'icon': Shield,
    'description': 'معلومات عن أمان النظام',
    'action': 'ما هي ميزات الأمان في النظام؟',
    'category': 'security',
    'usageCount': 45
  },
  {
    'title': 'التقارير المتقدمة',
    'icon': PieChart,
    'description': 'تقارير متقدمة وتحليلات',
    'action': 'أعطني تقارير متقدمة',
    'category': 'reports',
    'usageCount': 134
  }
];

export default function Chatbot ({className}: ChatbotProps) {

  const {toast} = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [_isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActions, setFilteredActions] = useState<QuickAction[]>(quickActions);
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const [knowledgeSearchResults, setKnowledgeSearchResults] = useState<KnowledgeBaseItem[]>([]);
  type ScrollTarget = { scrollIntoView: (options?: unknown) => void };
  const messagesEndRef = useRef<ScrollTarget | null>(null);

  const {messages, input, handleInputChange, handleSubmit, isLoading, setMessages, setInput} = useLocalChat({
    'api': '/api/ai-chat',
    'onError': (error) => {
      logger.error('Chat error:', error);
      toast({
        'title': 'خطأ في الاتصال',
        'description': 'حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.',
        'variant': 'destructive'
      });
    }
  });

  // تحميل قاعدة المعرفة من الملفات والـ API
  const loadKnowledgeBase = async () => {

    try {

      setIsLoadingKnowledge(true);

      // تحميل من API
      const apiResponse = await fetch('/api/ai/knowledge', {
        'credentials': 'include'
      });

      if (apiResponse.ok) {

        const apiData = await apiResponse.json() as KnowledgeApiResponse[];
        setKnowledgeBase(prev => [...prev, ...apiData]);

      }

      // تحميل من ملفات Markdown
      const markdownFiles = [
        '/docs/README.md',
        '/docs/API-DOCUMENTATION.md',
        '/docs/AUTHENTICATION-IMPLEMENTATION.md',
        '/docs/SECURITY-IMPLEMENTATION.md',
        '/docs/COMPREHENSIVE-TESTING-IMPLEMENTATION.md',
        '/docs/AI-ENDPOINTS-IMPLEMENTATION-SUMMARY.md',
        '/docs/COMPREHENSIVE-DOCUMENTATION-REPORT.md'
      ];

      for (const file of markdownFiles) {

        try {

          const response = await fetch(file);
          if (response.ok) {

            const content = await response.text();
            const title = file.split('/').pop()?.replace('.md', '') ?? 'Document';

            setKnowledgeBase(prev => [...prev, {
              title,
              'content': `${content.substring(0, 800)}...`, // زيادة المحتوى للعرض
              'category': 'documentation',
              'tags': extractTags(content),
              'priority': 1,
              'lastUpdated': new Date().toISOString(),
              'usageCount': Math.floor(Math.random() * 100),
              'source': 'documentation'
            }]);

          }

        } catch {
          // تجاهل الأخطاء للملفات غير الموجودة
        }

      }

      // إضافة معرفة مخصصة للنظام
      const systemKnowledge: KnowledgeBaseItem[] = [
        {
          'title': 'إدارة الموظفين',
          'content': 'يمكنك إضافة موظفين جدد، تعديل بياناتهم، حذفهم، ومتابعة أدائهم. النظام يدعم إدارة كاملة لبيانات الموظفين بما في ذلك المعلومات الشخصية، الوظيفية، والمالية.',
  
          'category': 'employees',
          'tags': ['موظف', 'إضافة', 'تعديل', 'حذف', 'أداء'],
          'priority': 5,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 456,
          'source': 'system'
        },
        {
          'title': 'إدارة الشركات',
          'content': 'النظام يدعم إدارة متعددة الشركات. يمكنك إضافة شركات جديدة، تعديل معلوماتها، وإدارة العلاقة بين الشركات والموظفين.',
  
          'category': 'companies',
          'tags': ['شركة', 'إدارة', 'معلومات', 'علاقة'],
          'priority': 4,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 234,
          'source': 'system'
        },
        {
          'title': 'إدارة التراخيص',
          'content': 'متابعة تراخيص العمل والانتهاء. النظام ينبهك للتراخيص التي ستنتهي قريباً ويساعدك في تجديدها في الوقت المناسب.',
  
          'category': 'licenses',
          'tags': ['ترخيص', 'انتهاء', 'تجديد', 'تنبيه'],
          'priority': 4,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 189,
          'source': 'system'
        },
        {
          'title': 'إدارة الحضور والغياب',
          'content': 'تسجيل ومتابعة الحضور والغياب للموظفين. النظام يحسب ساعات العمل، التأخير، والإجازات.',
  
          'category': 'attendance',
          'tags': ['حضور', 'غياب', 'ساعات', 'تأخير', 'إجازة'],
          'priority': 3,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 567,
          'source': 'system'
        },
        {
          'title': 'إدارة الرواتب',
          'content': 'حساب وإدارة رواتب الموظفين. النظام يدعم الخصومات، الإضافات، والمكافآت مع إمكانية توليد تقارير الرواتب.',
  
          'category': 'payroll',
          'tags': ['راتب', 'حساب', 'خصم', 'إضافة', 'مكافأة'],
          'priority': 3,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 345,
          'source': 'system'
        },
        {
          'title': 'إدارة المستندات',
          'content': 'رفع وإدارة المستندات المهمة مثل العقود، الشهادات، والوثائق الرسمية. النظام يدعم تصنيف المستندات والبحث فيها.',
  
          'category': 'documents',
          'tags': ['مستند', 'رفع', 'تصنيف', 'بحث', 'عقد'],
          'priority': 2,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 278,
          'source': 'system'
        },
        {
          'title': 'التقارير والتحليلات',
          'content': 'توليد تقارير مفصلة عن جميع العمليات. النظام يوفر تحليلات ذكية ومؤشرات الأداء لمساعدتك في اتخاذ القرارات.',
  
          'category': 'reports',
          'tags': ['تقرير', 'تحليل', 'مؤشر', 'أداء', 'قرار'],
          'priority': 2,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 412,
          'source': 'system'
        },
        {
          'title': 'الذكاء الاصطناعي',
          'content': 'مساعد ذكي للاستعلامات والتحليل. النظام يستخدم الذكاء الاصطناعي لتقديم توصيات ذكية وتحليلات متقدمة.',
  
          'category': 'ai',
          'tags': ['ذكاء', 'اصطناعي', 'مساعد', 'توصية', 'تحليل'],
          'priority': 1,
          'lastUpdated': new Date().toISOString(),
          'usageCount': 123,
          'source': 'system'
        }
      ];

      setKnowledgeBase(prev => [...prev, ...systemKnowledge]);

    } catch (error) {

      logger.error('Error loading knowledge base:', error);
      toast({
        'title': 'تحذير',
        'description': 'فشل في تحميل بعض مصادر المعرفة، لكن المساعد سيعمل بشكل طبيعي.',
        'variant': 'default'
      });

    } finally {

      setIsLoadingKnowledge(false);

    }

  };

  // تحميل بيانات النظام
  const loadSystemData = async () => {

    try {

      const response = await fetch('/api/dashboard/stats', {
        'credentials': 'include'
      });

      if (response.ok) {

        const data = await response.json() as DashboardStatsResponse;
        setSystemData({
          'employees': data.totalEmployees ?? 0,
          'companies': data.totalCompanies ?? 0,
          'licenses': Math.floor(Math.random() * 100) + 50,
          'attendance': Math.floor(Math.random() * 95) + 85,
          'payroll': Math.floor(Math.random() * 1000) + 500,
          'documents': Math.floor(Math.random() * 500) + 200,
          'reports': Math.floor(Math.random() * 50) + 20,
          'activeUsers': Math.floor(Math.random() * 50) + 10,
          'systemHealth': 'good' as const
        });

      }

    } catch (error) {

      logger.error('Error loading system data:', error);

    }

  };

  // استخراج الكلمات المفتاحية من النص
  const extractTags = (text: string): string[] => {

    const commonTags = [
      'موظف', 'شركة', 'ترخيص', 'راتب', 'حضور', 'إجازة', 'تقرير',
      'employee', 'company', 'license', 'salary', 'attendance', 'leave', 'report',
      'إدارة', 'نظام', 'بيانات', 'تحليل', 'أداء', 'معلومات', 'وثيقة',
      'management', 'system', 'data', 'analysis', 'performance', 'information', 'document'
    ];

    return commonTags.filter(tag =>
      text.toLowerCase().includes(tag.toLowerCase())
    );

  };

  // البحث في قاعدة المعرفة
  const searchKnowledgeBase = (query: string): KnowledgeBaseItem[] => {

    if (!query.trim()) {

      return [];

    }

    return knowledgeBase
      .filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => (b.priority - a.priority) || (b.usageCount - a.usageCount));

  };

  // تصفية الإجراءات السريعة حسب البحث
  useEffect(() => {

    if (searchQuery.trim()) {

      const filtered = quickActions.filter(action =>
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActions(filtered);

    } else {

      setFilteredActions(quickActions);

    }

  }, [searchQuery]);

  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({'behavior': 'smooth'});

  };

  const handleQuickAction = (action: string) => {

    setInput(action);
    setSearchQuery('');

  };

  const handleKeyPress = (e: KeyboardEvent) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);

    }

  };

  const clearChat = () => {

    setMessages([]);
    toast({
      'title': 'تم مسح المحادثة',
      'description': 'تم مسح جميع الرسائل بنجاح.',
      'variant': 'default'
    });

  };

  const handleKnowledgeSearch = () => {

    if (searchQuery.trim()) {

      const results = searchKnowledgeBase(searchQuery);
      setKnowledgeSearchResults(results);
      setShowKnowledgeSearch(true);

    }

  };

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {

    loadKnowledgeBase();
    loadSystemData();

  }, []);

  // التمرير التلقائي للأسفل
  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  // Removed unused getCategoryIcon

  const getCategoryColor = (category: string) => {

    const colors: Record<string, string> = {
      'employees': 'bg-blue-100 text-blue-800',
      'companies': 'bg-green-100 text-green-800',
      'licenses': 'bg-yellow-100 text-yellow-800',
      'attendance': 'bg-purple-100 text-purple-800',
      'payroll': 'bg-indigo-100 text-indigo-800',
      'documents': 'bg-pink-100 text-pink-800',
      'reports': 'bg-orange-100 text-orange-800',
      'ai': 'bg-red-100 text-red-800',
      'analytics': 'bg-teal-100 text-teal-800',
      'help': 'bg-gray-100 text-gray-800',
      'security': 'bg-emerald-100 text-emerald-800',
      'system': 'bg-slate-100 text-slate-800',
      'documentation': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] ?? 'bg-gray-100 text-gray-800';

  };

  if (isMinimized) {

    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-sm">المساعد الذكي</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(false)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );

  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm">المساعد الذكي</CardTitle>
              {systemData && (
                <Badge variant="outline" className="text-xs">
                  {systemData.activeUsers} نشط
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                title="مسح المحادثة"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* قسم البحث في المعرفة */}
          <div className="p-3 border-b">
            <div className="flex space-x-2">
              <Input
                placeholder="ابحث في قاعدة المعرفة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleKnowledgeSearch}
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* نتائج البحث في المعرفة */}
          {showKnowledgeSearch && knowledgeSearchResults.length > 0 && (
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">نتائج البحث في المعرفة</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKnowledgeSearch(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-32">
                {knowledgeSearchResults.map((item, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium">{item.title}</h5>
                      <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {item.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.usageCount} استخدام
                      </span>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          {/* الإجراءات السريعة */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">الإجراءات السريعة</h4>
              <Badge variant="outline" className="text-xs">
                {filteredActions.length} إجراء
              </Badge>
            </div>
            <ScrollArea className="h-32">
              <div className="grid grid-cols-2 gap-2">
                {filteredActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto p-2 flex flex-col items-start space-y-1"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-center space-x-1 w-full">
                      <action.icon className="h-3 w-3" />
                      <span className="text-xs font-medium">{action.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 text-right w-full">
                      {action.usageCount} استخدام
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* المحادثة */}
          <div className="flex-1 p-3">
            <ScrollArea className="h-48 mb-3">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.role === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-75">
                          {message.role === 'user' ? 'أنت' : 'المساعد الذكي'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">جاري الكتابة...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={(el) => { messagesEndRef.current = el as unknown as ScrollTarget; }} />
              </div>
            </ScrollArea>

            {/* إدخال الرسالة */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
