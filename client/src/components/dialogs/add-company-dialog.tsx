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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const companySchema = z.object({
  name: z.string().min(2, "اسم الشركة مطلوب"),
  description: z.string().min(10, "وصف الشركة مطلوب"),
  industry: z.string().min(1, "نوع الصناعة مطلوب"),
  address: z.string().min(5, "العنوان مطلوب"),
  phone: z.string().min(10, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  website: z.string().url("رابط الموقع غير صحيح").optional(),
  size: z.enum(["small", "medium", "large"])
});

type CompanyFormData = z.infer<typeof companySchema>;

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCompanyDialog({ open, onOpenChange }: AddCompanyDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      size: "medium"
    }
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest("/api/companies", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الشركة بنجاح",
        description: "تم إضافة الشركة الجديدة إلى النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "فشل في إنشاء الشركة",
        description: "حدث خطأ أثناء إضافة الشركة",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة شركة جديدة</DialogTitle>
          <DialogDescription>
            أدخل معلومات الشركة الجديدة التي تريد إضافتها إلى النظام
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الشركة *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="مثال: شركة التقنية المتقدمة"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">نوع الصناعة *</Label>
              <Select onValueChange={(value) => form.setValue("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الصناعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                  <SelectItem value="التجارة">التجارة</SelectItem>
                  <SelectItem value="الصناعة">الصناعة</SelectItem>
                  <SelectItem value="المالية">المالية</SelectItem>
                  <SelectItem value="الصحة">الصحة</SelectItem>
                  <SelectItem value="التعليم">التعليم</SelectItem>
                  <SelectItem value="الإنشاءات">الإنشاءات</SelectItem>
                  <SelectItem value="الخدمات">الخدمات</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.industry && (
                <p className="text-sm text-red-500">{form.formState.errors.industry.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الشركة *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="وصف مختصر عن نشاط الشركة وخدماتها"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان *</Label>
            <Input
              id="address"
              {...form.register("address")}
              placeholder="العنوان الكامل للشركة"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+966 11 234 5678"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="info@company.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">موقع الشركة (اختياري)</Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://company.com"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">حجم الشركة</Label>
              <Select onValueChange={(value) => form.setValue("size", value as "small" | "medium" | "large")}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر حجم الشركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">صغيرة (1-50 موظف)</SelectItem>
                  <SelectItem value="medium">متوسطة (51-500 موظف)</SelectItem>
                  <SelectItem value="large">كبيرة (500+ موظف)</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={createCompanyMutation.isPending}
            >
              {createCompanyMutation.isPending ? "جاري الإنشاء..." : "إنشاء الشركة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}