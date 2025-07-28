import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read Excel files and extract employee data
function extractEmployeeData() {
  const companies = {
    "1": { name: "شركة الاتحاد الخليجي للأقمشة", file: "اسماء عمال شركة الاتحاد الخليجي جميع التراخيص (2).xlsx", employees: [] },
    "2": { name: "شركة النيل الأزرق للمجوهرات", file: "اسماء عمال شركة النيل الازرق جميع التراخيص جورج.xlsx", employees: [] },
    "3": { name: "شركة قمة النيل للذهب", file: "اسماء عمال شركة قمة النيل الخالد جميع التراخيص - - Copy.xlsx", employees: [] },
    "4": { name: "شركة محمد أحمد إبراهيم", file: "اسماء عمال شركة محمد احمد ابراهيم  جميع التراخيص - (1).xlsx", employees: [] },
    "5": { name: "شركة ميلانو", file: "اسماء عمال شركة ميلانو جميع التراخيص - جورج.xlsx", employees: [] }
  };

  const basePath = path.join(__dirname, '../attached_assets/ملفات');
  
  Object.keys(companies).forEach(companyId => {
    const company = companies[companyId];
    const filePath = path.join(basePath, company.file);
    
    try {
      if (fs.existsSync(filePath)) {
        console.log(`قراءة ملف: ${company.file}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip header row and process employee data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row.length > 0 && row[0]) {
            const employeeName = row[0] && typeof row[0] !== 'undefined' ? row[0].toString() : `موظف ${i}`;
            const employee = {
              id: `emp-${companyId}-${i}`,
              name: employeeName,
              position: row[1] && typeof row[1] !== 'undefined' ? row[1].toString() : getDefaultPosition(companyId),
              department: row[2] && typeof row[2] !== 'undefined' ? row[2].toString() : getDefaultDepartment(companyId),
              nationality: row[3] && typeof row[3] !== 'undefined' ? row[3].toString() : "كويتي",
              civilId: row[4] && typeof row[4] !== 'undefined' ? row[4].toString() : "",
              passport: row[5] && typeof row[5] !== 'undefined' ? row[5].toString() : "",
              phone: row[6] && typeof row[6] !== 'undefined' ? row[6].toString() : "+965-XXXX-XXXX",
              email: generateEmail(employeeName, company.name),
              salary: Math.floor(Math.random() * 800) + 300, // Random salary between 300-1100 KWD
              joinDate: generateJoinDate(),
              status: "active",
              performance: Math.floor(Math.random() * 30) + 70, // Random performance 70-100%
              companyId: companyId,
              company: company.name
            };
            company.employees.push(employee);
          }
        }
        
        console.log(`${company.name}: ${company.employees.length} موظف`);
      } else {
        console.log(`الملف غير موجود: ${filePath}`);
      }
    } catch (error) {
      console.error(`خطأ في قراءة الملف ${company.file}:`, error.message);
    }
  });

  return companies;
}

function getDefaultPosition(companyId) {
  const positions = {
    "1": ["قصاص أقمشة", "مقيم جودة أقمشة", "موظف مبيعات", "أمين مخزن"],
    "2": ["صائغ", "مساعد صائغ", "مقيم أحجار", "موظف مبيعات"],
    "3": ["صائغ رئيسي", "مساعد صائغ", "مقيم ذهب", "موظف مبيعات"],
    "4": ["موظف إداري", "محاسب", "موظف مبيعات", "عامل"],
    "5": ["خياط", "مصمم أزياء", "موظف مبيعات", "عامل"]
  };
  const companyPositions = positions[companyId] || ["موظف", "عامل"];
  return companyPositions[Math.floor(Math.random() * companyPositions.length)];
}

function getDefaultDepartment(companyId) {
  const departments = {
    "1": ["المبيعات", "المخازن", "الجودة", "الإدارة"],
    "2": ["الصياغة", "المبيعات", "التقييم", "الإدارة"],
    "3": ["الصياغة", "المبيعات", "التقييم", "الإدارة"],
    "4": ["الإدارة", "المحاسبة", "المبيعات", "العمليات"],
    "5": ["الخياطة", "التصميم", "المبيعات", "الإدارة"]
  };
  const companyDepartments = departments[companyId] || ["الإدارة", "العمليات"];
  return companyDepartments[Math.floor(Math.random() * companyDepartments.length)];
}

function generateEmail(name, companyName) {
  const safeName = name && typeof name === 'string' ? name.toString().replace(/\s+/g, '').toLowerCase() : 'employee';
  const companyDomain = companyName.includes('الاتحاد') ? 'gulf-union' :
                       companyName.includes('النيل الأزرق') ? 'blue-nile' :
                       companyName.includes('قمة النيل') ? 'peak-nile' :
                       companyName.includes('محمد أحمد') ? 'mohamed-ahmed' :
                       companyName.includes('ميلانو') ? 'milano' : 'company';
  return `${safeName}@${companyDomain}.com`;
}

function generateJoinDate() {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

// Extract and save data
try {
  const companies = extractEmployeeData();
  const totalEmployees = Object.values(companies).reduce((sum, company) => sum + company.employees.length, 0);
  console.log(`\nإجمالي الموظفين المستخرجين: ${totalEmployees}`);
  
  // Save to JSON file for use in the application
  fs.writeFileSync(
    path.join(__dirname, 'extracted-employees.json'), 
    JSON.stringify(companies, null, 2),
    'utf8'
  );
  
  console.log('تم حفظ البيانات في extracted-employees.json');
  
} catch (error) {
  console.error('خطأ في استخراج البيانات:', error);
}