import React from 'react';
import { useTheme } from '../../context/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  return (
    <button
      onClick={handleToggle}
      className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
