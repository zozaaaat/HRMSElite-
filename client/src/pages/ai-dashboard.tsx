import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Brain,
  AlertTriangle,
  Users,
  Calendar,
  Activity,
  Target,
  Zap,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {useToast} from '@/hooks/use-toast';

// بيانات وهمية للتحليلات
const licenseExpiryData = [
  {'month': 'يناير', 'expiring': 12, 'renewed': 8, 'new': 5},
  {'month': 'فبراير', 'expiring': 15, 'renewed': 10, 'new': 7},
  {'month': 'مارس', 'expiring': 8, 'renewed': 12, 'new': 3},
  {'month': 'أبريل', 'expiring': 20, 'renewed': 15, 'new': 10},
  {'month': 'مايو', 'expiring': 18, 'renewed': 14, 'new': 8},
  {'month': 'يونيو', 'expiring': 25, 'renewed': 20, 'new': 12}
];

const attendancePatterns = [
  {'day': 'الأحد', 'present': 95, 'absent': 5, 'late': 8},
  {'day': 'الاثنين', 'present': 92, 'absent': 8, 'late': 12},
  {'day': 'الثلاثاء', 'present': 88, 'absent': 12, 'late': 15},
  {'day': 'الأربعاء', 'present': 90, 'absent': 10, 'late': 10},
  {'day': 'الخميس', 'present': 85, 'absent': 15, 'late': 18},
  {'day': 'الجمعة', 'present': 0, 'absent': 0, 'late': 0},
  {'day': 'السبت', 'present': 0, 'absent': 0, 'late': 0}
];

const jobChangesData = [
  {'name': 'أحمد محمد', 'changes': 3, 'department': 'IT', 'months': 6},
  {'name': 'فاطمة علي', 'changes': 2, 'department': 'HR', 'months': 4},
  {'name': 'محمد حسن', 'changes': 4, 'department': 'Sales', 'months': 8},
  {'name': 'سارة أحمد', 'changes': 1, 'department': 'Finance', 'months': 2},
  {'name': 'علي محمود', 'changes': 3, 'department': 'Marketing', 'months': 5}
];

const aiInsights = [
  {
    'type': 'warning',
    'title': 'تراخيص ستنتهي قريباً',
    'message': '5 تراخيص ستنتهي خلال الشهر القادم',
    'icon': AlertTriangle,
    'color': 'text-orange-500'
  },
  {
    'type': 'success',
    'title': 'تحسن في الحضور',
    'message': 'نسبة الحضور تحسنت بنسبة 15% هذا الشهر',
    'icon': CheckCircle,
    'color': 'text-green-500'
  },
  {
    'type': 'info',
    'title': 'توصية للتدريب',
    'message': '3 موظفين يحتاجون تدريب إضافي في مجالهم',
    'icon': Lightbulb,
    'color': 'text-blue-500'
  },
  {
    'type': 'error',
    'title': 'مشاكل في الأداء',
    'message': '2 موظفين يحتاجون متابعة أداء',
    'icon': XCircle,
    'color': 'text-red-500'
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AIDashboard () {

  const {toast} = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleAIAction = (action: string) => {

    setLoading(true);
    // محاكاة استجابة AI
    setTimeout(() => {

      toast({
        'title': 'تحليل AI',
        'description': `تم تحليل ${action} بنجاح`
      });
      setLoading(false);

    }, 2000);

  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Brain className="w-8 h-8" />
            لوحة التحكم الذكية
          </h1>
          <p className="text-muted-foreground">تحليلات ذكية وتنبؤات باستخدام الذكاء الاصطناعي</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Zap className="w-4 h-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiInsights.map((insight, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
              <insight.icon className={`h-4 w-4 ${insight.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{insight.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="licenses">التراخيص</TabsTrigger>
          <TabsTrigger value="attendance">الحضور</TabsTrigger>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* تنبؤ انتهاء التراخيص */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  تنبؤ انتهاء التراخيص
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={licenseExpiryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="expiring" stackId="1" stroke="#ff7300" fill="#ff7300" />
                    <Area type="monotone" dataKey="renewed" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="new" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* تحليل أنماط الحضور */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  أنماط الحضور الأسبوعية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendancePatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#82ca9d" />
                    <Bar dataKey="absent" fill="#ff7300" />
                    <Bar dataKey="late" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* رسم بياني دائري للتراخيص */}
            <Card>
              <CardHeader>
                <CardTitle>حالة التراخيص</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        {'name': 'نشطة', 'value': 65},
                        {'name': 'تنتهي قريباً', 'value': 15},
                        {'name': 'منتهية', 'value': 10},
                        {'name': 'قيد التجديد', 'value': 10}
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* جدول التراخيص المهددة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  التراخيص المهددة بالانتهاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {'name': 'شركة النيل الأزرق', 'days': 15, 'type': 'تجاري'},
                    {'name': 'شركة الاتحاد الخليجي', 'days': 30, 'type': 'صناعي'},
                    {'name': 'شركة قمة النيل', 'days': 45, 'type': 'خدمي'},
                    {'name': 'شركة محمد أحمد', 'days': 60, 'type': 'تجاري'}
                  ].map((license, index) => (
                    <div key={
  index
} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{license.name}</p>
                        <p className="text-sm text-muted-foreground">{license.type}</p>
                      </div>
                      <Badge variant={license.days <= 30 ? 'destructive' : 'secondary'}>
                        {license.days} يوم
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* رسم بياني خطي للحضور */}
            <Card>
              <CardHeader>
                <CardTitle>معدل الحضور الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={licenseExpiryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="renewed" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="new" stroke="#8884d8" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* إحصائيات الحضور */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الحضور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>نسبة الحضور الإجمالية</span>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>متوسط التأخير</span>
                    <Badge variant="outline">12 دقيقة</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>أيام الغياب الشهرية</span>
                    <Badge variant="outline">3.2 يوم</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>أفضل قسم في الحضور</span>
                    <Badge variant="secondary">قسم IT</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* أكثر الموظفين تغييراً للوظائف */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  أكثر الموظفين تغييراً للوظائف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobChangesData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="changes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* تحليل الأداء */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل أداء الموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {'name': 'أحمد محمد', 'performance': 95, 'trend': 'up'},
                    {'name': 'فاطمة علي', 'performance': 88, 'trend': 'stable'},
                    {'name': 'محمد حسن', 'performance': 72, 'trend': 'down'},
                    {'name': 'سارة أحمد', 'performance': 91, 'trend': 'up'}
                  ].map((employee, index) => (
                    <div key={
  index
} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          الأداء: {employee.performance}%
                        </p>
                      </div>
                      <Badge
                        variant={
  employee.trend === 'up' ? 'default' : employee.trend === 'down' ? 'destructive' : 'secondary'
}
                      >
                        {
  employee.trend === 'up' ? 'تحسن' : employee.trend === 'down' ? 'تراجع' : 'مستقر'
}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            إجراءات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => handleAIAction('تقرير الغياب')}
              disabled={loading}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Calendar className="w-6 h-6" />
              <span>تقرير الغياب</span>
            </Button>

            <Button
              onClick={() => handleAIAction('التراخيص المنتهية')}
              disabled={loading}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <AlertTriangle className="w-6 h-6" />
              <span>التراخيص المنتهية</span>
            </Button>

            <Button
              onClick={() => handleAIAction('تحليل الأداء')}
              disabled={loading}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Target className="w-6 h-6" />
              <span>تحليل الأداء</span>
            </Button>

            <Button
              onClick={() => handleAIAction('التوصيات')}
              disabled={loading}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
            >
              <Lightbulb className="w-6 h-6" />
              <span>التوصيات</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

}
