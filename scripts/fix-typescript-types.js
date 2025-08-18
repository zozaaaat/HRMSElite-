#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common any replacements
const anyReplacements = {
  // API responses
  'ApiResponse<any>': 'ApiResponse<unknown>',
  'ApiResponse< any >': 'ApiResponse<unknown>',
  'ApiResponse< any>': 'ApiResponse<unknown>',
  'ApiResponse<any >': 'ApiResponse<unknown>',
  
  // Data types
  'data: any': 'data: unknown',
  'error: any': 'error: unknown',
  'result: any': 'result: unknown',
  'value: any': 'value: unknown',
  'item: any': 'item: unknown',
  'obj: any': 'obj: unknown',
  'param: any': 'param: unknown',
  'arg: any': 'arg: unknown',
  'input: any': 'input: unknown',
  'output: any': 'output: unknown',
  
  // Function parameters
  '(data: any)': '(data: unknown)',
  '(error: any)': '(error: unknown)',
  '(result: any)': '(result: unknown)',
  '(value: any)': '(value: unknown)',
  '(item: any)': '(item: unknown)',
  '(obj: any)': '(obj: unknown)',
  '(param: any)': '(param: unknown)',
  '(arg: any)': '(arg: unknown)',
  '(input: any)': '(input: unknown)',
  '(output: any)': '(output: unknown)',
  
  // Array types
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'items: any[]': 'items: unknown[]',
  'data: any[]': 'data: unknown[]',
  'list: any[]': 'list: unknown[]',
  
  // Object types
  'Record<string, any>': 'Record<string, unknown>',
  'object: any': 'object: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
  'settings: any': 'settings: Record<string, unknown>',
  
  // Event handlers
  'event: any': 'event: Event',
  'e: any': 'e: Event',
  'evt: any': 'evt: Event',
  
  // Form data
  'formData: any': 'formData: FormData',
  'form: any': 'form: HTMLFormElement',
  
  // API specific
  'response: any': 'response: ApiResponse<unknown>',
  'apiResponse: any': 'apiResponse: ApiResponse<unknown>',
  'apiData: any': 'apiData: unknown',
  
  // Generic any
  ': any': ': unknown',
  '= any': '= unknown',
  'as any': 'as unknown',
  'any;': 'unknown;',
  'any,': 'unknown,',
  'any)': 'unknown)',
  'any}': 'unknown}',
  'any[': 'unknown[',
  'any<': 'unknown<',
  'any>': 'unknown>',
};

// Specific type replacements for better type safety
const specificReplacements = {
  // User related
  'user: any': 'user: UserData',
  'userData: any': 'userData: UserData',
  'currentUser: any': 'currentUser: UserData',
  
  // Employee related
  'employee: any': 'employee: EmployeeData',
  'employeeData: any': 'employeeData: EmployeeData',
  'employees: any[]': 'employees: EmployeeData[]',
  'employeeList: any[]': 'employeeList: EmployeeData[]',
  
  // Company related
  'company: any': 'company: CompanyData',
  'companyData: any': 'companyData: CompanyData',
  'companies: any[]': 'companies: CompanyData[]',
  'companyList: any[]': 'companyList: CompanyData[]',
  
  // Document related
  'document: any': 'document: DocumentData',
  'documentData: any': 'documentData: DocumentData',
  'documents: any[]': 'documents: DocumentData[]',
  'documentList: any[]': 'documentList: DocumentData[]',
  
  // License related
  'license: any': 'license: LicenseData',
  'licenseData: any': 'licenseData: LicenseData',
  'licenses: any[]': 'licenses: LicenseData[]',
  'licenseList: any[]': 'licenseList: LicenseData[]',
  
  // Error related
  'error: any': 'error: Error | ErrorData',
  'err: any': 'err: Error | ErrorData',
  'errorData: any': 'errorData: ErrorData',
  
  // Log related
  'logData: any': 'logData: LogData',
  'logInfo: any': 'logInfo: LogData',
  'logMessage: any': 'logMessage: string',
  
  // Request/Response related
  'request: any': 'request: ApiRequest<unknown>',
  'response: any': 'response: ApiResponse<unknown>',
  'apiRequest: any': 'apiRequest: ApiRequest<unknown>',
  'apiResponse: any': 'apiResponse: ApiResponse<unknown>',
};

// Directories to process
const directories = [
  'client/src',
  'server',
  'hrms-mobile'
];

// File extensions to process
const extensions = ['ts', 'tsx'];

// Skip these files/directories
const skipPatterns = [
  'node_modules',
  '.vite',
  'dist',
  'build',
  'coverage',
  'test-reports',
  '*.test.*',
  '*.spec.*',
  '*.config.*',
  '*.setup.*',
  '*.mock.*',
  '*.stub.*',
  '*.fixture.*',
  '*.example.*',
  '*.demo.*',
  'backup-console-logs',
  '.backup',
  'shared/types' // Skip type definition files
];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => {
    if (pattern.includes('*')) {
      return filePath.includes(pattern.replace('*', ''));
    }
    return filePath.includes(pattern);
  });
}

