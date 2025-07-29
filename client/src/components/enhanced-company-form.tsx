import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Building2, Users, Globe, Phone, Mail, MapPin } from "lucide-react";

// Enhanced company schema with comprehensive business data
const enhancedCompanySchema = z.object({
  name: z.string().min(2, "اسم الشركة مطلوب"),
  commercialFileNumber: z.string().optional(),
  commercialFileName: z.string().optional(),
  commercialRegistrationNumber: z.string().optional(),
  classification: z.string().optional(),
  department: z.string().optional(),
  legalEntity: z.string().optional(),
  ownershipCategory: z.string().optional(),
  address: z.string().min(5, "العنوان مطلوب"),
  phone: z.string().min(8, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
  website: z.string().url("رابط الموقع غير صحيح").optional(),
  industryType: z.string().min(1, "نوع الصناعة مطلوب"),
  businessActivity: z.string().min(5, "نشاط الشركة مطلوب"),
  location: z.string().min(1, "الموقع مطلوب"),
  taxNumber: z.string().optional(),
  chambers: z.string().optional(),
  importExportLicense: z.string().optional(),
  establishmentDate: z.string().optional(),
});

type EnhancedCompanyFormData = z.infer<typeof enhancedCompanySchema>;

interface EnhancedCompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompany?: any;
}

