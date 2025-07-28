import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Plus, 
  Edit,
  Printer,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  Building,
  Users,
  FileCheck,
  ScrollText,
  Ban,
  DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function GovernmentForms() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['/api/employees'],
  });

  const { data: governmentFormsData = [] } = useQuery<any[]>({
    queryKey: ['/api/government-forms'],
  });

  // Auto-fill form function
  const handleAutoFill = async (formId: string) => {
    try {
      const response = await fetch('/api/government-forms/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          employeeId: selectedEmployee,
          companyId: 'demo-company-id'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPreviewData(result.data);
        setIsPreviewOpen(true);
        toast({
          title: "تم ملء النموذج",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في ملء النموذج تلقائياً",
        variant: "destructive"
      });
    }
  };

  // Real government forms data from server
  const governmentForms = governmentFormsData.length > 0 ? governmentFormsData : [
    {
      id: "form-1",
      formType: "تجديد الهوية",
      formNameArabic: "استمارة تجديد بطاقة الهوية المدنية",
      formNameEnglish: "Civil ID Renewal Form",
      issuingAuthority: "الهيئة العامة للمعلومات المدنية",
      category: "وثائق شخصية",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      id: "form-2",
      formType: "تجديد جواز السفر",
      formNameArabic: "استمارة تجديد جواز السفر الكويتي", 
      formNameEnglish: "Kuwaiti Passport Renewal Form",
      issuingAuthority: "إدارة الجوازات - وزارة الداخلية",
      category: "وثائق شخصية",
      icon: FileCheck,
      color: "bg-green-500"
    },
    {
      id: "form-3",
      formType: "توكيل عام",
      nameEn: "Work Permit",
      ministry: "وزارة التجارة والصناعة",
      description: "تصريح مزاولة مهنة أو حرفة",
      fields: ["employee_name", "profession", "qualifications", "experience", "employer_details"],
      icon: FileCheck,
      color: "bg-purple-500"
    },
    {
      id: "social_insurance",
      category: "insurance",
      nameAr: "التأمينات الاجتماعية",
      nameEn: "Social Insurance",
      ministry: "المؤسسة العامة للتأمينات الاجتماعية",
      description: "تسجيل الموظفين في التأمينات الاجتماعية",
      fields: ["employee_name", "civil_id", "salary", "start_date", "job_category"],
      icon: ScrollText,
      color: "bg-orange-500"
    },
    {
      id: "warning_form",
      category: "disciplinary",
      nameAr: "نموذج إنذار",
      nameEn: "Warning Form",
      ministry: "وزارة التجارة - إدارة العمل",
      description: "إنذار تأديبي للموظف",
      fields: ["employee_name", "violation_type", "warning_level", "description", "consequences"],
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      id: "deduction_form",
      category: "financial",
      nameAr: "نموذج خصم",
      nameEn: "Deduction Form",
      ministry: "وزارة التجارة - إدارة العمل",
      description: "خصم من راتب الموظف",
      fields: ["employee_name", "deduction_amount", "reason", "installments", "authorization"],
      icon: DollarSign,
      color: "bg-yellow-500"
    },
    {
      id: "termination_form",
      category: "termination",
      nameAr: "نموذج إنهاء خدمة",
      nameEn: "Termination Form",
      ministry: "وزارة التجارة - إدارة العمل",
      description: "إنهاء خدمة الموظف",
      fields: ["employee_name", "termination_date", "reason", "notice_period", "final_settlement"],
      icon: Ban,
      color: "bg-gray-500"
    },
    {
      id: "leave_permission",
      category: "permissions",
      nameAr: "إذن إجازة",
      nameEn: "Leave Permission",
      ministry: "وزارة التجارة - إدارة العمل",
      description: "طلب إجازة رسمية",
      fields: ["employee_name", "leave_type", "start_date", "end_date", "reason", "replacement"],
      icon: Clock,
      color: "bg-indigo-500"
    }
  ];

  const formCategories = [
    { id: "all", nameAr: "جميع النماذج", count: (governmentForms as any[]).length },
    { id: "وثائق شخصية", nameAr: "الوثائق الشخصية", count: (governmentForms as any[]).filter((f: any) => f.category === "وثائق شخصية").length },
    { id: "شئون العمل", nameAr: "شئون العمل", count: (governmentForms as any[]).filter((f: any) => f.category === "شئون العمل").length },
    { id: "إجراءات قانونية", nameAr: "الإجراءات القانونية", count: (governmentForms as any[]).filter((f: any) => f.category === "إجراءات قانونية").length }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredForms = (governmentForms as any[]).filter((form: any) => 
    (selectedCategory === "all" || form.category === selectedCategory) &&
    (form.formNameArabic?.includes(searchQuery) || form.formNameEnglish?.includes(searchQuery) || form.formType?.includes(searchQuery))
  );

  const handleFillForm = (formId: string, employeeId: string) => {
    console.log(`ملء النموذج ${formId} للموظف ${employeeId}`);
    toast({
      title: "تم ملء النموذج",
      description: "تم ملء النموذج بالبيانات المطلوبة بنجاح"
    });
  };

  const handlePreviewForm = (form: any) => {
    setPreviewData({
      form,
      employee: (employees as any[]).find((emp: any) => emp.id === selectedEmployee),
      fillDate: new Date().toLocaleDateString('ar-SA')
    });
    setIsPreviewOpen(true);
  };

  const handleDownloadForm = (formId: string) => {
    console.log(`تحميل النموذج ${formId}`);
    toast({
      title: "تحميل النموذج",
      description: "سيتم تحميل النموذج قريباً"
    });
  };

  const handlePrintForm = (formId: string) => {
    console.log(`طباعة النموذج ${formId}`);
    window.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">النماذج الحكومية</h1>
          <p className="text-muted-foreground">
            إدارة وملء النماذج الحكومية الكويتية بالبيانات التلقائية
          </p>
        </div>
        <Button onClick={() => console.log('إضافة نموذج جديد')}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة نموذج
        </Button>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            اختيار الموظف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>الموظف</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {(employees as any[]).map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.fullName} - {employee.civilId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>البحث في النماذج</Label>
              <div className="relative">
                <Input
                  placeholder="ابحث عن نموذج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {formCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.nameAr}
              <Badge variant="secondary" className="mr-2 text-xs">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form: any) => {
              const IconComponent = form.icon || FileText;
              return (
                <Card key={form.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${form.color || 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{form.formNameArabic || form.formType}</CardTitle>
                          <p className="text-sm text-muted-foreground">{form.formNameEnglish || form.nameEn}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">الجهة المختصة:</p>
                      <p className="text-sm">{form.issuingAuthority || form.ministry}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">الوصف:</p>
                      <p className="text-sm">{form.description || 'نموذج حكومي'}</p>
                    </div>

                    {form.requiredDocuments && (
                      <div className="flex flex-wrap gap-1">
                        {form.requiredDocuments.slice(0, 2).map((doc: any, index: any) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {doc}
                          </Badge>
                        ))}
                        {form.requiredDocuments.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{form.requiredDocuments.length - 2} المزيد
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAutoFill(form.id)}
                        disabled={!selectedEmployee}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        ملء تلقائي
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewForm(form)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadForm(form.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintForm(form.id)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>معاينة النموذج</DialogTitle>
            <DialogDescription>
              معاينة النموذج قبل الطباعة أو التحميل
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-6">
              {/* Form Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-xl font-bold">{previewData.form.nameAr}</h2>
                <p className="text-sm text-muted-foreground">{previewData.form.ministry}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  تاريخ الملء: {previewData.fillDate}
                </p>
              </div>

              {/* Form Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewData.form.fields.map((field: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Label>
                    <Input 
                      value={`[بيانات ${field.replace(/_/g, ' ')}]`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                ))}
              </div>

              {/* Employee Info if selected */}
              {previewData.employee && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">بيانات الموظف المحددة:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">الاسم: </span>
                      {previewData.employee.fullName}
                    </div>
                    <div>
                      <span className="font-medium">الرقم المدني: </span>
                      {previewData.employee.civilId}
                    </div>
                    <div>
                      <span className="font-medium">الوظيفة: </span>
                      {previewData.employee.jobTitle}
                    </div>
                    <div>
                      <span className="font-medium">الجنسية: </span>
                      {previewData.employee.nationality}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => handlePrintForm(previewData.form.id)}>
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
                <Button onClick={() => handleDownloadForm(previewData.form.id)}>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}