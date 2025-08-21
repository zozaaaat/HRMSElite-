import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import locale files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
    
    // RTL support
    dir: (lng) => {
      return lng === 'ar' ? 'rtl' : 'ltr';
      }
    });

// Custom pluralization rules for English and Arabic
i18n.services.pluralResolver.addRule('en', {
  numbers: [1, 2],
  plurals: n => Number(n !== 1)
});

i18n.services.pluralResolver.addRule('ar', {
  numbers: [0, 1, 2, 3, 11, 100],
  plurals: n => {
    if (n === 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    if (n % 100 >= 3 && n % 100 <= 10) return 3;
    if (n % 100 >= 11 && n % 100 <= 99) return 4;
    return 5;
  }
});

export default i18n;
