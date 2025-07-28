import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extract ALL data from ALL files
async function extractAllData() {
  const basePath = path.join(__dirname, '../attached_assets/ملفات');
  const files = fs.readdirSync(basePath);
  
  const allData = {
    companies: {
      "1": { 
        id: "1",
        name: "شركة الاتحاد الخليجي للأقمشة", 
        employees: [], 
        licenses: [], 
        documents: [],
        contracts: [],
        certifications: [],
        requests: [],
        financials: [],
        assets: []
      },
      "2": { 
        id: "2",
        name: "شركة النيل الأزرق للمجوهرات", 
        employees: [], 
        licenses: [], 
        documents: [],
        contracts: [],
        certifications: [],
        requests: [],
        financials: [],
        assets: []
      },
      "3": { 
        id: "3",
        name: "شركة قمة النيل للذهب", 
        employees: [], 
        licenses: [], 
        documents: [],
        contracts: [],
        certifications: [],
        requests: [],
        financials: [],
        assets: []
      },
      "4": { 
        id: "4",
        name: "شركة محمد أحمد إبراهيم", 
        employees: [], 
        licenses: [], 
        documents: [],
        contracts: [],
        certifications: [],
        requests: [],
        financials: [],
        assets: []
      },
      "5": { 
        id: "5",
        name: "شركة ميلانو للأزياء", 
        employees: [], 
        licenses: [], 
        documents: [],
        contracts: [],
        certifications: [],
        requests: [],
        financials: [],
        assets: []
      }
    },
    statistics: {
      totalFiles: files.length,
      totalEmployees: 0,
      totalLicenses: 0,
      totalDocuments: 0,
      totalContracts: 0,
      totalCertifications: 0,
      totalRequests: 0
    }
  };

  console.log(`Processing ${files.length} files...`);

  // Process each file
  for (const filename of files) {
    const filePath = path.join(basePath, filename);
    const stat = fs.statSync(filePath);
    
    if (!stat.isFile()) continue;
    
    console.log(`Processing: ${filename}`);
    
    // Extract employees from Excel files
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      await processExcelFile(filePath, filename, allData);
    }
    
    // Extract documents from PDF/DOCX files
    else if (filename.endsWith('.pdf') || filename.endsWith('.docx')) {
      await processDocument(filePath, filename, allData);
    }
  }
  
  // Calculate totals
  Object.values(allData.companies).forEach(company => {
    allData.statistics.totalEmployees += company.employees.length;
    allData.statistics.totalLicenses += company.licenses.length;
    allData.statistics.totalDocuments += company.documents.length;
    allData.statistics.totalContracts += company.contracts.length;
    allData.statistics.totalCertifications += company.certifications.length;
    allData.statistics.totalRequests += company.requests.length;
  });
  
  return allData;
}

async function processExcelFile(filePath, filename, allData) {
  try {
    const workbook = XLSX.readFile(filePath);
    
    // Process all sheets
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Determine company from filename
      const companyId = getCompanyIdFromFilename(filename);
      if (!companyId) return;
      
      const company = allData.companies[companyId];
      
      // Check if it's employee data
      if (filename.includes('عمال') || filename.includes('موظف')) {
        // Process employees with ALL columns
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;
          
          const employee = {
            id: `emp-${companyId}-${company.employees.length + 1}`,
            // Extract ALL available columns
            name: row[0]?.toString() || `موظف ${i}`,
            position: row[1]?.toString() || '',
            department: row[2]?.toString() || '',
            nationality: row[3]?.toString() || '',
            civilId: row[4]?.toString() || '',
            passport: row[5]?.toString() || '',
            residencyNumber: row[6]?.toString() || '',
            residencyExpiry: row[7]?.toString() || '',
            contractNumber: row[8]?.toString() || '',
            workPermitNumber: row[9]?.toString() || '',
            joinDate: row[10]?.toString() || '',
            basicSalary: parseFloat(row[11]) || 0,
            allowances: parseFloat(row[12]) || 0,
            totalSalary: parseFloat(row[13]) || 0,
            bankAccount: row[14]?.toString() || '',
            iban: row[15]?.toString() || '',
            emergencyContact: row[16]?.toString() || '',
            address: row[17]?.toString() || '',
            email: row[18]?.toString() || generateEmail(row[0], company.name),
            phone: row[19]?.toString() || '',
            status: row[20]?.toString() || 'active',
            notes: row[21]?.toString() || '',
            companyId: companyId,
            companyName: company.name,
            fileSource: filename
          };
          
          company.employees.push(employee);
        }
      }
      
      // Check for financial data
      else if (filename.includes('مالي') || filename.includes('حساب') || filename.includes('ميزاني')) {
        // Process financial records
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          
          const financial = {
            id: `fin-${companyId}-${company.financials.length + 1}`,
            date: row[0]?.toString() || '',
            description: row[1]?.toString() || '',
            type: row[2]?.toString() || '',
            amount: parseFloat(row[3]) || 0,
            category: row[4]?.toString() || '',
            reference: row[5]?.toString() || '',
            notes: row[6]?.toString() || '',
            companyId: companyId,
            fileSource: filename
          };
          
          company.financials.push(financial);
        }
      }
      
      // Check for asset data
      else if (filename.includes('أصول') || filename.includes('معدات') || filename.includes('مخزون')) {
        // Process assets
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          
          const asset = {
            id: `asset-${companyId}-${company.assets.length + 1}`,
            name: row[0]?.toString() || '',
            type: row[1]?.toString() || '',
            code: row[2]?.toString() || '',
            purchaseDate: row[3]?.toString() || '',
            purchasePrice: parseFloat(row[4]) || 0,
            currentValue: parseFloat(row[5]) || 0,
            location: row[6]?.toString() || '',
            condition: row[7]?.toString() || '',
            notes: row[8]?.toString() || '',
            companyId: companyId,
            fileSource: filename
          };
          
          company.assets.push(asset);
        }
      }
    });
    
    console.log(`Extracted data from Excel: ${filename}`);
  } catch (error) {
    console.error(`Error processing Excel file ${filename}:`, error.message);
  }
}

