#!/usr/bin/env node

/**
 * 🚀 Performance Analyzer for HRMS Elite
 * تحليل الأداء وتحسين البناء
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

class PerformanceAnalyzer {
  constructor() {
    this.distPath = path.resolve(process.cwd(), 'dist');
    this.analysisResults = {
      totalSize: 0,
      chunkCount: 0,
      largestChunks: [],
      optimizationScore: 0,
      recommendations: []
    };
  }

  log(message, color = 'reset') {
    console.info(`${colors[color]}${message}${colors.reset}`);
  }

  async analyzeBuild() {
    this.log('\n🚀 تحليل أداء البناء - HRMS Elite', 'cyan');
    this.log('='.repeat(50), 'blue');

    if (!fs.existsSync(this.distPath)) {
      this.log('❌ مجلد dist غير موجود. قم بتشغيل npm run build أولاً', 'red');
      return;
    }

    await this.analyzeChunkSizes();
    await this.analyzeAssetOptimization();
    await this.calculateOptimizationScore();
    await this.generateRecommendations();
    this.printReport();
  }

  async analyzeChunkSizes() {
    this.log('\n📊 تحليل أحجام الملفات:', 'yellow');
    
    const publicPath = path.join(this.distPath, 'public');
    if (!fs.existsSync(publicPath)) {
      this.log('❌ مجلد public غير موجود في dist', 'red');
      return;
    }

    const jsPath = path.join(publicPath, 'js');
    if (fs.existsSync(jsPath)) {
      const files = fs.readdirSync(jsPath);
      const chunkSizes = [];

      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(jsPath, file);
          const stats = fs.statSync(filePath);
          const sizeInKB = (stats.size / 1024).toFixed(2);
          chunkSizes.push({
            name: file,
            size: parseFloat(sizeInKB),
            sizeInBytes: stats.size
          });
        }
      });

      chunkSizes.sort((a, b) => b.size - a.size);
      
      this.analysisResults.chunkCount = chunkSizes.length;
      this.analysisResults.largestChunks = chunkSizes.slice(0, 5);
      this.analysisResults.totalSize = chunkSizes.reduce((sum, chunk) => sum + chunk.size, 0);

      this.log(`📦 عدد الملفات: ${chunkSizes.length}`, 'green');
      this.log(`📏 الحجم الإجمالي: ${this.analysisResults.totalSize.toFixed(2)} KB`, 'green');
      
      this.log('\n🔝 أكبر 5 ملفات:', 'yellow');
      this.analysisResults.largestChunks.forEach((chunk, index) => {
        const color = chunk.size > 500 ? 'red' : chunk.size > 200 ? 'yellow' : 'green';
        this.log(`  ${index + 1}. ${chunk.name}: ${chunk.size} KB`, color);
      });
    }
  }

  async analyzeAssetOptimization() {
    this.log('\n🎨 تحليل الأصول:', 'yellow');
    
    const publicPath = path.join(this.distPath, 'public');
    const assetTypes = {
      css: { path: 'css', total: 0, count: 0 },
      images: { path: 'images', total: 0, count: 0 },
      fonts: { path: 'fonts', total: 0, count: 0 }
    };

    Object.entries(assetTypes).forEach(([type, config]) => {
      const typePath = path.join(publicPath, config.path);
      if (fs.existsSync(typePath)) {
        const files = fs.readdirSync(typePath);
        config.count = files.length;
        
        files.forEach(file => {
          const filePath = path.join(typePath, file);
          const stats = fs.statSync(filePath);
          config.total += stats.size;
        });
        
        const sizeInKB = (config.total / 1024).toFixed(2);
        this.log(`  📁 ${type}: ${config.count} ملفات - ${sizeInKB} KB`, 'green');
      }
    });
  }

  async calculateOptimizationScore() {
    let score = 100;
    const recommendations = [];

    // تحليل حجم الملفات
    if (this.analysisResults.totalSize > 2000) {
      score -= 20;
      recommendations.push('🔴 الحجم الإجمالي كبير جداً (>2MB)');
    } else if (this.analysisResults.totalSize > 1000) {
      score -= 10;
      recommendations.push('🟡 الحجم الإجمالي كبير (>1MB)');
    }

    // تحليل عدد الملفات
    if (this.analysisResults.chunkCount > 20) {
      score -= 15;
      recommendations.push('🔴 عدد الملفات كبير جداً (>20)');
    } else if (this.analysisResults.chunkCount > 10) {
      score -= 5;
      recommendations.push('🟡 عدد الملفات كبير (>10)');
    }

    // تحليل أكبر الملفات
    const largeChunks = this.analysisResults.largestChunks.filter(chunk => chunk.size > 500);
    if (largeChunks.length > 0) {
      score -= largeChunks.length * 5;
      recommendations.push(`🔴 ${largeChunks.length} ملفات كبيرة (>500KB)`);
    }

    this.analysisResults.optimizationScore = Math.max(0, score);
    this.analysisResults.recommendations = recommendations;
  }

  async generateRecommendations() {
    this.log('\n💡 توصيات التحسين:', 'yellow');
    
    if (this.analysisResults.recommendations.length === 0) {
      this.log('  ✅ الأداء ممتاز! لا توجد توصيات للتحسين', 'green');
    } else {
      this.analysisResults.recommendations.forEach(rec => {
        this.log(`  ${rec}`, 'red');
      });
    }

    // توصيات عامة
    this.log('\n🔧 توصيات عامة:', 'cyan');
    this.log('  • استخدم lazy loading للمكونات الكبيرة', 'blue');
    this.log('  • قم بتطبيق code splitting حسب الصفحات', 'blue');
    this.log('  • استخدم dynamic imports للوظائف المتقدمة', 'blue');
    this.log('  • قم بتحسين الصور واستخدام WebP', 'blue');
    this.log('  • استخدم tree shaking لإزالة الكود غير المستخدم', 'blue');
  }

  printReport() {
    this.log('\n📋 تقرير الأداء النهائي:', 'magenta');
    this.log('='.repeat(50), 'blue');
    
    const score = this.analysisResults.optimizationScore;
    const scoreColor = score >= 90 ? 'green' : score >= 70 ? 'yellow' : 'red';
    const scoreEmoji = score >= 90 ? '🏆' : score >= 70 ? '👍' : '⚠️';
    
    this.log(`${scoreEmoji} درجة التحسين: ${score}/100`, scoreColor);
    this.log(`📦 عدد الملفات: ${this.analysisResults.chunkCount}`, 'green');
    this.log(`📏 الحجم الإجمالي: ${this.analysisResults.totalSize.toFixed(2)} KB`, 'green');
    
    this.log('\n🎯 الإجراءات المقترحة:', 'cyan');
    if (score < 80) {
      this.log('  • راجع إعدادات code splitting', 'yellow');
      this.log('  • قم بتحليل الملفات الكبيرة', 'yellow');
      this.log('  • استخدم bundle analyzer', 'yellow');
    } else {
      this.log('  • استمر في مراقبة الأداء', 'green');
      this.log('  • قم بتشغيل هذا التحليل بانتظام', 'green');
    }
  }

  async runBundleAnalyzer() {
    this.log('\n🔍 تشغيل Bundle Analyzer...', 'cyan');
    
    try {
      // تحقق من وجود vite-bundle-analyzer
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasAnalyzer = packageJson.devDependencies && 
        (packageJson.devDependencies['vite-bundle-analyzer'] || 
         packageJson.devDependencies['rollup-plugin-visualizer']);

      if (!hasAnalyzer) {
        this.log('📦 تثبيت vite-bundle-analyzer...', 'yellow');
        execSync('npm install --save-dev vite-bundle-analyzer', { stdio: 'inherit' });
      }

      this.log('🚀 تشغيل تحليل مفصل...', 'green');
      execSync('npx vite-bundle-analyzer dist/public', { stdio: 'inherit' });
      
    } catch (error) {
      this.log('❌ خطأ في تشغيل Bundle Analyzer', 'red');
      this.log('💡 يمكنك تثبيت vite-bundle-analyzer يدوياً', 'yellow');
    }
  }
}

// تشغيل المحلل
const analyzer = new PerformanceAnalyzer();

const command = process.argv[2];
if (command === '--analyze') {
  analyzer.analyzeBuild();
} else if (command === '--bundle-analyzer') {
  analyzer.runBundleAnalyzer();
} else {
  analyzer.log('🚀 Performance Analyzer for HRMS Elite', 'cyan');
  analyzer.log('Usage:', 'yellow');
  analyzer.log('  node scripts/performance-analyzer.js --analyze', 'blue');
  analyzer.log('  node scripts/performance-analyzer.js --bundle-analyzer', 'blue');
} 