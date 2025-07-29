import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Shield, 
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  Moon,
  Sun,
  LogOut,
  FileText,
  Smartphone,
  ClipboardList,
  TrendingUp
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { useTheme } from "@/components/theme-provider";
// Logo import removed
import { useLocation } from "wouter";

export default function SupervisorDashboard() {
  return (
    <SharedLayout 
      userRole="supervisor" 
      userName="علي أحمد المشرف" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <SupervisorDashboardContent />
    </SharedLayout>
  );
}

function SupervisorDashboardContent() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  // Supervisor stats
  const supervisorStats = {
    supervisedWorkers: 12,
    todayAttendance: 10,
    pendingReports: 3,
    completedTasks: 8,
    pendingTasks: 4
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src="/logo.svg" 
                alt="Zeylab Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">Zeylab HRMS</h1>
                <p className="text-sm text-muted-foreground">لوحة تحكم المشرف</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="ghost" size="icon" onClick={() => console.log('فتح مركز الإشعارات - المشرف')}>
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">
                  {(user as any)?.name || 'المشرف'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="workers">العمال</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="mobile">التطبيق المحمول</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Supervisor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">العمال تحت إشرافي</p>
                      <p className="text-2xl font-bold">{supervisorStats.supervisedWorkers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">حضور اليوم</p>
                      <p className="text-2xl font-bold">{supervisorStats.todayAttendance}/{supervisorStats.supervisedWorkers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">تقارير معلقة</p>
                      <p className="text-2xl font-bold">{supervisorStats.pendingReports}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <ClipboardList className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">المهام النشطة</p>
                      <p className="text-2xl font-bold">{supervisorStats.completedTasks + supervisorStats.pendingTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions for Supervisor */}
            <div>
              <h3 className="text-xl font-semibold mb-4">الأدوات الأساسية للمشرف</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("workers")}>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">متابعة العمال</h3>
                    <p className="text-sm text-muted-foreground">مراقبة حضور وأداء العمال</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("reports")}>
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">كتابة التقارير</h3>
                    <p className="text-sm text-muted-foreground">تقارير يومية وأسبوعية للإدارة</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation(`/mobile-apps?company=${companyId}&role=supervisor`)}>
                  <CardContent className="p-6 text-center">
                    <Smartphone className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">التطبيق المحمول</h3>
                    <p className="text-sm text-muted-foreground">متابعة المهام أثناء التنقل</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">العمال تحت إشرافي</h3>
                  <Button onClick={() => setActiveTab("reports")}>
                    <FileText className="h-4 w-4 ml-2" />
                    إرسال تقرير
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({length: supervisorStats.supervisedWorkers}).map((_, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">عامل {index + 1}</h4>
                            <p className="text-sm text-muted-foreground">وردية الصباح</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {index < supervisorStats.todayAttendance ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">إرسال تقرير للإدارة</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">نوع التقرير</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                      <option>تقرير يومي</option>
                      <option>تقرير أسبوعي</option>
                      <option>تقرير حادث</option>
                      <option>تقرير أداء</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">الموضوع</label>
                    <input 
                      type="text" 
                      placeholder="عنوان التقرير"
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">تفاصيل التقرير</label>
                    <textarea 
                      placeholder="اكتب تفاصيل التقرير هنا..."
                      rows={6}
                      className="w-full p-2 border rounded-md bg-background"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">الأولوية</label>
                    <select className="w-full p-2 border rounded-md bg-background">
                      <option>عادي</option>
                      <option>مهم</option>
                      <option>عاجل</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button className="flex-1">
                      <FileText className="h-4 w-4 ml-2" />
                      إرسال التقرير
                    </Button>
                    <Button variant="outline" className="flex-1">
                      حفظ كمسودة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">تطبيق المشرف المحمول</h3>
                <p className="text-muted-foreground mb-6">
                  استخدم التطبيق المحمول لمتابعة العمال وإرسال التقارير أثناء التنقل في الموقع
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">تسجيل الحضور</h4>
                    <p className="text-sm text-muted-foreground">متابعة حضور العمال لحظياً</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold">التقارير السريعة</h4>
                    <p className="text-sm text-muted-foreground">إرسال تقارير فورية للإدارة</p>
                  </div>
                </div>
                
                <Button onClick={() => setLocation(`/mobile-apps?company=${companyId}&role=supervisor`)}>
                  <Smartphone className="h-4 w-4 ml-2" />
                  فتح التطبيق المحمول
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}