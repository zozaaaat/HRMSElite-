import React, { useState } from "react";
import { SharedLayout } from "../components/shared-layout";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import {
  Download,
  BarChart3,
  PieChart,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Calendar as CalendarIcon,
  Filter
} from "lucide-react";

export default function ReportsPage() {
  return (
    <SharedLayout 
      userRole="employee" 
      userName="موظف" 
      companyName="التقارير والإحصائيات"
    >
      <ReportsContent />
    </SharedLayout>
  );
}

function ReportsContent() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("monthly");
  const [department, setDepartment] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");

  const reportCategories = [
    {
      id: "hr",
      title: "تقرير الموارد البشرية",
      description: "إحصائيات الموظفين والإدارات",
      icon: Users,
      color: "#8884d8"
    },
    {
      id: "financial",
      title: "التقرير المالي",
      description: "تفاصيل الرواتب والمكافآت",
      icon: PieChart,
      color: "#82ca9d"
    },
    {
      id: "attendance",
      title: "تقرير الحضور",
      description: "معدلات الحضور والغياب والتأخير",
      icon: Clock,
      color: "#ffc658"
    },
    {
      id: "performance",
      title: "تقرير الأداء",
      description: "تقييم أداء الموظفين والفرق",
      icon: TrendingUp,
      color: "#ff7300"
    }
  ];

  const handleGenerateReport = (reportId: string) => {
    toast({
      title: "جاري إنشاء التقرير",
      description: "سيتم تحميل التقرير خلال لحظات",
    });
  };

  const handleExportReport = (format: string) => {
    toast({
      title: `تصدير ${format.toUpperCase()}`,
      description: "تم تصدير التقرير بنجاح",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-2">
            تقارير شاملة وتحليلات متقدمة لجميع جوانب النظام
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            اختر الفترة
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">160</div>
            <p className="text-xs text-muted-foreground mt-1">+5% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.02M د.ك</div>
            <p className="text-xs text-muted-foreground mt-1">+4% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.2%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">تقييم الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.4/10</div>
            <p className="text-xs text-muted-foreground mt-1">+0.3 عن الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر التقارير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر التقارير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">يومي</SelectItem>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">القسم</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  <SelectItem value="hr">الموارد البشرية</SelectItem>
                  <SelectItem value="finance">المالية</SelectItem>
                  <SelectItem value="operations">العمليات</SelectItem>
                  <SelectItem value="sales">المبيعات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">هذا الشهر</SelectItem>
                  <SelectItem value="last-month">الشهر الماضي</SelectItem>
                  <SelectItem value="this-quarter">هذا الربع</SelectItem>
                  <SelectItem value="this-year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تصنيفات التقارير */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <category.icon className="h-8 w-8" style={{ color: category.color }} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateReport(category.id)}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  إنشاء
                </Button>
              </div>
              <CardTitle className="text-base">{category.title}</CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* أزرار التصدير */}
      <Card>
        <CardHeader>
          <CardTitle>تصدير التقارير</CardTitle>
          <CardDescription>
            اختر تنسيق التصدير المطلوب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('pdf')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('excel')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExportReport('csv')}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}