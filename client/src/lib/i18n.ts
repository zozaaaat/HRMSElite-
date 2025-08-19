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

export default i18n;
