import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Download, 
  QrCode, 
  MapPin, 
  Fingerprint,
  Clock,
  Bell,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Camera
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface MobileAppProps {
  companyId: string;
}

export function MobileApp({ companyId }: MobileAppProps) {
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: mobileStats } = useQuery({
    queryKey: ['/api/mobile/stats', companyId],
  });

  const { data: attendanceData } = useQuery({
    queryKey: ['/api/mobile/attendance', companyId],
  });

  return (
    <div className="space-y-6">
      {/* Mobile App Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              التطبيقات المثبتة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42/48</div>
            <p className="text-xs text-muted-foreground">
              87.5% من الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              حضور اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38/42</div>
            <p className="text-xs text-muted-foreground">
              90.5% معدل الحضور
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              الإشعارات المرسلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              معدل الاستجابة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              استجابة للإشعارات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile App Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              تتبع الحضور والانصراف
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">البصمة الحيوية</p>
                  <p className="text-sm text-muted-foreground">تسجيل دخول آمن</p>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">تحديد الموقع</p>
                  <p className="text-sm text-muted-foreground">تأكيد الموقع</p>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">رمز QR</p>
                  <p className="text-sm text-muted-foreground">تسجيل سريع</p>
                </div>
              </div>
              <Badge variant="default">نشط</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>دقة التسجيل</span>
                <span>98.5%</span>
              </div>
              <Progress value={98.5} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Real-time Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات الفورية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  type: "attendance",
                  title: "تأخير في الحضور",
                  description: "3 موظفين تأخروا اليوم",
                  time: "منذ 15 دقيقة",
                  color: "red",
                  icon: Clock
                },
                {
                  type: "leave",
                  title: "طلب إجازة جديد",
                  description: "أحمد محمد - إجازة مرضية",
                  time: "منذ ساعة",
                  color: "blue",
                  icon: Calendar
                },
                {
                  type: "system",
                  title: "تحديث التطبيق",
                  description: "الإصدار 2.1.3 متاح الآن",
                  time: "منذ 3 ساعات",
                  color: "green",
                  icon: Download
                }
              ].map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`w-8 h-8 bg-${notification.color}-100 dark:bg-${notification.color}-900 rounded-full flex items-center justify-center`}>
                    <notification.icon className={`h-4 w-4 text-${notification.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" variant="outline" onClick={() => console.log('عرض جميع الإشعارات الفورية')}>
              عرض جميع الإشعارات
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile App Download & Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              تحميل التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-muted rounded-lg mx-auto flex items-center justify-center">
                <QrCode className="h-16 w-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                يمكن للموظفين مسح رمز QR لتحميل التطبيق
              </p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => console.log('إنشاء رابط تحميل التطبيق المحمول')}>
                  <Download className="ml-2 h-4 w-4" />
                  إنشاء رابط تحميل
                </Button>
                <Button variant="outline" className="w-full" onClick={() => console.log('إرسال رابط التحميل للموظفين')}>
                  إرسال رابط للموظفين
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              حالة التثبيت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">مثبت ونشط</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">38</span>
                  <div className="w-12 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-600"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">مثبت غير نشط</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">4</span>
                  <div className="w-12 h-2 bg-yellow-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-yellow-600"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">غير مثبت</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">6</span>
                  <div className="w-12 h-2 bg-red-200 rounded-full overflow-hidden">
                    <div className="w-1/4 h-full bg-red-600"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">87.5%</div>
                <p className="text-sm text-muted-foreground">معدل التبني</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              ميزات إضافية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  feature: "التقاط الصور",
                  description: "صور تأكيدية للحضور",
                  enabled: true
                },
                {
                  feature: "الإشعارات المحلية",
                  description: "تذكير بمواعيد العمل",
                  enabled: true
                },
                {
                  feature: "الوضع دون اتصال",
                  description: "تسجيل الحضور بدون انترنت",
                  enabled: false
                },
                {
                  feature: "التوقيع الرقمي",
                  description: "توقيع المستندات",
                  enabled: true
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{feature.feature}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                  <Badge variant={feature.enabled ? "default" : "secondary"}>
                    {feature.enabled ? "مفعل" : "معطل"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير للتطبيق المحمول</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                user: "أحمد محمد",
                action: "تسجيل دخول",
                method: "بصمة",
                time: "08:30 ص",
                location: "المكتب الرئيسي"
              },
              {
                user: "فاطمة أحمد",
                action: "تسجيل خروج",
                method: "QR كود",
                time: "05:15 م",
                location: "فرع الشرق"
              },
              {
                user: "محمد علي",
                action: "طلب إجازة",
                method: "التطبيق",
                time: "02:45 م",
                location: "عن بعد"
              },
              {
                user: "سارة خالد",
                action: "تسجيل دخول",
                method: "GPS",
                time: "09:00 ص",
                location: "موقع العمل"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{activity.user.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} • {activity.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{activity.time}</p>
                  <p className="text-xs text-muted-foreground">{activity.location}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}