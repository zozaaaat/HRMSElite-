import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Users, 
  Building2, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  Target,
  Lightbulb,
  UserCheck,
  BookOpen,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

interface CompanyIntelligentStats {
  id: string;
  name: string;
  totalEmployees: number;
  totalLicenses: number;
  activeProjects: number;
  completedTasks: number;
  departmentCount: number;
  assetValue: number;
  trainingPrograms: number;
  avgPerformanceRating: number;
  upcomingLicenseExpiries: number;
  pendingTasksCount: number;
  overdueTasks: number;
  departmentProductivity: Array<{
    departmentName: string;
    taskCompletion: number;
    employeeCount: number;
    budget: number;
  }>;
  licenseUtilization: Array<{
    licenseName: string;
    assignedEmployees: number;
    utilizationRate: number;
  }>;
  skillsMatrix: Array<{
    skillName: string;
    employeeCount: number;
    averageProficiency: number;
  }>;
}

interface Recommendation {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  expectedImpact: string;
  estimatedCost: number;
  timeframe: string;
}

interface SmartRecommendations {
  talent: Recommendation[];
  operations: Recommendation[];
  compliance: Recommendation[];
  financial: Recommendation[];
}

export default function IntelligentDashboard() {
  const [companyStats, setCompanyStats] = useState<CompanyIntelligentStats | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendations | null>(null);
  const [skillsGap, setSkillsGap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyId] = useState('demo-company-id');

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchIntelligentData();
  }, []);

  const fetchIntelligentData = async () => {
    try {
      setLoading(true);
      
      // Fetch company intelligent stats
      const statsResponse = await fetch(`/api/intelligent/company/${selectedCompanyId}/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setCompanyStats(stats);
      }

      // Fetch recommendations
      const recsResponse = await fetch(`/api/intelligent/recommendations/${selectedCompanyId}`);
      if (recsResponse.ok) {
        const recs = await recsResponse.json();
        setRecommendations(recs);
      }

      // Fetch skills gap analysis
      const skillsResponse = await fetch(`/api/intelligent/skills-gap/${selectedCompanyId}`);
      if (skillsResponse.ok) {
        const skills = await skillsResponse.json();
        setSkillsGap(skills);
      }

    } catch (error) {
      console.error('Error fetching intelligent data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">جارٍ تحليل البيانات الذكية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الذكية</h1>
          </div>
          <p className="text-gray-600">تحليلات متقدمة وتوصيات ذكية لتحسين الأداء</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              الرؤى الذكية
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              التوصيات
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              تحليل المهارات
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {companyStats && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{companyStats.totalEmployees}</div>
                      <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{companyStats.activeProjects}</div>
                      <p className="text-xs text-muted-foreground">+5% من الشهر الماضي</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{companyStats.avgPerformanceRating.toFixed(1)}/5</div>
                      <Progress value={companyStats.avgPerformanceRating * 20} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">قيمة الأصول</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{companyStats.assetValue.toLocaleString()} ر.س</div>
                      <p className="text-xs text-muted-foreground">+8% من الربع الماضي</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Department Productivity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>إنتاجية الأقسام</CardTitle>
                    <CardDescription>معدل إنجاز المهام حسب القسم</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={companyStats.departmentProductivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="departmentName" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="taskCompletion" fill="#3b82f6" name="معدل الإنجاز %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* License Utilization */}
                <Card>
                  <CardHeader>
                    <CardTitle>استخدام التراخيص</CardTitle>
                    <CardDescription>عدد الموظفين المخصصين لكل ترخيص</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={companyStats.licenseUtilization}
                          dataKey="assignedEmployees"
                          nameKey="licenseName"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {companyStats.licenseUtilization.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Smart Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    الأداء المتميز
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">قسم التطوير</p>
                      <p className="text-sm text-green-700">أعلى معدل إنجاز للمهام</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">98%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">محمد أحمد</p>
                      <p className="text-sm text-blue-700">أفضل موظف هذا الشهر</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">5.0/5</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    تنبيهات مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium text-amber-900">انتهاء صلاحية التراخيص</p>
                      <p className="text-sm text-amber-700">5 تراخيص تنتهي خلال 30 يوم</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">عاجل</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">مهام متأخرة</p>
                      <p className="text-sm text-red-700">12 مهمة تجاوزت الموعد المحدد</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">عالي</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {recommendations && (
              <div className="space-y-6">
                {Object.entries(recommendations).map(([category, recs]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">
                        {category === 'talent' && '🎯 توصيات المواهب'}
                        {category === 'operations' && '⚙️ توصيات العمليات'}
                        {category === 'compliance' && '📋 توصيات الامتثال'}
                        {category === 'financial' && '💰 توصيات مالية'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recs.map((rec, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{rec.title}</h4>
                                <p className="text-gray-600 mt-1">{rec.description}</p>
                              </div>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority === 'urgent' && 'عاجل'}
                                {rec.priority === 'high' && 'عالي'}
                                {rec.priority === 'medium' && 'متوسط'}
                                {rec.priority === 'low' && 'منخفض'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">التأثير المتوقع:</span>
                                <p className="text-gray-600">{rec.expectedImpact}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">التكلفة المقدرة:</span>
                                <p className="text-gray-600">{rec.estimatedCost.toLocaleString()} ر.س</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">الإطار الزمني:</span>
                                <p className="text-gray-600">{rec.timeframe}</p>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <Button size="sm" variant="outline">
                                عرض التفاصيل
                              </Button>
                              <Button size="sm">
                                تطبيق التوصية
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Skills Analysis Tab */}
          <TabsContent value="skills" className="space-y-6">
            {skillsGap && (
              <>
                {/* Skills Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold">{skillsGap.summary.totalEmployees}</div>
                      <p className="text-sm text-muted-foreground">إجمالي الموظفين</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold">{skillsGap.summary.uniqueSkills}</div>
                      <p className="text-sm text-muted-foreground">مهارات مختلفة</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-red-600">{skillsGap.summary.criticalGaps}</div>
                      <p className="text-sm text-muted-foreground">فجوات حرجة</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold">{skillsGap.summary.avgSkillsPerEmployee}</div>
                      <p className="text-sm text-muted-foreground">مهارة/موظف</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Department Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>تحليل الأقسام</CardTitle>
                    <CardDescription>فجوات المهارات حسب القسم</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {skillsGap.departmentAnalysis.map((dept: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{dept.department}</h4>
                            <Badge className={
                              dept.severity === 'high' ? 'bg-red-100 text-red-800' :
                              dept.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {dept.severity === 'high' && 'حرج'}
                              {dept.severity === 'medium' && 'متوسط'}
                              {dept.severity === 'low' && 'منخفض'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">المهارات المطلوبة:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dept.requiredSkills.map((skill: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">المهارات المتاحة:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dept.availableSkills.map((skill: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">الفجوات:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {dept.gaps.map((gap: string, i: number) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {gap}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 p-3 bg-blue-50 rounded">
                            <p className="text-sm text-blue-800">
                              <strong>التوصية:</strong> {dept.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Training Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle>خطة التدريب</CardTitle>
                    <CardDescription>برامج التدريب المقترحة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="short-term">
                      <TabsList>
                        <TabsTrigger value="short-term">قصيرة المدى</TabsTrigger>
                        <TabsTrigger value="long-term">طويلة المدى</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="short-term" className="mt-4">
                        <div className="space-y-4">
                          {skillsGap.trainingPlan.shortTerm.map((program: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-semibold">{program.skill}</h4>
                                <p className="text-sm text-gray-600">
                                  {program.targetEmployees} موظف • {program.duration}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="font-semibold">{program.cost.toLocaleString()} ر.س</p>
                                <Badge className="mt-1">
                                  {program.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="long-term" className="mt-4">
                        <div className="space-y-4">
                          {skillsGap.trainingPlan.longTerm.map((program: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-semibold">{program.skill}</h4>
                                <p className="text-sm text-gray-600">
                                  {program.targetEmployees} موظف • {program.duration}
                                </p>
                              </div>
                              <div className="text-left">
                                <p className="font-semibold">{program.cost.toLocaleString()} ر.س</p>
                                <Badge variant="secondary" className="mt-1">
                                  {program.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}