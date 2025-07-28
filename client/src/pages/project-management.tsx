import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  BarChart3,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { apiRequest } from "@/lib/queryClient";

export default function ProjectManagement() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <ProjectManagementContent />
    </SharedLayout>
  );
}

function ProjectManagementContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Fetch project tasks when a project is selected
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/projects', selectedProject, 'tasks'],
    enabled: !!selectedProject,
  });

  const filteredProjects = projects.filter((project: any) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'planning': return 'تخطيط';
      case 'completed': return 'مكتمل';
      case 'on_hold': return 'متوقف';
      default: return 'غير محدد';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return 'غير محدد';
    }
  };

  if (selectedProject && !projectsLoading) {
    const project = projects.find((p: any) => p.id === selectedProject);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedProject(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للمشاريع
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {project?.description}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(project?.status)}>
              {getStatusText(project?.status)}
            </Badge>
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">التقدم</p>
                    <p className="text-2xl font-bold">{project?.progress}%</p>
                  </div>
                </div>
                <Progress value={project?.progress} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">حجم الفريق</p>
                    <p className="text-2xl font-bold">{project?.teamSize}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">تاريخ الانتهاء</p>
                    <p className="text-lg font-semibold">{new Date(project?.endDate).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الميزانية</p>
                    <p className="text-lg font-semibold">{project?.budget?.toLocaleString()} ريال</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  مهام المشروع
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة مهمة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">جاري تحميل المهام...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityText(task.priority)}
                          </Badge>
                          <Badge variant="outline">
                            {task.status === 'completed' ? 'مكتمل' : 
                             task.status === 'in_progress' ? 'قيد التنفيذ' : 
                             task.status === 'pending' ? 'معلق' : 'غير محدد'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>المسؤول: {task.assignee}</span>
                          <span>الموعد: {new Date(task.dueDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.progress}%</span>
                          <Progress value={task.progress} className="w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المشاريع</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              متابعة وإدارة جميع مشاريع الشركة والمهام المرتبطة بها
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 ml-2" />
            مشروع جديد
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المشاريع</p>
                      <p className="text-2xl font-bold">{projects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">المشاريع النشطة</p>
                      <p className="text-2xl font-bold">
                        {projects.filter((p: any) => p.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">قيد التخطيط</p>
                      <p className="text-2xl font-bold">
                        {projects.filter((p: any) => p.status === 'planning').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">مكتملة</p>
                      <p className="text-2xl font-bold">
                        {projects.filter((p: any) => p.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>المشاريع الحديثة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => setSelectedProject(project.id)}>
                      <div className="flex items-center gap-4">
                        <FolderOpen className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{project.progress}%</p>
                          <Progress value={project.progress} className="w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المشاريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Projects Grid */}
            {projectsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">جاري تحميل المشاريع...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project: any) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedProject(project.id)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">التقدم</span>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>الفريق: {project.teamSize} أعضاء</span>
                          <span>المدير: {project.manager}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>البداية: {new Date(project.startDate).toLocaleDateString('ar-SA')}</span>
                          <span>النهاية: {new Date(project.endDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          الميزانية: {project.budget?.toLocaleString()} ريال
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">تحليلات المشاريع</h3>
              <p className="text-muted-foreground mb-4">قريباً - تحليلات شاملة لأداء المشاريع</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}