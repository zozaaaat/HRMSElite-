import { useState } from "react";
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
  Search, 
  Filter, 
  X, 
  Calendar,
  Building,
  Users,
  FileText
} from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  department: string;
  dateRange: string;
  status: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
}

export function AdvancedSearch({ onSearch, placeholder = "البحث في النظام..." }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    department: 'all',
    dateRange: 'all',
    status: 'all'
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Track active filters
    const active = Object.entries(newFilters)
      .filter(([k, v]) => v !== '' && v !== 'all' && k !== 'query')
      .map(([k]) => k);
    setActiveFilters(active);
    
    onSearch(newFilters);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    updateFilter(key, key === 'query' ? '' : 'all');
  };

  const clearAllFilters = () => {
    const resetFilters = {
      query: '',
      category: 'all',
      department: 'all',
      dateRange: 'all',
      status: 'all'
    };
    setFilters(resetFilters);
    setActiveFilters([]);
    onSearch(resetFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          البحث المتقدم
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="employees">الموظفون</SelectItem>
              <SelectItem value="documents">المستندات</SelectItem>
              <SelectItem value="licenses">التراخيص</SelectItem>
              <SelectItem value="projects">المشاريع</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              <SelectItem value="production">الإنتاج</SelectItem>
              <SelectItem value="sales">المبيعات</SelectItem>
              <SelectItem value="admin">الإدارة</SelectItem>
              <SelectItem value="finance">المالية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأوقات</SelectItem>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="inactive">غير نشط</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">المرشحات النشطة:</span>
            {activeFilters.map((filterKey) => (
              <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                {filterKey === 'category' && 'الفئة'}
                {filterKey === 'department' && 'القسم'}
                {filterKey === 'dateRange' && 'الفترة'}
                {filterKey === 'status' && 'الحالة'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter(filterKey as keyof SearchFilters)}
                />
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-xs"
            >
              إلغاء الكل
            </Button>
          </div>
        )}

        {/* Quick Search Suggestions */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">عمليات بحث سريعة:</p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateFilter('query', 'الموظفون الجدد')}
            >
              <Users className="h-3 w-3 ml-1" />
              الموظفون الجدد
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateFilter('query', 'المستندات المعلقة')}
            >
              <FileText className="h-3 w-3 ml-1" />
              المستندات المعلقة
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateFilter('query', 'التراخيص المنتهية')}
            >
              <Calendar className="h-3 w-3 ml-1" />
              التراخيص المنتهية
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}