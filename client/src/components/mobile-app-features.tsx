import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  Monitor, 
  Download, 
  Wifi, 
  Bell, 
  Camera, 
  MapPin,
  Clock,
  Calendar,
  FileText,
  Settings,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

export function MobileAppFeatures() {
  const [activeTab, setActiveTab] = useState('mobile');
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "تم تثبيت التطبيق",
        description: "يمكنك الآن الوصول للتطبيق من شاشتك الرئيسية",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Installation Status */}
      {isInstallable && !isInstalled && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              تثبيت التطبيق المحمول
            </CardTitle>
            <CardDescription>
              اجعل نظام HRMS متاحاً كتطبيق محمول على جهازك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 ml-2" />
              تثبيت التطبيق
            </Button>
          </CardContent>
        </Card>
      )}

      {isInstalled && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <Smartphone className="h-5 w-5" />
              <span className="font-medium">التطبيق مثبت بنجاح!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            الهاتف المحمول
          </TabsTrigger>
          <TabsTrigger value="desktop" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            سطح المكتب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mobile Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  تسجيل الحضور والانصراف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>تحديد الموقع الجغرافي</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Camera className="h-4 w-4" />
                  <span>التحقق بالصورة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wifi className="h-4 w-4" />
                  <span>يعمل بدون إنترنت</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-green-600" />
                  إشعارات فورية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>تذكيرات المواعيد</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>طلبات الإجازات</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>تحديثات فورية</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Advantages */}
          <Card>
            <CardHeader>
              <CardTitle>مزايا التطبيق المحمول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    سرعة الوصول
                  </Badge>
                  <span className="text-sm">فتح مباشر من الشاشة الرئيسية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    عمل بدون إنترنت
                  </Badge>
                  <span className="text-sm">الوصول للبيانات في أي وقت</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    إشعارات ذكية
                  </Badge>
                  <span className="text-sm">تنبيهات مخصصة حسب دورك</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    أمان عالي
                  </Badge>
                  <span className="text-sm">حماية متقدمة للبيانات</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="desktop" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Desktop Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  تطبيق سطح المكتب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>أداء سريع ومحسن</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>أمان وخصوصية عالية</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>إعدادات متقدمة</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-green-600" />
                  تطبيق ويب متقدم (PWA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Download className="h-4 w-4" />
                  <span>تثبيت بنقرة واحدة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wifi className="h-4 w-4" />
                  <span>يعمل بدون إنترنت</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Bell className="h-4 w-4" />
                  <span>إشعارات سطح المكتب</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>كيفية تثبيت تطبيق سطح المكتب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-600 text-white">1</Badge>
                  <div>
                    <h4 className="font-medium">تطبيق PWA (موصى به)</h4>
                    <p className="text-sm text-gray-600">
                      انقر على أيقونة التثبيت في شريط العناوين، أو استخدم قائمة المتصفح "تثبيت التطبيق"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-gray-600 text-white">2</Badge>
                  <div>
                    <h4 className="font-medium">تطبيق Electron (للمطورين)</h4>
                    <p className="text-sm text-gray-600">
                      متوفر كتطبيق مستقل لنظم Windows، macOS، و Linux
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}