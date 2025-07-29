import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Users,
  Building2,
  TrendingUp,
  BarChart,
  PieChart,
  FileDown,
  Eye,
  Filter,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface PDFReportsProps {
  companyId?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'employees' | 'companies' | 'financial' | 'attendance' | 'licenses';
  icon: React.ComponentType<any>;
  fields: string[];
  filters: string[];
}

const reportTemplates: ReportTemplate[] = [
  // تقارير الموظفين
  {
    id: 'employee-list',
    name: 'قائمة الموظفين',
    description: 'تقرير شامل بجميع بيانات الموظفين',
    category: 'employees',
    icon: Users,
    fields: ['name', 'position', 'department', 'salary', 'hireDate', 'status'],
    filters: ['department', 'status', 'hireDate', 'salary'],
  },
  {
    id: 'employee-salaries',
    name: 'كشف المرتبات',
    description: 'تقرير مفصل بمرتبات الموظفين',
    category: 'employees',
    icon: TrendingUp,
    fields: ['name', 'basicSalary', 'allowances', 'deductions', 'netSalary'],
    filters: ['department', 'salaryRange', 'month'],
  },
  {
    id: 'employee-attendance',
    name: 'تقرير الحضور',
    description: 'حضور وغياب الموظفين',
    category: 'attendance',
    icon: Calendar,
    fields: ['name', 'attendanceDays', 'absenceDays', 'lateDays', 'overtime'],
    filters: ['month', 'department', 'attendanceStatus'],
  },

  // تقارير الشركات
  {
    id: 'company-overview',
    name: 'نظرة عامة على الشركات',
    description: 'ملخص شامل لجميع الشركات',
    category: 'companies',
    icon: Building2,
    fields: ['name', 'industry', 'employees', 'licenses', 'status'],
    filters: ['industry', 'status', 'employeeCount'],
  },
  {
    id: 'company-licenses',
    name: 'تقرير التراخيص',
    description: 'حالة تراخيص الشركات',
    category: 'licenses',
    icon: FileText,
    fields: ['companyName', 'licenseType', 'issueDate', 'expiryDate', 'status'],
    filters: ['licenseType', 'expiryDate', 'status'],
  },

  // التقارير المالية
  {
    id: 'financial-summary',
    name: 'الملخص المالي',
    description: 'تقرير مالي شامل',
    category: 'financial',
    icon: BarChart,
    fields: ['totalSalaries', 'deductions', 'benefits', 'taxes', 'netPayroll'],
    filters: ['month', 'department', 'costCenter'],
  },
  {
    id: 'cost-analysis',
    name: 'تحليل التكاليف',
    description: 'تحليل تفصيلي للتكاليف',
    category: 'financial',
    icon: PieChart,
    fields: ['department', 'salaryBudget', 'actualSpend', 'variance'],
    filters: ['department', 'quarter', 'budgetType'],
  },
];

