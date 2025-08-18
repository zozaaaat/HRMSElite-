import type {Express, Request, Response, NextFunction} from 'express';
import {storage} from '../models/storage';
import {insertDocumentSchema} from '@shared/schema';
import {log} from '@utils/logger';


export function registerDocumentRoutes (app: Express) {

  // Enhanced auth middleware with role-based access
  const isAuthenticated = (req:  Request, res:  Response, next:  NextFunction) => {

    // Enhanced authentication for development with role simulation
    const userRole = (req.headers['x-user-role'] as string) || 'company_manager';
    const userId = (req.headers['x-user-id'] as string) || '1';

    req.user = {
      'id': userId,
      'sub': userId,
      'role': userRole,
      'email': 'user@company.com',
      'firstName': 'محمد',
      'lastName': 'أحمد',
      'permissions': [],
      'isActive': true,
      'claims': {},
      'createdAt': new Date(),
      'updatedAt': new Date()
    } as unknown; // مؤقتًا
    next();

  };

  // Role-based authorization middleware
  const requireRole = (allowedRoles: string[]) => {

    return (req:  Request, res:  Response, next:  NextFunction) => {

      const userRole = req.user?.role || '';
      if (!allowedRoles.includes(userRole)) {

        return res.status(403).json({'message': 'Access denied. Insufficient permissions.'});

      }
      next();

    };

  };

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

      const { id } = req.params as { id: string };
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

      const { id } = req.params as { id: string };
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

      const { id } = req.params as { id: string };
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

      const { id } = req.params as { id: string };
      if (!id) {
        return res.status(400).json({ error: 'Document id is required' });
      }

      // Mock documents mapping to real files
      const documentFiles: Record<string, string> = {
        '1': 'ترخيص النيل الازرق الرئيسي مباركية.pdf',
        '2': 'اسماء عمال شركة النيل الازرق جميع التراخيص جورج.xlsx',
        '3': 'استيراد النيل الازرق للمجوهرات 2025.pdf',
        '4': 'اعتماد النيل الازرق 20250528.pdf',
        '5': 'ترخيص قمة النيل.pdf',
        '6': 'اسماء عمال شركة قمة النيل الخالد جميع التراخيص - - Copy.xlsx',
        '7': 'ترخيص الاتحاد الخليجي للاقمشة 2023.pdf',
        '8': 'اسماء عمال شركة الاتحاد الخليجي جميع التراخيص (2).xlsx'
      };

      const fileName = documentFiles[id];
      if (!fileName) {

        return res.status(404).json({'message': 'Document not found'});

      }

      // Return download URL for real file
      res.json({
        'message': 'Document ready for download',
        'documentId': id,
        fileName,
        'downloadUrl': `/demo-data/${fileName}`,
        'directLink': `${req.protocol}://${req.get('host')}/demo-data/${encodeURIComponent(fileName)}`
      });

    } catch (error) {

      log.error('Error downloading document:', error as Error);
      res.status(500).json({'message': 'Failed to download document'});

    }

  });

  app.post('/api/documents/upload', isAuthenticated, async (req, res) => {

    try {

      // In real app, handle multipart file upload
      res.json({
        'message': 'File upload endpoint - implement with multer or similar',
        'uploadedFiles': []
      });

    } catch (error) {

      log.error('Error uploading files:', error as Error);
      res.status(500).json({'message': 'Failed to upload files'});

    }

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

}
