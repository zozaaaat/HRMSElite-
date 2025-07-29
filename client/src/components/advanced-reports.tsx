import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Clock,
  Target,
  Award,
  AlertTriangle
} from "lucide-react";

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'summary';
  category: 'hr' | 'finance' | 'operations' | 'compliance';
  data: any[];
  lastGenerated?: string;
}

export default function AdvancedReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('month');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const reportConfigs: ReportConfig[] = [
    {
      id: '1',
      name: 'تقرير الموظفين الشامل',
      description: 'تحليل مفصل لجميع بيانات الموظفين والإحصائيات',
      type: 'table',
      category: 'hr',
      data: [
        { department: 'التطوير', employees: 45, performance: 92, retention: 88 },
        { department: 'المبيعات', employees: 32, performance: 87, retention: 85 },
        { department: 'المحاسبة', employees: 18, performance: 95, retention: 92 },
        { department: 'الموارد البشرية', employees: 12, performance: 90, retention: 95 }
      ],
      lastGenerated: '2025-07-29'
    },
    {
      id: '2',
      name: 'تحليل الأداء المالي',
      description: 'تقرير شامل للمؤشرات المالية والتكاليف',
      type: 'chart',
      category: 'finance',
      data: [
        { month: 'يناير', revenue: 850000, costs: 620000, profit: 230000 },
        { month: 'فبراير', revenue: 920000, costs: 650000, profit: 270000 },
        { month: 'مارس', revenue: 780000, costs: 580000, profit: 200000 },
        { month: 'أبريل', revenue: 1100000, costs: 750000, profit: 350000 }
      ],
      lastGenerated: '2025-07-28'
    },
    {
      id: '3',
      name: 'تقرير الحضور والانصراف',
      description: 'إحصائيات مفصلة لحضور الموظفين والإجازات',
      type: 'summary',
      category: 'operations',
      data: [
        { metric: 'معدل الحضور', value: 94.5, target: 95, status: 'good' },
        { metric: 'الإجازات المستخدمة', value: 68, target: 70, status: 'excellent' },
        { metric: 'التأخير المتكرر', value: 12, target: 10, status: 'warning' },
        { metric: 'العمل الإضافي', value: 156, target: 150, status: 'warning' }
      ],
      lastGenerated: '2025-07-29'
    },
    {
      id: '4',
      name: 'تقرير الامتثال القانوني',
      description: 'حالة التراخيص والامتثال للقوانين واللوائح',
      type: 'table',
      category: 'compliance',
      data: [
        { license: 'ترخيص مزاولة المهنة', status: 'ساري', expiry: '2025-12-31', risk: 'low' },
        { license: 'ترخيص السلامة المهنية', status: 'ساري', expiry: '2025-09-15', risk: 'medium' },
        { license: 'شهادة الجودة ISO', status: 'منتهي', expiry: '2025-06-30', risk: 'high' },
        { license: 'ترخيص البيئة', status: 'ساري', expiry: '2026-03-20', risk: 'low' }
      ],
      lastGenerated: '2025-07-27'
    },
    {
      id: '5',
      name: 'تحليل الإنتاجية',
      description: 'مؤشرات الأداء والإنتاجية لكل قسم وموظف',
      type: 'chart',
      category: 'operations',
      data: [
        { department: 'التطوير', productivity: 92, efficiency: 88, quality: 95 },
        { department: 'المبيعات', productivity: 87, efficiency: 85, quality: 90 },
        { department: 'التسويق', productivity: 85, efficiency: 82, quality: 88 },
        { department: 'الدعم التقني', productivity: 90, efficiency: 87, quality: 93 }
      ],
      lastGenerated: '2025-07-29'
    },
    {
      id: '6',
      name: 'تقرير التكاليف التشغيلية',
      description: 'تحليل مفصل للتكاليف والمصروفات التشغيلية',
      type: 'summary',
      category: 'finance',
      data: [
        { category: 'الرواتب والأجور', amount: 450000, percentage: 65, change: '+5%' },
        { category: 'التأمينات', amount: 85000, percentage: 12, change: '+2%' },
        { category: 'المكافآت', amount: 75000, percentage: 11, change: '-3%' },
        { category: 'التدريب', amount: 45000, percentage: 6, change: '+8%' },
        { category: 'أخرى', amount: 35000, percentage: 5, change: '+1%' }
      ],
      lastGenerated: '2025-07-28'
    }
  ];

  const categories = [
    { value: 'all', label: 'جميع التقارير', icon: FileText, color: 'bg-gray-100' },
    { value: 'hr', label: 'الموارد البشرية', icon: Users, color: 'bg-blue-100' },
    { value: 'finance', label: 'المالية', icon: TrendingUp, color: 'bg-green-100' },
    { value: 'operations', label: 'العمليات', icon: Target, color: 'bg-purple-100' },
    { value: 'compliance', label: 'الامتثال', icon: Award, color: 'bg-orange-100' }
  ];

  const filteredReports = selectedCategory === 'all' 
    ? reportConfigs 
    : reportConfigs.filter(report => report.category === selectedCategory);

  const generateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(null);
    
    // In real app, this would trigger download
    console.log(`تم إنشاء التقرير: ${reportId}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'table': return <FileText className="h-4 w-4" />;
      case 'summary': return <Target className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hr': return <Users className="h-4 w-4" />;
      case 'finance': return <TrendingUp className="h-4 w-4" />;
      case 'operations': return <Target className="h-4 w-4" />;
      case 'compliance': return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'hr': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finance': return 'bg-green-100 text-green-800 border-green-200';
      case 'operations': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'compliance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hr': return 'موارد بشرية';
      case 'finance': return 'مالية';
      case 'operations': return 'عمليات';
      case 'compliance': return 'امتثال';
      default: return category;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* إعدادات التقارير */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            التقارير المتقدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">فئة التقرير</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الفترة الزمنية</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر ربع</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                  <SelectItem value="custom">فترة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="h-4 w-4 ml-2" />
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التقارير */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">{report.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {report.description}
                    </p>
                  </div>
                </div>
                <Badge className={getCategoryColor(report.category)}>
                  {getCategoryIcon(report.category)}
                  <span className="mr-1">{getCategoryLabel(report.category)}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* معاينة البيانات */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                {report.type === 'table' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">معاينة الجدول:</h4>
                    <div className="text-xs space-y-1">
                      {report.data.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{Object.values(item)[0]}</span>
                          <span className="text-blue-600">{Object.values(item)[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {report.type === 'chart' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">معاينة المخطط:</h4>
                    <div className="flex justify-between text-xs">
                      <span>نقاط البيانات: {report.data.length}</span>
                      <span className="text-green-600">اتجاه إيجابي</span>
                    </div>
                  </div>
                )}
                
                {report.type === 'summary' && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">ملخص المؤشرات:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {report.data.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.metric}</span>
                          <span className={
                            item.status === 'excellent' ? 'text-green-600' :
                            item.status === 'good' ? 'text-blue-600' :
                            item.status === 'warning' ? 'text-orange-600' : 'text-red-600'
                          }>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* معلومات إضافية وأزرار */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>آخر إنشاء: {report.lastGenerated}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport(report.id)}
                    disabled={isGenerating === report.id}
                  >
                    {isGenerating === report.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 ml-2"></div>
                    ) : (
                      <Download className="h-3 w-3 ml-2" />
                    )}
                    {isGenerating === report.id ? 'جاري الإنشاء...' : 'تحميل'}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <FileText className="h-3 w-3 ml-2" />
                    معاينة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* إحصائيات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات التقارير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">تقرير متاح</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">تقرير تم إنشاؤه</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-600">تقرير مجدول</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3.2GB</div>
              <div className="text-sm text-gray-600">حجم البيانات</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}