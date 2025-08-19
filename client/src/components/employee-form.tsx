import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Textarea} from './ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {useToast} from '../hooks/use-toast';
import {
  EmployeeService, Employee, CreateEmployeeData, UpdateEmployeeData
} from '../services/employee';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {Loader2, Save, X, UserPlus, Edit} from 'lucide-react';
import logger from '../lib/logger';


// مخطط التحقق من صحة البيانات
const employeeSchema = z.object({
  'firstName': z.string().min(2, 'الاسم الأول مطلوب و يجب أن يكون على الأقل حرفين'),
  'lastName': z.string().min(2, 'الاسم الأخير مطلوب و يجب أن يكون على الأقل حرفين'),
  'email': z.string().email('البريد الإلكتروني غير صحيح'),
  'phone': z.string().min(8, 'رقم الهاتف مطلوب'),
  'position': z.string().min(2, 'المنصب مطلوب'),
  'department': z.string().min(2, 'القسم مطلوب'),
  'hireDate': z.string().min(1, 'تاريخ التوظيف مطلوب'),
  'salary': z.number().min(0, 'الراتب يجب أن يكون رقم موجب'),
  'nationalId': z.string().min(10, 'رقم الهوية الوطنية مطلوب'),
  'birthDate': z.string().min(1, 'تاريخ الميلاد مطلوب'),
  'address': z.string().min(5, 'العنوان مطلوب'),
  'emergencyContact': z.string().min(8, 'رقم الطوارئ مطلوب'),
  'experience': z.number().min(0, 'الخبرة يجب أن تكون رقم موجب'),
  'education': z.string().min(2, 'المؤهل العلمي مطلوب'),
  'companyId': z.string().min(1, 'الشركة مطلوبة')
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  companyId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode: 'create' | 'update';
}

const departments = [
  'الموارد البشرية',
  'المحاسبة',
  'التسويق',
  'تقنية المعلومات',
  'العمليات',
  'المبيعات',
  'خدمة العملاء',
  'الإنتاج',
  'الصيانة',
  'الأمن'
];

const positions = [
  'مدير',
  'نائب مدير',
  'رئيس قسم',
  'أخصائي أول',
  'أخصائي',
  'مساعد',
  'منسق',
  'مشرف',
  'موظف'
];

export function EmployeeForm ({employee, companyId, onSuccess, onCancel, mode}: EmployeeFormProps) {

  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const isoString = date.toISOString();
      return isoString.split('T')[0] ?? '';
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    'formState': {errors},
    reset,
    setValue,
    watch
  } = useForm<EmployeeFormData>({
    'resolver': zodResolver(employeeSchema),
    'defaultValues': {
      'firstName': employee?.firstName ?? '',
      'lastName': employee?.lastName ?? '',
      'email': employee?.email ?? '',
      'phone': employee?.phone ?? '',
      'position': employee?.position ?? '',
      'department': employee?.department ?? '',
      'hireDate': formatDate(employee?.hireDate),
      'salary': employee?.salary ?? 0,
      'nationalId': employee?.nationalId ?? '',
      'birthDate': formatDate(employee?.birthDate),
  
      'address': employee?.address ?? '',
      'emergencyContact': employee?.emergencyContact ?? '',
      'experience': employee?.experience ?? 0,
      'education': employee?.education ?? '',
      'companyId': companyId ?? employee?.companyId ?? ''
    }
  });

  // طلب إنشاء موظف جديد
  const createEmployeeMutation = useMutation({
    'mutationFn': (data: CreateEmployeeData) => EmployeeService.createEmployee(data),
    'onSuccess': (_newEmployee) => {

      toast({
        'title': 'تم بنجاح',
        'description': 'تم إضافة الموظف الجديد بنجاح',
        'variant': 'default'
      });
      queryClient.invalidateQueries({'queryKey': ['employees']});
      onSuccess?.();
      reset();

    },
    'onError': (error) => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء إضافة الموظف',
        'variant': 'destructive'
      });
      logger.error('Error creating employee:', error);

    }
  });

  // طلب تحديث موظف موجود
  const updateEmployeeMutation = useMutation({
    'mutationFn': (data: UpdateEmployeeData) => EmployeeService.updateEmployee(data),
    'onSuccess': (_updatedEmployee) => {

      toast({
        'title': 'تم بنجاح',
        'description': 'تم تحديث بيانات الموظف بنجاح',
        'variant': 'default'
      });
      queryClient.invalidateQueries({'queryKey': ['employees']});
      queryClient.invalidateQueries({'queryKey': ['employee', employee?.id]});
      onSuccess?.();

    },
    'onError': (error) => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء تحديث بيانات الموظف',
        'variant': 'destructive'
      });
      logger.error('Error updating employee:', error);

    }
  });

  // طلب أرشفة موظف
  const archiveEmployeeMutation = useMutation({
    'mutationFn': (id: string) => EmployeeService.deleteEmployee(id),
    'onSuccess': () => {

      toast({
        'title': 'تم بنجاح',
        'description': 'تم أرشفة الموظف بنجاح',
        'variant': 'default'
      });
      queryClient.invalidateQueries({'queryKey': ['employees']});
      onSuccess?.();

    },
    'onError': (error) => {

      toast({
        'title': 'خطأ',
        'description': 'حدث خطأ أثناء أرشفة الموظف',
        'variant': 'destructive'
      });
      logger.error('Error archiving employee:', error);

    }
  });

  const onSubmit = async (data: EmployeeFormData) => {

    setIsSubmitting(true);
    try {

      if (mode === 'create') {

        await createEmployeeMutation.mutateAsync({
          ...data,
          'companyId': data.companyId
        });

      } else if (mode === 'update' && employee) {

        await updateEmployeeMutation.mutateAsync({
          'id': employee.id,
          ...data,
          'companyId': data.companyId,
          '__etag': (employee as any).__etag || undefined
        });

      }

    } catch (error: unknown) {

      if (error instanceof Error) {
        logger.error('Form submission error:', error);
      } else {
        logger.error('Form submission error:', new Error(String(error)));
      }

    } finally {

      setIsSubmitting(false);

    }

  };

  const handleArchive = async () => {

    if (employee && mode === 'update') {

      await archiveEmployeeMutation.mutateAsync(employee.id);

    }

  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' ? (
            <>
              <UserPlus className="h-5 w-5" />
              إضافة موظف جديد
            </>
          ) : (
            <>
              <Edit className="h-5 w-5" />
              تحديث بيانات الموظف
            </>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'قم بتعبئة بيانات الموظف الجديد'
            : 'قم بتحديث بيانات الموظف المحدد'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">الاسم الأول *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="أحمد"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">الاسم الأخير *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="محمد"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="ahmed@company.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+965 9999 1234"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* معلومات العمل */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">المنصب *</Label>
              <Select
                value={watch('position')}
                onValueChange={(value) => setValue('position', value)}
              >
                <SelectTrigger className={errors.position ? 'border-red-500' : ''}>
                  <SelectValue placeholder="اختر المنصب" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">القسم *</Label>
              <Select
                value={watch('department')}
                onValueChange={(value) => setValue('department', value)}
              >
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">تاريخ التوظيف *</Label>
              <Input
                id="hireDate"
                type="date"
                {...register('hireDate')}
                className={errors.hireDate ? 'border-red-500' : ''}
              />
              {errors.hireDate && (
                <p className="text-sm text-red-500">{errors.hireDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">الراتب (دينار كويتي) *</Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                {...register('salary', {'valueAsNumber': true})}
                placeholder="1000"
                className={errors.salary ? 'border-red-500' : ''}
              />
              {errors.salary && (
                <p className="text-sm text-red-500">{errors.salary.message}</p>
              )}
            </div>
          </div>

          {/* المعلومات الشخصية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nationalId">رقم الهوية الوطنية *</Label>
              <Input
                id="nationalId"
                {...register('nationalId')}
                placeholder="123456789"
                className={errors.nationalId ? 'border-red-500' : ''}
              />
              {errors.nationalId && (
                <p className="text-sm text-red-500">{errors.nationalId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">تاريخ الميلاد *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register('birthDate')}
                className={errors.birthDate ? 'border-red-500' : ''}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">رقم الطوارئ *</Label>
              <Input
                id="emergencyContact"
                {...register('emergencyContact')}
                placeholder="+965 9999 5678"
                className={errors.emergencyContact ? 'border-red-500' : ''}
              />
              {errors.emergencyContact && (
                <p className="text-sm text-red-500">{errors.emergencyContact.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">سنوات الخبرة *</Label>
              <Input
                id="experience"
                type="number"
                {...register('experience', {'valueAsNumber': true})}
                placeholder="5"
                className={errors.experience ? 'border-red-500' : ''}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience.message}</p>
              )}
            </div>
          </div>

          {/* العنوان والتعليم */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">العنوان *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="الكويت، حولي، شارع..."
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">المؤهل العلمي *</Label>
              <Input
                id="education"
                {...register('education')}
                placeholder="بكالوريوس إدارة أعمال"
                className={errors.education ? 'border-red-500' : ''}
              />
              {errors.education && (
                <p className="text-sm text-red-500">{errors.education.message}</p>
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>

            {mode === 'update' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleArchive}
                disabled={isSubmitting}
              >
                أرشفة
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  {mode === 'create' ? 'إضافة' : 'تحديث'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

}
