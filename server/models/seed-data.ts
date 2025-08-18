import {db} from './db';
import logger from '../utils/logger';
import {companies, users, companyUsers} from '@shared/schema';


export async function seedDatabase () {

  try {

    logger.info('🌱 Seeding database with sample data...', undefined, 'SEED_DATA');

    // Sample company data for seeding

    // Create sample company
    const [company] = await db.insert(companies).values({
      'id': 'company-1',
      'name': 'شركة النيل الأزرق للمجوهرات',
      'commercialFileNumber': '2023-001-NBJ',
      'commercialFileName': 'شركة النيل الأزرق للمجوهرات وتجارة الذهب',
      'establishmentDate': '2019-05-15',
      'commercialRegistrationNumber': 'REG-2019-NBJ-001',
      'classification': 'retail_jewelry',
      'department': 'Jewelry & Gold Trading',
      'fileType': 'limited_liability',
      'legalEntity': 'شركة ذات مسؤولية محدودة',
      'ownershipCategory': 'private',
      'address': 'الكويت، المباركية، سوق الذهب',
      'phone': '+965 2245 6789',
      'email': 'info@nileblue-jewelry.com.kw',
      'website': 'https://nileblue-jewelry.com.kw',
      'totalEmployees': 45,
      'totalLicenses': 6,
      'industryType': 'المجوهرات',
      'businessActivity': 'تجارة المجوهرات والذهب',
      'location': 'المباركية',
      'taxNumber': 'TAX-NBJ-001',
      'chambers': 'غرفة تجارة وصناعة الكويت'
    }).returning();

    if (!company) {
      logger.warn('No company created during seeding', undefined, 'SEED_DATA');
      return;
    }
    logger.info('✅ Created sample company:', {'name': company.name}, 'SEED_DATA');

    // Create sample users
    const sampleUsers = await db.insert(users).values([
      {
        'id': 'user-1',
        'email': 'admin@nileblue-jewelry.com.kw',
        'firstName': 'أحمد',
        'lastName': 'المدير',
        'password': '$2b$10$hashedpassword123', // Hashed password placeholder
        'role': 'company_manager',
        'companyId': 'company-1',
        'permissions': '[]'
      },
      {
        'id': 'user-2',
        'email': 'hr@nileblue-jewelry.com.kw',
        'firstName': 'فاطمة',
        'lastName': 'الموارد البشرية',
        'password': '$2b$10$hashedpassword123', // Hashed password placeholder
        'role': 'administrative_employee',
        'companyId': 'company-1',
        'permissions': '[]'
      },
      {
        'id': 'user-3',
        'email': 'supervisor@nileblue-jewelry.com.kw',
        'firstName': 'خالد',
        'lastName': 'المشرف',
        'password': '$2b$10$hashedpassword123', // Hashed password placeholder
        'role': 'supervisor',
        'companyId': 'company-1',
        'permissions': '[]'
      }
    ]).returning();

    logger.info('✅ Created sample users:', {'count': sampleUsers.length}, 'SEED_DATA');

    // Create company user relationships
    const companyUserRelations = await db.insert(companyUsers).values([
      {
        'userId': 'user-1',
        'companyId': 'company-1',
        'role': 'company_manager',
        'permissions': JSON.stringify(['all'])
      },
      {
        'userId': 'user-2',
        'companyId': 'company-1',
        'role': 'administrative_employee',
        'permissions': JSON.stringify(['employees_view', 'employees_create', 'leaves_approve'])
      },
      {
        'userId': 'user-3',
        'companyId': 'company-1',
        'role': 'supervisor',
        'permissions': JSON.stringify(['employees_view', 'attendance_manage'])
      }
    ]).returning();

    logger.info('✅ Created company user relations:', {
  'count': companyUserRelations.length
}, 'SEED_DATA');
    logger.info('🎉 Database seeding completed successfully!', undefined, 'SEED_DATA');

    return {
      'companies': [company],
      'users': sampleUsers,
      'relations': companyUserRelations
    };

  } catch (error) {

    logger.error('❌ Error seeding database:', error as Error);
    throw error;

  }

}
