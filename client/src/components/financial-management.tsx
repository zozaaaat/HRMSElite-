import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Calculator, 
  FileText, 
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface FinancialManagementProps {
  companyId: string;
}

export function FinancialManagement({ companyId }: FinancialManagementProps) {
  const [activeTab, setActiveTab] = useState("payroll");

  const { data: payrollData } = useQuery({
    queryKey: ['/api/payroll', companyId],
  });

  const { data: financialStats } = useQuery({
    queryKey: ['/api/financial-stats', companyId],
  });

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              إجمالي المرتبات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +5.2% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              متوسط تكلفة الموظف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,850 ر.س</div>
            <p className="text-xs text-muted-foreground">
              شامل البدلات والمكافآت
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              الزيادات السنوية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5%</div>
            <p className="text-xs text-muted-foreground">
              معدل الزيادات هذا العام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              الموظفون المدفوعون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45/48</div>
            <p className="text-xs text-muted-foreground">
              3 موظفين في انتظار الدفع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="payroll">كشوف المرتبات</TabsTrigger>
          <TabsTrigger value="salary-structure">هيكل المرتبات</TabsTrigger>
          <TabsTrigger value="benefits">المزايا والبدلات</TabsTrigger>
          <TabsTrigger value="tax">الضرائب والخصومات</TabsTrigger>
          <TabsTrigger value="reports">التقارير المالية</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">دورة المرتبات الحالية</h3>
            <div className="flex gap-2">
              <Button>
                <Calculator className="ml-2 h-4 w-4" />
                حساب المرتبات
              </Button>
              <Button variant="outline">
                <FileText className="ml-2 h-4 w-4" />
                تصدير التقرير
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>كشف مرتبات يناير 2025</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  قيد المعالجة
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">125,000</div>
                  <p className="text-sm text-muted-foreground">إجمالي المرتبات</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15,500</div>
                  <p className="text-sm text-muted-foreground">إجمالي البدلات</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-600">8,750</div>
                  <p className="text-sm text-muted-foreground">إجمالي الخصومات</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تقدم المعالجة</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">حالة المدفوعات</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">تم الدفع</span>
                    </div>
                    <span className="font-medium">42 موظف</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">في انتظار الدفع</span>
                    </div>
                    <span className="font-medium">3 موظفين</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">مشاكل في الدفع</span>
                    </div>
                    <span className="font-medium">3 موظفين</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary-structure" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">هيكل المرتبات المتقدم</h3>
            <Button>
              <DollarSign className="ml-2 h-4 w-4" />
              إضافة درجة مالية جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">الدرجات الوظيفية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { level: "المستوى الأول", salary: "3,500 - 4,500", count: 12 },
                  { level: "المستوى الثاني", salary: "4,500 - 6,000", count: 18 },
                  { level: "المستوى الثالث", salary: "6,000 - 8,500", count: 15 },
                  { level: "المستوى الإداري", salary: "8,500 - 12,000", count: 8 },
                  { level: "المستوى القيادي", salary: "12,000+", count: 3 }
                ].map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{grade.level}</p>
                      <p className="text-sm text-muted-foreground">{grade.salary} ر.س</p>
                    </div>
                    <Badge variant="outline">{grade.count} موظف</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">مكونات الراتب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { component: "الراتب الأساسي", percentage: 70, amount: "3,500" },
                  { component: "بدل السكن", percentage: 15, amount: "750" },
                  { component: "بدل المواصلات", percentage: 8, amount: "400" },
                  { component: "بدل الاتصالات", percentage: 4, amount: "200" },
                  { component: "مكافآت الأداء", percentage: 3, amount: "150" }
                ].map((component, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{component.component}</span>
                      <span>{component.amount} ر.س ({component.percentage}%)</span>
                    </div>
                    <Progress value={component.percentage} className="h-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">المزايا والبدلات</h3>
            <Button>إضافة مزية جديدة</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "التأمين الطبي",
                description: "تغطية طبية شاملة للموظف والعائلة",
                cost: "450 ر.س/شهر",
                employees: 45,
                status: "نشط"
              },
              {
                title: "بدل الوقود",
                description: "دعم تكاليف المواصلات والوقود",
                cost: "300 ر.س/شهر",
                employees: 38,
                status: "نشط"
              },
              {
                title: "مكافأة الأداء",
                description: "مكافآت ربع سنوية بناءً على الأداء",
                cost: "متغير",
                employees: 42,
                status: "نشط"
              }
            ].map((benefit, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {benefit.title}
                    <Badge variant={benefit.status === "نشط" ? "default" : "secondary"}>
                      {benefit.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>التكلفة:</span>
                    <span className="font-medium">{benefit.cost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>المستفيدون:</span>
                    <span className="font-medium">{benefit.employees} موظف</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">الضرائب والخصومات</h3>
            <Button>تحديث إعدادات الضرائب</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ضريبة الدخل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">12,750 ر.س</div>
                  <p className="text-sm text-muted-foreground">إجمالي ضريبة الدخل الشهرية</p>
                </div>
                
                <div className="space-y-2">
                  {[
                    { bracket: "0 - 30,000", rate: "0%", employees: 15 },
                    { bracket: "30,001 - 60,000", rate: "5%", employees: 20 },
                    { bracket: "60,001 - 100,000", rate: "10%", employees: 10 },
                    { bracket: "100,001+", rate: "15%", employees: 3 }
                  ].map((bracket, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{bracket.bracket} ر.س</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{bracket.rate}</span>
                        <Badge variant="outline" className="text-xs">{bracket.employees}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">التأمينات الاجتماعية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">8,950 ر.س</div>
                  <p className="text-sm text-muted-foreground">مساهمة الشركة الشهرية</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>مساهمة الموظف (9%)</span>
                    <span>5,625 ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>مساهمة الشركة (12%)</span>
                    <span>7,500 ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>الإجمالي</span>
                    <span>13,125 ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">التقارير المالية</h3>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="ml-2 h-4 w-4" />
                تقرير شهري
              </Button>
              <Button>
                <FileText className="ml-2 h-4 w-4" />
                تقرير سنوي
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "تقرير كشوف المرتبات",
                description: "تفاصيل المرتبات والخصومات",
                lastGenerated: "15 يناير 2025",
                format: "PDF, Excel"
              },
              {
                title: "تقرير التأمينات",
                description: "مساهمات التأمينات الاجتماعية",
                lastGenerated: "10 يناير 2025",
                format: "PDF, XML"
              },
              {
                title: "تقرير الضرائب",
                description: "ضرائب الدخل والاستقطاعات",
                lastGenerated: "12 يناير 2025",
                format: "PDF, Excel"
              }
            ].map((report, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{report.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                  <div className="text-xs">
                    <span className="text-muted-foreground">آخر إنشاء: </span>
                    <span>{report.lastGenerated}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">التنسيق: </span>
                    <span>{report.format}</span>
                  </div>
                  <div className="flex gap-1 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      تحميل
                    </Button>
                    <Button size="sm" className="flex-1 text-xs">
                      إنشاء جديد
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}