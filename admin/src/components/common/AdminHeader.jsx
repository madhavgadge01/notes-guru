import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminHeader = ({ title = 'Admin Overview', subtitle = 'GenZNotes System Management' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#1C1C1C]/95 backdrop-blur border-b border-gray-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-black text-gray-950 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
