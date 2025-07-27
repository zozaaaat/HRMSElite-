import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  DollarSign,
  Target,
  Users,
  BarChart3,
  Activity,
  Star,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Heart
} from "lucide-react";

interface Employee360ViewProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

export function Employee360View({ isOpen, onClose, employeeId }: Employee360ViewProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock employee data - in real app this would come from API
  const employee = {
    id: employeeId,
    fullName: "أحمد محمد الأحمد",
    position: "مطور برمجيات أول",
    department: "تقنية المعلومات",
    email: "ahmed.mohamed@company.com",
    phone: "+966551234567",
    avatar: "",
    joinDate: "2022-03-15",
    birthDate: "1990-05-20",
    location: "الرياض، السعودية",
    employeeCode: "EMP-2022-001",
    manager: "محمد عبدالله السالم",
    workLocation: "المكتب الرئيسي",
    contractType: "دوام كامل",
    salary: 15000,
    performance: {
      overall: 4.2,
      punctuality: 4.5,
      teamwork: 4.0,
      innovation: 4.3,
      communication: 4.1,
      goals: 85,
      projects: 12,
      completedTasks: 145
    },
    skills: [
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Node.js", level: 80 },
      { name: "Python", level: 75 },
      { name: "SQL", level: 70 }
    ],
    certifications: [
      { name: "AWS Cloud Practitioner", date: "2023-12-01", issuer: "Amazon" },
      { name: "React Professional", date: "2023-08-15", issuer: "Meta" },
      { name: "Scrum Master", date: "2023-03-20", issuer: "Scrum Alliance" }
    ],
    attendance: {
      thisMonth: {
        present: 22,
        absent: 1,
        late: 2,
        early: 1
      },
      trends: [
        { month: "يناير", rate: 96 },
        { month: "ديسمبر", rate: 94 },
        { month: "نوفمبر", rate: 98 },
        { month: "أكتوبر", rate: 95 },
        { month: "سبتمبر", rate: 97 }
      ]
    },
    projects: [
      {
        name: "تطوير نظام إدارة المخزون",
        status: "قيد التنفيذ",
        progress: 75,
        deadline: "2025-03-01",
        role: "مطور رئيسي"
      },
      {
        name: "تحديث موقع الشركة",
        status: "مكتمل",
        progress: 100,
        deadline: "2024-12-15",
        role: "مطور frontend"
      },
      {
        name: "نظام إدارة العملاء CRM",
        status: "التخطيط",
        progress: 25,
        deadline: "2025-06-01",
        role: "مطور فرعي"
      }
    ],
    recentActivities: [
      { date: "2025-01-27", activity: "تسليم مهمة تطوير واجهة المستخدم", type: "task" },
      { date: "2025-01-26", activity: "حضور اجتماع فريق المشروع", type: "meeting" },
      { date: "2025-01-25", activity: "مراجعة كود البرنامج", type: "review" },
      { date: "2025-01-24", activity: "تدريب على تقنيات جديدة", type: "training" }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مكتمل': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'قيد التنفيذ': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'التخطيط': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'meeting': return <Users className="h-4 w-4 text-blue-500" />;
      case 'review': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'training': return <GraduationCap className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            عرض الموظف 360 درجة
          </DialogTitle>
        </DialogHeader>

        {/* Employee Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {employee.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                <p className="text-lg text-muted-foreground">{employee.position}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {employee.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    انضم في {employee.joinDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {employee.workLocation}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{employee.performance.overall}/5</div>
                <div className="text-sm text-muted-foreground">التقييم الإجمالي</div>
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(employee.performance.overall) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="performance">الأداء</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="skills">المهارات</TabsTrigger>
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="activities">الأنشطة</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.performance.goals}%</div>
                  <div className="text-sm text-muted-foreground">إنجاز الأهداف</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.performance.projects}</div>
                  <div className="text-sm text-muted-foreground">مشروع مكتمل</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.performance.completedTasks}</div>
                  <div className="text-sm text-muted-foreground">مهمة منجزة</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.salary.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">الراتب الشهري</div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                      <span className="font-medium">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">رقم الهاتف:</span>
                      <span className="font-medium">{employee.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">تاريخ الميلاد:</span>
                      <span className="font-medium">{employee.birthDate}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">رقم الموظف:</span>
                      <span className="font-medium">{employee.employeeCode}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">المدير المباشر:</span>
                      <span className="font-medium">{employee.manager}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">نوع العقد:</span>
                      <span className="font-medium">{employee.contractType}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">الالتزام بالمواعيد</span>
                          <span className="text-sm text-muted-foreground">{employee.performance.punctuality}/5</span>
                        </div>
                        <Progress value={employee.performance.punctuality * 20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">العمل الجماعي</span>
                          <span className="text-sm text-muted-foreground">{employee.performance.teamwork}/5</span>
                        </div>
                        <Progress value={employee.performance.teamwork * 20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">الابتكار</span>
                          <span className="text-sm text-muted-foreground">{employee.performance.innovation}/5</span>
                        </div>
                        <Progress value={employee.performance.innovation * 20} className="h-2" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">التواصل</span>
                          <span className="text-sm text-muted-foreground">{employee.performance.communication}/5</span>
                        </div>
                        <Progress value={employee.performance.communication * 20} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">تحقيق الأهداف</span>
                          <span className="text-sm text-muted-foreground">{employee.performance.goals}%</span>
                        </div>
                        <Progress value={employee.performance.goals} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="space-y-4">
              {employee.projects.map((project, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">الدور: {project.role}</p>
                        <p className="text-xs text-muted-foreground">موعد التسليم: {project.deadline}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {project.progress}% مكتمل
                        </div>
                        <Progress value={project.progress} className="h-2 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المهارات التقنية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الشهادات والتدريبات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">من {cert.issuer}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {cert.date}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.attendance.thisMonth.present}</div>
                  <div className="text-sm text-muted-foreground">يوم حضور</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.attendance.thisMonth.absent}</div>
                  <div className="text-sm text-muted-foreground">يوم غياب</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.attendance.thisMonth.late}</div>
                  <div className="text-sm text-muted-foreground">تأخير</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{employee.attendance.thisMonth.early}</div>
                  <div className="text-sm text-muted-foreground">انصراف مبكر</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الأنشطة الأخيرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employee.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}