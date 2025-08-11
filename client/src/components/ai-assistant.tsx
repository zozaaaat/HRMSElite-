import {useState, useRef, useEffect, type KeyboardEvent} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Badge} from '@/components/ui/badge';
import {ScrollArea} from '@/components/ui/scroll-area';
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
  Maximize2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'chart' | 'list' | 'alert';
  data?: Record<string, unknown> | undefined;
}

interface AIAssistantProps {
  className?: string;
}

const quickActions = [
  {
    'title': 'تقرير الغياب',
    'icon': Calendar,
    'description': 'احصل على تقرير مفصل عن الغياب',
    'action': 'أعطني تقرير الغياب لهذا الشهر'
  },
  {
    'title': 'التراخيص المنتهية',
    'icon': AlertTriangle,
    'description': 'تحقق من التراخيص التي ستنتهي قريباً',
    'action': 'كم رخصة ستنتهي خلال الشهر القادم؟'
  },
  {
    'title': 'تحليل الأداء',
    'icon': Target,
    'description': 'تحليل أداء الموظفين',
    'action': 'أعطني تحليل أداء الموظفين'
  },
  {
    'title': 'التوصيات',
    'icon': Lightbulb,
    'description': 'توصيات ذكية للتحسين',
    'action': 'ما هي التوصيات لتحسين الأداء؟'
  },
  {
    'title': 'إحصائيات الحضور',
    'icon': Activity,
    'description': 'إحصائيات مفصلة عن الحضور',
    'action': 'أعطني إحصائيات الحضور'
  },
  {
    'title': 'تحليل التراخيص',
    'icon': FileText,
    'description': 'تحليل شامل للتراخيص',
    'action': 'حلل حالة جميع التراخيص'
  }
];

const aiResponses = {
  'تقرير الغياب': {
    'text': 'بناءً على تحليل البيانات، إليك تقرير الغياب لهذا الشهر:\n\n• إجمالي أيام العمل: 22 يوم\n• نسبة الحضور: 92%\n• عدد أيام الغياب: 45 يوم\n• متوسط التأخير: 12 دقيقة\n\nالتوصية: قسم IT لديه أفضل نسبة حضور (95%)',
  
    'type': 'text'
  },
  'التراخيص المنتهية': {
    'text': 'تحليل التراخيص المنتهية:\n\n⚠️ تراخيص ستنتهي خلال 30 يوم:\n• شركة النيل الأزرق - 15 يوم\n• شركة الاتحاد الخليجي - 30 يوم\n\n📊 إجمالي التراخيص النشطة: 156\n📈 نسبة التجديد المتوقعة: 85%',
  
    'type': 'alert'
  },
  'تحليل الأداء': {
    'text': 'تحليل أداء الموظفين:\n\n🏆 أفضل أداء:\n• أحمد محمد - 95%\n• سارة أحمد - 91%\n\n⚠️ يحتاج متابعة:\n• محمد حسن - 72%\n\n📈 متوسط الأداء العام: 87%',
  
    'type': 'list'
  },
  'التوصيات': {
    'text': 'التوصيات الذكية للتحسين:\n\n1. 🎯 تدريب إضافي لـ 3 موظفين في قسم المبيعات\n2. 📅 تحسين جدول العمل لتقليل التأخير\n3. 🔄 مراجعة سياسات الغياب\n4. 💡 إدخال نظام حوافز لتحسين الأداء',
  
    'type': 'list'
  },
  'إحصائيات الحضور': {
    'text': 'إحصائيات الحضور الشاملة:\n\n📊 النسب:\n• الحضور: 92%\n• الغياب: 6%\n• التأخير: 2%\n\n🏢 أفضل الأقسام:\n1. IT - 95%\n2. المالية - 93%\n3. الموارد البشرية - 90%',
  
    'type': 'text'
  },
  'تحليل التراخيص': {
    'text': 'تحليل شامل للتراخيص\n\n📋 الحالة:\n• نشطة: 65%\n• تنتهي قريباً: 15%\n• منتهية: 10%\n• قيد التجديد: 10%\n\n💰 التكلفة المتوقعة للتجديد: 45,000 ريال',
  
    'type': 'text'
  }
};

export default function AIAssistant ({className}: AIAssistantProps) {

  const [messages, setMessages] = useState<Message[]>([
    {
      'id': '1',
      'text': 'مرحباً! أنا المساعد الذكي لـ HRMS Elite. كيف يمكنني مساعدتك اليوم؟',
      'sender': 'ai',
      'timestamp': new Date(),
      'type': 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<globalThis.HTMLDivElement>(null);
  const inputRef = useRef<globalThis.HTMLInputElement>(null);

  const scrollToBottom = () => {

    messagesEndRef.current?.scrollIntoView({'behavior': 'smooth'});

  };

  useEffect(() => {

    scrollToBottom();

  }, [messages]);

  const addMessage = (text: string,
   sender: 'user' | 'ai',
   type: 'text' | 'chart' | 'list' | 'alert' = 'text',
   data?: Record<string,
   unknown>) => {

    const newMessage: Message = {
      'id': Date.now().toString(),
      text,
      sender,
      'timestamp': new Date(),
      type,
      ...(data && { data })
    };
    setMessages(prev => [...prev, newMessage]);

  };

  const handleSendMessage = async (text: string) => {

    if (!text.trim()) {

      return;

    }

    // إضافة رسالة المستخدم
    addMessage(text, 'user');
    setInputValue('');
    setIsLoading(true);

    // محاكاة استجابة AI
    setTimeout(() => {

      const response = aiResponses[text as keyof typeof aiResponses] || {
        'text': 'أفهم سؤالك. دعني أحلل البيانات وأعطيك إجابة مفصلة...',
        'type': 'text'
      };

      addMessage(response.text, 'ai', response.type as Message['type']);
      setIsLoading(false);

    }, 1500);

  };

  const handleQuickAction = (action: string) => {

    handleSendMessage(action);

  };

  const handleKeyPress = (e: KeyboardEvent<globalThis.HTMLInputElement>) => {

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();
      handleSendMessage(inputValue);

    }

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
                onClick={() => setMessages(messages[0] ? [messages[0]] : [])}
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
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('ar-SA', {
                          'hour': '2-digit',
                          'minute': '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={
  {
  'animationDelay': '0.1s'
}
} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={
  {
  'animationDelay': '0.2s'
}
} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
