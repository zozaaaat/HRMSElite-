import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield,
  Building,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settings, setSettings] = useState({
    // الملف الشخصي
    firstName: "أحمد",
    lastName: "محمد",
    email: "ahmed@company.com",
    phone: "+965 1234 5678",
    jobTitle: "مدير الموارد البشرية",
    
    // كلمة المرور
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // الإشعارات
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    leaveRequestNotifications: true,
    documentExpiryNotifications: true,
    
    // التفضيلات
    language: "ar",
    theme: "light",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "12h",
    
    // الشركة
    companyName: "شركة الاتحاد الخليجي",
    companyAddress: "الكويت، حولي",
    companyPhone: "+965 2222 3333",
    companyEmail: "info@company.com"
  });

  const handleSave = (section: string) => {
    toast({
      title: "تم الحفظ بنجاح",
      description: `تم حفظ إعدادات ${section} بنجاح`,
    });
  };

  const handlePasswordChange = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "تم تغيير كلمة المرور",
      description: "تم تغيير كلمة المرور بنجاح",
    });
    
    // مسح حقول كلمة المرور
    setSettings({
      ...settings,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة إعدادات حسابك والنظام
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">الملف الشخصي</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">الأمان</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">التفضيلات</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">الشركة</span>
          </TabsTrigger>
        </TabsList>

        {/* الملف الشخصي */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>
                تحديث معلوماتك الشخصية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    value={settings.firstName}
                    onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <Input
                    id="lastName"
                    value={settings.lastName}
                    onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                <Input
                  id="jobTitle"
                  value={settings.jobTitle}
                  onChange={(e) => setSettings({ ...settings, jobTitle: e.target.value })}
                />
              </div>
              
              <Button onClick={() => handleSave("الملف الشخصي")} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الأمان */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>الأمان</CardTitle>
              <CardDescription>
                تغيير كلمة المرور وإعدادات الأمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={settings.currentPassword}
                    onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={settings.newPassword}
                    onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                />
              </div>
              
              <Button onClick={handlePasswordChange} className="gap-2">
                <Lock className="h-4 w-4" />
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* الإشعارات */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>الإشعارات</CardTitle>
              <CardDescription>
                إدارة كيفية تلقي الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي الإشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات الرسائل النصية</Label>
                  <p className="text-sm text-muted-foreground">
                    تلقي الإشعارات عبر الرسائل النصية
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات النظام</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات داخل النظام
                  </p>
                </div>
                <Switch
                  checked={settings.systemNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, systemNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>طلبات الإجازة</Label>
                  <p className="text-sm text-muted-foreground">
                    إشعارات عند تقديم طلبات إجازة
                  </p>
                </div>
                <Switch
                  checked={settings.leaveRequestNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, leaveRequestNotifications: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>انتهاء صلاحية المستندات</Label>
                  <p className="text-sm text-muted-foreground">
                    تنبيهات انتهاء صلاحية المستندات
                  </p>
                </div>
                <Switch
                  checked={settings.documentExpiryNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, documentExpiryNotifications: checked })
                  }
                />
              </div>
              
              <Button onClick={() => handleSave("الإشعارات")} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* التفضيلات */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>التفضيلات</CardTitle>
              <CardDescription>
                تخصيص تجربة استخدام النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">اللغة</Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme">المظهر</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => setSettings({ ...settings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">حسب النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                <Select 
                  value={settings.dateFormat} 
                  onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">31/12/2024</SelectItem>
                    <SelectItem value="MM/dd/yyyy">12/31/2024</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2024-12-31</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeFormat">تنسيق الوقت</Label>
                <Select 
                  value={settings.timeFormat} 
                  onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 ساعة (2:30 م)</SelectItem>
                    <SelectItem value="24h">24 ساعة (14:30)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => handleSave("التفضيلات")} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* معلومات الشركة */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
              <CardDescription>
                تحديث بيانات الشركة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">اسم الشركة</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">عنوان الشركة</Label>
                <Textarea
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyPhone">هاتف الشركة</Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyEmail">البريد الإلكتروني للشركة</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                />
              </div>
              
              <Button onClick={() => handleSave("معلومات الشركة")} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}