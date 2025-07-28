import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  Share2,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PWAInstallPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { 
    isInstallable, 
    isInstalled, 
    isOnline,
    installApp, 
    shareApp, 
    requestNotificationPermission 
  } = usePWA();
  const { toast } = useToast();

  if (dismissed || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "تم تثبيت التطبيق",
        description: "يمكنك الآن الوصول لـ Zeylab HRMS من شاشة الهاتف الرئيسية",
      });
    }
  };

  const handleShare = async () => {
    const success = await shareApp({
      title: "Zeylab HRMS",
      text: "نظام إدارة الموارد البشرية المتقدم",
      url: window.location.href
    });
    
    if (success) {
      toast({
        title: "تم النسخ",
        description: "تم نسخ رابط التطبيق",
      });
    }
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast({
        title: "تم تفعيل الإشعارات",
        description: "ستتلقى تنبيهات مهمة من النظام",
      });
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">تثبيت التطبيق</CardTitle>
              <CardDescription>
                احصل على تجربة أفضل مع التطبيق
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-green-600">متصل</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-red-600">غير متصل</span>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-gray-500" />
            <span>سطح المكتب</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-gray-500" />
            <span>الهاتف المحمول</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-gray-500" />
            <span>يعمل بدون إنترنت</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <span>إشعارات فورية</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleInstall} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Download className="h-4 w-4 ml-2" />
            تثبيت
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleShare}
            size="sm"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNotifications}
            size="sm"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          تطبيق آمن ومجاني من Zeylab
        </p>
      </CardContent>
    </Card>
  );
}

// Offline Status Component
export function OfflineStatus() {
  const { isOnline } = usePWA();
  
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>لا يوجد اتصال بالإنترنت - يتم العمل في الوضع غير المتصل</span>
      </div>
    </div>
  );
}