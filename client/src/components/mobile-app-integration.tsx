import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Smartphone, Download, QrCode, Users, MapPin, Clock, CheckCircle, Bell, Camera, Fingerprint, Wifi, WifiOff, Signal, Battery, Navigation, Settings, UserCheck, AlertTriangle, MessageSquare, FileText, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobileAppProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  type: "check-in" | "check-out" | "break-start" | "break-end";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  method: "fingerprint" | "face" | "qr" | "manual";
  status: "verified" | "pending" | "rejected";
}

interface TaskUpdate {
  id: string;
  taskId: string;
  employeeId: string;
  employeeName: string;
  title: string;
  progress: number;
  status: "started" | "in-progress" | "completed" | "blocked";
  comments: string;
  timestamp: string;
  photos: string[];
}

export function MobileAppIntegration({ isOpen, onClose }: MobileAppProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);

  // Mock data for demonstration
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "أحمد محمد",
      timestamp: "2025-01-27T08:00:00Z",
      type: "check-in",
      location: {
        lat: 24.7136,
        lng: 46.6753,
        address: "المكتب الرئيسي - الرياض"
      },
      method: "fingerprint",
      status: "verified"
    },
    {
      id: "2",
      employeeId: "EMP002", 
      employeeName: "سارة أحمد",
      timestamp: "2025-01-27T08:15:00Z",
      type: "check-in",
      location: {
        lat: 24.7136,
        lng: 46.6753,
        address: "المكتب الرئيسي - الرياض"
      },
      method: "face",
      status: "verified"
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "محمد علي",
      timestamp: "2025-01-27T08:30:00Z", 
      type: "check-in",
      location: {
        lat: 24.7100,
        lng: 46.6800,
        address: "موقع العمل الخارجي"
      },
      method: "qr",
      status: "pending"
    }
  ];

  const mockTaskUpdates: TaskUpdate[] = [
    {
      id: "1",
      taskId: "TASK001",
      employeeId: "EMP001",
      employeeName: "أحمد محمد",
      title: "فحص المولد الكهربائي",
      progress: 75,
      status: "in-progress",
      comments: "تم فحص الجزء الأول، كل شيء يعمل بشكل طبيعي",
      timestamp: "2025-01-27T10:30:00Z",
      photos: ["generator-check-1.jpg", "generator-check-2.jpg"]
    },
    {
      id: "2",
      taskId: "TASK002", 
      employeeId: "EMP002",
      employeeName: "سارة أحمد",
      title: "تنظيف المنطقة الجنوبية",
      progress: 100,
      status: "completed",
      comments: "تم إنجاز المهمة بنجاح، المنطقة نظيفة تماماً",
      timestamp: "2025-01-27T11:45:00Z",
      photos: ["cleaning-before.jpg", "cleaning-after.jpg"]
    },
    {
      id: "3",
      taskId: "TASK003",
      employeeId: "EMP003", 
      employeeName: "محمد علي",
      title: "صيانة أجهزة التكييف",
      progress: 25,
      status: "blocked",
      comments: "محتاج قطع غيار إضافية لإكمال الصيانة",
      timestamp: "2025-01-27T09:15:00Z",
      photos: ["ac-maintenance.jpg"]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      // Simulate network connectivity changes
      const connectivityInterval = setInterval(() => {
        setIsOnline(prev => Math.random() > 0.1 ? true : prev);
      }, 10000);

      // Simulate battery level changes
      const batteryInterval = setInterval(() => {
        setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
      }, 30000);

      return () => {
        clearInterval(connectivityInterval);
        clearInterval(batteryInterval);
      };
    }
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending": case "in-progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "rejected": case "blocked": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "started": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "fingerprint": return <Fingerprint className="h-4 w-4" />;
      case "face": return <Camera className="h-4 w-4" />;
      case "qr": return <QrCode className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl mx-auto h-[90vh] overflow-hidden" dir="rtl">
        
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative overflow-hidden -mx-6 -mt-6">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-br from-blue-500 to-purple-600"></div>
          
          {/* Mobile Status Bar */}
          <div className="flex justify-between items-center text-xs mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span>9:30</span>
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <Signal className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-1">
              <Battery className="h-3 w-3" />
              <span>{Math.round(batteryLevel)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-2xl font-bold">تطبيق Zeylab المحمول</h2>
              <p className="text-blue-100">للمشرفين والعمال</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Smartphone className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="attendance">الحضور</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="features">الميزات</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 h-full overflow-y-auto">
              {/* App Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">المستخدمين النشطين</p>
                        <p className="text-2xl font-bold text-green-600">142</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">سجلات الحضور اليوم</p>
                        <p className="text-2xl font-bold text-blue-600">89</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                        <p className="text-2xl font-bold text-purple-600">34</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* App Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Fingerprint className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">تسجيل الحضور الذكي</h3>
                    <p className="text-sm text-muted-foreground">بصمة الإصبع والتعرف على الوجه</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">تتبع الموقع</h3>
                    <p className="text-sm text-muted-foreground">تحديد موقع الموظفين في الوقت الفعلي</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">إدارة المهام</h3>
                    <p className="text-sm text-muted-foreground">تحديث حالة المهام والتقارير</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Camera className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">التوثيق المرئي</h3>
                    <p className="text-sm text-muted-foreground">التقاط الصور وإرفاق الملفات</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">الإشعارات الفورية</h3>
                    <p className="text-sm text-muted-foreground">تنبيهات ومهام جديدة</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Navigation className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">العمل بدون إنترنت</h3>
                    <p className="text-sm text-muted-foreground">حفظ البيانات والمزامنة لاحقاً</p>
                  </CardContent>
                </Card>
              </div>

              {/* Download Section */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">حمل التطبيق الآن</h3>
                      <p className="text-muted-foreground">متوفر لأنظمة iOS و Android</p>
                      <div className="flex items-center gap-4">
                        <Button className="bg-black text-white hover:bg-gray-800">
                          <Download className="h-4 w-4 mr-2" />
                          App Store
                        </Button>
                        <Button className="bg-green-600 text-white hover:bg-green-700">
                          <Download className="h-4 w-4 mr-2" />
                          Google Play
                        </Button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <QrCode className="h-24 w-24 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">سجلات الحضور اليوم</h3>
                <Badge variant="outline">{mockAttendanceRecords.length} سجل</Badge>
              </div>

              <div className="space-y-3">
                {mockAttendanceRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {getMethodIcon(record.method)}
                            </div>
                            <div>
                              <p className="font-semibold">{record.employeeName}</p>
                              <p className="text-sm text-muted-foreground">
                                {record.type === 'check-in' ? 'دخول' :
                                 record.type === 'check-out' ? 'خروج' :
                                 record.type === 'break-start' ? 'بداية استراحة' : 'نهاية استراحة'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(record.timestamp).toLocaleTimeString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{record.location.address}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className={getStatusColor(record.status)}>
                          {record.status === 'verified' ? 'مؤكد' :
                           record.status === 'pending' ? 'في الانتظار' : 'مرفوض'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">تحديثات المهام</h3>
                <Badge variant="outline">{mockTaskUpdates.length} تحديث</Badge>
              </div>

              <div className="space-y-3">
                {mockTaskUpdates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{update.title}</h4>
                            <p className="text-sm text-muted-foreground">بواسطة: {update.employeeName}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(update.status)}>
                            {update.status === 'started' ? 'بدأت' :
                             update.status === 'in-progress' ? 'قيد التنفيذ' :
                             update.status === 'completed' ? 'مكتملة' : 'معطلة'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>التقدم</span>
                            <span>{update.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{ width: `${update.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {update.comments && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-sm">{update.comments}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(update.timestamp).toLocaleString('ar-SA')}</span>
                          </div>
                          {update.photos.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Camera className="h-4 w-4" />
                              <span>{update.photos.length} صورة</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      الميزات الأساسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تسجيل الحضور والانصراف</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تتبع الموقع الجغرافي</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>إدارة المهام والتحديثات</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>الإشعارات الفورية</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>التصوير وإرفاق الملفات</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      الميزات المتقدمة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>العمل بدون إنترنت</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>التعرف على الوجه</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>قارئ QR Code</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>التشفير المتقدم</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>المزامنة السحابية</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      الأمان والحماية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>تشفير البيانات من النهاية للنهاية</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>المصادقة الثنائية</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>حماية البيانات البيومترية</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>سجل التدقيق الشامل</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Technical Specs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-purple-500" />
                      المواصفات التقنية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>حجم التطبيق</span>
                      <span className="font-semibold">45 MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>نظام iOS</span>
                      <span className="font-semibold">12.0+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>نظام Android</span>
                      <span className="font-semibold">7.0+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>اللغات</span>
                      <span className="font-semibold">العربية، الإنجليزية</span>
                    </div>
                    <div className="flex justify-between">
                      <span>آخر تحديث</span>
                      <span className="font-semibold">يناير 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}