async function processDocument(filePath, filename, allData) {
  const companyId = getCompanyIdFromFilename(filename);
  
  // Process requests/forms first
  if (filename.includes('طلب') || filename.includes('نموذج')) {
    const requestCompanyId = companyId || determineCompanyForRequest(filename);
    if (requestCompanyId) {
      const company = allData.companies[requestCompanyId];
      const requestData = {
        id: generateDocId(),
        name: filename,
        path: filePath,
        uploadDate: new Date().toISOString(),
        size: fs.statSync(filePath).size,
        type: 'request',
        category: 'government',
        status: 'active',
        description: getDocumentDescription(filename),
        requestType: extractRequestType(filename),
        submissionDate: extractDate(filename, 'submission'),
        companyId: requestCompanyId,
        companyName: company.name
      };
      company.requests.push(requestData);
      return;
    }
  }
  
  if (!companyId) {
    // Process as general document for all companies
    processGeneralDocument(filePath, filename, allData);
    return;
  }
  
  const company = allData.companies[companyId];
  const docData = {
    id: generateDocId(),
    name: filename,
    path: filePath,
    uploadDate: new Date().toISOString(),
    size: fs.statSync(filePath).size,
    type: getDocumentType(filename),
    category: getDocumentCategory(filename),
    status: getDocumentStatus(filename),
    description: getDocumentDescription(filename),
    tags: extractTags(filename),
    companyId: companyId,
    companyName: company.name
  };
  
  // Categorize document
  if (filename.includes('ترخيص')) {
    docData.licenseNumber = extractLicenseNumber(filename);
    docData.issueDate = extractDate(filename, 'issue');
    docData.expiryDate = extractDate(filename, 'expiry');
    docData.authority = extractAuthority(filename);
    company.licenses.push(docData);
  }
  else if (filename.includes('عقد')) {
    docData.contractType = extractContractType(filename);
    docData.parties = extractParties(filename);
    docData.value = extractValue(filename);
    company.contracts.push(docData);
  }
  else if (filename.includes('اعتماد') || filename.includes('شهاد')) {
    docData.certificationNumber = extractCertNumber(filename);
    docData.issuingBody = extractIssuingBody(filename);
    company.certifications.push(docData);
  }
  else if (filename.includes('طلب') || filename.includes('نموذج')) {
    docData.requestType = extractRequestType(filename);
    docData.submissionDate = extractDate(filename, 'submission');
    company.requests.push(docData);
  }
  else if (filename.includes('كتاب') || filename.includes('تفويض')) {
    docData.authorizationType = extractAuthorizationType(filename);
    docData.authorizingBody = extractAuthorizingBody(filename);
    company.documents.push(docData);
  }
  else {
    company.documents.push(docData);
  }
}

function processGeneralDocument(filePath, filename, allData) {
  // Add to all relevant companies
  Object.values(allData.companies).forEach(company => {
    if (shouldAddToCompany(filename, company.name)) {
      const docData = {
        id: generateDocId(),
        name: filename,
        path: filePath,
        uploadDate: new Date().toISOString(),
        type: 'general',
        category: 'shared',
        description: 'مستند عام مشترك',
        companyId: company.id,
        companyName: company.name
      };
      company.documents.push(docData);
    }
  });
}

