import type {Express, Request, Response, NextFunction} from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { storage} from '../models/storage';
import {insertDocumentSchema} from '@shared/schema';
import {log} from '@utils/logger';
import { isAuthenticated, requireRole } from '../middleware/auth';
import { antivirusScanner, type ScanResult } from '../utils/antivirus';
import { secureFileStorage, type StoredFile } from '../utils/secureStorage';
import { quarantineFile } from '../utils/quarantine';
import crypto from 'node:crypto';
import { env } from '../utils/env';

// Extend Request interface to include file property
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      user?: any;
    }
  }
}

// File upload configuration with security measures
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // docx
];

const ALLOWED_EXTENSIONS = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'docx'
];

// File signature validation for security
const FILE_SIGNATURES = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/png': [0x89, 0x50, 0x4E, 0x47], // PNG
  'image/jpeg': [0xFF, 0xD8, 0xFF], // JPEG
  'image/jpg': [0xFF, 0xD8, 0xFF], // JPG
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04] // ZIP (DOCX is a ZIP file)
};

// Configure multer with memory storage for security
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
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
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`MIME type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }

    cb(null, true);
  }
});

// File validation middleware
const validateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const file = req.file;
    
    // Additional size check
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: 'File too large',
        message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    // Validate file signature (magic bytes) for security
    const isValidSignature = await validateFileSignature(file.buffer, file.mimetype);
    if (!isValidSignature) {
      log.warn('Invalid file signature detected', {
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        user: req.user?.id
      }, 'SECURITY');
      
      return res.status(400).json({
        error: 'Invalid file format',
        message: 'File content does not match the declared format'
      });
    }

    // Additional security checks
    const fileType = await fileTypeFromBuffer(file.buffer);
    if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      log.warn('File type mismatch detected', {
        fileName: file.originalname,
        declaredMime: file.mimetype,
        actualMime: fileType?.mime,
        user: req.user?.id
      }, 'SECURITY');
      
      return res.status(400).json({
        error: 'File type mismatch',
        message: 'File content does not match the declared type'
      });
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.originalname);
    req.file.originalname = sanitizedFilename;

    next();
  } catch (error) {
    log.error('File validation error:', error as Error, 'SECURITY');
    res.status(500).json({
      error: 'File validation failed',
      message: 'Unable to validate uploaded file'
    });
  }
};

// Antivirus scanning middleware
const scanFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const file = req.file;
    
    // Perform antivirus scan
    const scanResult: ScanResult = await antivirusScanner.scanBuffer(file.buffer, file.originalname);
    
    if (!scanResult.isClean) {
      await quarantineFile(file.buffer, file.originalname);
      log.error('Virus detected in uploaded file', {
        fileName: file.originalname,
        threats: scanResult.threats,
        provider: scanResult.provider,
        user: req.user?.id,
        severity: 'high'
      }, 'SECURITY');

      return res.status(422).json({
        error: 'Virus detected',
        message: 'The uploaded file contains malicious content and has been quarantined',
        threats: scanResult.threats,
        scanProvider: scanResult.provider
      });
    }

    // Add scan result to request for logging
    (req as any).scanResult = scanResult;

    log.info('File passed antivirus scan', {
      fileName: file.originalname,
      scanTime: scanResult.scanTime,
      provider: scanResult.provider,
      user: req.user?.id
    }, 'SECURITY');

    next();
  } catch (error) {
    log.error('Antivirus scan failed', error as Error, 'SECURITY');
    res.status(500).json({
      error: 'Security scan failed',
      message: 'Unable to complete security scan - file rejected'
    });
  }
};

// Validate file signature (magic bytes)
async function validateFileSignature(buffer: Buffer, mimeType: string): Promise<boolean> {
  try {
    const expectedSignature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
    if (!expectedSignature) {
      return false;
    }

    // Check if buffer starts with expected signature
    for (let i = 0; i < expectedSignature.length; i++) {
      if (buffer[i] !== expectedSignature[i]) {
        return false;
      }
    }

    return true;
  } catch (error) {
    log.error('Error validating file signature:', error as Error, 'SECURITY');
    return false;
  }
}

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
function generateFileId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `file_${timestamp}_${random}`;
}

// Antivirus scanning middleware
const scanFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const file = req.file;
    
    // Perform antivirus scan
    const scanResult: ScanResult = await antivirusScanner.scanBuffer(file.buffer, file.originalname);
    
    if (!scanResult.isClean) {
      await quarantineFile(file.buffer, file.originalname);
      log.error('Virus detected in uploaded file', {
        fileName: file.originalname,
        threats: scanResult.threats,
        provider: scanResult.provider,
        user: req.user?.id,
        severity: 'high'
      }, 'SECURITY');

      return res.status(422).json({
        error: 'Virus detected',
        message: 'The uploaded file contains malicious content and has been quarantined',
        threats: scanResult.threats,
        scanProvider: scanResult.provider
      });
    }

    // Add scan result to request for logging
    (req as any).scanResult = scanResult;

    log.info('File passed antivirus scan', {
      fileName: file.originalname,
      scanTime: scanResult.scanTime,
      provider: scanResult.provider,
      user: req.user?.id
    }, 'SECURITY');

    next();
  } catch (error) {
    log.error('Antivirus scan failed', error as Error, 'SECURITY');
    res.status(500).json({
      error: 'Security scan failed',
      message: 'Unable to complete security scan - file rejected'
    });
  }
};

// Verify signed URL signature
function verifySignedUrl(fileId: string, expires: string, signature: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.FILE_SIGNATURE_SECRET)
      .update(`${fileId}:${expires}`)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

// Verify signed URL signature
function verifySignedUrl(fileId: string, expires: string, signature: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', env.FILE_SIGNATURE_SECRET)
      .update(`${fileId}:${expires}`)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export function registerDocumentRoutes (app: Express) {

  // Document routes use proper authentication middleware

  // Documents routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {

    try {

      const {companyId, employeeId, licenseId, category} = req.query;

      // Real documents data extracted from uploaded files
      const documents = [
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
          'thumbnailUrl': '/api/documents/1/thumbnail'
        },
        {
          'id': '2',
          'name': 'اسماء عمال شركة النيل الازرق جميع التراخيص جورج.xlsx',
          'fileName': 'nile-blue-employees-all-licenses.xlsx',
          'type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'category': 'employees',
          'size': '1.8 MB',
          'sizeBytes': 1887437,
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadedByUser': {
            'id': 'hr-1',
            'name': 'مدير الموارد البشرية',
            'email': 'hr@nileblue.com'
          },
          'uploadDate': '2025-01-05T09:15:00Z',
          'modifiedDate': '2025-01-20T11:30:00Z',
          'status': 'active',
          'description': 'قائمة شاملة بأسماء موظفي شركة النيل الأزرق لجميع التراخيص',
          'tags': ['موظفين', 'النيل الأزرق', 'تراخيص', 'قائمة'],
          'downloadCount': 15,
          'isPublic': false,
          'companyId': 'company-1',
          'employeeId': null,
          'licenseId': null,
          'url': '/demo-data/اسماء عمال شركة النيل الازرق جميع التراخيص جورج.xlsx',
          'thumbnailUrl': '/api/documents/2/thumbnail'
        },
        {
          'id': '3',
          'name': 'استيراد النيل الازرق للمجوهرات 2025.pdf',
          'fileName': 'nile-blue-jewelry-import-2025.pdf',
          'type': 'application/pdf',
          'category': 'import_docs',
          'size': '3.2 MB',
          'sizeBytes': 3355443,
          'uploadedBy': 'إدارة الاستيراد',
          'uploadedByUser': {
            'id': 'import-1',
            'name': 'مدير الاستيراد',
            'email': 'import@nileblue.com'
          },
          'uploadDate': '2025-01-01T08:00:00Z',
          'modifiedDate': '2025-01-01T08:00:00Z',
          'status': 'active',
          'description': 'وثائق استيراد المجوهرات لشركة النيل الأزرق للعام 2025',
          'tags': ['استيراد', 'مجوهرات', '2025', 'النيل الأزرق'],
          'downloadCount': 8,
          'isPublic': false,
          'companyId': 'company-1',
          'employeeId': null,
          'licenseId': null,
          'url': '/demo-data/استيراد النيل الازرق للمجوهرات 2025.pdf',
          'thumbnailUrl': '/api/documents/3/thumbnail'
        },
        {
          'id': '4',
          'name': 'اعتماد النيل الازرق 20250528.pdf',
          'fileName': 'nile-blue-authorization-20250528.pdf',
          'type': 'application/pdf',
          'category': 'authorizations',
          'size': '1.5 MB',
          'sizeBytes': 1572864,
          'uploadedBy': 'الإدارة القانونية',
          'uploadedByUser': {
            'id': 'legal-1',
            'name': 'المستشار القانوني',
            'email': 'legal@nileblue.com'
          },
          'uploadDate': '2025-05-28T13:20:00Z',
          'modifiedDate': '2025-05-28T13:20:00Z',
          'status': 'active',
          'description': 'اعتماد رسمي لشركة النيل الأزرق للمجوهرات',
          'tags': ['اعتماد', 'رسمي', 'النيل الأزرق'],
          'downloadCount': 12,
          'isPublic': false,
          'companyId': 'company-1',
          'employeeId': null,
          'licenseId': 'license-1',
          'url': '/demo-data/اعتماد النيل الازرق 20250528.pdf',
          'thumbnailUrl': '/api/documents/4/thumbnail'
        },
        {
          'id': '5',
          'name': 'ترخيص قمة النيل.pdf',
          'fileName': 'qammat-nile-license.pdf',
          'type': 'application/pdf',
          'category': 'licenses',
          'size': '2.3 MB',
          'sizeBytes': 2411724,
          'uploadedBy': 'إدارة التراخيص',
          'uploadedByUser': {
            'id': 'admin-2',
            'name': 'مدير التراخيص',
            'email': 'licenses@qammatnile.com'
          },
          'uploadDate': '2024-11-15T10:45:00Z',
          'modifiedDate': '2025-01-05T16:22:00Z',
          'status': 'active',
          'description': 'ترخيص تجاري لشركة قمة النيل للتجارة',
          'tags': ['ترخيص', 'قمة النيل', 'تجاري'],
          'downloadCount': 18,
          'isPublic': false,
          'companyId': 'company-2',
          'employeeId': null,
          'licenseId': 'license-2',
          'url': '/demo-data/ترخيص قمة النيل.pdf',
          'thumbnailUrl': '/api/documents/5/thumbnail'
        },
        {
          'id': '6',
          'name': 'اسماء عمال شركة قمة النيل الخالد جميع التراخيص - - Copy.xlsx',
          'fileName': 'qammat-nile-employees-all-licenses.xlsx',
          'type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'category': 'employees',
          'size': '1.9 MB',
          'sizeBytes': 1992294,
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadedByUser': {
            'id': 'hr-2',
            'name': 'مدير الموارد البشرية',
            'email': 'hr@qammatnile.com'
          },
          'uploadDate': '2025-01-10T14:20:00Z',
          'modifiedDate': '2025-01-15T09:45:00Z',
          'status': 'active',
          'description': 'قائمة موظفي شركة قمة النيل الخالد لجميع التراخيص',
          'tags': ['موظفين', 'قمة النيل', 'قائمة شاملة'],
          'downloadCount': 11,
          'isPublic': false,
          'companyId': 'company-2',
          'employeeId': null,
          'licenseId': null,
          'url': '/demo-data/اسماء عمال شركة قمة النيل الخالد جميع التراخيص - - Copy.xlsx',
          'thumbnailUrl': '/api/documents/6/thumbnail'
        },
        {
          'id': '7',
          'name': 'ترخيص الاتحاد الخليجي للاقمشة 2023.pdf',
          'fileName': 'gulf-union-fabrics-license-2023.pdf',
          'type': 'application/pdf',
          'category': 'licenses',
          'size': '2.0 MB',
          'sizeBytes': 2097152,
          'uploadedBy': 'إدارة التراخيص',
          'uploadedByUser': {
            'id': 'admin-3',
            'name': 'مدير التراخيص',
            'email': 'licenses@gulf-union.com'
          },
          'uploadDate': '2023-12-20T11:30:00Z',
          'modifiedDate': '2024-01-05T14:15:00Z',
          'status': 'active',
          'description': 'ترخيص تجاري لشركة الاتحاد الخليجي للأقمشة لعام 2023',
          'tags': ['ترخيص', 'الاتحاد الخليجي', 'أقمشة', '2023'],
          'downloadCount': 25,
          'isPublic': false,
          'companyId': 'company-3',
          'employeeId': null,
          'licenseId': 'license-3',
          'url': '/demo-data/ترخيص الاتحاد الخليجي للاقمشة 2023.pdf',
          'thumbnailUrl': '/api/documents/7/thumbnail'
        },
        {
          'id': '8',
          'name': 'اسماء عمال شركة الاتحاد الخليجي جميع التراخيص (2).xlsx',
          'fileName': 'gulf-union-employees-all-licenses.xlsx',
          'type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'category': 'employees',
          'size': '1.7 MB',
          'sizeBytes': 1782579,
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadedByUser': {
            'id': 'hr-3',
            'name': 'مدير الموارد البشرية',
            'email': 'hr@gulf-union.com'
          },
          'uploadDate': '2025-01-08T16:45:00Z',
          'modifiedDate': '2025-01-12T10:20:00Z',
          'status': 'active',
          'description': 'قائمة موظفي شركة الاتحاد الخليجي لجميع التراخيص',
          'tags': ['موظفين', 'الاتحاد الخليجي', 'قائمة'],
          'downloadCount': 9,
          'isPublic': false,
          'companyId': 'company-3',
          'employeeId': null,
          'licenseId': null,
          'url': '/demo-data/اسماء عمال شركة الاتحاد الخليجي جميع التراخيص (2).xlsx',
          'thumbnailUrl': '/api/documents/8/thumbnail'
        },
        {
          'id': '2',
          'name': 'دليل الموظف الجديد.pdf',
          'fileName': 'employee-handbook.pdf',
          'type': 'application/pdf',
          'category': 'guides',
          'size': '1.8 MB',
          'sizeBytes': 1887437,
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadedByUser': {
            'id': 'admin-1',
            'name': 'أحمد المدير',
            'email': 'admin@company.com'
          },
          'uploadDate': '2025-01-10T09:15:00Z',
          'modifiedDate': '2025-01-10T09:15:00Z',
          'status': 'active',
          'description': 'دليل شامل للموظفين الجدد يتضمن جميع المعلومات اللازمة',
          'tags': ['دليل', 'موظف جديد', 'تدريب'],
          'downloadCount': 78,
          'isPublic': true,
          'companyId': 'company-1',
          'employeeId': null,
          'licenseId': null,
          'url': '/api/documents/2/download',
          'thumbnailUrl': '/api/documents/2/thumbnail'
        },
        {
          'id': '3',
          'name': 'عقد عمل - أحمد محمد.pdf',
          'fileName': 'contract-ahmad-mohamed.pdf',
          'type': 'application/pdf',
          'category': 'contracts',
          'size': '456 KB',
          'sizeBytes': 467456,
          'uploadedBy': 'إدارة الموارد البشرية',
          'uploadedByUser': {
            'id': 'admin-1',
            'name': 'أحمد المدير',
            'email': 'admin@company.com'
          },
          'uploadDate': '2025-01-05T11:45:00Z',
          'modifiedDate': '2025-01-05T11:45:00Z',
          'status': 'active',
          'description': 'عقد عمل للموظف أحمد محمد علي',
          'tags': ['عقد', 'أحمد محمد', 'توظيف'],
          'downloadCount': 3,
          'isPublic': false,
          'companyId': 'company-1',
          'employeeId': 'emp-1',
          'licenseId': null,
          'url': '/api/documents/3/download',
          'thumbnailUrl': '/api/documents/3/thumbnail'
        },
        {
          'id': '4',
          'name': 'رخصة تجارية - فرع الجهراء.pdf',
          'fileName': 'license-jahra-branch.pdf',
          'type': 'application/pdf',
          'category': 'licenses',
          'size': '1.2 MB',
          'sizeBytes': 1258291,
          'uploadedBy': 'إدارة الترخيص',
          'uploadedByUser': {
            'id': 'admin-2',
            'name': 'فاطمة الإدارية',
            'email': 'admin2@company.com'
          },
          'uploadDate': '2024-12-20T13:20:00Z',
          'modifiedDate': '2024-12-20T13:20:00Z',
          'status': 'active',
          'description': 'رخصة تجارية لفرع الجهراء',
          'tags': ['رخصة', 'جهراء', 'فرع'],
          'downloadCount': 12,
          'isPublic': false,
          'companyId': 'company-1',
          'employeeId': null,
          'licenseId': 'license-1',
          'url': '/api/documents/4/download',
          'thumbnailUrl': '/api/documents/4/thumbnail'
        }
      ];

      // Apply filters
      let filteredDocuments = documents;

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

      res.json(filteredDocuments);

    } catch (error) {

      log.error('Error fetching documents:', error as Error);
      res.status(500).json({'message': 'Failed to fetch documents'});

    }

  });

  app.post('/api/documents', isAuthenticated, async (req, res) => {

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

        return res.status(400).json({
          'message': 'Invalid document data',
          'errors': result.error.issues
        });

      }

      // In real app, handle file upload here
      const document = await storage.createDocument(result.data);
      res.status(201).json(document);

    } catch (error) {

      log.error('Error creating document:', error as Error);
      res.status(500).json({'message': 'Failed to create document'});

    }

  });

  app.get('/api/documents/:id', isAuthenticated, async (req, res) => {

    try {

      const {id} = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Document id is required' });
      }
      
      const document = await storage.getDocument(id);

      if (!document) {

        return res.status(404).json({'message': 'Document not found'});

      }

      res.json(document);

    } catch (error) {

      log.error('Error fetching document:', error as Error);
      res.status(500).json({'message': 'Failed to fetch document'});

    }

  });

  app.put('/api/documents/:id', isAuthenticated, async (req, res) => {

    try {

      const {id} = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Document id is required' });
      }
      
      const updateData = {
        ...req.body,
        'modifiedDate': new Date()
      };

      const document = await storage.updateDocument(id, updateData);
      res.json(document);

    } catch (error) {

      log.error('Error updating document:', error as Error);
      res.status(500).json({'message': 'Failed to update document'});

    }

  });

  app.delete('/api/documents/:id',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req,
   res) => {

    try {

      const {id} = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Document id is required' });
      }
      
      await storage.deleteDocument(id);
      res.json({'message': 'Document deleted successfully'});

    } catch (error) {

      log.error('Error deleting document:', error as Error);
      res.status(500).json({'message': 'Failed to delete document'});

    }

  });

  app.get('/api/documents/:id/download', isAuthenticated, async (req, res) => {

    try {

      const {id} = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Document id is required' });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ 'message': 'Document not found' });
      }

      const signedUrl = await secureFileStorage.generateSignedUrl(
        id,
        document.fileName
      );

      res.json({
        message: 'Document ready for download',
        documentId: id,
        fileName: document.name,
        downloadUrl: signedUrl,
        expiresAt: new Date(
          Date.now() + secureFileStorage.getStatus().urlExpiration * 1000
        )
      });

    } catch (error) {

      log.error('Error downloading document:', error as Error);
      res.status(500).json({'message': 'Failed to download document'});

    }

  });

  // Secure file upload endpoint with comprehensive validation and antivirus scanning
  app.post('/api/documents/upload', 
    isAuthenticated, 
    upload.single('file'), 
    validateFile,
    scanFile,
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please select a file to upload'
          });
        }

        const file = req.file;
        const scanResult = (req as any).scanResult as ScanResult;
        
        // Store file securely
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
          scanResult: {
            isClean: scanResult.isClean,
            provider: scanResult.provider,
            scanTime: scanResult.scanTime
          },
          storage: {
            provider: secureFileStorage.getStatus().provider,
            urlExpiration: secureFileStorage.getStatus().urlExpiration
          },
          timestamp: new Date().toISOString()
        }, 'UPLOAD');

        res.status(201).json({
          message: 'File uploaded successfully',
          document: {
            id: document.id,
            name: document.name,
            fileName: document.fileName,
            type: document.type,
            size: document.fileSize,
            uploadDate: document.uploadDate,
            url: document.fileUrl,
            expiresAt: storedFile.expiresAt
          },
          security: {
            validated: true,
            fileSignature: 'verified',
            mimeType: 'verified',
            sizeLimit: 'within_bounds',
            antivirusScan: {
              isClean: scanResult.isClean,
              provider: scanResult.provider,
              scanTime: scanResult.scanTime
            },
            storage: {
              provider: secureFileStorage.getStatus().provider,
              encrypted: true,
              urlExpiration: secureFileStorage.getStatus().urlExpiration
            }
          }
        });

      } catch (error) {
        log.error('Error uploading file:', error as Error, 'UPLOAD');
        res.status(500).json({
          error: 'Upload failed',
          message: 'Failed to process uploaded file'
        });
      }
    }
  );

  // Secure file download endpoint with signed URL verification
  app.get('/api/files/:fileId/download', isAuthenticated, async (req, res) => {
    try {
      const { fileId } = req.params;
      const { expires, signature } = req.query;

      // Verify signed URL
      if (expires && signature) {
        const expiresNum = parseInt(expires as string);
        const now = Date.now();

        // Check if URL has expired
        if (now > expiresNum) {
          return res.status(410).json({
            error: 'URL expired',
            message: 'Download link has expired'
          });
        }

        // Verify signature
        if (!verifySignedUrl(fileId, expires as string, signature as string)) {
          log.warn('Invalid file download signature', {
            fileId,
            user: req.user?.id,
            ip: req.ip
          }, 'SECURITY');
          
          return res.status(403).json({
            error: 'Invalid signature',
            message: 'Download link is invalid'
          });
        }
      }

      // Get document from database
      const document = await storage.getDocument(fileId);
      if (!document) {
        return res.status(404).json({
          error: 'File not found',
          message: 'Requested file does not exist'
        });
      }

      // Check user permissions (simplified - in real app, implement proper access control)
      if (document.uploadedBy !== req.user?.sub && !req.user?.roles?.includes('admin')) {
        log.warn('Unauthorized file access attempt', {
          fileId,
          requestedBy: req.user?.id,
          uploadedBy: document.uploadedBy
        }, 'SECURITY');
        
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this file'
        });
      }

      // Generate new signed URL
      const newSignedUrl = await secureFileStorage.generateSignedUrl(fileId, document.fileName);

      // Log download access
      log.info('File download accessed', {
        fileId,
        fileName: document.name,
        accessedBy: req.user?.id,
        ip: req.ip
      }, 'ACCESS');

      res.json({
        message: 'File ready for download',
        fileId,
        fileName: document.name,
        downloadUrl: newSignedUrl,
        expiresAt: new Date(Date.now() + secureFileStorage.getStatus().urlExpiration * 1000)
      });

    } catch (error) {
      log.error('Error generating download URL:', error as Error, 'ACCESS');
      res.status(500).json({
        error: 'Download failed',
        message: 'Failed to generate download link'
      });
    }
  });

  // Secure file download endpoint with signed URL verification
  app.get('/api/files/:fileId/download', isAuthenticated, async (req, res) => {
    try {
      const { fileId } = req.params;
      const { expires, signature } = req.query;

      // Verify signed URL
      if (expires && signature) {
        const expiresNum = parseInt(expires as string);
        const now = Date.now();

        // Check if URL has expired
        if (now > expiresNum) {
          return res.status(410).json({
            error: 'URL expired',
            message: 'Download link has expired'
          });
        }

        // Verify signature
        if (!verifySignedUrl(fileId, expires as string, signature as string)) {
          log.warn('Invalid file download signature', {
            fileId,
            user: req.user?.id,
            ip: req.ip
          }, 'SECURITY');
          
          return res.status(403).json({
            error: 'Invalid signature',
            message: 'Download link is invalid'
          });
        }
      }

      // Get document from database
      const document = await storage.getDocument(fileId);
      if (!document) {
        return res.status(404).json({
          error: 'File not found',
          message: 'Requested file does not exist'
        });
      }

      // Check user permissions (simplified - in real app, implement proper access control)
      if (document.uploadedBy !== req.user?.sub && req.user?.role !== 'admin') {
        log.warn('Unauthorized file access attempt', {
          fileId,
          requestedBy: req.user?.id,
          uploadedBy: document.uploadedBy
        }, 'SECURITY');
        
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to access this file'
        });
      }

      // Generate new signed URL
      const newSignedUrl = await secureFileStorage.generateSignedUrl(fileId, document.fileName);

      // Log download access
      log.info('File download accessed', {
        fileId,
        fileName: document.name,
        accessedBy: req.user?.id,
        ip: req.ip
      }, 'ACCESS');

      res.json({
        message: 'File ready for download',
        fileId,
        fileName: document.name,
        downloadUrl: newSignedUrl,
        expiresAt: new Date(Date.now() + secureFileStorage.getStatus().urlExpiration * 1000)
      });

    } catch (error) {
      log.error('Error generating download URL:', error as Error, 'ACCESS');
      res.status(500).json({
        error: 'Download failed',
        message: 'Failed to generate download link'
      });
    }
  });

  // Security status endpoint
  app.get('/api/security/status', isAuthenticated, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const antivirusStatus = antivirusScanner.getStatus();
      const storageStatus = secureFileStorage.getStatus();

      res.json({
        antivirus: antivirusStatus,
        storage: storageStatus,
        uploadLimits: {
          maxFileSize: MAX_FILE_SIZE,
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
      });
    } catch (error) {
      log.error('Error getting security status:', error as Error, 'SECURITY');
      res.status(500).json({
        error: 'Failed to get security status',
        message: 'Unable to retrieve security configuration'
      });
    }
  });

  // Error handling for multer
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large',
          message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: 'Too many files',
          message: 'Only one file can be uploaded at a time'
        });
      }
      if (error.code === 'LIMIT_FIELD_COUNT') {
        return res.status(400).json({
          error: 'Too many fields',
          message: 'Too many form fields'
        });
      }
    }
    
    if (error.message) {
      return res.status(400).json({
        error: 'Upload error',
        message: error.message
      });
    }
    
    next(error);
  });

  // Document categories based on real extracted documents
  app.get('/api/documents/categories', isAuthenticated, async (req, res) => {

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

      res.json(categories);

    } catch (error) {

      log.error('Error fetching document categories:', error as Error);
      res.status(500).json({'message': 'Failed to fetch document categories'});

    }

  });

  // Security status endpoint
  app.get('/api/security/status', isAuthenticated, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const antivirusStatus = antivirusScanner.getStatus();
      const storageStatus = secureFileStorage.getStatus();

      res.json({
        antivirus: antivirusStatus,
        storage: storageStatus,
        uploadLimits: {
          maxFileSize: MAX_FILE_SIZE,
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
      });
    } catch (error) {
      log.error('Error getting security status:', error as Error, 'SECURITY');
      res.status(500).json({
        error: 'Failed to get security status',
        message: 'Unable to retrieve security configuration'
      });
    }
  });

}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
