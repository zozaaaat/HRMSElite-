import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building2,
  Calendar,
  Target,
  Award,
  AlertCircle
} from "lucide-react";

interface AnalyticsData {
  employeeGrowth: number;
  retentionRate: number;
  averageAge: number;
  genderDistribution: { male: number; female: number };
  departmentStats: Array<{ name: string; count: number; percentage: number }>;
  performanceMetrics: Array<{ metric: string; value: number; trend: 'up' | 'down' | 'stable' }>;
}

export default function AdvancedAnalytics() {
  // Sample data - in real app this would come from API
  const analyticsData: AnalyticsData = {
    employeeGrowth: 12.5,
    retentionRate: 87.3,
    averageAge: 32.5,
    genderDistribution: { male: 65, female: 35 },
    departmentStats: [
      { name: 'الموارد البشرية', count: 45, percentage: 18 },
      { name: 'المحاسبة', count: 32, percentage: 13 },
      { name: 'المبيعات', count: 78, percentage: 31 },
      { name: 'التطوير', count: 95, percentage: 38 }
    ],
    performanceMetrics: [
      { metric: 'الإنتاجية', value: 92, trend: 'up' },
      { metric: 'الرضا الوظيفي', value: 85, trend: 'up' },
      { metric: 'معدل الغياب', value: 3.2, trend: 'down' },
      { metric: 'التدريب المكتمل', value: 78, trend: 'stable' }
    ]
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              نمو الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              +{analyticsData.employeeGrowth}%
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              خلال الربع الحالي
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Award className="h-4 w-4" />
              معدل الاحتفاظ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {analyticsData.retentionRate}%
            </div>
            <Progress value={analyticsData.retentionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <Users className="h-4 w-4" />
              متوسط العمر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {analyticsData.averageAge}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              سنة
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              التوزيع الجنسي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>ذكور: {analyticsData.genderDistribution.male}%</span>
                <span>إناث: {analyticsData.genderDistribution.female}%</span>
              </div>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500" 
                  style={{ width: `${analyticsData.genderDistribution.male}%` }}
                ></div>
                <div 
                  className="bg-pink-500" 
                  style={{ width: `${analyticsData.genderDistribution.female}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* توزيع الأقسام */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            توزيع الموظفين حسب الأقسام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.departmentStats.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{dept.count} موظف</Badge>
                    <span className="text-sm text-gray-600">{dept.percentage}%</span>
                  </div>
                </div>
                <Progress value={dept.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مؤشرات الأداء */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            مؤشرات الأداء الرئيسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.performanceMetrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}%</div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* توصيات ذكية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            التوصيات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                تحسين معدل الاحتفاظ
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                يُنصح بتنفيذ برامج تطوير مهني إضافية لزيادة معدل الاحتفاظ بالموظفين
              </p>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                توسيع فريق التطوير
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                بناءً على نمو الشركة، يُوصى بزيادة فريق التطوير بنسبة 15%
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                برامج التدريب
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                22% من الموظفين لم يكملوا برامج التدريب المطلوبة لهذا الربع
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}