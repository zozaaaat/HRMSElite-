import type { Express } from "express";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";

export function registerDocumentRoutes(app: Express) {
  
  // Enhanced auth middleware with role-based access
  const isAuthenticated = (req: any, res: any, next: any) => {
    // Enhanced authentication for development with role simulation
    const userRole = req.headers['x-user-role'] || 'company_manager';
    const userId = req.headers['x-user-id'] || '1';
    
    req.user = {
      sub: userId,
      role: userRole,
      email: "user@company.com",
      firstName: "محمد",
      lastName: "أحمد"
    };
    next();
  };

  // Role-based authorization middleware
  const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: any, next: any) => {
      const userRole = req.user?.role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
      next();
    };
  };

  // Documents routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const { companyId, employeeId, licenseId, category } = req.query;
      
      // Mock documents data - in real app this would come from database
      const documents = [
        {
          id: "1",
          name: "سياسة الموارد البشرية 2025.pdf",
          fileName: "hr-policy-2025.pdf",
          type: "application/pdf",
          category: "policies",
          size: "2.5 MB",
          sizeBytes: 2621440,
          uploadedBy: "إدارة الموارد البشرية",
          uploadedByUser: {
            id: "admin-1",
            name: "أحمد المدير",
            email: "admin@company.com"
          },
          uploadDate: "2025-01-15T10:30:00Z",
          modifiedDate: "2025-01-20T14:22:00Z",
          status: "active",
          description: "سياسة شاملة لإدارة الموارد البشرية للعام 2025",
          tags: ["سياسة", "موارد بشرية", "2025"],
          downloadCount: 45,
          isPublic: true,
          companyId: "company-1",
          employeeId: null,
          licenseId: null,
          url: "/api/documents/1/download",
          thumbnailUrl: "/api/documents/1/thumbnail"
        },
        {
          id: "2",
          name: "دليل الموظف الجديد.pdf",
          fileName: "employee-handbook.pdf",
          type: "application/pdf", 
          category: "guides",
          size: "1.8 MB",
          sizeBytes: 1887437,
          uploadedBy: "إدارة الموارد البشرية",
          uploadedByUser: {
            id: "admin-1",
            name: "أحمد المدير",
            email: "admin@company.com"
          },
          uploadDate: "2025-01-10T09:15:00Z",
          modifiedDate: "2025-01-10T09:15:00Z",
          status: "active",
          description: "دليل شامل للموظفين الجدد يتضمن جميع المعلومات اللازمة",
          tags: ["دليل", "موظف جديد", "تدريب"],
          downloadCount: 78,
          isPublic: true,
          companyId: "company-1",
          employeeId: null,
          licenseId: null,
          url: "/api/documents/2/download",
          thumbnailUrl: "/api/documents/2/thumbnail"
        },
        {
          id: "3",
          name: "عقد عمل - أحمد محمد.pdf",
          fileName: "contract-ahmad-mohamed.pdf",
          type: "application/pdf",
          category: "contracts",
          size: "456 KB",
          sizeBytes: 467456,
          uploadedBy: "إدارة الموارد البشرية",
          uploadedByUser: {
            id: "admin-1",
            name: "أحمد المدير",
            email: "admin@company.com"
          },
          uploadDate: "2025-01-05T11:45:00Z",
          modifiedDate: "2025-01-05T11:45:00Z",
          status: "active",
          description: "عقد عمل للموظف أحمد محمد علي",
          tags: ["عقد", "أحمد محمد", "توظيف"],
          downloadCount: 3,
          isPublic: false,
          companyId: "company-1",
          employeeId: "emp-1",
          licenseId: null,
          url: "/api/documents/3/download",
          thumbnailUrl: "/api/documents/3/thumbnail"
        },
        {
          id: "4",
          name: "رخصة تجارية - فرع الجهراء.pdf",
          fileName: "license-jahra-branch.pdf",
          type: "application/pdf",
          category: "licenses",
          size: "1.2 MB",
          sizeBytes: 1258291,
          uploadedBy: "إدارة الترخيص",
          uploadedByUser: {
            id: "admin-2",
            name: "فاطمة الإدارية",
            email: "admin2@company.com"
          },
          uploadDate: "2024-12-20T13:20:00Z",
          modifiedDate: "2024-12-20T13:20:00Z",
          status: "active",
          description: "رخصة تجارية لفرع الجهراء",
          tags: ["رخصة", "جهراء", "فرع"],
          downloadCount: 12,
          isPublic: false,
          companyId: "company-1",
          employeeId: null,
          licenseId: "license-1",
          url: "/api/documents/4/download",
          thumbnailUrl: "/api/documents/4/thumbnail"
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
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const documentData = {
        ...req.body,
        uploadedBy: (req.user as any)?.sub,
        uploadDate: new Date(),
        status: 'active',
        downloadCount: 0
      };
      
      const result = insertDocumentSchema.safeParse(documentData);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid document data", 
          errors: result.error.issues 
        });
      }

      // In real app, handle file upload here
      const document = await storage.createDocument(result.data);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.get('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.put('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        modifiedDate: new Date()
      };
      
      const document = await storage.updateDocument(id, updateData);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticated, requireRole(['super_admin', 'company_manager']), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.get('/api/documents/:id/download', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // In real app, serve actual file
      res.json({ 
        message: "Document download would start here",
        documentId: id,
        downloadUrl: `/files/${document.fileName}`
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  app.post('/api/documents/upload', isAuthenticated, async (req, res) => {
    try {
      // In real app, handle multipart file upload
      res.json({ 
        message: "File upload endpoint - implement with multer or similar",
        uploadedFiles: []
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Document categories
  app.get('/api/documents/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = [
        { id: 'policies', name: 'السياسات', icon: 'FileText', count: 5 },
        { id: 'guides', name: 'الأدلة', icon: 'BookOpen', count: 8 },
        { id: 'contracts', name: 'العقود', icon: 'FileContract', count: 23 },
        { id: 'licenses', name: 'التراخيص', icon: 'Award', count: 7 },
        { id: 'certificates', name: 'الشهادات', icon: 'Medal', count: 12 },
        { id: 'reports', name: 'التقارير', icon: 'BarChart', count: 15 },
        { id: 'forms', name: 'النماذج', icon: 'FormInput', count: 9 },
        { id: 'other', name: 'أخرى', icon: 'Folder', count: 6 }
      ];
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching document categories:", error);
      res.status(500).json({ message: "Failed to fetch document categories" });
    }
  });

}