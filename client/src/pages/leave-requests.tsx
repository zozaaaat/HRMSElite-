import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar as CalendarIcon,
  Plus,
  Search,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  requestDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface LeaveBalance {
  annual: number;
  sick: number;
  emergency: number;
  usedAnnual: number;
  usedSick: number;
  usedEmergency: number;
}

export default function LeaveRequestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // نموذج طلب إجازة
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: ""
  });

  // جلب طلبات الإجازات
  const { data: leaveRequests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  // جلب رصيد الإجازات
  const { data: leaveBalance } = useQuery<LeaveBalance>({
    queryKey: ["/api/leave-balance"],
  });

  // إرسال طلب إجازة
  const submitLeaveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/leave-requests", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب الإجازة بنجاح",
      });
      setIsDialogOpen(false);
      setFormData({
        leaveType: "",
        startDate: undefined,
        endDate: undefined,
        reason: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
  });

  // الموافقة على طلب
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/leave-requests/${id}/approve`, "PATCH");
    },
    onSuccess: () => {
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على طلب الإجازة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
  });

  // رفض طلب
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest(`/api/leave-requests/${id}/reject`, "PATCH", { reason });
    },
    onSuccess: () => {
      toast({
        title: "تم الرفض",
        description: "تم رفض طلب الإجازة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد المراجعة", variant: "secondary" },
      approved: { label: "موافق عليه", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: "إجازة سنوية",
      sick: "إجازة مرضية",
      emergency: "إجازة طارئة",
      maternity: "إجازة أمومة",
      unpaid: "إجازة بدون راتب"
    };
    return types[type] || type;
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === "all" || request.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">طلبات الإجازات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة طلبات الإجازات والموافقات
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديد</DialogTitle>
              <DialogDescription>
                املأ البيانات المطلوبة لتقديم طلب إجازة
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">نوع الإجازة</Label>
                <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">إجازة سنوية</SelectItem>
                    <SelectItem value="sick">إجازة مرضية</SelectItem>
                    <SelectItem value="emergency">إجازة طارئة</SelectItem>
                    <SelectItem value="maternity">إجازة أمومة</SelectItem>
                    <SelectItem value="unpaid">إجازة بدون راتب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-right",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">سبب الإجازة</Label>
                <Textarea
                  id="reason"
                  placeholder="اذكر سبب طلب الإجازة..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => submitLeaveMutation.mutate(formData)}
                disabled={!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason}
              >
                إرسال الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* رصيد الإجازات */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الإجازة السنوية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaveBalance.annual - leaveBalance.usedAnnual} / {leaveBalance.annual}
              </div>
              <p className="text-xs text-muted-foreground mt-1">يوم متبقي</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الإجازة المرضية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaveBalance.sick - leaveBalance.usedSick} / {leaveBalance.sick}
              </div>
              <p className="text-xs text-muted-foreground mt-1">يوم متبقي</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الإجازة الطارئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leaveBalance.emergency - leaveBalance.usedEmergency} / {leaveBalance.emergency}
              </div>
              <p className="text-xs text-muted-foreground mt-1">يوم متبقي</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* طلبات الإجازات */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
            <TabsTrigger value="approved">الموافق عليها</TabsTrigger>
            <TabsTrigger value="rejected">المرفوضة</TabsTrigger>
            <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9 w-64"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">نوع الإجازة</TableHead>
                  <TableHead className="text-right">من تاريخ</TableHead>
                  <TableHead className="text-right">إلى تاريخ</TableHead>
                  <TableHead className="text-right">المدة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات إجازات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => {
                    const startDate = new Date(request.startDate);
                    const endDate = new Date(request.endDate);
                    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.employeeName}</TableCell>
                        <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                        <TableCell>{format(startDate, "dd/MM/yyyy")}</TableCell>
                        <TableCell>{format(endDate, "dd/MM/yyyy")}</TableCell>
                        <TableCell>{days} يوم</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تفاصيل طلب الإجازة</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm font-medium">السبب:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                                  </div>
                                  {request.approvedBy && (
                                    <div>
                                      <p className="text-sm font-medium">تمت الموافقة بواسطة:</p>
                                      <p className="text-sm text-muted-foreground mt-1">{request.approvedBy}</p>
                                    </div>
                                  )}
                                  {request.rejectionReason && (
                                    <div>
                                      <p className="text-sm font-medium">سبب الرفض:</p>
                                      <p className="text-sm text-muted-foreground mt-1">{request.rejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {request.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => approveMutation.mutate(request.id)}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => rejectMutation.mutate({ id: request.id, reason: "سبب الرفض" })}
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}