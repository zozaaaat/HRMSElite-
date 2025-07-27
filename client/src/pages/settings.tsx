import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Mail,
  Phone,
  Building2,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Key,
  Users,
  FileText
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-2">إدارة إعدادات النظام والحساب والأمان</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                إعدادات المؤسسة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">اسم المؤسسة</Label>
                  <Input id="company-name" defaultValue="نظام إدارة الموارد البشرية" />
                </div>
                <div>
                  <Label htmlFor="company-code">رمز المؤسسة</Label>
                  <Input id="company-code" defaultValue="HRMS2024" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="company-desc">وصف المؤسسة</Label>
                <Textarea 
                  id="company-desc" 
                  defaultValue="نظام متكامل لإدارة الموارد البشرية يخدم الشركات والمؤسسات المختلفة"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time-zone">المنطقة الزمنية</Label>
                  <Select defaultValue="asia-riyadh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-riyadh">توقيت الرياض (GMT+3)</SelectItem>
                      <SelectItem value="asia-dubai">توقيت دبي (GMT+4)</SelectItem>
                      <SelectItem value="asia-kuwait">توقيت الكويت (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select defaultValue="sar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sar">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="aed">درهم إماراتي (AED)</SelectItem>
                      <SelectItem value="kwd">دينار كويتي (KWD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                الإعدادات الإقليمية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">اللغة الافتراضية</Label>
                  <Select defaultValue="ar">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">تنسيق التاريخ</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-reverse space-x-2">
                <Switch id="rtl-support" defaultChecked />
                <Label htmlFor="rtl-support">دعم اتجاه النص من اليمين لليسار (RTL)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  م.س
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">تغيير الصورة</Button>
                  <p className="text-sm text-muted-foreground">PNG, JPG حتى 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">الاسم الأول</Label>
                  <Input id="first-name" defaultValue="مدير" />
                </div>
                <div>
                  <Label htmlFor="last-name">اسم العائلة</Label>
                  <Input id="last-name" defaultValue="النظام" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" defaultValue="admin@hrms.com" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" defaultValue="+966 50 123 4567" />
                </div>
                <div>
                  <Label htmlFor="position">المنصب</Label>
                  <Input id="position" defaultValue="مدير النظام" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">المصادقة الثنائية</h4>
                    <p className="text-sm text-muted-foreground">حماية إضافية لحسابك</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">مفعل</Badge>
                    <Button variant="outline" size="sm">إدارة</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">تسجيل جلسات الدخول</h4>
                    <p className="text-sm text-muted-foreground">تتبع جميع عمليات تسجيل الدخول</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">كلمة المرور</h4>
                  <div className="space-y-3">
                    <Input type="password" placeholder="كلمة المرور الحالية" />
                    <Input type="password" placeholder="كلمة المرور الجديدة" />
                    <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" />
                    <Button>تحديث كلمة المرور</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                الجلسات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">الجلسة الحالية</h4>
                  <p className="text-sm text-muted-foreground">Chrome على Windows • الرياض، السعودية</p>
                  <p className="text-xs text-muted-foreground">آخر نشاط: الآن</p>
                </div>
                <Badge className="bg-green-100 text-green-800">الحالية</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Safari على iPhone</h4>
                  <p className="text-sm text-muted-foreground">جدة، السعودية</p>
                  <p className="text-xs text-muted-foreground">آخر نشاط: منذ 3 ساعات</p>
                </div>
                <Button variant="outline" size="sm">إنهاء الجلسة</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                تفضيلات الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">إشعارات البريد الإلكتروني</h4>
                    <p className="text-sm text-muted-foreground">تلقي إشعارات على البريد الإلكتروني</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">إشعارات الدفع (Push)</h4>
                    <p className="text-sm text-muted-foreground">إشعارات فورية في المتصفح</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">رسائل SMS</h4>
                    <p className="text-sm text-muted-foreground">إشعارات مهمة عبر الرسائل النصية</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">أنواع الإشعارات</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-new-employee">موظف جديد</Label>
                    <Switch id="notif-new-employee" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-leave-request">طلبات الإجازة</Label>
                    <Switch id="notif-leave-request" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-payroll">كشوف المرتبات</Label>
                    <Switch id="notif-payroll" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notif-system">تحديثات النظام</Label>
                    <Switch id="notif-system" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                إعدادات المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">المظهر</Label>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <Card className="cursor-pointer border-2 border-blue-200 bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-8 bg-white rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">فاتح</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer border-2">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-8 bg-gray-800 rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">داكن</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer border-2">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-8 bg-gradient-to-r from-white to-gray-800 rounded mx-auto mb-2"></div>
                      <p className="text-sm font-medium">تلقائي</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">حجم الخط</Label>
                <Select defaultValue="medium">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">صغير</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="large">كبير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">الحركات والانتقالات</Label>
                  <p className="text-sm text-muted-foreground">تفعيل الرسوم المتحركة</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                معلومات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">إصدار النظام:</span>
                    <span className="text-sm">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">آخر تحديث:</span>
                    <span className="text-sm">27 يناير 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">قاعدة البيانات:</span>
                    <span className="text-sm">PostgreSQL 15.3</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">المستخدمين النشطين:</span>
                    <span className="text-sm">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">حجم البيانات:</span>
                    <span className="text-sm">2.4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">وقت التشغيل:</span>
                    <span className="text-sm">99.9%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                صيانة النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">تحسين قاعدة البيانات</h4>
                  <p className="text-sm text-muted-foreground">تحسين أداء قاعدة البيانات</p>
                </div>
                <Button variant="outline">تشغيل</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">نسخ احتياطي</h4>
                  <p className="text-sm text-muted-foreground">إنشاء نسخة احتياطية من البيانات</p>
                </div>
                <Button variant="outline">إنشاء نسخة</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">تحديث النظام</h4>
                  <p className="text-sm text-muted-foreground">البحث عن تحديثات جديدة</p>
                </div>
                <Button variant="outline">فحص التحديثات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}