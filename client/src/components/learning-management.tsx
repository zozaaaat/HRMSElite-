import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Award, 
  Users, 
  Clock,
  Play,
  CheckCircle,
  Star,
  Calendar,
  FileText,
  Download,
  TrendingUp,
  Target,
  Video,
  PenTool
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LearningManagementProps {
  companyId: string;
  employeeId?: string;
}

export function LearningManagement({ companyId, employeeId }: LearningManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: learningStats } = useQuery({
    queryKey: ['/api/learning/stats', companyId],
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses', companyId],
  });

  const { data: certifications } = useQuery({
    queryKey: ['/api/certifications', companyId],
  });

  return (
    <div className="space-y-6">
      {/* Learning Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              الدورات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              8 دورات جديدة هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              المتدربون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              من أصل 180 موظف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              الشهادات المكتسبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +12 هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              معدل الإكمال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="courses">الدورات</TabsTrigger>
          <TabsTrigger value="progress">التقدم</TabsTrigger>
          <TabsTrigger value="certifications">الشهادات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Featured Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  الدورات المميزة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "أساسيات القيادة الحديثة",
                    instructor: "د. أحمد محمد",
                    duration: "6 ساعات",
                    rating: 4.8,
                    enrolled: 45,
                    category: "القيادة"
                  },
                  {
                    title: "إدارة المشاريع الرشيقة",
                    instructor: "م. فاطمة علي",
                    duration: "8 ساعات",
                    rating: 4.9,
                    enrolled: 32,
                    category: "إدارة"
                  },
                  {
                    title: "التسويق الرقمي المتقدم",
                    instructor: "أ. سارة خالد",
                    duration: "10 ساعات",
                    rating: 4.7,
                    enrolled: 28,
                    category: "تسويق"
                  }
                ].map((course, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">بواسطة {course.instructor}</p>
                      </div>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolled} متدرب
                      </div>
                    </div>

                    <Button size="sm" className="w-full">
                      <Play className="ml-2 h-3 w-3" />
                      بدء الدورة
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  تقدم التعلم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${78.5 * 3.51} 351`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">78.5%</div>
                        <div className="text-xs text-muted-foreground">مكتمل</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">معدل إكمال الدورات</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>الدورات المكتملة</span>
                    <span className="font-medium">18/24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الساعات التدريبية</span>
                    <span className="font-medium">145 ساعة</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الشهادات المكتسبة</span>
                    <span className="font-medium">12 شهادة</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">الأهداف الشهرية</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>إكمال 3 دورات</span>
                      <span>2/3</span>
                    </div>
                    <Progress value={66.7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    user: "أحمد محمد",
                    action: "أكمل دورة",
                    course: "أساسيات القيادة الحديثة",
                    time: "منذ ساعتين",
                    type: "completion"
                  },
                  {
                    user: "فاطمة علي",
                    action: "حصل على شهادة",
                    course: "إدارة المشاريع الرشيقة",
                    time: "منذ 4 ساعات",
                    type: "certification"
                  },
                  {
                    user: "محمد خالد",
                    action: "بدأ دورة جديدة",
                    course: "التسويق الرقمي المتقدم",
                    time: "منذ يوم",
                    type: "enrollment"
                  },
                  {
                    user: "سارة أحمد",
                    action: "اجتاز اختبار",
                    course: "مهارات التواصل الفعال",
                    time: "منذ يومين",
                    type: "assessment"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'completion' ? 'bg-green-100 dark:bg-green-900' :
                      activity.type === 'certification' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      activity.type === 'enrollment' ? 'bg-blue-100 dark:bg-blue-900' :
                      'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      {activity.type === 'completion' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.type === 'certification' && <Award className="h-4 w-4 text-yellow-600" />}
                      {activity.type === 'enrollment' && <BookOpen className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'assessment' && <PenTool className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.user} {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.course}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">إدارة الدورات التدريبية</h3>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="ml-2 h-4 w-4" />
                استيراد دورة
              </Button>
              <Button>
                <BookOpen className="ml-2 h-4 w-4" />
                إضافة دورة جديدة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "أساسيات القيادة الحديثة",
                category: "القيادة",
                level: "متوسط",
                duration: "6 ساعات",
                modules: 8,
                enrolled: 45,
                rating: 4.8,
                status: "نشط",
                progress: 85
              },
              {
                title: "إدارة المشاريع الرشيقة",
                category: "إدارة",
                level: "متقدم",
                duration: "8 ساعات",
                modules: 12,
                enrolled: 32,
                rating: 4.9,
                status: "نشط",
                progress: 78
              },
              {
                title: "التسويق الرقمي المتقدم",
                category: "تسويق",
                level: "متقدم",
                duration: "10 ساعات",
                modules: 15,
                enrolled: 28,
                rating: 4.7,
                status: "مسودة",
                progress: 45
              }
            ].map((course, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{course.title}</CardTitle>
                    <Badge variant={course.status === "نشط" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    <Badge variant="outline" className="text-xs">{course.level}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.modules} وحدة
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled} متدرب
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>التقدم</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-1" />
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      تعديل
                    </Button>
                    <Button size="sm" className="flex-1 text-xs">
                      عرض
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">تتبع تقدم الموظفين</h3>
            <Button variant="outline">
              <FileText className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">نظرة عامة على التقدم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    employee: "أحمد محمد",
                    department: "المبيعات",
                    coursesEnrolled: 5,
                    coursesCompleted: 4,
                    hoursLearned: 32,
                    certificationsEarned: 3,
                    progress: 80
                  },
                  {
                    employee: "فاطمة علي",
                    department: "التقنية",
                    coursesEnrolled: 8,
                    coursesCompleted: 6,
                    hoursLearned: 48,
                    certificationsEarned: 4,
                    progress: 75
                  },
                  {
                    employee: "محمد خالد",
                    department: "التسويق",
                    coursesEnrolled: 6,
                    coursesCompleted: 3,
                    hoursLearned: 24,
                    certificationsEarned: 2,
                    progress: 50
                  }
                ].map((employee, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{employee.employee}</h4>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{employee.progress}%</div>
                        <p className="text-xs text-muted-foreground">مُكتمل</p>
                      </div>
                    </div>

                    <Progress value={employee.progress} className="h-2" />

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{employee.coursesCompleted}/{employee.coursesEnrolled}</div>
                        <p className="text-xs text-muted-foreground">دورات</p>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{employee.hoursLearned}</div>
                        <p className="text-xs text-muted-foreground">ساعة</p>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{employee.certificationsEarned}</div>
                        <p className="text-xs text-muted-foreground">شهادة</p>
                      </div>
                      <div className="text-center">
                        <Button size="sm" variant="outline" className="text-xs">
                          التفاصيل
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">إدارة الشهادات</h3>
            <Button>
              <Award className="ml-2 h-4 w-4" />
              إضافة شهادة جديدة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "شهادة القيادة المعتمدة",
                issuer: "معهد القيادة الحديثة",
                validityPeriod: "سنتان",
                recipients: 12,
                requirements: ["إكمال دورة القيادة", "اجتياز الاختبار النهائي", "مشروع تطبيقي"],
                status: "نشط"
              },
              {
                title: "شهادة إدارة المشاريع",
                issuer: "الجمعية العالمية لإدارة المشاريع",
                validityPeriod: "3 سنوات",
                recipients: 8,
                requirements: ["إكمال 40 ساعة تدريبية", "اجتياز اختبارين", "خبرة عملية"],
                status: "نشط"
              }
            ].map((cert, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{cert.title}</CardTitle>
                    <Badge variant={cert.status === "نشط" ? "default" : "secondary"}>
                      {cert.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الجهة المصدرة:</span>
                      <span>{cert.issuer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">فترة الصلاحية:</span>
                      <span>{cert.validityPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الحاصلون عليها:</span>
                      <span>{cert.recipients} موظف</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">متطلبات الحصول على الشهادة:</h4>
                    <ul className="space-y-1">
                      {cert.requirements.map((req, reqIndex) => (
                        <li key={reqIndex} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      تعديل
                    </Button>
                    <Button size="sm" className="flex-1">
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">تحليلات التعلم</h3>
            <Button variant="outline">
              <Calendar className="ml-2 h-4 w-4" />
              تخصيص الفترة
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">أداء الأقسام</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { dept: "التقنية", completion: 92, employees: 25 },
                  { dept: "المبيعات", completion: 85, employees: 30 },
                  { dept: "التسويق", completion: 78, employees: 20 },
                  { dept: "الموارد البشرية", completion: 95, employees: 15 },
                  { dept: "المالية", completion: 88, employees: 18 }
                ].map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dept.dept}</span>
                      <span>{dept.completion}% ({dept.employees} موظف)</span>
                    </div>
                    <Progress value={dept.completion} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">الاتجاهات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">سيتم عرض مخططات الاتجاهات هنا</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}