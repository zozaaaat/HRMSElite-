import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Users, 
  Clock, 
  MapPin,
  Bell,
  Download,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  QrCode,
  Calendar
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";

export default function MobileApps() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <MobileAppsContent />
    </SharedLayout>
  );
}

function MobileAppsContent() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch mobile integrations
  const { data: integrations = [], isLoading: integrationsLoading } = useQuery({
    queryKey: ['/api/mobile/integrations'],
  });

  // Fetch device registrations
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['/api/mobile/device-registrations'],
  });

  // Fetch mobile stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/mobile/stats/company1'],
  });

  // Fetch attendance data
  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['/api/mobile/attendance/company1'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'offline': return 'غير متصل';
      case 'pending': return 'معلق';
      case 'online': return 'متصل';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">التطبيق المحمول</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              إدارة تطبيقات المشرفين والعمال وأجهزة تسجيل الحضور
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => console.log('تحميل التطبيق المحمول')}>
            <Download className="h-4 w-4 ml-2" />
            تحميل التطبيق
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="devices">الأجهزة</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">المستخدمون النشطون</p>
                      <p className="text-2xl font-bold">{(stats as any)?.activeUsers || 156}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تسجيلات اليوم</p>
                      <p className="text-2xl font-bold">{(stats as any)?.dailyCheckIns || 342}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">زمن الاستجابة</p>
                      <p className="text-2xl font-bold">{(stats as any)?.avgResponseTime || '1.2s'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Bell className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">الإشعارات المرسلة</p>
                      <p className="text-2xl font-bold">{(stats as any)?.pushNotifications || 1247}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  تطبيقات الهاتف المحمول
                </CardTitle>
              </CardHeader>
              <CardContent>
                {integrationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل التطبيقات...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(integrations as any[]).map((integration: any) => (
                      <Card key={integration.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-8 w-8 text-blue-500" />
                              <div>
                                <h3 className="font-semibold text-lg">{integration.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{integration.type}</p>
                              </div>
                            </div>
                            <Badge className={getStatusColor(integration.status)}>
                              {getStatusText(integration.status)}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">المستخدمون:</span>
                              <span className="font-medium">{integration.users}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">آخر مزامنة:</span>
                              <span className="font-medium">{new Date(integration.lastSync).toLocaleString('ar-SA')}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">الميزات:</p>
                            <div className="flex flex-wrap gap-2">
                              {integration.features.map((feature: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>الإجراءات السريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => console.log('إنشاء رمز QR جديد للموظفين')}>
                    <QrCode className="h-6 w-6" />
                    <span>إنشاء رمز QR</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => console.log('إرسال إشعار جماعي للموظفين')}>
                    <Bell className="h-6 w-6" />
                    <span>إرسال إشعار جماعي</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => console.log('فتح إعدادات التطبيق المحمول')}>
                    <Settings className="h-6 w-6" />
                    <span>إعدادات التطبيق</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  سجلات الحضور اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل سجلات الحضور...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(attendance as any[]).map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Calendar className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-semibold">{record.date}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              دخول: {record.checkIn} | خروج: {record.checkOut}
                            </p>
                          </div>
                        </div>
                        <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                          {record.status === 'present' ? 'حضر' : 
                           record.status === 'late' ? 'متأخر' : 'غائب'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-600">95%</p>
                  <p className="text-sm text-gray-600">معدل الحضور</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-blue-600">8.2</p>
                  <p className="text-sm text-gray-600">متوسط ساعات العمل</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                  <p className="text-sm text-gray-600">حالات التأخير</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  أجهزة تسجيل الحضور
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">جاري تحميل الأجهزة...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(devices as any[]).map((device: any) => (
                      <Card key={device.id} className="border-2">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Smartphone className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{device.deviceName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {device.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {device.status === 'online' ? (
                                <Wifi className="h-5 w-5 text-green-500" />
                              ) : (
                                <WifiOff className="h-5 w-5 text-red-500" />
                              )}
                              <Badge className={device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}>
                                {getStatusText(device.status)}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">المستخدمون المسجلون:</span>
                              <span className="font-medium mr-2">{device.registeredUsers}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">آخر اتصال:</span>
                              <span className="font-medium mr-2">
                                {new Date(device.lastPing).toLocaleString('ar-SA')}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => console.log('فتح إعدادات الجهاز')}>
                              <Settings className="h-4 w-4 ml-1" />
                              إعدادات
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => console.log('عرض تقارير الجهاز')}>
                              <Activity className="h-4 w-4 ml-1" />
                              التقارير
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Device Button */}
            <Card className="border-dashed border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <Smartphone className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">إضافة جهاز جديد</h3>
                    <p className="text-gray-600 dark:text-gray-400">قم بتسجيل جهاز تسجيل حضور جديد</p>
                  </div>
                  <Button onClick={() => console.log('إضافة جهاز تسجيل حضور جديد')}>
                    <Smartphone className="h-4 w-4 ml-2" />
                    إضافة جهاز
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات التطبيق</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>الإشعارات الفورية</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء الإشعارات الفورية')}>تفعيل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تتبع الموقع</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء تتبع الموقع')}>تفعيل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التحديث التلقائي</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء التحديث التلقائي')}>تفعيل</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الحضور</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>مدة السماح للتأخير</span>
                    <span className="font-medium">15 دقيقة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التحقق من الموقع</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء التحقق من الموقع')}>تفعيل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التصوير عند التسجيل</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء التصوير عند التسجيل')}>تفعيل</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الأمان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>المصادقة الثنائية</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تفعيل/إلغاء المصادقة الثنائية')}>تفعيل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>تشفير البيانات</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تعديل إعدادات تشفير البيانات')}>مفعل</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>سياسة كلمة المرور</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تعديل سياسة كلمة المرور')}>قوية</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>النسخ الاحتياطي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>النسخ التلقائي</span>
                    <Button variant="outline" size="sm" onClick={() => console.log('تعديل إعدادات النسخ التلقائي')}>يومي</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>آخر نسخة احتياطية</span>
                    <span className="font-medium">اليوم 14:30</span>
                  </div>
                  <Button className="w-full" onClick={() => console.log('إنشاء نسخة احتياطية فورية')}>
                    إنشاء نسخة احتياطية الآن
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}