import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Search, Plus } from "lucide-react";
import type { Employee } from "@shared/schema";

interface EmployeesTableProps {
  employees: Employee[];
  companyId: string;
  showActions?: boolean;
}

export function EmployeesTable({ employees, companyId, showActions = false }: EmployeesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter((employee) =>
    employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.civilId.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "نشط", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      inactive: { label: "غير نشط", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
      on_leave: { label: "في إجازة", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
      terminated: { label: "منقطع", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
      archived: { label: "مؤرشف", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.inactive;
    
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getEmployeeInitials = (name: string) => {
    const words = name.split(' ');
    return words.slice(0, 2).map(word => word.charAt(0)).join('');
  };

  const handleViewEmployee = (employee: Employee) => {
    console.log("View employee:", employee);
  };

  const handleEditEmployee = (employee: Employee) => {
    console.log("Edit employee:", employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    console.log("Delete employee:", employee);
  };

  const handleAddEmployee = () => {
    console.log("Add new employee");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>العمال</CardTitle>
          {showActions && (
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="البحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Button onClick={handleAddEmployee}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة عامل
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الرقم المدني</TableHead>
                <TableHead className="text-right">الجنسية</TableHead>
                <TableHead className="text-right">الوظيفة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                {showActions && <TableHead className="text-right">الإجراءات</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {getEmployeeInitials(employee.fullName)}
                        </span>
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-foreground">
                          {employee.fullName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {employee.civilId}
                  </TableCell>
                  <TableCell className="text-sm">
                    {employee.nationality}
                  </TableCell>
                  <TableCell className="text-sm">
                    {employee.jobTitle}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(employee.status)}
                  </TableCell>
                  {showActions && (
                    <TableCell>
                      <div className="flex space-x-reverse space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewEmployee(employee)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4 text-yellow-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEmployee(employee)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد بيانات للعرض
          </div>
        )}
        
        {!showActions && filteredEmployees.length > 0 && (
          <div className="bg-card px-4 py-3 border-t border-border sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                عرض <span className="font-medium">1</span> إلى{" "}
                <span className="font-medium">{Math.min(10, filteredEmployees.length)}</span> من{" "}
                <span className="font-medium">{filteredEmployees.length}</span> نتيجة
              </div>
              <div className="flex space-x-reverse space-x-2">
                <Button variant="outline" size="sm" disabled>
                  السابق
                </Button>
                <Button variant="outline" size="sm">
                  التالي
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
