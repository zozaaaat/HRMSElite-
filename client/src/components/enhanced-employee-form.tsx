import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// نموذج التحقق من البيانات
const employeeFormSchema = z.object({
  civilId: z.string().min(12, "الرقم المدني يجب أن يكون 12 رقماً").max(12),
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  nationality: z.string().min(1, "الجنسية مطلوبة"),
  type: z.enum(["citizen", "resident", "temporary"]),
  jobTitle: z.string().min(1, "المسمى الوظيفي مطلوب"),
  actualJobTitle: z.string().optional(),
  hireDate: z.date({ required_error: "تاريخ التوظيف مطلوب" }),
  workPermitStart: z.date().optional(),
  workPermitEnd: z.date().optional(),
  monthlySalary: z.string().min(1, "الراتب الشهري مطلوب"),
  actualSalary: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.date().optional(),
  residenceNumber: z.string().optional(),
  residenceExpiry: z.date().optional(),
  medicalInsurance: z.string().optional(),
  bankAccount: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]).optional(),
  numberOfDependents: z.number().min(0).optional(),
  educationLevel: z.string().optional(),
  previousExperience: z.string().optional(),
  contractType: z.enum(["permanent", "temporary", "project"]).optional(),
  probationPeriod: z.number().min(0).optional(),
  workLocation: z.string().optional(),
  department: z.string().min(1, "القسم مطلوب"),
  notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeFormSchema>;

interface EnhancedEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  editingEmployee?: any;
}

