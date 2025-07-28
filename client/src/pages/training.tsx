import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award,
  Play,
  Star,
  Calendar,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Target,
  TrendingUp
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { useToast } from "@/hooks/use-toast";

export default function Training() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <TrainingContent />
    </SharedLayout>
  );
}

function TrainingContent() {
  const [activeTab, setActiveTab] = useState("courses");
  const { toast } = useToast();

  // Fetch training data
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/training/courses'],
  });

  const mockCourses = [
    {
      id: "1",
      title: "أساسيات إدارة الموارد البشرية",
      instructor: "د. محمد السالم",
      duration: "8 ساعات",
      enrolledCount: 45,
      rating: 4.8,
      status: "available",
      category: "HR",
      level: "مبتدئ",
      description: "دورة شاملة في أساسيات إدارة الموارد البشرية",
      completionRate: 78
    },
    {
      id: "2",
      title: "القيادة الفعالة",
      instructor: "أ. سارة القحطاني", 
      duration: "12 ساعة",
      enrolledCount: 32,
      rating: 4.9,
      status: "available",
      category: "Leadership",
      level: "متقدم",
      description: "تطوير مهارات القيادة والإدارة الفعالة",
      completionRate: 65
    },
    {
      id: "3",
      title: "إدارة الوقت والإنتاجية",
      instructor: "م. خالد العتيبي",
      duration: "6 ساعات",
      enrolledCount: 67,
      rating: 4.7,
      status: "available",
      category: "Productivity",
      level: "متوسط",
      description: "استراتيجيات فعالة لإدارة الوقت وزيادة الإنتاجية",
      completionRate: 82
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'HR': 'bg-blue-100 text-blue-800',
      'Leadership': 'bg-purple-100 text-purple-800',
      'Productivity': 'bg-green-100 text-green-800',
      'Technology': 'bg-orange-100 text-orange-800',
      'Sales': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'مبتدئ': 'bg-green-500',
      'متوسط': 'bg-yellow-500',
      'متقدم': 'bg-red-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التدريب والتطوير</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              منصة التعلم المؤسسي وتطوير مهارات الموظفين
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Search className="h-4 w-4 ml-2" />
              البحث في الدورات
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة دورة جديدة
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              الدورات التدريبية
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              التقدم والإنجازات
            </TabsTrigger>
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              الشهادات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الدورات</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">المتدربون النشطون</p>
                      <p className="text-2xl font-bold">187</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Award className="h-8 w-8 text-gold-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">الشهادات الممنوحة</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ساعات التدريب</p>
                      <p className="text-2xl font-bold">1,245</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge className={getCategoryColor(course.category)}>
                        {course.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrolledCount} متدرب
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">المدرب:</span>
                        <span className="font-medium">{course.instructor}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">المستوى:</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getLevelColor(course.level)}`}></div>
                          <span className="font-medium">{course.level}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">معدل الإكمال:</span>
                          <span className="font-medium">{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Play className="h-4 w-4 ml-1" />
                          بدء الدورة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التقدم العام في التدريب</CardTitle>
                <CardDescription>نظرة شاملة على إنجازات الموظفين في برامج التدريب</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">89%</div>
                      <div className="text-sm text-gray-600">معدل الإكمال العام</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">4.7</div>
                      <div className="text-sm text-gray-600">متوسط التقييم</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">156</div>
                      <div className="text-sm text-gray-600">شهادة مكتملة</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">أفضل المتدربين هذا الشهر</h3>
                    {[
                      { name: "أحمد محمد علي", progress: 95, courses: 4 },
                      { name: "فاطمة سالم أحمد", progress: 92, courses: 3 },
                      { name: "خالد عبدالرحمن", progress: 89, courses: 5 }
                    ].map((trainee, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{trainee.name}</div>
                          <div className="text-sm text-gray-600">{trainee.courses} دورات مكتملة</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">{trainee.progress}%</div>
                          <div className="text-sm text-gray-600">نسبة الإنجاز</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "شهادة إدارة الموارد البشرية",
                  issuer: "معهد التدريب المهني",
                  recipients: 45,
                  validUntil: "2026-12-31"
                },
                {
                  title: "شهادة القيادة المتقدمة",
                  issuer: "أكاديمية القيادة",
                  recipients: 28,
                  validUntil: "2025-12-31"
                },
                {
                  title: "شهادة إدارة المشاريع",
                  issuer: "معهد إدارة المشاريع",
                  recipients: 35,
                  validUntil: "2027-06-30"
                }
              ].map((cert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-yellow-500" />
                      <div>
                        <CardTitle className="text-lg">{cert.title}</CardTitle>
                        <CardDescription>{cert.issuer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">عدد الحاصلين:</span>
                        <span className="font-medium">{cert.recipients} موظف</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">صالحة حتى:</span>
                        <span className="font-medium">{cert.validUntil}</span>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <CheckCircle className="h-4 w-4 ml-2" />
                        عرض الحاصلين
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الأداء الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">87%</div>
                      <div className="text-sm text-gray-600">معدل إكمال الدورات</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>دورات مكتملة</span>
                        <span className="font-medium">156</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>التوزيع حسب الأقسام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { department: "الموارد البشرية", percentage: 35 },
                      { department: "المبيعات", percentage: 28 },
                      { department: "التسويق", percentage: 22 },
                      { department: "المحاسبة", percentage: 15 }
                    ].map((dept, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{dept.department}</span>
                          <span className="font-medium">{dept.percentage}%</span>
                        </div>
                        <Progress value={dept.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}