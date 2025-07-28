import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Shield, 
  Settings, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  Check, 
  X,
  Users,
  FileText,
  DollarSign,
  Package,
  ClipboardList,
  UserCheck
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function PermissionsManagement() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: adminEmployees = [] } = useQuery({
    queryKey: ['/api/administrative-employees'],
  });

  const { data: permissions = {} } = useQuery({
    queryKey: ['/api/permissions', selectedEmployee],
    enabled: !!selectedEmployee,
  });

  // مجموعات الصلاحيات الأساسية
  const permissionGroups = [
    {
      id: "hr",
      nameAr: "الموارد البشرية",
      icon: Users,
      color: "bg-blue-500",
      permissions: [
        { key: "employees_view", nameAr: "عرض بيانات الموظفين" },
        { key: "employees_create", nameAr: "إضافة موظفين جدد" },
        { key: "employees_edit", nameAr: "تعديل بيانات الموظفين" },
        { key: "employees_delete", nameAr: "حذف الموظفين" },
        { key: "leaves_approve", nameAr: "الموافقة على الإجازات" },
        { key: "payroll_process", nameAr: "معالجة الرواتب" },
        { key: "violations_manage", nameAr: "إدارة المخالفات" }
      ]
    },
    {
      id: "accounting",
      nameAr: "المحاسبة",
      icon: DollarSign,
      color: "bg-green-500",
      permissions: [
        { key: "financial_view", nameAr: "عرض التقارير المالية" },
        { key: "invoices_create", nameAr: "إنشاء الفواتير" },
        { key: "expenses_approve", nameAr: "اعتماد المصروفات" },
        { key: "budgets_manage", nameAr: "إدارة الميزانيات" },
        { key: "taxes_process", nameAr: "معالجة الضرائب" },
        { key: "financial_export", nameAr: "تصدير البيانات المالية" }
      ]
    },
    {
      id: "inventory",
      nameAr: "المستودعات",
      icon: Package,
      color: "bg-purple-500",
      permissions: [
        { key: "inventory_view", nameAr: "عرض المخزون" },
        { key: "items_add", nameAr: "إضافة أصناف جديدة" },
        { key: "stock_adjust", nameAr: "تعديل الكميات" },
        { key: "orders_approve", nameAr: "اعتماد الطلبات" },
        { key: "suppliers_manage", nameAr: "إدارة الموردين" }
      ]
    },
    {
      id: "reports",
      nameAr: "التقارير",
      icon: FileText,
      color: "bg-orange-500",
      permissions: [
        { key: "reports_view", nameAr: "عرض التقارير" },
        { key: "reports_create", nameAr: "إنشاء تقارير مخصصة" },
        { key: "reports_export", nameAr: "تصدير التقارير" },
        { key: "analytics_access", nameAr: "الوصول للتحليلات" }
      ]
    },
    {
      id: "purchasing",
      nameAr: "المشتريات",
      icon: ClipboardList,
      color: "bg-indigo-500",
      permissions: [
        { key: "purchases_view", nameAr: "عرض المشتريات" },
        { key: "orders_create", nameAr: "إنشاء طلبات الشراء" },
        { key: "orders_approve", nameAr: "اعتماد الطلبات" },
        { key: "vendors_manage", nameAr: "إدارة البائعين" }
      ]
    }
  ];

  const updatePermissionsMutation = useMutation({
    mutationFn: async (data: { employeeId: string; permissions: any }) => {
      const response = await fetch(`/api/permissions/${data.employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.permissions)
      });
      if (!response.ok) throw new Error('فشل في تحديث الصلاحيات');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "نجح التحديث",
        description: "تم تحديث صلاحيات الموظف بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/permissions'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الصلاحيات",
        variant: "destructive"
      });
    }
  });

  const handlePermissionChange = (groupId: string, permissionKey: string, enabled: boolean) => {
    const updatedPermissions = {
      ...permissions,
      [groupId]: {
        ...permissions[groupId],
        [permissionKey]: enabled
      }
    };

    updatePermissionsMutation.mutate({
      employeeId: selectedEmployee,
      permissions: updatedPermissions
    });
  };

  const createPermissionTemplate = () => {
    console.log('إنشاء قالب صلاحيات جديد');
    toast({
      title: "قريباً",
      description: "ميزة قوالب الصلاحيات ستكون متاحة قريباً"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة صلاحيات الموظفين الإداريين</h1>
          <p className="text-muted-foreground">
            تخصيص الصلاحيات لكل موظف إداري حسب وظيفته ومسؤولياته
          </p>
        </div>
        <Button onClick={createPermissionTemplate}>
          <Plus className="h-4 w-4 ml-2" />
          قالب صلاحيات جديد
        </Button>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            اختيار الموظف الإداري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>الموظف الإداري</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف الإداري" />
                </SelectTrigger>
                <SelectContent>
                  {adminEmployees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {employee.fullName} - {employee.jobTitle}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              {selectedEmployee && (
                <Badge variant="outline" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  موظف إداري مُختار
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Management */}
      {selectedEmployee && (
        <Card>
          <CardHeader>
            <CardTitle>تخصيص الصلاحيات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={permissionGroups[0].id}>
              <TabsList className="grid grid-cols-5 w-full">
                {permissionGroups.map((group) => {
                  const IconComponent = group.icon;
                  return (
                    <TabsTrigger key={group.id} value={group.id} className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {group.nameAr}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {permissionGroups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <TabsContent key={group.id} value={group.id} className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 ${group.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{group.nameAr}</h3>
                        <p className="text-muted-foreground">
                          إدارة صلاحيات {group.nameAr} للموظف المحدد
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.permissions.map((permission) => (
                        <Card key={permission.key} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-base font-medium">
                                {permission.nameAr}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                صلاحية {permission.nameAr.toLowerCase()}
                              </p>
                            </div>
                            <Switch
                              checked={permissions[group.id]?.[permission.key] || false}
                              onCheckedChange={(enabled) => 
                                handlePermissionChange(group.id, permission.key, enabled)
                              }
                              disabled={updatePermissionsMutation.isPending}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">مُفعل</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">غير مُفعل</span>
                      </div>
                      <div className="mr-auto">
                        <span className="text-sm text-muted-foreground">
                          {Object.values(permissions[group.id] || {}).filter(Boolean).length} من {group.permissions.length} مُفعلة
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!selectedEmployee && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">اختر موظفاً إدارياً</h3>
            <p className="text-muted-foreground">
              قم بتحديد موظف إداري من القائمة أعلاه لتخصيص صلاحياته
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}