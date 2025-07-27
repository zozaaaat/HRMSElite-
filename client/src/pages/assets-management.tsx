import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Settings,
  FileText,
  Download,
} from "lucide-react";
import type { Asset, InsertAsset, AssetMaintenance, AssetTransfer } from "@shared/schema";

const assetSchema = z.object({
  name: z.string().min(2, "اسم الأصل مطلوب"),
  description: z.string().optional(),
  assetCode: z.string().min(3, "رمز الأصل مطلوب"),
  type: z.enum(["equipment", "vehicle", "furniture", "electronics", "software", "other"]),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  currentValue: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "retired", "lost", "damaged"]).default("available"),
  condition: z.string().default("good"),
  notes: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const maintenanceSchema = z.object({
  assetId: z.string(),
  type: z.enum(["preventive", "corrective", "emergency", "upgrade"]),
  title: z.string().min(3, "عنوان الصيانة مطلوب"),
  description: z.string().optional(),
  scheduledDate: z.string(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  cost: z.string().optional(),
  vendor: z.string().optional(),
  performedBy: z.string().optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export default function AssetsManagement() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("assets");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["/api/assets"],
  });

  // Fetch employees for assignment
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  // Asset form
  const assetForm = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "available",
      condition: "good",
    },
  });

  // Maintenance form
  const maintenanceForm = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: "preventive",
      priority: "medium",
    },
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      return apiRequest("/api/assets", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الأصل بنجاح",
        description: "تم إضافة الأصل الجديد إلى النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      assetForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الأصل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Schedule maintenance mutation
  const scheduleMaintenanceMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      return apiRequest("/api/asset-maintenance", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "تم جدولة الصيانة بنجاح",
        description: "تم إضافة مهمة الصيانة إلى الجدول",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      maintenanceForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في جدولة الصيانة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter assets
  const filteredAssets = (assets as Asset[]).filter((asset: Asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    total: (assets as Asset[]).length,
    available: (assets as Asset[]).filter((a: Asset) => a.status === "available").length,
    inUse: (assets as Asset[]).filter((a: Asset) => a.status === "in_use").length,
    maintenance: (assets as Asset[]).filter((a: Asset) => a.status === "maintenance").length,
    value: (assets as Asset[]).reduce((sum: number, asset: Asset) => sum + (parseFloat(asset.currentValue || "0")), 0),
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">متاح</Badge>;
      case "in_use":
        return <Badge className="bg-blue-100 text-blue-800">قيد الاستخدام</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">صيانة</Badge>;
      case "retired":
        return <Badge className="bg-gray-100 text-gray-800">متقاعد</Badge>;
      case "lost":
        return <Badge className="bg-red-100 text-red-800">مفقود</Badge>;
      case "damaged":
        return <Badge className="bg-orange-100 text-orange-800">تالف</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "equipment":
        return <Wrench className="h-4 w-4" />;
      case "vehicle":
        return <Package className="h-4 w-4" />;
      case "electronics":
        return <Settings className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الأصول والمعدات</h1>
          <p className="text-gray-600 mt-2">نظام شامل لإدارة أصول ومعدات الشركة</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة أصل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة أصل جديد</DialogTitle>
              </DialogHeader>
              <form onSubmit={assetForm.handleSubmit((data) => createAssetMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم الأصل *</Label>
                    <Input {...assetForm.register("name")} placeholder="اسم الأصل" />
                    {assetForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{assetForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="assetCode">رمز الأصل *</Label>
                    <Input {...assetForm.register("assetCode")} placeholder="AST-001" />
                    {assetForm.formState.errors.assetCode && (
                      <p className="text-sm text-red-500">{assetForm.formState.errors.assetCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">نوع الأصل *</Label>
                    <Select onValueChange={(value) => assetForm.setValue("type", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipment">معدات</SelectItem>
                        <SelectItem value="vehicle">مركبات</SelectItem>
                        <SelectItem value="furniture">أثاث</SelectItem>
                        <SelectItem value="electronics">إلكترونيات</SelectItem>
                        <SelectItem value="software">برمجيات</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">الحالة</Label>
                    <Select onValueChange={(value) => assetForm.setValue("status", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">متاح</SelectItem>
                        <SelectItem value="in_use">قيد الاستخدام</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="retired">متقاعد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">الماركة</Label>
                    <Input {...assetForm.register("brand")} placeholder="الماركة" />
                  </div>
                  <div>
                    <Label htmlFor="model">الموديل</Label>
                    <Input {...assetForm.register("model")} placeholder="الموديل" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">الموقع</Label>
                    <Input {...assetForm.register("location")} placeholder="المكتب الرئيسي - الطابق الأول" />
                  </div>
                  <div>
                    <Label htmlFor="department">القسم</Label>
                    <Input {...assetForm.register("department")} placeholder="تقنية المعلومات" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea {...assetForm.register("description")} placeholder="وصف تفصيلي للأصل" />
                </div>

                <Button type="submit" className="w-full" disabled={createAssetMutation.isPending}>
                  {createAssetMutation.isPending ? "جاري الإضافة..." : "إضافة الأصل"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي الأصول</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">متاح</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">قيد الاستخدام</p>
                <p className="text-2xl font-bold">{stats.inUse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">صيانة</p>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-bold">{stats.value.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">الأصول</TabsTrigger>
          <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
          <TabsTrigger value="transfers">النقل</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الأصول..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="in_use">قيد الاستخدام</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="retired">متقاعد</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="فلترة بالنوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="equipment">معدات</SelectItem>
                    <SelectItem value="vehicle">مركبات</SelectItem>
                    <SelectItem value="furniture">أثاث</SelectItem>
                    <SelectItem value="electronics">إلكترونيات</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  تصدير
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الأصول</CardTitle>
            </CardHeader>
            <CardContent>
              {assetsLoading ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الرمز</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الموقع</TableHead>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>القيمة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset: Asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono">{asset.assetCode}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(asset.type)}
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              <p className="text-sm text-gray-500">{asset.brand} {asset.model}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell>{asset.location || "-"}</TableCell>
                        <TableCell>{asset.assignedTo || "-"}</TableCell>
                        <TableCell>{asset.currentValue ? `${parseFloat(asset.currentValue).toLocaleString()} ر.س` : "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                                  <Wrench className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>جدولة صيانة - {asset.name}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={maintenanceForm.handleSubmit((data) => {
                                  scheduleMaintenanceMutation.mutate({
                                    ...data,
                                    assetId: asset.id || "",
                                  });
                                })} className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="type">نوع الصيانة</Label>
                                      <Select onValueChange={(value) => maintenanceForm.setValue("type", value as any)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="preventive">وقائية</SelectItem>
                                          <SelectItem value="corrective">تصحيحية</SelectItem>
                                          <SelectItem value="emergency">طارئة</SelectItem>
                                          <SelectItem value="upgrade">ترقية</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="priority">الأولوية</Label>
                                      <Select onValueChange={(value) => maintenanceForm.setValue("priority", value as any)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="اختر الأولوية" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">منخفضة</SelectItem>
                                          <SelectItem value="medium">متوسطة</SelectItem>
                                          <SelectItem value="high">عالية</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="title">عنوان الصيانة</Label>
                                    <Input {...maintenanceForm.register("title")} placeholder="عنوان مهمة الصيانة" />
                                  </div>
                                  <div>
                                    <Label htmlFor="scheduledDate">موعد الصيانة</Label>
                                    <Input type="date" {...maintenanceForm.register("scheduledDate")} />
                                  </div>
                                  <div>
                                    <Label htmlFor="description">الوصف</Label>
                                    <Textarea {...maintenanceForm.register("description")} placeholder="وصف مهمة الصيانة" />
                                  </div>
                                  <Button type="submit" className="w-full" disabled={scheduleMaintenanceMutation.isPending}>
                                    {scheduleMaintenanceMutation.isPending ? "جاري الجدولة..." : "جدولة الصيانة"}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جدولة الصيانة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                سيتم عرض مهام الصيانة المجدولة هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>نقل الأصول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                سيتم عرض عمليات نقل الأصول هنا
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير الأصول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>تقرير الاستخدام</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>تقرير القيمة</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span>تقرير الصيانة</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}