import Database from 'better-sqlite3';

// إنشاء قاعدة البيانات
const sqlite = new Database('./dev.db');

console.log('✅ قاعدة البيانات تم إنشاؤها بنجاح!');
console.log('📁 الملف: dev.db');

// إنشاء الجداول الأساسية
try {
  // إنشاء جدول المستخدمين
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      email TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      profile_image_url TEXT,
      role TEXT DEFAULT 'worker',
      company_id TEXT,
      permissions TEXT DEFAULT '[]',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // إنشاء جدول الشركات
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      name TEXT NOT NULL,
      commercial_file_number TEXT,
      commercial_file_name TEXT,
      commercial_file_status INTEGER DEFAULT 1,
      establishment_date TEXT,
      commercial_registration_number TEXT,
      classification TEXT,
      department TEXT,
      file_type TEXT,
      legal_entity TEXT,
      ownership_category TEXT,
      logo_url TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      total_employees INTEGER DEFAULT 0,
      total_licenses INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      industry_type TEXT,
      business_activity TEXT,
      location TEXT,
      tax_number TEXT,
      chambers TEXT,
      partnerships TEXT DEFAULT '[]',
      import_export_license TEXT,
      special_permits TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  // إنشاء جدول الموظفين
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      company_id TEXT NOT NULL,
      license_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      arabic_name TEXT,
      english_name TEXT,
      passport_number TEXT,
      civil_id TEXT,
      nationality TEXT,
      date_of_birth TEXT,
      gender TEXT,
      marital_status TEXT,
      employee_type TEXT DEFAULT 'expatriate',
      status TEXT DEFAULT 'active',
      position TEXT,
      department TEXT,
      hire_date TEXT,
      salary REAL DEFAULT 0,
      phone TEXT,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      photo_url TEXT,
      documents TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      notes TEXT,
      is_archived INTEGER DEFAULT 0,
      archive_reason TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )
  `);

  console.log('✅ الجداول تم إنشاؤها بنجاح!');
  console.log('📊 الجداول المنشأة:');
  console.log('   - users');
  console.log('   - companies');
  console.log('   - employees');
} catch (error) {
  console.error('❌ خطأ في إنشاء الجداول:', error);
}

sqlite.close(); 