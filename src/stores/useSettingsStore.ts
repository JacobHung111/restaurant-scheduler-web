// src/stores/useSettingsStore.ts
import { create } from 'zustand';
import { logger } from '../utils/logger';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  // Theme settings
  theme: Theme;
  isDarkMode: boolean;
  
  // Future settings can be added here
  // autoSave: boolean;
  // language: string;
  // notifications: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Internal actions
  _setIsDarkMode: (isDark: boolean) => void;
}

// Helper function to detect system theme
const getSystemTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Helper function to apply theme to document
const applyTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Helper function to load settings from localStorage
const loadSettings = (): Partial<SettingsState> => {
  try {
    const stored = localStorage.getItem('restaurant-scheduler-settings');
    if (!stored) return {};
    
    const settings = JSON.parse(stored);
    logger.log('Settings loaded from localStorage:', settings);
    return settings;
  } catch (error) {
    logger.error('Failed to load settings from localStorage:', error);
    return {};
  }
};

// Helper function to save settings to localStorage
const saveSettings = (settings: Partial<SettingsState>) => {
  try {
    const toSave = {
      theme: settings.theme,
      // Add other settings to save here
    };
    
    localStorage.setItem('restaurant-scheduler-settings', JSON.stringify(toSave));
    logger.log('Settings saved to localStorage:', toSave);
  } catch (error) {
    logger.error('Failed to save settings to localStorage:', error);
  }
};

export const useSettingsStore = create<SettingsState>()((set, get) => {
  // Load initial settings from localStorage
  const savedSettings = loadSettings();
  const initialTheme: Theme = savedSettings.theme || 'system';
  
  // Calculate initial dark mode state
  const calculateIsDarkMode = (theme: Theme): boolean => {
    switch (theme) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
        return getSystemTheme();
      default:
        return false;
    }
  };
  
  const initialIsDarkMode = calculateIsDarkMode(initialTheme);
  
  // Apply initial theme
  applyTheme(initialIsDarkMode);
  
  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const currentState = get();
      if (currentState.theme === 'system') {
        const newIsDarkMode = e.matches;
        set({ isDarkMode: newIsDarkMode });
        applyTheme(newIsDarkMode);
        logger.log('System theme changed to:', newIsDarkMode ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  }
  
  return {
    // Initial state
    theme: initialTheme,
    isDarkMode: initialIsDarkMode,
    
    // Actions
    setTheme: (theme: Theme) => {
      const newIsDarkMode = calculateIsDarkMode(theme);
      
      set({ 
        theme, 
        isDarkMode: newIsDarkMode 
      });
      
      applyTheme(newIsDarkMode);
      
      // Save to localStorage
      saveSettings({ theme });
      
      logger.log('Theme changed to:', theme, 'isDarkMode:', newIsDarkMode);
    },
    
    toggleTheme: () => {
      const currentState = get();
      let newTheme: Theme;
      
      // Cycle through: light → dark → system → light
      switch (currentState.theme) {
        case 'light':
          newTheme = 'dark';
          break;
        case 'dark':
          newTheme = 'system';
          break;
        case 'system':
          newTheme = 'light';
          break;
        default:
          newTheme = 'light';
      }
      
      currentState.setTheme(newTheme);
    },
    
    // Internal action (not meant for direct use)
    _setIsDarkMode: (isDark: boolean) => {
      set({ isDarkMode: isDark });
      applyTheme(isDark);
    },
  };
});