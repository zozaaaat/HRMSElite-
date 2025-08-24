import React, {Suspense} from 'react';
import {PageHelmet} from '@/components/shared/PageHelmet';
import {LoadingFallback} from '@/components/shared/LoadingFallback';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Brain, Bot, MessageSquare, Zap, Users, FileText, Calendar, Target} from 'lucide-react';
import { t } from "i18next";

// Lazy load AI chatbot
const Chatbot = React.lazy(() => import('@/components/ai/chatbot'));

const features = [
  {
    'icon': Brain,
    'title': 'ذكاء اصطناعي متقدم',
    'description': 'مساعد ذكي يستخدم تقنيات AI متطورة لفهم وتحليل استفساراتك'
  },
  {
    'icon': MessageSquare,
    'title': 'محادثة طبيعية',
    'description': 'تفاعل طبيعي باللغة العربية مع واجهة سهلة الاستخدام'
  },
  {
    'icon': Users,
    'title': 'تحليل الموظفين',
    'description': 'تحليل شامل لأداء الموظفين ومعدلات الحضور والغياب'
  },
  {
    'icon': FileText,
    'title': 'متابعة التراخيص',
    'description': 'متابعة حالة التراخيص والوثائق المهمة'
  },
  {
    'icon': Calendar,
    'title': 'تقارير الحضور',
    'description': 'تقارير مفصلة عن الحضور والغياب والتأخير'
  },
  {
    'icon': Target,
    'title': 'التوصيات الذكية',
    'description': 'توصيات مخصصة لتحسين الأداء والإنتاجية'
  }
];

const quickExamples = [
  'أعطني تقرير الغياب لهذا الشهر',
  'كم رخصة ستنتهي خلال الشهر القادم؟',
  'أعطني تحليل أداء الموظفين',
  'ما هي التوصيات لتحسين الأداء؟',
  'أعطني إحصائيات الحضور',
  'حلل حالة جميع التراخيص'
];

export default function AIChatbotDemo () {

  return (
    <>
      <PageHelmet
        title={t('auto.ai-chatbot-demo.11')}
        description={t('auto.ai-chatbot-demo.12')}
        keywords={t('auto.ai-chatbot-demo.13')}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">{t('auto.ai-chatbot-demo.1')}</h1>
            <Badge variant="secondary" className="text-sm">
              <Bot className="w-3 h-3 mr-1" />
              AI
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('auto.ai-chatbot-demo.2')}</p>
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
              {t('auto.ai-chatbot-demo.3')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickExamples.map((example, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={t('auto.ai-chatbot-demo.14')}
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
            <CardTitle>{t('auto.ai-chatbot-demo.4')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold">{t('auto.ai-chatbot-demo.5')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auto.ai-chatbot-demo.6')}</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold">{t('auto.ai-chatbot-demo.7')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auto.ai-chatbot-demo.8')}</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold">{t('auto.ai-chatbot-demo.9')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auto.ai-chatbot-demo.10')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Chatbot */}
      <Suspense fallback={<LoadingFallback />}>
        <Chatbot />
      </Suspense>
    </>
  );

}
