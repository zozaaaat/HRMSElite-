import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  FileText, 
  Download, 
  Eye,
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  overtime: number;
  netSalary: number;
  status: string;
  month: string;
  year: number;
}

interface SalaryDetails {
  basic: number;
  housing: number;
  transport: number;
  food: number;
  other: number;
  overtime: number;
  tax: number;
  insurance: number;
  loans: number;
  absences: number;
}

export default function PayrollPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<PayrollRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // جلب سجلات الرواتب
  const { data: payrollRecords = [] } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll", selectedMonth, selectedYear],
  });

  // حساب الإحصائيات
  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const totalEmployees = payrollRecords.length;
  const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);

  const handleProcessPayroll = () => {
    toast({
      title: "تتم معالجة الرواتب",
      description: "جاري معالجة رواتب الشهر الحالي...",
    });
  };

  const handleExportPayslips = () => {
    toast({
      title: "تصدير كشوف الرواتب",
      description: "جاري تجهيز ملفات كشوف الرواتب للتحميل",
    });
  };

  const getSalaryDetails = (record: PayrollRecord): SalaryDetails => {
    return {
      basic: record.basicSalary,
      housing: record.basicSalary * 0.25,
      transport: 500,
      food: 300,
      other: 200,
      overtime: record.overtime,
      tax: record.basicSalary * 0.05,
      insurance: record.basicSalary * 0.09,
      loans: 0,
      absences: 0
    };
  };

  const mockPayrollData: PayrollRecord[] = [
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "أحمد محمد علي",
      position: "مدير تنفيذي",
      basicSalary: 15000,
      allowances: 5000,
      deductions: 2850,
      overtime: 1200,
      netSalary: 18350,
      status: "paid",
      month: selectedMonth.toString(),
      year: selectedYear
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "فاطمة أحمد سالم",
      position: "محاسب أول",
      basicSalary: 8000,
      allowances: 2500,
      deductions: 1420,
      overtime: 0,
      netSalary: 9080,
      status: "pending",
      month: selectedMonth.toString(),
      year: selectedYear
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "محمد عبدالله الحربي",
      position: "مطور برمجيات",
      basicSalary: 10000,
      allowances: 3000,
      deductions: 1790,
      overtime: 800,
      netSalary: 12010,
      status: "paid",
      month: selectedMonth.toString(),
      year: selectedYear
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      paid: { label: "مدفوع", variant: "default" },
      pending: { label: "قيد المعالجة", variant: "secondary" },
      failed: { label: "فشل", variant: "destructive" },
      cancelled: { label: "ملغي", variant: "outline" }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الرواتب</h1>
          <p className="text-muted-foreground mt-2">
            معالجة وإدارة رواتب الموظفين
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={handleProcessPayroll} className="gap-2">
            <Calculator className="h-4 w-4" />
            معالجة الرواتب
          </Button>
          <Button variant="outline" onClick={handleExportPayslips} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير الكشوف
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayroll.toLocaleString('ar-SA')} د.ك</div>
            <p className="text-xs text-muted-foreground mt-1">لشهر {selectedMonth}/{selectedYear}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">عدد الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">{mockPayrollData.filter(r => r.status === 'paid').length} مدفوع</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">متوسط الراتب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageSalary.toLocaleString('ar-SA')} د.ك</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">+5% عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">إجمالي الخصومات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeductions.toLocaleString('ar-SA')} د.ك</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-muted-foreground">ضرائب وتأمينات</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اختيار الشهر والسنة */}
      <Card>
        <CardHeader>
          <CardTitle>فترة الرواتب</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">يناير</SelectItem>
              <SelectItem value="2">فبراير</SelectItem>
              <SelectItem value="3">مارس</SelectItem>
              <SelectItem value="4">أبريل</SelectItem>
              <SelectItem value="5">مايو</SelectItem>
              <SelectItem value="6">يونيو</SelectItem>
              <SelectItem value="7">يوليو</SelectItem>
              <SelectItem value="8">أغسطس</SelectItem>
              <SelectItem value="9">سبتمبر</SelectItem>
              <SelectItem value="10">أكتوبر</SelectItem>
              <SelectItem value="11">نوفمبر</SelectItem>
              <SelectItem value="12">ديسمبر</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* جدول الرواتب */}
      <Card>
        <CardHeader>
          <CardTitle>كشف الرواتب</CardTitle>
          <CardDescription>
            تفاصيل رواتب الموظفين لشهر {selectedMonth}/{selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">الراتب الأساسي</TableHead>
                <TableHead className="text-right">البدلات</TableHead>
                <TableHead className="text-right">الخصومات</TableHead>
                <TableHead className="text-right">الإضافي</TableHead>
                <TableHead className="text-right">الصافي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayrollData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{record.position}</TableCell>
                  <TableCell>{record.basicSalary.toLocaleString('ar-SA')}</TableCell>
                  <TableCell className="text-green-600">+{record.allowances.toLocaleString('ar-SA')}</TableCell>
                  <TableCell className="text-red-600">-{record.deductions.toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{record.overtime > 0 ? `+${record.overtime.toLocaleString('ar-SA')}` : '-'}</TableCell>
                  <TableCell className="font-bold">{record.netSalary.toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEmployee(record);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الراتب */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل راتب {selectedEmployee?.employeeName}</DialogTitle>
            <DialogDescription>
              كشف تفصيلي لمكونات الراتب
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">الاستحقاقات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الراتب الأساسي</span>
                      <span>{selectedEmployee.basicSalary.toLocaleString('ar-SA')} د.ك</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدل السكن</span>
                      <span>{(selectedEmployee.basicSalary * 0.25).toLocaleString('ar-SA')} د.ك</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدل المواصلات</span>
                      <span>500 د.ك</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدل الطعام</span>
                      <span>300 د.ك</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدلات أخرى</span>
                      <span>200 د.ك</span>
                    </div>
                    {selectedEmployee.overtime > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>ساعات إضافية</span>
                        <span>{selectedEmployee.overtime.toLocaleString('ar-SA')} د.ك</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">الخصومات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-red-600">
                      <span>ضريبة الدخل (5%)</span>
                      <span>{(selectedEmployee.basicSalary * 0.05).toLocaleString('ar-SA')} د.ك</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>التأمينات الاجتماعية (9%)</span>
                      <span>{(selectedEmployee.basicSalary * 0.09).toLocaleString('ar-SA')} د.ك</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>قروض</span>
                      <span>0 د.ك</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>خصم غياب</span>
                      <span>0 د.ك</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>صافي الراتب</span>
                  <span className="text-green-600">{selectedEmployee.netSalary.toLocaleString('ar-SA')} د.ك</span>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  إغلاق
                </Button>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  طباعة الكشف
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}