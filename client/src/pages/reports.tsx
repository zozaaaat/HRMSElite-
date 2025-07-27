import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  FileText,
  Download,
  Printer,
  Share2,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("monthly");

  // Mock reports data
  const reportTypes = [
    {
      id: "attendance",
      name: "تقرير الحضور والانصراف",
      description: "تقرير شامل عن حضور الموظفين والإجازات",
      icon: Clock,
      color: "blue",
      lastGenerated: "2024-01-25",
      status: "ready"
    },
    {
      id: "payroll",
      name: "تقرير المرتبات",
      description: "تفاصيل المرتبات والمكافآت والخصومات",
      icon: DollarSign,
      color: "green",
      lastGenerated: "2024-01-24",
      status: "ready"
    },
    {
      id: "performance",
      name: "تقرير الأداء",
      description: "تقييم أداء الموظفين والأقسام",
      icon: Target,
      color: "purple",
      lastGenerated: "2024-01-23",
      status: "processing"
    },
    {
      id: "recruitment",
      name: "تقرير التوظيف",
      description: "إحصائيات التوظيف والمتقدمين",
      icon: Users,
      color: "orange",
      lastGenerated: "2024-01-22",
      status: "ready"
    },
    {
      id: "training",
      name: "تقرير التدريب",
      description: "تقدم التدريب والشهادات المكتسبة",
      icon: Award,
      color: "indigo",
      lastGenerated: "2024-01-21",
      status: "ready"
    },
    {
      id: "compliance",
      name: "تقرير الامتثال",
      description: "حالة التراخيص والامتثال القانوني",
      icon: CheckCircle,
      color: "teal",
      lastGenerated: "2024-01-20",
      status: "error"
    }
  ];

  const quickStats = {
    totalReports: 127,
    pendingReports: 8,
    scheduledReports: 15,
    downloadedToday: 23
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return "جاهز";
      case "processing": return "قيد المعالجة";
      case "error": return "خطأ";
      default: return "غير محدد";
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-700",
      green: "from-green-50 to-green-100 border-green-200 text-green-700",
      purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-700",
      orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-700",
      indigo: "from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700",
      teal: "from-teal-50 to-teal-100 border-teal-200 text-teal-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-2">تقارير شاملة وتحليلات متقدمة لجميع جوانب الموارد البشرية</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange ? format(dateRange, "PPP", { locale: ar }) : "اختر التاريخ"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            إنشاء تقرير مخصص
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي التقارير</p>
                <p className="text-3xl font-bold text-blue-700">{quickStats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">قيد المعالجة</p>
                <p className="text-3xl font-bold text-yellow-700">{quickStats.pendingReports}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">تقارير مجدولة</p>
                <p className="text-3xl font-bold text-green-700">{quickStats.scheduledReports}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">تحميلات اليوم</p>
                <p className="text-3xl font-bold text-purple-700">{quickStats.downloadedToday}</p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="standard">التقارير القياسية</TabsTrigger>
          <TabsTrigger value="custom">التقارير المخصصة</TabsTrigger>
          <TabsTrigger value="scheduled">التقارير المجدولة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                التقارير الحديثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTypes.slice(0, 4).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(report.color)}`}>
                        <report.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          آخر إنشاء: {new Date(report.lastGenerated).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusText(report.status)}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات التحميل الشهرية</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">رسم بياني للتحميلات</h3>
                <p className="text-sm text-muted-foreground">
                  عرض إحصائيات التحميل على مدار الأشهر الماضية
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أشهر التقارير</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-medium mb-2">مخطط دائري</h3>
                <p className="text-sm text-muted-foreground">
                  توزيع التقارير الأكثر استخداماً
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="standard" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">التقارير القياسية</h3>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="quarterly">ربع سنوي</SelectItem>
                <SelectItem value="yearly">سنوي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => (
              <Card key={report.id} className={`border-2 bg-gradient-to-br ${getColorClasses(report.color)} hover:shadow-lg transition-shadow cursor-pointer`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <report.icon className="h-8 w-8" />
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{report.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm opacity-90">{report.description}</p>
                  
                  <div className="flex items-center justify-between text-xs opacity-75">
                    <span>آخر تحديث:</span>
                    <span>{new Date(report.lastGenerated).toLocaleDateString('ar-SA')}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      disabled={report.status !== "ready"}
                    >
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء تقرير مخصص</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">منشئ التقارير المخصصة</h3>
              <p className="text-sm text-muted-foreground mb-6">
                قم بإنشاء تقارير مخصصة حسب احتياجاتك المحددة
              </p>
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                بدء إنشاء تقرير مخصص
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>التقارير المجدولة</CardTitle>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  إضافة جدولة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">تقرير الحضور الأسبوعي</h4>
                      <p className="text-sm text-muted-foreground">كل يوم أحد الساعة 9:00 صباحاً</p>
                      <p className="text-xs text-muted-foreground">التالي: الأحد 28 يناير 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    <Button variant="ghost" size="sm">تعديل</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">تقرير المرتبات الشهري</h4>
                      <p className="text-sm text-muted-foreground">نهاية كل شهر</p>
                      <p className="text-xs text-muted-foreground">التالي: 31 يناير 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    <Button variant="ghost" size="sm">تعديل</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}