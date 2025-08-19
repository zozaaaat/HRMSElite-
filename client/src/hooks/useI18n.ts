import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  // Initialize RTL support on mount
  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Language switching function
  const switchLanguage = useCallback((language: 'ar' | 'en') => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('i18nextLng', language);
  }, [i18n]);

  // Toggle between Arabic and English
  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    switchLanguage(newLang);
  }, [i18n.language, switchLanguage]);

  // Format date based on current language
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(dateObj);
  }, [i18n.language]);

  // Format number based on current language
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options
    }).format(number);
  }, [i18n.language]);

  // Format currency based on current language
  const formatCurrency = useCallback((amount: number, currency = 'SAR') => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }, [i18n.language]);

  // Check if current language is RTL
  const isRTL = i18n.language === 'ar';

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    switchLanguage,
    toggleLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL
  };
};
