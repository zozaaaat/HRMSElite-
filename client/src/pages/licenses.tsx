import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Label} from '../components/ui/label';
import {Textarea} from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {Badge} from '../components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '../components/ui/dialog';
import {Alert, AlertDescription} from '../components/ui/alert';
import {useToast} from '../hooks/use-toast';
import DocumentForm from '../components/document-form';
import {
  Award,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Building2,
  FileText,
  FileSignature,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import {License, Company} from '../types/documents';

// Shared helpers and types
const getStatusColor = (status: string) => {
  switch (status) {
  case 'active':
    return 'bg-green-100 text-green-800';
  case 'expired':
    return 'bg-red-100 text-red-800';
  case 'pending':
    return 'bg-yellow-100 text-yellow-800';
  default:
    return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
  case 'active':
    return 'نشط';
  case 'expired':
    return 'منتهي الصلاحية';
  case 'pending':
    return 'قيد المراجعة';
  default:
    return 'غير محدد';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
  case 'active':
    return CheckCircle;
  case 'expired':
    return AlertTriangle;
  case 'pending':
    return Clock;
  default:
    return AlertCircle;
  }
};

type LicenseFormData = {
  name: string;
  type: string;
  number: string;
  companyId: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  location: string;
  description?: string;
  status: 'active' | 'expired' | 'pending';
};

const licenseTypes = [
  {'value': 'main', 'label': 'رئيسي', 'icon': Award},
  {'value': 'branch', 'label': 'فرع', 'icon': Building2},
  {'value': 'commercial', 'label': 'تجاري', 'icon': FileSignature},
  {'value': 'industrial', 'label': 'صناعي', 'icon': Building2},
  {'value': 'professional', 'label': 'مهني', 'icon': Shield},
  {'value': 'import_export', 'label': 'استيراد وتصدير', 'icon': TrendingUp},
  {'value': 'tailoring', 'label': 'خياطة', 'icon': Users},
  {'value': 'fabric', 'label': 'أقمشة', 'icon': FileText},
  {'value': 'jewelry', 'label': 'مجوهرات', 'icon': Award},
  {'value': 'restaurant', 'label': 'مطعم', 'icon': Building2},
  {'value': 'service', 'label': 'خدمات', 'icon': Shield}
];

const mockCompanies: Company[] = [
  {
    'id': 'company-1',
    'name': 'شركة النيل الأزرق للمجوهرات',
    'commercialFileNumber': '123456',
    'totalLicenses': 6,
    'activeLicenses': 5
  },
  {
    'id': 'company-2',
    'name': 'شركة قمة النيل الخالد',
    'commercialFileNumber': '234567',
    'totalLicenses': 4,
    'activeLicenses': 3
  },
  {
    'id': 'company-3',
    'name': 'شركة الاتحاد الخليجي للأقمشة',
    'commercialFileNumber': '345678',
    'totalLicenses': 3,
    'activeLicenses': 2
  }
];

const mockLicenses: License[] = [
  {
    'id': 'license-1',
    'companyId': 'company-1',
    'name': 'ترخيص النيل الأزرق الرئيسي - المباركية',
    'type': 'main',
    'number': 'LIC-2024-001',
    'status': 'active',
    'issueDate': '2024-01-15',
    'expiryDate': '2025-01-15',
    'issuingAuthority': 'وزارة التجارة والصناعة',
    'location': 'المباركية',
    'description': 'ترخيص تجاري رئيسي لشركة النيل الأزرق للمجوهرات في المباركية',
    'isActive': true,
    'createdAt': '2024-01-15T10:30:00Z',
    'updatedAt': '2024-12-20T14:22:00Z',
    'company': {
      'name': 'شركة النيل الأزرق للمجوهرات',
      'commercialFileNumber': '123456'
    },
    'employees': [
      {'id': 'emp-1', 'name': 'أحمد محمد علي', 'position': 'مدير'},
      {'id': 'emp-2', 'name': 'فاطمة أحمد', 'position': 'محاسب'}
    ]
  },
  {
    'id': 'license-2',
    'companyId': 'company-1',
    'name': 'ترخيص فرع الجهراء',
    'type': 'branch',
    'number': 'LIC-2024-002',
    'status': 'active',
    'issueDate': '2024-02-20',
    'expiryDate': '2025-02-20',
    'issuingAuthority': 'وزارة التجارة والصناعة',
    'location': 'الجهراء',
    'description': 'ترخيص فرع لشركة النيل الأزرق في الجهراء',
    'isActive': true,
    'createdAt': '2024-02-20T13:20:00Z',
    'updatedAt': '2024-12-20T13:20:00Z',
    'company': {
      'name': 'شركة النيل الأزرق للمجوهرات',
      'commercialFileNumber': '123456'
    },
    'employees': [
      {'id': 'emp-3', 'name': 'محمد علي حسن', 'position': 'مدير الفرع'}
    ]
  },
  {
    'id': 'license-3',
    'companyId': 'company-2',
    'name': 'ترخيص قمة النيل التجاري',
    'type': 'commercial',
    'number': 'LIC-2024-003',
    'status': 'active',
    'issueDate': '2024-03-10',
    'expiryDate': '2025-03-10',
    'issuingAuthority': 'وزارة التجارة والصناعة',
    'location': 'الصفاة',
    'description': 'ترخيص تجاري لشركة قمة النيل الخالد',
    'isActive': true,
    'createdAt': '2024-03-10T11:45:00Z',
    'updatedAt': '2024-12-20T16:22:00Z',
    'company': {
      'name': 'شركة قمة النيل الخالد',
      'commercialFileNumber': '234567'
    },
    'employees': [
      {'id': 'emp-4', 'name': 'خالد محمد', 'position': 'مدير عام'},
      {'id': 'emp-5', 'name': 'سارة أحمد', 'position': 'محاسب'}
    ]
  },
  {
    'id': 'license-4',
    'companyId': 'company-3',
    'name': 'ترخيص الاتحاد الخليجي للأقمشة',
    'type': 'fabric',
    'number': 'LIC-2023-004',
    'status': 'expired',
    'issueDate': '2023-12-20',
    'expiryDate': '2024-12-20',
    'issuingAuthority': 'وزارة التجارة والصناعة',
    'location': 'فحيحيل',
    'description': 'ترخيص تجاري لشركة الاتحاد الخليجي للأقمشة',
    'isActive': false,
    'createdAt': '2023-12-20T11:30:00Z',
    'updatedAt': '2024-12-20T14:15:00Z',
    'company': {
      'name': 'شركة الاتحاد الخليجي للأقمشة',
      'commercialFileNumber': '345678'
    },
    'employees': []
  }
];

export default function LicensesPage () {

  const [licenses, setLicenses] = useState<License[]>(mockLicenses);
  const [companies, _setCompanies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [viewingLicense, setViewingLicense] = useState<License | null>(null);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [selectedLicenseForDocuments,
   setSelectedLicenseForDocuments] = useState<License | null>(null);
  const {toast} = useToast();

  const filteredLicenses = licenses.filter(license => {

    const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = selectedCompany === 'all' || license.companyId === selectedCompany;
    const matchesStatus = selectedStatus === 'all' || license.status === selectedStatus;
    const matchesType = selectedType === 'all' || license.type === selectedType;

    return matchesSearch && matchesCompany && matchesStatus && matchesType;

  });

  // moved helpers to module scope above

  const isExpiringSoon = (expiryDate: string) => {

    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;

  };

  const isExpired = (expiryDate: string) => {

    return new Date(expiryDate) < new Date();

  };

  const stats = [
    {
      'label': 'إجمالي التراخيص',
      'value': licenses.length.toString(),
      'icon': Award,
      'color': 'blue',
      'change': '+12%',
      'changeType': 'increase'
    },
    {
      'label': 'التراخيص النشطة',
      'value': licenses.filter(l => l.status === 'active').length.toString(),
      'icon': CheckCircle,
      'color': 'green',
      'change': '+5%',
      'changeType': 'increase'
    },
    {
      'label': 'منتهية الصلاحية',
      'value': licenses.filter(l => l.status === 'expired').length.toString(),
      'icon': AlertTriangle,
      'color': 'red',
      'change': '-2%',
      'changeType': 'decrease'
    },
    {
      'label': 'قيد المراجعة',
      'value': licenses.filter(l => l.status === 'pending').length.toString(),
      'icon': Clock,
      'color': 'yellow',
      'change': '+3%',
      'changeType': 'increase'
    }
  ];

  const handleSaveLicense = (licenseData: LicenseFormData) => {

    if (editingLicense) {

      // Update existing license
      setLicenses(prev => prev.map(l =>
        l.id === editingLicense.id ? {
          ...l,
          ...licenseData,
          isActive: licenseData.status === 'active',
          updatedAt: new Date().toISOString()
        } : l
      ));
      toast({
        'title': 'تم التحديث بنجاح',
        'description': 'تم تحديث الترخيص بنجاح'
      });

    } else {

      // Create new license
      const newLicense: License = {
        id: `license-${Date.now()}`,
        companyId: licenseData.companyId,
        name: licenseData.name,
        type: licenseData.type,
        number: licenseData.number,
        status: licenseData.status,
        issueDate: licenseData.issueDate,
        expiryDate: licenseData.expiryDate,
        issuingAuthority: licenseData.issuingAuthority,
        location: licenseData.location,
        ...(licenseData.description && { description: licenseData.description }),
        documents: [],
        isActive: licenseData.status === 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLicenses(prev => [...prev, newLicense]);
      toast({
        'title': 'تم الإنشاء بنجاح',
        'description': 'تم إنشاء الترخيص الجديد بنجاح'
      });

    }
    setShowForm(false);
    setEditingLicense(null);

  };

  const handleDeleteLicense = (licenseId: string) => {

    if (window.confirm('هل أنت متأكد من حذف هذا الترخيص؟')) {

      setLicenses(prev => prev.filter(l => l.id !== licenseId));
      toast({
        'title': 'تم الحذف بنجاح',
        'description': 'تم حذف الترخيص بنجاح'
      });

    }

  };

  const handleEditLicense = (license: License) => {

    setEditingLicense(license);
    setShowForm(true);

  };

  const handleViewLicense = (license: License) => {

    setViewingLicense(license);

  };

  const handleAddDocument = (license: License) => {

    setSelectedLicenseForDocuments(license);
    setShowDocumentForm(true);

  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة التراخيص</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 ml-2" />
            فلترة
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة ترخيص
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={
  `text-xs ${
  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
}`
}>
                    {stat.change} من الشهر الماضي
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="البحث في التراخيص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger>
            <SelectValue placeholder="جميع الشركات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الشركات</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger>
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="expired">منتهي الصلاحية</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue placeholder="جميع الأنواع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {licenseTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Alerts for Expiring Licenses */}
      {licenses.filter(l => isExpiringSoon(l.expiryDate)).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            هناك {
  licenses.filter(l => isExpiringSoon(l.expiryDate)).length
} ترخيص سينتهي خلال 30 يوم
          </AlertDescription>
        </Alert>
      )}

      {/* Licenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLicenses.map((license) => {

          const StatusIcon = getStatusIcon(license.status);
          const LicenseTypeIcon = licenseTypes.find(t => t.value === license.type)?.icon ?? Award;

          return (
            <Card key={license.id} className={`hover:shadow-lg transition-shadow ${
              isExpired(license.expiryDate) ? 'border-red-200 bg-red-50'
                : isExpiringSoon(license.expiryDate) ? 'border-yellow-200 bg-yellow-50' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded">
                      <LicenseTypeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{license.name}</CardTitle>
                      <p className="text-sm text-gray-600">{license.number}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(license.status)}>
                    <StatusIcon className="h-3 w-3 ml-1" />
                    {getStatusText(license.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span>{license.company?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{license.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>ينتهي في: {
  new Date(license.expiryDate).toLocaleDateString('ar-SA')
}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{license.employees?.length ?? 0} موظف</span>
                  </div>
                </div>

                {license.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {license.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewLicense(license)}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLicense(license)}
                  >
                    <Edit className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddDocument(license)}
                  >
                    <FileText className="h-4 w-4 ml-1" />
                    مستندات
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteLicense(license.id)}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          );

        })}
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لا توجد تراخيص
          </h3>
          <p className="text-gray-500">
            لم يتم العثور على تراخيص تطابق معايير البحث
          </p>
        </div>
      )}

      {/* License Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLicense ? 'تعديل الترخيص' : 'إضافة ترخيص جديد'}
            </DialogTitle>
          </DialogHeader>
          <LicenseForm
            license={editingLicense}
            companies={companies}
            onSave={handleSaveLicense}
            onCancel={() => {

              setShowForm(false);
              setEditingLicense(null);

            }}
          />
        </DialogContent>
      </Dialog>

      {/* License View Dialog */}
      <Dialog open={!!viewingLicense} onOpenChange={() => setViewingLicense(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الترخيص</DialogTitle>
          </DialogHeader>
          {viewingLicense && (
            <LicenseView license={viewingLicense} />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Form Dialog */}
      <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة مستند للترخيص</DialogTitle>
          </DialogHeader>
          {selectedLicenseForDocuments && (
            <DocumentForm
              entityId={selectedLicenseForDocuments.id}
              entityType="license"
              onSave={(_document) => {

                // Handle document save
                setShowDocumentForm(false);
                setSelectedLicenseForDocuments(null);

              }}
              onCancel={() => {

                setShowDocumentForm(false);
                setSelectedLicenseForDocuments(null);

              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

}

// License Form Component
interface LicenseFormProps {
  license?: License | null;
  companies: Company[];
  onSave: (license: LicenseFormData) => void;
  onCancel: () => void;
}

function LicenseForm ({license, companies, onSave, onCancel}: LicenseFormProps) {

  const [formData, setFormData] = useState<LicenseFormData>({
    name: '',
    type: '',
    number: '',
    companyId: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    location: '',
    description: '',
    status: 'active',
    ...(license ? {
      name: license.name,
      type: license.type,
      number: license.number,
      companyId: license.companyId,
      issueDate: license.issueDate,
      expiryDate: license.expiryDate,
      issuingAuthority: license.issuingAuthority,
      location: license.location,
      description: license.description ?? '',
      status: license.status
    } : {})
  });

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    onSave(formData);

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">اسم الترخيص *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({...prev, 'name': e.target.value}))}
            placeholder="أدخل اسم الترخيص"
            required
          />
        </div>
        <div>
          <Label htmlFor="number">رقم الترخيص *</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData(prev => ({...prev, 'number': e.target.value}))}
            placeholder="أدخل رقم الترخيص"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="companyId">الشركة *</Label>
          <Select value={
  formData.companyId
} onValueChange={
  (value) => setFormData(prev => ({
  ...prev, 'companyId': value
}))
}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الشركة" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">نوع الترخيص *</Label>
          <Select value={
  formData.type
} onValueChange={
  (value) => setFormData(prev => ({
  ...prev, 'type': value
}))
}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الترخيص" />
            </SelectTrigger>
            <SelectContent>
              {licenseTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issueDate">تاريخ الإصدار *</Label>
          <Input
            id="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={(e) => setFormData(prev => ({...prev, 'issueDate': e.target.value}))}
            required
          />
        </div>
        <div>
          <Label htmlFor="expiryDate">تاريخ انتهاء الصلاحية *</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData(prev => ({...prev, 'expiryDate': e.target.value}))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issuingAuthority">جهة الإصدار *</Label>
          <Input
            id="issuingAuthority"
            value={formData.issuingAuthority}
            onChange={(e) => setFormData(prev => ({...prev, 'issuingAuthority': e.target.value}))}
            placeholder="أدخل جهة الإصدار"
            required
          />
        </div>
        <div>
          <Label htmlFor="location">الموقع *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({...prev, 'location': e.target.value}))}
            placeholder="أدخل الموقع"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({...prev, 'description': e.target.value}))}
          placeholder="أدخل وصف الترخيص (اختياري)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="status">الحالة</Label>
        <Select value={
  formData.status
} onValueChange={
  (value) => setFormData(prev => ({
  ...prev, 'status': value as 'active' | 'expired' | 'pending'
}))
}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="expired">منتهي الصلاحية</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" onClick={onCancel} variant="outline">
          إلغاء
        </Button>
        <Button type="submit">
          {license ? 'حفظ التغييرات' : 'إنشاء الترخيص'}
        </Button>
      </div>
    </form>
  );

}

// License View Component
interface LicenseViewProps {
  license: License;
}

function LicenseView ({license}: LicenseViewProps) {

  const LicenseTypeIcon = licenseTypes.find(t => t.value === license.type)?.icon ?? Award;
  const StatusIcon = getStatusIcon(license.status);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <LicenseTypeIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{license.name}</h2>
            <p className="text-gray-600">{license.number}</p>
          </div>
        </div>
        <Badge className={getStatusColor(license.status)}>
          <StatusIcon className="h-4 w-4 ml-1" />
          {getStatusText(license.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">الشركة</Label>
            <p className="mt-1">{license.company?.name}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">نوع الترخيص</Label>
            <p className="mt-1">{licenseTypes.find(t => t.value === license.type)?.label}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">جهة الإصدار</Label>
            <p className="mt-1">{license.issuingAuthority}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">الموقع</Label>
            <p className="mt-1">{license.location}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">تاريخ الإصدار</Label>
            <p className="mt-1">{new Date(license.issueDate).toLocaleDateString('ar-SA')}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">تاريخ انتهاء الصلاحية</Label>
            <p className="mt-1">{new Date(license.expiryDate).toLocaleDateString('ar-SA')}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">عدد الموظفين</Label>
            <p className="mt-1">{license.employees?.length ?? 0} موظف</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">تاريخ الإنشاء</Label>
            <p className="mt-1">{new Date(license.createdAt).toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      </div>

      {license.description && (
        <div>
          <Label className="text-sm font-medium text-gray-700">الوصف</Label>
          <p className="mt-1 text-gray-600">{license.description}</p>
        </div>
      )}

      {license.employees && license.employees.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700">الموظفون المرتبطون</Label>
          <div className="mt-2 space-y-2">
            {license.employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{employee.name}</span>
                <Badge variant="outline">{employee.position}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}