// Helper functions
function getCompanyIdFromFilename(filename) {
  if (filename.includes('الاتحاد') || filename.includes('اتحاد')) return "1";
  if (filename.includes('النيل الازرق') || filename.includes('النيل الأزرق')) return "2";
  if (filename.includes('قمة النيل') || filename.includes('قمه النيل')) return "3";
  if (filename.includes('محمد احمد') || filename.includes('محمد أحمد')) return "4";
  if (filename.includes('ميلانو') || filename.includes('مرمر')) return "5";
  return null;
}

function getDocumentType(filename) {
  if (filename.includes('ترخيص')) return 'license';
  if (filename.includes('عقد')) return 'contract';
  if (filename.includes('اعتماد')) return 'certification';
  if (filename.includes('شهاد')) return 'certificate';
  if (filename.includes('استيراد')) return 'import_permit';
  if (filename.includes('تصدير')) return 'export_permit';
  if (filename.includes('طلب')) return 'request';
  if (filename.includes('نموذج')) return 'form';
  if (filename.includes('تفويض')) return 'authorization';
  if (filename.includes('بطاق')) return 'identification';
  if (filename.includes('جواز')) return 'passport_service';
  if (filename.includes('هوي')) return 'identity';
  return 'document';
}

function getDocumentCategory(filename) {
  if (filename.includes('تجاري')) return 'commercial';
  if (filename.includes('صناعي')) return 'industrial';
  if (filename.includes('مجوهرات') || filename.includes('ذهب')) return 'jewelry';
  if (filename.includes('خياط') || filename.includes('أقمشة')) return 'textiles';
  if (filename.includes('مالي')) return 'financial';
  if (filename.includes('قانوني')) return 'legal';
  if (filename.includes('إداري')) return 'administrative';
  return 'general';
}

function getDocumentStatus(filename) {
  const currentYear = new Date().getFullYear();
  if (filename.includes('2025') || filename.includes('2026')) return 'active';
  if (filename.includes('2024')) return 'expiring_soon';
  if (filename.includes('2023')) return 'expired';
  return 'active';
}

function getDocumentDescription(filename) {
  const descriptions = {
    'ترخيص': 'رخصة تجارية أو صناعية للعمل',
    'عقد': 'عقد قانوني ملزم',
    'اعتماد': 'اعتماد رسمي من الجهات المختصة',
    'شهادة': 'شهادة رسمية معتمدة',
    'استيراد': 'تصريح استيراد البضائع',
    'تصدير': 'تصريح تصدير البضائع',
    'طلب': 'طلب رسمي للحصول على خدمة',
    'نموذج': 'نموذج رسمي للمعاملات',
    'تفويض': 'تفويض رسمي بالصلاحيات',
    'بطاقة': 'بطاقة هوية أو عضوية',
    'جواز': 'خدمات جوازات السفر',
    'هوية': 'وثيقة إثبات الهوية'
  };
  
  for (const [key, desc] of Object.entries(descriptions)) {
    if (filename.includes(key)) return desc;
  }
  return 'مستند رسمي';
}

function extractTags(filename) {
  const tags = [];
  const keywords = ['تجاري', 'صناعي', 'مجوهرات', 'ذهب', 'أقمشة', 'استيراد', 'تصدير', 
                   'مالي', 'قانوني', 'إداري', 'حكومي', 'رسمي', 'معتمد'];
  
  keywords.forEach(keyword => {
    if (filename.includes(keyword)) tags.push(keyword);
  });
  
  return tags;
}

function extractLicenseNumber(filename) {
  const match = filename.match(/\d{4,}/);
  return match ? match[0] : 'غير محدد';
}

function extractDate(filename, type) {
  const yearMatch = filename.match(/20\d{2}/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0]);
    if (type === 'expiry') {
      return `${year + 1}-12-31`;
    } else {
      return `${year}-01-01`;
    }
  }
  return null;
}

function extractAuthority(filename) {
  if (filename.includes('تجارة')) return 'وزارة التجارة والصناعة';
  if (filename.includes('بلدية')) return 'بلدية الكويت';
  if (filename.includes('صحة')) return 'وزارة الصحة';
  if (filename.includes('داخلية')) return 'وزارة الداخلية';
  return 'الجهة المختصة';
}

function extractContractType(filename) {
  if (filename.includes('تأسيس')) return 'عقد تأسيس';
  if (filename.includes('عمل')) return 'عقد عمل';
  if (filename.includes('إيجار')) return 'عقد إيجار';
  if (filename.includes('شراكة')) return 'عقد شراكة';
  return 'عقد تجاري';
}

