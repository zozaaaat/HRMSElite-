import {useState, useEffect} from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import {useLocation} from 'wouter';
import {apiRequest, queryClient} from '@/lib/queryClient';
import {LoadingSpinner, ErrorMessage} from '../components/shared';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Separator} from '../components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '../components/ui/form';
import {Input} from '../components/ui/input';
import {Textarea} from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Globe,
  FileText,
  DollarSign,
  BarChart3,
  Edit,
  Settings,
  Eye,
  Clock,
  Download,
  Upload,
  Plus,
  ArrowLeft,
  
  ExternalLink,
  TrendingUp,
  UserPlus,
  Award,
  PieChart
} from 'lucide-react';

import type { Employee } from '@/lib/types';
import type { Document as CompanyDocument } from '@/types/documents';

const companyUpdateSchema = z.object({
  'name': z.string().min(2, 'اسم الشركة يجب أن يكون أكثر من حرفين'),
  'description': z.string().min(10, 'الوصف يجب أن يكون أكثر من 10 أحرف'),
  'address': z.string().min(5, 'العنوان مطلوب'),
  'phone': z.string().min(10, 'رقم الهاتف غير صحيح'),
  'email': z.string().email('البريد الإلكتروني غير صحيح'),
  'website': z.string().url('رابط الموقع غير صحيح').optional().or(z.literal('')),
  'industry': z.string().min(1, 'نوع الصناعة مطلوب'),
  'size': z.string().min(1, 'حجم الشركة مطلوب'),
  'status': z.enum(['active', 'suspended', 'pending'])
});

type CompanyUpdateData = z.infer<typeof companyUpdateSchema>;

