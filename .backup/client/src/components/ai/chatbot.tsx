import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  Calendar,
  AlertTriangle,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Activity,
  Zap,
  X,
  Minimize2,
  Maximize2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatbotProps {
  className?: string;
}

const quickActions = [
  {
    title: "تقرير الغياب",
    icon: Calendar,
    description: "احصل على تقرير مفصل عن الغياب",
    action: "أعطني تقرير الغياب لهذا الشهر"
  },
  {
    title: "التراخيص المنتهية",
    icon: AlertTriangle,
    description: "تحقق من التراخيص التي ستنتهي قريباً",
    action: "كم رخصة ستنتهي خلال الشهر القادم؟"
  },
  {
    title: "تحليل الأداء",
    icon: Target,
    description: "تحليل أداء الموظفين",
    action: "أعطني تحليل أداء الموظفين"
  },
  {
    title: "التوصيات",
    icon: Lightbulb,
    description: "توصيات ذكية للتحسين",
    action: "ما هي التوصيات لتحسين الأداء؟"
  },
  {
    title: "إحصائيات الحضور",
    icon: Activity,
    description: "إحصائيات مفصلة عن الحضور",
    action: "أعطني إحصائيات الحضور"
  },
  {
    title: "تحليل التراخيص",
    icon: FileText,
    description: "تحليل شامل للتراخيص",
    action: "حلل حالة جميع التراخيص"
  }
];

export default function Chatbot({ className }: ChatbotProps) {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // استخدام useChat hook من مكتبة ai
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/ai-chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'مرحباً! أنا المساعد الذكي لـ HRMS Elite. كيف يمكنني مساعدتك اليوم؟'
      }
    ],
    onError: (error) => {
      console.error('Chat error:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: string) => {
    handleInputChange({ target: { value: action } } as any);
    handleSubmit({ preventDefault: () => {} } as any);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const clearChat = () => {
    // إعادة تعيين المحادثة
    window.location.reload();
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
          {/* Quick Actions */}
          <div className="p-4 border-b">
            <p className="text-xs text-muted-foreground mb-3">إجراءات سريعة:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.slice(0, 4).map((action, index) => (
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
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
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