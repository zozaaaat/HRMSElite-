import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  Filter
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ReportData {
  name: string;
  value: number;
  percentage?: number;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 1),
    to: new Date()
  });
  const [selectedReport, setSelectedReport] = useState<string>("employees");

  const employeeData: ReportData[] = [
    { name: "التقنية", value: 45, percentage: 28 },
    { name: "المبيعات", value: 32, percentage: 20 },
    { name: "المالية", value: 28, percentage: 17 },
    { name: "الموارد البشرية", value: 18, percentage: 11 },
    { name: "التسويق", value: 15, percentage: 9 },
    { name: "أخرى", value: 22, percentage: 15 }
  ];

  const salaryData: ReportData[] = [
    { name: "يناير", value: 850000 },
    { name: "فبراير", value: 920000 },
    { name: "مارس", value: 890000 },
    { name: "أبريل", value: 950000 },
    { name: "مايو", value: 980000 },
    { name: "يونيو", value: 1020000 }
  ];

  const attendanceData: ReportData[] = [
    { name: "الحضور", value: 92, percentage: 92 },
    { name: "الغياب", value: 5, percentage: 5 },
    { name: "التأخير", value: 3, percentage: 3 }
  ];

  const reportTypes = [
    {
      id: "employees",
      title: "تقرير الموظفين",
      description: "إحصائيات شاملة عن الموظفين والأقسام",
      icon: Users,
      color: "#8884d8"
    },
    {
      id: "payroll",
      title: "تقرير الرواتب",
      description: "تحليل الرواتب والتكاليف المالية",
      icon: DollarSign,
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
    },
    {
      id: "training",
      title: "تقرير التدريب",
      description: "إحصائيات التدريب والتطوير",
      icon: BarChart3,
      color: "#8dd1e1"
    },
    {
      id: "recruitment",
      title: "تقرير التوظيف",
      description: "إحصائيات التوظيف والاستقطاب",
      icon: FileText,
      color: "#d084d0"
    }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground mt-2">
            تقارير شاملة وتحليلات متقدمة لجميع جوانب النظام
          </p>
        </div>
        
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
                  : "اختر الفترة"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
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
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1">+2% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground mt-1">+3% عن الشهر الماضي</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">إنشاء التقارير</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="scheduled">التقارير المجدولة</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${report.color}20` }}>
                        <IconComponent className="h-5 w-5" style={{ color: report.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleGenerateReport(report.id)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        عرض
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleExportReport("pdf")}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* توزيع الموظفين حسب القسم */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الموظفين حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={employeeData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {employeeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* اتجاه الرواتب */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاه الرواتب الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} د.ك`, 'الراتب']} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* إحصائيات الحضور */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحضور</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`%${value}`, 'المعدل']} />
                    <Bar dataKey="percentage" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* ملخص الأداء الشهري */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الأداء الشهري</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">موظفو الشهر المتميزون</span>
                  <span className="text-2xl font-bold text-green-600">15</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">الدورات التدريبية المكتملة</span>
                  <span className="text-2xl font-bold text-blue-600">28</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">التوظيفات الجديدة</span>
                  <span className="text-2xl font-bold text-orange-600">7</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">التقارير المجدولة</h3>
                <p className="text-muted-foreground mb-4">
                  قم بجدولة التقارير ليتم إنشاؤها وإرسالها تلقائياً
                </p>
                <Button>إضافة تقرير مجدول</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}