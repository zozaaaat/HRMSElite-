#!/usr/bin/env node

/**
 * سكريبت إصلاح أخطاء TypeScript الشائعة
 * يقوم بإصلاح الأخطاء الأكثر شيوعاً في ملفات الراوتر
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// الأخطاء الشائعة وإصلاحاتها
const commonFixes = [
  // إصلاح req.user as any
  {
    pattern: /\(req\.user as any\)/g,
    replacement: 'req.user'
  },
  {
    pattern: /req\.user as any/g,
    replacement: 'req.user'
  },
  
  // إصلاح res.json({error: ...})
  {
    pattern: /res\.json\(\{'error': ([^}]+)\}\)/g,
    replacement: 'res.status(400).json({error: $1})'
  },
  
  // إصلاح console.log
  {
    pattern: /console\.log\(/g,
    replacement: '// console.log('
  },
  
  // إصلاح any في Drizzle
  {
    pattern: /\.values\(([^)]+) as any\)/g,
    replacement: '.values($1)'
  },
  
  // إصلاح sql count
  {
    pattern: /sql<number>\`count\(\*\)\`/g,
    replacement: 'count()'
  }
];

// الملفات التي تحتاج إصلاح
const filesToFix = [
  'server/routes/auth-routes.ts',
  'server/routes/employee-routes.ts',
  'server/routes/license-routes.ts',
  'server/routes/payroll-routes.ts',
  'server/routes/quality-routes.ts'
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.info(`⚠️  الملف غير موجود: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;
  
  commonFixes.forEach((fix, index) => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
      console.info(`✅ إصلاح ${index + 1} في ${filePath}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.info(`💾 تم حفظ التغييرات في ${filePath}`);
  } else {
    console.info(`ℹ️  لا توجد تغييرات مطلوبة في ${filePath}`);
  }
}

function main() {
  console.info('🔧 بدء إصلاح أخطاء TypeScript الشائعة...\n');
  
  filesToFix.forEach(fixFile);
  
  console.info('\n✅ تم الانتهاء من الإصلاحات!');
  console.info('💡 تشغيل: npm run type-check للتحقق من النتائج');
}

main();
