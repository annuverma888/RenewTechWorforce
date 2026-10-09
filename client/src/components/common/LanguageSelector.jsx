import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';

/**
 * LanguageSelector
 * 
 * Accessible, responsive global language selector supporting English & Hindi.
 * Persists selection directly to localStorage via i18next without full page reloads.
 */
const LanguageSelector = ({ variant = 'default', className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Mobile drawer variant (full-width stacked buttons)
  if (variant === 'mobile') {
    return (
      <div className={`p-3 bg-slate-50 rounded-2xl border border-slate-200/80 ${className}`}>
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <Globe size={14} className="text-emerald-600" />
          <span>{t('common.language', 'Language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check size={13} className="stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dark variant for dark background headers (e.g. Skill Passport Registry Header)
  const isDark = variant === 'dark';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer focus-ring ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-xs'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Language selector. Current language is ${currentLanguage.nativeName}`}
        title={`Change language: current is ${currentLanguage.nativeName}`}
      >
        <span className="text-sm select-none" aria-hidden="true">🌐</span>
        <span className="font-semibold">{currentLanguage.nativeName}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            {t('common.language', 'Language')}
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                role="menuitem"
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full text-left px-3.5 py-2.5 min-h-[42px] text-xs sm:text-sm flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-900 transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold text-emerald-700 bg-emerald-50/60'
                    : 'font-medium text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {lang.code === 'en' && <span className="text-[11px] text-slate-400">({lang.label})</span>}
                </div>
                {isSelected && (
                  <Check size={14} className="text-emerald-600 font-bold stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
