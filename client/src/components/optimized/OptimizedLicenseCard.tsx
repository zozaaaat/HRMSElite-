import React, {memo, useCallback, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Avatar, AvatarFallback} from '../ui/avatar';
import {
  Eye,
  Edit,
  FileText,
  Trash2,
  Calendar,
  MapPin,
  Building,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import {License} from '@/types/documents';

interface OptimizedLicenseCardProps {
  license: License;
  onView: (license: License) => void;
  onEdit: (license: License) => void;
  onAddDocument: (license: License) => void;
  onDelete: (licenseId: string) => void;
  isSelected?: boolean;
  onSelect?: (licenseId: string, selected: boolean) => void;
}

// Status icon component with memo
const StatusIcon = memo(({status}: { status: string }) => {

  const getStatusIcon = (status: string) => {

    switch (status) {

    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'expired':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'suspended':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;

    }

  };

  return getStatusIcon(status);

});

StatusIcon.displayName = 'StatusIcon';

// Status badge component with memo
const StatusBadge = memo(({status}: { status: string }) => {

  const getStatusVariant = (status: string) => {

    switch (status) {

    case 'active':
      return 'default';
    case 'expired':
      return 'destructive';
    case 'pending':
      return 'secondary';
    case 'suspended':
      return 'outline';
    default:
      return 'secondary';

    }

  };

  const getStatusText = (status: string) => {

    switch (status) {

    case 'active':
      return 'نشط';
    case 'expired':
      return 'منتهي الصلاحية';
    case 'pending':
      return 'قيد الانتظار';
    case 'suspended':
      return 'معلق';
    default:
      return 'غير محدد';

    }

  };

  return (
    <Badge variant={getStatusVariant(status)} className="text-xs">
      <StatusIcon status={status} />
      <span className="mr-1">{getStatusText(status)}</span>
    </Badge>
  );

});

StatusBadge.displayName = 'StatusBadge';

// License info component with memo
const LicenseInfo = memo(({license}: { license: License }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {license.company?.name || 'غير محدد'}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {license.location || 'غير محدد'}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        ينتهي في: {new Date(license.expiryDate).toLocaleDateString('ar-SA')}
      </span>
    </div>
  </div>
));

LicenseInfo.displayName = 'LicenseInfo';

// Action buttons component with memo
const ActionButtons = memo(({
  license,
  onView,
  onEdit,
  onAddDocument,
  onDelete
}: {
  license: License;
  onView: (license: License) => void;
  onEdit: (license: License) => void;
  onAddDocument: (license: License) => void;
  onDelete: (licenseId: string) => void;
}) => (
  <div className="flex gap-2 pt-2">
    <Button
      size="sm"
      variant="outline"
      onClick={() => onView(license)}
      className="flex-1"
    >
      <Eye className="h-4 w-4 ml-1" />
      عرض
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onEdit(license)}
      className="flex-1"
    >
      <Edit className="h-4 w-4 ml-1" />
      تعديل
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onAddDocument(license)}
      className="flex-1"
    >
      <FileText className="h-4 w-4 ml-1" />
      مستندات
    </Button>
    <Button
      size="sm"
      variant="outline"
      className="text-red-600 hover:text-red-700 flex-1"
      onClick={() => onDelete(license.id)}
    >
      <Trash2 className="h-4 w-4 ml-1" />
      حذف
    </Button>
  </div>
));

ActionButtons.displayName = 'ActionButtons';

// Main optimized license card component
const OptimizedLicenseCard = memo(({
  license,
  onView,
  onEdit,
  onAddDocument,
  onDelete,
  isSelected = false,
  onSelect
}: OptimizedLicenseCardProps) => {

  const [isHovered, setIsHovered] = useState(false);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleView = useCallback(() => {

    onView(license);

  }, [license, onView]);

  const handleEdit = useCallback(() => {

    onEdit(license);

  }, [license, onEdit]);

  const handleAddDocument = useCallback(() => {

    onAddDocument(license);

  }, [license, onAddDocument]);

  const handleDelete = useCallback(() => {

    onDelete(license.id);

  }, [license.id, onDelete]);

  const handleSelect = useCallback(() => {

    if (onSelect) {

      onSelect(license.id, !isSelected);

    }

  }, [license.id, isSelected, onSelect]);

  const isExpiringSoon = () => {

    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  };

  const isExpired = () => {

    const expiryDate = new Date(license.expiryDate);
    const now = new Date();
    return expiryDate < now;

  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isHovered ? 'scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {license.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {license.number}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={license.status} />
            {onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelect}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <LicenseInfo license={license} />

        {license.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {license.description}
          </p>
        )}

        {/* Warning for expiring licenses */}
        {isExpiringSoon() && !isExpired() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                ينتهي هذا الترخيص قريباً
              </span>
            </div>
          </div>
        )}

        {/* Warning for expired licenses */}
        {isExpired() && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 dark:text-red-200">
                هذا الترخيص منتهي الصلاحية
              </span>
            </div>
          </div>
        )}

        <ActionButtons
          license={license}
          onView={handleView}
          onEdit={handleEdit}
          onAddDocument={handleAddDocument}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );

});

OptimizedLicenseCard.displayName = 'OptimizedLicenseCard';

export default OptimizedLicenseCard;
