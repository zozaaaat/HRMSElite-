import {useState} from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import {useLocation} from 'wouter';
import {apiRequest, queryClient} from '@/lib/queryClient';
import {LoadingSpinner, ErrorMessage} from '../components/shared';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Badge} from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage
} from '../components/ui/form';
import {Textarea} from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {Separator} from '../components/ui/separator';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Plus,
  Search,
  Edit,
  Settings,
  Eye,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

// Strongly-typed company item matching UI usage
interface CompanyItem {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  size?: string;
  status: 'active' | 'suspended' | 'pending' | string;
  totalEmployees?: number;
  activeLicenses?: number;
  createdAt?: string;
}

const companySchema = z.object({
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

type CompanyFormData = z.infer<typeof companySchema>;

export default function Companies () {

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [, setLocation] = useLocation();

  const form = useForm<CompanyFormData>({
    'resolver': zodResolver(companySchema),
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

  const {'data': companies = [] as CompanyItem[], isLoading, error} = useQuery<CompanyItem[]>({
    'queryKey': ['/api/companies']
  });

  const addCompanyMutation = useMutation({
    'mutationFn': async (data: CompanyFormData) => {

      // Use the apiRequest from queryClient with correct parameter order
      return await apiRequest('POST', '/api/companies', data);

    },
    'onSuccess': () => {

      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({'queryKey': ['/api/companies']});

    }
  });

  const filteredCompanies = companies.filter((company) => {

    const matchesSearch = company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return Boolean(matchesSearch) && matchesStatus;

  });

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

  const onSubmit = (data: CompanyFormData) => {

    if (editingCompany) {
      // Update company logic
    } else {

      addCompanyMutation.mutate(data);

    }

  };

  const statsData = {
    'total': companies.length,
    'active': companies.filter((c) => c.status === 'active').length,
    'pending': companies.filter((c) => c.status === 'pending').length,
    'suspended': companies.filter((c) => c.status === 'suspended').length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الشركات</h1>
          <p className="text-muted-foreground mt-2">إدارة شاملة لجميع الشركات المسجلة في النظام</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة شركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? 'تعديل الشركة' : 'إضافة شركة جديدة'}
              </DialogTitle>
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
                        <Textarea placeholder="وصف مختصر عن نشاط الشركة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="+966 50 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input placeholder="info@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>العنوان</FormLabel>
                      <FormControl>
                        <Input placeholder="العنوان الكامل للشركة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>الموقع الإلكتروني (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <SelectItem value="startup">ناشئة (1-10 موظفين)</SelectItem>
                            <SelectItem value="small">صغيرة (11-50 موظف)</SelectItem>
                            <SelectItem value="medium">متوسطة (51-200 موظف)</SelectItem>
                            <SelectItem value="large">كبيرة (201-1000 موظف)</SelectItem>
                            <SelectItem value="enterprise">مؤسسية (+1000 موظف)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={addCompanyMutation.isPending}>
                    {addCompanyMutation.isPending ? 'جاري الحفظ...' : 'حفظ الشركة'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">إجمالي الشركات</p>
                <p className="text-3xl font-bold text-blue-700">{statsData.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">الشركات النشطة</p>
                <p className="text-3xl font-bold text-green-700">{statsData.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">قيد المراجعة</p>
                <p className="text-3xl font-bold text-yellow-700">{statsData.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">معلقة</p>
                <p className="text-3xl font-bold text-red-700">{statsData.suspended}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الشركات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'pending' | 'suspended')}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="suspended">معلقة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="جاري تحميل الشركات..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorMessage
            error={error}
            title="خطأ في تحميل الشركات"
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* Companies Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge className={`text-xs ${getStatusColor(company.status)}`}>
                        {getStatusText(company.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => {

                      setLocation(`/company-details?id=${company.id}`);

                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {

                      setEditingCompany(company); setIsAddDialogOpen(true);

                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {company.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                )}

                {company.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{company.address}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{company.totalEmployees ?? 0} موظف</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>{company.activeLicenses ?? 0} رخصة</span>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1" onClick={() => {

                    setLocation(`/company-details?id=${company.id}`);

                  }}>
                    <BarChart3 className="h-4 w-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    // TODO: Implement company settings
                  }}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  تاريخ التسجيل: {new Date(company.createdAt ?? Date.now()).toLocaleDateString('ar-SA')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && filteredCompanies.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">لا توجد شركات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ?? statusFilter !== 'all'
                ? 'لا توجد شركات تطابق معايير البحث'
                : 'لم يتم تسجيل أي شركات بعد'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة شركة جديدة
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

}