export function PDFReports({ companyId }: PDFReportsProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportFilters, setReportFilters] = useState<Record<string, any>>({});
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });

  // استعلام البيانات
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
    enabled: !companyId,
  });

  const { data: companyEmployees = [] } = useQuery({
    queryKey: ["/api/companies", companyId, "employees"],
    enabled: !!companyId,
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["/api/licenses"],
  });

  // تصفية القوالب حسب الفئة
  const getTemplatesByCategory = (category: string) => {
    return reportTemplates.filter(template => template.category === category);
  };

  // إنشاء التقرير
  const generateReport = async (formatType: 'pdf' | 'excel' = 'pdf') => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      // محاكاة إنشاء التقرير
      await new Promise(resolve => setTimeout(resolve, 2000));

      // في التطبيق الفعلي، سيتم إرسال البيانات إلى API لإنشاء PDF
      const reportData = {
        template: selectedTemplate.id,
        filters: reportFilters,
        fields: selectedFields.length > 0 ? selectedFields : selectedTemplate.fields,
        dateRange,
        companyId,
        format: formatType,
      };

      // محاكاة تحميل الملف
      const filename = `${selectedTemplate.name}_${format(new Date(), 'yyyy-MM-dd')}.${formatType}`;

      toast({
        title: "تم إنشاء التقرير",
        description: `تم إنشاء ${filename} بنجاح`,
      });

      // في التطبيق الفعلي، سيتم تحميل الملف هنا
      console.log('تحميل التقرير:', reportData);

    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // معاينة التقرير
  const previewReport = () => {
    if (!selectedTemplate) return;

    toast({
      title: "معاينة التقرير",
      description: "سيتم فتح معاينة التقرير في نافذة جديدة",
    });
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تقارير PDF</h2>
          <p className="text-muted-foreground">
            إنشاء وطباعة التقارير المختلفة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={previewReport} disabled={!selectedTemplate}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button onClick={() => generateReport('excel')} disabled={!selectedTemplate || isGenerating}>
            <FileDown className="h-4 w-4 mr-2" />
            إكسل
          </Button>
          <Button onClick={() => generateReport('pdf')} disabled={!selectedTemplate || isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'جاري الإنشاء...' : 'تحميل PDF'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">قوالب التقارير</TabsTrigger>
          <TabsTrigger value="customize">تخصيص التقرير</TabsTrigger>
          <TabsTrigger value="history">سجل التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الموظفون</p>
                    <p className="text-2xl font-bold">{companyId ? (companyEmployees as any[]).length : (employees as any[]).length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">الشركات</p>
                    <p className="text-2xl font-bold">{(companies as any[]).length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">التراخيص</p>
                    <p className="text-2xl font-bold">{(licenses as any[]).length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">القوالب</p>
                    <p className="text-2xl font-bold">{reportTemplates.length}</p>
                  </div>
                  <BarChart className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* قوالب التقارير */}
          <div className="space-y-6">
            {/* تقارير الموظفين */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                تقارير الموظفين
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTemplatesByCategory('employees').concat(getTemplatesByCategory('attendance')).map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setSelectedFields(template.fields);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <template.icon className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* تقارير الشركات والتراخيص */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                تقارير الشركات والتراخيص
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTemplatesByCategory('companies').concat(getTemplatesByCategory('licenses')).map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setSelectedFields(template.fields);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <template.icon className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* التقارير المالية */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                التقارير المالية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTemplatesByCategory('financial').map(template => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setSelectedFields(template.fields);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <template.icon className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.slice(0, 3).map(field => (
                          <Badge key={field} variant="secondary" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                        {template.fields.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.fields.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* إعدادات التقرير */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إعدادات التقرير
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>نطاق التاريخ</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      />
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                  </div>

                  {selectedTemplate.filters.includes('department') && (
                    <div>
                      <Label>القسم</Label>
                      <Select value={reportFilters.department || ''} onValueChange={(value) => 
                        setReportFilters(prev => ({ ...prev, department: value }))
                      }>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">جميع الأقسام</SelectItem>
                          <SelectItem value="hr">الموارد البشرية</SelectItem>
                          <SelectItem value="finance">المحاسبة</SelectItem>
                          <SelectItem value="it">تقنية المعلومات</SelectItem>
                          <SelectItem value="operations">العمليات</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedTemplate.filters.includes('status') && (
                    <div>
                      <Label>الحالة</Label>
                      <Select value={reportFilters.status || ''} onValueChange={(value) => 
                        setReportFilters(prev => ({ ...prev, status: value }))
                      }>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">جميع الحالات</SelectItem>
                          <SelectItem value="active">نشط</SelectItem>
                          <SelectItem value="inactive">غير نشط</SelectItem>
                          <SelectItem value="suspended">موقف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* اختيار الحقول */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    حقول التقرير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedTemplate.fields.map(field => (
                      <div key={field} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={field}
                          checked={selectedFields.includes(field)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFields(prev => [...prev, field]);
                            } else {
                              setSelectedFields(prev => prev.filter(f => f !== field));
                            }
                          }}
                        />
                        <Label htmlFor={field} className="text-sm">
                          {field}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">اختر قالب تقرير</h3>
                <p className="text-muted-foreground">
                  يرجى اختيار قالب تقرير من التبويب الأول لبدء التخصيص
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل التقارير المولدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">قائمة الموظفين - يوليو 2025</h4>
                        <p className="text-sm text-muted-foreground">
                          تم الإنشاء في {format(new Date(), "PPP", { locale: ar })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        تحميل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}