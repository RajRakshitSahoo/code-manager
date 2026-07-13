import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['vscode-dark', 'hacker-green', 'dracula', 'light'];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('cmp_theme') || 'vscode-dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cmp_theme', theme); 
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
