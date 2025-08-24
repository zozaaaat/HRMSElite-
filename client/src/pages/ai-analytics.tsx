import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Brain,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Lightbulb,
  Zap,
  Settings,
  Info
} from 'lucide-react';
import Analytics from '@/components/ai/analytics';
import Chatbot from '@/components/ai/chatbot';
import { t } from "i18next";

export default function AIAnalyticsPage () {

  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('auto.ai-analytics.1')}</h1>
                <p className="text-muted-foreground">{t('auto.ai-analytics.2')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Activity className="w-3 h-3 mr-1" />
                {t('auto.ai-analytics.3')}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('auto.ai-analytics.4')}</TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {t('auto.ai-analytics.5')}</TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('auto.ai-analytics.6')}</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      {t('auto.ai-analytics.7')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('auto.ai-analytics.8')}</span>
                      <Badge variant="outline">1,247</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('auto.ai-analytics.9')}</span>
                      <Badge variant="outline">2.3s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('auto.ai-analytics.10')}</span>
                      <Badge variant="outline">94.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('auto.ai-analytics.11')}</span>
                      <Badge variant="outline">4.6/5</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      {t('auto.ai-analytics.12')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{t('auto.ai-analytics.13')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{t('auto.ai-analytics.14')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{t('auto.ai-analytics.15')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{t('auto.ai-analytics.16')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{t('auto.ai-analytics.17')}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Analytics */}
              <div className="lg:col-span-2">
                <Analytics />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chatbot Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {t('auto.ai-analytics.18')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('auto.ai-analytics.19')}</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('auto.ai-analytics.20')}</li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('auto.ai-analytics.21')}</li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('auto.ai-analytics.22')}</li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('auto.ai-analytics.23')}</li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {t('auto.ai-analytics.24')}</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {t('auto.ai-analytics.25')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{t('auto.ai-analytics.26')}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{t('auto.ai-analytics.27')}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{t('auto.ai-analytics.28')}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{t('auto.ai-analytics.29')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chatbot Component */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      {t('auto.ai-analytics.30')}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[500px] p-0">
                    <Chatbot />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t('auto.ai-analytics.31')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('auto.ai-analytics.32')}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>{t('auto.ai-analytics.33')}</li>
                      <li>{t('auto.ai-analytics.34')}</li>
                      <li>{t('auto.ai-analytics.35')}</li>
                      <li>{t('auto.ai-analytics.36')}</li>
                      <li>{t('auto.ai-analytics.37')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t('auto.ai-analytics.38')}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>{t('auto.ai-analytics.39')}</li>
                      <li>{t('auto.ai-analytics.40')}</li>
                      <li>{t('auto.ai-analytics.41')}</li>
                      <li>{t('auto.ai-analytics.42')}</li>
                      <li>{t('auto.ai-analytics.43')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('auto.ai-analytics.44')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('auto.ai-analytics.45')}</h4>
                    <ol className="text-sm space-y-2 text-muted-foreground">
                      <li>{t('auto.ai-analytics.46')}</li>
                      <li>{t('auto.ai-analytics.47')}</li>
                      <li>{t('auto.ai-analytics.48')}</li>
                      <li>{t('auto.ai-analytics.49')}</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t('auto.ai-analytics.50')}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>{t('auto.ai-analytics.51')}</li>
                      <li>{t('auto.ai-analytics.52')}</li>
                      <li>{t('auto.ai-analytics.53')}</li>
                      <li>{t('auto.ai-analytics.54')}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {t('auto.ai-analytics.55')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">{t('auto.ai-analytics.56')}</p>
                      <p className="text-xs text-muted-foreground">{t('auto.ai-analytics.57')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">{t('auto.ai-analytics.58')}</p>
                      <p className="text-xs text-muted-foreground">{t('auto.ai-analytics.59')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">{t('auto.ai-analytics.60')}</p>
                      <p className="text-xs text-muted-foreground">{t('auto.ai-analytics.61')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">{t('auto.ai-analytics.62')}</p>
                      <p className="text-xs text-muted-foreground">{t('auto.ai-analytics.63')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

}
