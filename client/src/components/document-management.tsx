import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  FolderPlus,
  File,
  FileImage,
  FileSpreadsheet,
  FileVideo,
  Calendar,
  User,
  Building2,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Share2,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentManagementProps {
  companyId?: string;
  employeeId?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'employee' | 'company' | 'license' | 'contract' | 'government' | 'other';
  tags: string[];
  description?: string;
  uploadedBy: string;
  status: 'active' | 'archived' | 'expired';
  expiryDate?: string;
  relatedEntity?: {
    type: 'employee' | 'company';
    id: string;
    name: string;
  };
  permissions: {
    view: string[];
    edit: string[];
    delete: string[];
  };
}

const documentCategories = [
  { id: 'employee', label: 'وثائق الموظفين', icon: User, color: 'bg-blue-100 text-blue-800' },
  { id: 'company', label: 'وثائق الشركة', icon: Building2, color: 'bg-green-100 text-green-800' },
  { id: 'license', label: 'التراخيص', icon: FileText, color: 'bg-orange-100 text-orange-800' },
  { id: 'contract', label: 'العقود', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { id: 'government', label: 'النماذج الحكومية', icon: FileSpreadsheet, color: 'bg-red-100 text-red-800' },
  { id: 'other', label: 'أخرى', icon: File, color: 'bg-gray-100 text-gray-800' },
];

const getFileIcon = (type: string) => {
  const extension = type.toLowerCase();
  if (extension.includes('pdf')) return FileText;
  if (extension.includes('image') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return FileImage;
  if (extension.includes('sheet') || ['xlsx', 'xls', 'csv'].includes(extension)) return FileSpreadsheet;
  if (extension.includes('video') || ['mp4', 'avi', 'mov'].includes(extension)) return FileVideo;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function DocumentManagement({ companyId, employeeId }: DocumentManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // بيانات رفع الملف
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'other',
    description: '',
    tags: '',
    expiryDate: '',
    relatedEntityType: '',
    relatedEntityId: '',
  });

  // استعلام المستندات
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents", { companyId, employeeId, category: selectedCategory }],
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  // رفع مستند جديد
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("/api/documents", "POST", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadModalOpen(false);
      setUploadData({
        name: '',
        category: 'other',
        description: '',
        tags: '',
        expiryDate: '',
        relatedEntityType: '',
        relatedEntityId: '',
      });
      toast({
        title: "تم رفع المستند",
        description: "تم رفع المستند بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفع المستند",
        variant: "destructive",
      });
    },
  });

  // حذف مستند
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return await apiRequest(`/api/documents/${documentId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "تم حذف المستند",
        description: "تم حذف المستند بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستند",
        variant: "destructive",
      });
    },
  });

  // تصفية المستندات
  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // معالج رفع الملف
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 50 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', uploadData.name || file.name);
    formData.append('category', uploadData.category);
    formData.append('description', uploadData.description);
    formData.append('tags', uploadData.tags);
    formData.append('expiryDate', uploadData.expiryDate);
    formData.append('relatedEntityType', uploadData.relatedEntityType);
    formData.append('relatedEntityId', uploadData.relatedEntityId);
    
    if (companyId) formData.append('companyId', companyId);
    if (employeeId) formData.append('employeeId', employeeId);

    uploadMutation.mutate(formData);
  };

  // تحميل مستند
  const downloadDocument = (document: Document) => {
    // في التطبيق الفعلي، سيتم تحميل الملف من الخادم
    toast({
      title: "تحميل المستند",
      description: `بدء تحميل ${document.name}`,
    });
  };

  // معاينة مستند
  const previewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  // الحصول على حالة المستند
  const getDocumentStatus = (document: Document) => {
    if (document.status === 'expired') return { icon: AlertCircle, color: 'text-red-600', label: 'منتهي الصلاحية' };
    if (document.expiryDate && new Date(document.expiryDate) < new Date()) {
      return { icon: AlertCircle, color: 'text-orange-600', label: 'منتهي الصلاحية' };
    }
    if (document.status === 'archived') return { icon: Archive, color: 'text-gray-600', label: 'مؤرشف' };
    return { icon: CheckCircle, color: 'text-green-600', label: 'نشط' };
  };

  return (
    <div className="space-y-6">
      {/* العنوان والأزرار */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستندات</h2>
          <p className="text-muted-foreground">
            رفع وإدارة جميع المستندات والملفات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? 'قائمة' : 'شبكة'}
          </Button>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            رفع مستند
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentCategories.slice(0, 4).map(category => {
          const count = documents.filter((doc: Document) => doc.category === category.id).length;
          return (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{category.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <category.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* شريط البحث والفلاتر */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في المستندات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="جميع الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {documentCategories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* قائمة المستندات */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مستندات</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'لا توجد مستندات تطابق معايير البحث' 
                : 'لم يتم رفع أي مستندات بعد'
              }
            </p>
            <Button onClick={() => setUploadModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              رفع مستند جديد
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {filteredDocuments.map((document: Document) => {
            const FileIcon = getFileIcon(document.type);
            const category = documentCategories.find(c => c.id === document.category);
            const status = getDocumentStatus(document);
            
            if (viewMode === 'list') {
              return (
                <Card key={document.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileIcon className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{document.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(document.size)}</span>
                          <span>•</span>
                          <span>{format(new Date(document.uploadDate), "PPP", { locale: ar })}</span>
                          {category && (
                            <>
                              <span>•</span>
                              <Badge className={category.color} variant="secondary">
                                {category.label}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <status.icon className={`h-4 w-4 ${status.color}`} />
                      <Button variant="outline" size="sm" onClick={() => previewDocument(document)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => downloadDocument(document)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(document.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileIcon className="h-10 w-10 text-primary" />
                    <div className="flex items-center gap-1">
                      <status.icon className={`h-4 w-4 ${status.color}`} />
                      <Button variant="ghost" size="sm" onClick={() => previewDocument(document)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h4 className="font-medium mb-2 line-clamp-2">{document.name}</h4>
                  {document.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {document.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {category && (
                      <Badge className={category.color} variant="secondary">
                        {category.label}
                      </Badge>
                    )}
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(document.size)}</span>
                      <span>{format(new Date(document.uploadDate), "MMM dd", { locale: ar })}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadDocument(document)}>
                        <Download className="h-3 w-3 mr-1" />
                        تحميل
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(document.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* نافذة رفع مستند */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>رفع مستند جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">اختيار الملف</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                className="mt-1"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
              />
              <p className="text-xs text-muted-foreground mt-1">
                الحد الأقصى: 50 ميجابايت. الصيغ المدعومة: PDF, Word, Excel, صور, فيديو
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم المستند</Label>
                <Input
                  id="name"
                  value={uploadData.name}
                  onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اسم المستند"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select value={uploadData.category} onValueChange={(value) => 
                  setUploadData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المستند..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">العلامات</Label>
                <Input
                  id="tags"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="علامة1, علامة2, علامة3"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">تاريخ انتهاء الصلاحية (اختياري)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={uploadData.expiryDate}
                  onChange={(e) => setUploadData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                إلغاء
              </Button>
              <Button disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'جاري الرفع...' : 'رفع المستند'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة معاينة المستند */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {React.createElement(getFileIcon(selectedDocument.type), { className: "h-5 w-5" })}
                {selectedDocument.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* معلومات المستند */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">الحجم</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedDocument.size)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">تاريخ الرفع</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedDocument.uploadDate), "PPP", { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">الفئة</p>
                  <p className="text-sm text-muted-foreground">
                    {documentCategories.find(c => c.id === selectedDocument.category)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">الحالة</p>
                  <p className="text-sm text-muted-foreground">{getDocumentStatus(selectedDocument).label}</p>
                </div>
              </div>

              {selectedDocument.description && (
                <div>
                  <h4 className="font-medium mb-2">الوصف</h4>
                  <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
                </div>
              )}

              {selectedDocument.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">العلامات</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* معاينة المحتوى */}
              <div className="border rounded-lg p-4 min-h-96 bg-muted/20">
                <p className="text-center text-muted-foreground">
                  معاينة المستند ستظهر هنا
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => downloadDocument(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  تحميل
                </Button>
                <Button variant="outline" onClick={() => {
                  // مشاركة المستند
                  toast({
                    title: "مشاركة المستند",
                    description: "تم نسخ رابط المستند",
                  });
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}