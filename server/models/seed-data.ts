import {db} from './db';
import {log} from '../utils/logger';
import {companies, users, employees, licenses, companyUsers} from '@shared/schema';
import {logger} from '@utils/logger';


export async function seedDatabase () {

  try {

    log.info('🌱 Seeding database with sample data...', null, 'SEED_DATA');

    // Real companies based on extracted documents
    const sampleCompanies = [
      {
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
        'industryType': 'المجوهرات', // Added missing fields from original
        'businessActivity': 'تجارة المجوهرات والذهب', // Added missing fields from original
        'location': 'المباركية', // Added missing fields from original
        'taxNumber': 'TAX-NBJ-001', // Added missing fields from original
        'chambers': 'غرفة تجارة وصناعة الكويت' // Added missing fields from original
      },
      {
        'id': 'company-2',
        'name': 'شركة قمة النيل للتجارة',
        'commercialFileNumber': '2023-002-QNT',
        'commercialFileName': 'شركة قمة النيل للتجارة العامة والاستيراد',
        'establishmentDate': '2020-03-10',
        'commercialRegistrationNumber': 'REG-2020-QNT-002',
        'classification': 'import_export',
        'department': 'General Trading & Import',
        'fileType': 'limited_liability',
        'legalEntity': 'شركة ذات مسؤولية محدودة',
        'ownershipCategory': 'private',
        'address': 'الكويت، الشرق، المنطقة التجارية',
        'phone': '+965 2287 4455',
        'email': 'trading@qammatnile.com.kw',
        'website': 'https://qammatnile.com.kw',
        'totalEmployees': 38,
        'totalLicenses': 4,
        'industryType': 'التجارة', // Added missing fields from original
        'businessActivity': 'التجارة العامة والاستيراد', // Added missing fields from original
        'location': 'الشرق', // Added missing fields from original
        'taxNumber': 'TAX-QNT-002', // Added missing fields from original
        'chambers': 'غرفة تجارة وصناعة الكويت' // Added missing fields from original
      },
      {
        'id': 'company-3',
        'name': 'شركة الاتحاد الخليجي للأقمشة',
        'commercialFileNumber': '2023-003-UGF',
        'commercialFileName': 'شركة الاتحاد الخليجي للأقمشة والمنسوجات',
        'establishmentDate': '2018-11-25',
        'commercialRegistrationNumber': 'REG-2018-UGF-003',
        'classification': 'textile_fabrics',
        'department': 'Textile & Fabrics',
        'fileType': 'limited_liability',
        'legalEntity': 'شركة ذات مسؤولية محدودة',
        'ownershipCategory': 'private',
        'address': 'الكويت، الجهراء، السوق التجاري',
        'phone': '+965 2334 7788',
        'email': 'info@gulf-union-fabrics.com',
        'website': 'https://gulf-union-fabrics.com',
        'totalEmployees': 28,
        'totalLicenses': 3,
        'industryType': 'الأقمشة', // Added missing fields from original
        'businessActivity': 'تجارة الأقمشة والمنسوجات', // Added missing fields from original
        'location': 'الجهراء', // Added missing fields from original
        'taxNumber': 'TAX-UGF-003', // Added missing fields from original
        'chambers': 'غرفة تجارة وصناعة الكويت' // Added missing fields from original
      },
      {
        'id': 'company-4',
        'name': 'شركة محمد أحمد إبراهيم للتجارة',
        'commercialFileNumber': '2025-004-MAI',
        'commercialFileName': 'شركة محمد أحمد إبراهيم للتجارة والاستيراد',
        'establishmentDate': '2021-01-20',
        'commercialRegistrationNumber': 'REG-2021-MAI-004',
        'classification': 'general_trading',
        'department': 'General Trading',
        'fileType': 'individual_company',
        'legalEntity': 'مؤسسة فردية',
        'ownershipCategory': 'private',
        'address': 'الكويت، حولي، المنطقة التجارية',
        'phone': '+965 2456 9911',
        'email': 'info@mai-trading.com.kw',
        'website': 'https://mai-trading.com.kw',
        'totalEmployees': 22,
        'totalLicenses': 2,
        'industryType': 'التجارة', // Added missing fields from original
        'businessActivity': 'التجارة والاستيراد', // Added missing fields from original
        'location': 'حولي', // Added missing fields from original
        'taxNumber': 'TAX-MAI-004', // Added missing fields from original
        'chambers': 'غرفة تجارة وصناعة الكويت' // Added missing fields from original
      },
      {
        'id': 'company-5',
        'name': 'شركة ميلانو للأزياء',
        'commercialFileNumber': '2023-005-MF',
        'commercialFileName': 'شركة ميلانو للأزياء والموضة',
        'establishmentDate': '2019-09-12',
        'commercialRegistrationNumber': 'REG-2019-MF-005',
        'classification': 'fashion_clothing',
        'department': 'Fashion & Clothing',
        'fileType': 'limited_liability',
        'legalEntity': 'شركة ذات مسؤولية محدودة',
        'ownershipCategory': 'private',
        'address': 'الكويت، السالمية، مجمع الأزياء',
        'phone': '+965 2567 1122',
        'email': 'fashion@milano-kw.com',
        'website': 'https://milano-fashion.com.kw',
        'totalEmployees': 35,
        'totalLicenses': 5,
        'industryType': 'الأزياء', // Added missing fields from original
        'businessActivity': 'تجارة الأزياء والموضة', // Added missing fields from original
        'location': 'السالمية', // Added missing fields from original
        'taxNumber': 'TAX-MF-005', // Added missing fields from original
        'chambers': 'غرفة تجارة وصناعة الكويت' // Added missing fields from original
      }
    ];

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

    log.info('✅ Created sample company:', {'name': company.name}, 'SEED_DATA');

    // Create sample users
    const sampleUsers = await db.insert(users).values([
      {
        'id': 'user-1',
        'email': 'admin@nileblue-jewelry.com.kw',
        'firstName': 'أحمد',
        'lastName': 'المدير',
        'role': 'company_manager',
        'companyId': 'company-1'
      },
      {
        'id': 'user-2',
        'email': 'hr@nileblue-jewelry.com.kw',
        'firstName': 'فاطمة',
        'lastName': 'الموارد البشرية',
        'role': 'administrative_employee',
        'companyId': 'company-1'
      },
      {
        'id': 'user-3',
        'email': 'supervisor@nileblue-jewelry.com.kw',
        'firstName': 'خالد',
        'lastName': 'المشرف',
        'role': 'supervisor',
        'companyId': 'company-1'
      }
    ]).returning();

    log.info('✅ Created sample users:', {'count': sampleUsers.length}, 'SEED_DATA');

    // Real licenses based on extracted documents
    const sampleLicenses = [
      {
        'id': 'license-1',
        'companyId': 'company-1',
        'licenseNumber': 'NBJ-2023-001',
        'name': 'ترخيص تجارة المجوهرات والذهب - الفرع الرئيسي المباركية',
        'holderCivilId': '285123456789',
        'issuingAuthority': 'وزارة التجارة والصناعة - إدارة التراخيص التجارية',
        'type': 'commercial',
        'status': 'active',
        'issueDate': '2023-03-15',
        'expiryDate': '2025-03-15',
        'address': 'الكويت، المباركية، سوق الذهب',
        'description': 'ترخيص ساري المفعول للتجارة في المجوهرات والذهب',
        'licenseCategory': 'تجاري',
        'businessType': 'تجارة المجوهرات',
        'shopNumber': 'A-101',
        'floor': 'الطابق الأول',
        'marketName': 'سوق الذهب',
        'municipality': 'محافظة العاصمة',
        'associatedEmployees': 20
      },
      {
        'id': 'license-2',
        'companyId': 'company-1',
        'licenseNumber': 'NBJ-2023-002',
        'name': 'ترخيص النيل الأزرق محل 3 - فرع رامين',
        'holderCivilId': '285123456789',
        'issuingAuthority': 'وزارة التجارة والصناعة - إدارة التراخيص التجارية',
        'type': 'branch',
        'status': 'active',
        'issueDate': '2023-06-20',
        'expiryDate': '2025-06-20',
        'address': 'الكويت، الرقعي، مجمع رامين',
        'description': 'ترخيص فرع رامين للمجوهرات',
        'licenseCategory': 'تجاري',
        'businessType': 'تجارة المجوهرات',
        'shopNumber': 'B-205',
        'floor': 'الطابق الثاني',
        'marketName': 'مجمع رامين',
        'municipality': 'محافظة الفروانية',
        'associatedEmployees': 15
      },
      {
        'id': 'license-3',
        'companyId': 'company-2',
        'licenseNumber': 'QNT-2024-001',
        'name': 'ترخيص التجارة العامة والاستيراد',
        'holderCivilId': '285123456789',
        'issuingAuthority': 'وزارة التجارة والصناعة - إدارة التجارة العامة',
        'type': 'commercial',
        'status': 'active',
        'issueDate': '2024-01-10',
        'expiryDate': '2026-01-10',
        'address': 'الكويت، الشرق، المنطقة التجارية',
        'description': 'ترخيص شامل للتجارة العامة والاستيراد',
        'licenseCategory': 'تجاري',
        'businessType': 'تجارة عامة',
        'shopNumber': 'C-301',
        'floor': 'الطابق الثالث',
        'marketName': 'المنطقة التجارية',
        'municipality': 'محافظة العاصمة',
        'associatedEmployees': 18
      },
      {
        'id': 'license-4',
        'companyId': 'company-3',
        'licenseNumber': 'UGF-2023-001',
        'name': 'ترخيص تجارة الأقمشة والمنسوجات',
        'holderCivilId': '285123456789',
        'issuingAuthority': 'وزارة التجارة والصناعية - قسم المنسوجات',
        'type': 'commercial',
        'status': 'active',
        'issueDate': '2023-08-15',
        'expiryDate': '2025-08-15',
        'address': 'الكويت، الجهراء، السوق التجاري',
        'description': 'ترخيص متخصص في تجارة الأقمشة والمنسوجات',
        'licenseCategory': 'تجاري',
        'businessType': 'تجارة الأقمشة',
        'shopNumber': 'D-401',
        'floor': 'الطابق الرابع',
        'marketName': 'السوق التجاري',
        'municipality': 'محافظة الجهراء',
        'associatedEmployees': 10
      },
      {
        'id': 'license-5',
        'companyId': 'company-5',
        'licenseNumber': 'MF-2023-001',
        'name': 'ترخيص تجارة الأزياء والموضة',
        'holderCivilId': '285123456789',
        'issuingAuthority': 'وزارة التجارة والصناعة - قسم الأزياء',
        'type': 'commercial',
        'status': 'active',
        'issueDate': '2023-10-05',
        'expiryDate': '2025-10-05',
        'address': 'الكويت، السالمية، مجمع الأزياء',
        'description': 'ترخيص متخصص في الأزياء النسائية والرجالية',
        'licenseCategory': 'تجاري',
        'businessType': 'تجارة الأزياء',
        'shopNumber': 'E-501',
        'floor': 'الطابق الخامس',
        'marketName': 'مجمع الأزياء',
        'municipality': 'محافظة حولي',
        'associatedEmployees': 12
      }
    ];

    log.info('✅ Created sample licenses:', {'count': sampleLicenses.length}, 'SEED_DATA');

    // Sample employees based on real companies
    const sampleEmployees = [
      {
        'id': 'emp-1',
        'companyId': 'company-1', // شركة النيل الأزرق للمجوهرات
        'licenseId': 'license-1',
        'civilId': '28956471230',
        'fullName': 'جورج فادي إبراهيم',
        'nationality': 'مصري',
        'type': 'expatriate',
        'jobTitle': 'مدير مبيعات المجوهرات',
        'actualJobTitle': 'Jewelry Sales Manager',
        'hireDate': '2022-03-20',
        'monthlySalary': '950.00',
        'actualSalary': '980.00',
        'status': 'active',
        'phone': '+965 9876 5432',
        'email': 'george.fadi@nileblue-jewelry.com.kw',
        'address': 'الكويت، حولي، شارع تونس، مجمع 15',
        'emergencyContact': '+965 9654 3210 - مريم جورج (الزوجة)',
        'department': 'المبيعات والتسويق',
        'contractType': 'دائم',
        'workLocation': 'فرع المباركية الرئيسي',
        'passportNumber': 'B1234567',
        'passportExpiry': '2025-02-10',
        'residenceNumber': '1234567890',
        'residenceExpiry': '2024-05-05'
      },
      {
        'id': 'emp-2',
        'companyId': 'company-1', // شركة النيل الأزرق للمجوهرات
        'licenseId': 'license-2',
        'civilId': '29087654321',
        'fullName': 'رضا أحمد محمود',
        'nationality': 'مصري',
        'type': 'expatriate',
        'jobTitle': 'صائغ ذهب مختص',
        'actualJobTitle': 'Gold Craftsman Specialist',
        'hireDate': '2021-11-10',
        'monthlySalary': '850.00',
        'actualSalary': '880.00',
        'status': 'active',
        'phone': '+965 8765 4321',
        'email': 'reda.ahmed@nileblue-jewelry.com.kw',
        'address': 'الكويت، فحيحيل، قطعة 7، شارع 23',
        'emergencyContact': '+965 8543 2109 - أم رضا (الوالدة)',
        'department': 'الإنتاج والتصنيع',
        'contractType': 'دائم',
        'workLocation': 'ورشة التصنيع - فحيحيل',
        'passportNumber': 'C7890123',
        'passportExpiry': '2024-12-15',
        'residenceNumber': '9876543210',
        'residenceExpiry': '2024-06-10'
      },
      {
        'id': 'emp-3',
        'companyId': 'company-2', // شركة قمة النيل للتجارة
        'licenseId': 'license-3',
        'civilId': '29187456320',
        'fullName': 'خالد عبدالله السالم',
        'nationality': 'كويتي',
        'type': 'citizen',
        'jobTitle': 'مدير العمليات التجارية',
        'actualJobTitle': 'Commercial Operations Manager',
        'hireDate': '2020-08-15',
        'monthlySalary': '1100.00',
        'actualSalary': '1150.00',
        'status': 'active',
        'phone': '+965 7654 3210',
        'email': 'khalid.salem@qammatnile.com.kw',
        'address': 'الكويت، السالمية، قطعة 12، شارع 35',
        'emergencyContact': '+965 7432 1098 - نورا خالد (الزوجة)',
        'department': 'العمليات والتجارة',
        'contractType': 'دائم',
        'workLocation': 'المكتب الرئيسي - الشرق'
      },
      {
        'id': 'emp-4',
        'companyId': 'company-3', // شركة الاتحاد الخليجي للأقمشة
        'licenseId': 'license-4',
        'civilId': '29276543210',
        'fullName': 'أحمد عبدالرحمن المطوع',
        'nationality': 'كويتي',
        'type': 'citizen',
        'jobTitle': 'مدير مبيعات الأقمشة',
        'actualJobTitle': 'Fabric Sales Manager',
        'hireDate': '2022-01-25',
        'monthlySalary': '900.00',
        'actualSalary': '920.00',
        'status': 'active',
        'phone': '+965 6543 2109',
        'email': 'ahmed.mutawa@gulf-union-fabrics.com',
        'address': 'الكويت، الجهراء، المنطقة التجارية، مبنى 8',
        'emergencyContact': '+965 6321 0987 - فاطمة أحمد (الزوجة)',
        'department': 'المبيعات',
        'contractType': 'دائم',
        'workLocation': 'معرض الجهراء'
      },
      {
        'id': 'emp-5',
        'companyId': 'company-5', // شركة ميلانو للأزياء
        'licenseId': 'license-5',
        'civilId': '29365432109',
        'fullName': 'ليزا سامي جرجس',
        'nationality': 'مصر',
        'type': 'expatriate',
        'jobTitle': 'مصممة أزياء ومشرفة إنتاج',
        'actualJobTitle': 'Fashion Designer & Production Supervisor',
        'hireDate': '2021-05-12',
        'monthlySalary': '1050.00',
        'actualSalary': '1080.00',
        'status': 'active',
        'phone': '+965 5432 1098',
        'email': 'lisa.samy@milano-fashion.com.kw',
        'address': 'الكويت، حولي، شارع بيروت، مجمع 22',
        'emergencyContact': '+965 5210 9876 - سامي جرجس (الوالد)',
        'department': 'التصميم والإنتاج',
        'contractType': 'دائم',
        'workLocation': 'ورشة التصميم - السالمية',
        'passportNumber': 'D4567890',
        'passportExpiry': '2026-08-22',
        'residenceNumber': '6543210987',
        'residenceExpiry': '2025-07-17'
      }
    ];

    log.info('✅ Created sample employees:', {'count': sampleEmployees.length}, 'SEED_DATA');

    // Create company user relationships
    const companyUserRelations = await db.insert(companyUsers).values([
      {
        'userId': 'user-1',
        'companyId': 'company-1',
        'role': 'company_manager',
        'permissions': ['all']
      },
      {
        'userId': 'user-2',
        'companyId': 'company-1',
        'role': 'administrative_employee',
        'permissions': ['employees_view', 'employees_create', 'leaves_approve']
      },
      {
        'userId': 'user-3',
        'companyId': 'company-1',
        'role': 'supervisor',
        'permissions': ['employees_view', 'attendance_manage'],
        'supervisedWorkers': ['emp-4', 'emp-5']
      }
    ]).returning();

    log.info('✅ Created company user relations:', {
  'count': companyUserRelations.length
}, 'SEED_DATA');
    log.info('🎉 Database seeding completed successfully!', null, 'SEED_DATA');

    return {
      'companies': [company],
      'users': sampleUsers,
      'licenses': sampleLicenses,
      'employees': sampleEmployees,
      'relations': companyUserRelations
    };

  } catch (error) {

    logger.error('❌ Error seeding database:', error);
    throw error;

  }

}
