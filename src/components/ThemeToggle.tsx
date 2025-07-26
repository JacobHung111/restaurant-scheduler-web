// src/components/ThemeToggle.tsx
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useSettingsStore } from '../stores/useSettingsStore';

function ThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon className="h-5 w-5" />;
      case 'dark':
        return <MoonIcon className="h-5 w-5" />;
      case 'system':
        return <ComputerDesktopIcon className="h-5 w-5" />;
      default:
        return <SunIcon className="h-5 w-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
      title={`Theme: ${getThemeLabel()} (click to cycle)`}
    >
      <div className="flex items-center justify-center w-5 h-5">
        {getIcon()}
      </div>
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
}

export default ThemeToggle;