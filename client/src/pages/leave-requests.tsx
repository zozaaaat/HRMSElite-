import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  FileText,
  Filter,
  Eye
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
}

interface LeaveBalance {
  annual: number;
  used: number;
  remaining: number;
  sick: number;
  emergency: number;
}

export default function LeaveRequestsPage() {
  return (
    <SharedLayout 
      userRole="employee" 
      userName="أحمد محمد علي" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <LeaveRequestsContent />
    </SharedLayout>
  );
}

function LeaveRequestsContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [newRequest, setNewRequest] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // جلب طلبات الإجازات
  const { data: leaveRequests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["/api/leave-requests"],
  });

  // جلب رصيد الإجازات للموظف الحالي
  const { data: leaveBalance } = useQuery<LeaveBalance>({
    queryKey: ["/api/leave-balance/current-user"],
  });

  // إرسال طلب إجازة جديد
  const submitRequestMutation = useMutation({
    mutationFn: (requestData: any) => 
      apiRequest("/api/leave-requests", "POST", requestData),
    onSuccess: () => {
      toast({
        title: "تم إرسال الطلب",
        description: "تم إرسال طلب الإجازة بنجاح وهو قيد المراجعة",
      });
      setIsNewRequestOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { 
        label: "قيد المراجعة", 
        variant: "secondary" as const, 
        icon: Clock,
        color: "text-orange-600"
      },
      approved: { 
        label: "موافق", 
        variant: "default" as const, 
        icon: CheckCircle,
        color: "text-green-600"
      },
      rejected: { 
        label: "مرفوض", 
        variant: "destructive" as const, 
        icon: XCircle,
        color: "text-red-600"
      }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    const StatusIcon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="gap-1">
        <StatusIcon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      annual: "إجازة سنوية",
      sick: "إجازة مرضية",
      emergency: "إجازة طارئة",
      maternity: "إجازة أمومة",
      paternity: "إجازة أبوة",
      study: "إجازة دراسية",
      unpaid: "إجازة بدون راتب"
    };
    return typeMap[type] || type;
  };

  const handleSubmitRequest = () => {
    if (!newRequest.leaveType || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const startDate = new Date(newRequest.startDate);
    const endDate = new Date(newRequest.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    submitRequestMutation.mutate({
      ...newRequest,
      days: daysDiff,
      employeeId: "current-user"
    });
  };

  // بيانات تجريبية إضافية للطلبات
  const mockRequests: LeaveRequest[] = [
    ...leaveRequests || [],
    {
      id: "3",
      employeeName: "محمد عبدالله الحربي",
      leaveType: "annual",
      startDate: "2025-02-10",
      endDate: "2025-02-14",
      days: 5,
      reason: "قضاء عطلة مع العائلة",
      status: "pending",
      appliedDate: "2025-01-28"
    },
    {
      id: "4",
      employeeName: "سارة عبدالرحمن القحطاني",
      leaveType: "sick",
      startDate: "2025-01-29",
      endDate: "2025-01-30",
      days: 2,
      reason: "مراجعة طبية",
      status: "approved",
      appliedDate: "2025-01-28",
      approvedBy: "أحمد محمد علي"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">طلبات الإجازات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة طلبات الإجازات ومتابعة الرصيد المتاح
          </p>
        </div>
        
        <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديد</DialogTitle>
              <DialogDescription>
                قم بتعبئة تفاصيل طلب الإجازة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leave-type">نوع الإجازة</Label>
                <Select 
                  value={newRequest.leaveType} 
                  onValueChange={(value) => setNewRequest({ ...newRequest, leaveType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">إجازة سنوية</SelectItem>
                    <SelectItem value="sick">إجازة مرضية</SelectItem>
                    <SelectItem value="emergency">إجازة طارئة</SelectItem>
                    <SelectItem value="maternity">إجازة أمومة</SelectItem>
                    <SelectItem value="paternity">إجازة أبوة</SelectItem>
                    <SelectItem value="study">إجازة دراسية</SelectItem>
                    <SelectItem value="unpaid">إجازة بدون راتب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">تاريخ البداية</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">تاريخ النهاية</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">سبب الإجازة</Label>
                <Textarea
                  id="reason"
                  placeholder="اذكر سبب طلب الإجازة..."
                  rows={3}
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleSubmitRequest}
                disabled={submitRequestMutation.isPending}
                className="w-full"
              >
                {submitRequestMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* بطاقات رصيد الإجازات - فقط للإداريين */}
      {/* هذه البطاقات مخفية للعمال العاديين */}

      <Tabs defaultValue="my-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-requests">طلباتي</TabsTrigger>
          <TabsTrigger value="all-requests">جميع الطلبات</TabsTrigger>
          <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
        </TabsList>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>طلبات الإجازة الخاصة بي</CardTitle>
              <CardDescription>
                جميع طلباتك السابقة والحالية للإجازات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نوع الإجازة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المدة</TableHead>
                    <TableHead className="text-right">السبب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">تاريخ التقديم</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRequests.slice(0, 3).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {getLeaveTypeLabel(request.leaveType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(request.startDate), "dd/MM/yyyy")}</div>
                          <div className="text-muted-foreground">إلى {format(new Date(request.endDate), "dd/MM/yyyy")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{request.days} أيام</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate">{request.reason}</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(request.appliedDate), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-requests">
          <Card>
            <CardHeader>
              <CardTitle>جميع طلبات الإجازات</CardTitle>
              <CardDescription>
                طلبات الإجازة من جميع الموظفين في الشركة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">نوع الإجازة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">المدة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getLeaveTypeLabel(request.leaveType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(request.startDate), "dd/MM")} - {format(new Date(request.endDate), "dd/MM")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{request.days} أيام</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {request.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="icon" className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">الطلبات قيد المراجعة</h3>
                <p className="text-muted-foreground mb-4">
                  {mockRequests.filter(r => r.status === 'pending').length} طلب ينتظر الموافقة
                </p>
                <Button>مراجعة الطلبات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">تقويم الإجازات</h3>
                <p className="text-muted-foreground">
                  عرض جميع الإجازات على التقويم الشهري
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}