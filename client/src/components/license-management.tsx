import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarIcon, FileText, Users, AlertTriangle, Plus, Eye, Edit, Trash, Building, Shield, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MainLicense {
  id: string;
  companyId: string;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'cancelled';
  description: string;
  attachments: string[];
  subLicenses: SubLicense[];
  employeeAssignments: EmployeeAssignment[];
}

interface SubLicense {
  id: string;
  mainLicenseId: string;
  subLicenseNumber: string;
  subLicenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending_renewal' | 'cancelled';
  description: string;
  attachments: string[];
  employeeAssignments: EmployeeAssignment[];
}

interface EmployeeAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  department: string;
  assignedDate: string;
  isActive: boolean;
  notes: string;
}

interface LicenseManagementProps {
  companyId: string;
}

export function LicenseManagement({ companyId }: LicenseManagementProps) {
  const [activeTab, setActiveTab] = useState("main-licenses");
  const [selectedLicense, setSelectedLicense] = useState<MainLicense | null>(null);
  const [selectedSubLicense, setSelectedSubLicense] = useState<SubLicense | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'main' | 'sub' | 'employee'>('main');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch main licenses
  const { data: mainLicenses = [], isLoading: isLoadingMain } = useQuery<MainLicense[]>({
    queryKey: [`/api/licenses/main/${companyId}`],
    enabled: !!companyId
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: [`/api/companies/${companyId}/employees`],
    enabled: !!companyId
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "نشط", variant: "default" as const },
      expired: { label: "منتهي الصلاحية", variant: "destructive" as const },
      pending_renewal: { label: "في انتظار التجديد", variant: "secondary" as const },
      cancelled: { label: "ملغى", variant: "outline" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryAlert = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days <= 30 && days > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ينتهي خلال {days} يوم</Badge>;
    } else if (days <= 0) {
      return <Badge variant="destructive">منتهي الصلاحية</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">إدارة التراخيص</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {setDialogType('main'); setShowAddDialog(true);}}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة ترخيص رئيسي
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'main' ? 'إضافة ترخيص رئيسي جديد' : 
                 dialogType === 'sub' ? 'إضافة ترخيص فرعي جديد' : 
                 'تعيين موظف للترخيص'}
              </DialogTitle>
            </DialogHeader>
            <AddLicenseForm 
              type={dialogType} 
              companyId={companyId} 
              mainLicenseId={selectedLicense?.id}
              employees={employees}
              onClose={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="main-licenses">التراخيص الرئيسية</TabsTrigger>
          <TabsTrigger value="sub-licenses">التراخيص الفرعية</TabsTrigger>
          <TabsTrigger value="employee-assignments">تعيينات الموظفين</TabsTrigger>
          <TabsTrigger value="expiry-alerts">تنبيهات الانتهاء</TabsTrigger>
        </TabsList>

        <TabsContent value="main-licenses" className="space-y-4">
          <div className="grid gap-6">
            {isLoadingMain ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : mainLicenses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد تراخيص رئيسية مسجلة</p>
                </CardContent>
              </Card>
            ) : (
              mainLicenses.map((license: MainLicense) => (
                <Card key={license.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {license.licenseType}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          رقم الترخيص: {license.licenseNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الجهة المصدرة: {license.issuingAuthority}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getExpiryAlert(license.expiryDate)}
                        {getStatusBadge(license.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium">تاريخ الإصدار</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(license.issueDate), "dd/MM/yyyy", { locale: ar })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">تاريخ الانتهاء</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(license.expiryDate), "dd/MM/yyyy", { locale: ar })}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">الأيام المتبقية</Label>
                        <p className="text-sm text-muted-foreground">
                          {getDaysUntilExpiry(license.expiryDate)} يوم
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {license.subLicenses?.length || 0} ترخيص فرعي
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {license.employeeAssignments?.length || 0} موظف مُعيّن
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLicense(license)}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedLicense(license);
                          setDialogType('sub');
                          setShowAddDialog(true);
                        }}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة ترخيص فرعي
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedLicense(license);
                          setDialogType('employee');
                          setShowAddDialog(true);
                        }}
                      >
                        <UserCheck className="h-4 w-4 ml-1" />
                        تعيين موظف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="sub-licenses" className="space-y-4">
          <SubLicensesView 
            mainLicenses={mainLicenses} 
            onSelectSubLicense={setSelectedSubLicense}
            onAddEmployee={(subLicense) => {
              setSelectedSubLicense(subLicense);
              setDialogType('employee');
              setShowAddDialog(true);
            }}
          />
        </TabsContent>

        <TabsContent value="employee-assignments" className="space-y-4">
          <EmployeeAssignmentsView 
            mainLicenses={mainLicenses}
            employees={employees}
          />
        </TabsContent>

        <TabsContent value="expiry-alerts" className="space-y-4">
          <ExpiryAlertsView mainLicenses={mainLicenses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components
function SubLicensesView({ 
  mainLicenses, 
  onSelectSubLicense, 
  onAddEmployee 
}: { 
  mainLicenses: MainLicense[], 
  onSelectSubLicense: (subLicense: SubLicense) => void,
  onAddEmployee: (subLicense: SubLicense) => void 
}) {
  const allSubLicenses = mainLicenses.flatMap((license: MainLicense) => 
    license.subLicenses?.map(sub => ({ ...sub, mainLicenseType: license.licenseType })) || []
  );

  return (
    <div className="grid gap-4">
      {allSubLicenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد تراخيص فرعية مسجلة</p>
          </CardContent>
        </Card>
      ) : (
        allSubLicenses.map((subLicense: any) => (
          <Card key={subLicense.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {subLicense.subLicenseType}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    رقم الترخيص: {subLicense.subLicenseNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    تابع للترخيص الرئيسي: {subLicense.mainLicenseType}
                  </p>
                </div>
                <Badge variant="outline">{subLicense.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onSelectSubLicense(subLicense)}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  عرض التفاصيل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAddEmployee(subLicense)}
                >
                  <UserCheck className="h-4 w-4 ml-1" />
                  تعيين موظف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function EmployeeAssignmentsView({ mainLicenses, employees }: any) {
  const allAssignments = mainLicenses.flatMap((license: MainLicense) => {
    const mainAssignments = license.employeeAssignments?.map(assignment => ({
      ...assignment,
      licenseType: license.licenseType,
      licenseNumber: license.licenseNumber,
      isSubLicense: false
    })) || [];
    
    const subAssignments = license.subLicenses?.flatMap(sub => 
      sub.employeeAssignments?.map(assignment => ({
        ...assignment,
        licenseType: sub.subLicenseType,
        licenseNumber: sub.subLicenseNumber,
        isSubLicense: true,
        parentLicense: license.licenseType
      })) || []
    ) || [];
    
    return [...mainAssignments, ...subAssignments];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>تعيينات الموظفين للتراخيص</CardTitle>
      </CardHeader>
      <CardContent>
        {allAssignments.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد تعيينات موظفين للتراخيص</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الموظف</TableHead>
                <TableHead>المنصب</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>نوع الترخيص</TableHead>
                <TableHead>رقم الترخيص</TableHead>
                <TableHead>تاريخ التعيين</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAssignments.map((assignment: any, index: number) => (
                <TableRow key={`${assignment.id}-${index}`}>
                  <TableCell className="font-medium">{assignment.employeeName}</TableCell>
                  <TableCell>{assignment.position}</TableCell>
                  <TableCell>{assignment.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {assignment.isSubLicense && (
                        <Badge variant="outline" className="text-xs">فرعي</Badge>
                      )}
                      {assignment.licenseType}
                    </div>
                  </TableCell>
                  <TableCell>{assignment.licenseNumber}</TableCell>
                  <TableCell>
                    {format(new Date(assignment.assignedDate), "dd/MM/yyyy", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={assignment.isActive ? "default" : "secondary"}>
                      {assignment.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ExpiryAlertsView({ mainLicenses }: any) {
  const getExpiringLicenses = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const expiringLicenses: any[] = [];
    
    mainLicenses.forEach((license: MainLicense) => {
      const expiryDate = new Date(license.expiryDate);
      if (expiryDate <= thirtyDaysFromNow) {
        expiringLicenses.push({
          ...license,
          type: 'main',
          daysLeft: Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        });
      }
      
      license.subLicenses?.forEach(sub => {
        const subExpiryDate = new Date(sub.expiryDate);
        if (subExpiryDate <= thirtyDaysFromNow) {
          expiringLicenses.push({
            ...sub,
            type: 'sub',
            parentLicense: license.licenseType,
            daysLeft: Math.ceil((subExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          });
        }
      });
    });
    
    return expiringLicenses.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const expiringLicenses = getExpiringLicenses();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          تنبيهات انتهاء صلاحية التراخيص
        </CardTitle>
      </CardHeader>
      <CardContent>
        {expiringLicenses.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-muted-foreground">جميع التراخيص سارية لأكثر من 30 يوم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiringLicenses.map((license: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${
                license.daysLeft <= 0 ? 'bg-red-50 border-red-200' :
                license.daysLeft <= 7 ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {license.type === 'main' ? license.licenseType : license.subLicenseType}
                      {license.type === 'sub' && (
                        <Badge variant="outline" className="mr-2">فرعي</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      رقم الترخيص: {license.type === 'main' ? license.licenseNumber : license.subLicenseNumber}
                    </p>
                    {license.type === 'sub' && (
                      <p className="text-sm text-muted-foreground">
                        الترخيص الرئيسي: {license.parentLicense}
                      </p>
                    )}
                    <p className="text-sm">
                      تاريخ الانتهاء: {format(new Date(license.expiryDate), "dd/MM/yyyy", { locale: ar })}
                    </p>
                  </div>
                  <Badge variant={
                    license.daysLeft <= 0 ? "destructive" :
                    license.daysLeft <= 7 ? "secondary" : "outline"
                  }>
                    {license.daysLeft <= 0 ? 'منتهي الصلاحية' : `${license.daysLeft} يوم متبقي`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddLicenseForm({ type, companyId, mainLicenseId, employees, onClose }: any) {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseType: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    description: '',
    employeeId: '',
    notes: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let endpoint = '';
      let data = {};
      
      if (type === 'main') {
        endpoint = `/api/licenses/main`;
        data = { ...formData, companyId };
      } else if (type === 'sub') {
        endpoint = `/api/licenses/sub`;
        data = { ...formData, mainLicenseId };
      } else if (type === 'employee') {
        endpoint = `/api/licenses/assign-employee`;
        data = { 
          employeeId: formData.employeeId,
          licenseId: mainLicenseId,
          notes: formData.notes
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast({
        title: "تم بنجاح",
        description: type === 'main' ? "تم إضافة الترخيص الرئيسي" :
                    type === 'sub' ? "تم إضافة الترخيص الفرعي" :
                    "تم تعيين الموظف للترخيص"
      });

      queryClient.invalidateQueries({ queryKey: [`/api/licenses/main/${companyId}`] });
      onClose();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الحفظ",
        variant: "destructive"
      });
    }
  };

  if (type === 'employee') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>اختر الموظف</Label>
          <Select value={formData.employeeId} onValueChange={(value) => setFormData({...formData, employeeId: value})}>
            <SelectTrigger>
              <SelectValue placeholder="اختر موظف..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee: any) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.fullName} - {employee.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>ملاحظات</Label>
          <Textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="أي ملاحظات إضافية..."
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit">تعيين الموظف</Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رقم الترخيص</Label>
          <Input 
            value={formData.licenseNumber}
            onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
            required
          />
        </div>
        <div>
          <Label>نوع الترخيص</Label>
          <Input 
            value={formData.licenseType}
            onChange={(e) => setFormData({...formData, licenseType: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label>الجهة المصدرة</Label>
        <Input 
          value={formData.issuingAuthority}
          onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>تاريخ الإصدار</Label>
          <Input 
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
            required
          />
        </div>
        <div>
          <Label>تاريخ الانتهاء</Label>
          <Input 
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div>
        <Label>الوصف</Label>
        <Textarea 
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="وصف مختصر للترخيص..."
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit">
          {type === 'main' ? 'إضافة الترخيص الرئيسي' : 'إضافة الترخيص الفرعي'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
      </div>
    </form>
  );
}