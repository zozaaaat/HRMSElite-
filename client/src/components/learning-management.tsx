import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  Play, 
  BookOpen, 
  Users, 
  Award,
  Clock,
  Star,
  CheckCircle,
  Video,
  FileText,
  Target,
  TrendingUp
} from "lucide-react";

interface LearningManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LearningManagement({ isOpen, onClose }: LearningManagementProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const courses = [
    {
      id: '1',
      title: 'أساسيات إدارة الموارد البشرية',
      description: 'دورة شاملة لتعلم أساسيات إدارة الموارد البشرية',
      instructor: 'د. أحمد الخبير',
      duration: '4 ساعات',
      level: 'مبتدئ',
      enrolled: 85,
      rating: 4.8,
      progress: 60,
      category: 'hr',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'قوانين العمل السعودية',
      description: 'التعرف على أحدث قوانين العمل في السعودية',
      instructor: 'أ. سارة القانونية',
      duration: '3 ساعات',
      level: 'متوسط',
      enrolled: 120,
      rating: 4.9,
      progress: 0,
      category: 'legal',
      status: 'not-started'
    },
    {
      id: '3',
      title: 'تطوير المهارات القيادية',
      description: 'برنامج متكامل لتطوير المهارات القيادية',
      instructor: 'د. محمد المدرب',
      duration: '6 ساعات',
      level: 'متقدم',
      enrolled: 45,
      rating: 4.7,
      progress: 100,
      category: 'leadership',
      status: 'completed'
    }
  ];

  const learningPaths = [
    {
      id: 'p1',
      title: 'مسار مدير الموارد البشرية',
      description: 'برنامج شامل لتأهيل مديري الموارد البشرية',
      courses: 8,
      duration: '40 ساعة',
      level: 'متقدم',
      enrolled: 25
    },
    {
      id: 'p2',
      title: 'مسار موظف الموارد البشرية',
      description: 'التدريب الأساسي لموظفي الموارد البشرية',
      courses: 5,
      duration: '20 ساعة',
      level: 'مبتدئ',
      enrolled: 60
    },
    {
      id: 'p3',
      title: 'مسار القيادة والإدارة',
      description: 'تطوير المهارات القيادية والإدارية',
      courses: 6,
      duration: '30 ساعة',
      level: 'متوسط',
      enrolled: 40
    }
  ];

  const certificates = [
    {
      id: '1',
      title: 'شهادة أساسيات الموارد البشرية',
      issueDate: '2024-01-15',
      expiryDate: '2026-01-15',
      status: 'active',
      employee: 'أحمد محمد'
    },
    {
      id: '2',
      title: 'شهادة القيادة المتقدمة',
      issueDate: '2024-02-20',
      expiryDate: '2026-02-20',
      status: 'active',
      employee: 'سارة أحمد'
    },
    {
      id: '3',
      title: 'شهادة قوانين العمل',
      issueDate: '2023-12-10',
      expiryDate: '2025-12-10',
      status: 'expires-soon',
      employee: 'محمد علي'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'متوسط': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'متقدم': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'not-started': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            نظام إدارة التعلم والتطوير
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses">الدورات</TabsTrigger>
            <TabsTrigger value="paths">مسارات التعلم</TabsTrigger>
            <TabsTrigger value="certificates">الشهادات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">الدورات التدريبية</h3>
              <Button>
                <BookOpen className="h-4 w-4 ml-2" />
                إضافة دورة
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedCourse(course.id)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status === 'completed' ? 'مكتمل' :
                             course.status === 'in-progress' ? 'قيد التقدم' : 'لم يبدأ'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.enrolled} مشترك
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>المدرب: {course.instructor}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                      </div>

                      {course.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>التقدم</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                      )}

                      <Button className="w-full" variant={course.status === 'not-started' ? 'default' : 'outline'}>
                        {course.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-4 w-4 ml-2" />
                            مراجعة
                          </>
                        ) : course.status === 'in-progress' ? (
                          <>
                            <Play className="h-4 w-4 ml-2" />
                            متابعة
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 ml-2" />
                            بدء الدورة
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">مسارات التعلم</h3>
              <Button>
                <Target className="h-4 w-4 ml-2" />
                إنشاء مسار
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {learningPaths.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {path.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{path.courses}</div>
                        <div className="text-sm text-muted-foreground">دورة تدريبية</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{path.enrolled}</div>
                        <div className="text-sm text-muted-foreground">مشترك</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>المدة الإجمالية:</span>
                        <span>{path.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>المستوى:</span>
                        <Badge className={getLevelColor(path.level)}>{path.level}</Badge>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Play className="h-4 w-4 ml-2" />
                      بدء المسار
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">الشهادات والاعتمادات</h3>
              <Button>
                <Award className="h-4 w-4 ml-2" />
                إصدار شهادة
              </Button>
            </div>

            <div className="space-y-4">
              {certificates.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cert.title}</h4>
                          <p className="text-sm text-muted-foreground">الموظف: {cert.employee}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>تاريخ الإصدار: {cert.issueDate}</span>
                            <span>تاريخ الانتهاء: {cert.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={cert.status === 'expires-soon' ? 'destructive' : 'default'}>
                        {cert.status === 'active' ? 'نشطة' : 'تنتهي قريباً'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">دورة متاحة</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">320</div>
                  <div className="text-sm text-muted-foreground">مشترك نشط</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-muted-foreground">شهادة مكتملة</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-sm text-muted-foreground">معدل الإكمال</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>أداء التعلم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل إكمال الدورات</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <Progress value={87} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">رضا المتدربين</span>
                    <span className="text-sm font-medium">4.8/5</span>
                  </div>
                  <Progress value={96} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">وقت التعلم الشهري</span>
                    <span className="text-sm font-medium">12 ساعة</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}