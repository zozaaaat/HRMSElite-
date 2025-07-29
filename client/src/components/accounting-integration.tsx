import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Calculator, Link2, RefreshCw, CheckCircle, AlertTriangle, DollarSign, FileText, Upload, Download, Settings, Globe, Shield, Clock, Users, BarChart3, TrendingUp, Zap, Database, Sync } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AccountingIntegration {
  id: string;
  name: string;
  type: "quickbooks" | "sap" | "xero" | "sage" | "custom";
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync: string;
  autoSync: boolean;
  syncFrequency: "hourly" | "daily" | "weekly" | "manual";
  features: string[];
  logo: string;
  description: string;
}

interface SyncStatus {
  employeesSync: number;
  payrollSync: number;
  expensesSync: number;
  reportsSync: number;
  lastUpdate: string;
  errors: number;
}

interface AccountingData {
  id: string;
  type: "employee" | "payroll" | "expense" | "report";
  title: string;
  amount?: number;
  status: "synced" | "pending" | "error";
  lastModified: string;
  source: string;
}

export function AccountingIntegration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  // Mock integrations data
  const integrations: AccountingIntegration[] = [
    {
      id: "quickbooks",
      name: "QuickBooks Online",
      type: "quickbooks",
      status: "connected",
      lastSync: "2025-01-27T09:30:00Z",
      autoSync: true,
      syncFrequency: "daily",
      features: ["كشوف المرتبات", "النفقات", "التقارير المالية", "إدارة الموظفين"],
      logo: "💼",
      description: "نظام المحاسبة الأكثر استخداماً للشركات الصغيرة والمتوسطة"
    },
    {
      id: "sap",
      name: "SAP Business One",
      type: "sap", 
      status: "disconnected",
      lastSync: "2025-01-20T14:15:00Z",
      autoSync: false,
      syncFrequency: "weekly",
      features: ["إدارة الموارد البشرية", "المحاسبة المتقدمة", "التحليلات", "إدارة الأصول"],
      logo: "🏢",
      description: "حل المؤسسات المتكامل لإدارة الأعمال"
    },
    {
      id: "xero",
      name: "Xero",
      type: "xero",
      status: "syncing",
      lastSync: "2025-01-27T08:45:00Z",
      autoSync: true,
      syncFrequency: "hourly",
      features: ["المحاسبة السحابية", "كشوف المرتبات", "إدارة الفواتير", "التقارير"],
      logo: "☁️",
      description: "منصة محاسبة سحابية مبتكرة"
    },
    {
      id: "sage",
      name: "Sage 50cloud",
      type: "sage",
      status: "error",
      lastSync: "2025-01-26T16:20:00Z",
      autoSync: true,
      syncFrequency: "daily",
      features: ["المحاسبة التقليدية", "إدارة المخزون", "كشوف المرتبات", "التقارير"],
      logo: "📊",
      description: "حل محاسبي شامل للشركات المتنامية"
    }
  ];

  const syncStatus: SyncStatus = {
    employeesSync: 95,
    payrollSync: 87,
    expensesSync: 92,
    reportsSync: 78,
    lastUpdate: "2025-01-27T09:30:00Z",
    errors: 3
  };

  const mockAccountingData: AccountingData[] = [
    {
      id: "1",
      type: "payroll",
      title: "كشف راتب يناير 2025",
      amount: 485000,
      status: "synced",
      lastModified: "2025-01-27T08:30:00Z",
      source: "QuickBooks"
    },
    {
      id: "2",
      type: "expense", 
      title: "مصاريف التدريب",
      amount: 15000,
      status: "pending",
      lastModified: "2025-01-26T14:20:00Z", 
      source: "Manual Entry"
    },
    {
      id: "3",
      type: "employee",
      title: "بيانات موظف جديد - أحمد سالم",
      status: "error",
      lastModified: "2025-01-25T11:45:00Z",
      source: "HRMS"
    },
    {
      id: "4",
      type: "report",
      title: "تقرير الضرائب الشهري",
      amount: 58750,
      status: "synced",
      lastModified: "2025-01-24T16:30:00Z",
      source: "SAP"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": case "synced": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "syncing": case "pending": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "disconnected": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": case "synced": return <CheckCircle className="h-4 w-4" />;
      case "syncing": case "pending": return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "disconnected": return <Link2 className="h-4 w-4" />;
      case "error": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(true);
    setSelectedIntegration(integrationId);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "تم الربط بنجاح",
      description: "تم ربط النظام المحاسبي بنجاح وبدء المزامنة"
    });
    
    setIsConnecting(false);
    setSelectedIntegration(null);
  };

  const handleSync = async () => {
    toast({
      title: "جاري المزامنة",
      description: "جاري مزامنة البيانات مع الأنظمة المحاسبية"
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            تكامل أنظمة المحاسبة
          </h1>
          <p className="text-muted-foreground">
            ربط ومزامنة البيانات مع أنظمة المحاسبة الخارجية
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSync}>
            <Sync className="h-4 w-4 mr-2" />
            مزامنة الآن
          </Button>
          <Button onClick={() => console.log('إضافة تكامل محاسبي جديد')}>
            <Link2 className="h-4 w-4 mr-2" />
            إضافة تكامل
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الأنظمة المتصلة</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
              <Link2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">آخر مزامنة</p>
                <p className="text-2xl font-bold text-blue-600">09:30</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">البيانات المزامنة</p>
                <p className="text-2xl font-bold text-purple-600">1,247</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الأخطاء</p>
                <p className="text-2xl font-bold text-red-600">{syncStatus.errors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="integrations">الأنظمة</TabsTrigger>
          <TabsTrigger value="sync">المزامنة</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                حالة المزامنة
              </CardTitle>
              <CardDescription>
                آخر تحديث: {new Date(syncStatus.lastUpdate).toLocaleString('ar-SA')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">بيانات الموظفين</span>
                    <span className="text-sm text-muted-foreground">{syncStatus.employeesSync}%</span>
                  </div>
                  <Progress value={syncStatus.employeesSync} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">كشوف المرتبات</span>
                    <span className="text-sm text-muted-foreground">{syncStatus.payrollSync}%</span>
                  </div>
                  <Progress value={syncStatus.payrollSync} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">المصروفات</span>
                    <span className="text-sm text-muted-foreground">{syncStatus.expensesSync}%</span>
                  </div>
                  <Progress value={syncStatus.expensesSync} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">التقارير</span>
                    <span className="text-sm text-muted-foreground">{syncStatus.reportsSync}%</span>
                  </div>
                  <Progress value={syncStatus.reportsSync} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAccountingData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        item.type === 'payroll' ? 'bg-green-100 text-green-600' :
                        item.type === 'expense' ? 'bg-red-100 text-red-600' :
                        item.type === 'employee' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {item.type === 'payroll' ? <DollarSign className="h-4 w-4" /> :
                         item.type === 'expense' ? <TrendingUp className="h-4 w-4" /> :
                         item.type === 'employee' ? <Users className="h-4 w-4" /> :
                         <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">من {item.source}</p>
                      </div>
                    </div>
                    
                    <div className="text-left space-y-1">
                      {item.amount && (
                        <p className="font-semibold">{item.amount.toLocaleString()} ر.س</p>
                      )}
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="mr-1">
                          {item.status === 'synced' ? 'مزامن' :
                           item.status === 'pending' ? 'في الانتظار' : 'خطأ'}
                        </span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(integration.status)}>
                      {getStatusIcon(integration.status)}
                      <span className="mr-1">
                        {integration.status === 'connected' ? 'متصل' :
                         integration.status === 'syncing' ? 'يزامن' :
                         integration.status === 'disconnected' ? 'منقطع' : 'خطأ'}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">الميزات المدعومة:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>آخر مزامنة:</span>
                    <span>{new Date(integration.lastSync).toLocaleString('ar-SA')}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>المزامنة التلقائية:</span>
                    <Switch checked={integration.autoSync} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('إعدادات النظام المحاسبي', integration.name)}>
                          <Settings className="h-4 w-4 mr-2" />
                          إعدادات
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => console.log('قطع اتصال النظام المحاسبي', integration.name)}>
                          قطع الاتصال
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting && selectedIntegration === integration.id}
                      >
                        {isConnecting && selectedIntegration === integration.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            جاري الربط...
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            ربط
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sync className="h-5 w-5" />
                إعدادات المزامنة
              </CardTitle>
              <CardDescription>
                تكوين عملية مزامنة البيانات بين النظم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="syncFreq">تكرار المزامنة</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">كل ساعة</SelectItem>
                        <SelectItem value="daily">يومياً</SelectItem>
                        <SelectItem value="weekly">أسبوعياً</SelectItem>
                        <SelectItem value="manual">يدوياً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>أنواع البيانات للمزامنة</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">بيانات الموظفين</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">كشوف المرتبات</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">المصروفات</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التقارير المالية</span>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="syncTime">وقت المزامنة اليومية</Label>
                    <Input id="syncTime" type="time" defaultValue="02:00" />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>خيارات المزامنة</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إيقاف المزامنة عند الأخطاء</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">إرسال تقارير المزامنة</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الاحتفاظ بنسخ احتياطية</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التشفير المتقدم</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => console.log('إلغاء تغييرات إعدادات المزامنة')}>إلغاء</Button>
                <Button onClick={() => console.log('حفظ إعدادات المزامنة')}>حفظ الإعدادات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  الأمان والحماية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">التشفير الشامل</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">المصادقة الثنائية</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">سجل العمليات</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">التحقق من سلامة البيانات</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  إعدادات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timeout">مهلة الاتصال (ثانية)</Label>
                  <Input id="timeout" type="number" defaultValue="30" />
                </div>
                <div>
                  <Label htmlFor="retries">عدد محاولات الإعادة</Label>
                  <Input id="retries" type="number" defaultValue="3" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">اتصال آمن SSL</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ضغط البيانات</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">إشعارات نجاح المزامنة</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تنبيهات الأخطاء</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تقارير أسبوعية</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تنبيهات الصيانة</span>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  إدارة البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => console.log('تصدير بيانات النظام المحاسبي')}>
                  <Download className="h-4 w-4 mr-2" />
                  تصدير البيانات
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => console.log('استيراد بيانات للنظام المحاسبي')}>
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد البيانات
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => console.log('إعادة تعيين إعدادات المزامنة')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  إعادة تعيين المزامنة
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={() => console.log('تأكيد حذف جميع بيانات المزامنة')}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  حذف جميع البيانات
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}