import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  Archive,
  Calendar,
  User,
  Building,
  Tag,
  Plus,
  FolderOpen
} from "lucide-react";
import { SharedLayout } from "@/components/shared-layout";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('/api/documents/upload', 'POST', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "تم رفع المستند بنجاح",
        description: "تم إضافة المستند الجديد إلى الأرشيف",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('category', activeTab);
      uploadMutation.mutate(formData);
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'contract': 'bg-blue-100 text-blue-800',
      'license': 'bg-green-100 text-green-800',
      'certificate': 'bg-purple-100 text-purple-800',
      'report': 'bg-orange-100 text-orange-800',
      'policy': 'bg-red-100 text-red-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      'contract': 'عقد',
      'license': 'ترخيص',
      'certificate': 'شهادة',
      'report': 'تقرير',
      'policy': 'سياسة',
      'other': 'أخرى'
    };
    return names[type] || 'غير محدد';
  };

  // Mock documents data
  const mockDocuments = [
    {
      id: 'doc1',
      name: 'عقد العمل - أحمد محمد علي',
      type: 'contract',
      size: '2.4 MB',
      uploadDate: '2025-01-25',
      uploadedBy: 'مدير الموارد البشرية',
      category: 'employees',
      tags: ['عقود', 'موظفين جدد'],
      description: 'عقد عمل للموظف الجديد أحمد محمد علي'
    },
    {
      id: 'doc2',
      name: 'رخصة تجارية - تجديد 2025',
      type: 'license',
      size: '1.8 MB',
      uploadDate: '2025-01-20',
      uploadedBy: 'المدير العام',
      category: 'licenses',
      tags: ['تراخيص', 'تجديد'],
      description: 'رخصة تجارية محدثة للعام 2025'
    },
    {
      id: 'doc3',
      name: 'تقرير الأداء الشهري - ديسمبر 2024',
      type: 'report',
      size: '5.2 MB',
      uploadDate: '2025-01-15',
      uploadedBy: 'مدير الموارد البشرية',
      category: 'reports',
      tags: ['تقارير', 'أداء', 'شهري'],
      description: 'تقرير شامل عن أداء الموظفين في ديسمبر 2024'
    }
  ];

  const filteredDocuments = mockDocuments.filter(doc =>
    (activeTab === 'all' || doc.category === activeTab) &&
    (searchTerm === '' || 
     doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doc.tags.some(tag => tag.includes(searchTerm)))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المستندات</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              رفع وتنظيم وأرشفة جميع مستندات الشركة والموظفين
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="h-4 w-4 ml-2" />
              رفع مستند
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 ml-2" />
              مجلد جديد
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في المستندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              جميع المستندات
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              مستندات الموظفين
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              التراخيص
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              التقارير
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              الأرشيف
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المستندات</p>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تم رفعها هذا الشهر</p>
                      <p className="text-2xl font-bold">87</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">تنتهي صلاحيتها قريباً</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Archive className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">في الأرشيف</p>
                      <p className="text-2xl font-bold">245</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2 mb-2">
                          {document.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {document.description}
                        </CardDescription>
                      </div>
                      <Badge className={getDocumentTypeColor(document.type)}>
                        {getDocumentTypeName(document.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">الحجم:</span>
                          <span className="font-medium mr-2">{document.size}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">تاريخ الرفع:</span>
                          <span className="font-medium mr-2">{document.uploadDate}</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">رفعه:</span>
                        <span className="font-medium mr-2">{document.uploadedBy}</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 ml-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-4 w-4 ml-1" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredDocuments.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد مستندات
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    لم يتم العثور على مستندات في هذا القسم
                  </p>
                  <Button onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="h-4 w-4 ml-2" />
                    رفع مستند جديد
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}