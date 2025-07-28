import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Archive,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Clock,
  UserCheck,
  FileText,
  Download,
  MoreVertical
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'inactive' | 'archived';
  address?: string;
  avatar?: string;
  employeeId: string;
  nationalId: string;
  birthDate?: string;
  emergencyContact?: string;
  workSchedule?: string;
}

interface NewEmployee {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  hireDate: string;
  nationalId: string;
  birthDate: string;
  address: string;
  emergencyContact: string;
}

export default function EmployeesPage() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <EmployeesContent />
    </SharedLayout>
  );
}

function EmployeesContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    nationalId: '',
    birthDate: '',
    address: '',
    emergencyContact: ''
  });

  // جلب الموظفين
  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // إضافة موظف جديد
  const addEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => 
      apiRequest("/api/employees", "POST", employeeData),
    onSuccess: () => {
      toast({
        title: "تم إضافة الموظف",
        description: "تم إضافة الموظف الجديد بنجاح",
      });
      setIsAddEmployeeOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setNewEmployee({
        name: '', email: '', phone: '', position: '', department: '',
        salary: '', hireDate: '', nationalId: '', birthDate: '', address: '', emergencyContact: ''
      });
    },
  });

  // أرشفة موظف
  const archiveEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) => 
      apiRequest(`/api/employees/${employeeId}/archive`, "PATCH"),
    onSuccess: () => {
      toast({
        title: "تم أرشفة الموظف",
        description: "تم نقل الموظف إلى الأرشيف",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "نشط", variant: "default" as const, color: "text-green-600" },
      inactive: { label: "غير نشط", variant: "secondary" as const, color: "text-orange-600" },
      archived: { label: "مؤرشف", variant: "outline" as const, color: "text-gray-600" }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-KW', { 
      style: 'currency', 
      currency: 'KWD',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone || !newEmployee.position) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تعبئة جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const employeeData = {
      ...newEmployee,
      salary: parseFloat(newEmployee.salary),
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      status: 'active'
    };

    addEmployeeMutation.mutate(employeeData);
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailsOpen(true);
  };

  const departments = ["الموارد البشرية", "المحاسبة", "التسويق", "تقنية المعلومات", "العمليات", "المبيعات"];

  // بيانات تجريبية للموظفين
  const mockEmployees: Employee[] = [
    {
      id: "1",
      name: "أحمد محمد علي",
      email: "ahmed@company.com",
      phone: "+965 9999 1234",
      position: "مدير الموارد البشرية",
      department: "الموارد البشرية",
      salary: 1500,
      hireDate: "2023-01-15",
      status: "active",
      employeeId: "EMP001",
      nationalId: "123456789",
      address: "الكويت، حولي",
      emergencyContact: "+965 9999 5678",
      workSchedule: "دوام كامل"
    },
    {
      id: "2", 
      name: "فاطمة أحمد سالم",
      email: "fatima@company.com",
      phone: "+965 9999 2345",
      position: "محاسبة أولى",
      department: "المحاسبة",
      salary: 1200,
      hireDate: "2023-03-10",
      status: "active",
      employeeId: "EMP002",
      nationalId: "234567890",
      address: "الكويت، الجهراء",
      emergencyContact: "+965 9999 6789"
    },
    {
      id: "3",
      name: "محمد عبدالله الحربي",
      email: "mohammed@company.com", 
      phone: "+965 9999 3456",
      position: "مطور برمجيات",
      department: "تقنية المعلومات",
      salary: 1800,
      hireDate: "2022-09-01",
      status: "active",
      employeeId: "EMP003",
      nationalId: "345678901",
      address: "الكويت، الفروانية"
    },
    {
      id: "4",
      name: "سارة عبدالرحمن القحطاني",
      email: "sara@company.com",
      phone: "+965 9999 4567",
      position: "أخصائية تسويق",
      department: "التسويق",
      salary: 1000,
      hireDate: "2023-06-20",
      status: "active",
      employeeId: "EMP004",
      nationalId: "456789012",
      address: "الكويت، الأحمدي"
    },
    {
      id: "5",
      name: "خالد سعد المطيري",
      email: "khalid@company.com",
      phone: "+965 9999 5678",
      position: "منسق مبيعات",
      department: "المبيعات",
      salary: 900,
      hireDate: "2023-08-15",
      status: "inactive",
      employeeId: "EMP005",
      nationalId: "567890123",
      address: "الكويت، مبارك الكبير"
    }
  ];

  const allEmployees = [...employees, ...mockEmployees];

  // تصفية الموظفين
  const filteredEmployees = allEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
          <p className="text-muted-foreground mt-2">
            إدارة شاملة لجميع بيانات الموظفين والملفات الشخصية
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
          
          <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة موظف جديد</DialogTitle>
                <DialogDescription>
                  قم بتعبئة بيانات الموظف الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationalId">الرقم المدني *</Label>
                  <Input
                    id="nationalId"
                    value={newEmployee.nationalId}
                    onChange={(e) => setNewEmployee({ ...newEmployee, nationalId: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">المنصب *</Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">القسم *</Label>
                  <Select 
                    value={newEmployee.department} 
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">الراتب</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hireDate">تاريخ التوظيف *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hireDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newEmployee.birthDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, birthDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">جهة اتصال طوارئ</Label>
                  <Input
                    id="emergencyContact"
                    value={newEmployee.emergencyContact}
                    onChange={(e) => setNewEmployee({ ...newEmployee, emergencyContact: e.target.value })}
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleAddEmployee}
                  disabled={addEmployeeMutation.isPending}
                >
                  {addEmployeeMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEmployees.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              الموظفون النشطون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {allEmployees.filter(e => e.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              غير نشط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {allEmployees.filter(e => e.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Archive className="h-4 w-4 text-gray-600" />
              مؤرشف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {allEmployees.filter(e => e.status === 'archived').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الموظفين (اسم، رقم موظف، بريد إلكتروني)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3 pr-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأقسام</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الراتب</TableHead>
                <TableHead className="text-right">تاريخ التوظيف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{employee.employeeId}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.department}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(employee.salary)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(employee.hireDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewDetails(employee)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => archiveEmployeeMutation.mutate(employee.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة تفاصيل الموظف */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الموظف</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback className="text-lg">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">رقم الموظف</Label>
                  <p className="font-mono">{selectedEmployee.employeeId}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">الرقم المدني</Label>
                  <p className="font-mono">{selectedEmployee.nationalId}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">رقم الهاتف</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.phone}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">القسم</Label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.department}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">الراتب</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono">{formatCurrency(selectedEmployee.salary)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">تاريخ التوظيف</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{format(new Date(selectedEmployee.hireDate), "dd MMMM yyyy", { locale: ar })}</p>
                  </div>
                </div>
                
                {selectedEmployee.emergencyContact && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">جهة اتصال طوارئ</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedEmployee.emergencyContact}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEmployee.address && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العنوان</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedEmployee.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}