import React, {useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import {useAppStore} from '../stores/useAppStore';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const setLanguage = useAppStore((state) => state.setLanguage);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language, setLanguage]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = i18n.dir(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem('i18nextLng', newLang);
    setLanguage(newLang);
  };

    const currentLanguage = t(`languages.${i18n.language === 'ar' ? 'arabic' : 'english'}`);
    const nextLanguageKey = i18n.language === 'ar' ? 'english' : 'arabic';
    const nextLanguage = t(`languages.${nextLanguageKey}`);
    const nextLanguageShort = t(`languages.short.${nextLanguageKey}`);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title={`${t('settings.language')}: ${currentLanguage}`}
      aria-label={`${t('settings.language')}: ${nextLanguage}`}
    >
      <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{nextLanguage}</span>
        <span className="sm:hidden">{nextLanguageShort}</span>
      </Button>
    );
  };
