export type Locale = 'en' | 'ar';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    RATE_LIMIT_EXCEEDED: 'Too many requests',
    RATE_LIMIT_TRY_LATER: 'Please try again later',
    VALIDATION_ERROR: 'Invalid data',
    INTERNAL_ERROR: 'An internal server error occurred',
    NOT_FOUND: 'Route not found'
  },
  ar: {
    RATE_LIMIT_EXCEEDED: 'تم تجاوز حد الطلبات',
    RATE_LIMIT_TRY_LATER: 'يرجى المحاولة مرة أخرى بعد فترة',
    VALIDATION_ERROR: 'بيانات غير صحيحة',
    INTERNAL_ERROR: 'حدث خطأ في الخادم',
    NOT_FOUND: 'المسار غير موجود'
  }
};

export function getLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return 'en';
  return acceptLanguage.toLowerCase().includes('ar') ? 'ar' : 'en';
}

export function t(locale: Locale, key: string): string {
  const lang = translations[locale] ? locale : 'en';
  return translations[lang][key] || key;
}
