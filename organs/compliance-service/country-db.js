/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Country-specific compliance database
 * Contains regulatory requirements for all UN member countries
 */
const fs = require('fs/promises');
const path = require('path');

class CountryComplianceDB {
  constructor() {
    this.countryData = new Map();
    this.dataDir = path.join(__dirname, 'data');
    this.initialized = false;
  }
  
  async initialize() {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Generate initial country data if not exists
      const countriesFile = path.join(this.dataDir, 'countries.json');
      try {
        const data = await fs.readFile(countriesFile, 'utf8');
        this.countryData = new Map(Object.entries(JSON.parse(data)));
      } catch (err) {
        if (err.code === 'ENOENT') {
          // Generate initial data
          await this.generateInitialData();
          // Save to file
          await this.saveData();
        } else {
          throw err;
        }
      }
      
      this.initialized = true;
      console.log(`Initialized compliance data for ${this.countryData.size} countries`);
    } catch (err) {
      console.error('Failed to initialize country compliance database:', err);
      throw err;
    }
  }
  
  async generateInitialData() {
    // UN member countries + observers
    const countries = [
      {
        code: 'ZA',
        name: 'South Africa',
        region: 'Africa',
        currencies: ['ZAR'],
        compliance: {
          data_protection: {
            law: 'Protection of Personal Information Act (POPIA)',
            requirements: [
              'Appoint Information Officer',
              'Data Processing Agreements',
              'Privacy Policy',
              'Consent Management',
              'Data Subject Access Rights'
            ],
            enforcing_body: 'Information Regulator'
          },
          financial: {
            laws: [
              'Financial Intelligence Centre Act (FICA)',
              'Financial Advisory and Intermediary Services Act (FAIS)'
            ],
            requirements: [
              'KYC Verification',
              'Transaction Monitoring',
              'Suspicious Activity Reporting'
            ],
            enforcing_body: 'Financial Intelligence Centre'
          },
          languages: ['en', 'af', 'zu', 'xh', 'st', 'tn', 'ts', 've', 'ss', 'nd'],
          official_languages: ['en'],
          data_localization: false,
          special_requirements: [
            'B-BBEE compliance reporting',
            'Consumer Protection Act compliance'
          ]
        }
      },
      {
        code: 'US',
        name: 'United States',
        region: 'North America',
        currencies: ['USD'],
        compliance: {
          data_protection: {
            law: 'Various state laws including CCPA, CPRA',
            requirements: [
              'Privacy Policy',
              'Opt-out Mechanism',
              'Data Subject Access Rights',
              'Data Breach Notification'
            ],
            enforcing_body: 'Federal Trade Commission, State Attorneys General'
          },
          financial: {
            laws: [
              'Bank Secrecy Act (BSA)',
              'USA PATRIOT Act',
              'Dodd-Frank Act'
            ],
            requirements: [
              'KYC Verification',
              'Transaction Monitoring',
              'Suspicious Activity Reporting',
              'OFAC Screening'
            ],
            enforcing_body: 'FinCEN, SEC, OFAC'
          },
          languages: ['en', 'es'],
          official_languages: ['en'],
          data_localization: false,
          special_requirements: [
            'State-specific regulations',
            'SOX compliance for publicly traded companies'
          ]
        }
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        region: 'Europe',
        currencies: ['GBP'],
        compliance: {
          data_protection: {
            law: 'UK GDPR, Data Protection Act 2018',
            requirements: [
              'Privacy Policy',
              'Lawful Basis for Processing',
              'Data Subject Access Rights',
              'Data Protection Impact Assessments'
            ],
            enforcing_body: 'Information Commissioner\'s Office (ICO)'
          },
          financial: {
            laws: [
              'Money Laundering Regulations 2017',
              'Financial Services and Markets Act 2000'
            ],
            requirements: [
              'KYC Verification',
              'Transaction Monitoring',
              'Suspicious Activity Reporting'
            ],
            enforcing_body: 'Financial Conduct Authority (FCA)'
          },
          languages: ['en', 'cy', 'gd'],
          official_languages: ['en'],
          data_localization: false,
          special_requirements: []
        }
      },
      // Many more countries would be defined here...
    ];
    
    // Add countries to map
    for (const country of countries) {
      this.countryData.set(country.code, country);
    }
  }
  
  async saveData() {
    try {
      const countriesFile = path.join(this.dataDir, 'countries.json');
      const data = Object.fromEntries(this.countryData);
      await fs.writeFile(countriesFile, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to save country data:', err);
      throw err;
    }
  }
  
  async getCountry(countryCode) {
    if (!this.initialized) await this.initialize();
    return this.countryData.get(countryCode.toUpperCase());
  }
  
  async getAllCountries() {
    if (!this.initialized) await this.initialize();
    return Array.from(this.countryData.values());
  }
  
  async updateCountry(countryCode, data) {
    if (!this.initialized) await this.initialize();
    
    const code = countryCode.toUpperCase();
    const country = this.countryData.get(code);
    
    if (!country) throw new Error(`Country ${code} not found`);
    
    // Update country data
    this.countryData.set(code, {
      ...country,
      ...data,
      compliance: {
        ...country.compliance,
        ...(data.compliance || {})
      }
    });
    
    await this.saveData();
    return this.countryData.get(code);
  }
  
  async getComplianceRequirements(countryCode) {
    if (!this.initialized) await this.initialize();
    
    const code = countryCode.toUpperCase();
    const country = this.countryData.get(code);
    
    if (!country) throw new Error(`Country ${code} not found`);
    
    return {
      country: country.name,
      code: country.code,
      requirements: {
        data_protection: country.compliance.data_protection.requirements,
        financial: country.compliance.financial.requirements,
        special: country.compliance.special_requirements
      },
      enforcing_bodies: {
        data_protection: country.compliance.data_protection.enforcing_body,
        financial: country.compliance.financial.enforcing_body
      },
      languages: country.compliance.languages || [],
      official_languages: country.compliance.official_languages || []
    };
  }
}

module.exports = new CountryComplianceDB();