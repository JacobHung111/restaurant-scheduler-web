// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import zhTW from './locales/zh-TW.json';
import zhCN from './locales/zh-CN.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  'zh-TW': { translation: zhTW },
  'zh-CN': { translation: zhCN },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language (will be overridden by language store)
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Options for development
    debug: import.meta.env.DEV,
    
    // Key separator and namespace separator
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;