export default function EnhancedCompanyForm({ isOpen, onClose, editingCompany }: EnhancedCompanyFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [partnerships, setPartnerships] = useState<Array<{ partnerName: string; partnershipType: string; percentage?: number }>>([]);
  const [specialPermits, setSpecialPermits] = useState<Array<{ permitType: string; permitNumber: string; expiryDate: string }>>([]);

  const form = useForm<EnhancedCompanyFormData>({
    resolver: zodResolver(enhancedCompanySchema),
    defaultValues: editingCompany || {
      name: "",
      commercialFileNumber: "",
      commercialFileName: "",
      commercialRegistrationNumber: "",
      classification: "",
      department: "",
      legalEntity: "",
      ownershipCategory: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      industryType: "",
      businessActivity: "",
      location: "",
      taxNumber: "",
      chambers: "",
      importExportLicense: "",
      establishmentDate: "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: EnhancedCompanyFormData) => {
      const companyData = {
        ...data,
        partnerships,
        specialPermits,
        establishmentDate: data.establishmentDate ? new Date(data.establishmentDate).toISOString().split('T')[0] : undefined,
      };
      
      if (editingCompany) {
        return await apiRequest(`/api/companies/${editingCompany.id}`, {
          method: "PUT",
          body: companyData
        });
      } else {
        return await apiRequest("/api/companies", {
          method: "POST",
          body: companyData
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: editingCompany ? "تم تحديث الشركة" : "تم إضافة الشركة",
        description: editingCompany 
          ? "تم تحديث بيانات الشركة بنجاح" 
          : "تم إضافة الشركة الجديدة بنجاح",
      });
      onClose();
      form.reset();
      setPartnerships([]);
      setSpecialPermits([]);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    },
  });

  const addPartnership = () => {
    setPartnerships([...partnerships, { partnerName: "", partnershipType: "", percentage: 0 }]);
  };

  const removePartnership = (index: number) => {
    setPartnerships(partnerships.filter((_, i) => i !== index));
  };

  const addSpecialPermit = () => {
    setSpecialPermits([...specialPermits, { permitType: "", permitNumber: "", expiryDate: "" }]);
  };

  const removeSpecialPermit = (index: number) => {
    setSpecialPermits(specialPermits.filter((_, i) => i !== index));
  };

  const onSubmit = (data: EnhancedCompanyFormData) => {
    mutation.mutate(data);
  };

  const industryTypes = [
    "أقمشة ومنسوجات",
    "مجوهرات وذهب",
    "خياطة وتفصيل",
    "تجارة عامة",
    "مطاعم وضيافة",
    "خدمات مهنية",
    "تجارة إلكترونية",
    "تصنيع وإنتاج",
    "استيراد وتصدير",
    "خدمات طبية",
    "تعليم وتدريب",
    "عقارات واستثمار"
  ];

  const kuwaitLocations = [
    "مدينة الكويت",
    "المباركية",
    "الجهراء",
    "الصفاة",
    "فحيحيل",
    "رامين",
    "الشويخ",
    "السالمية",
    "حولي",
    "الفردوس",
    "الرقعي",
    "صباح السالم"
  ];

  const legalEntities = [
    "شركة ذات مسؤولية محدودة",
    "شركة مساهمة مقفلة",
    "شركة تضامن",
    "مؤسسة فردية",
    "شركة أشخاص",
    "فرع شركة أجنبية"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {editingCompany ? "تعديل بيانات الشركة" : "إضافة شركة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      اسم الشركة
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الشركة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commercialFileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الملف التجاري</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الملف التجاري" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commercialRegistrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم السجل التجاري</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم السجل التجاري" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الضريبي</FormLabel>
                    <FormControl>
                      <Input placeholder="الرقم الضريبي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Legal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legalEntity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الكيان القانوني</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الكيان القانوني" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {legalEntities.map((entity) => (
                          <SelectItem key={entity} value={entity}>
                            {entity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establishmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ التأسيس</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الصناعة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الصناعة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      الموقع
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموقع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kuwaitLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="businessActivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نشاط الشركة التفصيلي</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب وصف مفصل لنشاط الشركة"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="رقم الهاتف" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      البريد الإلكتروني
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="البريد الإلكتروني" type="email" {...field} />
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
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    العنوان التفصيلي
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل العنوان التفصيلي للشركة"
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    الموقع الإلكتروني
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partnerships Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">الشراكات</h3>
                <Button type="button" variant="outline" size="sm" onClick={addPartnership}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة شريك
                </Button>
              </div>
              
              {partnerships.map((partnership, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                  <Input
                    placeholder="اسم الشريك"
                    value={partnership.partnerName}
                    onChange={(e) => {
                      const updated = [...partnerships];
                      updated[index].partnerName = e.target.value;
                      setPartnerships(updated);
                    }}
                  />
                  <Select
                    value={partnership.partnershipType}
                    onValueChange={(value) => {
                      const updated = [...partnerships];
                      updated[index].partnershipType = value;
                      setPartnerships(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="نوع الشراكة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="شريك">شريك</SelectItem>
                      <SelectItem value="مدير">مدير</SelectItem>
                      <SelectItem value="مالك">مالك</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="النسبة %"
                    value={partnership.percentage || ""}
                    onChange={(e) => {
                      const updated = [...partnerships];
                      updated[index].percentage = Number(e.target.value);
                      setPartnerships(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePartnership(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Special Permits Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">التصاريح الخاصة</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSpecialPermit}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة تصريح
                </Button>
              </div>
              
              {specialPermits.map((permit, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                  <Input
                    placeholder="نوع التصريح"
                    value={permit.permitType}
                    onChange={(e) => {
                      const updated = [...specialPermits];
                      updated[index].permitType = e.target.value;
                      setSpecialPermits(updated);
                    }}
                  />
                  <Input
                    placeholder="رقم التصريح"
                    value={permit.permitNumber}
                    onChange={(e) => {
                      const updated = [...specialPermits];
                      updated[index].permitNumber = e.target.value;
                      setSpecialPermits(updated);
                    }}
                  />
                  <Input
                    type="date"
                    placeholder="تاريخ الانتهاء"
                    value={permit.expiryDate}
                    onChange={(e) => {
                      const updated = [...specialPermits];
                      updated[index].expiryDate = e.target.value;
                      setSpecialPermits(updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpecialPermit(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chambers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>غرف التجارة</FormLabel>
                    <FormControl>
                      <Input placeholder="غرف التجارة المسجلة بها" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importExportLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رخصة الاستيراد والتصدير</FormLabel>
                    <FormControl>
                      <Input placeholder="رقم رخصة الاستيراد والتصدير" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "جاري الحفظ..." : editingCompany ? "تحديث الشركة" : "إضافة الشركة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}