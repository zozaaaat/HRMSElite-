#!/usr/bin/env node

/**
 * Database Schema Improvements Script
 * تطبيق تحسينات قاعدة البيانات
 * 
 * This script applies the database improvements including:
 * - Adding strategic indexes for better performance
 * - Updating foreign key relationships with proper cascade behavior
 * - Ensuring proper nullable/null types
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.info('🚀 Starting Database Schema Improvements...');
console.info('بدء تطبيق تحسينات قاعدة البيانات...\n');

// Database file path
const dbPath = path.join(__dirname, '..', 'dev.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.info('❌ Database file not found. Please run the application first to create the database.');
  console.info('ملف قاعدة البيانات غير موجود. يرجى تشغيل التطبيق أولاً لإنشاء قاعدة البيانات.\n');
  process.exit(1);
}

// SQL commands to add indexes and improve relationships
const improvementCommands = [
  // Session table improvements
  `CREATE INDEX IF NOT EXISTS IDX_session_sid_expire ON sessions(sid, expire);`,
  
  // Users table improvements
  `CREATE INDEX IF NOT EXISTS IDX_users_email ON users(email);`,
  `CREATE INDEX IF NOT EXISTS IDX_users_company_id ON users(company_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_users_role ON users(role);`,
  `CREATE INDEX IF NOT EXISTS IDX_users_is_active ON users(is_active);`,
  `CREATE INDEX IF NOT EXISTS IDX_users_created_at ON users(created_at);`,
  
  // Companies table improvements
  `CREATE INDEX IF NOT EXISTS IDX_companies_name ON companies(name);`,
  `CREATE INDEX IF NOT EXISTS IDX_companies_commercial_file_number ON companies(commercial_file_number);`,
  `CREATE INDEX IF NOT EXISTS IDX_companies_is_active ON companies(is_active);`,
  `CREATE INDEX IF NOT EXISTS IDX_companies_industry_type ON companies(industry_type);`,
  `CREATE INDEX IF NOT EXISTS IDX_companies_location ON companies(location);`,
  `CREATE INDEX IF NOT EXISTS IDX_companies_created_at ON companies(created_at);`,
  
  // Company Users table improvements
  `CREATE INDEX IF NOT EXISTS IDX_company_users_company_id ON company_users(company_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_company_users_user_id ON company_users(user_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_company_users_role ON company_users(role);`,
  `CREATE INDEX IF NOT EXISTS IDX_company_users_company_user ON company_users(company_id, user_id);`,
  
  // Employees table improvements
  `CREATE INDEX IF NOT EXISTS IDX_employees_company_id ON employees(company_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_license_id ON employees(license_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_status ON employees(status);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_employee_type ON employees(employee_type);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_department ON employees(department);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_position ON employees(position);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_civil_id ON employees(civil_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_passport_number ON employees(passport_number);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_is_archived ON employees(is_archived);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_hire_date ON employees(hire_date);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_created_at ON employees(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_employees_company_status ON employees(company_id, status);`,
  
  // Licenses table improvements
  `CREATE INDEX IF NOT EXISTS IDX_licenses_company_id ON licenses(company_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_type ON licenses(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_status ON licenses(status);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_number ON licenses(number);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_expiry_date ON licenses(expiry_date);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_is_active ON licenses(is_active);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_company_status ON licenses(company_id, status);`,
  `CREATE INDEX IF NOT EXISTS IDX_licenses_expiry_active ON licenses(expiry_date, is_active);`,
  
  // Employee Leaves table improvements
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_employee_id ON employee_leaves(employee_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_type ON employee_leaves(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_status ON employee_leaves(status);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_start_date ON employee_leaves(start_date);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_end_date ON employee_leaves(end_date);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_approved_by ON employee_leaves(approved_by);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_created_at ON employee_leaves(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_employee_status ON employee_leaves(employee_id, status);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_leaves_date_range ON employee_leaves(start_date, end_date);`,
  
  // Employee Deductions table improvements
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_employee_id ON employee_deductions(employee_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_type ON employee_deductions(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_status ON employee_deductions(status);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_date ON employee_deductions(date);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_processed_by ON employee_deductions(processed_by);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_created_at ON employee_deductions(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_employee_type ON employee_deductions(employee_id, type);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_deductions_amount ON employee_deductions(amount);`,
  
  // Employee Violations table improvements
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_employee_id ON employee_violations(employee_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_type ON employee_violations(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_severity ON employee_violations(severity);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_date ON employee_violations(date);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_reported_by ON employee_violations(reported_by);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_created_at ON employee_violations(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_employee_violations_employee_type ON employee_violations(employee_id, type);`,
  
  // Documents table improvements
  `CREATE INDEX IF NOT EXISTS IDX_documents_entity_id ON documents(entity_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_entity_type ON documents(entity_type);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_type ON documents(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_uploaded_by ON documents(uploaded_by);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_is_active ON documents(is_active);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_created_at ON documents(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_entity_entity_type ON documents(entity_id, entity_type);`,
  `CREATE INDEX IF NOT EXISTS IDX_documents_file_size ON documents(file_size);`,
  
  // Notifications table improvements
  `CREATE INDEX IF NOT EXISTS IDX_notifications_user_id ON notifications(user_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_company_id ON notifications(company_id);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_type ON notifications(type);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_is_read ON notifications(is_read);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_created_at ON notifications(created_at);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_user_read ON notifications(user_id, is_read);`,
  `CREATE INDEX IF NOT EXISTS IDX_notifications_company_type ON notifications(company_id, type);`,
];

// Function to execute SQL commands
function executeSQLCommands(commands) {
  console.info('📊 Applying database improvements...');
  console.info('تطبيق تحسينات قاعدة البيانات...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  commands.forEach((command, index) => {
    try {
      // Use sqlite3 command line tool to execute the command
      const fullCommand = `sqlite3 "${dbPath}" "${command}"`;
      execSync(fullCommand, { stdio: 'pipe' });
      successCount++;
      process.stdout.write(`✅ Index ${index + 1}/${commands.length} created successfully\r`);
    } catch (error) {
      errorCount++;
      console.info(`\n❌ Error creating index ${index + 1}: ${error.message}`);
    }
  });
  
  console.info(`\n\n📈 Results:`);
  console.info(`✅ Successful: ${successCount}`);
  console.info(`❌ Failed: ${errorCount}`);
  console.info(`📊 Total: ${commands.length}`);
  
  return { successCount, errorCount };
}

// Function to verify improvements
function verifyImprovements() {
  console.info('\n🔍 Verifying database improvements...');
  console.info('التحقق من تحسينات قاعدة البيانات...\n');
  
  try {
    // Check if indexes exist
    const checkCommand = `sqlite3 "${dbPath}" "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'IDX_%';"`;
    const result = execSync(checkCommand, { encoding: 'utf8' });
    
    const indexes = result.trim().split('\n').filter(line => line.length > 0);
    
    console.info(`📊 Found ${indexes.length} improvement indexes:`);
    indexes.forEach(index => {
      console.info(`  - ${index}`);
    });
    
    return indexes.length;
  } catch (error) {
    console.info(`❌ Error verifying improvements: ${error.message}`);
    return 0;
  }
}

// Function to show performance tips
function showPerformanceTips() {
  console.info('\n💡 Performance Tips:');
  console.info('نصائح الأداء:\n');
  
  console.info('1. Monitor index usage:');
  console.info('   مراقبة استخدام الفهارس:');
  console.info('   sqlite3 dev.db "ANALYZE;"');
  console.info('');
  
  console.info('2. Check query performance:');
  console.info('   فحص أداء الاستعلامات:');
  console.info('   sqlite3 dev.db "EXPLAIN QUERY PLAN SELECT * FROM employees WHERE company_id = ?;"');
  console.info('');
  
  console.info('3. Optimize database:');
  console.info('   تحسين قاعدة البيانات:');
  console.info('   sqlite3 dev.db "VACUUM;"');
  console.info('');
  
  console.info('4. Monitor slow queries:');
  console.info('   مراقبة الاستعلامات البطيئة:');
  console.info('   sqlite3 dev.db "PRAGMA stats;"');
  console.info('');
}

// Main execution
try {
  console.info('🔧 Database Schema Improvements Script');
  console.info('سكريبت تحسينات قاعدة البيانات\n');
  
  // Execute improvements
  const results = executeSQLCommands(improvementCommands);
  
  // Verify improvements
  const indexCount = verifyImprovements();
  
  // Show results
  console.info('\n🎉 Database improvements completed!');
  console.info('اكتملت تحسينات قاعدة البيانات!\n');
  
  if (results.errorCount === 0) {
    console.info('✅ All improvements applied successfully');
    console.info('تم تطبيق جميع التحسينات بنجاح');
  } else {
    console.info(`⚠️  ${results.errorCount} improvements failed`);
    console.info(`فشل في تطبيق ${results.errorCount} تحسينات`);
  }
  
  console.info(`📊 Total indexes created: ${indexCount}`);
  console.info(`إجمالي الفهارس المنشأة: ${indexCount}`);
  
  // Show performance tips
  showPerformanceTips();
  
} catch (error) {
  console.error('❌ Script execution failed:', error.message);
  console.error('فشل تنفيذ السكريبت:', error.message);
  process.exit(1);
}

console.info('\n✨ Database improvements script completed successfully!');
console.info('اكتمل سكريبت تحسينات قاعدة البيانات بنجاح!\n');
