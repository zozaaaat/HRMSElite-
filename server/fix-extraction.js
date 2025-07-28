import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to properly extract employee data with correct column mapping
function fixEmployeeExtraction() {
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
        console.log(`إصلاح استخراج البيانات من: ${company.file}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`عدد الصفوف في ${company.name}: ${data.length}`);
        console.log(`عينة من البيانات:`, data.slice(0, 3));
        
        // Skip header row and process employee data with correct column mapping
        let validEmployees = 0;
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row.length > 2) {
            // Try to find the actual name column - usually column 2 (index 2)
            let employeeName = '';
            let civilId = '';
            let position = '';
            let nationality = '';
            
            // Column mapping - adapt based on actual file structure
            if (row[2] && typeof row[2] === 'string' && row[2].trim() !== '') {
              employeeName = row[2].toString().trim();
              civilId = row[0] ? row[0].toString() : '';
              position = row[3] ? row[3].toString() : getDefaultPosition(companyId);
              nationality = row[4] ? row[4].toString() : 'كويتي';
            } else if (row[1] && typeof row[1] === 'string' && row[1].trim() !== '') {
              employeeName = row[1].toString().trim();
              civilId = row[0] ? row[0].toString() : '';
              position = row[2] ? row[2].toString() : getDefaultPosition(companyId);
              nationality = row[3] ? row[3].toString() : 'كويتي';
            } else {
              continue; // Skip rows without valid names
            }
            
            // Validate name is actually a name (contains Arabic letters)
            if (employeeName && /[\u0600-\u06FF]/.test(employeeName)) {
              const employee = {
                id: `emp-${companyId}-${validEmployees + 1}`,
                name: employeeName,
                position: position || getDefaultPosition(companyId),
                department: getDefaultDepartment(companyId),
                nationality: nationality || "كويتي",
                civilId: civilId || "",
                passport: "",
                phone: generatePhone(),
                email: generateEmail(employeeName, company.name),
                salary: Math.floor(Math.random() * 800) + 300,
                joinDate: generateJoinDate(),
                status: "active",
                performance: Math.floor(Math.random() * 30) + 70,
                companyId: companyId,
                company: company.name
              };
              company.employees.push(employee);
              validEmployees++;
            }
          }
        }
        
        console.log(`${company.name}: ${company.employees.length} موظف صحيح`);
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
  const safeName = name && typeof name === 'string' ? 
    name.toString().replace(/\s+/g, '').replace(/[\u0600-\u06FF]/g, 'emp').toLowerCase() : 'employee';
  const companyDomain = companyName.includes('الاتحاد') ? 'gulf-union' :
                       companyName.includes('النيل الأزرق') ? 'blue-nile' :
                       companyName.includes('قمة النيل') ? 'peak-nile' :
                       companyName.includes('محمد أحمد') ? 'mohamed-ahmed' :
                       companyName.includes('ميلانو') ? 'milano' : 'company';
  return `${safeName}@${companyDomain}.com`;
}

function generatePhone() {
  return `+965-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateJoinDate() {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
}

// Extract and save corrected data
try {
  const companies = fixEmployeeExtraction();
  const totalEmployees = Object.values(companies).reduce((sum, company) => sum + company.employees.length, 0);
  console.log(`\nإجمالي الموظفين المُصحح: ${totalEmployees}`);
  
  // Save corrected data
  fs.writeFileSync(
    path.join(__dirname, 'corrected-employees.json'), 
    JSON.stringify(companies, null, 2),
    'utf8'
  );
  
  console.log('تم حفظ البيانات المُصححة في corrected-employees.json');
  
} catch (error) {
  console.error('خطأ في إصلاح البيانات:', error);
}