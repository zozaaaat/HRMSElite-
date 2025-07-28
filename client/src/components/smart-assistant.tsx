import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'analysis' | 'recommendation' | 'alert' | 'info';
}

interface SmartAssistantProps {
  companyId: string;
}

export function SmartAssistant({ companyId }: SmartAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'مرحباً! أنا المساعد الذكي لنظام الموارد البشرية. يمكنني مساعدتك في تحليل البيانات والحصول على رؤى مفيدة. كيف يمكنني مساعدتك اليوم؟',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'info'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const predefinedQuestions = [
    'ما هو معدل دوران الموظفين الحالي؟',
    'كيف يمكن تحسين الإنتاجية؟',
    'هل هناك أقسام تحتاج توظيف جديد؟',
    'ما هي توقعات الرواتب للشهر القادم؟',
    'كيف يمكن تقليل تكاليف الموارد البشرية؟'
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(text.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'assistant',
        timestamp: new Date(),
        type: response.type
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): { text: string; type: Message['type'] } => {
    const q = question.toLowerCase();
    
    if (q.includes('دوران') || q.includes('ترك')) {
      return {
        text: 'بناءً على التحليل الحالي، معدل دوران الموظفين هو 8% سنوياً. قسم المبيعات يظهر أعلى معدل (15%) ويحتاج لاهتمام فوري. أنصحك بمراجعة حوافز هذا القسم وتحسين بيئة العمل.',
        type: 'analysis'
      };
    }
    
    if (q.includes('إنتاجية') || q.includes('أداء')) {
      return {
        text: 'الإنتاجية العامة ارتفعت بنسبة 12% خلال الشهرين الماضيين! أهم العوامل المؤثرة: تطبيق نظام العمل المرن (+8%)، البرامج التدريبية الجديدة (+4%). أقترح توسيع هذه البرامج للأقسام الأخرى.',
        type: 'recommendation'
      };
    }
    
    if (q.includes('توظيف') || q.includes('تعيين')) {
      return {
        text: 'تحليل احتياجات التوظيف يظهر: قسم التقنية يحتاج 3 مطورين خلال الشهرين القادمين، قسم المبيعات يحتاج مدير جديد. الميزانية المتوقعة: 35,000 ريال شهرياً للمناصب الجديدة.',
        type: 'alert'
      };
    }
    
    if (q.includes('راتب') || q.includes('رواتب')) {
      return {
        text: 'تحليل الرواتب يظهر فجوة 8% تحت معدل السوق للمطورين. متوسط الزيادة المقترحة: 700 ريال شهرياً لكل مطور. هذا سيقلل مخاطر الدوران بنسبة 40% ويوفر تكاليف إعادة التوظيف.',
        type: 'recommendation'
      };
    }
    
    if (q.includes('تكلفة') || q.includes('توفير')) {
      return {
        text: 'تم اكتشاف فرص توفير: أتمتة عمليات الموارد البشرية يمكن أن توفر 15% من التكاليف التشغيلية، تحسين جدولة المناوبات يوفر 8% من تكاليف الإضافي. إجمالي التوفير المتوقع: 45,000 ريال شهرياً.',
        type: 'analysis'
      };
    }
    
    return {
      text: 'شكراً لسؤالك! يمكنني مساعدتك في تحليل البيانات والحصول على رؤى حول الأداء، الرواتب، التوظيف، ومعدلات الدوران. هل تريد تحليلاً محدداً لأي من هذه المجالات؟',
      type: 'info'
    };
  };

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
      case 'recommendation': return <TrendingUp className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: Message['type']) => {
    switch (type) {
      case 'analysis': return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'recommendation': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'alert': return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800';
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="h-[700px] flex flex-col" dir="rtl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          المساعد الذكي للموارد البشرية
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            متصل
          </Badge>
          <Badge variant="outline" className="text-xs">
            دقة 94%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.sender === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                  <div className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-2' 
                      : `border ${getMessageColor(message.type)}`
                  }`}>
                    {message.sender === 'assistant' && message.type && (
                      <div className="flex items-center gap-2 mb-2">
                        {getMessageIcon(message.type)}
                        <span className="text-xs font-medium text-muted-foreground">
                          {message.type === 'analysis' && 'تحليل'}
                          {message.type === 'recommendation' && 'توصية'}
                          {message.type === 'alert' && 'تنبيه'}
                          {message.type === 'info' && 'معلومة'}
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <div className="flex-shrink-0 order-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="max-w-[80%]">
                  <div className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Quick Questions */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground mb-2">أسئلة سريعة:</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {predefinedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleSendMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputText);
                }
              }}
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}