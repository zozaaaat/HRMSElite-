import React, { createContext, useContext, useEffect, useState } from 'react';
import {useAppStore} from '../stores/useAppStore';
import { t } from "i18next";

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  'theme': 'system',
  'setTheme': () => null
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider ({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const setGlobalTheme = useAppStore((state) => state.setTheme);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
    return storedTheme ?? defaultTheme;
  });

  useEffect(() => {

    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {

      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;

    }

    root.classList.add(theme);

  }, [theme]);

  useEffect(() => {
    setGlobalTheme(theme);
  }, [theme, setGlobalTheme]);

  const value = {
    theme,
    'setTheme': (theme: Theme) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
      setGlobalTheme(theme);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );

}

export const useTheme = () => {

  const context = useContext(ThemeProviderContext);

  if (context === undefined) {

    throw new Error('useTheme must be used within a ThemeProvider');

  }

  return context;

};
