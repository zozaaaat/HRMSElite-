import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Camera,
  Bell,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Calendar,
  Send,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from "lucide-react";

interface MobileSupervisorAppProps {
  companyId: string;
  supervisorId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSupervisorApp({ companyId, supervisorId, isOpen, onClose }: MobileSupervisorAppProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [taskMessage, setTaskMessage] = useState("");
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for mobile app
  const { data: workers = [] } = useQuery({
    queryKey: [`/api/companies/${companyId}/workers`],
    enabled: isOpen,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: [`/api/attendance/today`],
    enabled: isOpen,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: [`/api/tasks/active`],
    enabled: isOpen,
  });

  // Simulate real device features
  useEffect(() => {
    if (!isOpen) return;

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "موقع العمل الحالي"
          });
        },
        () => {
          setCurrentLocation({
            lat: 24.7136,
            lng: 46.6753,
            address: "الرياض، المملكة العربية السعودية"
          });
        }
      );
    }

    // Simulate battery level
    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(20, prev - Math.random() * 2));
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(batteryInterval);
    };
  }, [isOpen]);

  const sendTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest(`/api/tasks`, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال المهمة",
        description: "تم إرسال المهمة للعامل بنجاح",
      });
      setTaskMessage("");
      setSelectedWorker(null);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
    },
  });

  const approveAttendanceMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      await apiRequest(`/api/attendance/${attendanceId}/approve`, "POST");
    },
    onSuccess: () => {
      toast({
        title: "تم اعتماد الحضور",
        description: "تم اعتماد حضور العامل بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
    },
  });

  const mockWorkers = [
    {
      id: "1",
      name: "أحمد محمد",
      position: "فني كهرباء",
      status: "working",
      location: "الموقع أ",
      lastSeen: "منذ 5 دقائق",
      avatar: "/api/placeholder/40/40",
      attendance: "present"
    },
    {
      id: "2", 
      name: "محمد علي",
      position: "فني سباكة",
      status: "break",
      location: "الموقع ب",
      lastSeen: "منذ 15 دقيقة",
      avatar: "/api/placeholder/40/40",
      attendance: "present"
    },
    {
      id: "3",
      name: "عبدالله سالم",
      position: "عامل نظافة",
      status: "working",
      location: "الموقع ج",
      lastSeen: "منذ 2 دقيقة",
      avatar: "/api/placeholder/40/40",
      attendance: "late"
    }
  ];

  const mockAttendance = [
    {
      id: "1",
      workerId: "1",
      workerName: "أحمد محمد",
      checkIn: "07:30",
      status: "approved",
      location: "باب المصنع الرئيسي"
    },
    {
      id: "2",
      workerId: "2", 
      workerName: "محمد علي",
      checkIn: "07:45",
      status: "pending",
      location: "مدخل الورشة"
    },
    {
      id: "3",
      workerId: "3",
      workerName: "عبدالله سالم", 
      checkIn: "08:15",
      status: "late",
      location: "موقف السيارات"
    }
  ];

  const mockTasks = [
    {
      id: "1",
      title: "فحص المولد الكهربائي",
      assignedTo: "أحمد محمد",
      priority: "عالية",
      dueTime: "10:00",
      status: "في التقدم"
    },
    {
      id: "2",
      title: "تنظيف المنطقة الجنوبية",
      assignedTo: "عبدالله سالم",
      priority: "متوسطة", 
      dueTime: "11:30",
      status: "جديدة"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0 rounded-3xl overflow-hidden bg-gradient-to-b from-blue-50 to-white" dir="rtl">
        
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 pb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="white"/></svg>')]"></div>
          
          {/* Status Bar */}
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
              <h2 className="text-lg font-bold">تطبيق المشرف</h2>
              <p className="text-blue-100 text-sm">إدارة الفريق</p>
            </div>
            <div className="bg-white/20 rounded-full p-2">
              <Smartphone className="h-6 w-6" />
            </div>
          </div>

          {/* Location indicator */}
          {currentLocation && (
            <div className="flex items-center gap-2 mt-3 text-blue-100 text-xs relative z-10">
              <MapPin className="h-3 w-3" />
              <span>{currentLocation.address}</span>
            </div>
          )}
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <TabsContent value="dashboard" className="mt-0 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="text-center">
                    <CardContent className="p-3">
                      <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">{mockWorkers.length}</p>
                      <p className="text-xs text-muted-foreground">العمال</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-3">
                      <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">{mockWorkers.filter(w => w.attendance === 'present').length}</p>
                      <p className="text-xs text-muted-foreground">حاضرين</p>
                    </CardContent>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="p-3">
                      <Clock className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                      <p className="text-lg font-bold">{mockTasks.length}</p>
                      <p className="text-xs text-muted-foreground">المهام</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Workers */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      العمال النشطين
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockWorkers.map((worker) => (
                      <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{worker.name}</p>
                            <p className="text-xs text-muted-foreground">{worker.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={worker.status === 'working' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {worker.status === 'working' ? 'يعمل' : 'استراحة'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{worker.lastSeen}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setActiveTab("attendance")}
                    className="h-16 flex-col gap-1"
                  >
                    <Clock className="h-5 w-5" />
                    <span className="text-xs">اعتماد الحضور</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("tasks")}
                    variant="outline" 
                    className="h-16 flex-col gap-1"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs">إرسال مهمة</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">حضور اليوم</h3>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 ml-1" />
                    تحديث
                  </Button>
                </div>

                {mockAttendance.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{record.workerName}</p>
                          <p className="text-sm text-muted-foreground">{record.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg">{record.checkIn}</p>
                          <Badge 
                            variant={
                              record.status === 'approved' ? 'default' : 
                              record.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {record.status === 'approved' ? 'معتمد' : 
                             record.status === 'pending' ? 'في الانتظار' : 'متأخر'}
                          </Badge>
                        </div>
                      </div>
                      
                      {record.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => approveAttendanceMutation.mutate(record.id)}
                            disabled={approveAttendanceMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            اعتماد
                          </Button>
                          <Button size="sm" variant="outline">
                            <XCircle className="h-4 w-4 ml-1" />
                            رفض
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="tasks" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">المهام النشطة</h3>
                  <Button size="sm" onClick={() => setSelectedWorker({})}>
                    <Send className="h-4 w-4 ml-1" />
                    مهمة جديدة
                  </Button>
                </div>

                {mockTasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">مُكلف: {task.assignedTo}</p>
                        </div>
                        <Badge variant={task.priority === 'عالية' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>موعد الانتهاء: {task.dueTime}</span>
                        </div>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* New Task Modal */}
                {selectedWorker && (
                  <Card className="border-2 border-dashed border-blue-300">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">إرسال مهمة جديدة</h4>
                      <div className="space-y-3">
                        <select className="w-full p-2 border rounded-md text-sm">
                          <option value="">اختر العامل</option>
                          {mockWorkers.map(worker => (
                            <option key={worker.id} value={worker.id}>{worker.name}</option>
                          ))}
                        </select>
                        <Input
                          placeholder="وصف المهمة..."
                          value={taskMessage}
                          onChange={(e) => setTaskMessage(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => {
                              sendTaskMutation.mutate({
                                title: taskMessage,
                                assignedTo: "عامل محدد",
                                priority: "متوسطة"
                              });
                            }}
                            disabled={!taskMessage || sendTaskMutation.isPending}
                          >
                            إرسال
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedWorker(null)}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-4">
                <h3 className="font-semibold">الإشعارات</h3>
                
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">تأخير في الحضور</p>
                        <p className="text-xs text-muted-foreground">عبدالله سالم تأخر 15 دقيقة</p>
                        <p className="text-xs text-muted-foreground">منذ ساعة</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">مهمة مكتملة</p>
                        <p className="text-xs text-muted-foreground">أحمد محمد أكمل فحص المولد</p>
                        <p className="text-xs text-muted-foreground">منذ 30 دقيقة</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-3 flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">طلب استراحة</p>
                        <p className="text-xs text-muted-foreground">محمد علي طلب استراحة إضافية</p>
                        <p className="text-xs text-muted-foreground">منذ 10 دقائق</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>

            {/* Bottom Navigation */}
            <TabsList className="w-full p-0 h-16 bg-white border-t grid grid-cols-4">
              <TabsTrigger value="dashboard" className="flex-col gap-1 h-full">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">الرئيسية</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex-col gap-1 h-full">
                <Clock className="h-4 w-4" />
                <span className="text-xs">الحضور</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex-col gap-1 h-full">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">المهام</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-col gap-1 h-full relative">
                <Bell className="h-4 w-4" />
                <span className="text-xs">الإشعارات</span>
                <div className="absolute top-1 left-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}