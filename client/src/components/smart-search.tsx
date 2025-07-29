import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Filter,
  X,
  Users,
  Building2,
  FileText,
  Calendar,
  Award,
  AlertCircle
} from "lucide-react";

interface SearchResult {
  id: string;
  type: 'employee' | 'company' | 'document' | 'license';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  relevance: number;
}

interface SmartSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

export default function SmartSearch({ onResultSelect }: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Mock data for demonstration
  const allResults: SearchResult[] = [
    {
      id: '1',
      type: 'employee',
      title: 'أحمد محمد علي',
      subtitle: 'مطور برمجيات أول',
      description: 'قسم التطوير - خبرة 5 سنوات في React و Node.js',
      tags: ['تطوير', 'React', 'Node.js', 'فريق التقنية'],
      relevance: 95
    },
    {
      id: '2',
      type: 'company',
      title: 'شركة التقنية المتقدمة',
      subtitle: 'شركة برمجيات',
      description: '150 موظف - تأسست 2020 - تطوير حلول تقنية',
      tags: ['تقنية', 'برمجيات', 'حلول رقمية'],
      relevance: 88
    },
    {
      id: '3',
      type: 'document',
      title: 'دليل السياسات والإجراءات',
      subtitle: 'وثيقة HR-2024-001',
      description: 'دليل شامل لسياسات الموارد البشرية المحدثة',
      tags: ['سياسات', 'موارد بشرية', 'إجراءات'],
      relevance: 82
    },
    {
      id: '4',
      type: 'license',
      title: 'ترخيص مزاولة المهنة',
      subtitle: 'ترخيص رقم TL-2024-456',
      description: 'ترخيص ساري حتى ديسمبر 2025',
      tags: ['ترخيص', 'قانوني', 'ساري'],
      relevance: 75
    },
    {
      id: '5',
      type: 'employee',
      title: 'فاطمة أحمد السيد',
      subtitle: 'محاسبة رئيسية',
      description: 'قسم المالية - CPA معتمدة - خبرة 8 سنوات',
      tags: ['محاسبة', 'مالية', 'CPA'],
      relevance: 90
    }
  ];

  const filterTypes = [
    { key: 'employee', label: 'موظفين', icon: Users, color: 'bg-blue-100 text-blue-800' },
    { key: 'company', label: 'شركات', icon: Building2, color: 'bg-green-100 text-green-800' },
    { key: 'document', label: 'مستندات', icon: FileText, color: 'bg-purple-100 text-purple-800' },
    { key: 'license', label: 'تراخيص', icon: Award, color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API search with delay
    const timer = setTimeout(() => {
      const filtered = allResults.filter(result => {
        const matchesQuery = 
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        const matchesFilter = selectedFilters.length === 0 || selectedFilters.includes(result.type);
        
        return matchesQuery && matchesFilter;
      }).sort((a, b) => b.relevance - a.relevance);
      
      setResults(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedFilters]);

  const toggleFilter = (filterKey: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employee': return <Users className="h-4 w-4" />;
      case 'company': return <Building2 className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'license': return <Award className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'company': return 'bg-green-100 text-green-800 border-green-200';
      case 'document': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'license': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'employee': return 'موظف';
      case 'company': return 'شركة';
      case 'document': return 'مستند';
      case 'license': return 'ترخيص';
      default: return type;
    }
  };

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          البحث الذكي
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* شريط البحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث في الموظفين، الشركات، المستندات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pr-10 text-right"
          />
          {isLoading && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* فلاتر البحث */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            فلترة حسب:
          </span>
          {filterTypes.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedFilters.includes(filter.key);
            return (
              <Button
                key={filter.key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.key)}
                className={`text-xs ${isSelected ? '' : 'text-gray-600'}`}
              >
                <Icon className="h-3 w-3 ml-1" />
                {filter.label}
              </Button>
            );
          })}
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3 ml-1" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* نتائج البحث */}
        <div className="space-y-2">
          {query.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">ابدأ الكتابة للبحث في النظام</p>
            </div>
          )}
          
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لم يتم العثور على نتائج</p>
              <p className="text-xs mt-1">جرب كلمات مختلفة أو قم بتعديل الفلاتر</p>
            </div>
          )}
          
          {results.map((result) => (
            <div
              key={result.id}
              className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
              onClick={() => onResultSelect?.(result)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {getTypeIcon(result.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {result.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(result.type)}>
                        {getTypeLabel(result.type)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {result.relevance}% مطابقة
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                    {result.subtitle}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {result.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{result.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}