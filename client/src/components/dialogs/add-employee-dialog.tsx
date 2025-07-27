import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const employeeSchema = z.object({
  name: z.string().min(2, "اسم الموظف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف مطلوب"),
  nationalId: z.string().min(10, "رقم الهوية مطلوب"),
  position: z.string().min(2, "المنصب مطلوب"),
  actualTitle: z.string().min(2, "المسمى الوظيفي الفعلي مطلوب"),
  department: z.string().min(2, "القسم مطلوب"),
  employmentType: z.enum(["دوام كامل", "دوام جزئي", "تعاقد", "تدريب"]),
  contractType: z.enum(["دائم", "مؤقت", "تجربة", "موسمي"]),
  basicSalary: z.number().min(0, "الراتب الأساسي يجب أن يكون أكبر من صفر"),
  allowances: z.number().min(0).optional(),
  workLocation: z.string().min(2, "مكان العمل مطلوب"),
  directManager: z.string().optional()
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}

export function AddEmployeeDialog({ open, onOpenChange, companyId }: AddEmployeeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nationalId: "",
      position: "",
      actualTitle: "",
      department: "",
      employmentType: "دوام كامل",
      contractType: "دائم",
      basicSalary: 0,
      allowances: 0,
      workLocation: "",
      directManager: ""
    }
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      return apiRequest(`/api/companies/${companyId}/employees`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          companyId,
          joinDate: new Date().toISOString()
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الموظف بنجاح",
        description: "تم إنشاء ملف الموظف وإضافته إلى النظام",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/employees`] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "فشل في إضافة الموظف",
        description: "حدث خطأ أثناء إضافة الموظف",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: EmployeeFormData) => {
    createEmployeeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة موظف جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات الموظف الجديد لإضافته إلى النظام
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* المعلومات الشخصية */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">المعلومات الشخصية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="محمد أحمد السعيد"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalId">رقم الهوية *</Label>
                <Input
                  id="nationalId"
                  {...form.register("nationalId")}
                  placeholder="1234567890"
                />
                {form.formState.errors.nationalId && (
                  <p className="text-sm text-red-500">{form.formState.errors.nationalId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="mohammed@company.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+966 50 123 4567"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* المعلومات الوظيفية */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">المعلومات الوظيفية</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">المنصب (في الأوراق) *</Label>
                <Input
                  id="position"
                  {...form.register("position")}
                  placeholder="مطور برمجيات"
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-500">{form.formState.errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualTitle">المسمى الوظيفي الفعلي *</Label>
                <Input
                  id="actualTitle"
                  {...form.register("actualTitle")}
                  placeholder="مطور Full Stack"
                />
                {form.formState.errors.actualTitle && (
                  <p className="text-sm text-red-500">{form.formState.errors.actualTitle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">القسم *</Label>
                <Select onValueChange={(value) => form.setValue("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                    <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                    <SelectItem value="المالية">المالية</SelectItem>
                    <SelectItem value="المبيعات والتسويق">المبيعات والتسويق</SelectItem>
                    <SelectItem value="العمليات">العمليات</SelectItem>
                    <SelectItem value="خدمة العملاء">خدمة العملاء</SelectItem>
                    <SelectItem value="الإدارة العامة">الإدارة العامة</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.department && (
                  <p className="text-sm text-red-500">{form.formState.errors.department.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="directManager">المشرف المباشر</Label>
                <Input
                  id="directManager"
                  {...form.register("directManager")}
                  placeholder="أحمد محمد الخالد"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">نوع التوظيف *</Label>
                <Select onValueChange={(value) => form.setValue("employmentType", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع التوظيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دوام كامل">دوام كامل</SelectItem>
                    <SelectItem value="دوام جزئي">دوام جزئي</SelectItem>
                    <SelectItem value="تعاقد">تعاقد</SelectItem>
                    <SelectItem value="تدريب">تدريب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractType">نوع العقد *</Label>
                <Select onValueChange={(value) => form.setValue("contractType", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع العقد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دائم">دائم</SelectItem>
                    <SelectItem value="مؤقت">مؤقت</SelectItem>
                    <SelectItem value="تجربة">فترة تجربة</SelectItem>
                    <SelectItem value="موسمي">موسمي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* المعلومات المالية */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">المعلومات المالية</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basicSalary">الراتب الأساسي (ريال) *</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  {...form.register("basicSalary", { valueAsNumber: true })}
                  placeholder="8000"
                />
                {form.formState.errors.basicSalary && (
                  <p className="text-sm text-red-500">{form.formState.errors.basicSalary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowances">البدلات (ريال)</Label>
                <Input
                  id="allowances"
                  type="number"
                  {...form.register("allowances", { valueAsNumber: true })}
                  placeholder="1500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workLocation">مكان العمل *</Label>
                <Input
                  id="workLocation"
                  {...form.register("workLocation")}
                  placeholder="الرياض - المكتب الرئيسي"
                />
                {form.formState.errors.workLocation && (
                  <p className="text-sm text-red-500">{form.formState.errors.workLocation.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={createEmployeeMutation.isPending}
            >
              {createEmployeeMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}