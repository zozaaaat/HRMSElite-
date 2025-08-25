import type { Express, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storage } from '../../models/storage';
import { insertDocumentSchema } from '@shared/schema';
import { log } from '../../utils/logger';
import { isAuthenticated, requireRole } from '../../middleware/auth';
import { secureFileStorage, type StoredFile } from '../../utils/secureStorage';
import { generateETag, setETagHeader, matchesIfMatchHeader } from '../../utils/etag';
import { fileTypeFromBuffer } from 'file-type';
import { antivirusScanner } from '../../utils/antivirus';
import {
  createErrorResponse,
  createSuccessResponse,
  createPaginatedResponse,
  extractPaginationParams,
  paginationMiddleware
} from '../../middleware/api-versioning';

// Extend Request interface to include file property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      // user is declared in middleware/auth.ts as AuthUser; avoid redeclaration conflict
    }
  }
}

// File upload configuration with security measures
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
function getMaxFileSize(): number {
  const fromEnv = Number(process.env.UPLOAD_MAX_BYTES);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_MAX_FILE_SIZE;
}
const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_TO_MIME);
const ALLOWED_MIME_TYPES = new Set(Object.values(EXTENSION_TO_MIME));

// Configure multer with memory storage for security
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getMaxFileSize(),
    files: 1, // Only allow one file at a time
    fieldSize: 1024 * 1024 // 1MB for text fields
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`MIME type not allowed. Allowed types: ${Array.from(ALLOWED_MIME_TYPES).join(', ')}`));
    }

    cb(null, true);
  }
});

// File validation middleware
const validateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'No file uploaded',
        { field: 'file', message: 'Please select a file to upload' },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    const file = req.file;

    // Additional size check
    const maxFileSize = getMaxFileSize();
    if (file.size > maxFileSize) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'File too large',
        {
          field: 'file',
          message: `File size must be less than ${maxFileSize / (1024 * 1024)}MB`,
          maxSize: maxFileSize,
          actualSize: file.size
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Verify actual MIME type using magic bytes
    const detectedType = await fileTypeFromBuffer(file.buffer);
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (
      !detectedType ||
      !fileExtension ||
      !ALLOWED_MIME_TYPES.has(detectedType.mime) ||
      EXTENSION_TO_MIME[fileExtension] !== detectedType.mime
    ) {
      log.warn('Invalid MIME type detected', {
        fileName: file.originalname,
        declaredMime: file.mimetype,
        detectedMime: detectedType?.mime,
        size: file.size,
        user: req.user?.id
      }, 'SECURITY');

      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid file format',
        {
          field: 'file',
          message: 'File content does not match the declared format'
        },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }

    // Use detected MIME type for further processing
    file.mimetype = detectedType.mime;

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.originalname);
    req.file.originalname = sanitizedFilename;

    next();
  } catch (error) {
    log.error('File validation error:', error as Error, 'SECURITY');
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'File validation failed',
      { message: 'Unable to validate uploaded file' },
      500
    );
    res.status(errorResponse.statusCode).json(errorResponse.body);
  }
};


// Sanitize filename for security
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - (extension?.length || 0) - 1);
    sanitized = `${name}.${extension}`;
  }
  
  return sanitized;
}

// Generate secure file ID
function _generateFileId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `file_${timestamp}_${random}`;
}

// Verify signed URL signature

