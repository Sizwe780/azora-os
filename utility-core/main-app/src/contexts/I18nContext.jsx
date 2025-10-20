import React, { createContext, useContext, useState } from "react";
import en from "../i18n/en.json";
import es from "../i18n/es.json";
import fr from "../i18n/fr.json";

const translations = { en, es, fr };

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const browserLang = (navigator.language || "en").slice(0,2);
  const [locale, setLocale] = useState(
    ["en","es","fr"].includes(browserLang) ? browserLang : "en"
  );
  const t = (key) => translations[locale][key] || key;
  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
