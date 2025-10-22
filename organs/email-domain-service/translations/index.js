/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Translations manager for Azora Email Service
const path = require('path');
const fs = require('fs/promises');
const i18next = require('i18next');

// UN official languages plus African languages
const LANGUAGE_FILES = {
  'en': 'English (English)',
  'ar': 'العربية (Arabic)',
  'zh': '中文 (Chinese)',
  'fr': 'Français (French)',
  'ru': 'Русский (Russian)',
  'es': 'Español (Spanish)',
  'sw': 'Kiswahili (Swahili)',
  'zu': 'isiZulu (Zulu)',
  'xh': 'isiXhosa (Xhosa)',
  'af': 'Afrikaans',
  'st': 'Sesotho (Southern Sotho)',
  'am': 'አማርኛ (Amharic)',
  'ha': 'Hausa',
  'yo': 'Yorùbá',
  'ig': 'Igbo',
  'pt': 'Português (Portuguese)',
  'hi': 'हिन्दी (Hindi)',
  'ur': 'اردو (Urdu)',
  'bn': 'বাংলা (Bengali)',
  'ja': '日本語 (Japanese)',
  'ko': '한국어 (Korean)',
  'de': 'Deutsch (German)',
  'it': 'Italiano (Italian)'
};

// Basic email translations in all languages
const generateTranslations = async () => {
  const translations = {};
  
  // Base translations in English
  const enTranslations = {
    welcome: 'Welcome to Azora Mail!',
    email_created: 'Your email account has been created.',
    login_success: 'You have successfully logged in.',
    invalid_credentials: 'Invalid email or password.',
    email_sent: 'Email sent successfully.',
    email_error: 'Failed to send email.',
    domain_registered: 'Domain registered successfully.',
    domain_error: 'Failed to register domain.',
    logout_success: 'You have successfully logged out.',
    settings_saved: 'Your settings have been saved.',
    password_changed: 'Your password has been changed.',
    email_deleted: 'Email deleted successfully.',
    email_restored: 'Email restored from trash.',
    email_permanent_delete: 'Email permanently deleted.',
    session_expired: 'Your session has expired. Please log in again.',
    unauthorized: 'Unauthorized access.',
    inbox_empty: 'Your inbox is empty.',
    compliance_notice: 'This email service follows all international regulations and data protection laws.'
  };
  
  translations.en = { translation: enTranslations };

  // In a real application, we would load real translations for all languages
  // Here we're just using the English translations for demonstration purposes
  Object.keys(LANGUAGE_FILES).forEach(langCode => {
    if (langCode !== 'en') {
      translations[langCode] = { translation: enTranslations };
    }
  });
  
  // Create directory if it doesn't exist
  const translationsDir = path.join(__dirname);
  await fs.mkdir(translationsDir, { recursive: true }).catch(console.error);
  
  // Write translation files
  for (const [langCode, translations] of Object.entries(translations)) {
    await fs.writeFile(
      path.join(translationsDir, `${langCode}.json`),
      JSON.stringify(translations, null, 2),
      'utf8'
    ).catch(console.error);
  }
  
  return translations;
};

const initializeTranslations = async () => {
  try {
    const translations = await generateTranslations();
    
    i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: translations
    });
    
    console.log(`Initialized translations for ${Object.keys(translations).length} languages`);
    return i18next;
  } catch (err) {
    console.error('Error initializing translations:', err);
    throw err;
  }
};

module.exports = {
  initializeTranslations,
  LANGUAGE_FILES
};