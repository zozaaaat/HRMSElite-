import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Settings, 
  Building,
  Camera,
  Save,
  Shield,
  Globe,
  Moon,
  Sun
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: "أحمد محمد علي",
    email: "ahmed@company.com",
    phone: "+966 55 123 4567",
    position: "مدير الموارد البشرية",
    bio: "خبرة 10 سنوات في إدارة الموارد البشرية والتطوير التنظيمي"
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    sessionTimeout: "30",
    passwordStrength: "strong"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
    systemUpdates: true,
    marketingEmails: false
  });

  const [appPreferences, setAppPreferences] = useState({
    language: "ar",
    theme: "light",
    dateFormat: "dd/mm/yyyy",
    timeFormat: "24h",
    currency: "KWD",
    timezone: "Asia/Kuwait"
  });

  const [companySettings, setCompanySettings] = useState({
    name: "شركة التقنية المتقدمة",
    address: "الرياض، المملكة العربية السعودية",
    phone: "+966 11 123 4567",
    email: "info@company.com",
    website: "https://company.com",
    taxNumber: "123456789"
  });

  const handleSaveProfile = () => {
    toast({
      title: "تم حفظ الملف الشخصي",
      description: "تم تحديث بياناتك الشخصية بنجاح",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "تم حفظ إعدادات الأمان",
      description: "تم تحديث إعدادات الأمان والخصوصية بنجاح",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "تم حفظ إعدادات الإشعارات",
      description: "تم تحديث تفضيلات الإشعارات بنجاح",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "تم حفظ التفضيلات",
      description: "تم تحديث تفضيلات التطبيق بنجاح",
    });
  };

  const handleSaveCompany = () => {
    toast({
      title: "تم حفظ بيانات الشركة",
      description: "تم تحديث معلومات الشركة بنجاح",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة الملف الشخصي وإعدادات النظام
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            التفضيلات
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            الشركة
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>
                إدارة معلوماتك الشخصية والمهنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">أم</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="gap-2 mb-2">
                    <Camera className="h-4 w-4" />
                    تغيير الصورة
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG أو GIF. الحد الأقصى 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">المنصب</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">نبذة عنك</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الأمان والخصوصية</CardTitle>
              <CardDescription>
                إدارة إعدادات أمان حسابك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">تغيير كلمة المرور</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button variant="outline">تحديث كلمة المرور</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">
                      طبقة أمان إضافية لحسابك
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">إشعارات الأمان</Label>
                    <p className="text-sm text-muted-foreground">
                      تنبيهات عند محاولات الدخول المشبوهة
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({ ...securitySettings, emailNotifications: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="gap-2">
                <Shield className="h-4 w-4" />
                حفظ إعدادات الأمان
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                تخصيص تفضيلات الإشعارات والتنبيهات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي التنبيهات المهمة عبر البريد الإلكتروني
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, emailAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي التنبيهات العاجلة عبر الرسائل النصية
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, smsAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">الإشعارات المباشرة</Label>
                    <p className="text-sm text-muted-foreground">
                      إشعارات فورية في المتصفح
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">التقارير الأسبوعية</Label>
                    <p className="text-sm text-muted-foreground">
                      ملخص أسبوعي لأنشطة النظام
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">تحديثات النظام</Label>
                    <p className="text-sm text-muted-foreground">
                      إشعارات عن الميزات الجديدة والتحديثات
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="gap-2">
                <Bell className="h-4 w-4" />
                حفظ إعدادات الإشعارات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تفضيلات التطبيق</CardTitle>
              <CardDescription>
                تخصيص واجهة وسلوك التطبيق
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <select
                    id="language"
                    value={appPreferences.language}
                    onChange={(e) => setAppPreferences({ ...appPreferences, language: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">المظهر</Label>
                  <select
                    id="theme"
                    value={appPreferences.theme}
                    onChange={(e) => setAppPreferences({ ...appPreferences, theme: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="light">فاتح</option>
                    <option value="dark">داكن</option>
                    <option value="system">حسب النظام</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <select
                    id="dateFormat"
                    value={appPreferences.dateFormat}
                    onChange={(e) => setAppPreferences({ ...appPreferences, dateFormat: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">تنسيق الوقت</Label>
                  <select
                    id="timeFormat"
                    value={appPreferences.timeFormat}
                    onChange={(e) => setAppPreferences({ ...appPreferences, timeFormat: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="24h">24 ساعة</option>
                    <option value="12h">12 ساعة</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">العملة</Label>
                  <select
                    id="currency"
                    value={appPreferences.currency}
                    onChange={(e) => setAppPreferences({ ...appPreferences, currency: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="KWD">دينار كويتي (KWD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <select
                    id="timezone"
                    value={appPreferences.timezone}
                    onChange={(e) => setAppPreferences({ ...appPreferences, timezone: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Asia/Kuwait">الكويت</option>
                    <option value="Asia/Riyadh">الرياض</option>
                    <option value="Asia/Dubai">دبي</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="gap-2">
                <Settings className="h-4 w-4" />
                حفظ التفضيلات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
              <CardDescription>
                إدارة البيانات الأساسية للشركة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">اسم الشركة</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-phone">هاتف الشركة</Label>
                  <Input
                    id="company-phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-email">البريد الإلكتروني</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-website">الموقع الإلكتروني</Label>
                  <Input
                    id="company-website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">العنوان</Label>
                  <Textarea
                    id="company-address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-number">الرقم الضريبي</Label>
                  <Input
                    id="tax-number"
                    value={companySettings.taxNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, taxNumber: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompany} className="gap-2">
                <Building className="h-4 w-4" />
                حفظ بيانات الشركة
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}