import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '@theme/theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ProviderProps = { children: React.ReactNode };

export const ThemeProvider: React.FC<ProviderProps> = ({ children }) => {
  const prefersDark = (() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  })();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('isDarkMode');
      return stored !== null ? stored === 'true' : prefersDark;
    } catch {
      return prefersDark;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', isDarkMode ? 'true' : 'false');
    } catch {
      // ignore persistence errors
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((v) => !v);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
