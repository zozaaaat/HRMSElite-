import React, {useState} from 'react';
import {Card, CardContent} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../components/ui/tabs';
import {Badge} from '../components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '../components/ui/dialog';
import {useToast} from '../hooks/use-toast';
import {useTranslation} from 'react-i18next';
import DocumentForm from '../components/document-form';
import {
  FileText,
  FileImage,
  Filter,
  Upload,
  Search,
  FolderOpen,
  Plus,
  Eye,
  User,
  Calendar,
  Download,
  Trash2,
  Edit
} from 'lucide-react';

import {Document} from '../types/documents';

const mockDocuments: Document[] = [
  {
    'id': '1',
    'name': 'عقد العمل - أحمد محمد.pdf',
    'type': 'pdf',
    'size': '2.4 MB',
    'status': 'verified',
    'uploadedBy': 'أحمد محمد',
    'uploadedAt': '2024-01-15',
    'category': 'contracts',
    'description': 'عقد العمل الأساسي للموظف',
    'fileName': 'contract-ahmad-mohamed.pdf',
    'fileUrl': '/api/v1/documents/1/download',
    'fileSize': 2516582,
    'mimeType': 'application/pdf',
    'tags': ['عقد', 'أحمد محمد', 'توظيف']
  },
  {
    'id': '2',
    'name': 'صورة الهوية الوطنية.jpg',
    'type': 'image',
    'size': '1.8 MB',
    'status': 'pending',
    'uploadedBy': 'فاطمة أحمد',
    'uploadedAt': '2024-01-14',
    'category': 'personal',
    'description': 'صورة الهوية الوطنية للموظف',
    'fileName': 'national-id-photo.jpg',
    'fileUrl': '/api/v1/documents/2/download',
    'fileSize': 1887437,
    'mimeType': 'image/jpeg',
    'tags': ['هوية', 'صورة', 'شخصية']
  },
  {
    'id': '3',
    'name': 'تقرير الأداء الشهري.pdf',
    'type': 'pdf',
    'size': '3.2 MB',
    'status': 'verified',
    'uploadedBy': 'مدير الموارد البشرية',
    'uploadedAt': '2024-01-13',
    'category': 'reports',
    'description': 'تقرير الأداء الشهري للموظف',
    'fileName': 'monthly-performance-report.pdf',
    'fileUrl': '/api/v1/documents/3/download',
    'fileSize': 3355443,
    'mimeType': 'application/pdf',
    'tags': ['تقرير', 'أداء', 'شهري']
  }
];

export default function DocumentsPage () {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const {toast} = useToast();
  const {t} = useTranslation();

  const filteredDocuments = mockDocuments.filter(doc => {

    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (doc.category && doc.category === selectedCategory);
    return matchesSearch && matchesCategory;

  });

  const getStatusColor = (status: string | undefined) => {

    switch (status) {

    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';

    }

  };

  const getStatusText = (status: string | undefined) => {

    switch (status) {

    case 'verified':
      return 'تم التحقق';
    case 'pending':
      return 'قيد المراجعة';
    case 'rejected':
      return 'مرفوض';
    default:
      return 'غير محدد';

    }

  };

  const stats = [
    {
  'label': 'إجمالي المستندات', 'value': mockDocuments.length.toString(), 'icon': FileText, 'color': 'blue'
},
    {'label': 'مستندات جديدة', 'value': '23', 'icon': Plus, 'color': 'green'},
    {'label': 'قيد المراجعة', 'value': '8', 'icon': Eye, 'color': 'yellow'},
    {'label': 'تم التحقق', 'value': '116', 'icon': User, 'color': 'purple'},
    {'label': 'الحجم الإجمالي', 'value': '2.4 GB', 'icon': FolderOpen, 'color': 'indigo'}
  ];

  const handleSaveDocument = (documentData: Document) => {

    if (editingDocument) {

      // Update existing document
      const _updatedDocuments = mockDocuments.map(doc =>
        doc.id === editingDocument.id ? {...doc, ...documentData} : doc
      );
      // In real app, update state here
      toast({
        'title': 'تم التحديث بنجاح',
        'description': 'تم تحديث المستند بنجاح'
      });

    } else {
      // In real app, add to state here
      toast({
        'title': 'تم الإنشاء بنجاح',
        'description': 'تم إنشاء المستند الجديد بنجاح'
      });

    }
    setShowForm(false);
    setEditingDocument(null);

  };

  const handleEditDocument = (document: Document) => {

    setEditingDocument(document);
    setShowForm(true);

  };

  const handleViewDocument = (document: Document) => {

    setViewingDocument(document);

  };

  const handleDeleteDocument = (_documentId: string) => {

    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {

      // In real app, delete from state here
      toast({
        'title': 'تم الحذف بنجاح',
        'description': 'تم حذف المستند بنجاح'
      });

    }

  };

  return (
    <main role="main" className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('documents.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 ml-2" />
            فلترة
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <Upload className="h-4 w-4 ml-2" />
            رفع مستند
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <FolderOpen className="h-4 w-4" />
        <span>إجمالي المستندات: {mockDocuments.length}</span>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            الكل
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
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
            <FileText className="h-4 w-4" />
            إجازات
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{doc.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <Badge className={getStatusColor(doc.status ?? "pending")}>
                          {getStatusText(doc.status ?? "pending")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{doc.uploadedBy ?? "غير محدد"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{
  doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'
}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span>{doc.category ?? "غير محدد"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{doc.size ?? "غير محدد"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(doc)}
                    >
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
                      onClick={() => handleEditDocument(doc)}
                    >
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteDocument(doc.id ?? '')}
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                لا توجد مستندات
              </h3>
              <p className="text-gray-500">
                لم يتم العثور على مستندات تطابق معايير البحث
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'تعديل المستند' : 'إضافة مستند جديد'}
            </DialogTitle>
          </DialogHeader>
          <DocumentForm
            {...(editingDocument && { document: editingDocument })}
            onSave={handleSaveDocument}
            onCancel={() => {

              setShowForm(false);
              setEditingDocument(null);

            }}
            mode={editingDocument ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Document View Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المستند</DialogTitle>
          </DialogHeader>
          {viewingDocument && (
            <DocumentForm
              document={viewingDocument}
              onCancel={() => setViewingDocument(null)}
              mode="view"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );

}