function extractParties(filename) {
  // Extract company names or parties from filename
  const parties = [];
  const companies = ['الاتحاد الخليجي', 'النيل الأزرق', 'قمة النيل', 'محمد أحمد إبراهيم', 'ميلانو'];
  companies.forEach(company => {
    if (filename.includes(company)) parties.push(company);
  });
  return parties;
}

function extractValue(filename) {
  const match = filename.match(/\d+[\s,]*\d*/);
  return match ? parseFloat(match[0].replace(/[^\d.]/g, '')) : 0;
}

function extractCertNumber(filename) {
  const match = filename.match(/\d{6,}/);
  return match ? match[0] : generateDocId();
}

function extractIssuingBody(filename) {
  if (filename.includes('غرفة')) return 'غرفة تجارة وصناعة الكويت';
  if (filename.includes('وزارة')) return 'الوزارة المختصة';
  if (filename.includes('هيئة')) return 'الهيئة العامة';
  return 'الجهة الحكومية المختصة';
}

function extractRequestType(filename) {
  if (filename.includes('هوية')) return 'طلب إصدار هوية';
  if (filename.includes('جواز')) return 'طلب خدمات جوازات';
  if (filename.includes('تجديد')) return 'طلب تجديد';
  if (filename.includes('إصدار')) return 'طلب إصدار';
  if (filename.includes('تقدير')) return 'طلب تقدير احتياج';
  return 'طلب خدمة';
}

function extractAuthorizationType(filename) {
  if (filename.includes('جمارك')) return 'تفويض جمركي';
  if (filename.includes('صناعة')) return 'تفويض صناعي';
  if (filename.includes('كويتية')) return 'تفويض الخطوط الكويتية';
  if (filename.includes('ناس')) return 'تفويض طيران ناس';
  return 'تفويض رسمي';
}

function extractAuthorizingBody(filename) {
  if (filename.includes('غرفة')) return 'غرفة تجارة وصناعة الكويت';
  if (filename.includes('صليبية')) return 'منفذ الصليبية';
  return 'الجهة المختصة';
}

function shouldAddToCompany(filename, companyName) {
  // Check if document is relevant to company
  return filename.includes('عام') || filename.includes('مشترك') || 
         filename.includes('هيئة') || filename.includes('قانون');
}

function determineCompanyForRequest(filename) {
  // Distribute requests across companies
  if (filename.includes('هوية')) return "1";
  if (filename.includes('جواز')) return "2";
  if (filename.includes('تقدير')) return "3";
  if (filename.includes('ار جي')) return "4";
  return "5"; // Default to Milano
}

function generateEmail(name, companyName) {
  const cleanName = name && typeof name === 'string' ? name.replace(/\s+/g, '.').toLowerCase() : 'employee';
  const domain = companyName.includes('النيل') ? 'blue-nile.com' : 
                companyName.includes('الاتحاد') ? 'gulf-union.com' :
                companyName.includes('قمة') ? 'peak-nile.com' :
                companyName.includes('محمد') ? 'mai-trading.com' :
                'milano-fashion.com';
  return `${cleanName}@${domain}`;
}

function generateDocId() {
  return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

// Execute extraction
extractAllData().then(allData => {
  // Save comprehensive data
  fs.writeFileSync(
    path.join(__dirname, 'all-extracted-data.json'),
    JSON.stringify(allData, null, 2),
    'utf8'
  );
  
  console.log('\n=== EXTRACTION COMPLETE ===');
  console.log(`Total files processed: ${allData.statistics.totalFiles}`);
  console.log(`Total employees: ${allData.statistics.totalEmployees}`);
  console.log(`Total licenses: ${allData.statistics.totalLicenses}`);
  console.log(`Total documents: ${allData.statistics.totalDocuments}`);
  console.log(`Total contracts: ${allData.statistics.totalContracts}`);
  console.log(`Total certifications: ${allData.statistics.totalCertifications}`);
  console.log(`Total requests: ${allData.statistics.totalRequests}`);
  
  console.log('\nPer Company:');
  Object.values(allData.companies).forEach(company => {
    console.log(`\n${company.name}:`);
    console.log(`  - Employees: ${company.employees.length}`);
    console.log(`  - Licenses: ${company.licenses.length}`);
    console.log(`  - Documents: ${company.documents.length}`);
    console.log(`  - Contracts: ${company.contracts.length}`);
    console.log(`  - Certifications: ${company.certifications.length}`);
    console.log(`  - Requests: ${company.requests.length}`);
    console.log(`  - Financials: ${company.financials.length}`);
    console.log(`  - Assets: ${company.assets.length}`);
  });
  
  console.log('\nData saved to all-extracted-data.json');
}).catch(error => {
  console.error('Error during extraction:', error);
});