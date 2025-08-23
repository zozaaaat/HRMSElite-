import React, {memo, useCallback, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '../ui/card';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {Avatar, AvatarFallback} from '../ui/avatar';
import {
  Eye,
  Edit,
  Download,
  Trash2,
  Calendar,
  FileText,
  User,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react';
import {Document} from '@/types/documents';
import {useTranslation} from 'react-i18next';

interface OptimizedDocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
  isSelected?: boolean;
  onSelect?: (documentId: string, selected: boolean) => void;
}

// File type icon component with memo
const FileTypeIcon = memo(({type, fileName}: { type: string; fileName: string }) => {

  const getFileIcon = (type: string, fileName: string) => {

    const extension = fileName.split('.').pop()?.toLowerCase();

    // Check by MIME type first
    if (type.startsWith('image/')) {

      return <FileImage className="h-4 w-4 text-blue-600" />;

    }
    if (type.startsWith('video/')) {

      return <FileVideo className="h-4 w-4 text-purple-600" />;

    }
    if (type.startsWith('audio/')) {

      return <FileAudio className="h-4 w-4 text-green-600" />;

    }
    if (type.includes('pdf')) {

      return <FileText className="h-4 w-4 text-red-600" />;

    }
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) {

      return <Archive className="h-4 w-4 text-orange-600" />;

    }

    // Check by file extension
    switch (extension) {

    case 'pdf':
      return <FileText className="h-4 w-4 text-red-600" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-4 w-4 text-blue-600" />;
    case 'xls':
    case 'xlsx':
      return <FileText className="h-4 w-4 text-green-600" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="h-4 w-4 text-orange-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImage className="h-4 w-4 text-blue-600" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo className="h-4 w-4 text-purple-600" />;
    case 'mp3':
    case 'wav':
    case 'flac':
      return <FileAudio className="h-4 w-4 text-green-600" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className="h-4 w-4 text-orange-600" />;
    default:
      return <File className="h-4 w-4 text-gray-600" />;

    }

  };

  return getFileIcon(type, fileName);

});

FileTypeIcon.displayName = 'FileTypeIcon';

// Document type badge component with memo
const DocumentTypeBadge = memo(({type}: { type: string }) => {

  const getTypeVariant = (type: string) => {

    switch (type) {

    case 'contract':
      return 'default';
    case 'license':
      return 'secondary';
    case 'id':
      return 'outline';
    case 'certificate':
      return 'destructive';
    default:
      return 'secondary';

    }

  };

  const {t} = useTranslation();

  const getTypeText = (type: string) => {
    switch (type) {
    case 'contract':
      return t('documents.card.contract');
    case 'license':
      return t('documents.card.license');
    case 'id':
      return t('documents.card.id');
    case 'certificate':
      return t('documents.card.certificate');
    default:
      return t('documents.card.document');
    }
  };

  return (
    <Badge variant={getTypeVariant(type)} className="text-xs">
      {getTypeText(type)}
    </Badge>
  );

});

DocumentTypeBadge.displayName = 'DocumentTypeBadge';

// Document info component with memo
const DocumentInfo = memo(({document}: { document: Document }) => {
  const {t, i18n} = useTranslation();
  const uploadedAtString = document.uploadDate ?? document.uploadedAt ?? document.modifiedDate;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {document.entityType === 'employee'
            ? t('documents.card.employee')
            : document.entityType === 'company'
              ? t('documents.card.company')
              : document.entityType === 'license'
                ? t('documents.card.license')
                : t('documents.card.unknown')}
        </span>
      </div>
      {uploadedAtString && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t('documents.card.uploadedAt')} {new Date(uploadedAtString).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US')}
          </span>
        </div>
      )}
      {document.fileSize && (
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatFileSize(document.fileSize, t)}
          </span>
        </div>
      )}
    </div>
  );
});

DocumentInfo.displayName = 'DocumentInfo';

// Action buttons component with memo
const ActionButtons = memo(({  
  document,
  onView,
  onEdit,
  onDownload,
  onDelete
}: {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
}) => {
  const {t} = useTranslation();
  return (
    <div className="flex gap-2 pt-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onView(document)}
        className="flex-1"
      >
        <Eye className="h-4 w-4 ml-1" />
        {t('documents.card.view')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDownload(document)}
        className="flex-1"
      >
        <Download className="h-4 w-4 ml-1" />
        {t('documents.card.download')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(document)}
        className="flex-1"
      >
        <Edit className="h-4 w-4 ml-1" />
        {t('documents.card.edit')}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 flex-1"
        onClick={() => onDelete(document.id ?? '')}
      >
        <Trash2 className="h-4 w-4 ml-1" />
        {t('documents.card.delete')}
      </Button>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

// Helper function to format file size
const formatFileSize = (bytes: number, t: ReturnType<typeof useTranslation>['t']): string => {

  if (bytes === 0) {

    return `0 ${t('documents.card.size.bytes')}`;

  }

  const k = 1024;
  const sizes = [
    t('documents.card.size.bytes'),
    t('documents.card.size.kb'),
    t('documents.card.size.mb'),
    t('documents.card.size.gb')
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;

};

// Main optimized document card component
const OptimizedDocumentCard = memo(({  
  document,
  onView,
  onEdit,
  onDownload,
  onDelete,
  isSelected = false,
  onSelect
}: OptimizedDocumentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const {t} = useTranslation();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleView = useCallback(() => {

    onView(document);

  }, [document, onView]);

  const handleEdit = useCallback(() => {

    onEdit(document);

  }, [document, onEdit]);

  const handleDownload = useCallback(() => {

    onDownload(document);

  }, [document, onDownload]);

  const handleDelete = useCallback(() => {

    onDelete(document.id ?? '');

  }, [document.id, onDelete]);

  const handleSelect = useCallback(() => {

    if (onSelect) {

      onSelect(document.id ?? '', !isSelected);

    }

  }, [document.id, isSelected, onSelect]);

  const getFileName = () => {

    if (document.fileName) {

      return document.fileName;

    }
    if (document.fileUrl) {

      return document.fileUrl.split('/').pop() ?? t('documents.card.document');

    }
    return t('documents.card.document');

  };

  const getFileType = () => {

    if (document.mimeType) {

      return document.mimeType;

    }
    const fileName = getFileName();
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension) {

      switch (extension) {

      case 'pdf':
        return 'application/pdf';
      case 'doc':
      case 'docx':
        return 'application/msword';
      case 'xls':
      case 'xlsx':
        return 'application/vnd.ms-excel';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';

      }

    }
    return 'application/octet-stream';

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
                <FileTypeIcon type={getFileType()} fileName={getFileName()} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {document.name || getFileName()}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {document.category || getFileName()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DocumentTypeBadge type={document.type} />
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
        <DocumentInfo document={document} />

        {document.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {document.description}
          </p>
        )}

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <ActionButtons
          document={document}
          onView={handleView}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );

});

OptimizedDocumentCard.displayName = 'OptimizedDocumentCard';

export default OptimizedDocumentCard;
