import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Textarea} from './ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Badge} from './ui/badge';
import {useToast} from '../hooks/use-toast';
import {
  FileText,
  X,
  Save,
  Edit,
  Download,
  Trash2,
  Calendar,
  User,
  Tag,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  PenTool
} from 'lucide-react';

import {Document, SignatureData} from '../types/documents';
import SignatureCapture from './signature-capture';
import logger from '../lib/logger';


interface DocumentFormProps {
  document?: Document;
  entityId?: string;
  entityType?: 'employee' | 'company' | 'license';
  onSave?: (document: Document) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
}

const documentCategories = [
  {'value': 'licenses', 'label': 'التراخيص التجارية', 'icon': FileText},
  {'value': 'employees', 'label': 'قوائم الموظفين', 'icon': FileText},
  {'value': 'import_docs', 'label': 'وثائق الاستيراد', 'icon': FileText},
  {'value': 'authorizations', 'label': 'الاعتمادات الرسمية', 'icon': FileText},
  {'value': 'establishment', 'label': 'عقود التأسيس', 'icon': FileText},
  {'value': 'delegation', 'label': 'كتب التفويض', 'icon': FileText},
  {'value': 'applications', 'label': 'طلبات رسمية', 'icon': FileText},
  {'value': 'identity_docs', 'label': 'وثائق الهوية', 'icon': FileText},
  {'value': 'reports', 'label': 'التقارير', 'icon': FileText},
  {'value': 'contracts', 'label': 'العقود', 'icon': FileText},
  {'value': 'guides', 'label': 'الأدلة', 'icon': FileText},
  {'value': 'other', 'label': 'أخرى', 'icon': FileText}
];

