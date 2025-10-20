import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/i18n/locales`);
        const data = await response.json();
        
        // Format for display
        const languageMap = {
          en: { name: 'English', nativeName: 'English' },
          fr: { name: 'French', nativeName: 'Français' },
          es: { name: 'Spanish', nativeName: 'Español' },
          ar: { name: 'Arabic', nativeName: 'العربية' },
          zh: { name: 'Chinese', nativeName: '中文' },
          ru: { name: 'Russian', nativeName: 'Русский' },
          af: { name: 'Afrikaans', nativeName: 'Afrikaans' },
          zu: { name: 'Zulu', nativeName: 'isiZulu' },
          xh: { name: 'Xhosa', nativeName: 'isiXhosa' },
          // ... more languages would be added
        };
        
        // Map available languages to display format
        const formattedLanguages = data.supported.map(code => ({
          code,
          name: languageMap[code]?.name || code,
          nativeName: languageMap[code]?.nativeName || code
        }));
        
        setLanguages(formattedLanguages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching languages:', error);
        setLoading(false);
      }
    }
    
    fetchLanguages();
  }, []);
  
  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ar' || code === 'he' || code === 'ur' ? 'rtl' : 'ltr';
  };
  
  if (loading) {
    return <div className="language-selector-loading">Loading...</div>;
  }
  
  return (
    <div className="language-selector">
      <select 
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
        aria-label="Select language"
      >
        {languages.map(({ code, name, nativeName }) => (
          <option key={code} value={code}>
            {nativeName} ({name})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;