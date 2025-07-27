import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Plus,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/employees/stats"],
  });

  // Mock data for demonstration
  const mockEmployees = [
    {
      id: 1,
      name: "أحمد محمد العلي",
      email: "ahmed.ali@company.com",
      phone: "+966 50 123 4567",
      position: "مطور برمجيات",
      department: "تقنية المعلومات",
      company: "شركة التقنية المتقدمة",
      status: "active",
      joinDate: "2023-01-15",
      salary: 8500,
      avatar: "",
      performance: 92
    },
    {
      id: 2,
      name: "فاطمة أحمد السعيد",
      email: "fatima.said@company.com", 
      phone: "+966 55 987 6543",
      position: "محاسبة",
      department: "المالية",
      company: "الشركة التجارية",
      status: "active",
      joinDate: "2022-08-20",
      salary: 7200,
      avatar: "",
      performance: 88
    },
    {
      id: 3,
      name: "خالد عبدالله النمر",
      email: "khalid.tiger@company.com",
      phone: "+966 56 456 7890",
      position: "مدير المشاريع",
      department: "العمليات",
      company: "المؤسسة الصناعية",
      status: "on_leave",
      joinDate: "2021-03-10",
      salary: 12000,
      avatar: "",
      performance: 95
    }
  ];

  const mockStats = {
    total: 156,
    active: 142,
    onLeave: 8,
    inactive: 6,
    newThisMonth: 12,
    avgSalary: 8750,
    avgPerformance: 87
  };

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "on_leave": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "نشط";
      case "on_leave": return "في إجازة";
      case "inactive": return "غير نشط";
      default: return "غير محدد";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
          <p className="text-muted-foreground mt-2">إدارة شاملة لجميع الموظفين عبر الشركات</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          إضافة موظف جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{mockStats.total}</div>
            <div className="text-xs text-blue-600">إجمالي الموظفين</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{mockStats.active}</div>
            <div className="text-xs text-green-600">نشط</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{mockStats.onLeave}</div>
            <div className="text-xs text-yellow-600">في إجازة</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{mockStats.inactive}</div>
            <div className="text-xs text-red-600">غير نشط</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{mockStats.newThisMonth}</div>
            <div className="text-xs text-purple-600">جديد هذا الشهر</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-indigo-700">{mockStats.avgSalary.toLocaleString()}</div>
            <div className="text-xs text-indigo-600">متوسط الراتب</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-pink-700">{mockStats.avgPerformance}%</div>
            <div className="text-xs text-pink-600">متوسط الأداء</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الموظفين..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="on_leave">في إجازة</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                <SelectItem value="المالية">المالية</SelectItem>
                <SelectItem value="العمليات">العمليات</SelectItem>
                <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                <SelectItem value="التسويق">التسويق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {employee.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <Badge className={`text-xs mt-1 ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="line-clamp-1">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-1">{employee.company}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{employee.salary.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">الراتب (ريال)</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getPerformanceColor(employee.performance)}`}>
                    {employee.performance}%
                  </div>
                  <div className="text-xs text-muted-foreground">تقييم الأداء</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="default" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 ml-2" />
                  عرض الملف
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                انضم في: {new Date(employee.joinDate).toLocaleDateString('ar-SA')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium mb-2">لا توجد موظفين</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                ? "لا توجد موظفين تطابق معايير البحث"
                : "لم يتم تسجيل أي موظفين بعد"}
            </p>
            <Button>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}