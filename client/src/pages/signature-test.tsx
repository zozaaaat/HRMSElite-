import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {Button} from '../components/ui/button';
import {Badge} from '../components/ui/badge';
import SignatureCapture from '../components/signature-capture';
import {SignatureData} from '../types/documents';
import {
  FileText,
  Calendar,
  User,
  Building,
  FileCheck,
  Eye,
  Download
} from 'lucide-react';
import { t } from "i18next";

export default function SignatureTestPage () {

  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<{
    id: string;
    type: 'employee' | 'company' | 'license' | 'leave' | 'document';
    title: string;
  } | null>(null);

  const handleSignatureSave = (signatureData: SignatureData) => {

    setSignatures(prev => [...prev, signatureData]);
    setShowSignatureCapture(false);
    setCurrentEntity(null);

  };

  const handleStartSignature = (entity: {
    id: string;
    type: 'employee' | 'company' | 'license' | 'leave' | 'document';
    title: string;
  }) => {

    setCurrentEntity(entity);
    setShowSignatureCapture(true);

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

  const downloadSignature = (signature: SignatureData) => {

    if (typeof window === 'undefined' || !window.document) {
      return;
    }

    const link = window.document.createElement('a');
    link.download = signature.fileName ?? `signature_${Date.now()}.png`;
    link.href = signature.imageData;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);

  };

  const entities = [
    {
  'id': 'emp-001', 'type': 'employee' as const, 'title': 'أحمد محمد علي', 'description': 'موظف - قسم الموارد البشرية'
},
    {
  'id': 'comp-001', 'type': 'company' as const, 'title': 'شركة النيل الأزرق', 'description': 'شركة تجارية'
},
    {
  'id': 'lic-001', 'type': 'license' as const, 'title': 'ترخيص تجاري', 'description': 'ترخيص النشاط التجاري'
},
    {
  'id': 'leave-001', 'type': 'leave' as const, 'title': 'طلب إجازة سنوية', 'description': 'إجازة لمدة 5 أيام'
},
    {
  'id': 'doc-001', 'type': 'document' as const, 'title': 'عقد العمل', 'description': 'عقد عمل جديد'
}
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auto.signature-test.1')}</h1>
        <p className="text-gray-600">{t('auto.signature-test.2')}</p>
      </div>

      {/* قائمة الكيانات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('auto.signature-test.3')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entities.map((entity) => {

              const Icon = getEntityIcon(entity.type);
              return (
                <Card key={entity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getEntityColor(entity.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{entity.title}</h3>
                          <p className="text-xs text-gray-600">{entity.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entity.type}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleStartSignature(entity)}
                      size="sm"
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {t('auto.signature-test.4')}</Button>
                  </CardContent>
                </Card>
              );

            })}
          </div>
        </CardContent>
      </Card>

      {/* التوقيعات المحفوظة */}
      {signatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t('auto.signature-test.5')}{signatures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signatures.map((signature, index) => {

                const Icon = getEntityIcon(signature.entityType ?? "document");
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow">
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
                              {
  signature.uploadedAt ? new Date(signature.uploadedAt).toLocaleDateString('ar-SA') : 'غير محدد'
}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {signature.entityType}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <img
                          src={signature.imageData}
                          alt={t('auto.signature-test.13')}
                          className="w-full h-20 object-contain border rounded bg-white"
                          loading="lazy"
                          decoding="async"
                          width="320"
                          height="80"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadSignature(signature)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          {t('auto.signature-test.6')}</Button>
                        <Button
                          onClick={t('auto.signature-test.14')}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );

              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نافذة التقاط التوقيع */}
      {showSignatureCapture && currentEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <SignatureCapture
              entityId={currentEntity.id}
              entityType={currentEntity.type}
              onSave={handleSignatureSave}
              onCancel={() => {

                setShowSignatureCapture(false);
                setCurrentEntity(null);

              }}
              title={t('auto.signature-test.15')}
              description={t('auto.signature-test.16')}
            />
          </div>
        </div>
      )}

      {/* معلومات إضافية */}
      <Card>
        <CardHeader>
          <CardTitle>{t('auto.signature-test.7')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>{t('auto.signature-test.8')}</p>
          <p>{t('auto.signature-test.9')}</p>
          <p>{t('auto.signature-test.10')}</p>
          <p>{t('auto.signature-test.11')}</p>
          <p>{t('auto.signature-test.12')}</p>
        </CardContent>
      </Card>
    </div>
  );

}
