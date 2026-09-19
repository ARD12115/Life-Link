import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('lifelink-theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = resolvedTheme => {
      root.setAttribute('data-theme', resolvedTheme);
      // Update body background immediately for smooth transition
      const bgColor = resolvedTheme === 'dark' ? '#000000' : '#F2F2F7';
      root.style.backgroundColor = bgColor;
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      applyTheme(systemTheme);

      // Listener for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = e => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }

    localStorage.setItem('lifelink-theme', theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