export default function CompanyDetails () {

  const [location, setLocation] = useLocation();
  const companyId = typeof window !== 'undefined'
    ? new window.URLSearchParams(location.split('?')[1] ?? '').get('id')
    : null;
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<CompanyUpdateData>({
    'resolver': zodResolver(companyUpdateSchema),
    'defaultValues': {
      'name': '',
      'description': '',
      'address': '',
      'phone': '',
      'email': '',
      'website': '',
      'industry': '',
      'size': '',
      'status': 'pending'
    }
  });

  // جلب بيانات الشركة
  interface CompanyDetailsModel {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    industry?: string;
    size?: string;
    status?: 'active' | 'suspended' | 'pending' | string;
  }
  const {'data': company, 'isLoading': isLoadingCompany, 'error': companyError} = useQuery<CompanyDetailsModel>({
    'queryKey': ['/api/companies', companyId],
    'enabled': !!companyId
  });

  // جلب موظفي الشركة
  const {'data': employees = [], 'isLoading': isLoadingEmployees} = useQuery<Employee[]>({
    'queryKey': ['/api/employees', companyId],
    'queryFn': async (): Promise<Employee[]> => {

      if (!companyId) {

        return [];

      }
      const res = await apiRequest('GET', `/api/employees?company=${companyId}`);
      return await res.json() as Employee[];

    },
    'enabled': !!companyId
  });

  // جلب مستندات الشركة
  const {'data': documents = [], 'isLoading': isLoadingDocuments} = useQuery<CompanyDocument[]>({
    'queryKey': ['/api/v1/documents', companyId],
    'queryFn': async (): Promise<CompanyDocument[]> => {

      if (!companyId) {

        return [];

      }
      const res = await apiRequest('GET', `/api/v1/documents?company=${companyId}`);
      return await res.json() as CompanyDocument[];

    },
    'enabled': !!companyId
  });

  // تحديث بيانات الشركة
  const updateCompanyMutation = useMutation({
    'mutationFn': async (data: CompanyUpdateData) => {

      return await apiRequest('PUT', `/api/companies/${companyId}`, data);

    },
    'onSuccess': () => {

      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({'queryKey': ['/api/companies', companyId]});

    }
  });

  // تحديث النموذج عند تحميل بيانات الشركة
  useEffect(() => {

    if (company) {
      form.reset({
        'name': company.name ?? '',
        'description': company.description ?? '',
        'address': company.address ?? '',
        'phone': company.phone ?? '',
        'email': company.email ?? '',
        'website': company.website ?? '',
        'industry': company.industry ?? '',
        'size': company.size ?? '',
        'status': (company.status as 'active' | 'suspended' | 'pending') ?? 'pending'
      });
    }

  }, [company, form]);

  const getStatusColor = (status: string) => {

    switch (status) {

    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';

    }

  };

  const getStatusText = (status: string) => {

    switch (status) {

    case 'active': return 'نشطة';
    case 'suspended': return 'معلقة';
    case 'pending': return 'قيد المراجعة';
    default: return 'غير محدد';

    }

  };

  const getIndustryText = (industry: string) => {

    const industryMap: Record<string, string> = {
      'technology': 'تقنية المعلومات',
      'healthcare': 'الرعاية الصحية',
      'finance': 'المالية والمصرفية',
      'manufacturing': 'التصنيع',
      'retail': 'التجارة والبيع',
      'construction': 'البناء والتشييد',
      'education': 'التعليم',
      'other': 'أخرى'
    };
    return industryMap[industry] ?? industry;

  };

  const getSizeText = (size: string) => {

    const sizeMap: Record<string, string> = {
      'small': 'صغيرة (1-50 موظف)',
      'medium': 'متوسطة (51-200 موظف)',
      'large': 'كبيرة (201-1000 موظف)',
      'enterprise': 'مؤسسة (أكثر من 1000 موظف)'
    };
    return sizeMap[size] ?? size;

  };

  const onSubmit = (data: CompanyUpdateData) => {

    updateCompanyMutation.mutate(data);

  };

  if (isLoadingCompany) {

    return <LoadingSpinner />;

  }

  if (companyError) {

    return <ErrorMessage error={companyError} title="حدث خطأ في تحميل بيانات الشركة" />;

  }

  if (!company) {

    return <ErrorMessage error={new Error('الشركة غير موجودة')} title="الشركة غير موجودة" />;

  }

  // Typed via generics

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/companies')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للشركات
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
            <p className="text-muted-foreground mt-2">تفاصيل شاملة للشركة</p>
          </div>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              تعديل الشركة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الشركة</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>اسم الشركة</FormLabel>
                        <FormControl>
                          <Input placeholder="اسم الشركة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>نوع الصناعة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الصناعة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="technology">تقنية المعلومات</SelectItem>
                            <SelectItem value="healthcare">الرعاية الصحية</SelectItem>
                            <SelectItem value="finance">المالية والمصرفية</SelectItem>
                            <SelectItem value="manufacturing">التصنيع</SelectItem>
                            <SelectItem value="retail">التجارة والبيع</SelectItem>
                            <SelectItem value="construction">البناء والتشييد</SelectItem>
                            <SelectItem value="education">التعليم</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>وصف الشركة</FormLabel>
                      <FormControl>
                        <Textarea placeholder="وصف الشركة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input placeholder="عنوان الشركة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="رقم الهاتف" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input placeholder="البريد الإلكتروني" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>الموقع الإلكتروني</FormLabel>
                        <FormControl>
                          <Input placeholder="الموقع الإلكتروني" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="size"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>حجم الشركة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حجم الشركة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">صغيرة (1-50 موظف)</SelectItem>
                            <SelectItem value="medium">متوسطة (51-200 موظف)</SelectItem>
                            <SelectItem value="large">كبيرة (201-1000 موظف)</SelectItem>
                            <SelectItem value="enterprise">مؤسسة (أكثر من 1000 موظف)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>حالة الشركة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر حالة الشركة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">نشطة</SelectItem>
                            <SelectItem value="pending">قيد المراجعة</SelectItem>
                            <SelectItem value="suspended">معلقة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={updateCompanyMutation.isPending}>
                    {updateCompanyMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge className={`${getStatusColor(company.status ?? 'pending')}`}>
          {getStatusText(company.status ?? 'pending')}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  معلومات الشركة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">العنوان:</span>
                    <span>{company.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الهاتف:</span>
                    <span>{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                    <span>{company.email}</span>
                  </div>
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">الموقع:</span>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">الصناعة:</span>
                    <Badge variant="outline">{getIndustryText(company.industry ?? '')}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">الحجم:</span>
                    <Badge variant="outline">{getSizeText(company.size ?? '')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  الإحصائيات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {employees.length}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الموظفين</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {employees.filter(e => e.status === 'active').length}
                    </div>
                    <div className="text-sm text-muted-foreground">الموظفين النشطين</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {documents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">المستندات</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-muted-foreground">التراخيص</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('employees')}
                >
                  <UserPlus className="h-4 w-4" />
                  إضافة موظف جديد
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('documents')}
                >
                  <Upload className="h-4 w-4" />
                  رفع مستند جديد
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab('analytics')}
                >
                  <PieChart className="h-4 w-4" />
                  عرض التقارير
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Company Description */}
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle>وصف الشركة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">الموظفين</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة موظف جديد
            </Button>
          </div>

          {isLoadingEmployees ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          تاريخ التعيين: {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ar-SA') : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge
                        variant={employee.status === 'active' ? 'default' : 'secondary'}
                        className={
  employee.status === 'active' ? 'bg-green-100 text-green-800' : ''
}
                      >
                        {employee.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">المستندات</h2>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              رفع مستند جديد
            </Button>
          </div>

          {isLoadingDocuments ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          تاريخ الرفع: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('ar-SA') : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>تم الرفع بواسطة: {doc.uploadedBy}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Download className="h-3 w-3" />
                        تحميل
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-3 w-3" />
                        عرض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">التحليلات والتقارير</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-muted-foreground">نمو الموظفين</span>
                </div>
                <div className="text-2xl font-bold">+12%</div>
                <div className="text-sm text-muted-foreground">مقارنة بالشهر الماضي</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-muted-foreground">إجمالي الرواتب</span>
                </div>
                <div className="text-2xl font-bold">$125,000</div>
                <div className="text-sm text-muted-foreground">هذا الشهر</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-muted-foreground">متوسط الحضور</span>
                </div>
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">هذا الشهر</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="text-sm text-muted-foreground">رضا الموظفين</span>
                </div>
                <div className="text-2xl font-bold">4.2/5</div>
                <div className="text-sm text-muted-foreground">متوسط التقييم</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

}
