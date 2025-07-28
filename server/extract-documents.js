import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract and categorize all real documents from the attached files
function extractRealDocuments() {
  const basePath = path.join(__dirname, '../attached_assets/ملفات');
  const files = fs.readdirSync(basePath);
  
  const companies = {
    "1": { name: "شركة الاتحاد الخليجي للأقمشة", licenses: [], documents: [], employees: 52 },
    "2": { name: "شركة النيل الأزرق للمجوهرات", licenses: [], documents: [], employees: 56 },
    "3": { name: "شركة قمة النيل للذهب", licenses: [], documents: [], employees: 31 },
    "4": { name: "شركة محمد أحمد إبراهيم", licenses: [], documents: [], employees: 33 },
    "5": { name: "شركة ميلانو", licenses: [], documents: [], employees: 77 }
  };

  console.log(`Found ${files.length} files to process`);

  files.forEach(filename => {
    const filePath = path.join(basePath, filename);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && (filename.endsWith('.pdf') || filename.endsWith('.docx'))) {
      console.log(`Processing: ${filename}`);
      
      // Categorize documents by company and type
      if (filename.includes('الاتحاد') || filename.includes('اتحاد')) {
        categorizeDocument(companies["1"], filename, filePath);
      } else if (filename.includes('النيل الازرق') || filename.includes('النيل الأزرق')) {
        categorizeDocument(companies["2"], filename, filePath);
      } else if (filename.includes('قمة النيل') || filename.includes('قمه النيل')) {
        categorizeDocument(companies["3"], filename, filePath);
      } else if (filename.includes('محمد احمد') || filename.includes('محمد أحمد')) {
        categorizeDocument(companies["4"], filename, filePath);
      } else if (filename.includes('ميلانو') || filename.includes('مرمر')) {
        categorizeDocument(companies["5"], filename, filePath);
      } else {
        // General documents that might apply to multiple companies
        categorizeGeneralDocument(companies, filename, filePath);
      }
    }
  });

  return companies;
}

function categorizeDocument(company, filename, filePath) {
  const document = {
    id: generateDocumentId(),
    name: filename,
    path: filePath,
    type: getDocumentType(filename),
    category: getDocumentCategory(filename),
    uploadDate: new Date().toISOString().split('T')[0],
    status: getDocumentStatus(filename),
    expiryDate: getExpiryDate(filename),
    description: getDocumentDescription(filename)
  };

  if (document.type === 'license') {
    company.licenses.push(document);
  } else {
    company.documents.push(document);
  }
}

function categorizeGeneralDocument(companies, filename, filePath) {
  // Documents that apply to multiple companies or are general
  const generalDoc = {
    id: generateDocumentId(),
    name: filename,
    path: filePath,
    type: getDocumentType(filename),
    category: getDocumentCategory(filename),
    uploadDate: new Date().toISOString().split('T')[0],
    status: "active",
    description: "مستند عام"
  };

  // Add to relevant companies based on content
  Object.values(companies).forEach(company => {
    if (filename.includes('عقد عمل') || filename.includes('هوية') || filename.includes('جوازات')) {
      company.documents.push({...generalDoc});
    }
  });
}

function getDocumentType(filename) {
  if (filename.includes('ترخيص')) return 'license';
  if (filename.includes('اعتماد')) return 'certification';
  if (filename.includes('عقد')) return 'contract';
  if (filename.includes('استيراد')) return 'import_permit';
  if (filename.includes('بطاقات') || filename.includes('هوية')) return 'identification';
  if (filename.includes('جوازات')) return 'passport_service';
  return 'document';
}

function getDocumentCategory(filename) {
  if (filename.includes('تجاري')) return 'commercial';
  if (filename.includes('صناعي')) return 'industrial';
  if (filename.includes('مجوهرات') || filename.includes('ذهب')) return 'jewelry';
  if (filename.includes('خياط') || filename.includes('أقمشة')) return 'textiles';
  if (filename.includes('استيراد')) return 'import';
  if (filename.includes('تصدير')) return 'export';
  return 'general';
}

function getDocumentStatus(filename) {
  if (filename.includes('2025')) return 'active';
  if (filename.includes('2024')) return 'active';
  if (filename.includes('2023')) return 'expiring_soon';
  return 'active';
}

function getExpiryDate(filename) {
  // Extract year from filename and estimate expiry
  const yearMatch = filename.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2023) {
      return `${year + 1}-12-31`; // Assume licenses expire next year
    }
  }
  return null;
}

function getDocumentDescription(filename) {
  if (filename.includes('ترخيص')) {
    if (filename.includes('تجاري')) return 'ترخيص تجاري - يسمح بممارسة النشاط التجاري';
    if (filename.includes('صناعي')) return 'ترخيص صناعي - يسمح بالأنشطة الصناعية والتصنيع';
    if (filename.includes('مجوهرات')) return 'ترخيص تجارة المجوهرات - متخصص لتجارة الذهب والمجوهرات';
    if (filename.includes('خياط')) return 'ترخيص خياطة - يسمح بأعمال الخياطة والتفصيل';
    return 'ترخيص تشغيل الأعمال التجارية';
  }
  if (filename.includes('اعتماد')) return 'اعتماد توقيع من الجهات المختصة';
  if (filename.includes('عقد')) return 'عقد تأسيس الشركة والشراكة';
  if (filename.includes('استيراد')) return 'تصريح استيراد البضائع من الخارج';
  return 'مستند رسمي للشركة';
}

function generateDocumentId() {
  return 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

// Extract and save real documents data
try {
  const companiesWithDocs = extractRealDocuments();
  
  // Calculate totals
  let totalLicenses = 0;
  let totalDocuments = 0;
  
  Object.values(companiesWithDocs).forEach(company => {
    totalLicenses += company.licenses.length;
    totalDocuments += company.documents.length;
    console.log(`${company.name}:`);
    console.log(`  - Licenses: ${company.licenses.length}`);
    console.log(`  - Documents: ${company.documents.length}`);
    console.log(`  - Employees: ${company.employees}`);
  });
  
  console.log(`\nTotal licenses: ${totalLicenses}`);
  console.log(`Total documents: ${totalDocuments}`);
  console.log(`Total files processed: ${totalLicenses + totalDocuments}`);
  
  // Save to JSON file
  fs.writeFileSync(
    path.join(__dirname, 'real-documents.json'), 
    JSON.stringify(companiesWithDocs, null, 2),
    'utf8'
  );
  
  console.log('\nReal documents data saved to real-documents.json');
  
} catch (error) {
  console.error('Error extracting documents:', error);
}