import React, {useState} from 'react';
import {
  useEnhancedQuery, useEnhancedMutation, useOptimisticMutation
} from '@/hooks/useReactQuery';
import {apiRequest, invalidateCache} from '@/lib/queryClient';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';

// Example of using enhanced React Query hooks
export default function EmployeesEnhancedExample () {

  const {toast} = useToast();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // ✅ Enhanced Query with better defaults
  const {
    'data': employees = [],
    isLoading,
    error
  } = useEnhancedQuery<Employee[]>(
    ['employees'],
    () => apiRequest('GET', '/api/employees').then(res => res.json() as Promise<Employee[]>)
  );

  // ✅ Enhanced Mutation with better error handling
  const _addEmployeeMutation = useEnhancedMutation(
    (employeeData: EmployeeData) => apiRequest('POST', '/api/employees', employeeData),
    {
      'onSuccess': () => {

        toast({
          'title': 'تم إضافة الموظف',
          'description': 'تم إضافة الموظف الجديد بنجاح'
        });
        // Use centralized cache invalidation
        invalidateCache.employees();

      }
    }
  );

  // ✅ Optimistic Mutation for better UX
  const archiveEmployeeMutation = useOptimisticMutation(
    (employeeId: string) =>
      apiRequest('PATCH', `/api/employees/${employeeId}/archive`).then(
        res => res.json() as Promise<Employee[]>
      ),
    ['employees'],
    (oldEmployees: Employee[] | undefined, employeeId: string) =>
      (oldEmployees ?? []).map((emp: Employee) =>
        emp.id === employeeId ? {...emp, status: 'archived' as const} : emp
      ),
    {
      'onSuccess': () => {

        toast({
          'title': 'تم أرشفة الموظف',
          'description': 'تم نقل الموظف إلى الأرشيف'
        });

      }
    }
  );

  // ✅ Bulk delete with optimistic updates
  const bulkDeleteMutation = useOptimisticMutation(
    (employeeIds: string[]) =>
      apiRequest('DELETE', '/api/employees/bulk-delete', {ids: employeeIds}).then(
        res => res.json() as Promise<Employee[]>
      ),
    ['employees'],
    (oldEmployees: Employee[] | undefined, employeeIds: string[]) =>
      (oldEmployees ?? []).filter((emp: Employee) => !employeeIds.includes(emp.id)),
    {
      'onSuccess': () => {

        toast({
          'title': 'تم حذف الموظفين',
          'description': `تم حذف ${selectedEmployees.length} موظف بنجاح`
        });
        setSelectedEmployees([]);

      }
    }
  );

  // Example of using cache utilities
  const handleRefreshCache = () => {

    // Manually refresh the cache
    invalidateCache.employees();
    toast({
      'title': 'تم تحديث البيانات',
      'description': 'تم تحديث قائمة الموظفين'
    });

  };

  if (isLoading) {

    return <div>جاري التحميل...</div>;

  }

  if (error) {

    return <div>حدث خطأ في تحميل البيانات</div>;

  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
        <Button onClick={handleRefreshCache}>
          تحديث البيانات
        </Button>
      </div>

      <div className="grid gap-4">
        {employees.map((employee: Employee) => (
          <div key={employee.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'نشط' : 'مؤرشف'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => archiveEmployeeMutation.mutate(employee.id)}
                  disabled={archiveEmployeeMutation.isPending}
                >
                  {archiveEmployeeMutation.isPending ? 'جاري...' : 'أرشفة'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEmployees.length > 0 && (
        <div className="fixed bottom-4 right-4">
          <Button
            onClick={() => bulkDeleteMutation.mutate(selectedEmployees)}
            disabled={bulkDeleteMutation.isPending}
            variant="destructive"
          >
            {
  bulkDeleteMutation.isPending ? 'جاري الحذف...' : `حذف ${
  selectedEmployees.length
} موظف`
}
          </Button>
        </div>
      )}
    </div>
  );

}

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'archived';
  employeeId: string;
  nationalId: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
  experience: number;
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
