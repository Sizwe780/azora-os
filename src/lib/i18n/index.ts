import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import en from './locales/en.json'
import af from './locales/af.json'
import zu from './locales/zu.json'
import xh from './locales/xh.json'
import st from './locales/st.json'
import tn from './locales/tn.json'
import nso from './locales/nso.json'
import ts from './locales/ts.json'
import ve from './locales/ve.json'
import nr from './locales/nr.json'
import ss from './locales/ss.json'

const resources = {
  en: { translation: en },
  af: { translation: af },
  zu: { translation: zu },
  xh: { translation: xh },
  st: { translation: st },
  tn: { translation: tn },
  nso: { translation: nso },
  ts: { translation: ts },
  ve: { translation: ve },
  nr: { translation: nr },
  ss: { translation: ss },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Supported languages
    supportedLngs: ['en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 've', 'nr', 'ss'],
    nonExplicitSupportedLngs: true,
  })

export default i18n