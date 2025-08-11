import {useState} from 'react';
import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Textarea} from '../components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
// Removed unused Popover components
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from '../components/ui/dialog';
import {useToast} from '../hooks/use-toast';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiRequest} from '@/lib/queryClient';
import {format} from 'date-fns';
// Removed unused locale and DateRange type
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  
} from 'lucide-react';
import {SharedLayout} from '../components/shared-layout';
import {LoadingSpinner, ErrorMessage} from '../components/shared';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number;
  monthlyTrend: {
    month: string;
    requests: number;
    approved: number;
    rejected: number;
  }[];
}

interface AttendanceReport {
  employeeName: string;
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  workingHours?: number;
  overtime?: number;
  lateMinutes?: number;
  absenceReason?: string;
}

export default function LeavesPage () {

  return (
    <SharedLayout
      userRole="employee"
      userName="أحمد محمد علي"
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <LeavesContent />
    </SharedLayout>
  );

}

function LeavesContent () {

  const {toast} = useToast();
  const queryClient = useQueryClient();
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  // Removed unused local date states
  const [newRequest, setNewRequest] = useState({
    'leaveType': '',
    'startDate': '',
    'endDate': '',
    'reason': ''
  });

  // جلب طلبات الإجازات
  const {'data': _leaveRequests, isLoading, error} = useQuery<LeaveRequest[]>({
    'queryKey': ['/api/leaves']
  });

  // جلب إحصائيات الإجازات
  const {'data': leaveStats, 'isLoading': statsLoading} = useQuery<LeaveStats>({
    'queryKey': ['/api/leaves/stats']
  });

  // جلب تقارير الحضور والغياب
  const {'data': _attendanceReports, 'isLoading': attendanceLoading} = useQuery<AttendanceReport[]>({
    'queryKey': ['/api/attendance/reports']
  });

  // إرسال طلب إجازة جديد
  const submitRequestMutation = useMutation({
    'mutationFn': (requestData: Record<string, unknown>) =>
      apiRequest('/api/leaves', 'POST', requestData),
    'onSuccess': () => {

      toast({
        'title': 'تم إرسال الطلب',
        'description': 'تم إرسال طلب الإجازة بنجاح وهو قيد المراجعة'
      });
      setIsNewRequestOpen(false);
      setNewRequest({'leaveType': '', 'startDate': '', 'endDate': '', 'reason': ''});
      queryClient.invalidateQueries({'queryKey': ['/api/leaves']});

    }
  });

  // الموافقة على طلب إجازة
  const approveLeaveMutation = useMutation({
    'mutationFn': (leaveId: string) =>
      apiRequest(`/api/leaves/${leaveId}/approve`, 'PUT'),
    'onSuccess': () => {

      toast({
        'title': 'تمت الموافقة',
        'description': 'تمت الموافقة على طلب الإجازة بنجاح'
      });
      queryClient.invalidateQueries({'queryKey': ['/api/leaves']});

    }
  });

  // رفض طلب إجازة
  const rejectLeaveMutation = useMutation({
    'mutationFn': ({leaveId, reason}: { leaveId: string; reason: string }) =>
      apiRequest(`/api/leaves/${leaveId}/reject`, 'PUT', {reason}),
    'onSuccess': () => {

      toast({
        'title': 'تم الرفض',
        'description': 'تم رفض طلب الإجازة'
      });
      queryClient.invalidateQueries({'queryKey': ['/api/leaves']});

    }
  });

  const getStatusBadge = (status: string) => {

    const statusMap = {
      'pending': {
        'label': 'قيد المراجعة',
        'variant': 'secondary' as const,
        'icon': Clock,
        'color': 'text-orange-600'
      },
      'approved': {
        'label': 'موافق',
        'variant': 'default' as const,
        'icon': CheckCircle,
        'color': 'text-green-600'
      },
      'rejected': {
        'label': 'مرفوض',
        'variant': 'destructive' as const,
        'icon': XCircle,
        'color': 'text-red-600'
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
      'annual': 'إجازة سنوية',
      'sick': 'إجازة مرضية',
      'emergency': 'إجازة طارئة',
      'maternity': 'إجازة أمومة',
      'paternity': 'إجازة أبوة',
      'study': 'إجازة دراسية',
      'unpaid': 'إجازة بدون راتب'
    };
    return typeMap[type] ?? type;

  };

  const getAttendanceStatusBadge = (status: string) => {

    const statusMap = {
      'present': {'label': 'حاضر', 'variant': 'default' as const, 'color': 'text-green-600'},
      'absent': {'label': 'غائب', 'variant': 'destructive' as const, 'color': 'text-red-600'},
      'late': {'label': 'متأخر', 'variant': 'secondary' as const, 'color': 'text-orange-600'},
      'leave': {'label': 'إجازة', 'variant': 'outline' as const, 'color': 'text-blue-600'}
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.present;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;

  };

  const handleSubmitRequest = () => {

    if (!newRequest.leaveType || !newRequest.startDate || !newRequest.endDate || !newRequest.reason) {

      toast({
        'title': 'خطأ في البيانات',
        'description': 'يرجى تعبئة جميع الحقول المطلوبة',
        'variant': 'destructive'
      });
      return;

    }

    const startDate = new Date(newRequest.startDate);
    const endDate = new Date(newRequest.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    submitRequestMutation.mutate({
      ...newRequest,
      'days': daysDiff,
      'employeeId': 'current-user'
    });

  };

  // بيانات تجريبية
  const mockLeaveRequests: LeaveRequest[] = [
    {
      'id': '1',
      'employeeName': 'أحمد محمد علي',
      'employeeId': 'emp001',
      'leaveType': 'annual',
      'startDate': '2025-02-15',
      'endDate': '2025-02-20',
      'days': 6,
      'reason': 'قضاء عطلة مع العائلة في الخارج',
      'status': 'pending',
      'appliedDate': '2025-01-30'
    },
    {
      'id': '2',
      'employeeName': 'فاطمة أحمد سالم',
      'employeeId': 'emp002',
      'leaveType': 'sick',
      'startDate': '2025-02-01',
      'endDate': '2025-02-03',
      'days': 3,
      'reason': 'مراجعة طبية وإجراء فحوصات',
      'status': 'approved',
      'appliedDate': '2025-01-28',
      'approvedBy': 'مدير الموارد البشرية',
      'approvedDate': '2025-01-29'
    },
    {
      'id': '3',
      'employeeName': 'محمد عبدالله الحربي',
      'employeeId': 'emp003',
      'leaveType': 'emergency',
      'startDate': '2025-01-25',
      'endDate': '2025-01-26',
      'days': 2,
      'reason': 'حالة طارئة في العائلة',
      'status': 'approved',
      'appliedDate': '2025-01-24',
      'approvedBy': 'مدير الموارد البشرية',
      'approvedDate': '2025-01-24'
    },
    {
      'id': '4',
      'employeeName': 'سارة عبدالرحمن القحطاني',
      'employeeId': 'emp004',
      'leaveType': 'annual',
      'startDate': '2025-03-01',
      'endDate': '2025-03-10',
      'days': 10,
      'reason': 'سفر للخارج لقضاء عطلة',
      'status': 'rejected',
      'appliedDate': '2025-01-25',
      'rejectionReason': 'لا يمكن الموافقة على إجازة طويلة في هذا الوقت'
    }
  ];

  const mockAttendanceReports: AttendanceReport[] = [
    {
      'employeeName': 'أحمد محمد علي',
      'employeeId': 'emp001',
      'date': '2025-02-01',
      'status': 'present',
      'checkInTime': '08:30',
      'checkOutTime': '17:15',
      'workingHours': 8.75,
      'overtime': 0.75
    },
    {
      'employeeName': 'فاطمة أحمد سالم',
      'employeeId': 'emp002',
      'date': '2025-02-01',
      'status': 'late',
      'checkInTime': '09:15',
      'checkOutTime': '17:00',
      'workingHours': 7.75,
      'lateMinutes': 45
    },
    {
      'employeeName': 'محمد عبدالله الحربي',
      'employeeId': 'emp003',
      'date': '2025-02-01',
      'status': 'absent',
      'absenceReason': 'إجازة مرضية'
    },
    {
      'employeeName': 'سارة عبدالرحمن القحطاني',
      'employeeId': 'emp004',
      'date': '2025-02-01',
      'status': 'leave',
      'absenceReason': 'إجازة سنوية'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الإجازات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة طلبات الإجازات ومتابعة الحضور والغياب
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
                  onValueChange={(value) => setNewRequest({...newRequest, 'leaveType': value})}
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
                    onChange={(e) => setNewRequest({...newRequest, 'startDate': e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">تاريخ النهاية</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({...newRequest, 'endDate': e.target.value})}
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
                  onChange={(e) => setNewRequest({...newRequest, 'reason': e.target.value})}
                />
              </div>

              <Button
                onClick={handleSubmitRequest}
                disabled={submitRequestMutation.isPending}
                className="w-full"
              >
                {submitRequestMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات سريعة */}
      {!statsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                إجمالي الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{
  leaveStats?.totalRequests ?? mockLeaveRequests.length
}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                قيد المراجعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {
  leaveStats?.pendingRequests ?? mockLeaveRequests.filter(r => r.status === 'pending').length
}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                موافق عليها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
  leaveStats?.approvedRequests ?? mockLeaveRequests.filter(r => r.status === 'approved').length
}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                مرفوضة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {
  leaveStats?.rejectedRequests ?? mockLeaveRequests.filter(r => r.status === 'rejected').length
}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading and Error States */}
      {((isLoading ?? false) || statsLoading || attendanceLoading) && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="جاري تحميل بيانات الإجازات..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorMessage
            error={error}
            title="خطأ في تحميل بيانات الإجازات"
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {!isLoading && !statsLoading && !attendanceLoading && !error && (
        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">طلبات الإجازات</TabsTrigger>
            <TabsTrigger value="attendance">تقارير الحضور</TabsTrigger>
            <TabsTrigger value="reports">التقارير المتقدمة</TabsTrigger>
            <TabsTrigger value="calendar">تقويم الإجازات</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>طلبات الإجازات</CardTitle>
                <CardDescription>
                  إدارة جميع طلبات الإجازات مع إمكانية الموافقة أو الرفض
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
                      <TableHead className="text-right">السبب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ التقديم</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLeaveRequests.map((request) => (
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
                            <div>{format(new Date(request.startDate), 'dd/MM/yyyy')}</div>
                            <div className="text-muted-foreground">إلى {
  format(new Date(request.endDate), 'dd/MM/yyyy')
}</div>
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
                          {format(new Date(request.appliedDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600"
                                  onClick={() => approveLeaveMutation.mutate(request.id)}
                                  disabled={approveLeaveMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600"
                                  onClick={() => rejectLeaveMutation.mutate({
                                    'leaveId': request.id,
                                    'reason': 'غير محدد'
                                  })}
                                  disabled={rejectLeaveMutation.isPending}
                                >
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

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>تقارير الحضور والغياب</CardTitle>
                <CardDescription>
                  متابعة حضور الموظفين وتقارير التأخير والغياب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموظف</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">وقت الدخول</TableHead>
                      <TableHead className="text-right">وقت الخروج</TableHead>
                      <TableHead className="text-right">ساعات العمل</TableHead>
                      <TableHead className="text-right">الساعات الإضافية</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAttendanceReports.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{report.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(report.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {getAttendanceStatusBadge(report.status)}
                        </TableCell>
                        <TableCell>
                          {report.checkInTime ?? "-"}
                        </TableCell>
                        <TableCell>
                          {report.checkOutTime ?? "-"}
                        </TableCell>
                        <TableCell>
                          {report.workingHours ? `${report.workingHours} ساعة` : '-'}
                        </TableCell>
                        <TableCell>
                          {report.overtime && report.overtime > 0 ? (
                            <Badge variant="secondary">{report.overtime} ساعة</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {report.absenceReason ??
                           (report.lateMinutes ? `متأخر ${report.lateMinutes} دقيقة` : '-')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    إحصائيات الإجازات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaveStats?.monthlyTrend?.map((trend, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{trend.month}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-green-600">
                            {trend.approved} موافق
                          </Badge>
                          <Badge variant="outline" className="text-red-600">
                            {trend.rejected} مرفوض
                          </Badge>
                        </div>
                      </div>
                    )) ?? (
                      <div className="text-center text-muted-foreground py-8">
                        لا توجد بيانات متاحة
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    تقرير التأخير والغياب
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متأخرون اليوم</span>
                      <Badge variant="secondary">5 موظفين</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">غائبون اليوم</span>
                      <Badge variant="destructive">3 موظفين</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">في إجازة اليوم</span>
                      <Badge variant="outline">8 موظفين</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط ساعات العمل</span>
                      <Badge variant="default">8.2 ساعة</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
      )}
    </div>
  );

}
