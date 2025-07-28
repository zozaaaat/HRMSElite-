import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  BarChart
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState("attendance");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const reportTypes = [
    { id: "attendance", name: "تقرير الحضور والانصراف", icon: Clock },
    { id: "payroll", name: "كشف الرواتب", icon: DollarSign },
    { id: "employees", name: "تقرير الموظفين", icon: Users },
    { id: "leaves", name: "تقرير الإجازات", icon: CalendarIcon },
    { id: "performance", name: "تقرير الأداء", icon: TrendingUp },
    { id: "licenses", name: "تقرير التراخيص", icon: FileText },
  ];

  const handleGenerateReport = () => {
    // هنا سيتم توليد التقرير
    console.log("Generating report:", {
      type: selectedReport,
      dateFrom,
      dateTo,
      company: selectedCompany,
      department: selectedDepartment
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التقارير</h1>
          <p className="text-muted-foreground mt-2">
            إنشاء وتصدير التقارير المختلفة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة التقارير */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>أنواع التقارير</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 p-4">
                {reportTypes.map((report) => (
                  <Button
                    key={report.id}
                    variant={selectedReport === report.id ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <report.icon className="h-4 w-4" />
                    {report.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إعدادات التقرير */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التقرير</CardTitle>
              <CardDescription>
                حدد معايير التقرير المطلوب
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* الفترة الزمنية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* الشركة والقسم */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الشركة</Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الشركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الشركات</SelectItem>
                      <SelectItem value="1">شركة الاتحاد الخليجي</SelectItem>
                      <SelectItem value="2">شركة النيل الأزرق</SelectItem>
                      <SelectItem value="3">شركة قمة النيل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>القسم</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      <SelectItem value="sales">المبيعات</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                      <SelectItem value="finance">المالية</SelectItem>
                      <SelectItem value="it">تقنية المعلومات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleGenerateReport} className="gap-2">
                  <BarChart className="h-4 w-4" />
                  توليد التقرير
                </Button>
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                  <Printer className="h-4 w-4" />
                  طباعة
                </Button>
                <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
                  <FileText className="h-4 w-4" />
                  تصدير PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  تصدير Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* معاينة التقرير */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>معاينة التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] bg-muted/50 rounded-lg p-8 text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>اختر نوع التقرير وحدد المعايير لعرض المعاينة</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}