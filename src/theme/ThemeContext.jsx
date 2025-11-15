// src/theme/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Используем именованный импорт вместо default
import { colors } from './color';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  /** Применяет тему к body и сохраняет в localStorage */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme === 'dark';
    setIsDark(shouldBeDark);
    document.body.classList.toggle('dark-mode', shouldBeDark);
  }, []);

  /** Синхронизирует класс dark-mode с body при изменении темы */
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDark);
  }, [isDark]);

  /** Переключает тему */
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = isDark ? colors.dark : colors.light;

  const value = {
    theme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Экспортируем оба контекста
export { useAuth } from '../context/AuthContext';