export function EnhancedEmployeeForm({ 
  isOpen, 
  onClose, 
  companyId,
  editingEmployee 
}: EnhancedEmployeeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [languages, setLanguages] = useState<string[]>(editingEmployee?.languages || []);
  const [skills, setSkills] = useState<string[]>(editingEmployee?.skills || []);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      civilId: editingEmployee?.civilId || "",
      fullName: editingEmployee?.fullName || "",
      nationality: editingEmployee?.nationality || "",
      type: editingEmployee?.type || "resident",
      jobTitle: editingEmployee?.jobTitle || "",
      actualJobTitle: editingEmployee?.actualJobTitle || "",
      hireDate: editingEmployee?.hireDate ? new Date(editingEmployee.hireDate) : undefined,
      workPermitStart: editingEmployee?.workPermitStart ? new Date(editingEmployee.workPermitStart) : undefined,
      workPermitEnd: editingEmployee?.workPermitEnd ? new Date(editingEmployee.workPermitEnd) : undefined,
      monthlySalary: editingEmployee?.monthlySalary?.toString() || "",
      actualSalary: editingEmployee?.actualSalary?.toString() || "",
      phone: editingEmployee?.phone || "",
      email: editingEmployee?.email || "",
      address: editingEmployee?.address || "",
      emergencyContact: editingEmployee?.emergencyContact || "",
      emergencyContactPhone: editingEmployee?.emergencyContactPhone || "",
      passportNumber: editingEmployee?.passportNumber || "",
      passportExpiry: editingEmployee?.passportExpiry ? new Date(editingEmployee.passportExpiry) : undefined,
      residenceNumber: editingEmployee?.residenceNumber || "",
      residenceExpiry: editingEmployee?.residenceExpiry ? new Date(editingEmployee.residenceExpiry) : undefined,
      medicalInsurance: editingEmployee?.medicalInsurance || "",
      bankAccount: editingEmployee?.bankAccount || "",
      maritalStatus: editingEmployee?.maritalStatus || undefined,
      numberOfDependents: editingEmployee?.numberOfDependents || 0,
      educationLevel: editingEmployee?.educationLevel || "",
      previousExperience: editingEmployee?.previousExperience || "",
      contractType: editingEmployee?.contractType || undefined,
      probationPeriod: editingEmployee?.probationPeriod || 0,
      workLocation: editingEmployee?.workLocation || "",
      department: editingEmployee?.department || "",
      notes: editingEmployee?.notes || "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      const employeeData = {
        ...data,
        companyId,
        languages,
        skills,
        hireDate: data.hireDate.toISOString().split('T')[0],
        workPermitStart: data.workPermitStart?.toISOString().split('T')[0],
        workPermitEnd: data.workPermitEnd?.toISOString().split('T')[0],
        passportExpiry: data.passportExpiry?.toISOString().split('T')[0],
        residenceExpiry: data.residenceExpiry?.toISOString().split('T')[0],
        monthlySalary: parseFloat(data.monthlySalary),
        actualSalary: data.actualSalary ? parseFloat(data.actualSalary) : undefined,
      };
      
      if (editingEmployee) {
        return await apiRequest(`/api/employees/${editingEmployee.id}`, "PUT", employeeData);
      } else {
        return await apiRequest("/api/employees", "POST", employeeData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", companyId, "employees"] });
      toast({
        title: editingEmployee ? "تم تحديث الموظف" : "تم إضافة الموظف",
        description: editingEmployee 
          ? "تم تحديث بيانات الموظف بنجاح" 
          : "تم إضافة الموظف الجديد بنجاح",
      });
      onClose();
      form.reset();
      setLanguages([]);
      setSkills([]);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    },
  });

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EmployeeFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* البيانات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="civilId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم المدني *</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل *</FormLabel>
                    <FormControl>
                      <Input placeholder="الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجنسية *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجنسية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kuwait">كويتي</SelectItem>
                        <SelectItem value="saudi">سعودي</SelectItem>
                        <SelectItem value="egyptian">مصري</SelectItem>
                        <SelectItem value="jordanian">أردني</SelectItem>
                        <SelectItem value="lebanese">لبناني</SelectItem>
                        <SelectItem value="syrian">سوري</SelectItem>
                        <SelectItem value="palestinian">فلسطيني</SelectItem>
                        <SelectItem value="indian">هندي</SelectItem>
                        <SelectItem value="pakistani">باكستاني</SelectItem>
                        <SelectItem value="filipino">فلبيني</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الموظف *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citizen">مواطن</SelectItem>
                        <SelectItem value="resident">مقيم</SelectItem>
                        <SelectItem value="temporary">زائر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* البيانات الوظيفية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي *</FormLabel>
                    <FormControl>
                      <Input placeholder="مطور برمجيات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualJobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي الفعلي</FormLabel>
                    <FormControl>
                      <Input placeholder="المسمى الفعلي في العمل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="it">تقنية المعلومات</SelectItem>
                        <SelectItem value="hr">الموارد البشرية</SelectItem>
                        <SelectItem value="finance">المالية</SelectItem>
                        <SelectItem value="sales">المبيعات</SelectItem>
                        <SelectItem value="marketing">التسويق</SelectItem>
                        <SelectItem value="operations">العمليات</SelectItem>
                        <SelectItem value="admin">الإدارة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مكان العمل</FormLabel>
                    <FormControl>
                      <Input placeholder="المكتب الرئيسي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* التواريخ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ التوظيف *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workPermitStart"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>بداية تصريح العمل</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workPermitEnd"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>انتهاء تصريح العمل</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* الراتب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الشهري (د.ك) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="500.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الفعلي (د.ك)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="450.00" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* بيانات الاتصال */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="50123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="employee@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Textarea placeholder="العنوان الكامل" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* بيانات الطوارئ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>جهة الاتصال في الطوارئ</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الشخص" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>هاتف الطوارئ</FormLabel>
                    <FormControl>
                      <Input placeholder="50123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* الوثائق */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الجواز</FormLabel>
                    <FormControl>
                      <Input placeholder="A12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passportExpiry"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>انتهاء الجواز</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الإقامة</FormLabel>
                    <FormControl>
                      <Input placeholder="123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residenceExpiry"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>انتهاء الإقامة</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* اللغات */}
            <div className="space-y-4">
              <FormLabel>اللغات</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="أضف لغة"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                />
                <Button type="button" onClick={addLanguage}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                    <span className="text-sm">{language}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* المهارات */}
            <div className="space-y-4">
              <FormLabel>المهارات</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="أضف مهارة"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                    <span className="text-sm">{skill}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="أي ملاحظات إضافية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "جاري الحفظ..." : editingEmployee ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}