import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  Filter,
  Search,
  FolderOpen,
  Calendar,
  User,
  FileImage,
  File,
  Plus
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { apiRequest } from "@/lib/queryClient";

export default function Documents() {
  return (
    <SharedLayout 
      userRole="company_manager" 
      userName="مدير الشركة" 
      companyName="شركة النيل الأزرق للمجوهرات"
    >
      <DocumentsContent />
    </SharedLayout>
  );
}

function DocumentsContent() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/documents/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
    }
  });

  const mockDocuments = [
    {
      id: "1",
      name: "عقد العمل - أحمد محمد علي.pdf",
      type: "contract",
      category: "contracts",
      size: "2.5 MB",
      uploadDate: "2025-01-20",
      uploadedBy: "مدير الموارد البشرية",
      employee: "أحمد محمد علي",
      status: "active",
      icon: File
    },
    {
      id: "2", 
      name: "كشف المرتب - يناير 2025.xlsx",
      type: "payroll",
      category: "payroll",
      size: "1.2 MB",
      uploadDate: "2025-01-15",
      uploadedBy: "محاسب الرواتب",
      employee: "جميع الموظفين",
      status: "processed",
      icon: FileText
    },
    {
      id: "3",
      name: "تقرير الأداء السنوي.pdf",
      type: "report",
      category: "reports", 
      size: "5.8 MB",
      uploadDate: "2025-01-10",
      uploadedBy: "مدير الشركة",
      employee: "إدارة الشركة",
      status: "reviewed",
      icon: File
    },
    {
      id: "4",
      name: "صورة بطاقة الهوية - فاطمة سالم.jpg",
      type: "identity",
      category: "personal",
      size: "890 KB",
      uploadDate: "2025-01-08",
      uploadedBy: "فاطمة سالم أحمد",
      employee: "فاطمة سالم أحمد", 
      status: "verified",
      icon: FileImage
    },
    {
      id: "5",
      name: "طلب إجازة - خالد عبدالرحمن.pdf",
      type: "leave",
      category: "leaves",
      size: "455 KB",
      uploadDate: "2025-01-05",
      uploadedBy: "خالد عبدالرحمن",
      employee: "خالد عبدالرحمن",
      status: "pending",
      icon: File
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'processed': return 'معالج';
      case 'reviewed': return 'مراجع';
      case 'verified': return 'محقق';
      case 'pending': return 'قيد الانتظار';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'contracts': return 'عقود';
      case 'payroll': return 'رواتب';
      case 'reports': return 'تقارير';
      case 'personal': return 'شخصية';
      case 'leaves': return 'إجازات';
      default: return category;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      uploadMutation.mutate(formData);
    }
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesTab = activeTab === 'all' || doc.category === activeTab;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المستندات</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              تنظيم وإدارة جميع مستندات الشركة والموظفين
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
            <label htmlFor="file-upload">
              <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <Upload className="h-4 w-4 ml-2" />
                رفع مستند
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث في المستندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              <SelectItem value="contracts">عقود</SelectItem>
              <SelectItem value="payroll">رواتب</SelectItem>
              <SelectItem value="reports">تقارير</SelectItem>
              <SelectItem value="personal">شخصية</SelectItem>
              <SelectItem value="leaves">إجازات</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FolderOpen className="h-4 w-4" />
            <span>المجموع: {filteredDocuments.length} مستند</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              الكل
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              عقود
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              رواتب
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              تقارير
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              شخصية
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              إجازات
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Document Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: "إجمالي المستندات", value: "147", icon: FileText, color: "blue" },
                { label: "مستندات جديدة", value: "23", icon: Plus, color: "green" },
                { label: "قيد المراجعة", value: "8", icon: Eye, color: "yellow" },
                { label: "تم التحقق", value: "116", icon: User, color: "purple" },
                { label: "الحجم الإجمالي", value: "2.4 GB", icon: FolderOpen, color: "indigo" }
              ].map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <doc.icon className="h-12 w-12 text-blue-500 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {doc.name}
                            </h3>
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusText(doc.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{doc.employee}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{doc.uploadDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>{getCategoryText(doc.category)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>{doc.size}</span>
                            </div>
                          </div>

                          <div className="mt-3 text-sm text-gray-500">
                            <span>رفع بواسطة: {doc.uploadedBy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 ml-1" />
                          تحميل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد مستندات
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  لم يتم العثور على مستندات تطابق معايير البحث
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}