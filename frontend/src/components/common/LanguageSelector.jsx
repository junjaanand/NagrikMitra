import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', region: 'Hindi' },
  { code: 'mr', label: 'मराठी', region: 'Marathi' },
  { code: 'ta', label: 'தமிழ்', region: 'Tamil' },
  { code: 'en', label: 'English', region: 'English' }
];

export default function LanguageSelector({ className = '' }) {
  const { i18n } = useTranslation();

  const currentLang = (i18n.language || 'en').split('-')[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem('nm_lang', langCode);
    } catch (e) {
      // Ignore localStorage errors in private windows
    }
    // Dispatch custom event for voice recognition & speech synthesis synchronization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nm-language-changed', { detail: langCode }));
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs">
        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <select
          value={currentLang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-transparent border-none text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
          aria-label="Select Language"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="text-slate-900 font-semibold bg-white">
              {l.label} ({l.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
