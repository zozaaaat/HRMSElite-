import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Award, 
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  Star,
  Target
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  enrolledCount: number;
  rating: number;
  progress?: number;
  status?: string;
}

export default function TrainingPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const courses: Course[] = [
    {
      id: "1",
      title: "أساسيات إدارة الموارد البشرية",
      description: "تعلم المفاهيم الأساسية لإدارة الموارد البشرية والممارسات الحديثة",
      instructor: "د. محمد السالم",
      duration: "8 ساعات",
      level: "مبتدئ",
      category: "hr",
      enrolledCount: 45,
      rating: 4.8,
      progress: 75,
      status: "active"
    },
    {
      id: "2",
      title: "القيادة الفعالة",
      description: "تطوير مهارات القيادة والإدارة الناجحة للفرق",
      instructor: "أ. سارة القحطاني",
      duration: "12 ساعة",
      level: "متوسط",
      category: "leadership",
      enrolledCount: 32,
      rating: 4.9,
      progress: 30,
      status: "active"
    },
    {
      id: "3",
      title: "التواصل في بيئة العمل",
      description: "إتقان فنون التواصل الفعال مع الزملاء والعملاء",
      instructor: "أ. فهد المطيري",
      duration: "6 ساعات",
      level: "مبتدئ",
      category: "skills",
      enrolledCount: 58,
      rating: 4.7,
      status: "new"
    },
    {
      id: "4",
      title: "إدارة الوقت والإنتاجية",
      description: "استراتيجيات فعالة لإدارة الوقت وزيادة الإنتاجية",
      instructor: "أ. نورا الشمري",
      duration: "4 ساعات",
      level: "مبتدئ",
      category: "skills",
      enrolledCount: 67,
      rating: 4.6,
      progress: 100,
      status: "completed"
    }
  ];

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      مبتدئ: { label: "مبتدئ", variant: "default" },
      متوسط: { label: "متوسط", variant: "secondary" },
      متقدم: { label: "متقدم", variant: "destructive" }
    };
    
    const levelInfo = levelMap[level] || { label: level, variant: "default" };
    return <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>;
  };

  const getStatusBadge = (status?: string) => {
    if (status === "completed") {
      return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
    } else if (status === "new") {
      return <Badge className="bg-blue-100 text-blue-800">جديد</Badge>;
    }
    return null;
  };

  const handleEnroll = (courseId: string) => {
    toast({
      title: "تم التسجيل",
      description: "تم تسجيلك في الدورة بنجاح",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">التدريب والتطوير</h1>
          <p className="text-muted-foreground mt-2">
            برامج تدريبية لتطوير مهارات الموظفين
          </p>
        </div>
        
        <Button className="gap-2">
          <Award className="h-4 w-4" />
          شهاداتي
        </Button>
      </div>

      {/* إحصائيات التدريب */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              الدورات النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">من أصل 4 دورات</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              ساعات التدريب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              الشهادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">شهادة محصلة</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              معدل الإنجاز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <Progress value={68} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* قائمة الدورات */}
      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">الدورات المتاحة</TabsTrigger>
          <TabsTrigger value="enrolled">دوراتي الحالية</TabsTrigger>
          <TabsTrigger value="completed">الدورات المكتملة</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => !c.progress || c.progress < 100).map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    {getStatusBadge(course.status)}
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المدرب:</span>
                    <span>{course.instructor}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المدة:</span>
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {getLevelBadge(course.level)}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{course.enrolledCount} مشترك</span>
                    </div>
                  </div>
                  
                  {course.progress ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>التقدم</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                      <Button className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        متابعة الدورة
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full gap-2"
                      onClick={() => handleEnroll(course.id)}
                    >
                      <BookOpen className="h-4 w-4" />
                      التسجيل في الدورة
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => c.progress && c.progress < 100).map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={course.progress} />
                    <div className="flex justify-between text-sm">
                      <span>التقدم</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      متابعة التعلم
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => c.progress === 100).map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">مكتملة</span>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <Award className="h-4 w-4" />
                      عرض الشهادة
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