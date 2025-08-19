import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    
    // Update document direction for RTL support
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    // Store language preference in localStorage
    localStorage.setItem('i18nextLng', newLang);
  };

  const currentLanguage = i18n.language === 'ar' ? 'العربية' : 'English';
  const nextLanguage = i18n.language === 'ar' ? 'English' : 'العربية';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title={`${t('settings.language')}: ${currentLanguage}`}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{nextLanguage}</span>
      <span className="sm:hidden">{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
    </Button>
  );
};
