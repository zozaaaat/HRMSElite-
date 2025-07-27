import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator,
  PieChart,
  FileText,
  Download,
  Upload,
  CreditCard,
  Banknote,
  Receipt,
  Target,
  AlertTriangle
} from "lucide-react";

interface FinancialManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinancialManagement({ isOpen, onClose }: FinancialManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialMetrics = [
    {
      title: 'إجمالي المرتبات',
      value: '3.2M ريال',
      change: '+5.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'المزايا والبدلات',
      value: '480K ريال',
      change: '+2.1%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'الضرائب المستحقة',
      value: '125K ريال',
      change: '-1.5%',
      trend: 'down',
      icon: Receipt,
      color: 'text-orange-600'
    },
    {
      title: 'توفير متوقع',
      value: '95K ريال',
      change: '+12%',
      trend: 'up',
      icon: Target,
      color: 'text-purple-600'
    }
  ];

  const payrollData = [
    {
      employeeId: '1',
      name: 'أحمد محمد',
      baseSalary: 15000,
      allowances: 2500,
      deductions: 750,
      netSalary: 16750,
      department: 'التقنية',
      status: 'processed'
    },
    {
      employeeId: '2',
      name: 'سارة أحمد',
      baseSalary: 12000,
      allowances: 1800,
      deductions: 600,
      netSalary: 13200,
      department: 'الموارد البشرية',
      status: 'pending'
    },
    {
      employeeId: '3',
      name: 'محمد علي',
      baseSalary: 18000,
      allowances: 3200,
      deductions: 900,
      netSalary: 20300,
      department: 'المبيعات',
      status: 'processed'
    }
  ];

  const budgetCategories = [
    {
      category: 'الرواتب الأساسية',
      allocated: 2800000,
      spent: 2650000,
      percentage: 94.6,
      status: 'on-track'
    },
    {
      category: 'البدلات والمزايا',
      allocated: 600000,
      spent: 480000,
      percentage: 80,
      status: 'under-budget'
    },
    {
      category: 'التدريب والتطوير',
      allocated: 150000,
      spent: 165000,
      percentage: 110,
      status: 'over-budget'
    },
    {
      category: 'التأمين الطبي',
      allocated: 300000,
      spent: 275000,
      percentage: 91.7,
      status: 'on-track'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600';
      case 'under-budget': return 'text-blue-600';
      case 'over-budget': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            نظام الإدارة المالية المتقدم
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="payroll">المرتبات</TabsTrigger>
            <TabsTrigger value="budget">الميزانية</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                            {metric.trend === 'up' ? (
                              <TrendingUp className="h-3 w-3 ml-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 ml-1" />
                            )}
                            {metric.change}
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-muted ${metric.color}`}>
                        <metric.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>العمليات السريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center gap-2">
                    <Calculator className="h-6 w-6" />
                    <span className="text-sm">حساب المرتبات</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">إنشاء تقرير</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">رفع بيانات</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Download className="h-6 w-6" />
                    <span className="text-sm">تصدير البيانات</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">إدارة المرتبات</h3>
              <Button>
                <Calculator className="h-4 w-4 ml-2" />
                معالجة المرتبات
              </Button>
            </div>

            {/* Payroll Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Banknote className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">450</div>
                  <div className="text-sm text-muted-foreground">إجمالي الموظفين</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">425</div>
                  <div className="text-sm text-muted-foreground">مرتبات مُعالجة</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">25</div>
                  <div className="text-sm text-muted-foreground">في الانتظار</div>
                </CardContent>
              </Card>
            </div>

            {/* Payroll Table */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المرتبات - يناير 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2">الموظف</th>
                        <th className="text-right p-2">القسم</th>
                        <th className="text-right p-2">الراتب الأساسي</th>
                        <th className="text-right p-2">البدلات</th>
                        <th className="text-right p-2">الخصومات</th>
                        <th className="text-right p-2">الصافي</th>
                        <th className="text-right p-2">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.map((employee) => (
                        <tr key={employee.employeeId} className="border-b">
                          <td className="p-2 font-medium">{employee.name}</td>
                          <td className="p-2 text-muted-foreground">{employee.department}</td>
                          <td className="p-2">{employee.baseSalary.toLocaleString()} ريال</td>
                          <td className="p-2 text-green-600">+{employee.allowances.toLocaleString()}</td>
                          <td className="p-2 text-red-600">-{employee.deductions.toLocaleString()}</td>
                          <td className="p-2 font-bold">{employee.netSalary.toLocaleString()} ريال</td>
                          <td className="p-2">
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status === 'processed' ? 'مُعالج' : 'في الانتظار'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">إدارة الميزانية</h3>
              <Button>
                <PieChart className="h-4 w-4 ml-2" />
                تحديث الميزانية
              </Button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تخصيص الميزانية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className={`text-sm font-bold ${getBudgetStatusColor(category.status)}`}>
                            {category.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>مصروف: {(category.spent / 1000).toFixed(0)}K ريال</span>
                          <span>مخصص: {(category.allocated / 1000).toFixed(0)}K ريال</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التحليل المالي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">الوضع المالي العام</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          ممتاز
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        الشركة تحقق أداءً مالياً قوياً مع توفير 5.2% من الميزانية المخصصة
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">التوقعات القادمة</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        متوقع زيادة 8% في التكاليف للربع القادم بسبب التوسع
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">فرص التحسين</span>
                        <Target className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        يمكن تحسين كفاءة التكاليف بنسبة 12% من خلال الأتمتة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">التقارير المالية</h3>
              <Button>
                <FileText className="h-4 w-4 ml-2" />
                إنشاء تقرير جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>التقارير المتاحة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 ml-2" />
                      تقرير المرتبات الشهري
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="h-4 w-4 ml-2" />
                      تحليل الميزانية السنوي
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Receipt className="h-4 w-4 ml-2" />
                      تقرير الضرائب الربعي
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 ml-2" />
                      تحليل الاتجاهات المالية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإحصائيات السريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">متوسط الراتب الشهري</span>
                      <span className="text-sm font-bold">9,750 ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">إجمالي التكاليف السنوية</span>
                      <span className="text-sm font-bold">52.6M ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">معدل نمو التكاليف</span>
                      <span className="text-sm font-bold text-green-600">+5.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">التوفير المحقق</span>
                      <span className="text-sm font-bold text-blue-600">2.8M ريال</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}