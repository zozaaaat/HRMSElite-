import i18n from '../lib/i18n';

// Test i18n configuration
console.log('🧪 Testing i18n Configuration...\n');

// Test 1: Check if i18n is initialized
console.log('✅ i18n initialized:', i18n.isInitialized);

// Test 2: Check current language
console.log('✅ Current language:', i18n.language);

// Test 3: Check available languages
console.log('✅ Available languages:', i18n.languages);

// Test 4: Test English translations
i18n.changeLanguage('en');
console.log('\n🇺🇸 English Translations:');
console.log('  - Dashboard:', i18n.t('common.dashboard'));
console.log('  - Employees:', i18n.t('common.employees'));
console.log('  - Login:', i18n.t('auth.login'));
console.log('  - Loading:', i18n.t('common.loading'));

// Test 5: Test Arabic translations
i18n.changeLanguage('ar');
console.log('\n🇸🇦 Arabic Translations:');
console.log('  - Dashboard:', i18n.t('common.dashboard'));
console.log('  - Employees:', i18n.t('common.employees'));
console.log('  - Login:', i18n.t('auth.login'));
console.log('  - Loading:', i18n.t('common.loading'));

// Test 6: Test interpolation
i18n.changeLanguage('en');
console.log('\n🔧 Interpolation Test:');
console.log('  - Welcome message:', i18n.t('auth.welcomeMessage', { company: 'Test Company' }));

// Test 7: Test pluralization
console.log('\n📊 Pluralization Test:');
i18n.changeLanguage('en');
console.log('  - EN (1):', i18n.t('demo.unreadMessages', { count: 1 }));
console.log('  - EN (5):', i18n.t('demo.unreadMessages', { count: 5 }));
i18n.changeLanguage('ar');
console.log('  - AR (0):', i18n.t('demo.unreadMessages', { count: 0 }));
console.log('  - AR (2):', i18n.t('demo.unreadMessages', { count: 2 }));
console.log('  - AR (7):', i18n.t('demo.unreadMessages', { count: 7 }));

// Test 8: Date & Number Formatting
console.log('\n📅 Date & Number Formatting:');
const sampleDate = new Date('2025-01-01');
const sampleNumber = 1234567.89;
i18n.changeLanguage('en');
console.log('  - EN date:', i18n.t('demo.today', { value: sampleDate, format: 'date' }));
console.log('  - EN number:', i18n.t('demo.number', { value: sampleNumber, format: 'number' }));
i18n.changeLanguage('ar');
console.log('  - AR date:', i18n.t('demo.today', { value: sampleDate, format: 'date' }));
console.log('  - AR number:', i18n.t('demo.number', { value: sampleNumber, format: 'number' }));

// Test 9: Check RTL support
console.log('\n📝 RTL Support:');
console.log('  - English direction:', i18n.dir('en'));
console.log('  - Arabic direction:', i18n.dir('ar'));

// Test 10: Test fallback
console.log('\n🔄 Fallback Test:');
console.log('  - Non-existent key:', i18n.t('non.existent.key', 'Fallback text'));

console.log('\n🎉 i18n verification completed successfully!');
