import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AdvancedSearchFilter, 
  SearchResultsDisplay,
  type SearchFilters 
} from "@/components/advanced-search-filter";
import { CompanyDetailView } from "@/components/company-detail-view";
import { EmployeeDetailView } from "@/components/employee-detail-view";
import EnhancedCompanyForm from "@/components/enhanced-company-form";
import { EnhancedEmployeeForm } from "@/components/enhanced-employee-form";
import { 
  Search,
  Filter,
  Plus,
  Building2,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'employee' | 'company' | 'license';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  status: string;
  location?: string;
  department?: string;
  salary?: number;
  hireDate?: string;
  relevance: number;
  avatar?: string;
  metadata: Record<string, any>;
}

export default function AdvancedSearchPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  
  // نوافذ التفاصيل
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  
  // نوافذ الإضافة/التعديل
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // استعلام البيانات
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: licenses = [] } = useQuery({
    queryKey: ["/api/licenses"],
  });

  // معالج تغيير الفلاتر
  const handleFiltersChange = (filters: SearchFilters) => {
    // سيتم التعامل مع هذا في مكون AdvancedSearchFilter
  };

  // معالج تغيير النتائج
  const handleResultsChange = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  // معالج النقر على النتيجة
  const handleItemClick = (item: SearchResult) => {
    setSelectedItem(item);
    
    if (item.type === 'company') {
      setCompanyDetailOpen(true);
    } else if (item.type === 'employee') {
      setEmployeeDetailOpen(true);
    }
  };

  // معالج تعديل الشركة
  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setCompanyDetailOpen(false);
    setCompanyFormOpen(true);
  };

  // معالج تعديل الموظف
  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setEmployeeDetailOpen(false);
    setEmployeeFormOpen(true);
  };

  // إحصائيات سريعة
  const stats = {
    totalCompanies: companies.length,
    totalEmployees: employees.length,
    totalLicenses: licenses.length,
    activeCompanies: companies.filter((c: any) => c.status === 'active').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">البحث المتقدم</h1>
          <p className="text-muted-foreground mt-2">
            ابحث في جميع بيانات النظام باستخدام فلاتر متقدمة
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              setEditingCompany(null);
              setCompanyFormOpen(true);
            }}
          >
            <Building2 className="h-4 w-4 mr-2" />
            إضافة شركة
          </Button>
          <Button 
            onClick={() => {
              setEditingEmployee(null);
              setEmployeeFormOpen(true);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            إضافة موظف
          </Button>
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الشركات</p>
                <p className="text-2xl font-bold">{stats.totalCompanies}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.activeCompanies} نشطة
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الموظفون</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">
                  في جميع الشركات
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">التراخيص</p>
                <p className="text-2xl font-bold">{stats.totalLicenses}</p>
                <p className="text-xs text-muted-foreground">
                  مسجلة في النظام
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">النتائج</p>
                <p className="text-2xl font-bold">{searchResults.length}</p>
                <p className="text-xs text-muted-foreground">
                  من البحث الحالي
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">البحث والنتائج</TabsTrigger>
          <TabsTrigger value="analytics">التحليل والإحصائيات</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* مكون البحث المتقدم */}
          <AdvancedSearchFilter
            onFiltersChange={handleFiltersChange}
            onResultsChange={handleResultsChange}
            data={{
              companies,
              employees,
              licenses
            }}
          />

          {/* عرض النتائج */}
          <SearchResultsDisplay
            results={searchResults}
            isLoading={false}
            onItemClick={handleItemClick}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الشركات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['تجارية', 'صناعية', 'خدمية', 'مهنية'].map((type, index) => {
                    const count = companies.filter((c: any) => 
                      c.industryType?.includes(type) || c.businessActivity?.includes(type)
                    ).length;
                    const percentage = companies.length > 0 ? (count / companies.length * 100) : 0;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{type}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الموظفين حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['تقنية المعلومات', 'الموارد البشرية', 'المالية', 'المبيعات'].map((dept, index) => {
                    const count = employees.filter((e: any) => e.department === dept).length;
                    const percentage = employees.length > 0 ? (count / employees.length * 100) : 0;
                    
                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{dept}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معدل النمو الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-green-600 mb-2">+12%</div>
                  <p className="text-muted-foreground">زيادة في عدد الموظفين</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>متوسط الرواتب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {employees.length > 0 
                      ? Math.round(employees.reduce((sum: number, emp: any) => 
                          sum + (parseFloat(emp.monthlySalary || emp.salary || '0')), 0
                        ) / employees.length)
                      : 0
                    } د.ك
                  </div>
                  <p className="text-muted-foreground">متوسط الراتب الشهري</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* نوافذ التفاصيل */}
      {selectedItem?.type === 'company' && (
        <CompanyDetailView
          companyId={selectedItem.id}
          isOpen={companyDetailOpen}
          onClose={() => {
            setCompanyDetailOpen(false);
            setSelectedItem(null);
          }}
          onEdit={handleEditCompany}
        />
      )}

      {selectedItem?.type === 'employee' && (
        <EmployeeDetailView
          employeeId={selectedItem.id}
          isOpen={employeeDetailOpen}
          onClose={() => {
            setEmployeeDetailOpen(false);
            setSelectedItem(null);
          }}
          onEdit={handleEditEmployee}
        />
      )}

      {/* نوافذ الإضافة/التعديل */}
      <EnhancedCompanyForm
        isOpen={companyFormOpen}
        onClose={() => {
          setCompanyFormOpen(false);
          setEditingCompany(null);
        }}
        editingCompany={editingCompany}
      />

      <EnhancedEmployeeForm
        isOpen={employeeFormOpen}
        onClose={() => {
          setEmployeeFormOpen(false);
          setEditingEmployee(null);
        }}
        companyId={editingEmployee?.companyId || companies[0]?.id || ''}
        editingEmployee={editingEmployee}
      />
    </div>
  );
}