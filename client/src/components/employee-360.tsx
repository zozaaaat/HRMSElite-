import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Star, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  MessageSquare,
  Calendar,
  DollarSign,
  BookOpen,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Employee360Props {
  employeeId: string;
  companyId: string;
}

export function Employee360({ employeeId, companyId }: Employee360Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: employee360 } = useQuery({
    queryKey: ['/api/employees', employeeId, '360-view'],
  });

  const { data: employee } = useQuery({
    queryKey: ['/api/employees', employeeId],
  });

  if (!employee360 || !employee) {
    return <div>Loading...</div>;
  }

  const performanceScore = employee360.performanceScore || 0;
  const engagementLevel = employee360.engagementLevel || 'متوسط';

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.profileImage} />
              <AvatarFallback className="text-lg">
                {employee.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{employee.fullName}</h1>
                <Badge variant={employee.isActive ? "default" : "secondary"}>
                  {employee.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">المنصب الرسمي:</span>
                  <p className="font-medium">{employee.jobTitle}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">المنصب الفعلي:</span>
                  <p className="font-medium">{employee.actualJobTitle || 'غير محدد'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">القسم:</span>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">تاريخ التعيين:</span>
                  <p className="font-medium">
                    {new Date(employee.hireDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${performanceScore * 1.88} 188`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(performanceScore)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">نقاط الأداء</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 360 View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="salary">المرتبات</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات</TabsTrigger>
          <TabsTrigger value="training">التدريب</TabsTrigger>
          <TabsTrigger value="feedback">التقييمات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Engagement Level */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  مستوى المشاركة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-center">{engagementLevel}</div>
                <Progress value={75} className="mt-2" />
                <div className="text-xs text-muted-foreground text-center mt-2">
                  أعلى من 68% من الموظفين
                </div>
              </CardContent>
            </Card>

            {/* Skills Matrix */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  مصفوفة المهارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {employee360.skillMatrix?.map((skill: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{skill.name}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < skill.level ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Path */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  المسار الوظيفي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee360.careerPath?.map((milestone: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">{milestone.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Goals and Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  الأهداف الحالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee360.goals?.map((goal: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {goal.priority}
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>التقدم: {goal.progress}%</span>
                      <span>موعد الانتهاء: {goal.deadline}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  الإنجازات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee360.achievements?.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance metrics and charts would go here */}
          <Card>
            <CardHeader>
              <CardTitle>تقييم الأداء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                سيتم عرض مقاييس الأداء التفصيلية هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-4">
          {/* Salary history and breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>تاريخ المرتبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                سيتم عرض تاريخ المرتبات والعلاوات هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          {/* Leave balance and history */}
          <Card>
            <CardHeader>
              <CardTitle>رصيد وتاريخ الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                سيتم عرض رصيد الإجازات وتاريخها هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          {/* Training progress and certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                التقدم في التدريب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee360.trainingProgress?.map((training: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{training.courseName}</span>
                    <Badge variant={training.status === 'completed' ? 'default' : 'secondary'}>
                      {training.status === 'completed' ? 'مكتمل' : 'قيد التقدم'}
                    </Badge>
                  </div>
                  <Progress value={training.progress} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>التقدم: {training.progress}%</span>
                    <span>النتيجة: {training.score || 'لم يتم التقييم بعد'}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {/* Feedback and reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                التقييمات والملاحظات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee360.feedback?.map((feedback: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{feedback.reviewerName}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}