'use client';

import { useTheme } from '@/app/context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
          : 'bg-gray-200 hover:bg-gray-300 text-slate-900'
      }`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}
