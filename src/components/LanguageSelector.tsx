// src/components/LanguageSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useLanguageStore, SUPPORTED_LANGUAGES, type Language } from '../stores/useLanguageStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  
  const { currentLanguage, setLanguage, getLanguageInfo } = useLanguageStore(
    useShallow((state) => ({
      currentLanguage: state.currentLanguage,
      setLanguage: state.setLanguage,
      getLanguageInfo: state.getLanguageInfo,
    }))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  const currentLanguageInfo = getLanguageInfo(currentLanguage);
  const displayName = currentLanguageInfo?.nativeName || 'English';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-[36px] h-[36px] sm:w-auto sm:h-auto sm:space-x-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
        title={`${t('language.selectLanguage')}: ${displayName}`}
      >
        <div className="flex items-center justify-center w-5 h-5">
          <LanguageIcon className="h-5 w-5" />
        </div>
        <span className="hidden sm:inline sm:ml-2">{displayName}</span>
        <ChevronDownIcon 
          className={`hidden sm:inline h-4 w-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 focus:outline-none z-20">
          <div className="p-1">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`group flex w-full items-center px-3 py-3 text-sm rounded-lg transition-all duration-200 ${
                  currentLanguage === language.code
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 mr-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentLanguage === language.code
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-400'
                  }`}>
                    {language.code.split('-')[0].toUpperCase()}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {language.name}
                  </div>
                </div>
                {currentLanguage === language.code && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;