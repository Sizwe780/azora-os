/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const fs = require('fs').promises;
const path = require('path');

// Region-specific settings and requirements
class RegionManager {
  constructor() {
    this.regionsFile = path.join(__dirname, 'data', 'regions.json');
    this.regions = {};
    this.loaded = false;
  }
  
  async load() {
    try {
      await fs.mkdir(path.dirname(this.regionsFile), { recursive: true });
      
      try {
        const data = await fs.readFile(this.regionsFile, 'utf8');
        this.regions = JSON.parse(data);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
        
        // Default region configurations
        this.regions = {
          'ZA': {
            name: 'South Africa',
            dataRetentionDays: 365,
            requiresExplicitConsent: true,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: true,
            supportedLanguages: ['en', 'af', 'zu', 'xh', 'st', 'tn', 'ts'],
            currency: 'ZAR'
          },
          'EU': {
            name: 'European Union',
            dataRetentionDays: 730,
            requiresExplicitConsent: true,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: false,
            supportedLanguages: ['en', 'fr', 'de', 'it', 'es', 'pt', 'nl', 'el', 'sv', 'da', 'fi'],
            currency: 'EUR'
          },
          'US': {
            name: 'United States',
            dataRetentionDays: 1095,
            requiresExplicitConsent: false,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: false,
            supportedLanguages: ['en', 'es'],
            currency: 'USD'
          },
          'NG': {
            name: 'Nigeria',
            dataRetentionDays: 365,
            requiresExplicitConsent: true,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: true,
            supportedLanguages: ['en', 'ha', 'yo', 'ig'],
            currency: 'NGN'
          },
          'KE': {
            name: 'Kenya',
            dataRetentionDays: 365,
            requiresExplicitConsent: true,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: true,
            supportedLanguages: ['en', 'sw'],
            currency: 'KES'
          },
          'GLOBAL': {
            name: 'Global',
            dataRetentionDays: 365,
            requiresExplicitConsent: true,
            privacyNotice: true,
            encryptionRequired: true,
            localStorageRequired: false,
            supportedLanguages: ['en'],
            currency: 'USD'
          }
        };
        
        await this.save();
      }
      
      this.loaded = true;
    } catch (err) {
      console.error('Error loading regions:', err);
      throw err;
    }
  }
  
  async save() {
    try {
      await fs.writeFile(this.regionsFile, JSON.stringify(this.regions, null, 2));
    } catch (err) {
      console.error('Error saving regions:', err);
      throw err;
    }
  }
  
  getRegion(code) {
    if (!this.loaded) {
      throw new Error('RegionManager not loaded');
    }
    
    return this.regions[code] || this.regions['GLOBAL'];
  }
  
  async addRegion(code, data) {
    if (!this.loaded) {
      await this.load();
    }
    
    this.regions[code] = data;
    await this.save();
    return this.regions[code];
  }
  
  async updateRegion(code, data) {
    if (!this.loaded) {
      await this.load();
    }
    
    if (!this.regions[code]) {
      throw new Error(`Region ${code} not found`);
    }
    
    this.regions[code] = { ...this.regions[code], ...data };
    await this.save();
    return this.regions[code];
  }
  
  getRegionSettings(code) {
    const region = this.getRegion(code);
    return {
      dataRetention: {
        days: region.dataRetentionDays,
        policy: `Emails are retained for ${region.dataRetentionDays} days in accordance with ${region.name} regulations.`
      },
      consent: {
        explicit: region.requiresExplicitConsent,
        notice: region.privacyNotice,
        text: region.requiresExplicitConsent ? 
          'Explicit consent is required for data processing.' : 
          'Opt-out mechanism is available for data processing.'
      },
      security: {
        encryption: region.encryptionRequired,
        localStorage: region.localStorageRequired,
        details: `All data ${region.encryptionRequired ? 'is' : 'should be'} encrypted at rest and in transit.`
      },
      localization: {
        languages: region.supportedLanguages,
        currency: region.currency,
        dateFormat: region.name === 'United States' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'
      }
    };
  }
}

module.exports = new RegionManager();

// If run directly, output region info
if (require.main === module) {
  const manager = new RegionManager();
  manager.load()
    .then(() => {
      console.log('Available regions:');
      for (const [code, region] of Object.entries(manager.regions)) {
        console.log(`${code}: ${region.name}`);
        console.log(`  Languages: ${region.supportedLanguages.join(', ')}`);
        console.log(`  Data retention: ${region.dataRetentionDays} days`);
        console.log(`  Currency: ${region.currency}`);
        console.log('');
      }
    })
    .catch(console.error);
}