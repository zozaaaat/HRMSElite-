import type {Express, Request, Response} from 'express';
import {db} from '../models/db';
import {licenses, companies, employees} from '@shared/schema';
import {eq, and, desc, like, inArray} from 'drizzle-orm';
import {insertLicenseSchema, type InsertLicense} from '@shared/schema';
import {log} from '../utils/logger';
import {isAuthenticated, requireRole} from '../middleware/auth';
import { generateETag, setETagHeader, matchesIfMatchHeader } from '../utils/etag';

export function registerLicenseRoutes (app: Express) {

  // Get all licenses with company details
  app.get('/api/licenses', isAuthenticated, async (req: Request, res: Response) => {

    try {

      const {companyId, status, type, search} = req.query;

      // Build conditions array
      const conditions = [];

      if (companyId) {
        conditions.push(eq(licenses.companyId, companyId as string));
      }

      if (status) {
        conditions.push(eq(licenses.status, status as string));
      }

      if (type) {
        conditions.push(eq(licenses.type, type as string));
      }

      if (search) {
        conditions.push(
          and(
            like(licenses.name, `%${search}%`),
            like(licenses.number, `%${search}%`)
          )
        );
      }

      const results = await db
        .select({
          'id': licenses.id,
          'companyId': licenses.companyId,
          'name': licenses.name,
          'type': licenses.type,
          'number': licenses.number,
          'status': licenses.status,
          'issueDate': licenses.issueDate,
          'expiryDate': licenses.expiryDate,
          'issuingAuthority': licenses.issuingAuthority,
          'location': licenses.location,
          'description': licenses.description,
          'isActive': licenses.isActive,
          'createdAt': licenses.createdAt,
          'updatedAt': licenses.updatedAt,
          'company': {
            'id': companies.id,
            'name': companies.name,
            'commercialFileNumber': companies.commercialRegistrationNumber
          }
        })
        .from(licenses)
        .leftJoin(companies, eq(licenses.companyId, companies.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(licenses.createdAt));

      // Get employee count for each license
      const licensesWithEmployees = await Promise.all(
        results.map(async (license) => {

          const employeeCount = await db
            .select({'count': employees.id})
            .from(employees)
            .where(eq(employees.licenseId, license.id))
            .then(rows => rows.length);

          return {
            ...license,
            employeeCount
          };

        })
      );

      res.json(licensesWithEmployees);

    } catch (error) {

      log.error('Error fetching licenses:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to fetch licenses'});

    }

  });

  // Get license by ID
  app.get('/api/licenses/:id', isAuthenticated, async (req: Request, res: Response) => {

    try {

      const {id} = req.params;
      
      if (!id) {
        return res.status(400).json({'message': 'License ID is required'});
      }

      const license = await db
        .select({
          'id': licenses.id,
          'companyId': licenses.companyId,
          'name': licenses.name,
          'type': licenses.type,
          'number': licenses.number,
          'status': licenses.status,
          'issueDate': licenses.issueDate,
          'expiryDate': licenses.expiryDate,
          'issuingAuthority': licenses.issuingAuthority,
          'location': licenses.location,
          'description': licenses.description,
          'isActive': licenses.isActive,
          'createdAt': licenses.createdAt,
          'updatedAt': licenses.updatedAt,
          'company': {
            'id': companies.id,
            'name': companies.name,
            'commercialFileNumber': companies.commercialRegistrationNumber
          }
        })
        .from(licenses)
        .leftJoin(companies, eq(licenses.companyId, companies.id))
        .where(eq(licenses.id, id))
        .limit(1);

      if (license.length === 0) {

        return res.status(404).json({'message': 'License not found'});

      }

      // Get employees for this license
      const licenseEmployees = await db
        .select({
          'id': employees.id,
          'firstName': employees.firstName,
          'lastName': employees.lastName,
          'position': employees.position,
          'department': employees.department
        })
        .from(employees)
        .where(eq(employees.licenseId, id));

      const result = {
        ...license[0],
        'employees': licenseEmployees
      };

      const etag = generateETag(result as any);
      setETagHeader(res, etag);
      res.json(result);

    } catch (error) {

      log.error('Error fetching license:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to fetch license'});

    }

  });

  // Create new license
  app.post('/api/licenses',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req: Request,
   res: Response) => {

    try {

      const licenseData: InsertLicense = {
        ...req.body as InsertLicense,
        'createdAt': new Date(),
        'updatedAt': new Date()
      };

      const result = insertLicenseSchema.safeParse(licenseData);
      if (!result.success) {

        return res.status(400).json({
          'message': 'Invalid license data',
          'errors': result.error.issues
        });

      }

      const [newLicense] = await db
        .insert(licenses)
        .values(result.data)
        .returning();

      res.status(201).json(newLicense);

    } catch (error) {

      log.error('Error creating license:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to create license'});

    }

  });

  // Update license
  app.put('/api/licenses/:id',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req: Request,
   res: Response) => {

    try {

      const {id} = req.params;
      
      if (!id) {
        return res.status(400).json({'message': 'License ID is required'});
      }
      
      const ifMatch = req.headers['if-match'];
      const existing = await db
        .select()
        .from(licenses)
        .where(eq(licenses.id, id))
        .limit(1);
      if (existing.length === 0) {
        return res.status(404).json({'message': 'License not found'});
      }
      const currentEtag = generateETag(existing[0] as any);
      if (!matchesIfMatchHeader(ifMatch as any, currentEtag)) {
        return res.status(412).json({'message': 'Precondition Failed: ETag mismatch'});
      }

      const updateData: Partial<InsertLicense> = {
        ...req.body as Partial<InsertLicense>,
        'updatedAt': new Date()
      };

      const [updatedLicense] = await db
        .update(licenses)
        .set(updateData)
        .where(eq(licenses.id, id))
        .returning();

      if (!updatedLicense) {

        return res.status(404).json({'message': 'License not found'});

      }

      const newEtag = generateETag(updatedLicense as any);
      setETagHeader(res, newEtag);
      res.json(updatedLicense);

    } catch (error) {

      log.error('Error updating license:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to update license'});

    }

  });

  // Delete license
  app.delete('/api/licenses/:id',
   isAuthenticated,
   requireRole(['super_admin']),
   async (req: Request,
   res: Response) => {

    try {

      const {id} = req.params;
      
      if (!id) {
        return res.status(400).json({'message': 'License ID is required'});
      }

      const [deletedLicense] = await db
        .delete(licenses)
        .where(eq(licenses.id, id))
        .returning();

      if (!deletedLicense) {

        return res.status(404).json({'message': 'License not found'});

      }

      res.json({'message': 'License deleted successfully'});

    } catch (error) {

      log.error('Error deleting license:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to delete license'});

    }

  });

  // Get licenses by company
  app.get('/api/companies/:companyId/licenses', isAuthenticated, async (req: Request, res: Response) => {

    try {

      const {companyId} = req.params;
      
      if (!companyId) {
        return res.status(400).json({'message': 'Company ID is required'});
      }

      const companyLicenses = await db
        .select()
        .from(licenses)
        .where(eq(licenses.companyId, companyId))
        .orderBy(desc(licenses.createdAt));

      res.json(companyLicenses);

    } catch (error) {

      log.error('Error fetching company licenses:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to fetch company licenses'});

    }

  });

  // Get license statistics
  app.get('/api/licenses/stats', isAuthenticated, async (req: Request, res: Response) => {

    try {

      const allLicenses = await db.select().from(licenses);

      const stats = {
        'total': allLicenses.length,
        'active': allLicenses.filter(l => l.status === 'active').length,
        'expired': allLicenses.filter(l => l.status === 'expired').length,
        'pending': allLicenses.filter(l => l.status === 'pending').length,
        'expiringSoon': allLicenses.filter(l => {

          if (l.status !== 'active' || !l.expiryDate) {

            return false;

          }
          const expiry = new Date(l.expiryDate);
          const now = new Date();
          const diffTime = expiry.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;

        }).length
      };

      res.json(stats);

    } catch (error) {

      log.error('Error fetching license stats:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to fetch license stats'});

    }

  });

  // Get license types
  app.get('/api/licenses/types', isAuthenticated, async (req: Request, res: Response) => {

    try {

      const licenseTypes = [
        {'value': 'main', 'label': 'رئيسي', 'icon': 'Award'},
        {'value': 'branch', 'label': 'فرع', 'icon': 'Building2'},
        {'value': 'commercial', 'label': 'تجاري', 'icon': 'FileContract'},
        {'value': 'industrial', 'label': 'صناعي', 'icon': 'Building2'},
        {'value': 'professional', 'label': 'مهني', 'icon': 'Shield'},
        {'value': 'import_export', 'label': 'استيراد وتصدير', 'icon': 'TrendingUp'},
        {'value': 'tailoring', 'label': 'خياطة', 'icon': 'Users'},
        {'value': 'fabric', 'label': 'أقمشة', 'icon': 'FileText'},
        {'value': 'jewelry', 'label': 'مجوهرات', 'icon': 'Award'},
        {'value': 'restaurant', 'label': 'مطعم', 'icon': 'Building2'},
        {'value': 'service', 'label': 'خدمات', 'icon': 'Shield'}
      ];

      res.json(licenseTypes);

    } catch (error) {

      log.error('Error fetching license types:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to fetch license types'});

    }

  });

  // Bulk update license status
  app.patch('/api/licenses/bulk-status',
   isAuthenticated,
   requireRole(['super_admin',
   'company_manager']),
   async (req: Request,
   res: Response) => {

    try {

      const {licenseIds, status} = req.body as {licenseIds: string[], status: string};

      if (!Array.isArray(licenseIds) || !status) {

        return res.status(400).json({'message': 'Invalid request data'});

      }

      const updatedLicenses = await db
        .update(licenses)
        .set({
          status: status,
          'updatedAt': new Date()
        })
        .where(inArray(licenses.id, licenseIds))
        .returning();

      res.json({
        'message': `Updated ${updatedLicenses.length} licenses`,
        updatedLicenses
      });

    } catch (error) {

      log.error('Error bulk updating licenses:', error instanceof Error ? error : { error });
      res.status(500).json({'message': 'Failed to update licenses'});

    }

  });

}
