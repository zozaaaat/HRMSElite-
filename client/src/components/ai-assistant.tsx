import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot, Send, User, Sparkles, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي للموارد البشرية. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInputMessage('');
  };

  const getAIResponse = (input: string): string => {
    const responses = {
      'رواتب': 'بناءً على تحليل البيانات، يمكنني تقديم التوصيات التالية للرواتب:\n• متوسط الراتب الحالي: 8,500 ريال\n• نسبة الزيادة المقترحة: 7%\n• توفير في التكاليف: 12%',
      'موظفين': 'تحليل الموظفين يظهر:\n• إجمالي الموظفين: 450\n• معدل الرضا: 87%\n• معدل الدوران: 5.2%\n• التوصية: تطوير برامج التدريب',
      'أداء': 'تقرير الأداء:\n• تحسن الإنتاجية: +15%\n• معدل إكمال المهام: 94%\n• النقاط التي تحتاج تحسين: إدارة الوقت',
      'إجازات': 'تحليل الإجازات:\n• إجازات معلقة: 12\n• متوسط مدة الإجازة: 5 أيام\n• التوصية: تطبيق نظام إجازات مرن'
    };

    for (const [key, response] of Object.entries(responses)) {
      if (input.includes(key)) {
        return response;
      }
    }

    return 'أفهم استفسارك. يمكنني مساعدتك في:\n• تحليل بيانات الموظفين\n• تقييم الأداء\n• إدارة الرواتب\n• تحسين العمليات\n• التنبؤ بالاتجاهات';
  };

  const quickSuggestions = [
    { icon: TrendingUp, text: 'تحليل الأداء العام', prompt: 'أريد تحليل أداء الشركة' },
    { icon: Lightbulb, text: 'توصيات التحسين', prompt: 'ما هي توصياتك لتحسين الأداء؟' },
    { icon: AlertTriangle, text: 'المشاكل المحتملة', prompt: 'ما هي المشاكل التي قد تواجهنا؟' },
    { icon: Sparkles, text: 'الاتجاهات المستقبلية', prompt: 'ما هي الاتجاهات المتوقعة؟' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            المساعد الذكي للموارد البشرية
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* Quick Suggestions */}
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => setInputMessage(suggestion.prompt)}
              >
                <suggestion.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-center">{suggestion.text}</span>
              </Button>
            ))}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="h-4 w-4" /> : 
                      <Bot className="h-4 w-4" />
                    }
                  </div>
                  <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}