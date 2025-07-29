import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search,
  Filter,
  X,
  Users,
  Building2,
  FileText,
  Calendar as CalendarIcon,
  Award,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  User,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export interface SearchFilters {
  query: string;
  entityType: 'all' | 'companies' | 'employees' | 'licenses';
  status: string[];
  department: string[];
  location: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  salaryRange: {
    min: number | null;
    max: number | null;
  };
  nationality: string[];
  jobTitle: string[];
}

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

interface AdvancedSearchFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onResultsChange: (results: SearchResult[]) => void;
  data: {
    companies: any[];
    employees: any[];
    licenses: any[];
  };
}

export function AdvancedSearchFilter({ 
  onFiltersChange, 
  onResultsChange, 
  data 
}: AdvancedSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    entityType: 'all',
    status: [],
    department: [],
    location: [],
    dateRange: { from: null, to: null },
    salaryRange: { min: null, max: null },
    nationality: [],
    jobTitle: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // خيارات الفلترة
  const statusOptions = [
    { value: 'active', label: 'نشط', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'غير نشط', color: 'bg-red-100 text-red-800' },
    { value: 'pending', label: 'معلق', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'suspended', label: 'موقوف', color: 'bg-orange-100 text-orange-800' }
  ];

  const departmentOptions = [
    'تقنية المعلومات',
    'الموارد البشرية', 
    'المالية',
    'المبيعات',
    'التسويق',
    'العمليات',
    'الإدارة',
    'خدمة العملاء',
    'المشتريات',
    'الأمن'
  ];

  const locationOptions = [
    'الكويت',
    'الجهراء', 
    'الأحمدي',
    'حولي',
    'الفروانية',
    'مبارك الكبير'
  ];

  const nationalityOptions = [
    'كويتي',
    'سعودي',
    'مصري',
    'أردني',
    'لبناني',
    'سوري',
    'فلسطيني',
    'هندي',
    'باكستاني',
    'فلبيني'
  ];

  // تحديث الفلاتر
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // البحث وتطبيق الفلاتر
  useEffect(() => {
    performSearch();
  }, [filters, data]);

  const performSearch = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const results: SearchResult[] = [];

      // البحث في الشركات
      if (filters.entityType === 'all' || filters.entityType === 'companies') {
        data.companies.forEach((company: any) => {
          if (matchesFilters(company, 'company')) {
            results.push({
              id: company.id,
              type: 'company',
              title: company.name || company.commercialFileName,
              subtitle: company.industryType || 'شركة',
              description: `${company.location || ''} - ${company.businessActivity || ''}`,
              tags: [company.classification, company.ownershipCategory].filter(Boolean),
              status: company.status || 'active',
              location: company.location,
              relevance: calculateRelevance(company, 'company'),
              metadata: company
            });
          }
        });
      }

      // البحث في الموظفين
      if (filters.entityType === 'all' || filters.entityType === 'employees') {
        data.employees.forEach((employee: any) => {
          if (matchesFilters(employee, 'employee')) {
            results.push({
              id: employee.id,
              type: 'employee',
              title: employee.fullName || employee.name,
              subtitle: employee.jobTitle || employee.position,
              description: `${employee.department || ''} - ${employee.nationality || ''}`,
              tags: [employee.type, employee.department].filter(Boolean),
              status: employee.status || 'active',
              department: employee.department,
              salary: employee.monthlySalary || employee.salary,
              hireDate: employee.hireDate,
              relevance: calculateRelevance(employee, 'employee'),
              metadata: employee
            });
          }
        });
      }

      // البحث في التراخيص
      if (filters.entityType === 'all' || filters.entityType === 'licenses') {
        data.licenses?.forEach((license: any) => {
          if (matchesFilters(license, 'license')) {
            results.push({
              id: license.id,
              type: 'license',
              title: license.name || license.licenseNumber,
              subtitle: license.type || 'ترخيص',
              description: `${license.issuingAuthority || ''} - ${license.businessType || ''}`,
              tags: [license.type, license.licenseCategory].filter(Boolean),
              status: license.status || 'active',
              location: license.marketName || license.location,
              relevance: calculateRelevance(license, 'license'),
              metadata: license
            });
          }
        });
      }

      // ترتيب النتائج حسب الصلة
      results.sort((a, b) => b.relevance - a.relevance);
      
      onResultsChange(results);
      setIsLoading(false);
    }, 300);
  };

  // فحص تطابق العنصر مع الفلاتر
  const matchesFilters = (item: any, type: string): boolean => {
    // البحث النصي
    if (filters.query) {
      const searchFields = getSearchFields(item, type);
      const matchesQuery = searchFields.some(field => 
        field.toLowerCase().includes(filters.query.toLowerCase())
      );
      if (!matchesQuery) return false;
    }

    // فلتر الحالة
    if (filters.status.length > 0) {
      if (!filters.status.includes(item.status || 'active')) return false;
    }

    // فلتر القسم (للموظفين)
    if (filters.department.length > 0 && type === 'employee') {
      if (!filters.department.includes(item.department)) return false;
    }

    // فلتر الموقع
    if (filters.location.length > 0) {
      const itemLocation = item.location || item.marketName || item.workLocation;
      if (!itemLocation || !filters.location.includes(itemLocation)) return false;
    }

    // فلتر النطاق الزمني
    if (filters.dateRange.from || filters.dateRange.to) {
      const itemDate = new Date(item.hireDate || item.establishmentDate || item.issueDate);
      if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
    }

    // فلتر نطاق الراتب (للموظفين)
    if ((filters.salaryRange.min || filters.salaryRange.max) && type === 'employee') {
      const salary = parseFloat(item.monthlySalary || item.salary || '0');
      if (filters.salaryRange.min && salary < filters.salaryRange.min) return false;
      if (filters.salaryRange.max && salary > filters.salaryRange.max) return false;
    }

    // فلتر الجنسية (للموظفين)
    if (filters.nationality.length > 0 && type === 'employee') {
      if (!filters.nationality.includes(item.nationality)) return false;
    }

    return true;
  };

  // الحصول على الحقول القابلة للبحث
  const getSearchFields = (item: any, type: string): string[] => {
    const fields: string[] = [];
    
    switch (type) {
      case 'company':
        fields.push(
          item.name || '',
          item.commercialFileName || '',
          item.businessActivity || '',
          item.industryType || '',
          item.location || '',
          item.chambers || ''
        );
        break;
      case 'employee':
        fields.push(
          item.fullName || item.name || '',
          item.jobTitle || item.position || '',
          item.department || '',
          item.nationality || '',
          item.civilId || '',
          item.email || '',
          item.phone || ''
        );
        break;
      case 'license':
        fields.push(
          item.name || '',
          item.licenseNumber || '',
          item.businessType || '',
          item.issuingAuthority || '',
          item.type || ''
        );
        break;
    }

    return fields.filter(Boolean);
  };

  // حساب درجة الصلة
  const calculateRelevance = (item: any, type: string): number => {
    if (!filters.query) return 50;

    const searchFields = getSearchFields(item, type);
    let relevance = 0;

    searchFields.forEach(field => {
      const lowerField = field.toLowerCase();
      const lowerQuery = filters.query.toLowerCase();

      if (lowerField === lowerQuery) relevance += 100;
      else if (lowerField.startsWith(lowerQuery)) relevance += 80;
      else if (lowerField.includes(lowerQuery)) relevance += 60;
    });

    return Math.min(relevance, 100);
  };

  // إزالة فلتر
  const removeFilter = (filterType: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[filterType])) {
      (newFilters[filterType] as string[]) = (newFilters[filterType] as string[]).filter(v => v !== value);
    }
    updateFilters(newFilters);
  };

  // مسح جميع الفلاتر
  const clearAllFilters = () => {
    updateFilters({
      query: '',
      entityType: 'all',
      status: [],
      department: [],
      location: [],
      dateRange: { from: null, to: null },
      salaryRange: { min: null, max: null },
      nationality: [],
      jobTitle: []
    });
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = 
    filters.status.length + 
    filters.department.length + 
    filters.location.length + 
    filters.nationality.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.salaryRange.min || filters.salaryRange.max ? 1 : 0);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* شريط البحث الرئيسي */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ابحث في الشركات والموظفين والتراخيص..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pr-10"
            />
          </div>

          <Select 
            value={filters.entityType} 
            onValueChange={(value: any) => updateFilters({ entityType: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع النتائج</SelectItem>
              <SelectItem value="companies">الشركات فقط</SelectItem>
              <SelectItem value="employees">الموظفون فقط</SelectItem>
              <SelectItem value="licenses">التراخيص فقط</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            فلاتر متقدمة
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* الفلاتر المتقدمة */}
        {showAdvancedFilters && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* فلتر الحالة */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الحالة</label>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={status.value}
                        checked={filters.status.includes(status.value)}
                        onCheckedChange={(checked) => {
                          const newStatus = checked
                            ? [...filters.status, status.value]
                            : filters.status.filter(s => s !== status.value);
                          updateFilters({ status: newStatus });
                        }}
                      />
                      <label htmlFor={status.value} className="text-sm">
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* فلتر القسم */}
              <div className="space-y-2">
                <label className="text-sm font-medium">القسم</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {departmentOptions.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={filters.department.includes(dept)}
                        onCheckedChange={(checked) => {
                          const newDepartments = checked
                            ? [...filters.department, dept]
                            : filters.department.filter(d => d !== dept);
                          updateFilters({ department: newDepartments });
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* فلتر الموقع */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الموقع</label>
                <div className="space-y-2">
                  {locationOptions.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`loc-${location}`}
                        checked={filters.location.includes(location)}
                        onCheckedChange={(checked) => {
                          const newLocations = checked
                            ? [...filters.location, location]
                            : filters.location.filter(l => l !== location);
                          updateFilters({ location: newLocations });
                        }}
                      />
                      <label htmlFor={`loc-${location}`} className="text-sm">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* فلاتر التاريخ والراتب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* نطاق التاريخ */}
              <div className="space-y-2">
                <label className="text-sm font-medium">نطاق التاريخ</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? format(filters.dateRange.from, "PPP", { locale: ar }) : "من"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, from: date || null } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? format(filters.dateRange.to, "PPP", { locale: ar }) : "إلى"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to || undefined}
                        onSelect={(date) => updateFilters({ 
                          dateRange: { ...filters.dateRange, to: date || null } 
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* نطاق الراتب */}
              <div className="space-y-2">
                <label className="text-sm font-medium">نطاق الراتب (د.ك)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="من"
                    value={filters.salaryRange.min || ''}
                    onChange={(e) => updateFilters({
                      salaryRange: { 
                        ...filters.salaryRange, 
                        min: e.target.value ? parseFloat(e.target.value) : null 
                      }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={filters.salaryRange.max || ''}
                    onChange={(e) => updateFilters({
                      salaryRange: { 
                        ...filters.salaryRange, 
                        max: e.target.value ? parseFloat(e.target.value) : null 
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="outline" onClick={clearAllFilters}>
                مسح جميع الفلاتر
              </Button>
              <Button onClick={() => setShowAdvancedFilters(false)}>
                تطبيق الفلاتر
              </Button>
            </div>
          </div>
        )}

        {/* الفلاتر النشطة */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                {statusOptions.find(s => s.value === status)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('status', status)}
                />
              </Badge>
            ))}
            {filters.department.map(dept => (
              <Badge key={dept} variant="secondary" className="gap-1">
                {dept}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('department', dept)}
                />
              </Badge>
            ))}
            {filters.location.map(loc => (
              <Badge key={loc} variant="secondary" className="gap-1">
                {loc}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('location', loc)}
                />
              </Badge>
            ))}
          </div>
        )}

        {/* مؤشر التحميل */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// مكون عرض النتائج
interface SearchResultsDisplayProps {
  results: SearchResult[];
  isLoading: boolean;
  onItemClick: (item: SearchResult) => void;
}

export function SearchResultsDisplay({ 
  results, 
  isLoading, 
  onItemClick 
}: SearchResultsDisplayProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'company': return Building2;
      case 'employee': return User;
      case 'license': return Award;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return 'شركة';
      case 'employee': return 'موظف';
      case 'license': return 'ترخيص';
      default: return 'عنصر';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-300 h-12 w-12"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground">
            جرب تعديل مصطلحات البحث أو الفلاتر المستخدمة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        تم العثور على {results.length} نتيجة
      </div>
      
      {results.map((result) => {
        const Icon = getIcon(result.type);
        
        return (
          <Card 
            key={result.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onItemClick(result)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                    <Badge variant="outline">{getTypeLabel(result.type)}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{result.subtitle}</p>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {result.department && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{result.department}</span>
                      </div>
                    )}
                    {result.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{result.location}</span>
                      </div>
                    )}
                    {result.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{result.salary} د.ك</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}