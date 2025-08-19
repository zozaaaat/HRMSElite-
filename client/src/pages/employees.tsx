import {useState} from 'react';
import {SharedLayout} from '../components/shared-layout';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {useTranslation} from 'react-i18next';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
// Removed unused Tabs imports
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {Avatar, AvatarFallback, AvatarImage} from '../components/ui/avatar';
import {Checkbox} from '../components/ui/checkbox';
import {useToast} from '../hooks/use-toast';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiRequest} from '@/lib/queryClient';
import {LoadingSpinner, ErrorMessage} from '../components/shared';
import {format} from 'date-fns';
import {ar} from 'date-fns/locale';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Archive,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  UserCheck,
  Download,
  ChevronLeft,
  ChevronRight,
  Trash2,
  SortAsc,
  SortDesc,
  Filter as FilterIcon,
  TrendingUp
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  phone: string;
  position: string;
  jobTitle?: string;
  department: string;
  salary: number;
  monthlySalary?: string;
  actualSalary?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'archived';
  address?: string;
  avatar?: string;
  employeeId: string;
  nationalId: string;
  birthDate?: string;
  emergencyContact?: string;
  workSchedule?: string;
  experience?: number;
  education?: string;
  skills?: string[];
}

interface NewEmployee {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  hireDate: string;
  nationalId: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  experience: string;
  education: string;
}

interface EmployeeData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  nationalId: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  employeeId: string;
  status: 'active' | 'inactive' | 'archived';
  experience: number;
  education: string;
}

interface SortConfig {
  key: keyof Employee;
  direction: 'asc' | 'desc';
}

interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export default function EmployeesPage () {

  return (
    <SharedLayout
      userRole="company_manager"
      userName="مدير الشركة"
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <EmployeesContent />
    </SharedLayout>
  );

}

