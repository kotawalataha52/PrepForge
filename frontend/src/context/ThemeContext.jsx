import React, { createContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Always enforce dark mode
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ isLightMode: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};
