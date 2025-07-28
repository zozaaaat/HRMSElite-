import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Target, 
  Award,
  Users,
  BarChart3,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Activity
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface PerformanceData {
  month: string;
  performance: number;
  target: number;
}

interface TeamPerformance {
  name: string;
  productivity: number;
  quality: number;
  teamwork: number;
  innovation: number;
  leadership: number;
}

export default function PerformancePage() {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("quarter");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const performanceData: PerformanceData[] = [
    { month: "يناير", performance: 75, target: 80 },
    { month: "فبراير", performance: 82, target: 80 },
    { month: "مارس", performance: 78, target: 80 },
    { month: "أبريل", performance: 85, target: 80 },
    { month: "مايو", performance: 88, target: 85 },
    { month: "يونيو", performance: 92, target: 85 }
  ];

  const teamPerformanceData: TeamPerformance[] = [
    {
      name: "التقنية",
      productivity: 92,
      quality: 88,
      teamwork: 85,
      innovation: 90,
      leadership: 82
    },
    {
      name: "المبيعات",
      productivity: 88,
      quality: 82,
      teamwork: 90,
      innovation: 78,
      leadership: 85
    },
    {
      name: "الموارد البشرية",
      productivity: 85,
      quality: 90,
      teamwork: 92,
      innovation: 82,
      leadership: 88
    }
  ];

  const topPerformers = [
    { id: "1", name: "أحمد محمد علي", position: "مدير تطوير", score: 95, trend: "up" },
    { id: "2", name: "فاطمة أحمد سالم", position: "محلل أعمال", score: 92, trend: "up" },
    { id: "3", name: "محمد عبدالله الحربي", position: "مطور أول", score: 90, trend: "stable" },
    { id: "4", name: "سارة عبدالرحمن القحطاني", position: "مديرة مشاريع", score: 88, trend: "up" },
    { id: "5", name: "خالد سعد المطيري", position: "مصمم واجهات", score: 87, trend: "down" }
  ];

  const handleStartReview = () => {
    toast({
      title: "بدء دورة التقييم",
      description: "تم إرسال نماذج التقييم لجميع المدراء",
    });
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">تقييم الأداء</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وتقييم أداء الموظفين والفرق
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذه السنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleStartReview} className="gap-2">
            <Calendar className="h-4 w-4" />
            بدء دورة تقييم
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              متوسط الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+4% عن الربع الماضي</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              تحقيق الأهداف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              تقييمات مكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142/156</div>
            <p className="text-xs text-muted-foreground mt-1">91% اكتمال</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              موظفون متميزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground mt-1">تقييم 90% فأكثر</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="teams">أداء الفرق</TabsTrigger>
          <TabsTrigger value="individuals">الأفراد المتميزون</TabsTrigger>
          <TabsTrigger value="goals">الأهداف</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الأداء العام</CardTitle>
              <CardDescription>
                مقارنة الأداء الفعلي بالأهداف المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#8884d8" 
                    name="الأداء الفعلي"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#82ca9d" 
                    name="الهدف"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>توزيع التقييمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ممتاز (90-100)</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>جيد جداً (80-89)</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>جيد (70-79)</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>يحتاج تحسين (أقل من 70)</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مجالات التحسين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">مهارات التواصل</span>
                    </div>
                    <Badge variant="outline" className="text-orange-600">25 موظف</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">إدارة الوقت</span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">18 موظف</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">المهارات التقنية</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">12 موظف</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>أداء الفرق</CardTitle>
              <CardDescription>
                تقييم شامل لأداء الفرق المختلفة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={teamPerformanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="الإنتاجية" 
                    dataKey="productivity" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="الجودة" 
                    dataKey="quality" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="العمل الجماعي" 
                    dataKey="teamwork" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individuals">
          <Card>
            <CardHeader>
              <CardTitle>الموظفون المتميزون</CardTitle>
              <CardDescription>
                أعلى 5 موظفين أداءً في الفترة الحالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                        <span className="font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{performer.score}%</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(performer.trend)}
                          <span className="text-xs text-muted-foreground">
                            {performer.trend === "up" ? "تحسن" : performer.trend === "down" ? "انخفاض" : "ثابت"}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">صفحة الأهداف والمؤشرات قيد التطوير...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}