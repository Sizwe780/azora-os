/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const regionManager = require('./region-manager');
const path = require('path');
const fs = require('fs').promises;

/**
 * Integrates region-specific settings with the email domain service
 */
class RegionIntegration {
  constructor(app, i18next) {
    this.app = app;
    this.i18next = i18next;
    this.initialized = false;
  }
  
  /**
   * Initialize the region integration
   */
  async initialize() {
    try {
      // Load region settings
      await regionManager.load();
      
      // Add region-based API endpoints
      this.addEndpoints();
      
      // Load region-specific translations
      await this.loadRegionTranslations();
      
      this.initialized = true;
      console.log('Region integration initialized successfully');
    } catch (err) {
      console.error('Failed to initialize region integration:', err);
      throw err;
    }
  }
  
  /**
   * Add region-based API endpoints
   */
  addEndpoints() {
    // Get all regions
    this.app.get('/api/regions', (_req, res) => {
      const regions = Object.entries(regionManager.regions).map(([code, region]) => ({
        code,
        name: region.name,
        currency: region.currency,
        languages: region.supportedLanguages
      }));
      
      res.json({ regions });
    });
    
    // Get specific region settings
    this.app.get('/api/regions/:code', (req, res) => {
      try {
        const { code } = req.params;
        const regionSettings = regionManager.getRegionSettings(code);
        res.json(regionSettings);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });
    
    // Get all supported languages across regions
    this.app.get('/api/regions/languages/all', (_req, res) => {
      const allLanguages = new Set();
      
      Object.values(regionManager.regions).forEach(region => {
        region.supportedLanguages.forEach(lang => allLanguages.add(lang));
      });
      
      res.json({ languages: Array.from(allLanguages) });
    });
    
    // Get compliance settings for a region
    this.app.get('/api/regions/:code/compliance', (req, res) => {
      try {
        const { code } = req.params;
        const region = regionManager.getRegion(code);
        
        const compliance = {
          region: {
            code,
            name: region.name
          },
          requirements: {
            dataRetention: {
              days: region.dataRetentionDays,
              compliant: region.dataRetentionDays <= 730 // Example compliance check
            },
            explicitConsent: {
              required: region.requiresExplicitConsent,
              compliant: region.requiresExplicitConsent
            },
            privacyNotice: {
              required: region.privacyNotice,
              compliant: region.privacyNotice
            },
            encryption: {
              required: region.encryptionRequired,
              compliant: region.encryptionRequired
            },
            localStorage: {
              required: region.localStorageRequired,
              compliant: region.localStorageRequired
            }
          }
        };
        
        // Overall compliance
        compliance.compliant = Object.values(compliance.requirements).every(req => req.compliant);
        
        res.json(compliance);
      } catch (err) {
        res.status(404).json({ error: err.message });
      }
    });
  }
  
  /**
   * Load region-specific translations
   */
  async loadRegionTranslations() {
    try {
      // Get all languages from all regions
      const allLanguages = new Set();
      Object.values(regionManager.regions).forEach(region => {
        region.supportedLanguages.forEach(lang => allLanguages.add(lang));
      });
      
      // Make sure translation files exist for all languages
      const translationsDir = path.join(__dirname, 'translations');
      await fs.mkdir(translationsDir, { recursive: true });
      
      for (const lang of allLanguages) {
        const translationFile = path.join(translationsDir, `${lang}.json`);
        
        try {
          await fs.access(translationFile);
          console.log(`Translation file for ${lang} exists`);
        } catch (err) {
          // Create a default translation file
          console.log(`Creating default translation file for ${lang}`);
          
          // In a real app, these would be properly translated
          // For demo, we'll use English strings
          const defaultTranslations = {
            translation: {
              welcome: 'Welcome to Azora Mail!',
              email_created: 'Your email account has been created.',
              login_success: 'You have successfully logged in.',
              invalid_credentials: 'Invalid email or password.',
              email_sent: 'Email sent successfully.',
              email_error: 'Failed to send email.',
              domain_registered: 'Domain registered successfully.',
              domain_error: 'Failed to register domain.',
              region_specific: `Region-specific message for ${lang}`
            }
          };
          
          await fs.writeFile(translationFile, JSON.stringify(defaultTranslations, null, 2));
          
          // Add the resource bundle to i18next
          if (this.i18next) {
            this.i18next.addResourceBundle(lang, 'translation', defaultTranslations.translation);
          }
        }
      }
    } catch (err) {
      console.error('Error loading region translations:', err);
      throw err;
    }
  }
  
  /**
   * Apply region-specific settings to an email
   * @param {string} email The email address
   * @param {Object} options Email options
   * @param {string} regionCode The region code
   * @returns {Object} Modified options based on region settings
   */
  applyRegionSettings(email, options, regionCode) {
    const region = regionManager.getRegion(regionCode || 'GLOBAL');
    const settings = regionManager.getRegionSettings(regionCode || 'GLOBAL');
    
    // Apply region-specific settings
    const modifiedOptions = { ...options };
    
    // Add compliance footer if required
    if (region.privacyNotice) {
      const complianceFooter = `
      
      --
      This email is sent in compliance with ${region.name} regulations.
      Data retention: ${settings.dataRetention.policy}
      ${settings.consent.text}
      `;
      
      if (modifiedOptions.text) {
        modifiedOptions.text += complianceFooter;
      } else {
        modifiedOptions.text = complianceFooter;
      }
    }
    
    // Set appropriate headers for tracking compliance
    modifiedOptions.headers = modifiedOptions.headers || {};
    modifiedOptions.headers['X-Azora-Region'] = regionCode || 'GLOBAL';
    modifiedOptions.headers['X-Azora-Compliance'] = region.privacyNotice ? 'compliant' : 'non-compliant';
    
    return modifiedOptions;
  }
  
  /**
   * Get region code from an email domain
   * @param {string} email The email address
   * @returns {string} The region code
   */
  getRegionFromEmail(email) {
    if (!email || typeof email !== 'string') {
      return 'GLOBAL';
    }
    
    // Extract domain from email
    const domain = email.split('@')[1];
    if (!domain) {
      return 'GLOBAL';
    }
    
    // Get TLD
    const tld = domain.split('.').pop();
    
    // Map common TLDs to regions
    const tldMap = {
      'za': 'ZA',
      'ng': 'NG',
      'ke': 'KE',
      'eu': 'EU',
      'uk': 'EU',
      'de': 'EU',
      'fr': 'EU',
      'es': 'EU',
      'it': 'EU',
      'us': 'US',
      'ca': 'US',
    };
    
    return tldMap[tld.toLowerCase()] || 'GLOBAL';
  }
}

module.exports = RegionIntegration;