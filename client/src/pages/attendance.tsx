import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  Users,
  Search,
  MapPin,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: string;
  overtimeHours: string;
}

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت الحالي كل ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // جلب سجلات الحضور
  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
  });

  // تسجيل الحضور
  const checkInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/attendance/check-in", "POST");
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل حضورك في ${format(new Date(), "hh:mm a", { locale: ar })}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
  });

  // تسجيل الانصراف
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/attendance/check-out", "POST");
    },
    onSuccess: () => {
      toast({
        title: "تم تسجيل الانصراف",
        description: `تم تسجيل انصرافك في ${format(new Date(), "hh:mm a", { locale: ar })}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      present: { label: "حاضر", variant: "default" },
      absent: { label: "غائب", variant: "destructive" },
      late: { label: "متأخر", variant: "secondary" },
      holiday: { label: "إجازة", variant: "outline" },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب إحصائيات اليوم
  const todayStats = {
    present: attendanceRecords.filter(r => r.status === "present").length,
    absent: attendanceRecords.filter(r => r.status === "absent").length,
    late: attendanceRecords.filter(r => r.status === "late").length,
    onLeave: attendanceRecords.filter(r => r.status === "holiday").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الحضور والانصراف</h1>
          <p className="text-muted-foreground mt-2">
            إدارة حضور وانصراف الموظفين
          </p>
        </div>
        <div className="text-2xl font-mono">
          {format(currentTime, "hh:mm:ss a", { locale: ar })}
        </div>
      </div>

      {/* كارت تسجيل الحضور/الانصراف */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            تسجيل الحضور والانصراف
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => checkInMutation.mutate()}
              disabled={checkInMutation.isPending}
            >
              <LogIn className="h-5 w-5" />
              تسجيل الحضور
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2"
              onClick={() => checkOutMutation.mutate()}
              disabled={checkOutMutation.isPending}
            >
              <LogOut className="h-5 w-5" />
              تسجيل الانصراف
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-background rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>الموقع: المكتب الرئيسي</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(currentTime, "EEEE, dd MMMM yyyy", { locale: ar })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات اليوم */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الحاضرون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الغائبون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">المتأخرون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayStats.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      {/* سجلات الحضور */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">اليوم</TabsTrigger>
          <TabsTrigger value="week">هذا الأسبوع</TabsTrigger>
          <TabsTrigger value="month">هذا الشهر</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>سجلات حضور اليوم</CardTitle>
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
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">وقت الحضور</TableHead>
                    <TableHead className="text-right">وقت الانصراف</TableHead>
                    <TableHead className="text-right">ساعات العمل</TableHead>
                    <TableHead className="text-right">الساعات الإضافية</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا توجد سجلات حضور
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <div className="flex items-center gap-1">
                              <LogIn className="h-3 w-3 text-green-600" />
                              {record.checkIn}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <div className="flex items-center gap-1">
                              <LogOut className="h-3 w-3 text-red-600" />
                              {record.checkOut}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.workHours !== "0" ? (
                            <div className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {record.workHours} ساعة
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.overtimeHours !== "0" ? (
                            <Badge variant="secondary">{record.overtimeHours} ساعة</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">سجلات الأسبوع قيد التطوير...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">سجلات الشهر قيد التطوير...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}