import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  QrCode, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Download,
  Bell,
  Fingerprint,
  Wifi,
  Battery,
  Signal
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MobileAppIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function MobileAppIntegration({ isOpen, onClose, companyId }: MobileAppIntegrationProps) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const { data: mobileStats } = useQuery({
    queryKey: [`/api/mobile/stats/${companyId}`],
  });

  const { data: attendanceData } = useQuery({
    queryKey: [`/api/mobile/attendance/${companyId}`],
  });

  const attendanceDevices = [
    {
      id: '1',
      name: 'جهاز الحضور الرئيسي',
      location: 'المدخل الرئيسي',
      status: 'online',
      lastSync: '2025-01-27 09:30:00',
      totalCheckIns: 125,
      batteryLevel: 98,
      signalStrength: 95
    },
    {
      id: '2',
      name: 'جهاز الطوارئ',
      location: 'المخرج الخلفي', 
      status: 'online',
      lastSync: '2025-01-27 09:25:00',
      totalCheckIns: 45,
      batteryLevel: 87,
      signalStrength: 78
    },
    {
      id: '3',
      name: 'جهاز المكتب التنفيذي',
      location: 'الطابق العلوي',
      status: 'offline',
      lastSync: '2025-01-26 18:45:00',
      totalCheckIns: 23,
      batteryLevel: 12,
      signalStrength: 45
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            تكامل التطبيق المحمول وأجهزة الحضور
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="mobile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mobile">التطبيق المحمول</TabsTrigger>
            <TabsTrigger value="devices">أجهزة الحضور</TabsTrigger>
            <TabsTrigger value="attendance">سجل الحضور</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="mobile" className="space-y-6">
            {/* Mobile App Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(mobileStats as any)?.activeUsers || 420}</div>
                  <div className="text-sm text-muted-foreground">مستخدم نشط</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(mobileStats as any)?.dailyCheckIns || 395}</div>
                  <div className="text-sm text-muted-foreground">حضور يومي</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Download className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(mobileStats as any)?.appDownloads || 450}</div>
                  <div className="text-sm text-muted-foreground">تحميل التطبيق</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{(mobileStats as any)?.notifications || 1250}</div>
                  <div className="text-sm text-muted-foreground">إشعار مرسل</div>
                </CardContent>
              </Card>
            </div>

            {/* App Download Links */}
            <Card>
              <CardHeader>
                <CardTitle>تحميل التطبيق المحمول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Android App</h4>
                    <p className="text-sm text-muted-foreground mb-4">امسح الرمز للتحميل من Google Play</p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل للأندرويد
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-600" />
                    </div>
                    <h4 className="font-semibold mb-2">iOS App</h4>
                    <p className="text-sm text-muted-foreground mb-4">امسح الرمز للتحميل من App Store</p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 ml-2" />
                      تحميل للايفون
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">أجهزة الحضور والانصراف</h3>
              <Button>
                <Smartphone className="h-4 w-4 ml-2" />
                إضافة جهاز جديد
              </Button>
            </div>

            <div className="grid gap-6">
              {attendanceDevices.map((device) => (
                <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDevice(device.id)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Fingerprint className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{device.name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {device.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            آخر مزامنة: {device.lastSync}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(device.status)}>
                          {device.status === 'online' ? 'متصل' : 'غير متصل'}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Battery className={`h-3 w-3 ${getBatteryColor(device.batteryLevel)}`} />
                            <span>{device.batteryLevel}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Signal className="h-3 w-3 text-gray-500" />
                            <span>{device.signalStrength}%</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {device.totalCheckIns} عملية اليوم
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>سجل الحضور اليومي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(attendanceData as any)?.map((record: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">{record.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">دخول: {record.checkIn}</span>
                          {record.checkOut && (
                            <span className="text-sm">خروج: {record.checkOut}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          الجهاز: {record.deviceName}
                        </div>
                      </div>
                    </div>
                  )) || Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">موظف {i + 1}</div>
                          <div className="text-sm text-muted-foreground">قسم المبيعات</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">دخول: 08:{String(30 + i * 5).padStart(2, '0')}</span>
                          <span className="text-sm">خروج: 17:{String(15 + i * 3).padStart(2, '0')}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          الجهاز: جهاز الحضور الرئيسي
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات التطبيق المحمول</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">إعدادات الحضور</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">نطاق موقع الحضور</label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">500</span>
                          <span className="text-sm text-muted-foreground">متر</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">وقت التحديث التلقائي</label>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">5</span>
                          <span className="text-sm text-muted-foreground">دقائق</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">إعدادات الإشعارات</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إشعارات الحضور</span>
                        <Button variant="outline" size="sm">تفعيل</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">تذكير المواعيد</span>
                        <Button variant="outline" size="sm">تفعيل</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إشعارات الرسائل</span>
                        <Button variant="outline" size="sm">تفعيل</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}