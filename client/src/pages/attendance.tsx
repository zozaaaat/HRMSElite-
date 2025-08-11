import {Button} from '../components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../components/ui/card';
import {Badge} from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {useToast} from '../hooks/use-toast';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiPost} from '@/lib/apiRequest';
import {
  Clock,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Timer,
  MapPin,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import {format} from 'date-fns';
import {ar} from 'date-fns/locale';
import {SharedLayout} from '../components/shared-layout';
import {LoadingSpinner, ErrorMessage} from '../components/shared';

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  totalEmployees: number;
  currentTime: string;
}

interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  workingHours?: string;
  overtime?: string;
  location?: string;
  lateMinutes?: number;
  absenceReason?: string;
  leaveType?: string;
}

export default function AttendancePage () {

  return (
    <SharedLayout
      userRole="employee"
      userName="أحمد محمد علي"
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <AttendanceContent />
    </SharedLayout>
  );

}

function AttendanceContent () {

  const {toast} = useToast();
  const queryClient = useQueryClient();

  // جلب إحصائيات الحضور اليوم
  const {'data': todayStats, isLoading, error} = useQuery<AttendanceStats>({
    'queryKey': ['/api/attendance/today']
  });

  // تسجيل الحضور
  const checkInMutation = useMutation<{ time: string }, Error, string>({
    'mutationFn': (employeeId: string) =>
      apiPost<{ time: string }>('/api/attendance/checkin', {employeeId}),
    'onSuccess': (data) => {

      toast({
        'title': 'تم تسجيل الحضور',
        'description': `تم التسجيل في الساعة ${data.time}`
      });
      queryClient.invalidateQueries({'queryKey': ['/api/attendance/today']});

    }
  });

  // تسجيل الانصراف
  const checkOutMutation = useMutation<{ time: string; workingHours: string }, Error, string>({
    'mutationFn': (employeeId: string) =>
      apiPost<{ time: string; workingHours: string }>('/api/attendance/checkout', {employeeId}),
    'onSuccess': (data) => {

      toast({
        'title': 'تم تسجيل الانصراف',
        'description': `تم التسجيل في الساعة ${
          data.time
} - إجمالي ساعات العمل: ${
          data.workingHours
}`
      });
      queryClient.invalidateQueries({'queryKey': ['/api/attendance/today']});

    }
  });

  const getStatusBadge = (status: string) => {

    const statusMap = {
      'present': {'label': 'حاضر', 'variant': 'default' as const, 'color': 'text-green-600'},
      'absent': {'label': 'غائب', 'variant': 'destructive' as const, 'color': 'text-red-600'},
      'late': {'label': 'متأخر', 'variant': 'secondary' as const, 'color': 'text-orange-600'},
      'leave': {'label': 'إجازة', 'variant': 'outline' as const, 'color': 'text-blue-600'}
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.present;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;

  };

  // بيانات تجريبية لسجلات الحضور
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      'id': '1',
      'employeeName': 'أحمد محمد علي',
      'employeeId': 'emp001',
      'date': '2025-02-01',
      'checkIn': '08:30',
      'checkOut': '17:15',
      'status': 'present',
      'workingHours': '8.75',
      'overtime': '0.75',
      'location': 'المكتب الرئيسي'
    },
    {
      'id': '2',
      'employeeName': 'فاطمة أحمد سالم',
      'employeeId': 'emp002',
      'date': '2025-02-01',
      'checkIn': '09:15',
      'checkOut': '17:00',
      'status': 'late',
      'workingHours': '7.75',
      'overtime': '0',
      'location': 'المكتب الرئيسي',
      'lateMinutes': 45
    },
    {
      'id': '3',
      'employeeName': 'محمد عبدالله الحربي',
      'employeeId': 'emp003',
      'date': '2025-02-01',
      'checkIn': '08:00',
      'status': 'present',
      'workingHours': 'جاري...',
      'location': 'العمل عن بعد'
    },
    {
      'id': '4',
      'employeeName': 'سارة عبدالرحمن القحطاني',
      'employeeId': 'emp004',
      'date': '2025-02-01',
      'status': 'leave',
      'workingHours': '-',
      'location': 'إجازة سنوية',
      'leaveType': 'annual',
      'absenceReason': 'إجازة سنوية'
    },
    {
      'id': '5',
      'employeeName': 'خالد سعد المطيري',
      'employeeId': 'emp005',
      'date': '2025-02-01',
      'status': 'absent',
      'workingHours': '-',
      'location': '-',
      'absenceReason': 'غياب بدون إذن'
    },
    {
      'id': '6',
      'employeeName': 'علي أحمد السالم',
      'employeeId': 'emp006',
      'date': '2025-02-01',
      'checkIn': '08:45',
      'checkOut': '17:30',
      'status': 'late',
      'workingHours': '8.75',
      'overtime': '0.75',
      'location': 'المكتب الرئيسي',
      'lateMinutes': 15
    },
    {
      'id': '7',
      'employeeName': 'نورا محمد العتيبي',
      'employeeId': 'emp007',
      'date': '2025-02-01',
      'status': 'leave',
      'workingHours': '-',
      'location': 'إجازة مرضية',
      'leaveType': 'sick',
      'absenceReason': 'إجازة مرضية'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">نظام الحضور والانصراف</h1>
          <p className="text-muted-foreground mt-2">
            متابعة وإدارة حضور الموظفين اليومي
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => checkInMutation.mutate('current-user')}
            disabled={checkInMutation.isPending}
            className="gap-2"
            variant="default"
          >
            <CheckCircle className="h-4 w-4" />
            تسجيل حضور
          </Button>

          <Button
            onClick={() => checkOutMutation.mutate('current-user')}
            disabled={checkOutMutation.isPending}
            className="gap-2"
            variant="outline"
          >
            <Clock className="h-4 w-4" />
            تسجيل انصراف
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner text="جاري تحميل بيانات الحضور..." />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorMessage
            error={error}
            title="خطأ في تحميل بيانات الحضور"
            onRetry={() => window.location.reload()}
          />
        </div>
      )}

      {/* بطاقات الإحصائيات */}
      {!isLoading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                الوقت الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {todayStats?.currentTime ?? new Date().toLocaleTimeString('ar-SA')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                إجمالي الموظفين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats?.totalEmployees ?? 167}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                حاضر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{todayStats?.present ?? 142}</div>
              <p className="text-xs text-muted-foreground">85% من الموظفين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                غائب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{todayStats?.absent ?? 8}</div>
              <p className="text-xs text-muted-foreground">5% من الموظفين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-orange-600" />
                متأخر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{todayStats?.late ?? 5}</div>
              <p className="text-xs text-muted-foreground">3% من الموظفين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                في إجازة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayStats?.onLeave ?? 12}</div>
              <p className="text-xs text-muted-foreground">7% من الموظفين</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">حضور اليوم</TabsTrigger>
          <TabsTrigger value="weekly">الأسبوع</TabsTrigger>
          <TabsTrigger value="monthly">الشهر</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحضور - {
  format(new Date(), 'dd MMMM yyyy', {
  'locale': ar
})
}</CardTitle>
              <CardDescription>
                تفاصيل حضور وانصراف جميع الموظفين لليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الموظف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">تسجيل الدخول</TableHead>
                    <TableHead className="text-right">تسجيل الخروج</TableHead>
                    <TableHead className="text-right">ساعات العمل</TableHead>
                    <TableHead className="text-right">الساعات الإضافية</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {record.checkIn ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {record.checkIn}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.checkOut ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            {record.checkOut}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">جاري العمل...</span>
                        )}
                      </TableCell>
                      <TableCell>{record.workingHours}</TableCell>
                      <TableCell>
                        {record.overtime && record.overtime !== '0' ? (
                          <Badge variant="secondary">{record.overtime} ساعة</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{record.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.absenceReason ??
                         (record.lateMinutes ? `متأخر ${record.lateMinutes} دقيقة` : '-')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">تقرير الحضور الأسبوعي</h3>
                <p className="text-muted-foreground">
                  إحصائيات وتحليلات الحضور للأسبوع الحالي
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">تقرير الحضور الشهري</h3>
                <p className="text-muted-foreground">
                  ملخص شامل لحضور الموظفين خلال الشهر
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-orange-600" />
                  تقرير التأخير
                </CardTitle>
                <CardDescription>
                  الموظفين المتأخرين اليوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAttendanceRecords
                    .filter(record => record.status === 'late')
                    .map((record) => (
                      <div key={
  record.id
} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            تأخر {record.lateMinutes} دقيقة
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-orange-600">
                          {record.checkIn}
                        </Badge>
                      </div>
                    ))}
                  {mockAttendanceRecords.filter(record => record.status === 'late').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      لا يوجد متأخرين اليوم
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  تقرير الغياب
                </CardTitle>
                <CardDescription>
                  الموظفين الغائبين اليوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAttendanceRecords
                    .filter(record => record.status === 'absent')
                    .map((record) => (
                      <div key={
  record.id
} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.absenceReason ?? "غياب بدون إذن"}
                          </div>
                        </div>
                        <Badge variant="destructive">
                          غائب
                        </Badge>
                      </div>
                    ))}
                  {mockAttendanceRecords.filter(record => record.status === 'absent').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      لا يوجد غائبين اليوم
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  تقرير الإجازات
                </CardTitle>
                <CardDescription>
                  الموظفين في إجازة اليوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAttendanceRecords
                    .filter(record => record.status === 'leave')
                    .map((record) => (
                      <div key={
  record.id
} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">{record.employeeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.leaveType === 'annual' ? 'إجازة سنوية'
                              : record.leaveType === 'sick' ? 'إجازة مرضية'
                                : record.absenceReason ?? "إجازة"}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-600">
                          إجازة
                        </Badge>
                      </div>
                    ))}
                  {mockAttendanceRecords.filter(record => record.status === 'leave').length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      لا يوجد موظفين في إجازة اليوم
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  إحصائيات الحضور
                </CardTitle>
                <CardDescription>
                  ملخص إحصائيات الحضور اليوم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">إجمالي الموظفين</span>
                    <Badge variant="outline">{mockAttendanceRecords.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">حاضرون</span>
                    <Badge variant="default" className="text-green-600">
                      {mockAttendanceRecords.filter(r => r.status === 'present').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">متأخرون</span>
                    <Badge variant="secondary" className="text-orange-600">
                      {mockAttendanceRecords.filter(r => r.status === 'late').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">غائبون</span>
                    <Badge variant="destructive">
                      {mockAttendanceRecords.filter(r => r.status === 'absent').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">في إجازة</span>
                    <Badge variant="outline" className="text-blue-600">
                      {mockAttendanceRecords.filter(r => r.status === 'leave').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

}
