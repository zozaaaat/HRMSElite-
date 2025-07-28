import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Archive,
  RotateCcw,
  Search,
  Filter,
  Download,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Eye
} from "lucide-react";

interface EmployeeArchivingProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export function EmployeeArchiving({ isOpen, onClose, companyId }: EmployeeArchivingProps) {
  const [activeTab, setActiveTab] = useState("archive");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  // Mock archived employees data
  const archivedEmployees = [
    {
      id: "1",
      fullName: "محمد أحمد الأحمد",
      position: "مطور برمجيات",
      department: "تقنية المعلومات",
      email: "mohammed.ahmed@company.com",
      phone: "+966551234567",
      avatar: "",
      joinDate: "2020-03-15",
      archiveDate: "2024-12-31",
      archiveReason: "استقالة",
      finalSalary: 15000,
      status: "archived",
      contractEndDate: "2024-12-31",
      lastWorkingDay: "2024-12-30",
      clearanceStatus: "completed",
      benefitsStatus: "settled",
      documentsStatus: "collected"
    },
    {
      id: "2",
      fullName: "فاطمة سالم الزهراني",
      position: "محاسبة",
      department: "المالية",
      email: "fatima.salem@company.com",
      phone: "+966559876543",
      avatar: "",
      joinDate: "2019-08-20",
      archiveDate: "2024-11-15",
      archiveReason: "انتهاء عقد",
      finalSalary: 12000,
      status: "archived",
      contractEndDate: "2024-11-15",
      lastWorkingDay: "2024-11-14",
      clearanceStatus: "completed",
      benefitsStatus: "settled",
      documentsStatus: "collected"
    },
    {
      id: "3",
      fullName: "عبدالرحمن خالد المطيري",
      position: "مدير مبيعات",
      department: "المبيعات",
      email: "abdulrahman.khalid@company.com",
      phone: "+966542345678",
      avatar: "",
      joinDate: "2018-01-10",
      archiveDate: "2024-10-31",
      archiveReason: "إنهاء خدمات",
      finalSalary: 18000,
      status: "archived",
      contractEndDate: "2024-10-31",
      lastWorkingDay: "2024-10-30",
      clearanceStatus: "pending",
      benefitsStatus: "pending",
      documentsStatus: "pending"
    }
  ];

  const activeEmployees = [
    {
      id: "4",
      fullName: "أحمد محمد السالم",
      position: "مطور ويب",
      department: "تقنية المعلومات",
      email: "ahmed.salem@company.com",
      phone: "+966555123456",
      avatar: "",
      joinDate: "2023-06-01",
      salary: 14000,
      status: "active",
      contractType: "دائم",
      performanceRating: 4.2
    },
    {
      id: "5",
      fullName: "مريم عبدالله الأحمد",
      position: "مصممة جرافيك",
      department: "التسويق",
      email: "mariam.abdullah@company.com",
      phone: "+966556789012",
      avatar: "",
      joinDate: "2023-02-15",
      salary: 11000,
      status: "active",
      contractType: "دائم",
      performanceRating: 4.5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'استقالة': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'انتهاء عقد': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'إنهاء خدمات': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'تقاعد': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleArchiveEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowArchiveDialog(true);
  };

  const handleViewEmployeeDetails = (employee: any) => {
    setSelectedEmployee(employee);
  };

  const filteredArchivedEmployees = archivedEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActiveEmployees = activeEmployees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[700px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            أرشفة الموظفين
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="archive">أرشفة موظف</TabsTrigger>
            <TabsTrigger value="archived">الموظفون المؤرشفون</TabsTrigger>
            <TabsTrigger value="restore">استعادة الموظفين</TabsTrigger>
          </TabsList>

          <TabsContent value="archive" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن موظف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموظفين</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="probation">تحت التجربة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Employees List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">الموظفون النشطون</h3>
              {filteredActiveEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {employee.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {employee.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              انضم في {employee.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <div className="font-semibold">{employee.salary.toLocaleString()} ريال</div>
                          <Badge className={getStatusColor(employee.status)}>
                            {employee.status === 'active' ? 'نشط' : employee.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewEmployeeDetails(employee)}>
                            <Eye className="h-3 w-3 ml-1" />
                            عرض
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleArchiveEmployee(employee)}>
                            <Archive className="h-3 w-3 ml-1" />
                            أرشفة
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الأرشيف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button variant="outline" onClick={() => console.log('تصدير الأرشيف')}>
                <Download className="h-4 w-4 ml-2" />
                تصدير الأرشيف
              </Button>
            </div>

            {/* Archived Employees */}
            <div className="space-y-4">
              {filteredArchivedEmployees.map((employee) => (
                <Card key={employee.id} className="bg-gray-50 dark:bg-gray-900/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 grayscale">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {employee.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {employee.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <Archive className="h-3 w-3" />
                              أُرشف في {employee.archiveDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div className="space-y-1">
                          <Badge className={getReasonColor(employee.archiveReason)}>
                            {employee.archiveReason}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            آخر راتب: {employee.finalSalary.toLocaleString()} ريال
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs">
                            <span>التسوية:</span>
                            {employee.clearanceStatus === 'completed' ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> : 
                              <Clock className="h-3 w-3 text-yellow-500" />
                            }
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span>المستحقات:</span>
                            {employee.benefitsStatus === 'completed' ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> : 
                              <Clock className="h-3 w-3 text-yellow-500" />
                            }
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span>الوثائق:</span>
                            {employee.documentsStatus === 'completed' ? 
                              <CheckCircle className="h-3 w-3 text-green-500" /> : 
                              <Clock className="h-3 w-3 text-yellow-500" />
                            }
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewEmployeeDetails(employee)}>
                          <FileText className="h-3 w-3 ml-1" />
                          التفاصيل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restore" className="space-y-6">
            <div className="text-center py-12">
              <RotateCcw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">استعادة الموظفين</h3>
              <p className="text-muted-foreground mb-6">
                يمكنك استعادة الموظفين المؤرشفين إذا احتجت لإعادة تفعيل حساباتهم
              </p>
              <Button variant="outline" onClick={() => console.log('البحث عن موظف مؤرشف')}>
                <Search className="h-4 w-4 ml-2" />
                البحث عن موظف مؤرشف
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Archive Employee Dialog */}
        {showArchiveDialog && selectedEmployee && (
          <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-destructive" />
                  أرشفة الموظف
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-medium">تأكيد أرشفة الموظف</p>
                      <p className="text-sm text-muted-foreground">
                        سيتم نقل {selectedEmployee.fullName} إلى الأرشيف
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="archiveReason">سبب الأرشفة</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب الأرشفة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resignation">استقالة</SelectItem>
                        <SelectItem value="contract_end">انتهاء عقد</SelectItem>
                        <SelectItem value="termination">إنهاء خدمات</SelectItem>
                        <SelectItem value="retirement">تقاعد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="archiveNotes">ملاحظات إضافية</Label>
                    <Textarea
                      id="archiveNotes"
                      placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastWorkingDay">آخر يوم عمل</Label>
                    <Input type="date" id="lastWorkingDay" />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowArchiveDialog(false)}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => {
                      // Handle archive logic here
                      setShowArchiveDialog(false);
                      setSelectedEmployee(null);
                    }}
                  >
                    <Archive className="h-4 w-4 ml-2" />
                    أرشفة الموظف
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}