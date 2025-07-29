import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  FileText,
  Award,
  TrendingUp,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CompanyDetailViewProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (company: any) => void;
}

export function CompanyDetailView({ 
  companyId, 
  isOpen, 
  onClose, 
  onEdit 
}: CompanyDetailViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // استعلام بيانات الشركة
  const { data: company, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId],
    enabled: isOpen && !!companyId,
  });

  // استعلام موظفي الشركة
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/companies", companyId, "employees"],
    enabled: isOpen && !!companyId,
  });

  // استعلام تراخيص الشركة
  const { data: licenses = [] } = useQuery({
    queryKey: ["/api/companies", companyId, "licenses"],
    enabled: isOpen && !!companyId,
  });

  // استعلام إحصائيات الشركة
  const { data: stats } = useQuery({
    queryKey: ["/api/companies", companyId, "stats"],
    enabled: isOpen && !!companyId,
  });

  // حذف الشركة
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/companies/${companyId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "تم حذف الشركة",
        description: "تم حذف الشركة وجميع بياناتها بنجاح",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الشركة",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشطة';
      case 'pending': return 'معلقة';
      case 'suspended': return 'موقوفة';
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

  if (!company) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لم يتم العثور على الشركة</h3>
            <p className="text-muted-foreground">الشركة المطلوبة غير موجودة أو تم حذفها</p>
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
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  {company.name || company.commercialFileName}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(company.status || 'active')}>
                    {getStatusLabel(company.status || 'active')}
                  </Badge>
                  <span className="text-muted-foreground">
                    {company.industryType}
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
                <Button variant="outline" size="sm" onClick={() => onEdit(company)}>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm('هل أنت متأكد من حذف هذه الشركة؟')) {
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
            <TabsTrigger value="employees">الموظفون</TabsTrigger>
            <TabsTrigger value="licenses">التراخيص</TabsTrigger>
            <TabsTrigger value="statistics">الإحصائيات</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* البيانات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    البيانات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        اسم الملف التجاري
                      </label>
                      <p className="font-medium">{company.commercialFileName || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        رقم الملف التجاري
                      </label>
                      <p className="font-medium">{company.commercialFileNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        رقم السجل التجاري
                      </label>
                      <p className="font-medium">{company.commercialRegistrationNumber || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        التصنيف
                      </label>
                      <p className="font-medium">{company.classification || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        الكيان القانوني
                      </label>
                      <p className="font-medium">{company.legalEntity || 'غير محدد'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        فئة الملكية
                      </label>
                      <p className="font-medium">{company.ownershipCategory || 'غير محدد'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات الاتصال
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{company.location || 'غير محدد'}</p>
                        <p className="text-sm text-muted-foreground">{company.address}</p>
                      </div>
                    </div>
                    {company.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{company.phone}</p>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{company.email}</p>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* النشاط التجاري */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  النشاط التجاري
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      نوع الصناعة
                    </label>
                    <p className="font-medium">{company.industryType || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      النشاط التجاري
                    </label>
                    <p className="font-medium">{company.businessActivity || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      الرقم الضريبي
                    </label>
                    <p className="font-medium">{company.taxNumber || 'غير محدد'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* الشراكات */}
            {company.partnerships && company.partnerships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    الشراكات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {company.partnerships.map((partnership: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{partnership.partnerName}</p>
                          <p className="text-sm text-muted-foreground">{partnership.partnershipType}</p>
                        </div>
                        {partnership.percentage && (
                          <Badge variant="outline">
                            {partnership.percentage}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* التصاريح الخاصة */}
            {company.specialPermits && company.specialPermits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    التصاريح الخاصة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {company.specialPermits.map((permit: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{permit.permitType}</p>
                          <p className="text-sm text-muted-foreground">رقم التصريح: {permit.permitNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {permit.expiryDate && format(new Date(permit.expiryDate), "PPP", { locale: ar })}
                          </p>
                          <p className="text-xs text-muted-foreground">تاريخ الانتهاء</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">موظفو الشركة ({employees.length})</h3>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                إضافة موظف
              </Button>
            </div>

            {employees.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد موظفون</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم إضافة أي موظفين لهذه الشركة بعد
                  </p>
                  <Button>إضافة موظف جديد</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {employees.map((employee: any) => (
                  <Card key={employee.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{employee.fullName || employee.name}</h4>
                            <p className="text-muted-foreground">{employee.jobTitle || employee.position}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{employee.department}</span>
                              <span>{employee.nationality}</span>
                              {employee.monthlySalary && (
                                <span>{employee.monthlySalary} د.ك</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(employee.status || 'active')}>
                            {getStatusLabel(employee.status || 'active')}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="licenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">تراخيص الشركة ({licenses.length})</h3>
              <Button>
                <Award className="h-4 w-4 mr-2" />
                إضافة ترخيص
              </Button>
            </div>

            {licenses.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد تراخيص</h3>
                  <p className="text-muted-foreground mb-4">
                    لم يتم إضافة أي تراخيص لهذه الشركة بعد
                  </p>
                  <Button>إضافة ترخيص جديد</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {licenses.map((license: any) => (
                  <Card key={license.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{license.name}</h4>
                            <p className="text-muted-foreground">رقم الترخيص: {license.licenseNumber}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{license.type}</span>
                              <span>{license.issuingAuthority}</span>
                              {license.expiryDate && (
                                <span>ينتهي: {format(new Date(license.expiryDate), "PPP", { locale: ar })}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(license.status || 'active')}>
                            {getStatusLabel(license.status || 'active')}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                        <p className="text-2xl font-bold">{stats.totalEmployees || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">التراخيص النشطة</p>
                        <p className="text-2xl font-bold">{stats.activeLicenses || 0}</p>
                      </div>
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">إجمالي الرواتب</p>
                        <p className="text-2xl font-bold">{stats.totalSalaries || 0} د.ك</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">المستندات</p>
                        <p className="text-2xl font-bold">{stats.totalDocuments || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد إحصائيات</h3>
                  <p className="text-muted-foreground">
                    لم يتم إنشاء إحصائيات لهذه الشركة بعد
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">مستندات الشركة</h3>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                إضافة مستند
              </Button>
            </div>

            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مستندات</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم رفع أي مستندات لهذه الشركة بعد
                </p>
                <Button>رفع مستند جديد</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}