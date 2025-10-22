/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Internationalization Service
 * Provides translation and localization for all UN member countries
 */
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const GlobalComplianceRegistry = require('../compliance-service/global-compliance');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4091;
const TRANSLATIONS_DIR = path.join(__dirname, 'translations');

// Ensure translations directory exists
(async () => {
  try {
    await fs.mkdir(TRANSLATIONS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create translations directory:', err);
  }
})();

// In-memory cache for translations
const translationCache = new Map();
const supportedLocales = new Set();

// Initialize translations
async function initializeTranslations() {
  try {
    // Get all supported languages
    const languages = await GlobalComplianceRegistry.getSupportedLanguages();
    
    // For each language, check if we have translations
    for (const lang of languages) {
      const filePath = path.join(TRANSLATIONS_DIR, `${lang}.json`);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const translations = JSON.parse(fileContent);
        translationCache.set(lang, translations);
        supportedLocales.add(lang);
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Create empty translation file
          const emptyTranslations = {
            language: lang,
            translations: {
              common: {
                welcome: "Welcome",
                login: "Login",
                signup: "Sign Up",
                logout: "Logout"
              }
            },
            lastUpdated: new Date().toISOString()
          };
          await fs.writeFile(filePath, JSON.stringify(emptyTranslations, null, 2));
          translationCache.set(lang, emptyTranslations);
          supportedLocales.add(lang);
        } else {
          console.error(`Error loading translations for ${lang}:`, err);
        }
      }
    }
    
    console.log(`Loaded translations for ${supportedLocales.size} languages`);
  } catch (err) {
    console.error('Failed to initialize translations:', err);
  }
}

// API endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'i18n-service' });
});

app.get('/api/i18n/locales', async (_req, res) => {
  try {
    const languages = await GlobalComplianceRegistry.getSupportedLanguages();
    res.json({
      supported: Array.from(supportedLocales),
      available: languages,
      count: supportedLocales.size
    });
  } catch (err) {
    console.error('Failed to get locales:', err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

app.get('/api/i18n/translations/:locale', async (req, res) => {
  const { locale } = req.params;
  
  if (!supportedLocales.has(locale)) {
    return res.status(404).json({ error: 'locale_not_found' });
  }
  
  try {
    const translations = translationCache.get(locale);
    res.json(translations);
  } catch (err) {
    console.error(`Failed to get translations for ${locale}:`, err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

app.post('/api/i18n/translations/:locale', async (req, res) => {
  const { locale } = req.params;
  const { translations } = req.body;
  
  if (!translations) {
    return res.status(400).json({ error: 'missing_translations' });
  }
  
  try {
    // Check if locale exists, if not create it
    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    const translationData = {
      language: locale,
      translations,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(filePath, JSON.stringify(translationData, null, 2));
    translationCache.set(locale, translationData);
    supportedLocales.add(locale);
    
    res.json({
      success: true,
      locale,
      updated: true
    });
  } catch (err) {
    console.error(`Failed to update translations for ${locale}:`, err);
    res.status(500).json({ error: 'internal_server_error' });
  }
});

// Start server
async function startServer() {
  await initializeTranslations();
  
  app.listen(PORT, () => {
    console.log(`i18n service listening on port ${PORT}`);
  });
}

startServer();