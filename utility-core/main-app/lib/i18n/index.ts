import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import all locale JSON files
import af from './locales/af.json';
import en from './locales/en.json';
import nr from './locales/nr.json';
import nso from './locales/nso.json';
import ss from './locales/ss.json';
import st from './locales/st.json';
import tn from './locales/tn.json';
import ts from './locales/ts.json';
import ve from './locales/ve.json';
import xh from './locales/xh.json';
import zu from './locales/zu.json';

// List of supported languages and their resources
const resources = {
  af: { translation: af },
  en: { translation: en },
  nr: { translation: nr },
  nso: { translation: nso },
  ss: { translation: ss },
  st: { translation: st },
  tn: { translation: tn },
  ts: { translation: ts },
  ve: { translation: ve },
  xh: { translation: xh },
  zu: { translation: zu }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;