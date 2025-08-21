import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to update the document direction and language based on i18n settings.
 * Sets `<html dir>` and `<html lang>` whenever the active language changes.
 */
export function useDirection(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.dir();
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language, i18n]);
}
