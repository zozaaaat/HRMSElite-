import React, { useState, useRef, useEffect } from "react";
import { useChat } from '../../hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  Calendar,
  AlertTriangle,
  Target,
  Lightbulb,
  FileText,
  Activity,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  BookOpen,
  Search,
  TrendingUp
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { logger } from '../../lib/logger';


interface ChatbotProps {
  className?: string;
}

interface KnowledgeBaseItem {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface QuickAction {
  title: string;
  icon: any;
  description: string;
  action: string;
  category: string;
}

const quickActions: QuickAction[] = [
  {
    title: "تقرير الغياب",
    icon: Calendar,
    description: "احصل على تقرير مفصل عن الغياب",
    action: "أعطني تقرير الغياب لهذا الشهر",
    category: "reports"
  },
  {
    title: "التراخيص المنتهية",
    icon: AlertTriangle,
    description: "تحقق من التراخيص التي ستنتهي قريباً",
    action: "كم رخصة ستنتهي خلال الشهر القادم؟",
    category: "licenses"
  },
  {
    title: "تحليل الأداء",
    icon: Target,
    description: "تحليل أداء الموظفين",
    action: "أعطني تحليل أداء الموظفين",
    category: "analytics"
  },
  {
    title: "التوصيات",
    icon: Lightbulb,
    description: "توصيات ذكية للتحسين",
    action: "ما هي التوصيات لتحسين الأداء؟",
    category: "recommendations"
  },
  {
    title: "إحصائيات الحضور",
    icon: Activity,
    description: "إحصائيات مفصلة عن الحضور",
    action: "أعطني إحصائيات الحضور",
    category: "attendance"
  },
  {
    title: "تحليل التراخيص",
    icon: FileText,
    description: "تحليل شامل للتراخيص",
    action: "حلل حالة جميع التراخيص",
    category: "licenses"
  },
  {
    title: "دليل النظام",
    icon: BookOpen,
    description: "دليل شامل لاستخدام النظام",
    action: "أعطني دليل شامل لاستخدام النظام",
    category: "help"
  },
  {
    title: "تحليل البيانات",
    icon: TrendingUp,
    description: "تحليل شامل للبيانات",
    action: "حلل جميع البيانات المتاحة",
    category: "analytics"
  }
];

export default function Chatbot({ className }: ChatbotProps) {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredActions, setFilteredActions] = useState<QuickAction[]>(quickActions);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // استخدام useChat hook من مكتبة ai
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'مرحباً! أنا المساعد الذكي لـ HRMS Elite. كيف يمكنني مساعدتك اليوم؟'
      }
    ],
    onError: (_error: any) => {
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  });

  // تحميل قاعدة المعرفة من الملفات والـ API
  const loadKnowledgeBase = async () => {
    try {
      setIsLoadingKnowledge(true);
      
      // تحميل من API
      const apiResponse = await fetch('/api/ai/knowledge', {
        credentials: 'include'
      });
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        setKnowledgeBase(prev => [...prev, ...apiData]);
      }

      // تحميل من ملفات Markdown
      const markdownFiles = [
        '/docs/README.md',
        '/docs/API-DOCUMENTATION.md',
        '/docs/AUTHENTICATION-IMPLEMENTATION.md',
        '/docs/SECURITY-IMPLEMENTATION.md'
      ];

      for (const file of markdownFiles) {
        try {
          const response = await fetch(file);
          if (response.ok) {
            const content = await response.text();
            const title = file.split('/').pop()?.replace('.md', '') || 'Document';
            
            setKnowledgeBase(prev => [...prev, {
              title,
              content: content.substring(0, 500) + '...', // تقصير المحتوى للعرض
              category: 'documentation',
              tags: extractTags(content)
            }]);
          }
        } catch (error) {
          logger.warn(`Failed to load ${file}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error loading knowledge base:', error);
      toast({
        title: "تحذير",
        description: "فشل في تحميل بعض مصادر المعرفة، لكن المساعد سيعمل بشكل طبيعي.",
        variant: "default"
      });
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  // استخراج الكلمات المفتاحية من النص
  const extractTags = (text: string): string[] => {
    const commonTags = [
      'موظف', 'شركة', 'ترخيص', 'راتب', 'حضور', 'إجازة', 'تقرير',
      'employee', 'company', 'license', 'salary', 'attendance', 'leave', 'report'
    ];
    
    return commonTags.filter(tag => 
      text.toLowerCase().includes(tag.toLowerCase())
    );
  };

  // البحث في قاعدة المعرفة
  const searchKnowledgeBase = (query: string): KnowledgeBaseItem[] => {
    if (!query.trim()) return [];
    
    return knowledgeBase.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const handleQuickAction = (action: string) => {
    handleInputChange({ target: { value: action } } as React.ChangeEvent<HTMLInputElement>);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  const clearChat = () => {
    // إعادة تعيين المحادثة
    window.location.reload();
  };

  const handleKnowledgeSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = searchKnowledgeBase(searchQuery);
    if (results.length > 0) {
      const result = results[0];
      const message = `وجدت معلومات مفيدة في "${result.title}":\n\n${result.content}`;
      handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    } else {
      toast({
        title: "لا توجد نتائج",
        description: "لم يتم العثور على معلومات تتعلق بالبحث المطلوب.",
        variant: "default"
      });
    }
    setSearchQuery("");
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle className="text-sm">المساعد الذكي</CardTitle>
                {isLoadingKnowledge && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-96 h-[600px] shadow-lg flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm">المساعد الذكي</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                AI
              </Badge>
              {isLoadingKnowledge && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Search Knowledge Base */}
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="ابحث في قاعدة المعرفة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleKnowledgeSearch()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleKnowledgeSearch}
                disabled={!searchQuery.trim()}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Knowledge Base Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="w-3 h-3" />
              <span>قاعدة المعرفة: {knowledgeBase.length} مصدر</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b">
            <p className="text-xs text-muted-foreground mb-3">إجراءات سريعة:</p>
            <div className="grid grid-cols-2 gap-2">
              {filteredActions.slice(0, 6).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 flex flex-col items-center gap-1"
                  onClick={() => handleQuickAction(action.action)}
                  disabled={isLoading}
                >
                  <action.icon className="w-3 h-3" />
                  <span>{action.title}</span>
                </Button>
              ))}
            </div>
            {filteredActions.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                لا توجد نتائج للبحث
              </p>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs opacity-70">
                        {new Date().toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">جاري الكتابة...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="flex justify-start">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">
                        حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 