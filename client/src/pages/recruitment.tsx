import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Badge} from '../components/ui/badge';
import {
  Briefcase,
  Users,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  X,
  Plus,
  Search,
  Calendar,
  Star,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import {LoadingSpinner, ErrorMessage} from '../components/shared';

export default function Recruitment () {

  return (
    <SharedLayout
      userRole="company_manager"
      userName="مدير الشركة"
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <RecruitmentContent />
    </SharedLayout>
  );

}

function RecruitmentContent () {

  const [activeTab, setActiveTab] = useState('jobs');

  const {isLoading: jobsLoading, error: jobsError} = useQuery({
    'queryKey': ['/api/recruitment/jobs']
  });

  const {isLoading: applicantsLoading, error: applicantsError} = useQuery({
  
    'queryKey': ['/api/recruitment/applicants']
  });

  const mockJobs = [
    {
      'id': '1',
      'title': 'محاسب أول',
      'department': 'المحاسبة',
      'location': 'الكويت',
      'type': 'دوام كامل',
      'applicants': 25,
      'status': 'active',
      'postedDate': '2025-01-20',
      'deadline': '2025-02-20',
      'experience': '3-5 سنوات',
      'salary': '800-1200 د.ك',
      'description': 'مطلوب محاسب أول للعمل في قسم المحاسبة'
    },
    {
      'id': '2',
      'title': 'مطور تطبيقات',
      'department': 'التكنولوجيا',
      'location': 'الكويت',
      'type': 'دوام كامل',
      'applicants': 18,
      'status': 'active',
      'postedDate': '2025-01-18',
      'deadline': '2025-02-15',
      'experience': '2-4 سنوات',
      'salary': '1000-1500 د.ك',
      'description': 'مطلوب مطور تطبيقات للعمل على تطوير الأنظمة'
    },
    {
      'id': '3',
      'title': 'مسؤول موارد بشرية',
      'department': 'الموارد البشرية',
      'location': 'الكويت',
      'type': 'دوام جزئي',
      'applicants': 32,
      'status': 'closed',
      'postedDate': '2025-01-10',
      'deadline': '2025-01-25',
      'experience': '5+ سنوات',
      'salary': '1200-1800 د.ك',
      'description': 'مطلوب مسؤول موارد بشرية ذو خبرة عالية'
    }
  ];

  const mockApplicants = [
    {
      'id': '1',
      'name': 'أحمد محمد علي',
      'email': 'ahmed@email.com',
      'phone': '+965 9999 8888',
      'position': 'محاسب أول',
      'experience': '4 سنوات',
      'status': 'pending',
      'appliedDate': '2025-01-22',
      'rating': 4.2,
      'cv': 'cv_ahmed.pdf'
    },
    {
      'id': '2',
      'name': 'فاطمة سالم أحمد',
      'email': 'fatima@email.com',
      'phone': '+965 7777 6666',
      'position': 'مطور تطبيقات',
      'experience': '3 سنوات',
      'status': 'interview',
      'appliedDate': '2025-01-20',
      'rating': 4.8,
      'cv': 'cv_fatima.pdf'
    },
    {
      'id': '3',
      'name': 'محمد عبدالله خالد',
      'email': 'mohammed@email.com',
      'phone': '+965 5555 4444',
      'position': 'مسؤول موارد بشرية',
      'experience': '6 سنوات',
      'status': 'accepted',
      'appliedDate': '2025-01-15',
      'rating': 4.9,
      'cv': 'cv_mohammed.pdf'
    }
  ];

  const getStatusColor = (status: string) => {

    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-red-100 text-red-800',
      'draft': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'interview': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] ?? colors.pending;

  };

  const getStatusName = (status: string) => {

    const names: Record<string, string> = {
      'active': 'نشط',
      'closed': 'مغلق',
      'draft': 'مسودة',
      'pending': 'قيد المراجعة',
      'interview': 'مقابلة',
      'accepted': 'مقبول',
      'rejected': 'مرفوض'
    };
    return names[status] ?? 'غير محدد';

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التوظيف والاستقطاب</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              إدارة الوظائف الشاغرة والمتقدمين وعمليات التوظيف
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Search className="h-4 w-4 ml-2" />
              البحث
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة وظيفة جديدة
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              الوظائف الشاغرة
            </TabsTrigger>
            <TabsTrigger value="applicants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              المتقدمون
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              المقابلات
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">الوظائف النشطة</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المتقدمين</p>
                      <p className="text-2xl font-bold">187</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">المقابلات المجدولة</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تم توظيفهم هذا الشهر</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsLoading && <LoadingSpinner text="جاري تحميل الوظائف..." />}
              {
  jobsError && <ErrorMessage error={
  jobsError
} title="خطأ في تحميل الوظائف" onRetry={
  () => window.location.reload()
} />
}
              {!jobsLoading && !jobsError && mockJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {job.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusName(job.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {job.applicants} متقدم
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">القسم:</span>
                          <p className="font-medium">{job.department}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">الخبرة:</span>
                          <p className="font-medium">{job.experience}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">الراتب:</span>
                          <p className="font-medium">{job.salary}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">آخر موعد:</span>
                          <p className="font-medium">{job.deadline}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                          <Users className="h-4 w-4 ml-1" />
                          المتقدمون
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {applicantsLoading && <LoadingSpinner text="جاري تحميل المتقدمين..." />}
              {
  applicantsError && <ErrorMessage error={
  applicantsError
} title="خطأ في تحميل المتقدمين" onRetry={
  () => window.location.reload()
} />
}
              {!applicantsLoading && !applicantsError && mockApplicants.map((applicant) => (
                <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="text-xl font-bold">{applicant.name}</h3>
                            <p className="text-gray-600">{applicant.position}</p>
                          </div>
                          <Badge className={getStatusColor(applicant.status)}>
                            {getStatusName(applicant.status)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">البريد الإلكتروني:</span>
                            <p className="font-medium">{applicant.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الهاتف:</span>
                            <p className="font-medium">{applicant.phone}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">الخبرة:</span>
                            <p className="font-medium">{applicant.experience}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{applicant.rating}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            تاريخ التقديم: {applicant.appliedDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض السيرة
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 ml-1" />
                          قبول
                        </Button>
                        <Button size="sm" variant="destructive">
                          <X className="h-4 w-4 ml-1" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  'candidate': 'أحمد محمد علي',
                  'position': 'محاسب أول',
                  'date': '2025-01-30',
                  'time': '10:00 ص',
                  'interviewer': 'مدير المحاسبة',
                  'status': 'scheduled'
                },
                {
                  'candidate': 'فاطمة سالم أحمد',
                  'position': 'مطور تطبيقات',
                  'date': '2025-01-31',
                  'time': '2:00 م',
                  'interviewer': 'مدير التكنولوجيا',
                  'status': 'scheduled'
                },
                {
                  'candidate': 'خالد عبدالرحمن',
                  'position': 'مسؤول مبيعات',
                  'date': '2025-02-01',
                  'time': '11:00 ص',
                  'interviewer': 'مدير المبيعات',
                  'status': 'completed'
                }
              ].map((interview, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{interview.candidate}</CardTitle>
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status === 'scheduled' ? 'مجدولة' : 'مكتملة'}
                      </Badge>
                    </div>
                    <CardDescription>{interview.position}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">التاريخ:</span>
                          <p className="font-medium">{interview.date}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">الوقت:</span>
                          <p className="font-medium">{interview.time}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">المقابل:</span>
                        <p className="font-medium">{interview.interviewer}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 ml-1" />
                          إعادة جدولة
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Eye className="h-4 w-4 ml-1" />
                          التفاصيل
                        </Button>
                      </div>
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
                  <CardTitle>معدل التوظيف الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">65%</div>
                      <div className="text-sm text-gray-600">معدل نجاح التوظيف</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المتقدمون المقبولون</span>
                        <span className="font-medium">24 من 37</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أكثر الوظائف طلباً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {'position': 'مطور تطبيقات', 'applications': 45},
                      {'position': 'محاسب', 'applications': 38},
                      {'position': 'مسؤول مبيعات', 'applications': 32},
                      {'position': 'مصمم جرافيك', 'applications': 28}
                    ].map((job, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{job.position}</span>
                        <span className="font-medium">{job.applications} طلب</span>
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
