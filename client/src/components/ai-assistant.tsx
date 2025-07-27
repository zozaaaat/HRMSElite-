import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
      content: 'مرحباً! أنا مساعد الذكي للموارد البشرية. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: aiInsights } = useQuery({
    queryKey: ['/api/ai/insights', companyId],
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          companyId,
          employeeId,
          context: messages.slice(-5) // Send last 5 messages for context
        })
      });
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[600px] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <Sparkles className="h-4 w-4 text-yellow-500" />
            المساعد الذكي للموارد البشرية
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex gap-4 p-4">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.analysis && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {message.analysis.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ثقة: {Math.round(message.analysis.confidence)}%
                            </Badge>
                          </div>
                          
                          {message.analysis.recommendations.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">التوصيات:</p>
                              {message.analysis.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />
                                  <p className="text-xs">{rec}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('ar-SA', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-background border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <p className="text-sm">جاري التحليل...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب سؤالك هنا... (مثال: ما هو معدل الغياب هذا الشهر؟)"
                disabled={sendMessageMutation.isPending}
                className="flex-1"
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
          
          {/* AI Insights Panel */}
          <div className="w-80 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              رؤى ذكية فورية
            </h3>
            
            <div className="space-y-3">
              {aiInsights?.alerts?.map((alert: any, index: number) => (
                <div key={index} className="p-3 rounded-lg border bg-background">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      {alert.action && (
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {aiInsights?.predictions?.map((prediction: any, index: number) => (
                <div key={index} className="p-3 rounded-lg border bg-background">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{prediction.title}</p>
                      <p className="text-xs text-muted-foreground">{prediction.description}</p>
                      <Badge variant="secondary" className="text-xs">
                        احتمالية: {prediction.probability}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">أسئلة شائعة</h4>
              <div className="space-y-1">
                {[
                  "ما هو رصيد إجازتي المتبقي؟",
                  "متى موعد صرف المرتب؟",
                  "كيف أقدم طلب إجازة؟",
                  "من يستحق ترقية هذا العام؟",
                  "ما هو معدل الحضور العام؟"
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="h-auto p-2 text-xs justify-start whitespace-normal"
                    onClick={() => {
                      setInputMessage(question);
                      handleSendMessage();
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}