function findAnyUsage(content) {
  const anyPattern = /\bany\b/g;
  const matches = [];
  let match;
  
  while ((match = anyPattern.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    const column = match.index - content.lastIndexOf('\n', match.index - 1);
    
    matches.push({
      index: match.index,
      line: lineNumber,
      column: column,
      context: line.trim(),
      fullMatch: match[0]
    });
  }
  
  return matches;
}

function replaceAnyUsage(content) {
  let modifiedContent = content;
  let replacementCount = 0;
  
  // Apply specific replacements first
  for (const [pattern, replacement] of Object.entries(specificReplacements)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = modifiedContent.match(regex);
    if (matches) {
      replacementCount += matches.length;
      modifiedContent = modifiedContent.replace(regex, replacement);
    }
  }
  
  // Apply general any replacements
  for (const [pattern, replacement] of Object.entries(anyReplacements)) {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = modifiedContent.match(regex);
    if (matches) {
      replacementCount += matches.length;
      modifiedContent = modifiedContent.replace(regex, replacement);
    }
  }
  
  return { content: modifiedContent, replacementCount };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const anyMatches = findAnyUsage(content);
    
    if (anyMatches.length === 0) {
      return { filePath, anyCount: 0, replacementCount: 0, anyMatches: [] };
    }
    
    const { content: newContent, replacementCount } = replaceAnyUsage(content);
    
    if (replacementCount > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
    
    return { 
      filePath, 
      anyCount: anyMatches.length, 
      replacementCount, 
      anyMatches: anyMatches.slice(0, 10) // Limit to first 10 matches for display
    };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { filePath, anyCount: 0, replacementCount: 0, anyMatches: [], error: error.message };
  }
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return [];
  }

  const results = [];
  const files = await glob(`**/*.{${extensions.join(',')}}`, { 
    cwd: dirPath,
    absolute: true,
    ignore: skipPatterns
  });

  for (const file of files) {
    if (!shouldSkipFile(file)) {
      const result = processFile(file);
      if (result.anyCount > 0) {
        results.push(result);
      }
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Starting TypeScript type safety improvement...\n');

  let allResults = [];
  let totalAnyCount = 0;
  let totalReplacementCount = 0;

  for (const dir of directories) {
    console.log(`📁 Processing directory: ${dir}`);
    const results = await processDirectory(dir);
    allResults.push(...results);
    
    const dirAnyCount = results.reduce((sum, r) => sum + r.anyCount, 0);
    const dirReplacementCount = results.reduce((sum, r) => sum + r.replacementCount, 0);
    
    totalAnyCount += dirAnyCount;
    totalReplacementCount += dirReplacementCount;
    
    if (results.length > 0) {
      console.log(`⚠️  Found ${dirAnyCount} 'any' usages in ${results.length} files`);
      console.log(`✅ Replaced ${dirReplacementCount} 'any' usages with specific types`);
    } else {
      console.log(`✅ No 'any' usages found in ${dir}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log('===========');
  console.log(`📄 Files processed: ${allResults.length}`);
  console.log(`🔍 Total 'any' usages found: ${totalAnyCount}`);
  console.log(`✅ Total replacements made: ${totalReplacementCount}`);
  console.log(`⚠️  Remaining 'any' usages: ${totalAnyCount - totalReplacementCount}`);

  if (allResults.length > 0) {
    console.log('\n📋 Files with remaining any usage:');
    console.log('==================================');
    
    allResults.forEach(result => {
      const relativePath = path.relative(process.cwd(), result.filePath);
      console.log(`\n📄 ${relativePath}:`);
      console.log(`   - Any usages: ${result.anyCount}`);
      console.log(`   - Replacements: ${result.replacementCount}`);
      console.log(`   - Remaining: ${result.anyCount - result.replacementCount}`);
      
      if (result.anyMatches.length > 0) {
        console.log('   - Examples:');
        result.anyMatches.slice(0, 3).forEach(match => {
          console.log(`     Line ${match.line}: ${match.context}`);
        });
      }
    });
  }

  console.log('\n💡 Recommendations:');
  console.log('==================');
  console.log('1. Review remaining any usages and replace with specific types');
  console.log('2. Use the new API types from shared/types/api.ts');
  console.log('3. Consider using unknown instead of any for truly unknown data');
  console.log('4. Add proper type guards for runtime type checking');
  console.log('5. Use generics for reusable components and functions');
  
  if (totalAnyCount - totalReplacementCount > 0) {
    console.log('\n⚠️  Some any usages remain. Please review them manually.');
    process.exit(1);
  } else {
    console.log('\n🎉 All any usages have been replaced! Type safety improved.');
    process.exit(0);
  }
}

main().catch(console.error);
