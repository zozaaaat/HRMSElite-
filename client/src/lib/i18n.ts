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
    initImmediate: false,

    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng, options) => {
        const resolvedFormat = format === 'format' && typeof options?.format === 'string'
          ? options.format
          : format;
        const locale = lng === 'ar' ? 'ar-SA' : 'en-US';
        if (resolvedFormat === 'number') {
          return new Intl.NumberFormat(locale).format(value as number);
        }
        if (resolvedFormat === 'date') {
          const date = value instanceof Date ? value : new Date(value);
          return new Intl.DateTimeFormat(locale).format(date);
        }
        return value as string;
      }
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
