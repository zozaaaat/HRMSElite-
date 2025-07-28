import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  HardHat,
  Crown,
  ClipboardCheck,
  Wrench,
  User
} from "lucide-react";

export default function RoleVisualization() {
  const roleExamples = {
    companyManager: {
      title: "مدير الشركة",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      count: 1,
      keywords: ["شريك", "مدير عام", "رئيس"],
      examples: [
        { name: "حسين علي محمدي", position: "شريك", company: "الاتحاد الخليجي" }
      ]
    },
    administrative: {
      title: "موظف إداري",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      count: 15,
      keywords: ["محاسب", "مسئول", "موظف", "كاتب", "سكرتير", "مدير قسم"],
      examples: [
        { name: "رامين حسنعلي محمدي", position: "مسئول مشتريات", company: "الاتحاد الخليجي" },
        { name: "اسماعيل نوروز", position: "مسئول معرض", company: "الاتحاد الخليجي" },
        { name: "جورج وجيه", position: "مدير مالي", company: "الاتحاد الخليجي" }
      ]
    },
    supervisor: {
      title: "مشرف",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      count: 0,
      keywords: ["مشرف", "رئيس قسم", "مراقب"],
      examples: []
    },
    worker: {
      title: "عامل",
      icon: HardHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      count: 228,
      keywords: ["سائق", "بائع", "خياط", "صائغ", "عامل"],
      examples: [
        { name: "هوجافا رجب علي", position: "سائق / سيارة خصوصي", company: "الاتحاد الخليجي" },
        { name: "محمد أحمد", position: "بائع أقمشة", company: "الاتحاد الخليجي" },
        { name: "علي حسن", position: "خياط عبايات نسائية", company: "ميلانو" }
      ]
    }
  };

  const topPositions = [
    { position: "بائع أقمشة", count: 35, role: "عامل" },
    { position: "سائق / سيارة خصوصي", count: 28, role: "عامل" },
    { position: "خياط", count: 22, role: "عامل" },
    { position: "صائغ حلي ذهبية", count: 18, role: "عامل" },
    { position: "محاسب", count: 8, role: "موظف إداري" },
    { position: "مسئول معرض", count: 4, role: "موظف إداري" },
    { position: "شريك", count: 1, role: "مدير شركة" }
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">شرح تحديد الأدوار - النظام الذكي</h1>
        <p className="text-lg text-muted-foreground">
          كيف حددت دور كل موظف من أصل 244 موظف بناءً على المسمى الوظيفي
        </p>
      </div>

      {/* القواعد الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.entries(roleExamples).map(([key, role]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader className={`${role.bgColor}`}>
              <div className="flex items-center justify-between">
                <role.icon className={`h-8 w-8 ${role.color}`} />
                <Badge variant="secondary" className="text-lg font-bold">
                  {role.count}
                </Badge>
              </div>
              <CardTitle className="text-xl mt-2">{role.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  الكلمات المفتاحية:
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {role.examples.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    أمثلة حقيقية:
                  </p>
                  <div className="space-y-2">
                    {role.examples.map((example, i) => (
                      <div key={i} className="text-xs bg-muted/50 p-2 rounded">
                        <p className="font-medium">{example.name}</p>
                        <p className="text-muted-foreground">{example.position}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {role.examples.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  لم يتم العثور على موظفين بهذا الدور
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* شرح العملية */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🔍 كيف تم التحديد؟</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">1️⃣ قراءة المسمى الوظيفي</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm" dir="ltr">
{`if (position.includes('شريك')) {
  return 'مدير شركة';
}`}
                </pre>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">2️⃣ البحث عن الكلمات المفتاحية</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <pre className="text-sm" dir="ltr">
{`if (position.includes('محاسب') || 
    position.includes('مسئول')) {
  return 'موظف إداري';
}`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">3️⃣ النتيجة النهائية</h3>
            <div className="bg-muted/50 p-6 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-600">1</p>
                  <p className="text-sm text-muted-foreground">مدير شركة</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-muted-foreground">موظف إداري</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground">مشرف</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600">228</p>
                  <p className="text-sm text-muted-foreground">عامل</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أكثر المسميات الوظيفية */}
      <Card>
        <CardHeader>
          <CardTitle>📊 أكثر المسميات الوظيفية شيوعاً</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPositions.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                  <div>
                    <p className="font-medium">{item.position}</p>
                    <p className="text-sm text-muted-foreground">{item.count} موظف</p>
                  </div>
                </div>
                <Badge variant={item.role === "مدير شركة" ? "default" : 
                               item.role === "موظف إداري" ? "secondary" : "outline"}>
                  {item.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}