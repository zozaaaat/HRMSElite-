import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, Shield, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            نظام إدارة الموارد البشرية
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            نظام متكامل ومتقدم لإدارة الشركات والعمال مع صلاحيات مرنة ونظام أرشفة محمي
          </p>
          <Button size="lg" onClick={handleLogin} className="text-lg px-8 py-4">
            تسجيل الدخول
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-8">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">إدارة العمال</h3>
              <p className="text-muted-foreground">
                إدارة شاملة للموظفين مع تتبع الحضور والغياب والإجازات والمرتبات
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">نظام الصلاحيات</h3>
              <p className="text-muted-foreground">
                نظام صلاحيات مرن ومتقدم يدعم أدوار متعددة مع تحكم دقيق في الوصول
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-8">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">التقارير والإحصائيات</h3>
              <p className="text-muted-foreground">
                تقارير مفصلة وإحصائيات شاملة لمتابعة أداء الشركة والموظفين
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features List */}
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-8">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>إدارة متعددة الشركات</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>نظام صلاحيات متقدم</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>إدارة التراخيص والوثائق</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>نظام الإجازات والخصومات</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>التنبيهات الذكية</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>أرشفة آمنة للبيانات</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>تقارير قابلة للتخصيص</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>واجهة عربية متجاوبة</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>دعم الوضع الليلي</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>أمان متقدم مع JWT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
