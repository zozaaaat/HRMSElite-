import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  UserCheck,
  Settings,
  Bell,
  BarChart3,
  PieChart,
  Target,
  Award,
  Briefcase,
  Phone,
  MessageSquare,
  Shield,
  Eye,
  Plus,
  Download,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface RoleBasedDashboardProps {
  userRole: 'super-admin' | 'company-manager' | 'admin-employee' | 'supervisor' | 'worker';
  companyId?: string;
  userId?: string;
}

// لوحة المسؤول العام
function SuperAdminDashboard() {
  const { data: companies = [] } = useQuery({ queryKey: ["/api/companies"] });
  const { data: totalEmployees = [] } = useQuery({ queryKey: ["/api/employees"] });
  const { data: systemStats } = useQuery({ queryKey: ["/api/system/stats"] });

  const companiesArray = Array.isArray(companies) ? companies : [];
  const activeCompanies = companiesArray.filter((c: any) => c.status === 'active').length;
  const totalEmployeesArray = Array.isArray(totalEmployees) ? totalEmployees : [];
  const totalUsers = totalEmployeesArray.length;

  return (
    <div className="space-y-6">
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الشركات</p>
                <p className="text-3xl font-bold">{companiesArray.length}</p>
                <p className="text-xs text-green-600">+{Math.floor(companiesArray.length * 0.1)} هذا الشهر</p>
              </div>
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الشركات النشطة</p>
                <p className="text-3xl font-bold">{activeCompanies}</p>
                <p className="text-xs text-green-600">{companiesArray.length > 0 ? ((activeCompanies/companiesArray.length)*100).toFixed(1) : 0}% من الإجمالي</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
                <p className="text-xs text-blue-600">عبر جميع الشركات</p>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">استخدام النظام</p>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-xs text-green-600">أداء ممتاز</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الشركات الحديثة والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              أحدث الشركات المسجلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.slice(0, 5).map((company: any) => (
                <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{company.name || company.commercialFileName}</h4>
                    <p className="text-sm text-muted-foreground">{company.industryType}</p>
                  </div>
                  <Badge variant="outline">
                    {company.employeeCount || 0} موظف
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              التنبيهات الهامة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">تراخيص منتهية الصلاحية</p>
                  <p className="text-sm text-muted-foreground">3 تراخيص تحتاج تجديد</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">تحديث النظام</p>
                  <p className="text-sm text-muted-foreground">إصدار جديد متاح</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// لوحة مدير الشركة
function CompanyManagerDashboard({ companyId }: { companyId: string }) {
  const { data: company } = useQuery({ queryKey: ["/api/companies", companyId] });
  const { data: employees = [] } = useQuery({ queryKey: ["/api/companies", companyId, "employees"] });
  const { data: attendance = [] } = useQuery({ queryKey: ["/api/attendance", companyId] });
  const { data: leaves = [] } = useQuery({ queryKey: ["/api/leaves", companyId] });

  const employeesArray = Array.isArray(employees) ? employees : [];
  const attendanceArray = Array.isArray(attendance) ? attendance : [];
  const leavesArray = Array.isArray(leaves) ? leaves : [];

  const activeEmployees = employeesArray.filter((e: any) => e.status === 'active').length;
  const todayAttendance = attendanceArray.filter((a: any) => 
    format(new Date(a.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;
  const pendingLeaves = leavesArray.filter((l: any) => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* نظرة عامة على الشركة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {(company as any)?.name || (company as any)?.commercialFileName || "اسم الشركة"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{employeesArray.length}</p>
              <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{activeEmployees}</p>
              <p className="text-sm text-muted-foreground">الموظفون النشطون</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{todayAttendance}</p>
              <p className="text-sm text-muted-foreground">حضور اليوم</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{pendingLeaves}</p>
              <p className="text-sm text-muted-foreground">طلبات إجازة معلقة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* المهام السريعة */}
      <Card>
        <CardHeader>
          <CardTitle>المهام السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Plus className="h-6 w-6" />
              إضافة موظف
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              إدارة الإجازات
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              التقارير
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* الأقسام والأداء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الموظفين حسب القسم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['الموارد البشرية', 'تقنية المعلومات', 'المحاسبة', 'المبيعات'].map(dept => {
                const deptEmployees = employees.filter((e: any) => e.department === dept).length;
                const percentage = employees.length > 0 ? (deptEmployees / employees.length) * 100 : 0;
                
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{dept}</span>
                      <span className="text-sm text-muted-foreground">{deptEmployees} موظف</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أحدث الأنشطة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'إضافة موظف جديد', employee: 'أحمد محمد', time: '2 ساعات' },
                { action: 'موافقة على إجازة', employee: 'فاطمة علي', time: '4 ساعات' },
                { action: 'تحديث بيانات', employee: 'محمد سالم', time: '1 يوم' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.employee}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// لوحة المشرف
function SupervisorDashboard({ userId }: { userId: string }) {
  const { data: supervisedEmployees = [] } = useQuery({ 
    queryKey: ["/api/employees", "supervised", userId] 
  });
  const { data: todayAttendance = [] } = useQuery({ 
    queryKey: ["/api/attendance", "today", { supervisorId: userId }] 
  });

  return (
    <div className="space-y-6">
      {/* إحصائيات المشرف */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الموظفون تحت الإشراف</p>
                <p className="text-3xl font-bold">{supervisedEmployees.length}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">حضور اليوم</p>
                <p className="text-3xl font-bold">{todayAttendance.length}</p>
              </div>
              <Clock className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الأداء</p>
                <p className="text-3xl font-bold">87%</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المهام اليومية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            المهام اليومية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { task: 'مراجعة حضور الفريق', completed: true },
              { task: 'تقييم أداء الموظفين', completed: false },
              { task: 'إعداد تقرير يومي', completed: false },
              { task: 'متابعة المشاريع الجارية', completed: true },
            ].map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className={`h-5 w-5 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.task}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* فريق العمل */}
      <Card>
        <CardHeader>
          <CardTitle>فريق العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supervisedEmployees.slice(0, 6).map((employee: any) => (
              <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{employee.fullName}</h4>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// لوحة العامل
function WorkerDashboard({ userId }: { userId: string }) {
  const { data: employee } = useQuery({ queryKey: ["/api/employees", userId] });
  const { data: myAttendance = [] } = useQuery({ 
    queryKey: ["/api/attendance", "employee", userId] 
  });
  const { data: myLeaves = [] } = useQuery({ 
    queryKey: ["/api/leaves", "employee", userId] 
  });

  const attendanceArray = Array.isArray(myAttendance) ? myAttendance : [];
  const thisMonthAttendance = attendanceArray.filter((a: any) => {
    const attendanceDate = new Date(a.date);
    const now = new Date();
    return attendanceDate.getMonth() === now.getMonth() && attendanceDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* معلومات شخصية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            مرحباً، {(employee as any)?.fullName || "الموظف"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">{employee?.position}</p>
              <p className="text-sm text-muted-foreground">المنصب</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">{employee?.department}</p>
              <p className="text-sm text-muted-foreground">القسم</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="font-medium">{thisMonthAttendance} يوم</p>
              <p className="text-sm text-muted-foreground">حضور هذا الشهر</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2">
              <Clock className="h-6 w-6" />
              تسجيل حضور
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              طلب إجازة
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              كشف الراتب
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Eye className="h-6 w-6" />
              بياناتي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* الحضور والإجازات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>سجل الحضور الأخير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAttendance.slice(-5).map((attendance: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{format(new Date(attendance.date), "PPP", { locale: ar })}</p>
                    <p className="text-sm text-muted-foreground">
                      {attendance.checkIn} - {attendance.checkOut || 'لم يسجل خروج'}
                    </p>
                  </div>
                  <Badge variant={attendance.checkOut ? 'default' : 'secondary'}>
                    {attendance.checkOut ? 'مكتمل' : 'جاري'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>رصيد الإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>الإجازة السنوية</span>
                  <span className="font-bold">21 يوم متبقي</span>
                </div>
                <Progress value={70} className="mt-2" />
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>الإجازة المرضية</span>
                  <span className="font-bold">15 يوم متبقي</span>
                </div>
                <Progress value={50} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RoleBasedDashboard({ userRole, companyId, userId }: RoleBasedDashboardProps) {
  switch (userRole) {
    case 'super-admin':
      return <SuperAdminDashboard />;
    case 'company-manager':
      return <CompanyManagerDashboard companyId={companyId || ''} />;
    case 'supervisor':
      return <SupervisorDashboard userId={userId || ''} />;
    case 'worker':
      return <WorkerDashboard userId={userId || ''} />;
    default:
      return <CompanyManagerDashboard companyId={companyId || ''} />;
  }
}