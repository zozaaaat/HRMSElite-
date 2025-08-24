import {useState} from 'react';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Textarea} from '../components/ui/textarea';
import {Switch} from '../components/ui/switch';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Avatar, AvatarFallback, AvatarImage} from '../components/ui/avatar';
import {useToast} from '../hooks/use-toast';
import {
  User,
  Lock,
  Bell,
  Settings,
  Building,
  Camera,
  Save,
  Shield
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import { t } from "i18next";

export default function SettingsPage () {

  return (
    <SharedLayout
      userRole="company_manager"
      userName={t('auto.settings.75')}
      companyName={t('auto.settings.76')}
    >
      <SettingsContent />
    </SharedLayout>
  );

}

function SettingsContent () {

  const {toast} = useToast();
  const [profileData, setProfileData] = useState({
    'name': 'أحمد محمد علي',
    'email': 'ahmed@company.com',
    'phone': '+966 55 123 4567',
    'position': 'مدير الموارد البشرية',
    'bio': 'خبرة 10 سنوات في إدارة الموارد البشرية والتطوير التنظيمي'
  });

  const [securitySettings, setSecuritySettings] = useState({
    'twoFactorAuth': true,
    'emailNotifications': true,
    'sessionTimeout': '30',
    'passwordStrength': 'strong'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    'emailAlerts': true,
    'smsAlerts': false,
    'pushNotifications': true,
    'weeklyReports': true,
    'systemUpdates': true,
    'marketingEmails': false
  });

  const [appPreferences, setAppPreferences] = useState({
    'language': 'ar',
    'theme': 'light',
    'dateFormat': 'dd/mm/yyyy',
    'timeFormat': '24h',
    'currency': 'KWD',
    'timezone': 'Asia/Kuwait'
  });

  const [companySettings, setCompanySettings] = useState({
    'name': 'شركة التقنية المتقدمة',
    'address': 'الرياض، المملكة العربية السعودية',
    'phone': '+966 11 123 4567',
    'email': 'info@company.com',
    'website': 'https://company.com',
    'taxNumber': '123456789'
  });

  const handleSaveProfile = () => {

    toast({
      'title': 'تم حفظ الملف الشخصي',
      'description': 'تم تحديث بياناتك الشخصية بنجاح'
    });

  };

  const handleSaveSecurity = () => {

    toast({
      'title': 'تم حفظ إعدادات الأمان',
      'description': 'تم تحديث إعدادات الأمان والخصوصية بنجاح'
    });

  };

  const handleSaveNotifications = () => {

    toast({
      'title': 'تم حفظ إعدادات الإشعارات',
      'description': 'تم تحديث تفضيلات الإشعارات بنجاح'
    });

  };

  const handleSavePreferences = () => {

    toast({
      'title': 'تم حفظ التفضيلات',
      'description': 'تم تحديث تفضيلات التطبيق بنجاح'
    });

  };

  const handleSaveCompany = () => {

    toast({
      'title': 'تم حفظ بيانات الشركة',
      'description': 'تم تحديث معلومات الشركة بنجاح'
    });

  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('auto.settings.1')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('auto.settings.2')}</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t('auto.settings.3')}</TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            {t('auto.settings.4')}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            {t('auto.settings.5')}</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('auto.settings.6')}</TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building className="h-4 w-4" />
            {t('auto.settings.7')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('auto.settings.8')}</CardTitle>
              <CardDescription>
                {t('auto.settings.9')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-lg">{t('auto.settings.10')}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="gap-2 mb-2">
                    <Camera className="h-4 w-4" />
                    {t('auto.settings.11')}</Button>
                  <p className="text-sm text-muted-foreground">
                    {t('auto.settings.12')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auto.settings.13')}</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, 'name': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auto.settings.14')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, 'email': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('auto.settings.15')}</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, 'phone': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">{t('auto.settings.16')}</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({...profileData, 'position': e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t('auto.settings.17')}</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, 'bio': e.target.value})}
                  rows={3}
                />
              </div>

              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="h-4 w-4" />
                {t('auto.settings.18')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('auto.settings.19')}</CardTitle>
              <CardDescription>
                {t('auto.settings.20')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">{t('auto.settings.21')}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">{t('auto.settings.22')}</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('auto.settings.23')}</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auto.settings.24')}</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <Button variant="outline">{t('auto.settings.25')}</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.26')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.27')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({...securitySettings, 'twoFactorAuth': checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.28')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.29')}</p>
                  </div>
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({...securitySettings, 'emailNotifications': checked})
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="gap-2">
                <Shield className="h-4 w-4" />
                {t('auto.settings.30')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('auto.settings.31')}</CardTitle>
              <CardDescription>
                {t('auto.settings.32')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.33')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.34')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({...notificationSettings, 'emailAlerts': checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.35')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.36')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({...notificationSettings, 'smsAlerts': checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.37')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.38')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
  ...notificationSettings, 'pushNotifications': checked
})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.39')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.40')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({...notificationSettings, 'weeklyReports': checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">{t('auto.settings.41')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('auto.settings.42')}</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({...notificationSettings, 'systemUpdates': checked})
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="gap-2">
                <Bell className="h-4 w-4" />
                {t('auto.settings.43')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('auto.settings.44')}</CardTitle>
              <CardDescription>
                {t('auto.settings.45')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">{t('auto.settings.46')}</Label>
                  <select
                    id="language"
                    value={appPreferences.language}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'language': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="ar">{t('auto.settings.47')}</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">{t('auto.settings.48')}</Label>
                  <select
                    id="theme"
                    value={appPreferences.theme}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'theme': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="light">{t('auto.settings.49')}</option>
                    <option value="dark">{t('auto.settings.50')}</option>
                    <option value="system">{t('auto.settings.51')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t('auto.settings.52')}</Label>
                  <select
                    id="dateFormat"
                    value={appPreferences.dateFormat}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'dateFormat': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">{t('auto.settings.53')}</Label>
                  <select
                    id="timeFormat"
                    value={appPreferences.timeFormat}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'timeFormat': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="24h">{t('auto.settings.54')}</option>
                    <option value="12h">{t('auto.settings.55')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">{t('auto.settings.56')}</Label>
                  <select
                    id="currency"
                    value={appPreferences.currency}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'currency': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="KWD">{t('auto.settings.57')}</option>
                    <option value="SAR">{t('auto.settings.58')}</option>
                    <option value="AED">{t('auto.settings.59')}</option>
                    <option value="USD">{t('auto.settings.60')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">{t('auto.settings.61')}</Label>
                  <select
                    id="timezone"
                    value={appPreferences.timezone}
                    onChange={
  (e) => setAppPreferences({
  ...appPreferences, 'timezone': e.target.value
})
}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Asia/Kuwait">{t('auto.settings.62')}</option>
                    <option value="Asia/Riyadh">{t('auto.settings.63')}</option>
                    <option value="Asia/Dubai">{t('auto.settings.64')}</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="gap-2">
                <Settings className="h-4 w-4" />
                {t('auto.settings.65')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('auto.settings.66')}</CardTitle>
              <CardDescription>
                {t('auto.settings.67')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">{t('auto.settings.68')}</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'name': e.target.value
})
}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">{t('auto.settings.69')}</Label>
                  <Input
                    id="company-phone"
                    value={companySettings.phone}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'phone': e.target.value
})
}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-email">{t('auto.settings.70')}</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companySettings.email}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'email': e.target.value
})
}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-website">{t('auto.settings.71')}</Label>
                  <Input
                    id="company-website"
                    value={companySettings.website}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'website': e.target.value
})
}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company-address">{t('auto.settings.72')}</Label>
                  <Textarea
                    id="company-address"
                    value={companySettings.address}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'address': e.target.value
})
}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-number">{t('auto.settings.73')}</Label>
                  <Input
                    id="tax-number"
                    value={companySettings.taxNumber}
                    onChange={
  (e) => setCompanySettings({
  ...companySettings, 'taxNumber': e.target.value
})
}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompany} className="gap-2">
                <Building className="h-4 w-4" />
                {t('auto.settings.74')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

}
