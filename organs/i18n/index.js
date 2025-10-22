/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'i18n';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4086;
const TRANSLATIONS_DIR = path.join(__dirname, 'translations');
const DEFAULT_LANGUAGE = 'en';

// Language metadata - ISO codes, names, RTL support
let languageMetadata = {};
let translations = {};
let fallbackTranslations = {};

// Create necessary directories
(async () => {
  await fs.mkdir(TRANSLATIONS_DIR, { recursive: true }).catch(console.error);
})();

// Load language metadata
async function loadLanguageMetadata() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'language-metadata.json'), 'utf8');
    languageMetadata = JSON.parse(data);
    console.log(`Loaded metadata for ${Object.keys(languageMetadata).length} languages`);
  } catch (err) {
    console.error('Error loading language metadata:', err);
    // Create fallback metadata
    languageMetadata = {
      "en": { "name": "English", "nativeName": "English", "rtl": false },
      "fr": { "name": "French", "nativeName": "Français", "rtl": false },
      "es": { "name": "Spanish", "nativeName": "Español", "rtl": false },
      "ar": { "name": "Arabic", "nativeName": "العربية", "rtl": true },
      "zh": { "name": "Chinese", "nativeName": "中文", "rtl": false }
    };
  }
}

// Load translations for a language
async function loadTranslationsForLanguage(langCode) {
  try {
    const filePath = path.join(TRANSLATIONS_DIR, `${langCode}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    translations[langCode] = JSON.parse(data);
    console.log(`Loaded translations for ${langCode}`);
    return true;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error loading translations for ${langCode}:`, err);
    }
    return false;
  }
}

// Load fallback translations (English)
async function loadFallbackTranslations() {
  try {
    const filePath = path.join(TRANSLATIONS_DIR, `${DEFAULT_LANGUAGE}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    fallbackTranslations = JSON.parse(data);
    console.log('Loaded fallback translations');
    return true;
  } catch (err) {
    console.error('Error loading fallback translations:', err);
    return false;
  }
}

// API endpoints
app.get('/api/i18n/languages', async (_req, res) => {
  res.json({
    languages: Object.entries(languageMetadata).map(([code, meta]) => ({
      code,
      name: meta.name,
      nativeName: meta.nativeName,
      rtl: meta.rtl || false,
      available: Boolean(translations[code])
    })),
    defaultLanguage: DEFAULT_LANGUAGE,
    count: Object.keys(languageMetadata).length
  });
});

app.get('/api/i18n/translations/:langCode', async (req, res) => {
  const { langCode } = req.params;
  
  // If language not loaded yet, try to load it
  if (!translations[langCode]) {
    await loadTranslationsForLanguage(langCode);
  }
  
  // If still not available, return 404
  if (!translations[langCode]) {
    return res.status(404).json({ 
      error: 'language_not_found',
      message: `Translations for language ${langCode} not available` 
    });
  }
  
  // Return the translations
  res.json({
    language: {
      code: langCode,
      name: languageMetadata[langCode]?.name || langCode,
      nativeName: languageMetadata[langCode]?.nativeName || langCode,
      rtl: languageMetadata[langCode]?.rtl || false
    },
    translations: translations[langCode],
    count: Object.keys(translations[langCode]).length
  });
});

app.get('/api/i18n/translate', async (req, res) => {
  const { text, source, target } = req.query;
  
  if (!text) {
    return res.status(400).json({ error: 'text_required' });
  }
  
  if (!target) {
    return res.status(400).json({ error: 'target_language_required' });
  }
  
  // In a real implementation, this would connect to a translation service API
  // For this demo, we'll simulate a translation
  try {
    // Use external translation API (mocked for demo)
    const translatedText = `[${target.toUpperCase()}] ${text}`;
    
    res.json({
      sourceText: text,
      sourceLanguage: source || 'auto',
      targetLanguage: target,
      translatedText,
      confidence: 0.95
    });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({
      error: 'translation_failed',
      message: err.message
    });
  }
});

// Add new translation
app.post('/api/i18n/translations/:langCode', async (req, res) => {
  const { langCode } = req.params;
  const { key, value } = req.body;
  
  if (!key || !value) {
    return res.status(400).json({ error: 'key_and_value_required' });
  }
  
  try {
    // Initialize language if not exists
    if (!translations[langCode]) {
      translations[langCode] = {};
    }
    
    // Add or update translation
    translations[langCode][key] = value;
    
    // Save to file
    await fs.writeFile(
      path.join(TRANSLATIONS_DIR, `${langCode}.json`),
      JSON.stringify(translations[langCode], null, 2),
      'utf8'
    );
    
    res.json({
      success: true,
      language: langCode,
      key,
      value
    });
  } catch (err) {
    console.error(`Error adding translation for ${langCode}:`, err);
    res.status(500).json({
      error: 'translation_update_failed',
      message: err.message
    });
  }
});

// Initialize default English translations if they don't exist
async function initializeEnglishTranslations() {
  const filePath = path.join(TRANSLATIONS_DIR, `${DEFAULT_LANGUAGE}.json`);
  try {
    await fs.access(filePath);
    // File exists, no need to create
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, create default translations
      const defaultTranslations = {
        "app.name": "Azora OS",
        "app.tagline": "The Global Blockchain Operating System",
        "common.welcome": "Welcome to Azora OS",
        "common.login": "Login",
        "common.signup": "Sign Up",
        "common.logout": "Logout",
        "common.dashboard": "Dashboard",
        "common.settings": "Settings",
        "common.profile": "Profile",
        "common.help": "Help",
        "common.about": "About",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.submit": "Submit",
        "common.next": "Next",
        "common.previous": "Previous",
        "common.search": "Search",
        "common.filter": "Filter",
        "common.sort": "Sort",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
        "auth.email": "Email",
        "auth.password": "Password",
        "auth.forgotPassword": "Forgot Password",
        "auth.resetPassword": "Reset Password",
        "auth.confirmPassword": "Confirm Password",
        "auth.createAccount": "Create Account",
        "auth.loginFailed": "Login failed",
        "auth.loginSuccess": "Login successful",
        "dashboard.overview": "Overview",
        "dashboard.recentActivity": "Recent Activity",
        "dashboard.statistics": "Statistics",
        "dashboard.balance": "Balance",
        "dashboard.transactions": "Transactions",
        "compliance.termsAndConditions": "Terms and Conditions",
        "compliance.privacyPolicy": "Privacy Policy",
        "compliance.cookies": "Cookies",
        "compliance.gdpr": "GDPR",
        "compliance.ccpa": "CCPA",
        "errors.required": "Required field",
        "errors.invalidEmail": "Invalid email",
        "errors.passwordMismatch": "Passwords do not match",
        "errors.passwordTooShort": "Password too short",
        "errors.somethingWentWrong": "Something went wrong",
        "founder.withdrawal": "Founder Withdrawal",
        "founder.guaranteed": "Guaranteed Amount: $100",
        "founder.clientRequirement": "Requires 10 clients"
      };
      
      await fs.writeFile(filePath, JSON.stringify(defaultTranslations, null, 2), 'utf8');
      console.log('Created default English translations');
    } else {
      console.error('Error checking English translations:', err);
    }
  }
}

// Server startup
const server = app.listen(PORT, async () => {
  console.log(`i18n service listening on port ${PORT}`);
  await loadLanguageMetadata();
  await initializeEnglishTranslations();
  await loadFallbackTranslations();
  
  // Load available translations
  const languages = Object.keys(languageMetadata);
  for (const langCode of languages) {
    await loadTranslationsForLanguage(langCode);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => {
    console.log('Server closed');
  });
});
