import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Search, Filter, Download, Eye, Settings } from "lucide-react";

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface DataTableToolsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onExport?: () => void;
  columns?: Column[];
  onColumnsChange?: (columns: Column[]) => void;
  filterOptions?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

export function DataTableTools({
  searchValue,
  onSearchChange,
  onFilterChange,
  onExport,
  columns = [],
  onColumnsChange,
  filterOptions = []
}: DataTableToolsProps) {
  const [filters, setFilter] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilter(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setFilter({});
    onFilterChange?.({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const handleColumnToggle = (key: string) => {
    if (onColumnsChange) {
      const updatedColumns = columns.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      );
      onColumnsChange(updatedColumns);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        {/* البحث */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-9"
          />
        </div>

        {/* الفلاتر */}
        {filterOptions.length > 0 && (
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                فلترة
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">الفلاتر</h4>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      مسح الكل
                    </Button>
                  )}
                </div>
                
                {filterOptions.map((filterOption) => (
                  <div key={filterOption.key} className="space-y-2">
                    <Label className="text-sm font-medium">
                      {filterOption.label}
                    </Label>
                    <Select 
                      value={filters[filterOption.key] || ""} 
                      onValueChange={(value) => handleFilterChange(filterOption.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">الكل</SelectItem>
                        {filterOption.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* إعدادات الأعمدة */}
        {columns.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Eye className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">عرض الأعمدة</h4>
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div key={column.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={column.key}
                        checked={column.visible}
                        onCheckedChange={() => handleColumnToggle(column.key)}
                      />
                      <Label 
                        htmlFor={column.key}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* تصدير */}
        {onExport && (
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            تصدير
          </Button>
        )}
      </div>
    </div>
  );
}