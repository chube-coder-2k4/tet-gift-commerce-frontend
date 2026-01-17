import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center justify-center size-9 text-white/90 dark:text-gray-300 hover:text-gold dark:hover:text-white transition-colors"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[22px]">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};
