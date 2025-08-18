import React, { Suspense } from 'react';
import { PageHelmet } from '@/components/shared/PageHelmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Bot, MessageSquare, Zap, Users, FileText, Calendar, Target } from 'lucide-react';
import { logger } from '@/lib/logger';


// Lazy load AI chatbot
const Chatbot = React.lazy(() => import('@/components/ai/chatbot'));

const features = [
  {
    icon: Brain,
    title: "ذكاء اصطناعي متقدم",
    description: "مساعد ذكي يستخدم تقنيات AI متطورة لفهم وتحليل استفساراتك"
  },
  {
    icon: MessageSquare,
    title: "محادثة طبيعية",
    description: "تفاعل طبيعي باللغة العربية مع واجهة سهلة الاستخدام"
  },
  {
    icon: Users,
    title: "تحليل الموظفين",
    description: "تحليل شامل لأداء الموظفين ومعدلات الحضور والغياب"
  },
  {
    icon: FileText,
    title: "متابعة التراخيص",
    description: "متابعة حالة التراخيص والوثائق المهمة"
  },
  {
    icon: Calendar,
    title: "تقارير الحضور",
    description: "تقارير مفصلة عن الحضور والغياب والتأخير"
  },
  {
    icon: Target,
    title: "التوصيات الذكية",
    description: "توصيات مخصصة لتحسين الأداء والإنتاجية"
  }
];

const quickExamples = [
  "أعطني تقرير الغياب لهذا الشهر",
  "كم رخصة ستنتهي خلال الشهر القادم؟",
  "أعطني تحليل أداء الموظفين",
  "ما هي التوصيات لتحسين الأداء؟",
  "أعطني إحصائيات الحضور",
  "حلل حالة جميع التراخيص"
];

export default function AIChatbotDemo() {
  return (
    <>
      <PageHelmet
        title="المساعد الذكي - HRMS Elite"
        description="تجربة المساعد الذكي لنظام إدارة الموارد البشرية"
        keywords="مساعد ذكي, AI, محادثة, تحليل, HRMS"
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">المساعد الذكي</h1>
            <Badge variant="secondary" className="text-sm">
              <Bot className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            استكشف قوة الذكاء الاصطناعي في إدارة الموارد البشرية. 
            اسأل أي سؤال واحصل على إجابات ذكية وتحليلات مفصلة.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <feature.icon className="w-6 h-6 text-primary" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              أمثلة سريعة للاستفسارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => {
                    // يمكن إضافة تفاعل هنا لفتح المحادثة مع هذا السؤال
                    logger.info('Example clicked:', example);
                  }}
                >
                  <p className="text-sm font-medium">{example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>كيفية الاستخدام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">اكتب سؤالك</h3>
                <p className="text-sm text-muted-foreground">
                  اكتب أي سؤال باللغة العربية
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">احصل على الإجابة</h3>
                <p className="text-sm text-muted-foreground">
                  المساعد سيجيبك فوراً
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">استخدم الإجراءات السريعة</h3>
                <p className="text-sm text-muted-foreground">
                  اضغط على الأزرار السريعة للحصول على تقارير جاهزة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chatbot */}
      <Suspense fallback={null}>
        <Chatbot />
      </Suspense>
    </>
  );
} 