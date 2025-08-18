import { BaseRepository } from './BaseRepository';
import { db } from '../models/db-optimized';
import { companies, employees, licenses, companyUsers, users } from '@shared/schema/optimized-schema';
import { eq, and, or, desc, asc, like, sql, count, sum } from 'drizzle-orm';
import type { Company, NewCompany } from '@shared/schema/optimized-schema';

/**
 * Company Repository - Single Responsibility Principle
 * Handles all company-related database operations
 */
export class CompanyRepository extends BaseRepository<Company, NewCompany, Partial<NewCompany>> {
  constructor() {
    super(companies);
  }

  /**
   * Find company with related data (employees, licenses, users)
   */
  async findByIdWithRelations(id: string) {
    try {
      const company = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id))
        .limit(1);

      if (!company[0]) return null;

      // Get related data
      const [employeeCount, licenseCount, userCount] = await Promise.all([
        this.getEmployeeCount(id),
        this.getLicenseCount(id),
        this.getUserCount(id)
      ]);

      return {
        ...company[0],
        stats: {
          employeeCount,
          licenseCount,
          userCount
        }
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find companies by industry type
   */
  async findByIndustryType(industryType: string) {
    try {
      return await db
        .select()
        .from(companies)
        .where(eq(companies.industryType, industryType))
        .orderBy(asc(companies.name));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find companies by location
   */
  async findByLocation(location: string) {
    try {
      return await db
        .select()
        .from(companies)
        .where(eq(companies.location, location))
        .orderBy(asc(companies.name));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search companies with advanced filtering
   */
  async searchCompanies(options: {
    searchTerm?: string;
    industryType?: string;
    location?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = db.select().from(companies);
      const conditions = [];

      // Search term
      if (options.searchTerm) {
        conditions.push(
          or(
            like(companies.name, `%${options.searchTerm}%`),
            like(companies.commercialFileNumber, `%${options.searchTerm}%`),
            like(companies.location, `%${options.searchTerm}%`)
          )
        );
      }

      // Industry type filter
      if (options.industryType) {
        conditions.push(eq(companies.industryType, options.industryType));
      }

      // Location filter
      if (options.location) {
        conditions.push(eq(companies.location, options.location));
      }

      // Active status filter
      if (options.isActive !== undefined) {
        conditions.push(eq(companies.isActive, options.isActive));
      }

      // Apply conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Apply ordering
      query = query.orderBy(asc(companies.name));

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      return await query;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId: string) {
    try {
      const [employeeCount, licenseCount, userCount, totalSalary] = await Promise.all([
        this.getEmployeeCount(companyId),
        this.getLicenseCount(companyId),
        this.getUserCount(companyId),
        this.getTotalSalary(companyId)
      ]);

      return {
        employeeCount,
        licenseCount,
        userCount,
        totalSalary,
        averageSalary: employeeCount > 0 ? totalSalary / employeeCount : 0
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get employee count for company
   */
  private async getEmployeeCount(companyId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(employees)
        .where(eq(employees.companyId, companyId));
      
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get license count for company
   */
  private async getLicenseCount(companyId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(licenses)
        .where(eq(licenses.companyId, companyId));
      
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get user count for company
   */
  private async getUserCount(companyId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(companyUsers)
        .where(eq(companyUsers.companyId, companyId));
      
      return result[0]?.count || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total salary for company
   */
  private async getTotalSalary(companyId: string): Promise<number> {
    try {
      const result = await db
        .select({ total: sum(employees.salary) })
        .from(employees)
        .where(eq(employees.companyId, companyId));
      
      return result[0]?.total || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get companies with expiring licenses
   */
  async getCompaniesWithExpiringLicenses(daysThreshold: number = 30) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      return await db
        .select({
          company: companies,
          expiringLicenses: sql<number>`count(${licenses.id})`
        })
        .from(companies)
        .leftJoin(licenses, eq(companies.id, licenses.companyId))
        .where(
          and(
            eq(licenses.isActive, true),
            sql`${licenses.expiryDate} <= ${thresholdDate.toISOString().split('T')[0]}`
          )
        )
        .groupBy(companies.id)
        .orderBy(asc(companies.name));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get companies by employee count range
   */
  async getCompaniesByEmployeeRange(minEmployees: number, maxEmployees: number) {
    try {
      return await db
        .select({
          company: companies,
          employeeCount: sql<number>`count(${employees.id})`
        })
        .from(companies)
        .leftJoin(employees, eq(companies.id, employees.companyId))
        .groupBy(companies.id)
        .having(
          sql`count(${employees.id}) BETWEEN ${minEmployees} AND ${maxEmployees}`
        )
        .orderBy(desc(sql`count(${employees.id})`));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update company statistics
   */
  async updateCompanyStats(companyId: string) {
    try {
      const [employeeCount, licenseCount] = await Promise.all([
        this.getEmployeeCount(companyId),
        this.getLicenseCount(companyId)
      ]);

      await db
        .update(companies)
        .set({
          totalEmployees: employeeCount,
          totalLicenses: licenseCount,
          updatedAt: new Date()
        })
        .where(eq(companies.id, companyId));
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export singleton instance
export const companyRepository = new CompanyRepository();
