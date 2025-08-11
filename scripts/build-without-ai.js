#!/usr/bin/env node

/**
 * 🚀 Custom Build Script - HRMS Elite
 * Build without AI components for testing performance optimizations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class CustomBuilder {
  constructor() {
    this.backupDir = path.resolve(process.cwd(), '.backup');
    this.aiComponents = [
      'client/src/components/ai',
      'client/src/pages/ai-chatbot-demo.tsx'
    ];
    this.filesToModify = [
      'client/src/App.tsx'
    ];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async backupAiComponents() {
    this.log('\n📦 إنشاء نسخة احتياطية من مكونات AI...', 'yellow');
    
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    for (const component of this.aiComponents) {
      const sourcePath = path.resolve(process.cwd(), component);
      const backupPath = path.resolve(this.backupDir, component);
      
      if (fs.existsSync(sourcePath)) {
        // إنشاء مجلد النسخة الاحتياطية
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // نسخ الملف أو المجلد
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, backupPath);
        } else {
          fs.copyFileSync(sourcePath, backupPath);
        }
        
        this.log(`  ✅ تم نسخ: ${component}`, 'green');
      }
    }

    // نسخ الملفات التي تحتاج تعديل
    for (const file of this.filesToModify) {
      const sourcePath = path.resolve(process.cwd(), file);
      const backupPath = path.resolve(this.backupDir, file);
      
      if (fs.existsSync(sourcePath)) {
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, backupPath);
        this.log(`  ✅ تم نسخ: ${file}`, 'green');
      }
    }
  }

  copyDirectory(source, destination) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  async removeAiComponents() {
    this.log('\n🗑️ إزالة مكونات AI مؤقتاً...', 'yellow');
    
    for (const component of this.aiComponents) {
      const sourcePath = path.resolve(process.cwd(), component);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          fs.rmSync(sourcePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(sourcePath);
        }
        this.log(`  ✅ تم إزالة: ${component}`, 'green');
      }
    }

    // تعديل الملفات لإزالة استيرادات AI
    await this.modifyFilesForBuild();
  }

  async modifyFilesForBuild() {
    this.log('\n✏️ تعديل الملفات لإزالة استيرادات AI...', 'yellow');
    
    for (const file of this.filesToModify) {
      const filePath = path.resolve(process.cwd(), file);
      
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // إزالة استيراد AI components
        content = content.replace(/import.*AIChatbotDemo.*from.*['"]@\/pages\/ai-chatbot-demo['"];?\n?/g, '');
        content = content.replace(/import.*Chatbot.*from.*['"]@\/components\/ai\/chatbot['"];?\n?/g, '');
        
        // إزالة استخدام AI components في JSX
        content = content.replace(/<AIChatbotDemo[^>]*\/?>/g, '');
        content = content.replace(/<Chatbot[^>]*\/?>/g, '');
        
        // إزالة routes المتعلقة بـ AI
        content = content.replace(/<Route path="\/ai-chatbot">[\s\S]*?<\/Route>/g, '');
        
        fs.writeFileSync(filePath, content);
        this.log(`  ✅ تم تعديل: ${file}`, 'green');
      }
    }
  }

  async restoreAiComponents() {
    this.log('\n🔄 استعادة مكونات AI...', 'yellow');
    
    for (const component of this.aiComponents) {
      const sourcePath = path.resolve(process.cwd(), component);
      const backupPath = path.resolve(this.backupDir, component);
      
      if (fs.existsSync(backupPath)) {
        const sourceDir = path.dirname(sourcePath);
        if (!fs.existsSync(sourceDir)) {
          fs.mkdirSync(sourceDir, { recursive: true });
        }
        
        if (fs.statSync(backupPath).isDirectory()) {
          this.copyDirectory(backupPath, sourcePath);
        } else {
          fs.copyFileSync(backupPath, sourcePath);
        }
        
        this.log(`  ✅ تم استعادة: ${component}`, 'green');
      }
    }

    // استعادة الملفات المعدلة
    for (const file of this.filesToModify) {
      const sourcePath = path.resolve(process.cwd(), file);
      const backupPath = path.resolve(this.backupDir, file);
      
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, sourcePath);
        this.log(`  ✅ تم استعادة: ${file}`, 'green');
      }
    }
  }

  async runBuild() {
    this.log('\n🚀 تشغيل البناء بدون مكونات AI...', 'cyan');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      this.log('\n✅ تم البناء بنجاح!', 'green');
      return true;
    } catch (error) {
      this.log('\n❌ فشل البناء', 'red');
      return false;
    }
  }

  async runPerformanceAnalysis() {
    this.log('\n📊 تشغيل تحليل الأداء...', 'cyan');
    
    try {
      execSync('node scripts/performance-analyzer.js --analyze', { stdio: 'inherit' });
    } catch (error) {
      this.log('⚠️ تحليل الأداء غير متاح', 'yellow');
    }
  }

  async cleanup() {
    this.log('\n🧹 تنظيف الملفات المؤقتة...', 'yellow');
    
    if (fs.existsSync(this.backupDir)) {
      fs.rmSync(this.backupDir, { recursive: true, force: true });
      this.log('  ✅ تم حذف النسخ الاحتياطية', 'green');
    }
  }

  async build() {
    this.log('🚀 Custom Build Script - HRMS Elite', 'cyan');
    this.log('='.repeat(50), 'blue');

    try {
      // 1. نسخ احتياطي
      await this.backupAiComponents();
      
      // 2. إزالة مكونات AI
      await this.removeAiComponents();
      
      // 3. تشغيل البناء
      const buildSuccess = await this.runBuild();
      
      if (buildSuccess) {
        // 4. تحليل الأداء
        await this.runPerformanceAnalysis();
      }
      
      // 5. استعادة المكونات
      await this.restoreAiComponents();
      
      // 6. تنظيف
      await this.cleanup();
      
      this.log('\n🎉 تم الانتهاء من العملية!', 'green');
      
    } catch (error) {
      this.log('\n❌ حدث خطأ أثناء العملية', 'red');
      console.error(error);
      
      // استعادة المكونات في حالة الخطأ
      await this.restoreAiComponents();
      await this.cleanup();
    }
  }
}

// تشغيل البناء
const builder = new CustomBuilder();
builder.build(); 