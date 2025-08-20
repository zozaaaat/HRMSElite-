import {useState} from 'react';
import {Link} from 'wouter';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {Badge} from '../components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {Textarea} from '../components/ui/textarea';
import {useQuery, useMutation} from '@tanstack/react-query';
import {queryClient} from '@/lib/queryClient';
import {toast} from '../hooks/use-toast';
import {GovernmentForm, GovernmentFormRequest, Company} from '../types/component-props';
import {
  FileText,
  Download,
  Search,
  Plus,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  DollarSign,
  Info,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import {LoadingSpinner, ErrorMessage} from '../components/shared';

// Type definitions for API responses
interface FormRequestResponse {
  success: boolean;
  message: string;
}

interface AutoFillResponse {
  success: boolean;
  downloadUrl: string;
  message: string;
}

export default function GovernmentForms () {

  return (
    <SharedLayout
      userRole="company_manager"
      userName="مدير الشركة"
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <GovernmentFormsContent />
    </SharedLayout>
  );

}

function GovernmentFormsContent () {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<GovernmentForm | null>(null);
  const [activeTab, setActiveTab] = useState('forms');
  const [companyIdInput, setCompanyIdInput] = useState('');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Fetch government forms
  const {'data': governmentForms = [], 'isLoading': formsLoading, 'error': formsError} = useQuery({
    'queryKey': ['/api/government-forms']
  });

  // Fetch requests
  const {'data': requests = [], 'isLoading': requestsLoading, 'error': requestsError} = useQuery({
    'queryKey': ['/api/requests']
  });

  // Fetch companies
  const {
  'data': companies = [], 'isLoading': companiesLoading, 'error': companiesError
} = useQuery({
  
    'queryKey': ['/api/companies']
  });

  // Submit form request mutation
  const submitFormMutation = useMutation({
    'mutationFn': async (formData: Record<string, unknown>): Promise<FormRequestResponse> => {

      const response = await fetch('/api/form-requests', {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'credentials': 'include',
        'body': JSON.stringify(formData)
      });
      if (!response.ok) {

        throw new Error('Failed to submit form request');

      }
      return response.json() as Promise<FormRequestResponse>;

    },
    'onSuccess': () => {

      toast({
        'title': 'تم إرسال الطلب',
        'description': 'تم إرسال طلب النموذج بنجاح وسيتم معالجته قريباً'
      });
      setDialogOpen(false);
      queryClient.invalidateQueries({'queryKey': ['/api/requests']});

    },
    'onError': () => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء إرسال الطلب',
        'variant': 'destructive'
      });

    }
  });

  // Auto-fill form mutation
  const autoFillMutation = useMutation({
    'mutationFn': async (formId: string): Promise<AutoFillResponse> => {

      const response = await fetch(`/api/government-forms/${formId}/auto-fill`, {
        'method': 'POST',
        'headers': {'Content-Type': 'application/json'},
        'credentials': 'include'
      });
      if (!response.ok) {

        throw new Error('Failed to auto-fill form');

      }
      return response.json() as Promise<AutoFillResponse>;

    },
    'onSuccess': (data: AutoFillResponse) => {

      toast({
        'title': 'تم الملء التلقائي',
        'description': 'تم ملء النموذج تلقائياً بالبيانات المتاحة'
      });
      // Download the filled form
      window.open(data.downloadUrl, '_blank');

    },
    'onError': () => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء الملء التلقائي للنموذج',
        'variant': 'destructive'
      });

    }
  });

  // Filter forms based on search and category
  const filteredForms = (governmentForms as GovernmentForm[]).filter((form: GovernmentForm) => {

    const matchesSearch =
      (form.formNameArabic?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (form.formNameEnglish?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
      (form.formType?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || form.category === selectedCategory;

    return matchesSearch && matchesCategory;

  });

  // Filter requests based on company
  const filteredRequests = (requests as GovernmentFormRequest[]).filter((request: GovernmentFormRequest) => {

    const matchesCompany = selectedCompany === 'all' || request.companyId === selectedCompany;
    return matchesCompany;

  });

  const getStatusBadge = (status: string) => {

    const statusConfig = {
      'submitted': {'label': 'مقدم', 'variant': 'secondary' as const, 'icon': Send},
      'processing': {'label': 'قيد المعالجة', 'variant': 'default' as const, 'icon': Clock},
      'completed': {'label': 'مكتمل', 'variant': 'outline' as const, 'icon': CheckCircle},
      'rejected': {'label': 'مرفوض', 'variant': 'destructive' as const, 'icon': AlertCircle}
    };

    const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.submitted;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );

  };

  const getCategoryIcon = (category: string) => {

    const categoryIcons: Record<string, LucideIcon> = {
      'وثائق شخصية': FileText,
      'شئون العمل': Printer,
      'إجراءات قانونية': FileText,
      'تراخيص تجارية': FileText
    };
    const Icon = categoryIcons[category] ?? FileText;
    return <Icon className="h-4 w-4" />;

  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">النماذج الحكومية</h1>
          <p className="text-muted-foreground">
            إدارة وتعبئة النماذج الحكومية بسهولة مع الملء التلقائي للبيانات
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ChevronRight className="h-4 w-4" />
            العودة للوحة التحكم
          </Button>
        </Link>
      </div>

      {/* Loading and Error States */}
      {(formsLoading || requestsLoading || companiesLoading) && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="جاري تحميل النماذج الحكومية..." />
        </div>
      )}

      {Boolean(formsError ?? requestsError ?? companiesError) && (
        <div className="py-8">
          <ErrorMessage
            error={formsError ?? requestsError ?? companiesError}
            title="خطأ في تحميل النماذج الحكومية"
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Stats Cards */}
      {!formsLoading && !requestsLoading && !companiesLoading && !formsError && !requestsError && !companiesError && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي النماذج</p>
                  <p className="text-2xl font-bold">{Array.isArray(governmentForms) ? governmentForms.length : 0}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">طلبات مقدمة</p>
                  <p className="text-2xl font-bold">{
  filteredRequests.filter((r: GovernmentFormRequest) => r.status === 'submitted').length
}</p>
                </div>
                <Send className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد المعالجة</p>
                  <p className="text-2xl font-bold">{
  filteredRequests.filter((r: GovernmentFormRequest) => r.status === 'processing').length
}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مكتملة</p>
                  <p className="text-2xl font-bold">{
  filteredRequests.filter((r: GovernmentFormRequest) => r.status === 'completed').length
}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      {!formsLoading && !requestsLoading && !companiesLoading && !formsError && !requestsError && !companiesError ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full md:w-[500px]">
            <TabsTrigger value="forms" className="gap-2">
              <FileText className="h-4 w-4" />
            النماذج المتاحة
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Send className="h-4 w-4" />
            الطلبات المقدمة
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Download className="h-4 w-4" />
            القوالب
            </TabsTrigger>
          </TabsList>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في النماذج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="فئة النموذج" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="وثائق شخصية">وثائق شخصية</SelectItem>
                  <SelectItem value="شئون العمل">شئون العمل</SelectItem>
                  <SelectItem value="إجراءات قانونية">إجراءات قانونية</SelectItem>
                  <SelectItem value="تراخيص تجارية">تراخيص تجارية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form: GovernmentForm) => (
                <Card key={form.id ?? Math.random()} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(form.category ?? '')}
                        <CardTitle className="text-lg">{form.formType ?? ''}</CardTitle>
                      </div>
                      <Badge variant={form.status === 'متاح' ? 'outline' : 'secondary'}>
                        {form.status ?? ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">الاسم بالعربية</p>
                      <p className="text-sm">{form.formNameArabic ?? ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">الجهة المصدرة</p>
                      <p className="text-sm">{form.issuingAuthority ?? ''}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">الرسوم</p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <p className="font-medium">{form.fees ?? ''}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">مدة الإنجاز</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <p className="font-medium">{form.processingTime ?? ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedForm(form)}
                          >
                            <Info className="h-4 w-4" />
                          التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">{
  form.formNameArabic ?? ''
}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 mt-4">
                            <div>
                              <h3 className="font-semibold mb-2">المستندات المطلوبة</h3>
                              <ul className="list-disc list-inside space-y-1">
                                {(form.requiredDocuments ?? []).map((doc: string,
   index: number) => (
                                  <li key={
  index
} className="text-sm text-muted-foreground">{
  doc
}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">مدة الصلاحية</p>
                                <p className="text-sm mt-1">{form.validityPeriod ?? ''}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">آخر تحديث</p>
                                <p className="text-sm mt-1">{form.lastUpdated ? new Date(form.lastUpdated).toLocaleDateString('ar-SA') : ''}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {

                          setSelectedForm(form);
                          setDialogOpen(true);

                        }}
                      >
                        <Plus className="h-4 w-4" />
                      تقديم طلب
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Company Filter */}
            <div className="flex items-center gap-4 mb-6">
              <Label>الشركة:</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="اختر الشركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الشركات</SelectItem>
                  {(companies as Company[]).map((company) => (
                    <SelectItem key={company.id ?? ''} value={company.id ?? ''}>
                      {company.name ?? ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Requests Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-right p-4 font-medium">رقم الطلب</th>
                      <th className="text-right p-4 font-medium">النموذج</th>
                      <th className="text-right p-4 font-medium">الشركة</th>
                      <th className="text-right p-4 font-medium">تاريخ التقديم</th>
                      <th className="text-right p-4 font-medium">الحالة</th>
                      <th className="text-right p-4 font-medium">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request: GovernmentFormRequest) => (
                      <tr key={request.id ?? Math.random()} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <span className="font-mono text-sm">{request.id ?? ''}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{request.name ?? ''}</p>
                            <p className="text-sm text-muted-foreground">{
  request.requestType ?? ''
}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{request.companyName ?? ''}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{
  request.submissionDate ? new Date(request.submissionDate).toLocaleDateString('ar-SA') : ''
}</p>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(request.status ?? "submitted")}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRequests.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                  لا توجد طلبات مقدمة
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">قوالب النماذج</h3>
              <p className="text-muted-foreground mb-4">
              قم بتحميل قوالب النماذج الحكومية للاطلاع عليها قبل التقديم
              </p>
              <Button>
                <Download className="h-4 w-4 ml-2" />
              تحميل جميع القوالب
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Submit Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تقديم طلب نموذج</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <form onSubmit={(e) => {

              e.preventDefault();
              submitFormMutation.mutate({
                'formId': selectedForm.id,
                'formType': selectedForm.formType,
                'companyId': companyIdInput,
                'employeeId': employeeIdInput || undefined,
                'notes': notesInput || undefined
              });

            }} className="space-y-4">
              <div>
                <Label>النموذج</Label>
                <Input value={selectedForm.formNameArabic ?? ''} disabled />
              </div>
              <div>
                <Label>الشركة</Label>
                <Select value={companyIdInput} onValueChange={setCompanyIdInput} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الشركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {(companies as Company[]).map((company: Company) => (
                      <SelectItem key={company.id ?? ''} value={company.id ?? ''}>
                        {company.name ?? ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>رقم الموظف (اختياري)</Label>
                <Input
                  placeholder="أدخل رقم الموظف إذا كان النموذج خاص بموظف"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                />
              </div>
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  سيتم ملء النموذج تلقائياً بالبيانات المتاحة من النظام
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="button" variant="secondary" onClick={
  () => autoFillMutation.mutate(selectedForm.id ?? '')
}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  ملء تلقائي فقط
                </Button>
                <Button type="submit" disabled={submitFormMutation.isPending}>
                  <Send className="h-4 w-4 ml-2" />
                  {submitFormMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

}