const getFileIcon = (mimeType?: string) => {

  if (!mimeType) {

    return FileText;

  }

  if (mimeType.includes('pdf')) {

    return FileText;

  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {

    return FileSpreadsheet;

  }
  if (mimeType.includes('image')) {

    return FileImage;

  }
  if (mimeType.includes('zip') || mimeType.includes('rar')) {

    return FileArchive;

  }

  return FileText;

};

const formatFileSize = (bytes?: number) => {

  if (!bytes) {

    return 'غير محدد';

  }

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;

};

export default function DocumentForm ({
  document,
  entityId,
  entityType,
  onSave,
  onCancel,
  mode = 'create'
}: DocumentFormProps) {

  const [formData, setFormData] = useState<Document>({
    'name': '',
    'type': '',
    'fileName': '',
    'fileUrl': '',
    'description': '',
    'category': '',
    'tags': [],
    'status': 'active',
    ...document
  });

  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [signature, setSignature] = useState<SignatureData | undefined>(document?.signature);
  const {toast} = useToast();

  useEffect(() => {

    if (document) {

      setFormData({
        'name': document.name ?? '',
        'type': document.type ?? '',
        'fileName': document.fileName ?? '',
        'fileUrl': document.fileUrl ?? '',
        'description': document.description ?? '',
        'category': document.category ?? '',
        'tags': document.tags ?? [],
        'status': document.status ?? "active",
        'entityId': document.entityId ?? entityId ?? '',
        'entityType': document.entityType ?? entityType ?? 'employee'
      });

    }

  }, [document, entityId, entityType]);

  const validateForm = () => {

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {

      newErrors.name = 'اسم المستند مطلوب';

    }

    if (!formData.category) {

      newErrors.category = 'فئة المستند مطلوبة';

    }

    if (mode === 'create' && !selectedFile) {

      newErrors.file = 'الملف مطلوب';

    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  };

  const handleFileChange = (event: React.ChangeEvent<globalThis.HTMLInputElement>) => {

    const file = event.target.files?.[0];
    if (file) {

      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        'fileName': file.name,
        'mimeType': file.type,
        'fileSize': file.size,
        'type': file.type
      }));

    }

  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!validateForm()) {

      toast({
        'title': 'خطأ في البيانات',
        'description': 'يرجى تصحيح الأخطاء في النموذج',
        'variant': 'destructive'
      });
      return;

    }

    setIsLoading(true);

    try {

      // في التطبيق الحقيقي، هنا يتم رفع الملف إلى الخادم
      const documentData: Document = {
        ...formData,
        'entityId': entityId ?? formData.entityId ?? '',
        'entityType': entityType ?? formData.entityType ?? 'employee',
        'uploadDate': new Date().toISOString(),
        'modifiedDate': new Date().toISOString()
      };

      if (onSave) {

        onSave(documentData);

      }

      toast({
        'title': 'تم الحفظ بنجاح',
        'description': mode === 'create' ? 'تم إنشاء المستند بنجاح' : 'تم تحديث المستند بنجاح'
      });

      if (onCancel) {

        onCancel();

      }

    } catch (error) {

      logger.error('Error saving document:', error);
      toast({
        'title': 'خطأ في الحفظ',
        'description': 'حدث خطأ أثناء حفظ المستند',
        'variant': 'destructive'
      });

    } finally {

      setIsLoading(false);

    }

  };

  const handleDownload = () => {

    if (formData.fileUrl) {

      window.open(formData.fileUrl, '_blank');

    }

  };

  const handleDelete = () => {

    if (window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {

      // في التطبيق الحقيقي، هنا يتم حذف المستند من الخادم
      toast({
        'title': 'تم الحذف',
        'description': 'تم حذف المستند بنجاح'
      });

      if (onCancel) {

        onCancel();

      }

    }

  };

  const handleSignatureSave = (signatureData: SignatureData) => {

    setSignature(signatureData);
    setShowSignatureCapture(false);
    setFormData(prev => ({
      ...prev,
      'signature': signatureData
    }));

  };

  if (mode === 'view') {

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            عرض المستند
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded">
              {
  React.createElement(getFileIcon(formData.mimeType), {
  'className': 'h-8 w-8 text-blue-600'
})
}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-sm text-gray-600">{formData.fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(formData.fileSize)}</p>
            </div>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 ml-1" />
              تحميل
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">الفئة</Label>
              <p className="mt-1 text-sm">{
  documentCategories.find(cat => cat.value === formData.category)?.label
}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">الحالة</Label>
              <Badge className="mt-1" variant={
  formData.status === 'active' ? 'default' : 'secondary'
}>
                {formData.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">تاريخ الرفع</Label>
              <p className="mt-1 text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {
  formData.uploadDate ? new Date(formData.uploadDate).toLocaleDateString('ar-SA') : 'غير محدد'
}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">تم الرفع بواسطة</Label>
              <p className="mt-1 text-sm flex items-center gap-1">
                <User className="h-3 w-3" />
                {formData.uploadedBy ?? "غير محدد"}
              </p>
            </div>
          </div>

          {formData.description && (
            <div>
              <Label className="text-sm font-medium text-gray-700">الوصف</Label>
              <p className="mt-1 text-sm text-gray-600">{formData.description}</p>
            </div>
          )}

          {formData.tags && formData.tags.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-700">العلامات</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 ml-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={onCancel} variant="outline">
              إغلاق
            </Button>
            <Button onClick={() => setFormData({...formData})} variant="outline">
              <Edit className="h-4 w-4 ml-1" />
              تعديل
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="h-4 w-4 ml-1" />
              حذف
            </Button>
          </div>
        </CardContent>
      </Card>
    );

  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {mode === 'create' ? 'إضافة مستند جديد' : 'تعديل المستند'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">اسم المستند *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, 'name': e.target.value}))}
                placeholder="أدخل اسم المستند"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="category">فئة المستند *</Label>
              <Select value={
  formData.category
} onValueChange={
  (value) => setFormData(prev => ({
  ...prev, 'category': value
}))
}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="اختر فئة المستند" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(category.icon, {'className': 'h-4 w-4'})}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>

            {mode === 'create' && (
              <div>
                <Label htmlFor="file">الملف *</Label>
                <div className="mt-1">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                    className={errors.file ? 'border-red-500' : ''}
                  />
                </div>
                {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-700">
                      تم اختيار: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, 'description': e.target.value}))}
                placeholder="أدخل وصف المستند (اختياري)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">العلامات</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') ?? ''}
                onChange={(e) => {

                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setFormData(prev => ({...prev, tags}));

                }}
                placeholder="أدخل العلامات مفصولة بفواصل"
              />
            </div>

            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select value={
  formData.status ?? 'active'
} onValueChange={
  (value) => setFormData(prev => ({
  ...prev, 'status': value as 'active' | 'inactive'
}))
}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* قسم التوقيع */}
            <div>
              <Label>التوقيع</Label>
              <div className="mt-2 space-y-2">
                {signature ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">تم إضافة التوقيع</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSignatureCapture(true)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          تعديل
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {

                            setSignature(undefined);
                            setFormData(prev => {
                              const updated = {...prev};
                              delete updated.signature;
                              return updated;
                            });

                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <img
                        src={signature.imageData}
                        alt="التوقيع"
                        className="w-full h-24 object-contain border rounded"
                        loading="lazy"
                        decoding="async"
                        width="384"
                        height="96"
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSignatureCapture(true)}
                    className="w-full"
                  >
                    <PenTool className="h-4 w-4 mr-1" />
                    إضافة توقيع
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* نافذة التقاط التوقيع */}
          {showSignatureCapture && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <SignatureCapture
                  entityId={entityId ?? ''}
                  entityType="document"
                  onSave={handleSignatureSave}
                  onCancel={() => setShowSignatureCapture(false)}
                  title="توقيع المستند"
                  description="قم بالتوقيع على المستند"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" onClick={onCancel} variant="outline">
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-1" />
                  {mode === 'create' ? 'إنشاء' : 'حفظ التغييرات'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

}
