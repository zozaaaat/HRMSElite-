import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Badge} from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {useToast} from '../hooks/use-toast';
import SignatureCapture from '../components/signature-capture';
import {
  getAllSignatures,
  deleteSignature,
  getSignatureStats,
  uploadSignatureToCloud,
  convertSignatureToPDF,
  verifySignature,
  SignatureResponse
} from '../services/signature';
import {SignatureData} from '../types/documents';
import { logger } from '../lib/logger';
import {
  FileText,
  Calendar,
  User,
  Building,
  FileCheck,
  Download,
  Trash2,
  Upload,
  FileImage,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  BarChart3,
  Plus,
  Edit,
  FileDown,
  Shield
} from 'lucide-react';

type SignatureStats = {
  total: number;
  active: number;
  inactive: number;
  recentUploads: number;
};

export default function SignaturesPage () {

  const [signatures, setSignatures] = useState<SignatureResponse[]>([]);
  const [filteredSignatures, setFilteredSignatures] = useState<SignatureResponse[]>([]);
  const [stats, setStats] = useState<SignatureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState<SignatureResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const {toast} = useToast();

  // تحميل البيانات
  useEffect(() => {

    loadSignatures();
    loadStats();

  }, []);

  // تطبيق الفلاتر
  useEffect(() => {

    let filtered = signatures;

    // فلتر البحث
    if (searchTerm) {

      filtered = filtered.filter(sig => {
        const fileNameMatch = sig.fileName.toLowerCase().includes(searchTerm.toLowerCase());
        const entityIdMatch = sig.entityId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
        const uploadedByMatch = sig.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
        return fileNameMatch || entityIdMatch || uploadedByMatch;
      });

    }

    // فلتر النوع
    if (filterType !== 'all') {

      filtered = filtered.filter(sig => sig.entityType === filterType);

    }

    // فلتر الحالة
    if (filterStatus !== 'all') {

      filtered = filtered.filter(sig => sig.status === filterStatus);

    }

    setFilteredSignatures(filtered);

  }, [signatures, searchTerm, filterType, filterStatus]);

  const loadSignatures = async () => {

    try {

      const data = await getAllSignatures();
      setSignatures(data);

    } catch (error) {

      logger.error('Error loading signatures:', error);
      toast({
        'title': 'خطأ في تحميل التوقيعات',
        'description': 'حدث خطأ أثناء تحميل قائمة التوقيعات',
        'variant': 'destructive'
      });

    } finally {

      setLoading(false);

    }

  };

  const loadStats = async () => {

    try {

      const data = await getSignatureStats();
      setStats(data);

    } catch (error) {

      logger.error('Error loading stats:', error);

    }

  };

  const handleDeleteSignature = async (id: string) => {

    if (!window.confirm('هل أنت متأكد من حذف هذا التوقيع؟')) {

      return;

    }

    try {

      await deleteSignature(id);
      setSignatures(prev => prev.filter(sig => sig.id !== id));
      toast({
        'title': 'تم الحذف بنجاح',
        'description': 'تم حذف التوقيع بنجاح'
      });

    } catch (error) {

      logger.error('Error deleting signature:', error);
      toast({
        'title': 'خطأ في الحذف',
        'description': 'حدث خطأ أثناء حذف التوقيع',
        'variant': 'destructive'
      });

    }

  };

  const handleDownloadSignature = (signature: SignatureResponse) => {

    const link = window.document.createElement('a');
    link.download = signature.fileName;
    link.href = signature.imageData;
    link.click();

  };

  const handleUploadToCloud = async (signature: SignatureResponse) => {

    try {

      const url = await uploadSignatureToCloud(signature.imageData, signature.fileName);
      toast({
        'title': 'تم الرفع بنجاح',
        'description': `تم رفع التوقيع إلى السحابة: ${url}`
      });

    } catch (error) {

      logger.error('Error uploading to cloud:', error);
      toast({
        'title': 'خطأ في الرفع',
        'description': 'حدث خطأ أثناء رفع التوقيع إلى السحابة',
        'variant': 'destructive'
      });

    }

  };

  const handleConvertToPDF = async (signature: SignatureResponse) => {

    try {

      const blob = await convertSignatureToPDF(signature.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${signature.fileName.replace('.png', '')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        'title': 'تم التحويل بنجاح',
        'description': 'تم تحويل التوقيع إلى PDF'
      });

    } catch (error) {

      logger.error('Error converting to PDF:', error);
      toast({
        'title': 'خطأ في التحويل',
        'description': 'حدث خطأ أثناء تحويل التوقيع إلى PDF',
        'variant': 'destructive'
      });

    }

  };

  const handleVerifySignature = async (signature: SignatureResponse) => {

    try {

      const result = await verifySignature(signature.id);
      toast({
        'title': result.isValid ? 'التوقيع صحيح' : 'التوقيع غير صحيح',
        'description': `تم التحقق من التوقيع بواسطة ${result.verifiedBy}`,
        'variant': result.isValid ? 'default' : 'destructive'
      });

    } catch (error) {

      logger.error('Error verifying signature:', error);
      toast({
        'title': 'خطأ في التحقق',
        'description': 'حدث خطأ أثناء التحقق من التوقيع',
        'variant': 'destructive'
      });

    }

  };

  const getEntityIcon = (type: string) => {

    switch (type) {

    case 'employee':
      return User;
    case 'company':
      return Building;
    case 'license':
      return FileCheck;
    case 'leave':
      return Calendar;
    case 'document':
      return FileText;
    default:
      return FileText;

    }

  };

  const getEntityColor = (type: string) => {

    switch (type) {

    case 'employee':
      return 'bg-blue-100 text-blue-800';
    case 'company':
      return 'bg-green-100 text-green-800';
    case 'license':
      return 'bg-purple-100 text-purple-800';
    case 'leave':
      return 'bg-orange-100 text-orange-800';
    case 'document':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';

    }

  };

  if (loading) {

    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );

  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة التوقيعات</h1>
          <p className="text-gray-600">إدارة وتنظيم جميع التوقيعات في النظام</p>
        </div>
        <Button onClick={() => setShowSignatureCapture(true)}>
          <Plus className="h-4 w-4 mr-1" />
          إضافة توقيع جديد
        </Button>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي التوقيعات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التوقيعات النشطة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التوقيعات غير النشطة</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الرفوعات الحديثة</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.recentUploads}</p>
                </div>
                <Upload className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="البحث في التوقيعات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type-filter">نوع الكيان</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="employee">موظف</SelectItem>
                  <SelectItem value="company">شركة</SelectItem>
                  <SelectItem value="license">ترخيص</SelectItem>
                  <SelectItem value="leave">إجازة</SelectItem>
                  <SelectItem value="document">مستند</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {

                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');

                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-1" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة التوقيعات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            التوقيعات ({filteredSignatures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSignatures.length === 0 ? (
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد توقيعات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignatures.map((signature) => {

                const Icon = getEntityIcon(signature.entityType ?? "document");
                return (
                  <Card key={signature.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={
  `p-2 rounded-lg ${
  getEntityColor(signature.entityType ?? "document")
}`
}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{signature.fileName}</h3>
                            <p className="text-xs text-gray-600">
                              {new Date(signature.uploadedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={
  signature.status === 'active' ? 'default' : 'secondary'
} className="text-xs">
                            {signature.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {signature.entityType}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <img
                          src={signature.imageData}
                          alt="التوقيع"
                          className="w-full h-24 object-contain border rounded bg-white"
                          loading="lazy"
                          decoding="async"
                          width="384"
                          height="96"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleDownloadSignature(signature)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          تحميل
                        </Button>
                        <Button
                          onClick={() => handleUploadToCloud(signature)}
                          size="sm"
                          variant="outline"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          رفع
                        </Button>
                        <Button
                          onClick={() => handleConvertToPDF(signature)}
                          size="sm"
                          variant="outline"
                        >
                          <FileDown className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                        <Button
                          onClick={() => handleVerifySignature(signature)}
                          size="sm"
                          variant="outline"
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          تحقق
                        </Button>
                        <Button
                          onClick={() => setSelectedSignature(signature)}
                          size="sm"
                          variant="outline"
                          className="col-span-2"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          تعديل
                        </Button>
                        <Button
                          onClick={() => handleDeleteSignature(signature.id)}
                          size="sm"
                          variant="destructive"
                          className="col-span-2"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );

              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة التقاط التوقيع */}
      {showSignatureCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <SignatureCapture
              onSave={(_signatureData: SignatureData) => {

                // هنا يمكن إضافة منطق حفظ التوقيع
                setShowSignatureCapture(false);
                loadSignatures(); // إعادة تحميل القائمة

              }}
              onCancel={() => setShowSignatureCapture(false)}
              title="إضافة توقيع جديد"
              description="قم بالتوقيع في المساحة أدناه"
            />
          </div>
        </div>
      )}

      {/* نافذة تعديل التوقيع */}
      {selectedSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <SignatureCapture
              mode="edit"
              existingSignature={selectedSignature}
              onSave={(_signatureData: SignatureData) => {

                setSelectedSignature(null);
                loadSignatures(); // إعادة تحميل القائمة

              }}
              onCancel={() => setSelectedSignature(null)}
              title="تعديل التوقيع"
              description="قم بتعديل التوقيع"
            />
          </div>
        </div>
      )}
    </div>
  );

}
