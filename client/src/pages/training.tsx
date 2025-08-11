import {useState} from 'react';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Badge} from '../components/ui/badge';
import {Progress} from '../components/ui/progress';
import {Input} from '../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Clock,
  Play,
  CheckCircle,
  Plus,
  Search,
  Filter,
  User,
  Target,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';

export default function Training () {

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

function TrainingContent () {

  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // React Query calls removed as data/mutations are not used on this page

  const mockCourses = [
    {
      'id': '1',
      'title': 'أساسيات إدارة الموارد البشرية',
      'description': 'دورة شاملة تغطي مبادئ وممارسات إدارة الموارد البشرية الحديثة',
      'category': 'hr',
      'level': 'مبتدئ',
      'duration': '8 ساعات',
      'instructor': 'د. أحمد السيد',
      'enrolledCount': 24,
      'maxCapacity': 30,
      'startDate': '2025-02-01',
      'status': 'upcoming',
      'progress': 0,
      'rating': 4.8,
      'certificate': true
    },
    {
      'id': '2',
      'title': 'إدارة الأداء والتقييم',
      'description': 'تعلم كيفية تطوير أنظمة تقييم الأداء الفعالة وإدارة دورات المراجعة',
      'category': 'performance',
      'level': 'متوسط',
      'duration': '12 ساعة',
      'instructor': 'أ. فاطمة محمود',
      'enrolledCount': 18,
      'maxCapacity': 25,
      'startDate': '2025-01-25',
      'status': 'ongoing',
      'progress': 65,
      'rating': 4.9,
      'certificate': true
    },
    {
      'id': '3',
      'title': 'قوانين العمل والامتثال',
      'description': 'دراسة شاملة لقوانين العمل المحلية ومتطلبات الامتثال القانوني',
      'category': 'legal',
      'level': 'متقدم',
      'duration': '16 ساعة',
      'instructor': 'أ. محمد عبدالله',
      'enrolledCount': 12,
      'maxCapacity': 20,
      'startDate': '2025-01-20',
      'status': 'ongoing',
      'progress': 40,
      'rating': 4.7,
      'certificate': true
    },
    {
      'id': '4',
      'title': 'التدريب على برامج الحاسوب',
      'description': 'تدريب متقدم على أنظمة إدارة الموارد البشرية وبرامج المكتب',
      'category': 'technical',
      'level': 'مبتدئ',
      'duration': '6 ساعات',
      'instructor': 'م. خالد أحمد',
      'enrolledCount': 30,
      'maxCapacity': 30,
      'startDate': '2025-01-15',
      'status': 'completed',
      'progress': 100,
      'rating': 4.6,
      'certificate': true
    }
  ];

  const mockEmployeeProgress = [
    {
      'id': '1',
      'employeeName': 'أحمد محمد علي',
      'department': 'المبيعات',
      'coursesEnrolled': 3,
      'coursesCompleted': 2,
      'totalHours': 26,
      'certificatesEarned': 2,
      'currentCourse': 'إدارة الأداء والتقييم',
      'progress': 65,
      'lastActivity': '2025-01-28'
    },
    {
      'id': '2',
      'employeeName': 'فاطمة سالم أحمد',
      'department': 'المحاسبة',
      'coursesEnrolled': 2,
      'coursesCompleted': 1,
      'totalHours': 14,
      'certificatesEarned': 1,
      'currentCourse': 'قوانين العمل والامتثال',
      'progress': 40,
      'lastActivity': '2025-01-27'
    },
    {
      'id': '3',
      'employeeName': 'خالد عبدالرحمن',
      'department': 'التكنولوجيا',
      'coursesEnrolled': 4,
      'coursesCompleted': 3,
      'totalHours': 38,
      'certificatesEarned': 3,
      'currentCourse': 'أساسيات إدارة الموارد البشرية',
      'progress': 0,
      'lastActivity': '2025-01-26'
    }
  ];

  const getStatusColor = (status: string) => {

    switch (status) {

    case 'upcoming': return 'bg-blue-100 text-blue-800';
    case 'ongoing': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';

    }

  };

  const getStatusText = (status: string) => {

    switch (status) {

    case 'upcoming': return 'قادمة';
    case 'ongoing': return 'جارية';
    case 'completed': return 'مكتملة';
    default: return status;

    }

  };

  const getLevelColor = (level: string) => {

    switch (level) {

    case 'مبتدئ': return 'bg-green-100 text-green-800';
    case 'متوسط': return 'bg-yellow-100 text-yellow-800';
    case 'متقدم': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';

    }

  };


  const filteredCourses = mockCourses.filter(course => {

    const matchesSearch = course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course?.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course?.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التدريب والتطوير</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              برامج تدريبية شاملة لتطوير مهارات الموظفين
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 ml-2" />
              دورة جديدة
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في الدورات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="hr">موارد بشرية</SelectItem>
              <SelectItem value="performance">إدارة الأداء</SelectItem>
              <SelectItem value="legal">قانونية</SelectItem>
              <SelectItem value="technical">تقنية</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>المجموع: {filteredCourses.length} دورة</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-2xl font-bold">84</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">شهادات مُنحت</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">معدل الإتمام</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              الدورات
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              تقدم الموظفين
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              الشهادات
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course?.id ?? 'unknown'} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{
  course?.title ?? 'غير محدد'
}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(course?.status ?? '')}>
                          {getStatusText(course?.status ?? '')}
                        </Badge>
                        <Badge className={getLevelColor(course?.level ?? '')}>
                          {course?.level ?? 'غير محدد'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{course.startDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{course.enrolledCount}/{course.maxCapacity}</span>
                        </div>
                      </div>

                      {course.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>التقدم</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">تقييم: {course.rating}</span>
                          {course.certificate && (
                            <Badge variant="outline" className="text-xs">
                              شهادة معتمدة
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Bookmark className="h-4 w-4 ml-1" />
                            حفظ
                          </Button>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Play className="h-4 w-4 ml-1" />
                            {course.status === 'completed' ? 'مراجعة' : 'بدء'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {mockEmployeeProgress.map((employee) => (
                <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {employee.employeeName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">{employee.department}</p>
                        <p className="text-sm text-gray-500">آخر نشاط: {employee.lastActivity}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        تفاصيل التقدم
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">الإحصائيات</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">الدورات المسجلة:</span>
                            <span className="font-medium">{employee.coursesEnrolled}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">الدورات المكتملة:</span>
                            <span className="font-medium">{employee.coursesCompleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">إجمالي الساعات:</span>
                            <span className="font-medium">{employee.totalHours} ساعة</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">الشهادات المكتسبة:</span>
                            <span className="font-medium">{employee.certificatesEarned}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">الدورة الحالية</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{employee.currentCourse}</span>
                              <span>{employee.progress}%</span>
                            </div>
                            <Progress value={employee.progress} className="h-2" />
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>معدل الإتمام: {
  Math.round((employee.coursesCompleted / employee.coursesEnrolled) * 100)
}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  'id': '1',
                  'courseName': 'أساسيات إدارة الموارد البشرية',
                  'employeeName': 'أحمد محمد علي',
                  'completionDate': '2025-01-20',
                  'score': '95%',
                  'instructor': 'د. أحمد السيد',
                  'status': 'issued'
                },
                {
                  'id': '2',
                  'courseName': 'التدريب على برامج الحاسوب',
                  'employeeName': 'خالد عبدالرحمن',
                  'completionDate': '2025-01-18',
                  'score': '88%',
                  'instructor': 'م. خالد أحمد',
                  'status': 'issued'
                },
                {
                  'id': '3',
                  'courseName': 'إدارة الأداء والتقييم',
                  'employeeName': 'فاطمة سالم أحمد',
                  'completionDate': '2025-01-15',
                  'score': '92%',
                  'instructor': 'أ. فاطمة محمود',
                  'status': 'pending'
                }
              ].map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Award className="h-16 w-16 text-yellow-500 mx-auto" />

                      <div>
                        <h3 className="font-bold text-lg mb-2">{cert.courseName}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{cert.employeeName}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ الإتمام:</span>
                          <span>{cert.completionDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">النتيجة:</span>
                          <span className="font-medium text-green-600">{cert.score}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">المدرب:</span>
                          <span>{cert.instructor}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          عرض الشهادة
                        </Button>
                        <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          تحميل PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تقرير الإتمام الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {'month': 'يناير 2025', 'completed': 23, 'total': 30, 'percentage': 77},
                      {'month': 'ديسمبر 2024', 'completed': 28, 'total': 32, 'percentage': 88},
                      {'month': 'نوفمبر 2024', 'completed': 19, 'total': 25, 'percentage': 76},
                      {'month': 'أكتوبر 2024', 'completed': 31, 'total': 35, 'percentage': 89}
                    ].map((report, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{report.month}</span>
                          <span>{report.completed}/{report.total} ({report.percentage}%)</span>
                        </div>
                        <Progress value={report.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أداء الأقسام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {'department': 'المبيعات', 'employees': 15, 'completed': 89},
                      {'department': 'المحاسبة', 'employees': 8, 'completed': 95},
                      {'department': 'التكنولوجيا', 'employees': 6, 'completed': 83},
                      {'department': 'الموارد البشرية', 'employees': 5, 'completed': 92}
                    ].map((dept, index) => (
                      <div key={
  index
} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium">{dept.department}</div>
                          <div className="text-sm text-gray-600">{dept.employees} موظف</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-purple-600">
                            {dept.completed}%
                          </div>
                          <div className="text-sm text-gray-600">معدل الإتمام</div>
                        </div>
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
