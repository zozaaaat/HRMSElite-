import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { FileUpload } from "@/components/file-upload";
import { 
  File, 
  FileText, 
  Image, 
  Download,
  Eye,
  Trash2,
  Upload,
  Search,
  Filter,
  FolderOpen,
  Clock,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  status: string;
  tags: string[];
}

export default function DocumentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // جلب المستندات
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // إحصائيات المستندات
  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.category === "contracts").length,
    policies: documents.filter(d => d.category === "policies").length,
    reports: documents.filter(d => d.category === "reports").length,
    certificates: documents.filter(d => d.category === "certificates").length
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />;
    if (type.includes("image")) return <Image className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      contracts: { label: "عقود", variant: "default" },
      policies: { label: "سياسات", variant: "secondary" },
      reports: { label: "تقارير", variant: "outline" },
      certificates: { label: "شهادات", variant: "default" }
    };
    
    const categoryInfo = categoryMap[category] || { label: category, variant: "outline" };
    return <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>;
  };

  const handleUpload = (files: File[]) => {
    toast({
      title: "تم رفع الملفات",
      description: `تم رفع ${files.length} ملف بنجاح`,
    });
    setShowUploadDialog(false);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // بيانات تجريبية
  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "عقد العمل - أحمد محمد.pdf",
      type: "application/pdf",
      category: "contracts",
      size: "2.5 MB",
      uploadedBy: "مدير الموارد البشرية",
      uploadDate: "2025-01-15",
      lastModified: "2025-01-15",
      status: "active",
      tags: ["عقود", "موظفين جدد"]
    },
    {
      id: "2",
      name: "سياسة العمل عن بعد.docx",
      type: "application/docx",
      category: "policies",
      size: "1.2 MB",
      uploadedBy: "الإدارة العليا",
      uploadDate: "2025-01-10",
      lastModified: "2025-01-20",
      status: "active",
      tags: ["سياسات", "العمل عن بعد"]
    },
    {
      id: "3",
      name: "تقرير الأداء السنوي 2024.xlsx",
      type: "application/xlsx",
      category: "reports",
      size: "5.8 MB",
      uploadedBy: "محلل الموارد البشرية",
      uploadDate: "2025-01-05",
      lastModified: "2025-01-05",
      status: "active",
      tags: ["تقارير", "أداء", "2024"]
    },
    {
      id: "4",
      name: "شهادة ISO 9001.pdf",
      type: "application/pdf",
      category: "certificates",
      size: "850 KB",
      uploadedBy: "مدير الجودة",
      uploadDate: "2024-12-20",
      lastModified: "2024-12-20",
      status: "active",
      tags: ["شهادات", "جودة", "ISO"]
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستندات</h1>
          <p className="text-muted-foreground mt-2">
            أرشيف وإدارة جميع مستندات الشركة
          </p>
        </div>
        
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              رفع مستند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>رفع مستندات جديدة</DialogTitle>
              <DialogDescription>
                اسحب الملفات أو انقر لاختيار المستندات المراد رفعها
              </DialogDescription>
            </DialogHeader>
            
            <FileUpload 
              onUpload={handleUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
              maxSize={10}
              maxFiles={5}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات المستندات */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory("all")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">جميع المستندات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory("contracts")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">العقود</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contracts}</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory("policies")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">السياسات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.policies}</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory("reports")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">التقارير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports}</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCategory("certificates")}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">الشهادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* البحث والفلترة */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>المستندات</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في المستندات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المستند</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الحجم</TableHead>
                <TableHead className="text-right">رفع بواسطة</TableHead>
                <TableHead className="text-right">تاريخ الرفع</TableHead>
                <TableHead className="text-right">آخر تعديل</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مستندات
                  </TableCell>
                </TableRow>
              ) : (
                mockDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(document.type)}
                        <span className="font-medium">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(document.category)}</TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell>{document.uploadedBy}</TableCell>
                    <TableCell>{format(new Date(document.uploadDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{format(new Date(document.lastModified), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}