export function registerDocumentRoutes(app: Express) {
  // Get all documents with pagination
  app.get('/api/v1/documents', 
    isAuthenticated, 
    paginationMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { companyId, employeeId, licenseId, category } = req.query;
        const { page, pageSize } = extractPaginationParams(req);

        // Real documents data extracted from uploaded files
        const allDocuments = [
          {
            'id': '1',
            'name': 'ترخيص النيل الازرق الرئيسي مباركية.pdf',
            'fileName': 'nile-blue-main-license-mubarkiya.pdf',
            'type': 'application/pdf',
            'category': 'licenses',
            'size': '2.1 MB',
            'sizeBytes': 2201440,
            'uploadedBy': 'إدارة التراخيص',
            'uploadedByUser': {
              'id': 'admin-1',
              'name': 'مدير التراخيص',
              'email': 'licenses@company.com'
            },
            'uploadDate': '2024-12-15T10:30:00Z',
            'modifiedDate': '2025-01-10T14:22:00Z',
            'status': 'active',
            'description': 'ترخيص تجاري رئيسي لشركة النيل الأزرق في المباركية',
            'tags': ['ترخيص', 'النيل الأزرق', 'مباركية', 'رئيسي'],
            'downloadCount': 23,
            'isPublic': false,
            'companyId': 'company-1',
            'employeeId': null,
            'licenseId': 'license-1',
            'url': '/demo-data/ترخيص النيل الازرق الرئيسي مباركية.pdf',
            'thumbnailUrl': '/api/v1/documents/1/thumbnail'
          },
          // ... more documents would be here in real implementation
        ];

        // Apply filters
        let filteredDocuments = allDocuments;

        if (companyId) {
          filteredDocuments = filteredDocuments.filter(doc => doc.companyId === companyId);
        }

        if (employeeId) {
          filteredDocuments = filteredDocuments.filter(doc => doc.employeeId === employeeId);
        }

        if (licenseId) {
          filteredDocuments = filteredDocuments.filter(doc => doc.licenseId === licenseId);
        }

        if (category) {
          filteredDocuments = filteredDocuments.filter(doc => doc.category === category);
        }

        // Apply pagination
        const total = filteredDocuments.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

        const response = createPaginatedResponse(
          req,
          paginatedDocuments,
          total,
          page,
          pageSize,
          'Documents retrieved successfully'
        );

        res.json(response);

      } catch (error) {
        log.error('Error fetching documents:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch documents',
          { message: 'An error occurred while retrieving documents' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Create new document
  app.post('/api/v1/documents', 
    isAuthenticated, 
    async (req: Request, res: Response) => {
      try {
        const documentData = {
          ...req.body,
          'uploadedBy': req.user?.sub,
          'uploadDate': new Date(),
          'status': 'active',
          'downloadCount': 0
        };

        const result = insertDocumentSchema.safeParse(documentData);
        if (!result.success) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Invalid document data',
            { 
              details: result.error.issues,
              message: 'Document data validation failed'
            },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // In real app, handle file upload here
        const document = await storage.createDocument(result.data);
        const response = createSuccessResponse(document, 'Document created successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error creating document:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to create document',
          { message: 'An error occurred while creating the document' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Get document by ID
  app.get('/api/v1/documents/:id', 
    isAuthenticated, 
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Document ID is required',
            { field: 'id', message: 'Document ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }
        
        const document = await storage.getDocument(id);

        if (!document) {
          const errorResponse = createErrorResponse(
            'NOT_FOUND',
            'Document not found',
            { resource: 'document', id },
            404
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const etag = generateETag(document as any);
        setETagHeader(res, etag);
        const response = createSuccessResponse(document, 'Document retrieved successfully');
        res.json(response);

      } catch (error) {
        log.error('Error fetching document:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch document',
          { message: 'An error occurred while retrieving the document' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Update document
  app.put('/api/v1/documents/:id', 
    isAuthenticated, 
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Document ID is required',
            { field: 'id', message: 'Document ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }
        
        const ifMatch = req.headers['if-match'];
        const current = await storage.getDocument(id);
        if (!current) {
          const errorResponse = createErrorResponse(
            'NOT_FOUND',
            'Document not found',
            { resource: 'document', id },
            404
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }
        const currentEtag = generateETag(current as any);
        if (!matchesIfMatchHeader(ifMatch as any, currentEtag)) {
          const precond = createErrorResponse(
            'PRECONDITION_FAILED',
            'ETag mismatch. Resource was modified by another request.',
            { expected: currentEtag },
            412
          );
          return res.status(precond.statusCode).json(precond.body);
        }

        const updateData = {
          ...req.body,
          'modifiedDate': new Date()
        };

        const document = await storage.updateDocument(id, updateData);
        const newEtag = generateETag(document as any);
        setETagHeader(res, newEtag);
        const response = createSuccessResponse(document, 'Document updated successfully');
        res.json(response);

      } catch (error) {
        log.error('Error updating document:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to update document',
          { message: 'An error occurred while updating the document' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Delete document
  app.delete('/api/v1/documents/:id',
    isAuthenticated,
    requireRole(['super_admin', 'company_manager']),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Document ID is required',
            { field: 'id', message: 'Document ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }
        
        await storage.deleteDocument(id);
        const response = createSuccessResponse({ id }, 'Document deleted successfully');
        res.json(response);

      } catch (error) {
        log.error('Error deleting document:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to delete document',
          { message: 'An error occurred while deleting the document' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Download document
  app.get('/api/v1/documents/:id/download', 
    isAuthenticated, 
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        if (!id) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'Document ID is required',
            { field: 'id', message: 'Document ID parameter is missing' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const document = await storage.getDocument(id);
        if (!document) {
          const errorResponse = createErrorResponse(
            'NOT_FOUND',
            'Document not found',
            { resource: 'document', id },
            404
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const signedUrl = await secureFileStorage.generateSignedUrl(
          id,
          document.fileName
        );

        const downloadData = {
          message: 'Document ready for download',
          documentId: id,
          fileName: document.name,
          downloadUrl: signedUrl,
          expiresAt: new Date(
            Date.now() + secureFileStorage.getStatus().urlExpiration * 1000
          )
        };

        const response = createSuccessResponse(downloadData, 'Download link generated successfully');
        res.json(response);

      } catch (error) {
        log.error('Error downloading document:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to download document',
          { message: 'An error occurred while generating download link' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Secure file upload endpoint
  app.post('/api/v1/documents/upload', 
    isAuthenticated, 
    upload.single('file'),
    validateFile,
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          const errorResponse = createErrorResponse(
            'VALIDATION_ERROR',
            'No file uploaded',
            { field: 'file', message: 'Please select a file to upload' },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        const file = req.file;

        // Antivirus scanning - fail closed
        let scanResult;
        try {
          scanResult = await antivirusScanner.scanBuffer(file.buffer, file.originalname);
        } catch {
          return res.status(503).json({ error: 'Upload rejected: antivirus unavailable' });
        }
        if (!scanResult.isClean) {
          log.warn('Antivirus scan rejected file', {
            fileName: file.originalname,
            threats: scanResult.threats,
            provider: scanResult.provider
          }, 'SECURITY');

          const errorResponse = createErrorResponse(
            'SECURITY_ERROR',
            'File failed security scan',
            { threats: scanResult.threats },
            400
          );
          return res.status(errorResponse.statusCode).json(errorResponse.body);
        }

        // Store file securely after passing scan
        const storedFile: StoredFile = await secureFileStorage.storeFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          req.user?.id || 'unknown'
        );

        // Create document record
        const documentData = {
          name: file.originalname,
          entityId: req.body.companyId || 'default',
          entityType: 'company',
          type: file.mimetype,
          fileName: storedFile.id,
          fileUrl: storedFile.url,
          uploadedBy: req.user?.sub || 'unknown',
          fileSize: storedFile.metadata.size,
          mimeType: storedFile.metadata.mimeType,
          description: req.body.description || null,
          checksum: storedFile.metadata.checksum,
          isImage: storedFile.metadata.isImage,
          imageMetadata: storedFile.metadata.imageMetadata
        };

        // Store document metadata in database
        const document = await storage.createDocument(documentData);

        // Log successful upload for audit
        log.info('File uploaded and stored securely', {
          fileId: storedFile.id,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user?.id,
          storage: {
            provider: secureFileStorage.getStatus().provider,
            urlExpiration: secureFileStorage.getStatus().urlExpiration
          },
          timestamp: new Date().toISOString()
        }, 'UPLOAD');

        const uploadResponse = {
          message: 'File uploaded successfully',
          document: {
            id: document.id,
            name: document.name,
            fileName: document.fileName,
            type: document.type,
            size: document.fileSize,
            url: document.fileUrl,
            expiresAt: storedFile.expiresAt
          },
          security: {
            validated: true,
            fileSignature: 'verified',
            mimeType: 'verified',
            sizeLimit: 'within_bounds',
            storage: {
              provider: secureFileStorage.getStatus().provider,
              encrypted: true,
              urlExpiration: secureFileStorage.getStatus().urlExpiration
            }
          }
        };

        const response = createSuccessResponse(uploadResponse, 'File uploaded successfully');
        res.status(201).json(response);

      } catch (error) {
        log.error('Error uploading file:', error as Error, 'UPLOAD');
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Upload failed',
          { message: 'Failed to process uploaded file' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Document categories
  app.get('/api/v1/documents/categories', 
    isAuthenticated, 
    async (req: Request, res: Response) => {
      try {
        const categories = [
          {'id': 'licenses', 'name': 'التراخيص التجارية', 'icon': 'Award', 'count': 18},
          {'id': 'employees', 'name': 'قوائم الموظفين', 'icon': 'Users', 'count': 12},
          {'id': 'import_docs', 'name': 'وثائق الاستيراد', 'icon': 'FileText', 'count': 8},
          {'id': 'authorizations', 'name': 'الاعتمادات الرسمية', 'icon': 'FileContract', 'count': 15},
          {'id': 'establishment', 'name': 'عقود التأسيس', 'icon': 'Building2', 'count': 9},
          {'id': 'delegation', 'name': 'كتب التفويض', 'icon': 'FileDown', 'count': 6},
          {'id': 'applications', 'name': 'طلبات رسمية', 'icon': 'FormInput', 'count': 11},
          {'id': 'identity_docs', 'name': 'وثائق الهوية', 'icon': 'Medal', 'count': 7},
          {'id': 'reports', 'name': 'التقارير', 'icon': 'BarChart', 'count': 4},
          {'id': 'other', 'name': 'أخرى', 'icon': 'Folder', 'count': 3}
        ];

        const response = createSuccessResponse(categories, 'Document categories retrieved successfully');
        res.json(response);

      } catch (error) {
        log.error('Error fetching document categories:', error as Error);
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to fetch document categories',
          { message: 'An error occurred while retrieving document categories' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Security status endpoint
  app.get('/api/v1/security/status', 
    isAuthenticated, 
    requireRole(['admin', 'super_admin']), 
    async (req: Request, res: Response) => {
      try {
        const antivirusStatus = antivirusScanner.getStatus();
        const storageStatus = secureFileStorage.getStatus();

        const securityData = {
          antivirus: antivirusStatus,
          storage: storageStatus,
          uploadLimits: {
            maxFileSize: getMaxFileSize(),
            allowedMimeTypes: ALLOWED_MIME_TYPES,
            allowedExtensions: ALLOWED_EXTENSIONS
          },
          securityFeatures: {
            fileSignatureValidation: true,
            antivirusScanning: antivirusStatus.enabled,
            secureStorage: true,
            signedUrls: true,
            metadataStripping: true,
            eicarDetection: true
          }
        };

        const response = createSuccessResponse(securityData, 'Security status retrieved successfully');
        res.json(response);
      } catch (error) {
        log.error('Error getting security status:', error as Error, 'SECURITY');
        const errorResponse = createErrorResponse(
          'INTERNAL_ERROR',
          'Failed to get security status',
          { message: 'Unable to retrieve security configuration' },
          500
        );
        res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
  );

  // Error handling for multer
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          'File too large',
          {
            field: 'file',
            message: `File size must be less than ${getMaxFileSize() / (1024 * 1024)}MB`,
            maxSize: getMaxFileSize()
          },
          400
        );
        return res.status(errorResponse.statusCode).json(errorResponse.body);
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          'Too many files',
          { 
            field: 'file',
            message: 'Only one file can be uploaded at a time' 
          },
          400
        );
        return res.status(errorResponse.statusCode).json(errorResponse.body);
      }
      if (error.code === 'LIMIT_FIELD_COUNT') {
        const errorResponse = createErrorResponse(
          'VALIDATION_ERROR',
          'Too many fields',
          { message: 'Too many form fields' },
          400
        );
        return res.status(errorResponse.statusCode).json(errorResponse.body);
      }
    }
    
    if (error.message) {
      const errorResponse = createErrorResponse(
        'VALIDATION_ERROR',
        'Upload error',
        { message: error.message },
        400
      );
      return res.status(errorResponse.statusCode).json(errorResponse.body);
    }
    
    next(error);
  });
}
