import { db } from '../models/db-optimized';
import { eq, and, or, desc, asc, like, inArray, sql } from 'drizzle-orm';
import { BaseService } from './BaseService';

/**
 * Base Repository Class - DRY Principle
 * Provides common database operations for all repositories
 */
export abstract class BaseRepository<T, CreateT, UpdateT> extends BaseService {
  protected table: any;

  constructor(table: any) {
    super();
    this.table = table;
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(options?: {
    where?: Partial<T>;
    orderBy?: { column: keyof T; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    try {
      let query = db.select().from(this.table);

      // Apply where conditions
      if (options?.where) {
        const conditions = Object.entries(options.where).map(([key, value]) => 
          eq(this.table[key as keyof typeof this.table], value)
        );
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      // Apply ordering
      if (options?.orderBy) {
        const { column, direction } = options.orderBy;
        const orderFn = direction === 'desc' ? desc : asc;
        query = query.orderBy(orderFn(this.table[column as keyof typeof this.table]));
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.offset(options.offset);
      }

      return await query;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find record by specific field
   */
  async findByField(field: keyof T, value: any): Promise<T | null> {
    try {
      const result = await db
        .select()
        .from(this.table)
        .where(eq(this.table[field as keyof typeof this.table], value))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Create new record
   */
  async create(data: CreateT): Promise<T> {
    try {
      const result = await db.insert(this.table).values(data as any);
      return result as T;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update record by ID
   */
  async update(id: string, data: UpdateT): Promise<T | null> {
    try {
      const result = await db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(this.table.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(this.table)
        .where(eq(this.table.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(where?: Partial<T>): Promise<number> {
    try {
      let query = db.select({ count: sql<number>`count(*)` }).from(this.table);

      if (where) {
        const conditions = Object.entries(where).map(([key, value]) => 
          eq(this.table[key as keyof typeof this.table], value)
        );
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      const result = await query;
      return result[0]?.count || 0;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search records by text fields
   */
  async search(searchTerm: string, searchFields: (keyof T)[]): Promise<T[]> {
    try {
      const conditions = searchFields.map(field => 
        like(this.table[field as keyof typeof this.table], `%${searchTerm}%`)
      );

      return await db
        .select()
        .from(this.table)
        .where(or(...conditions));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find records by multiple IDs
   */
  async findByIds(ids: string[]): Promise<T[]> {
    try {
      return await db
        .select()
        .from(this.table)
        .where(inArray(this.table.id, ids));
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Check if record exists
   */
  async exists(where: Partial<T>): Promise<boolean> {
    try {
      const conditions = Object.entries(where).map(([key, value]) => 
        eq(this.table[key as keyof typeof this.table], value)
      );
      
      const result = await db
        .select({ exists: sql<number>`1` })
        .from(this.table)
        .where(and(...conditions))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      this.handleError(error);
    }
  }
}
