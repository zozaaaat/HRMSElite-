import {useState} from 'react';
import {SharedLayout} from '../components/shared-layout';
import {EmployeeForm} from '../components/employee-form';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
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
import {EmployeeService, Employee} from '../services/employee';
import {LoadingSpinner, ErrorMessage} from '../components/shared';
import {format} from 'date-fns';
import {ar} from 'date-fns/locale';
import {
  Users,
  Plus,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  DollarSign,
  Clock,
  UserCheck,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {Label} from '../components/ui/label';
import logger from '../lib/logger';
import { t } from "i18next";

interface SortConfig {
  key: keyof Employee;
  direction: 'asc' | 'desc';
}

export default function EmployeeManagementPage () {

  return (
    <SharedLayout>
      <EmployeeManagementContent />
    </SharedLayout>
  );

}

function EmployeeManagementContent () {

  const {toast} = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salaryRange, setSalaryRange] = useState({'min': '', 'max': ''});
  const [sortConfig, _setSortConfig] = useState<SortConfig>({
  'key': 'firstName', 'direction': 'asc'
});
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Fetch employees using React Query
  const {
    'data': employees = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    'queryKey': ['employees'],
    'queryFn': () => EmployeeService.getAllEmployees(),
    'staleTime': 5 * 60 * 1000 // 5 minutes
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    'mutationFn': (id: string) => EmployeeService.deleteEmployee(id),
    'onSuccess': () => {

      toast({
        'title': 'تم بنجاح',
        'description': 'تم حذف الموظف بنجاح',
        'variant': 'default'
      });
      queryClient.invalidateQueries({'queryKey': ['employees']});

    },
    'onError': (error) => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء حذف الموظف',
        'variant': 'destructive'
      });
      logger.error('Error deleting employee:', error);

    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    'mutationFn': (ids: string[]) => Promise.all(ids.map(id => EmployeeService.deleteEmployee(id))),
    'onSuccess': () => {

      toast({
        'title': 'تم بنجاح',
        'description': `تم حذف ${selectedEmployees.length} موظف بنجاح`,
        'variant': 'default'
      });
      setSelectedEmployees([]);
      queryClient.invalidateQueries({'queryKey': ['employees']});

    },
    'onError': (error) => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء حذف الموظفين',
        'variant': 'destructive'
      });
      logger.error('Error bulk deleting employees:', error);

    }
  });

  const getStatusBadge = (status: string) => {

    switch (status) {

    case 'active':
      return <Badge variant="default">{t('auto.employee-management.1')}</Badge>;
    case 'inactive':
      return <Badge variant="secondary">{t('auto.employee-management.2')}</Badge>;
    case 'terminated':
      return <Badge variant="destructive">{t('auto.employee-management.3')}</Badge>;
    default:
      return <Badge variant="outline">{t('auto.employee-management.4')}</Badge>;

    }

  };

  const formatCurrency = (amount: number) => {

    return new Intl.NumberFormat('ar-KW', {
      'style': 'currency',
      'currency': 'KWD'
    }).format(amount);

  };

  // Removed unused handleAddEmployee

  const handleEditEmployee = (employee: Employee) => {

    setEditingEmployee(employee);

  };

  const handleViewDetails = (employee: Employee) => {

    setViewingEmployee(employee);

  };

  const handleDeleteEmployee = (id: string) => {

    if (typeof window !== 'undefined' && window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {

      deleteEmployeeMutation.mutate(id);

    }

  };

  // Removed unused handleSort

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

      return;

    }

    if (typeof window !== 'undefined' && window.confirm(`هل أنت متأكد من حذف ${selectedEmployees.length} موظف؟`)) {

      bulkDeleteMutation.mutate(selectedEmployees);

    }

  };

  const exportEmployees = () => {

    if (typeof window === 'undefined') {
      return;
    }

    const csvContent = [
      ['الاسم الأول',
   'الاسم الأخير',
   'البريد الإلكتروني',
   'الهاتف',
   'المنصب',
   'القسم',
   'الراتب',
   'تاريخ التوظيف',
   'الحالة'],
  
      ...filteredEmployees.map(emp => [
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.phone,
        emp.position,
        emp.department,
        emp.salary.toString(),
        emp.hireDate,
        emp.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new window.Blob([csvContent], {'type': 'text/csv;charset=utf-8;'});
    const link = window.document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

  };

  const departments = ['الموارد البشرية',
   'المحاسبة',
   'التسويق',
   'تقنية المعلومات',
   'العمليات',
   'المبيعات'];

  // Filter and sort employees
  const filteredEmployees = employees
    .filter(employee => {

      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.phone.includes(searchQuery);
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      const minOk = salaryRange.min === '' || employee.salary >= Number(salaryRange.min);
      const maxOk = salaryRange.max === '' || employee.salary <= Number(salaryRange.max);
      const matchesSalary = minOk && maxOk;

      return matchesSearch && matchesDepartment && matchesStatus && matchesSalary;

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

  // Calculate statistics
  const stats = {
    'total': employees.length,
    'active': employees.filter(e => e.status === 'active').length,
    'inactive': employees.filter(e => e.status === 'inactive').length,
    'terminated': employees.filter(e => e.status === 'terminated').length,
    'avgSalary': employees.length > 0
      ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length
      : 0
  };

  if (isLoading) {

    return <LoadingSpinner />;

  }
  if (error) {

    return <ErrorMessage error={t('auto.employee-management.40')} />;

  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('auto.employee-management.5')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('auto.employee-management.6')}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={exportEmployees}>
            <Download className="h-4 w-4" />
            {t('auto.employee-management.7')}</Button>

          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            {t('auto.employee-management.8')}</Button>

          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('auto.employee-management.9')}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <EmployeeForm
                mode="create"
                onSuccess={() => setIsAddEmployeeOpen(false)}
                onCancel={() => setIsAddEmployeeOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auto.employee-management.10')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auto.employee-management.11')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auto.employee-management.12')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgSalary)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('auto.employee-management.13')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{
  stats.inactive + stats.terminated
}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('auto.employee-management.14')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('auto.employee-management.15')}</Label>
              <Input
                placeholder={t('auto.employee-management.41')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('auto.employee-management.16')}</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('auto.employee-management.42')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auto.employee-management.17')}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('auto.employee-management.18')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('auto.employee-management.43')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('auto.employee-management.19')}</SelectItem>
                  <SelectItem value="active">{t('auto.employee-management.20')}</SelectItem>
                  <SelectItem value="inactive">{t('auto.employee-management.21')}</SelectItem>
                  <SelectItem value="terminated">{t('auto.employee-management.22')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('auto.employee-management.23')}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder={t('auto.employee-management.44')}
                  type="number"
                  value={salaryRange.min}
                  onChange={(e) => setSalaryRange(prev => ({...prev, 'min': e.target.value}))}
                />
                <Input
                  placeholder={t('auto.employee-management.45')}
                  type="number"
                  value={salaryRange.max}
                  onChange={(e) => setSalaryRange(prev => ({...prev, 'max': e.target.value}))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('auto.employee-management.24')}{filteredEmployees.length})</CardTitle>
            {selectedEmployees.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 ml-2" />
                {t('auto.employee-management.25')}{selectedEmployees.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
  selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0
}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t('auto.employee-management.26')}</TableHead>
                  <TableHead>{t('auto.employee-management.27')}</TableHead>
                  <TableHead>{t('auto.employee-management.28')}</TableHead>
                  <TableHead>{t('auto.employee-management.29')}</TableHead>
                  <TableHead>{t('auto.employee-management.30')}</TableHead>
                  <TableHead>{t('auto.employee-management.31')}</TableHead>
                  <TableHead className="text-right">{t('auto.employee-management.32')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => handleBulkSelect(employee.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={employee.avatar ?? ''} />
                          <AvatarFallback>
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.employeeId ?? employee.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{employee.position}</div>
                        <div className="text-sm text-muted-foreground">{employee.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(employee.salary)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(employee.hireDate), 'dd/MM/yyyy', {'locale': ar})}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(employee.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(employee)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      {editingEmployee && (
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <EmployeeForm
              employee={editingEmployee}
              mode="update"
              onSuccess={() => setEditingEmployee(null)}
              onCancel={() => setEditingEmployee(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Employee Details Dialog */}
      {viewingEmployee && (
        <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('auto.employee-management.33')}</DialogTitle>
              <DialogDescription>
                {t('auto.employee-management.34')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={viewingEmployee.avatar ?? ''} />
                  <AvatarFallback className="text-lg">
                    {viewingEmployee.firstName.charAt(0)}{viewingEmployee.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {viewingEmployee.firstName} {viewingEmployee.lastName}
                  </h3>
                  <p className="text-muted-foreground">{viewingEmployee.position}</p>
                  <p className="text-sm text-muted-foreground">{viewingEmployee.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t('auto.employee-management.35')}</Label>
                  <p className="text-sm">{viewingEmployee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('auto.employee-management.36')}</Label>
                  <p className="text-sm">{viewingEmployee.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('auto.employee-management.37')}</Label>
                  <p className="text-sm">{formatCurrency(viewingEmployee.salary)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('auto.employee-management.38')}</Label>
                  <p className="text-sm">
                    {format(new Date(viewingEmployee.hireDate), 'dd/MM/yyyy', {'locale': ar})}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">{t('auto.employee-management.39')}</Label>
                  <div className="mt-1">{getStatusBadge(viewingEmployee.status)}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );

}
