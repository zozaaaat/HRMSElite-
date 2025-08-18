#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

class BundleAnalyzer {
  constructor() {
    this.distPath = path.resolve(process.cwd(), 'dist');
    this.clientDistPath = path.resolve(process.cwd(), 'client/dist');
    this.analysisResults = {
      totalSize: 0,
      chunkCount: 0,
      largestChunks: [],
      optimizationScore: 0,
      recommendations: [],
      warnings: []
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async analyzeBundle() {
    this.log('\n🚀 تحليل Bundle Size - HRMS Elite', 'cyan');
    this.log('='.repeat(60), 'blue');

    // Check if build exists
    if (!fs.existsSync(this.clientDistPath)) {
      this.log('❌ مجلد client/dist غير موجود. قم بتشغيل npm run build أولاً', 'red');
      return;
    }

    await this.analyzeClientBundle();
    await this.analyzeServerBundle();
    await this.calculateOptimizationScore();
    await this.generateRecommendations();
    this.printReport();
  }

  async analyzeClientBundle() {
    this.log('\n📊 تحليل Client Bundle:', 'yellow');
    
    const jsPath = path.join(this.clientDistPath, 'assets');
    if (!fs.existsSync(jsPath)) {
      this.log('❌ مجلد assets غير موجود في client/dist', 'red');
      return;
    }

    const files = fs.readdirSync(jsPath);
    const chunkSizes = [];

    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.css')) {
        const filePath = path.join(jsPath, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        chunkSizes.push({
          name: file,
          size: parseFloat(sizeInKB),
          sizeInBytes: stats.size,
          type: file.endsWith('.js') ? 'JavaScript' : 'CSS'
        });
      }
    });

    chunkSizes.sort((a, b) => b.size - a.size);
    
    this.analysisResults.chunkCount = chunkSizes.length;
    this.analysisResults.largestChunks = chunkSizes.slice(0, 10);
    this.analysisResults.totalSize = chunkSizes.reduce((sum, chunk) => sum + chunk.size, 0);

    this.log(`📦 عدد الملفات: ${chunkSizes.length}`, 'green');
    this.log(`📏 الحجم الإجمالي: ${this.analysisResults.totalSize.toFixed(2)} KB`, 'green');
    
    this.log('\n🔝 أكبر 10 ملفات:', 'yellow');
    this.analysisResults.largestChunks.forEach((chunk, index) => {
      const color = chunk.size > 500 ? 'red' : chunk.size > 200 ? 'yellow' : 'green';
      this.log(`  ${index + 1}. ${chunk.name} (${chunk.type}): ${chunk.size} KB`, color);
    });

    // Check for large files
    const largeFiles = chunkSizes.filter(chunk => chunk.size > 500);
    if (largeFiles.length > 0) {
      this.analysisResults.warnings.push(`Found ${largeFiles.length} files larger than 500KB`);
    }
  }

  async analyzeServerBundle() {
    this.log('\n🖥️ تحليل Server Bundle:', 'yellow');
    
    if (!fs.existsSync(this.distPath)) {
      this.log('❌ مجلد dist غير موجود', 'red');
      return;
    }

    const files = fs.readdirSync(this.distPath);
    const serverFiles = files.filter(file => file.endsWith('.js'));

    if (serverFiles.length > 0) {
      this.log(`📦 عدد ملفات الخادم: ${serverFiles.length}`, 'green');
      
      serverFiles.forEach(file => {
        const filePath = path.join(this.distPath, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = (stats.size / 1024).toFixed(2);
        this.log(`  📄 ${file}: ${sizeInKB} KB`, 'blue');
      });
    }
  }

  async calculateOptimizationScore() {
    let score = 100;
    const totalSizeMB = this.analysisResults.totalSize / 1024;

    // Deduct points for large bundle size
    if (totalSizeMB > 2) {
      score -= 30;
    } else if (totalSizeMB > 1) {
      score -= 15;
    }

    // Deduct points for too many chunks
    if (this.analysisResults.chunkCount > 20) {
      score -= 20;
    } else if (this.analysisResults.chunkCount > 10) {
      score -= 10;
    }

    // Deduct points for large files
    const largeFiles = this.analysisResults.largestChunks.filter(chunk => chunk.size > 500);
    score -= largeFiles.length * 5;

    this.analysisResults.optimizationScore = Math.max(0, score);
  }

  async generateRecommendations() {
    const recommendations = [];
    const totalSizeMB = this.analysisResults.totalSize / 1024;

    if (totalSizeMB > 2) {
      recommendations.push('🔧 Bundle size is large (>2MB). Consider code splitting and lazy loading');
    }

    if (this.analysisResults.chunkCount > 20) {
      recommendations.push('🔧 Too many chunks. Consider merging small chunks');
    }

    const largeFiles = this.analysisResults.largestChunks.filter(chunk => chunk.size > 500);
    if (largeFiles.length > 0) {
      recommendations.push(`🔧 ${largeFiles.length} files are larger than 500KB. Consider optimization`);
    }

    // Add general recommendations
    recommendations.push('💡 Enable gzip compression on server');
    recommendations.push('💡 Use CDN for static assets');
    recommendations.push('💡 Implement proper caching strategies');
    recommendations.push('💡 Consider using dynamic imports for large components');

    this.analysisResults.recommendations = recommendations;
  }

  printReport() {
    this.log('\n📋 تقرير التحليل:', 'cyan');
    this.log('='.repeat(60), 'blue');

    this.log(`\n🎯 درجة التحسين: ${this.analysisResults.optimizationScore}/100`, 
      this.analysisResults.optimizationScore > 80 ? 'green' : 
      this.analysisResults.optimizationScore > 60 ? 'yellow' : 'red');

    if (this.analysisResults.warnings.length > 0) {
      this.log('\n⚠️ التحذيرات:', 'yellow');
      this.analysisResults.warnings.forEach(warning => {
        this.log(`  • ${warning}`, 'yellow');
      });
    }

    this.log('\n💡 التوصيات:', 'green');
    this.analysisResults.recommendations.forEach(rec => {
      this.log(`  • ${rec}`, 'green');
    });

    this.log('\n🎉 تحليل Bundle Size مكتمل!', 'cyan');
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyzeBundle().catch(console.error);

