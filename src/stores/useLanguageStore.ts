// src/stores/useLanguageStore.ts
import { create } from 'zustand';
import { logger } from '../utils/logger';
import i18n from '../i18n/config';

export type Language = 'en' | 'fr' | 'zh-TW' | 'zh-CN';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { code: 'zh-CN', name: 'Simplified Chinese', nativeName: '简体中文' },
];

interface LanguageState {
  // Language settings
  currentLanguage: Language;
  
  // Actions
  setLanguage: (language: Language) => void;
  getLanguageInfo: (language: Language) => LanguageInfo | undefined;
}

// Helper function to load language from localStorage
const loadLanguage = (): Language => {
  try {
    const stored = localStorage.getItem('restaurant-scheduler-language');
    if (!stored) return 'en';
    
    const language = stored as Language;
    
    // Validate that it's a supported language
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
      logger.log('Language loaded from localStorage:', language);
      return language;
    } else {
      logger.log('Invalid language in localStorage, using default:', language);
      return 'en';
    }
  } catch (error) {
    logger.error('Failed to load language from localStorage:', error);
    return 'en';
  }
};

// Helper function to save language to localStorage
const saveLanguage = (language: Language) => {
  try {
    localStorage.setItem('restaurant-scheduler-language', language);
    logger.log('Language saved to localStorage:', language);
  } catch (error) {
    logger.error('Failed to save language to localStorage:', error);
  }
};

export const useLanguageStore = create<LanguageState>()((set) => {
  // Load initial language from localStorage
  const initialLanguage = loadLanguage();
  
  // Initialize i18next with the saved language
  if (i18n.isInitialized) {
    i18n.changeLanguage(initialLanguage);
  }
  
  return {
    // Initial state
    currentLanguage: initialLanguage,
    
    // Actions
    setLanguage: (language: Language) => {
      // Validate language
      if (!SUPPORTED_LANGUAGES.some(lang => lang.code === language)) {
        logger.error('Attempted to set unsupported language:', language);
        return;
      }
      
      set({ currentLanguage: language });
      
      // Change i18next language
      if (i18n.isInitialized) {
        i18n.changeLanguage(language);
      }
      
      // Save to localStorage
      saveLanguage(language);
      
      logger.log('Language changed to:', language);
    },
    
    getLanguageInfo: (language: Language) => {
      return SUPPORTED_LANGUAGES.find(lang => lang.code === language);
    },
  };
});