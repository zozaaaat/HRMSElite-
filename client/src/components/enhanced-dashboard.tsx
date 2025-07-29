import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalCompanies: number;
  totalEmployees: number;
  activeCompanies: number;
  pendingApprovals: number;
  monthlyGrowth?: number;
  systemHealth?: number;
}

interface EnhancedDashboardProps {
  stats: DashboardStats;
  userRole: string;
}

export default function EnhancedDashboard({ stats, userRole }: EnhancedDashboardProps) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              إجمالي الشركات
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalCompanies}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              {stats.activeCompanies} نشطة من أصل {stats.totalCompanies}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              إجمالي الموظفين
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.totalEmployees}
            </div>
            <p className="text-xs text-green-600 dark:text-green-300">
              +{stats.monthlyGrowth || 8}% هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
              في انتظار الموافقة
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              طلبات تحتاج مراجعة
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              صحة النظام
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.systemHealth || 98}%
            </div>
            <Progress value={stats.systemHealth || 98} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* قسم الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            الإجراءات السريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRole === 'super_admin' && (
              <>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <Building2 className="h-6 w-6" />
                  <span>إضافة شركة جديدة</span>
                </Button>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span>تقارير النظام</span>
                </Button>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <Activity className="h-6 w-6" />
                  <span>مراقبة الأداء</span>
                </Button>
              </>
            )}
            
            {userRole === 'company_manager' && (
              <>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <Users className="h-6 w-6" />
                  <span>إضافة موظف</span>
                </Button>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <CheckCircle className="h-6 w-6" />
                  <span>موافقة الطلبات</span>
                </Button>
                <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                  <BarChart3 className="h-6 w-6" />
                  <span>تقارير الشركة</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* قسم التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            التنبيهات والإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">انتهاء صلاحية 3 تراخيص خلال الأسبوع القادم</span>
              </div>
              <Badge variant="secondary">عاجل</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{stats.pendingApprovals} طلبات إجازة في انتظار الموافقة</span>
              </div>
              <Badge variant="outline">مراجعة</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">تم تحديث بيانات 15 موظف بنجاح</span>
              </div>
              <Badge variant="default">مكتمل</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}