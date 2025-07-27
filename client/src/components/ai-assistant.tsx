import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  analysis?: {
    type: string;
    confidence: number;
    recommendations: string[];
  };
  timestamp: Date;
}

interface AIAssistantProps {
  companyId: string;
  employeeId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ companyId, employeeId, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'مرحباً! أنا المساعد الذكي للموارد البشرية. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get AI insights data
  const { data: aiInsights } = useQuery({
    queryKey: ['/api/ai/insights/system'],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Mock AI response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        message: `تم تحليل استفسارك: "${message}". بناءً على البيانات المتاحة، أنصح بمراجعة تقارير الأداء وتحديث سياسات الشركة.`,
        analysis: {
          type: 'general',
          confidence: 85,
          recommendations: ['مراجعة تقارير الأداء', 'تحديث السياسات', 'متابعة مع الإدارة']
        }
      };
    },
    onSuccess: (response) => {
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: response.message,
        analysis: response.analysis,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0" dir="rtl">
        <DialogHeader className="border-b p-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <DialogTitle className="text-xl font-bold">
              المساعد الذكي للموارد البشرية
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex gap-6 p-6">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg border">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted mr-auto'
                  }`}>
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      {message.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.analysis && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs opacity-75">
                              <CheckCircle className="h-3 w-3" />
                              مستوى الثقة: {message.analysis.confidence}%
                            </div>
                            {message.analysis.recommendations.length > 0 && (
                              <div className="text-xs">
                                <p className="font-medium mb-1">التوصيات:</p>
                                <ul className="space-y-0.5">
                                  {message.analysis.recommendations.map((rec, idx) => (
                                    <li key={idx} className="flex items-center gap-1">
                                      <div className="w-1 h-1 bg-current rounded-full" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs opacity-50 mt-1">
                          {message.timestamp.toLocaleTimeString('ar')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-end">
                  <div className="bg-muted rounded-lg p-3 mr-auto max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="اكتب سؤالك هنا..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                dir="rtl"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Insights Sidebar */}
          <div className="w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  رؤى ذكية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiInsights?.alerts?.map((alert: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-red-800">{alert.title}</p>
                        <p className="text-xs text-red-600 mt-1">{alert.description}</p>
                        <Badge variant="destructive" className="mt-2 text-xs">
                          {alert.priority === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiInsights?.recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-blue-800">{rec.title}</p>
                        <p className="text-xs text-blue-600 mt-1">{rec.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          تأثير {rec.impact === 'high' ? 'عالي' : 'متوسط'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  اختصارات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'تقرير الحضور اليومي',
                  'تحليل أداء الموظفين',
                  'حالة التراخيص',
                  'طلبات الإجازات المعلقة',
                  'تقرير المرتبات'
                ].map((shortcut, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-sm h-auto py-2"
                    onClick={() => setInputMessage(shortcut)}
                  >
                    <MessageCircle className="h-3 w-3 ml-2" />
                    {shortcut}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}