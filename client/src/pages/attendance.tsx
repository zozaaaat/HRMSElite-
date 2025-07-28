import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  Calendar,
  Users,
  UserCheck,
  UserX,
  Timer,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  workingHours?: string;
  overtime?: string;
  location?: string;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // جلب إحصائيات الحضور اليوم
  const { data: todayStats } = useQuery<AttendanceStats>({
    queryKey: ["/api/attendance/today"],
  });

  // تسجيل الحضور
  const checkInMutation = useMutation({
    mutationFn: (employeeId: string) => 
      apiRequest("/api/attendance/checkin", "POST", { employeeId }),
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الحضور",
        description: `تم التسجيل في الساعة ${data.time}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
    },
  });

  // تسجيل الانصراف
  const checkOutMutation = useMutation({
    mutationFn: (employeeId: string) => 
      apiRequest("/api/attendance/checkout", "POST", { employeeId }),
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الانصراف",
        description: `تم التسجيل في الساعة ${data.time} - إجمالي ساعات العمل: ${data.workingHours}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/today"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      present: { label: "حاضر", variant: "default" as const, color: "text-green-600" },
      absent: { label: "غائب", variant: "destructive" as const, color: "text-red-600" },
      late: { label: "متأخر", variant: "secondary" as const, color: "text-orange-600" },
      leave: { label: "إجازة", variant: "outline" as const, color: "text-blue-600" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.present;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // بيانات تجريبية لسجلات الحضور
  const mockAttendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      employeeName: "أحمد محمد علي",
      checkIn: "08:30",
      checkOut: "17:15",
      status: "present",
      workingHours: "8.75",
      overtime: "0.75",
      location: "المكتب الرئيسي"
    },
    {
      id: "2",
      employeeName: "فاطمة أحمد سالم",
      checkIn: "09:15",
      checkOut: "17:00",
      status: "late",
      workingHours: "7.75",
      overtime: "0",
      location: "المكتب الرئيسي"
    },
    {
      id: "3",
      employeeName: "محمد عبدالله الحربي",
      checkIn: "08:00",
      status: "present",
      workingHours: "جاري...",
      location: "العمل عن بعد"
    },
    {
      id: "4",
      employeeName: "سارة عبدالرحمن القحطاني",
      status: "leave",
      workingHours: "-",
      location: "إجازة سنوية"
    },
    {
      id: "5",
      employeeName: "خالد سعد المطيري",
      status: "absent",
      workingHours: "-",
      location: "-"
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
            onClick={() => checkInMutation.mutate("current-user")}
            disabled={checkInMutation.isPending}
            className="gap-2"
            variant="default"
          >
            <CheckCircle className="h-4 w-4" />
            تسجيل حضور
          </Button>
          
          <Button 
            onClick={() => checkOutMutation.mutate("current-user")}
            disabled={checkOutMutation.isPending}
            className="gap-2"
            variant="outline"
          >
            <Clock className="h-4 w-4" />
            تسجيل انصراف
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
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
              {todayStats?.currentTime || new Date().toLocaleTimeString('ar-SA')}
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
            <div className="text-2xl font-bold">{todayStats?.totalEmployees || 167}</div>
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
            <div className="text-2xl font-bold text-green-600">{todayStats?.present || 142}</div>
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
            <div className="text-2xl font-bold text-red-600">{todayStats?.absent || 8}</div>
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
            <div className="text-2xl font-bold text-orange-600">{todayStats?.late || 5}</div>
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
            <div className="text-2xl font-bold text-blue-600">{todayStats?.onLeave || 12}</div>
            <p className="text-xs text-muted-foreground">7% من الموظفين</p>
          </CardContent>
        </Card>
      </div>

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
              <CardTitle>سجل الحضور - {format(new Date(), "dd MMMM yyyy", { locale: ar })}</CardTitle>
              <CardDescription>
                تفاصيل حضور وانصراف جميع الموظفين لليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الموظف</TableHead>
                    <TableHead className="text-right">تسجيل الدخول</TableHead>
                    <TableHead className="text-right">تسجيل الخروج</TableHead>
                    <TableHead className="text-right">ساعات العمل</TableHead>
                    <TableHead className="text-right">الساعات الإضافية</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.employeeName}</TableCell>
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
                        {record.overtime && record.overtime !== "0" ? (
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
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">تقارير الحضور المتقدمة</h3>
                <p className="text-muted-foreground">
                  تقارير مفصلة وتحليلات عميقة لأنماط الحضور
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}