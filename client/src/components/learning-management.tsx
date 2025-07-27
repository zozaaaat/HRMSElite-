import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProgressRing } from "./progress-ring";
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Clock,
  Star,
  Plus,
  Play,
  CheckCircle,
  TrendingUp,
  Calendar,
  Target,
  Download,
  Upload,
  Settings,
  Search,
  Filter
} from "lucide-react";

interface LearningManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearningManagement({ isOpen, onClose }: LearningManagementProps) {
  const [activeTab, setActiveTab] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration
  const { data: courses } = useQuery({
    queryKey: ['/api/courses/system'],
    enabled: isOpen,
  });

  const { data: learningStats } = useQuery({
    queryKey: ['/api/learning/stats/system'],
    enabled: isOpen,
  });

  const { data: certifications } = useQuery({
    queryKey: ['/api/certifications/system'],
    enabled: isOpen,
  });

  const mockCourses = [
    {
      id: 1,
      title: "إدارة الموارد البشرية المتقدمة",
      description: "دورة شاملة في أساسيات وتقنيات إدارة الموارد البشرية الحديثة",
      duration: "40 ساعة",
      level: "متقدم",
      enrollments: 156,
      rating: 4.8,
      progress: 75,
      instructor: "د. أحمد محمد",
      category: "إدارة",
      status: "ongoing"
    },
    {
      id: 2,
      title: "القيادة والإشراف الفعال",
      description: "تطوير مهارات القيادة والإشراف في بيئة العمل",
      duration: "25 ساعة",
      level: "متوسط",
      enrollments: 89,
      rating: 4.6,
      progress: 100,
      instructor: "أ. فاطمة علي",
      category: "قيادة",
      status: "completed"
    },
    {
      id: 3,
      title: "أساسيات الأمان والسلامة المهنية",
      description: "دورة أساسية في قواعد الأمان والسلامة في مكان العمل",
      duration: "15 ساعة",
      level: "مبتدئ",
      enrollments: 234,
      rating: 4.9,
      progress: 30,
      instructor: "م. خالد السعيد",
      category: "أمان",
      status: "ongoing"
    }
  ];

  const mockCertifications = [
    {
      id: 1,
      name: "شهادة إدارة الموارد البشرية المعتمدة",
      issuer: "معهد الإدارة",
      validUntil: "2025-12-31",
      holders: 45,
      requirements: ["اجتياز 3 دورات", "امتحان نهائي", "مشروع تطبيقي"]
    },
    {
      id: 2,
      name: "شهادة القيادة والإشراف",
      issuer: "أكاديمية القيادة",
      validUntil: "2025-06-30",
      holders: 28,
      requirements: ["دورة القيادة", "ورشة الإشراف", "تقييم الأداء"]
    }
  ];

  const stats = learningStats as any || {
    activeCourses: 24,
    activeTrainees: 345,
    completedCertifications: 89,
    averageProgress: 67,
    monthlyHours: 1240,
    satisfactionRate: 94
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            نظام إدارة التعلم والتدريب
          </DialogTitle>
        </DialogHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{stats.activeCourses}</div>
              <div className="text-xs text-blue-600">دورة نشطة</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.activeTrainees}</div>
              <div className="text-xs text-green-600">متدرب نشط</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-700">{stats.completedCertifications}</div>
              <div className="text-xs text-yellow-600">شهادة مكتملة</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{stats.averageProgress}%</div>
              <div className="text-xs text-purple-600">متوسط التقدم</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-700">{stats.monthlyHours}</div>
              <div className="text-xs text-indigo-600">ساعة هذا الشهر</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-700">{stats.satisfactionRate}%</div>
              <div className="text-xs text-pink-600">معدل الرضا</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">الدورات التدريبية</TabsTrigger>
            <TabsTrigger value="certifications">الشهادات</TabsTrigger>
            <TabsTrigger value="progress">تتبع التقدم</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الدورات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 ml-2" />
                فلترة
              </Button>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة دورة
              </Button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={course.level === 'متقدم' ? 'default' : course.level === 'متوسط' ? 'secondary' : 'outline'}>
                            {course.level}
                          </Badge>
                          <Badge variant="outline">{course.category}</Badge>
                        </div>
                      </div>
                      <ProgressRing 
                        progress={course.progress} 
                        size={50} 
                        strokeWidth={4}
                        color={course.status === 'completed' ? '#10b981' : '#3b82f6'}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrollments} متدرب
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                      <span className="text-sm text-muted-foreground">• {course.instructor}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1">
                        <Play className="h-4 w-4 ml-2" />
                        {course.status === 'completed' ? 'مراجعة' : 'متابعة'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">الشهادات المتاحة</h3>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة شهادة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockCertifications.map((cert) => (
                <Card key={cert.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-yellow-200 rounded-full">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{cert.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">من {cert.issuer}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">صالحة حتى:</span>
                      <span className="text-sm font-medium">{cert.validUntil}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الحاصلين عليها:</span>
                      <span className="text-sm font-medium">{cert.holders} موظف</span>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <p className="text-sm font-medium mb-2">المتطلبات:</p>
                      <ul className="space-y-1">
                        {cert.requirements.map((req, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button variant="default" className="w-full">
                      <Target className="h-4 w-4 ml-2" />
                      بدء المسار التدريبي
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <ProgressRing progress={stats.averageProgress} size={100} color="#3b82f6">
                    <div className="text-center">
                      <div className="text-xl font-bold">{stats.averageProgress}%</div>
                      <div className="text-xs text-muted-foreground">التقدم العام</div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <ProgressRing progress={85} size={100} color="#10b981">
                    <div className="text-center">
                      <div className="text-xl font-bold">85%</div>
                      <div className="text-xs text-muted-foreground">معدل الإكمال</div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <ProgressRing progress={stats.satisfactionRate} size={100} color="#f59e0b">
                    <div className="text-center">
                      <div className="text-xl font-bold">{stats.satisfactionRate}%</div>
                      <div className="text-xs text-muted-foreground">رضا المتدربين</div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <ProgressRing progress={72} size={100} color="#8b5cf6">
                    <div className="text-center">
                      <div className="text-xl font-bold">72%</div>
                      <div className="text-xs text-muted-foreground">تطبيق المهارات</div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>
            </div>

            {/* Progress Table */}
            <Card>
              <CardHeader>
                <CardTitle>تقدم المتدربين حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['الموارد البشرية', 'المالية', 'التسويق', 'العمليات', 'تقنية المعلومات'].map((dept, index) => {
                    const progress = 60 + Math.random() * 35;
                    return (
                      <div key={dept} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">{dept}</div>
                        <div className="flex-1">
                          <Progress value={progress} className="h-2" />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(progress)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء التدريب الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{stats.monthlyHours}</div>
                      <div className="text-sm text-muted-foreground">ساعة تدريب هذا الشهر</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">+15%</div>
                      <div className="text-sm text-muted-foreground">زيادة عن الشهر الماضي</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أفضل الدورات أداءً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockCourses.slice(0, 3).map((course, index) => (
                      <div key={course.id} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium line-clamp-1">{course.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {course.enrollments} متدرب • ⭐ {course.rating}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>تقرير شامل عن فعالية التدريب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-muted-foreground">دورة مكتملة</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">89</div>
                    <div className="text-sm text-muted-foreground">شهادة صادرة</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">156</div>
                    <div className="text-sm text-muted-foreground">متدرب نشط</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">4.7</div>
                    <div className="text-sm text-muted-foreground">تقييم عام</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 ml-2" />
                    تصدير التقرير
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 ml-2" />
                    جدولة التقارير
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}