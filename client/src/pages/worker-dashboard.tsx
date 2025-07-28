import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wrench, 
  Clock, 
  CheckCircle,
  XCircle,
  FileText,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Smartphone,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import zeylabLogo from "@assets/لوجو شركتي_1753651903577.png";
import { useLocation } from "wouter";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get('company') || '1';

  // Worker stats
  const workerStats = {
    attendanceRate: 96.5,
    totalHours: 176,
    remainingLeaves: 15,
    completedTasks: 42,
    todayStatus: "حاضر"
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
                src={zeylabLogo} 
                alt="Zeylab Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold">Zeylab HRMS</h1>
                <p className="text-sm text-muted-foreground">لوحة تحكم العامل</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-reverse space-x-2">
              <Button variant="ghost" size="icon" onClick={() => console.log('فتح مركز الإشعارات - العامل')}>
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">
                  {(user as any)?.name || 'العامل'}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
            <TabsTrigger value="mobile">التطبيق المحمول</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Worker Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">نسبة الحضور</p>
                      <p className="text-2xl font-bold">{workerStats.attendanceRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">ساعات العمل</p>
                      <p className="text-2xl font-bold">{workerStats.totalHours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-orange-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">إجازات متبقية</p>
                      <p className="text-2xl font-bold">{workerStats.remainingLeaves}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">حالة اليوم</p>
                      <p className="text-lg font-bold text-green-600">{workerStats.todayStatus}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions for Worker */}
            <div>
              <h3 className="text-xl font-semibold mb-4">أدوات العامل الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("mobile")}>
                  <CardContent className="p-6 text-center">
                    <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">تسجيل الحضور</h3>
                    <p className="text-sm text-muted-foreground">تسجيل دخول وخروج يومي</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("profile")}>
                  <CardContent className="p-6 text-center">
                    <User className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">ملفي الشخصي</h3>
                    <p className="text-sm text-muted-foreground">عرض وتحديث البيانات</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => console.log('طلب إجازة')}>
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">طلب إجازة</h3>
                    <p className="text-sm text-muted-foreground">تقديم طلبات الإجازة</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">بياناتي الشخصية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                      <input 
                        type="text" 
                        value={user?.name || 'العامل'}
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">المسمى الوظيفي</label>
                      <input 
                        type="text" 
                        value="عامل"
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">القسم</label>
                      <input 
                        type="text" 
                        value="الإنتاج"
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">تاريخ التوظيف</label>
                      <input 
                        type="text" 
                        value="01/01/2023"
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">المشرف المباشر</label>
                      <input 
                        type="text" 
                        value="أحمد محمد"
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">الراتب الأساسي</label>
                      <input 
                        type="text" 
                        value="400 د.ك"
                        readOnly
                        className="w-full p-2 border rounded-md bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">ملاحظة</h4>
                  <p className="text-sm text-muted-foreground">
                    لتحديث أي من هذه البيانات، يرجى التواصل مع قسم الموارد البشرية أو مشرفك المباشر.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Smartphone className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">تطبيق العامل المحمول</h3>
                <p className="text-muted-foreground mb-6">
                  استخدم التطبيق المحمول لتسجيل الحضور والانصراف وطلب الإجازات
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold">تسجيل الحضور</h4>
                    <p className="text-sm text-muted-foreground">تسجيل دخول وخروج سريع</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold">طلب الإجازات</h4>
                    <p className="text-sm text-muted-foreground">تقديم طلبات الإجازة والأذونات</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <h4 className="font-semibold">كشف الراتب</h4>
                    <p className="text-sm text-muted-foreground">عرض تفاصيل الراتب الشهري</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <Bell className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h4 className="font-semibold">الإشعارات</h4>
                    <p className="text-sm text-muted-foreground">إشعارات الشركة والمهام</p>
                  </div>
                </div>
                
                <Button onClick={() => setLocation(`/mobile-apps?company=${companyId}&role=worker`)}>
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