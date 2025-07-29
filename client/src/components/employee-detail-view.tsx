import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Download,
  Share,
  AlertCircle,
  CreditCard,
  FileText,
  Award,
  Languages,
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EmployeeDetailViewProps {
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: any) => void;
}

export function EmployeeDetailView({ 
  employeeId, 
  isOpen, 
  onClose, 
  onEdit 
}: EmployeeDetailViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // استعلام بيانات الموظف
  const { data: employee, isLoading } = useQuery({
    queryKey: ["/api/employees", employeeId],
    enabled: isOpen && !!employeeId,
  });

  // استعلام شركة الموظف
  const { data: company } = useQuery({
    queryKey: ["/api/companies", employee?.companyId],
    enabled: isOpen && !!employee?.companyId,
  });

  // استعلام إجازات الموظف
  const { data: leaves = [] } = useQuery({
    queryKey: ["/api/employees", employeeId, "leaves"],
    enabled: isOpen && !!employeeId,
  });

  // استعلام خصومات الموظف
  const { data: deductions = [] } = useQuery({
    queryKey: ["/api/employees", employeeId, "deductions"],
    enabled: isOpen && !!employeeId,
  });

  // حذف الموظف
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/employees/${employeeId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies", employee?.companyId, "employees"] });
      toast({
        title: "تم حذف الموظف",
        description: "تم حذف الموظف وجميع بياناته بنجاح",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الموظف",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'suspended': return 'موقوف';
      default: return 'غير محدد';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'citizen': return 'مواطن';
      case 'resident': return 'مقيم';
      case 'temporary': return 'زائر';
      default: return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!employee) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لم يتم العثور على الموظف</h3>
            <p className="text-muted-foreground">الموظف المطلوب غير موجود أو تم حذفه</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {employee.fullName || employee.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(employee.status || 'active')}>
                    {getStatusLabel(employee.status || 'active')}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(employee.type)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {employee.jobTitle || employee.position}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                مشاركة
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                حذف
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="work">العمل</TabsTrigger>
            <TabsTrigger value="documents">الوثائق</TabsTrigger>
            <TabsTrigger value="leaves">الإجازات</TabsTrigger>
            <TabsTrigger value="finance">المالية</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* البيانات الشخصية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    البيانات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الاسم الكامل
                      </label>
                      <p className="font-medium">{employee.fullName || employee.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الرقم المدني
                      </label>
                      <p className="font-medium">{employee.civilId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الجنسية
                      </label>
                      <p className="font-medium">{employee.nationality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الحالة الاجتماعية
                      </label>
                      <p className="font-medium">{employee.maritalStatus || 'غير محدد'}</p>
                    </div>
                    {employee.numberOfDependents !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          عدد المعالين
                        </label>
                        <p className="font-medium">{employee.numberOfDependents}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        المستوى التعليمي
                      </label>
                      <p className="font-medium">{employee.educationLevel || 'غير محدد'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {employee.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{employee.phone}</p>
                      </div>
                    )}
                    {employee.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{employee.email}</p>
                      </div>
                    )}
                    {employee.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{employee.address}</p>
                      </div>
                    )}
                    {employee.emergencyContact && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          جهة الاتصال في الطوارئ
                        </label>
                        <div className="flex items-center gap-3 mt-1">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{employee.emergencyContact}</p>
                            {employee.emergencyContactPhone && (
                              <p className="text-sm text-muted-foreground">{employee.emergencyContactPhone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* اللغات والمهارات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employee.languages && employee.languages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      اللغات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {employee.languages.map((language: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {employee.skills && employee.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      المهارات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* الخبرة السابقة */}
            {employee.previousExperience && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    الخبرة السابقة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{employee.previousExperience}</p>
                </CardContent>
              </Card>
            )}

            {/* الملاحظات */}
            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    ملاحظات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="work" className="space-y-6">
            {/* معلومات العمل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    الوظيفة الحالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        المسمى الوظيفي
                      </label>
                      <p className="font-medium">{employee.jobTitle || employee.position}</p>
                    </div>
                    {employee.actualJobTitle && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          المسمى الفعلي
                        </label>
                        <p className="font-medium">{employee.actualJobTitle}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        القسم
                      </label>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        مكان العمل
                      </label>
                      <p className="font-medium">{employee.workLocation || 'غير محدد'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    الشركة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          اسم الشركة
                        </label>
                        <p className="font-medium">{company.name || company.commercialFileName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          نوع النشاط
                        </label>
                        <p className="font-medium">{company.industryType || 'غير محدد'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          الموقع
                        </label>
                        <p className="font-medium">{company.location || 'غير محدد'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">لا توجد معلومات عن الشركة</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* تواريخ مهمة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  التواريخ المهمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {employee.hireDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        تاريخ التوظيف
                      </label>
                      <p className="font-medium">
                        {format(new Date(employee.hireDate), "PPP", { locale: ar })}
                      </p>
                    </div>
                  )}
                  {employee.workPermitStart && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        بداية تصريح العمل
                      </label>
                      <p className="font-medium">
                        {format(new Date(employee.workPermitStart), "PPP", { locale: ar })}
                      </p>
                    </div>
                  )}
                  {employee.workPermitEnd && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        انتهاء تصريح العمل
                      </label>
                      <p className="font-medium">
                        {format(new Date(employee.workPermitEnd), "PPP", { locale: ar })}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* العقد */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تفاصيل العقد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      نوع العقد
                    </label>
                    <p className="font-medium">{employee.contractType || 'غير محدد'}</p>
                  </div>
                  {employee.probationPeriod && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        فترة التجريب
                      </label>
                      <p className="font-medium">{employee.probationPeriod} شهر</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {/* الوثائق الشخصية */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  الوثائق والهوية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employee.passportNumber && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        رقم الجواز
                      </label>
                      <p className="font-medium">{employee.passportNumber}</p>
                      {employee.passportExpiry && (
                        <p className="text-sm text-muted-foreground">
                          ينتهي: {format(new Date(employee.passportExpiry), "PPP", { locale: ar })}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {employee.residenceNumber && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        رقم الإقامة
                      </label>
                      <p className="font-medium">{employee.residenceNumber}</p>
                      {employee.residenceExpiry && (
                        <p className="text-sm text-muted-foreground">
                          ينتهي: {format(new Date(employee.residenceExpiry), "PPP", { locale: ar })}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {employee.medicalInsurance && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        التأمين الطبي
                      </label>
                      <p className="font-medium">{employee.medicalInsurance}</p>
                    </div>
                  )}
                  
                  {employee.bankAccount && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        الحساب البنكي
                      </label>
                      <p className="font-medium">{employee.bankAccount}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">إجازات الموظف ({leaves.length})</h3>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                طلب إجازة
              </Button>
            </div>

            {leaves.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد إجازات</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم تسجيل أي إجازات لهذا الموظف بعد
                  </p>
                  <Button>إضافة إجازة جديدة</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {leaves.map((leave: any) => (
                  <Card key={leave.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{leave.type}</h4>
                          <p className="text-muted-foreground">
                            من {format(new Date(leave.startDate), "PPP", { locale: ar })} 
                            إلى {format(new Date(leave.endDate), "PPP", { locale: ar })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {leave.days} يوم - {leave.reason}
                          </p>
                        </div>
                        <Badge className={getStatusColor(leave.status)}>
                          {leave.status === 'approved' ? 'موافق عليها' : 
                           leave.status === 'pending' ? 'في الانتظار' : 'مرفوضة'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            {/* معلومات الراتب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    معلومات الراتب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الراتب الشهري
                      </label>
                      <p className="font-medium text-lg">
                        {employee.monthlySalary || employee.salary} د.ك
                      </p>
                    </div>
                    {employee.actualSalary && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          الراتب الفعلي
                        </label>
                        <p className="font-medium text-lg">
                          {employee.actualSalary} د.ك
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    الخصومات ({deductions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deductions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      لا توجد خصومات
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {deductions.slice(0, 3).map((deduction: any) => (
                        <div key={deduction.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{deduction.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(deduction.date), "PPP", { locale: ar })}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600">
                            -{deduction.amount} د.ك
                          </p>
                        </div>
                      ))}
                      {deductions.length > 3 && (
                        <Button variant="outline" className="w-full mt-3">
                          عرض جميع الخصومات
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}