import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Plus, Calendar, Users, CheckCircle, Clock, AlertTriangle, Target, Briefcase, User, Edit, Trash2, MessageSquare, Paperclip, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  teamMembers: string[];
  manager: string;
  tasksCount: number;
  completedTasks: number;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  comments: Comment[];
  attachments: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export function ProjectManagementSystem() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const mockProjects: Project[] = [
    {
      id: "1",
      name: "تطوير نظام الحضور والانصراف",
      description: "تطوير وتنفيذ نظام إلكتروني لتتبع حضور وانصراف الموظفين",
      status: "active",
      priority: "high",
      startDate: "2025-01-01",
      endDate: "2025-03-15",
      progress: 65,
      budget: 50000,
      teamMembers: ["أحمد محمد", "سارة أحمد", "محمد علي"],
      manager: "أحمد محمد",
      tasksCount: 12,
      completedTasks: 8
    },
    {
      id: "2", 
      name: "تحديث نظام كشوف المرتبات",
      description: "تحديث وتحسين نظام كشوف المرتبات ليتوافق مع اللوائح الجديدة",
      status: "planning",
      priority: "medium",
      startDate: "2025-02-01",
      endDate: "2025-04-30",
      progress: 25,
      budget: 75000,
      teamMembers: ["سارة أحمد", "عبدالله سالم"],
      manager: "سارة أحمد",
      tasksCount: 8,
      completedTasks: 2
    },
    {
      id: "3",
      name: "تدريب الموظفين على النظام الجديد",
      description: "برنامج تدريبي شامل لجميع الموظفين على استخدام النظام الجديد",
      status: "completed",
      priority: "medium",
      startDate: "2024-12-01",
      endDate: "2024-12-31",
      progress: 100,
      budget: 25000,
      teamMembers: ["محمد علي", "فاطمة خالد"],
      manager: "محمد علي",
      tasksCount: 15,
      completedTasks: 15
    }
  ];

  const mockTasks: Task[] = [
    {
      id: "1",
      projectId: "1",
      title: "تصميم واجهة المستخدم",
      description: "تصميم واجهة سهلة الاستخدام لنظام الحضور والانصراف",
      status: "completed",
      priority: "high",
      assignee: "سارة أحمد",
      dueDate: "2025-01-15",
      estimatedHours: 40,
      actualHours: 35,
      tags: ["تصميم", "واجهة مستخدم"],
      comments: [],
      attachments: ["design-mockups.pdf"]
    },
    {
      id: "2",
      projectId: "1", 
      title: "تطوير خوارزمية التعرف على الوجه",
      description: "تطوير وتنفيذ خوارزمية ذكية للتعرف على وجوه الموظفين",
      status: "in-progress",
      priority: "high",
      assignee: "أحمد محمد",
      dueDate: "2025-02-01",
      estimatedHours: 80,
      actualHours: 45,
      tags: ["ذكاء اصطناعي", "تطوير"],
      comments: [
        {
          id: "1",
          author: "أحمد محمد",
          content: "تم إكمال 60% من العمل، النتائج الأولية مشجعة",
          timestamp: "2025-01-20T10:30:00Z"
        }
      ],
      attachments: ["algorithm-specs.pdf", "test-results.xlsx"]
    },
    {
      id: "3",
      projectId: "1",
      title: "اختبار النظام",
      description: "اختبار شامل للنظام مع مجموعة من المستخدمين",
      status: "todo",
      priority: "medium", 
      assignee: "محمد علي",
      dueDate: "2025-02-15",
      estimatedHours: 30,
      tags: ["اختبار", "ضمان الجودة"],
      comments: [],
      attachments: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "on-hold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "todo": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "review": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "in-progress": case "active": return <Clock className="h-4 w-4" />;
      case "on-hold": return <AlertTriangle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTasks = mockTasks.filter(task => {
    if (!selectedProject) return false;
    return task.projectId === selectedProject.id;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-blue-600" />
            إدارة المشاريع والمهام
          </h1>
          <p className="text-muted-foreground">
            متابعة وإدارة المشاريع والمهام بكفاءة
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                مشروع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء مشروع جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المشروع الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">اسم المشروع</Label>
                  <Input id="projectName" placeholder="أدخل اسم المشروع" />
                </div>
                <div>
                  <Label htmlFor="projectDesc">الوصف</Label>
                  <Textarea id="projectDesc" placeholder="وصف المشروع" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الأولوية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="urgent">عاجلة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budget">الميزانية</Label>
                    <Input id="budget" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={() => {
                    toast({ title: "تم إنشاء المشروع بنجاح" });
                    setIsNewProjectOpen(false);
                  }}>
                    إنشاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاريع</p>
                <p className="text-2xl font-bold text-blue-600">{mockProjects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المشاريع النشطة</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockProjects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockProjects.reduce((sum, p) => sum + p.completedTasks, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الميزانية</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">المشاريع</TabsTrigger>
          <TabsTrigger value="tasks">المهام</TabsTrigger>
          <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المشاريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="planning">التخطيط</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="on-hold">متوقف</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProject(project)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {getStatusIcon(project.status)}
                        <span className="mr-1">
                          {project.status === 'planning' ? 'التخطيط' :
                           project.status === 'active' ? 'نشط' :
                           project.status === 'on-hold' ? 'متوقف' : 'مكتمل'}
                        </span>
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority === 'low' ? 'منخفضة' :
                         project.priority === 'medium' ? 'متوسطة' :
                         project.priority === 'high' ? 'عالية' : 'عاجلة'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>التقدم</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{project.teamMembers.length} أعضاء</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{project.completedTasks}/{project.tasksCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">المدير:</span>
                    <span className="font-medium">{project.manager}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">الميزانية:</span>
                    <span className="font-medium">{project.budget.toLocaleString()} ر.س</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          {!selectedProject ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">اختر مشروعاً لعرض المهام</h3>
              <p className="text-muted-foreground">قم بالنقر على أحد المشاريع لعرض مهامه</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">مهام مشروع: {selectedProject.name}</h2>
                  <p className="text-sm text-muted-foreground">{filteredTasks.length} مهمة</p>
                </div>
                <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      مهمة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" dir="rtl">
                    <DialogHeader>
                      <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                      <DialogDescription>
                        أدخل تفاصيل المهمة الجديدة للمشروع: {selectedProject.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="taskTitle">عنوان المهمة</Label>
                        <Input id="taskTitle" placeholder="أدخل عنوان المهمة" />
                      </div>
                      <div>
                        <Label htmlFor="taskDesc">الوصف</Label>
                        <Textarea id="taskDesc" placeholder="وصف المهمة" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="taskPriority">الأولوية</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الأولوية" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">منخفضة</SelectItem>
                              <SelectItem value="medium">متوسطة</SelectItem>
                              <SelectItem value="high">عالية</SelectItem>
                              <SelectItem value="urgent">عاجلة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="taskHours">الساعات المقدرة</Label>
                          <Input id="taskHours" type="number" placeholder="0" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={() => {
                          toast({ title: "تم إنشاء المهمة بنجاح" });
                          setIsNewTaskOpen(false);
                        }}>
                          إنشاء
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {getStatusIcon(task.status)}
                              <span className="mr-1">
                                {task.status === 'todo' ? 'للإنجاز' :
                                 task.status === 'in-progress' ? 'قيد التنفيذ' :
                                 task.status === 'review' ? 'للمراجعة' : 'مكتملة'}
                              </span>
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority === 'low' ? 'منخفضة' :
                               task.priority === 'medium' ? 'متوسطة' :
                               task.priority === 'high' ? 'عالية' : 'عاجلة'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{task.assignee}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{task.estimatedHours}ساعة</span>
                            </div>
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex items-center gap-2">
                              {task.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => console.log('تحرير المهمة:', task.title)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => console.log('عرض تعليقات المهمة:', task.title)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => console.log('عرض مرفقات المهمة:', task.title)}>
                            <Paperclip className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الجدول الزمني للمشاريع</h3>
            <p className="text-muted-foreground">عرض تفصيلي للجدول الزمني لجميع المشاريع والمهام</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}