function EmployeesContent () {

  const {toast} = useToast();
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salaryRange, setSalaryRange] = useState({'min': '', 'max': ''});
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({'key': 'name', 'direction': 'asc'});
  const [pagination, setPagination] = useState<PaginationConfig>({
    'currentPage': 1,
    'pageSize': 10,
    'totalItems': 0
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    'name': '',
    'email': '',
    'phone': '',
    'position': '',
    'department': '',
    'salary': '',
    'hireDate': '',
    'nationalId': '',
    'birthDate': '',
    'address': '',
    'emergencyContact': '',
    'experience': '',
    'education': ''
  });

  // جلب الموظفين
  const {'data': employees = [], isLoading, error} = useQuery<Employee[]>({
    'queryKey': ['/api/employees']
  });

  // إضافة موظف جديد
  const addEmployeeMutation = useMutation({
    'mutationFn': (employeeData: EmployeeData) =>
      apiRequest('/api/employees', 'POST', employeeData),
    'onSuccess': () => {

      toast({
        'title': t('messages.saveSuccess'),
        'description': t('employees.addEmployee')
      });
      setIsAddEmployeeOpen(false);
      queryClient.invalidateQueries({'queryKey': ['/api/employees']});
      setNewEmployee({
        'name': '', 'email': '', 'phone': '', 'position': '', 'department': '',
        'salary': '', 'hireDate': '', 'nationalId': '', 'birthDate': '', 'address': '',
        'emergencyContact': '', 'experience': '', 'education': ''
      });

    }
  });

  // أرشفة موظف
  const archiveEmployeeMutation = useMutation({
    'mutationFn': (employeeId: string) =>
      apiRequest(`/api/employees/${employeeId}/archive`, 'PATCH'),
    'onSuccess': () => {

      toast({
        'title': 'تم أرشفة الموظف',
        'description': 'تم نقل الموظف إلى الأرشيف'
      });
      queryClient.invalidateQueries({'queryKey': ['/api/employees']});

    }
  });

  // حذف متعدد
  const bulkDeleteMutation = useMutation({
    'mutationFn': (employeeIds: string[]) =>
      apiRequest('/api/employees/bulk-delete', 'DELETE', {'ids': employeeIds}),
    'onSuccess': () => {

      toast({
        'title': 'تم حذف الموظفين',
        'description': `تم حذف ${selectedEmployees.length} موظف بنجاح`
      });
      setSelectedEmployees([]);
      queryClient.invalidateQueries({'queryKey': ['/api/employees']});

    }
  });

  const getStatusBadge = (status: string) => {

    const statusMap = {
      'active': {'label': 'نشط', 'variant': 'default' as const, 'color': 'text-green-600'},
      'inactive': {'label': 'غير نشط', 'variant': 'secondary' as const, 'color': 'text-orange-600'},
      'archived': {'label': 'مؤرشف', 'variant': 'outline' as const, 'color': 'text-gray-600'}
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;

  };

  const formatCurrency = (amount: number) => {

    return new Intl.NumberFormat('ar-KW', {
      'style': 'currency',
      'currency': 'KWD',
      'minimumFractionDigits': 0
    }).format(amount);

  };

  const handleAddEmployee = () => {

    if (!newEmployee?.name || !newEmployee?.email || !newEmployee?.phone || !newEmployee?.position) {

      toast({
        'title': 'خطأ في البيانات',
        'description': 'يرجى تعبئة جميع الحقول المطلوبة',
        'variant': 'destructive'
      });
      return;

    }

    const employeeData: EmployeeData = {
      ...newEmployee,
      'salary': parseFloat(newEmployee.salary),
      'employeeId': `EMP${String(employees.length + 1).padStart(3, '0')}`,
      'status': 'active',
      'experience': parseInt(newEmployee.experience) || 0,
      'education': newEmployee.education
    };

    addEmployeeMutation.mutate(employeeData);

  };

  const handleViewDetails = (employee: Employee) => {

    setSelectedEmployee(employee);
    setIsDetailsOpen(true);

  };

  const handleSort = (key: keyof Employee) => {

    setSortConfig(prev => ({
      key,
      'direction': prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));

  };

  const handleBulkSelect = (employeeId: string) => {

    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );

  };

  const handleSelectAll = () => {

    if (selectedEmployees.length === filteredEmployees.length) {

      setSelectedEmployees([]);

    } else {

      setSelectedEmployees(filteredEmployees.map(emp => emp.id));

    }

  };

  const handleBulkDelete = () => {

    if (selectedEmployees.length === 0) {

      toast({
        'title': 'لا يوجد موظفين محددين',
        'description': 'يرجى تحديد الموظفين المراد حذفهم',
        'variant': 'destructive'
      });
      return;

    }
    bulkDeleteMutation.mutate(selectedEmployees);

  };

  const exportEmployees = () => {

    const csvContent = [
      ['الاسم',
   'البريد الإلكتروني',
   'الهاتف',
   'المنصب',
   'القسم',
   'الراتب',
   'تاريخ التوظيف',
   'الحالة'],
  
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.phone,
        emp.position,
        emp.department,
        emp.salary.toString(),
        emp.hireDate,
        emp.status
      ])
    ].map(row => row.join(',')).join('\n');

    if (typeof window !== 'undefined') {
      const blob = new window.Blob([csvContent], {'type': 'text/csv;charset=utf-8;'});
      const link = window.document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    }

  };

  const departments = ['الموارد البشرية',
   'المحاسبة',
   'التسويق',
   'تقنية المعلومات',
   'العمليات',
   'المبيعات'];
  const experienceLevels = ['جميع المستويات',
   'أقل من سنة',
   '1-3 سنوات',
   '3-5 سنوات',
   'أكثر من 5 سنوات'];

  // بيانات تجريبية للموظفين
  const mockEmployees: Employee[] = [
    {
      'id': '1',
      'name': 'أحمد محمد علي',
      'email': 'ahmed@company.com',
      'phone': '+965 9999 1234',
      'position': 'مدير الموارد البشرية',
      'department': 'الموارد البشرية',
      'salary': 1500,
      'hireDate': '2023-01-15',
      'status': 'active',
      'employeeId': 'EMP001',
      'nationalId': '123456789',
      'address': 'الكويت، حولي',
      'emergencyContact': '+965 9999 5678',
      'workSchedule': 'دوام كامل',
      'experience': 5,
      'education': 'بكالوريوس إدارة أعمال',
      'skills': ['إدارة الموارد البشرية', 'التوظيف', 'التدريب']
    },
    {
      'id': '2',
      'name': 'فاطمة أحمد سالم',
      'email': 'fatima@company.com',
      'phone': '+965 9999 2345',
      'position': 'محاسبة أولى',
      'department': 'المحاسبة',
      'salary': 1200,
      'hireDate': '2023-03-10',
      'status': 'active',
      'employeeId': 'EMP002',
      'nationalId': '234567890',
      'address': 'الكويت، الجهراء',
      'emergencyContact': '+965 9999 6789',
      'experience': 3,
      'education': 'بكالوريوس محاسبة',
      'skills': ['المحاسبة المالية', 'الضرائب', 'المراجعة']
    },
    {
      'id': '3',
      'name': 'محمد عبدالله الحربي',
      'email': 'mohammed@company.com',
      'phone': '+965 9999 3456',
      'position': 'مطور برمجيات',
      'department': 'تقنية المعلومات',
      'salary': 1800,
      'hireDate': '2022-09-01',
      'status': 'active',
      'employeeId': 'EMP003',
      'nationalId': '345678901',
      'address': 'الكويت، الفروانية',
      'experience': 4,
      'education': 'بكالوريوس علوم حاسوب',
      'skills': ['React', 'Node.js', 'TypeScript']
    },
    {
      'id': '4',
      'name': 'سارة عبدالرحمن القحطاني',
      'email': 'sara@company.com',
      'phone': '+965 9999 4567',
      'position': 'أخصائية تسويق',
      'department': 'التسويق',
      'salary': 1000,
      'hireDate': '2023-06-20',
      'status': 'active',
      'employeeId': 'EMP004',
      'nationalId': '456789012',
      'address': 'الكويت، الأحمدي',
      'experience': 2,
      'education': 'بكالوريوس تسويق',
      'skills': ['التسويق الرقمي', 'وسائل التواصل الاجتماعي', 'تحليل البيانات']
    },
    {
      'id': '5',
      'name': 'خالد سعد المطيري',
      'email': 'khalid@company.com',
      'phone': '+965 9999 5678',
      'position': 'منسق مبيعات',
      'department': 'المبيعات',
      'salary': 900,
      'hireDate': '2023-08-15',
      'status': 'inactive',
      'employeeId': 'EMP005',
      'nationalId': '567890123',
      'address': 'الكويت، مبارك الكبير',
      'experience': 1,
      'education': 'دبلوم إدارة أعمال',
      'skills': ['المبيعات', 'خدمة العملاء', 'إدارة العلاقات']
    }
  ];

  const allEmployees = [...employees, ...mockEmployees];

  // تصفية وترتيب الموظفين
  const filteredEmployees = allEmployees
    .filter(employee => {

      const matchesSearch = employee?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee?.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || employee?.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || employee?.status === statusFilter;
      const minSalary = salaryRange.min ? parseFloat(salaryRange.min) : undefined;
      const maxSalary = salaryRange.max ? parseFloat(salaryRange.max) : undefined;
      const matchesSalary = (minSalary === undefined || (employee?.salary ?? 0) >= minSalary) &&
                            (maxSalary === undefined || (employee?.salary ?? 0) <= maxSalary);
      const matchesExperience = experienceFilter === 'all' ||
        (experienceFilter === 'أقل من سنة' && (employee?.experience ?? 0) < 1) ||
        (experienceFilter === '1-3 سنوات' && (employee?.experience ?? 0) >= 1 && (employee?.experience ?? 0) <= 3) ||
        (experienceFilter === '3-5 سنوات' && (employee?.experience ?? 0) > 3 && (employee?.experience ?? 0) <= 5) ||
        (experienceFilter === 'أكثر من 5 سنوات' && (employee?.experience ?? 0) > 5);

      return matchesSearch && matchesDepartment && matchesStatus && matchesSalary && matchesExperience;

    })
    .sort((a, b) => {

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {

        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue, 'ar')
          : bValue.localeCompare(aValue, 'ar');

      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {

        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;

      }

      return 0;

    });

  // حساب الإحصائيات
  const stats = {
    'total': allEmployees.length,
    'active': allEmployees.filter(e => e?.status === 'active').length,
    'inactive': allEmployees.filter(e => e?.status === 'inactive').length,
    'archived': allEmployees.filter(e => e?.status === 'archived').length,
    'avgSalary': allEmployees.reduce((sum,
   emp) => sum + (emp?.salary ?? 0),
   0) / allEmployees.length,
  
    'avgExperience': allEmployees.reduce((sum,
   emp) => sum + (emp?.experience ?? 0),
   0) / allEmployees.length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة شاملة لجميع بيانات الموظفين والملفات الشخصية
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={exportEmployees}>
            <Download className="h-4 w-4" />
            تصدير
          </Button>

          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة موظف جديد</DialogTitle>
                <DialogDescription>
                  قم بتعبئة بيانات الموظف الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, 'name': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, 'email': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, 'phone': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">الرقم المدني *</Label>
                  <Input
                    id="nationalId"
                    value={newEmployee.nationalId}
                    onChange={(e) => setNewEmployee({...newEmployee, 'nationalId': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">المنصب *</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({...newEmployee, 'position': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">القسم *</Label>
                  <Select
                    value={newEmployee.department}
                    onValueChange={(value) => setNewEmployee({...newEmployee, 'department': value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({...newEmployee, 'salary': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hireDate">تاريخ التوظيف *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({...newEmployee, 'hireDate': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newEmployee.birthDate}
                    onChange={(e) => setNewEmployee({...newEmployee, 'birthDate': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">سنوات الخبرة</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={newEmployee.experience}
                    onChange={(e) => setNewEmployee({...newEmployee, 'experience': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">المؤهل العلمي</Label>
                  <Input
                    id="education"
                    value={newEmployee.education}
                    onChange={(e) => setNewEmployee({...newEmployee, 'education': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">جهة اتصال طوارئ</Label>
                  <Input
                    id="emergencyContact"
                    value={newEmployee.emergencyContact}
                    onChange={
  (e) => setNewEmployee({
  ...newEmployee, 'emergencyContact': e.target.value
})
}
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({...newEmployee, 'address': e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddEmployee}
                  disabled={addEmployeeMutation.isPending}
                >
                  {addEmployeeMutation.isPending ? 'جاري الإضافة...' : 'إضافة الموظف'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              الموظفون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              متوسط الراتب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Math.round(stats.avgSalary))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              متوسط الخبرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.avgExperience)} سنوات
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الموظفين (اسم، رقم موظف، بريد إلكتروني)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="gap-2"
                >
                  <FilterIcon className="h-4 w-4" />
                  فلاتر متقدمة
                </Button>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* الفلاتر المتقدمة */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>نطاق الراتب</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="من"
                      type="number"
                      value={salaryRange.min}
                      onChange={(e) => setSalaryRange({...salaryRange, 'min': e.target.value})}
                    />
                    <Input
                      placeholder="إلى"
                      type="number"
                      value={salaryRange.max}
                      onChange={(e) => setSalaryRange({...salaryRange, 'max': e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>مستوى الخبرة</Label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* شريط الأدوات */}
          {selectedEmployees.length > 0 && (
            <div className="flex items-center justify-between p-4 mb-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedEmployees.length} موظف محدد
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف محدد
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEmployees([])}
              >
                إلغاء التحديد
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="جاري تحميل الموظفين..." />
            </div>
          )}

          {error && (
            <div className="py-8">
              <ErrorMessage
                error={error}
                title="خطأ في تحميل الموظفين"
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {!isLoading && !error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEmployees.length === filteredEmployees.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium"
                      >
                        الموظف
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('employeeId')}
                        className="h-auto p-0 font-medium"
                      >
                        رقم الموظف
                        {sortConfig.key === 'employeeId' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('position')}
                        className="h-auto p-0 font-medium"
                      >
                        المنصب
                        {sortConfig.key === 'position' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('department')}
                        className="h-auto p-0 font-medium"
                      >
                        القسم
                        {sortConfig.key === 'department' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('salary')}
                        className="h-auto p-0 font-medium"
                      >
                        الراتب
                        {sortConfig.key === 'salary' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('hireDate')}
                        className="h-auto p-0 font-medium"
                      >
                        تاريخ التوظيف
                        {sortConfig.key === 'hireDate' && (
                          sortConfig.direction === 'asc'
                            ? <SortAsc className="h-4 w-4 mr-1" />
                            : <SortDesc className="h-4 w-4 mr-1" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee?.id ?? 'unknown'}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.includes(employee.id)}
                          onCheckedChange={() => handleBulkSelect(employee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback>
                              {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{employee.employeeId}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(employee.salary)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(employee.hireDate), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(employee)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveEmployeeMutation.mutate(employee.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* ترقيم الصفحات */}
              {filteredEmployees.length > pagination.pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    عرض {filteredEmployees.length} من {filteredEmployees.length} موظف
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage === 1}
                      onClick={
  () => setPagination(prev => ({
  ...prev, 'currentPage': prev.currentPage - 1
}))
}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      صفحة {
  pagination.currentPage
} من {
  Math.ceil(filteredEmployees.length / pagination.pageSize)
}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
  pagination.currentPage >= Math.ceil(filteredEmployees.length / pagination.pageSize)
}
                      onClick={
  () => setPagination(prev => ({
  ...prev, 'currentPage': prev.currentPage + 1
}))
}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الموظف */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الموظف</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">رقم الموظف</Label>
                  <p className="font-mono">{selectedEmployee.employeeId}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">الرقم المدني</Label>
                  <p className="font-mono">{selectedEmployee.nationalId}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">رقم الهاتف</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">القسم</Label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.department}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">الراتب</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono">{formatCurrency(selectedEmployee.salary)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">تاريخ التوظيف</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{
  format(new Date(selectedEmployee.hireDate), 'dd MMMM yyyy', {
  'locale': ar
})
}</p>
                  </div>
                </div>

                {selectedEmployee.experience && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">سنوات الخبرة</Label>
                    <p>{selectedEmployee.experience} سنوات</p>
                  </div>
                )}

                {selectedEmployee.education && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المؤهل العلمي</Label>
                    <p>{selectedEmployee.education}</p>
                  </div>
                )}

                {selectedEmployee.emergencyContact && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">جهة اتصال طوارئ</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedEmployee.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEmployee.address && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العنوان</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.address}</p>
                  </div>
                </div>
              )}

              {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">المهارات</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

}
