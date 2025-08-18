import Database from 'better-sqlite3';

// فتح قاعدة البيانات
const sqlite = new Database('./dev.db');

console.info('📊 إضافة البيانات التجريبية...');

try {
  // إضافة شركات تجريبية
  const companies = [
    {
      id: 'company-1',
      name: 'شركة الاتحاد الخليجي',
      commercial_file_name: 'الاتحاد الخليجي للتجارة',
      department: 'التجارة العامة',
      classification: 'شركة ذات مسؤولية محدودة',
      status: 'active',
      industry_type: 'أقمشة',
      location: 'المباركية',
      establishment_date: '2020-01-15'
    },
    {
      id: 'company-2',
      name: 'شركة النيل الأزرق للمجوهرات',
      commercial_file_name: 'النيل الأزرق للمجوهرات',
      department: 'المجوهرات',
      classification: 'شركة ذات مسؤولية محدودة',
      status: 'active',
      industry_type: 'مجوهرات',
      location: 'الجهراء',
      establishment_date: '2019-03-20'
    },
    {
      id: 'company-3',
      name: 'شركة قمة النيل',
      commercial_file_name: 'قمة النيل للتجارة',
      department: 'التجارة العامة',
      classification: 'شركة ذات مسؤولية محدودة',
      status: 'active',
      industry_type: 'خياطة',
      location: 'الصفاة',
      establishment_date: '2021-06-10'
    }
  ];

  // إضافة الشركات
  companies.forEach(company => {
    sqlite.prepare(`
      INSERT OR REPLACE INTO companies (
        id, name, commercial_file_name, department, classification, 
        is_active, industry_type, location, establishment_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      company.id,
      company.name,
      company.commercial_file_name,
      company.department,
      company.classification,
      1, // is_active
      company.industry_type,
      company.location,
      company.establishment_date
    );
  });

  // إضافة موظفين تجريبيين
  const employees = [
    {
      id: 'emp-1',
      company_id: 'company-1',
      first_name: 'محمد',
      last_name: 'أحمد',
      arabic_name: 'محمد أحمد إبراهيم',
      english_name: 'Mohammed Ahmed Ibrahim',
      nationality: 'مصري',
      position: 'مدير عام',
      salary: 2500,
      status: 'active'
    },
    {
      id: 'emp-2',
      company_id: 'company-2',
      first_name: 'أحمد',
      last_name: 'علي',
      arabic_name: 'أحمد علي حسن',
      english_name: 'Ahmed Ali Hassan',
      nationality: 'سوري',
      position: 'محاسب',
      salary: 1800,
      status: 'active'
    },
    {
      id: 'emp-3',
      company_id: 'company-3',
      first_name: 'فاطمة',
      last_name: 'محمد',
      arabic_name: 'فاطمة محمد علي',
      english_name: 'Fatima Mohammed Ali',
      nationality: 'لبنانية',
      position: 'سكرتيرة',
      salary: 1500,
      status: 'active'
    }
  ];

  // إضافة الموظفين
  employees.forEach(emp => {
    sqlite.prepare(`
      INSERT OR REPLACE INTO employees (
        id, company_id, first_name, last_name, arabic_name, english_name,
        nationality, position, salary, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      emp.id,
      emp.company_id,
      emp.first_name,
      emp.last_name,
      emp.arabic_name,
      emp.english_name,
      emp.nationality,
      emp.position,
      emp.salary,
      emp.status
    );
  });

  // إضافة مستخدم تجريبي
  sqlite.prepare(`
    INSERT OR REPLACE INTO users (
      id, email, first_name, last_name, role, is_active
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'user-1',
    'admin@company.com',
    'محمد',
    'أحمد',
    'company_manager',
    1
  );

  console.info('✅ تم إضافة البيانات التجريبية بنجاح!');
  console.info('📊 البيانات المضافة:');
  console.info('   - 3 شركات');
  console.info('   - 3 موظفين');
  console.info('   - 1 مستخدم');

} catch (error) {
  console.error('❌ خطأ في إضافة البيانات:', error);
}

sqlite.close(); 