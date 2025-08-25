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
                <h1 className="text-3xl font-bold">الذكاء الاصطناعي</h1>
                <p className="text-muted-foreground">تحليلات ذكية ومساعد آلي متقدم</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <Activity className="w-3 h-3 mr-1" />
                متصل
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main role="main" className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              التحليلات
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              المساعد الذكي
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              المعلومات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      إحصائيات سريعة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">إجمالي الطلبات</span>
                      <Badge variant="outline">1,247</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">متوسط وقت الاستجابة</span>
                      <Badge variant="outline">2.3s</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">معدل النجاح</span>
                      <Badge variant="outline">94.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">رضا المستخدمين</span>
                      <Badge variant="outline">4.6/5</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      الميزات المتاحة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">تحليل النصوص</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">توليد التقارير</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">تحليل المشاعر</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">استخراج الكلمات المفتاحية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">المساعد الذكي</span>
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
                      المساعد الذكي
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      مساعد ذكي متقدم يساعدك في:
                    </p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        الإجابة على الأسئلة حول النظام
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        مساعدتك في إدارة الموظفين
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        متابعة التراخيص والانتهاء
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        استخراج التقارير المختلفة
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        تحليل البيانات والمعلومات
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      أمثلة على الاستخدام
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">"كيف أضيف موظف جديد؟"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">"أعطني تقرير الغياب لهذا الشهر"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">"كم رخصة ستنتهي خلال الشهر القادم؟"</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">"ما هي ميزات النظام؟"</p>
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
                      محادثة مع المساعد الذكي
                    </CardTitle>
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
                    معلومات تقنية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">المكونات المستخدمة:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Local LLM للتحليل والمعالجة</li>
                      <li>• قاعدة معرفة متقدمة للردود</li>
                      <li>• خوارزميات تحليل المشاعر</li>
                      <li>• استخراج الكلمات المفتاحية</li>
                      <li>• توليد الملخصات الذكية</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">الميزات المتقدمة:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• تحليل النصوص باللغة العربية</li>
                      <li>• فهم السياق والاستعلامات</li>
                      <li>• تحليلات ذكية للاستخدام</li>
                      <li>• توصيات مخصصة</li>
                      <li>• تقارير تفاعلية</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    دليل الاستخدام
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">كيفية الاستخدام:</h4>
                    <ol className="text-sm space-y-2 text-muted-foreground">
                      <li>1. اكتب سؤالك أو طلبك باللغة العربية</li>
                      <li>2. انتظر رد المساعد الذكي</li>
                      <li>3. استخدم الأزرار السريعة للاستعلامات الشائعة</li>
                      <li>4. تصفح التحليلات للحصول على رؤى مفصلة</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">نصائح للحصول على أفضل النتائج:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• استخدم لغة واضحة ومباشرة</li>
                      <li>• اطرح أسئلة محددة</li>
                      <li>• استخدم الكلمات المفتاحية المناسبة</li>
                      <li>• راجع التحليلات بانتظام</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">المساعد الذكي</p>
                      <p className="text-xs text-muted-foreground">متصل ومتاح</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">تحليل النصوص</p>
                      <p className="text-xs text-muted-foreground">يعمل بشكل طبيعي</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">تحليل المشاعر</p>
                      <p className="text-xs text-muted-foreground">دقة عالية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium text-sm">التحليلات</p>
                      <p className="text-xs text-muted-foreground">بيانات محدثة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

}
