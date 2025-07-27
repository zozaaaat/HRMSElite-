import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ProgressRing } from "./progress-ring";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface AdvancedAnalyticsProps {
  companyId?: string;
}

export function AdvancedAnalytics({ companyId = "system" }: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [activeMetric, setActiveMetric] = useState("all");

  // Mock data for analytics
  const analyticsData = {
    kpis: [
      {
        name: "معدل دوران الموظفين",
        value: 12.5,
        target: 15,
        trend: -2.3,
        status: "good",
        description: "نسبة الموظفين الذين تركوا الشركة"
      },
      {
        name: "مؤشر رضا الموظفين",
        value: 87,
        target: 85,
        trend: 3.2,
        status: "excellent", 
        description: "متوسط درجة رضا الموظفين من 100"
      },
      {
        name: "معدل الحضور",
        value: 94.2,
        target: 90,
        trend: 1.8,
        status: "good",
        description: "نسبة الحضور اليومي للموظفين"
      },
      {
        name: "تكلفة التوظيف",
        value: 8500,
        target: 10000,
        trend: -15.2,
        status: "excellent",
        description: "متوسط تكلفة توظيف موظف واحد (ريال)"
      }
    ],
    departmentPerformance: [
      { name: "الموارد البشرية", efficiency: 92, satisfaction: 89, productivity: 88 },
      { name: "المالية", efficiency: 89, satisfaction: 91, productivity: 95 },
      { name: "التسويق", efficiency: 85, satisfaction: 87, productivity: 83 },
      { name: "العمليات", efficiency: 91, satisfaction: 85, productivity: 92 },
      { name: "تقنية المعلومات", efficiency: 88, satisfaction: 92, productivity: 90 }
    ],
    trends: {
      recruitment: [
        { month: "يناير", hired: 12, applications: 156 },
        { month: "فبراير", hired: 8, applications: 134 },
        { month: "مارس", hired: 15, applications: 189 },
        { month: "أبريل", hired: 11, applications: 167 },
        { month: "مايو", hired: 9, applications: 142 }
      ],
      performance: [
        { quarter: "Q1", score: 85 },
        { quarter: "Q2", score: 87 },
        { quarter: "Q3", score: 89 },
        { quarter: "Q4", score: 91 }
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">لوحة التحليلات المتقدمة</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء الموارد البشرية والمؤشرات الرئيسية</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <Tabs value={activeMetric} onValueChange={setActiveMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="recruitment">التوظيف</TabsTrigger>
          <TabsTrigger value="engagement">المشاركة</TabsTrigger>
          <TabsTrigger value="financial">المالية</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsData.kpis.map((kpi, index) => (
              <Card key={index} className={`border-2 ${getStatusColor(kpi.status)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                    {getStatusIcon(kpi.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">
                      {kpi.name.includes('تكلفة') ? `${kpi.value.toLocaleString()} ريال` : 
                       kpi.name.includes('معدل') && kpi.value < 50 ? `${kpi.value}%` : 
                       kpi.value}
                    </span>
                    <Badge variant={kpi.trend > 0 ? "default" : "destructive"} className="text-xs">
                      {kpi.trend > 0 ? (
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 ml-1" />
                      )}
                      {Math.abs(kpi.trend)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>الهدف: {kpi.target}</span>
                      <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Department Performance Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                مصفوفة أداء الأقسام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {analyticsData.departmentPerformance.map((dept, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-medium text-sm mb-3">{dept.name}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <ProgressRing progress={dept.efficiency} size={60} strokeWidth={4} color="#3b82f6">
                            <div className="text-center">
                              <div className="text-xs font-bold">{dept.efficiency}%</div>
                            </div>
                          </ProgressRing>
                          <p className="text-xs text-muted-foreground mt-1">الكفاءة</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>الرضا</span>
                            <span>{dept.satisfaction}%</span>
                          </div>
                          <Progress value={dept.satisfaction} className="h-1" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>الإنتاجية</span>
                            <span>{dept.productivity}%</span>
                          </div>
                          <Progress value={dept.productivity} className="h-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الرؤى السريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">تحسن في معدل الرضا</p>
                    <p className="text-xs text-muted-foreground">زيادة 3.2% عن الشهر الماضي</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">انخفاض تكلفة التوظيف</p>
                    <p className="text-xs text-muted-foreground">توفير 15.2% في تكاليف التوظيف</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">يحتاج انتباه</p>
                    <p className="text-xs text-muted-foreground">قسم التسويق يحتاج تحسين الكفاءة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المؤشرات التنبؤية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
                  <p className="text-sm text-muted-foreground">احتمالية تحقيق أهداف الربع</p>
                  <Progress value={78} className="mt-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الاحتفاظ بالمواهب</span>
                    <Badge variant="default">عالي</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">متطلبات التوظيف المتوقعة</span>
                    <span className="text-sm font-medium">12 موظف</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">الميزانية المطلوبة</span>
                    <span className="text-sm font-medium">102,000 ريال</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأداء التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">تحليل الأداء المتقدم</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  عرض تفصيلي لمؤشرات الأداء حسب القسم والموظف
                </p>
                <Button variant="outline">
                  <Eye className="h-4 w-4 ml-2" />
                  عرض التفاصيل
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل التوظيف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">إحصائيات التوظيف</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  تحليل مسار التوظيف ومعدلات النجاح
                </p>
                <Button variant="outline">
                  <Target className="h-4 w-4 ml-2" />
                  عرض التقارير
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مؤشرات مشاركة الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">تحليل المشاركة</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  مستوى مشاركة الموظفين والرضا الوظيفي
                </p>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 ml-2" />
                  جدولة الاستطلاعات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التحليل المالي للموارد البشرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">التكاليف والعائد</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  تحليل تكاليف الموارد البشرية وعائد الاستثمار
                </p>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  عرض التحليل المالي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}