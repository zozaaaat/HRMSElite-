import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  PieChart,
  BarChart3,
  Receipt,
  Calendar,
  Download,
  Upload,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface FinancialManagementProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function FinancialManagement({ isOpen, onClose, companyId }: FinancialManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Mock financial data
  const financialStats = {
    totalPayroll: 2850000,
    monthlyPayroll: 285000,
    averageSalary: 12500,
    totalEmployees: 450,
    payrollGrowth: 8.5,
    taxLiability: 85500,
    socialInsurance: 42750,
    benefits: 57000,
    bonuses: 95000
  };

  const salaryComponents = [
    { name: "الراتب الأساسي", percentage: 65, amount: 185250 },
    { name: "بدل السكن", percentage: 15, amount: 42750 },
    { name: "بدل النقل", percentage: 8, amount: 22800 },
    { name: "مكافآت الأداء", percentage: 7, amount: 19950 },
    { name: "بدلات أخرى", percentage: 5, amount: 14250 }
  ];

  const taxBreakdown = [
    { type: "ضريبة الدخل", rate: 15, amount: 42750 },
    { type: "التأمينات الاجتماعية", rate: 9, amount: 25650 },
    { type: "تأمين طبي", rate: 4, amount: 11400 },
    { type: "صندوق التقاعد", rate: 2, amount: 5700 }
  ];

  const payrollHistory = [
    { month: "يناير 2025", total: 285000, employees: 450, avgSalary: 12500, status: "مدفوع" },
    { month: "ديسمبر 2024", total: 280000, employees: 448, avgSalary: 12400, status: "مدفوع" },
    { month: "نوفمبر 2024", total: 275000, employees: 445, avgSalary: 12300, status: "مدفوع" },
    { month: "أكتوبر 2024", total: 270000, employees: 442, avgSalary: 12200, status: "مدفوع" },
    { month: "سبتمبر 2024", total: 265000, employees: 440, avgSalary: 12100, status: "مدفوع" }
  ];

  const upcomingPayments = [
    { type: "راتب شهر يناير", amount: 285000, dueDate: "2025-01-31", status: "قيد المعالجة" },
    { type: "ضرائب الربع الأول", amount: 85500, dueDate: "2025-02-15", status: "مجدول" },
    { type: "تأمينات اجتماعية", amount: 42750, dueDate: "2025-02-10", status: "مجدول" },
    { type: "مكافآت الأداء", amount: 95000, dueDate: "2025-02-28", status: "مجدول" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوع': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'قيد المعالجة': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'مجدول': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'متأخر': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            الإدارة المالية المتقدمة
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="payroll">كشوف المرتبات</TabsTrigger>
            <TabsTrigger value="taxes">الضرائب</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Wallet className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{financialStats.monthlyPayroll.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">رواتب شهرية</div>
                  <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="text-xs">+{financialStats.payrollGrowth}%</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{financialStats.totalEmployees}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الموظفين</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    متوسط الراتب: {financialStats.averageSalary.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Receipt className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{financialStats.taxLiability.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">التزامات ضريبية</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    شهري: {(financialStats.taxLiability / 12).toFixed(0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{financialStats.bonuses.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">مكافآت شهرية</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((financialStats.bonuses / financialStats.monthlyPayroll) * 100).toFixed(1)}% من الراتب
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Salary Components Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>تفصيل مكونات الرواتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salaryComponents.map((component, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{component.name}</span>
                          <span className="text-sm text-muted-foreground">{component.percentage}%</span>
                        </div>
                        <Progress value={component.percentage} className="h-2" />
                      </div>
                      <div className="text-right ml-4 min-w-[80px]">
                        <div className="font-semibold">{component.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">ريال</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>المدفوعات القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{payment.type}</div>
                          <div className="text-sm text-muted-foreground">موعد الاستحقاق: {payment.dueDate}</div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="font-semibold">{payment.amount.toLocaleString()} ريال</div>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">إدارة كشوف المرتبات</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 ml-2" />
                  رفع كشف راتب
                </Button>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء كشف جديد
                </Button>
              </div>
            </div>

            {/* Payroll History */}
            <Card>
              <CardHeader>
                <CardTitle>سجل كشوف المرتبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{record.month}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.employees} موظف • متوسط الراتب: {record.avgSalary.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="font-semibold">{record.total.toLocaleString()} ريال</div>
                        </div>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 ml-1" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Calculation Tool */}
            <Card>
              <CardHeader>
                <CardTitle>حاسبة الراتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="baseSalary">الراتب الأساسي</Label>
                      <Input id="baseSalary" placeholder="15000" />
                    </div>
                    <div>
                      <Label htmlFor="housingAllowance">بدل السكن</Label>
                      <Input id="housingAllowance" placeholder="3000" />
                    </div>
                    <div>
                      <Label htmlFor="transportAllowance">بدل النقل</Label>
                      <Input id="transportAllowance" placeholder="1500" />
                    </div>
                    <div>
                      <Label htmlFor="performanceBonus">مكافأة الأداء</Label>
                      <Input id="performanceBonus" placeholder="2000" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3">حساب الراتب النهائي</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>إجمالي الراتب:</span>
                          <span className="font-medium">21,500 ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الخصومات:</span>
                          <span className="font-medium text-red-600">-2,150 ريال</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>الراتب الصافي:</span>
                          <span className="text-green-600">19,350 ريال</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Calculator className="h-4 w-4 ml-2" />
                      حساب الراتب
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تفصيل الضرائب والخصومات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {taxBreakdown.map((tax, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{tax.type}</span>
                          <span className="text-sm text-muted-foreground">{tax.rate}%</span>
                        </div>
                        <Progress value={tax.rate * 5} className="h-2" />
                      </div>
                      <div className="text-right ml-4 min-w-[100px]">
                        <div className="font-semibold">{tax.amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">ريال شهرياً</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التقويم الضريبي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">تقرير ضريبة الربع الأول</div>
                        <div className="text-sm text-muted-foreground">موعد التسليم: 15 فبراير 2025</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">15 يوم باقي</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <FileText className="h-3 w-3 ml-1" />
                        إعداد التقرير
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">ضريبة القيمة المضافة - ديسمبر</div>
                        <div className="text-sm text-muted-foreground">تم التسليم في الموعد المحدد</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">مكتمل</div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="h-3 w-3 ml-1" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">التقارير المالية</h3>
              <div className="flex gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <BarChart3 className="h-4 w-4 ml-2" />
                  إنشاء تقرير
                </Button>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <PieChart className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">تقرير توزيع الرواتب</h4>
                  <p className="text-sm text-muted-foreground mb-4">تحليل مفصل لتوزيع الرواتب حسب الأقسام والوظائف</p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">تقرير النمو المالي</h4>
                  <p className="text-sm text-muted-foreground mb-4">تحليل نمو الرواتب والتكاليف عبر الوقت</p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Receipt className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">تقرير الضرائب</h4>
                  <p className="text-sm text-muted-foreground mb-4">ملخص شامل للالتزامات الضريبية والخصومات</p>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 ml-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الرواتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payrollCycle">دورة الرواتب</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر دورة الرواتب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">شهري</SelectItem>
                            <SelectItem value="biweekly">كل أسبوعين</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payDay">يوم دفع الرواتب</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر يوم الدفع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="last">آخر يوم في الشهر</SelectItem>
                            <SelectItem value="25">يوم 25</SelectItem>
                            <SelectItem value="30">يوم 30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currency">العملة</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العملة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sar">الريال السعودي (SAR)</SelectItem>
                            <SelectItem value="usd">الدولار الأمريكي (USD)</SelectItem>
                            <SelectItem value="eur">اليورو (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="taxRate">معدل الضريبة الافتراضي</Label>
                        <Input id="taxRate" placeholder="15%" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات التكامل المصرفي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">البنك الأهلي السعودي</div>
                        <div className="text-sm text-muted-foreground">حساب الرواتب الرئيسي</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">متصل</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">بنك الراجحي</div>
                        <div className="text-sm text-muted-foreground">حساب احتياطي</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">ربط الحساب</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}