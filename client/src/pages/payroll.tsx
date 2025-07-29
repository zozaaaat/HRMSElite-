import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  DollarSign,
  Calculator,
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Plus,
  Receipt,
  PieChart
} from "lucide-react";

interface PayrollRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  baseSalary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  taxes: number;
  socialInsurance: number;
  netSalary: number;
  status: 'processed' | 'pending' | 'paid';
  paymentDate?: string;
}

interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  averageSalary: number;
  overtimeHours: number;
  totalTaxes: number;
}

export default function PayrollPage() {
  return (
    <SharedLayout 
      userRole="employee" 
      userName="أحمد محمد علي" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <PayrollContent />
    </SharedLayout>
  );
}

function PayrollContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

  // جلب ملخص الرواتب
  const { data: payrollSummary } = useQuery<PayrollSummary>({
    queryKey: ["/api/payroll/summary", selectedMonth, selectedYear],
  });

  // جلب سجلات الرواتب
  const { data: payrollRecords, isLoading } = useQuery<PayrollRecord[]>({
    queryKey: ["/api/payroll/records", selectedMonth, selectedYear],
  });

  // معالجة الرواتب الشهرية
  const processPayrollMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) => 
      apiRequest("/api/payroll/process", "POST", data),
    onSuccess: () => {
      toast({
        title: "تم معالجة الرواتب",
        description: "تم حساب وإعداد كشوف الرواتب لجميع الموظفين",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payroll"] });
      setIsProcessingPayroll(false);
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      processed: { label: "معالج", variant: "secondary" as const, color: "text-blue-600" },
      pending: { label: "قيد المعالجة", variant: "outline" as const, color: "text-orange-600" },
      paid: { label: "مدفوع", variant: "default" as const, color: "text-green-600" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-KW', { 
      style: 'currency', 
      currency: 'KWD',
      minimumFractionDigits: 2 
    }).format(amount);
  };

  const handleProcessPayroll = () => {
    setIsProcessingPayroll(true);
    processPayrollMutation.mutate({
      month: selectedMonth,
      year: selectedYear
    });
  };

  const handleExportPayroll = (format: string) => {
    toast({
      title: `تصدير ${format.toUpperCase()}`,
      description: "تم تصدير كشوف الرواتب بنجاح",
    });
  };

  // بيانات تجريبية للرواتب
  const mockPayrollRecords: PayrollRecord[] = [
    {
      id: "1",
      employeeName: "أحمد محمد علي",
      employeeId: "EMP001",
      baseSalary: 1200,
      allowances: 300,
      overtime: 150,
      deductions: 50,
      taxes: 120,
      socialInsurance: 85,
      netSalary: 1395,
      status: "paid",
      paymentDate: "2025-01-25"
    },
    {
      id: "2",
      employeeName: "فاطمة أحمد سالم",
      employeeId: "EMP002",
      baseSalary: 950,
      allowances: 200,
      overtime: 75,
      deductions: 25,
      taxes: 90,
      socialInsurance: 68,
      netSalary: 1042,
      status: "paid",
      paymentDate: "2025-01-25"
    },
    {
      id: "3",
      employeeName: "محمد عبدالله الحربي",
      employeeId: "EMP003",
      baseSalary: 1500,
      allowances: 400,
      overtime: 200,
      deductions: 75,
      taxes: 155,
      socialInsurance: 105,
      netSalary: 1765,
      status: "processed"
    },
    {
      id: "4",
      employeeName: "سارة عبدالرحمن القحطاني",
      employeeId: "EMP004",
      baseSalary: 800,
      allowances: 150,
      overtime: 50,
      deductions: 20,
      taxes: 70,
      socialInsurance: 58,
      netSalary: 852,
      status: "pending"
    }
  ];

  const mockSummary: PayrollSummary = {
    totalEmployees: 167,
    totalGrossSalary: 180500,
    totalDeductions: 25600,
    totalNetSalary: 154900,
    averageSalary: 1081,
    overtimeHours: 2340,
    totalTaxes: 18200
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">نظام الرواتب</h1>
          <p className="text-muted-foreground mt-2">
            إدارة وحساب رواتب الموظفين الشهرية
          </p>
        </div>
        
        <div className="flex gap-3">
          <Select 
            value={selectedMonth.toString()} 
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-32">
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

          <Select 
            value={selectedYear.toString()} 
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleProcessPayroll}
            disabled={isProcessingPayroll}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            {isProcessingPayroll ? "جاري المعالجة..." : "معالجة الرواتب"}
          </Button>
        </div>
      </div>

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSummary.totalEmployees}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              إجمالي الرواتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(mockSummary.totalGrossSalary)}
            </div>
            <p className="text-xs text-muted-foreground">قبل الخصومات</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4 text-red-600" />
              إجمالي الخصومات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(mockSummary.totalDeductions)}
            </div>
            <p className="text-xs text-muted-foreground">ضرائب وتأمينات</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              صافي الرواتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(mockSummary.totalNetSalary)}
            </div>
            <p className="text-xs text-muted-foreground">بعد الخصومات</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">كشوف الرواتب</TabsTrigger>
          <TabsTrigger value="processing">المعالجة</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>كشوف الرواتب - {selectedMonth}/{selectedYear}</CardTitle>
                  <CardDescription>
                    تفاصيل رواتب جميع الموظفين للشهر المحدد
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleExportPayroll("excel")} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportPayroll("pdf")} className="gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">الراتب الأساسي</TableHead>
                    <TableHead className="text-right">البدلات</TableHead>
                    <TableHead className="text-right">الساعات الإضافية</TableHead>
                    <TableHead className="text-right">الخصومات</TableHead>
                    <TableHead className="text-right">الضرائب</TableHead>
                    <TableHead className="text-right">صافي الراتب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.employeeId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(record.baseSalary)}
                      </TableCell>
                      <TableCell className="font-mono text-green-600">
                        +{formatCurrency(record.allowances)}
                      </TableCell>
                      <TableCell className="font-mono text-blue-600">
                        +{formatCurrency(record.overtime)}
                      </TableCell>
                      <TableCell className="font-mono text-red-600">
                        -{formatCurrency(record.deductions)}
                      </TableCell>
                      <TableCell className="font-mono text-orange-600">
                        -{formatCurrency(record.taxes)}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-lg">
                        {formatCurrency(record.netSalary)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معالجة الرواتب التلقائية</CardTitle>
                <CardDescription>
                  حساب الرواتب بناءً على الحضور والبدلات المعرفة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عدد أيام العمل</Label>
                    <Input type="number" defaultValue="22" />
                  </div>
                  <div className="space-y-2">
                    <Label>ساعات العمل اليومية</Label>
                    <Input type="number" defaultValue="8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>معدل الساعة الإضافية</Label>
                  <Select defaultValue="1.5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.25">125% من الراتب الأساسي</SelectItem>
                      <SelectItem value="1.5">150% من الراتب الأساسي</SelectItem>
                      <SelectItem value="2">200% من الراتب الأساسي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full gap-2">
                  <Calculator className="h-4 w-4" />
                  بدء المعالجة التلقائية
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات الضرائب والخصومات</CardTitle>
                <CardDescription>
                  تكوين معدلات الضرائب والتأمينات الاجتماعية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>معدل ضريبة الدخل (%)</Label>
                  <Input type="number" defaultValue="7.5" step="0.1" />
                </div>

                <div className="space-y-2">
                  <Label>التأمين الاجتماعي (%)</Label>
                  <Input type="number" defaultValue="5.5" step="0.1" />
                </div>

                <div className="space-y-2">
                  <Label>تأمين طبي (%)</Label>
                  <Input type="number" defaultValue="2" step="0.1" />
                </div>

                <Button variant="outline" className="w-full">
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  تقرير توزيع الرواتب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  توزيع الرواتب حسب الأقسام والمناصب
                </p>
                <Button className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  تقرير الساعات الإضافية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  تحليل الساعات الإضافية وتكلفتها
                </p>
                <Button className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-500" />
                  تقرير الضرائب والخصومات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  ملخص الضرائب والتأمينات المخصومة
                </p>
                <Button className="w-full gap-2">
                  <Eye className="h-4 w-4" />
                  عرض التقرير
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات نظام الرواتب</CardTitle>
              <CardDescription>
                تكوين القواعد والمعايير لحساب الرواتب
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">إعدادات الرواتب</h3>
                <p className="text-muted-foreground">
                  تكوين معايير الحساب والبدلات والخصومات
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}