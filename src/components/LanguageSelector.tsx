import { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const location = useLocation();
  const { i18n } = useTranslation();

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close dropdown when any nav link dispatches a close event
  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    window.addEventListener('languageSelector:close', handleClose);
    return () => {
      window.removeEventListener('languageSelector:close', handleClose);
    };
  }, []);

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    // Switch language and persist to localStorage
    i18n.changeLanguage(language.code);
    localStorage.setItem('selectedLanguage', language.code);
  };

  // Initialize selectedLanguage from localStorage/i18n on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage') || i18n.language || 'en';
    const found = languages.find(l => l.code === saved);
    if (found) {
      setSelectedLanguage(found);
    }
  }, [i18n.language]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-base font-medium text-gray-700 hidden sm:block">
          {selectedLanguage.flag} {selectedLanguage.code.toUpperCase()}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className="w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;