/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Global Compliance Framework
 * Implements regulatory compliance for all UN member states
 */

const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Compliance frameworks by country and region
const COMPLIANCE_FRAMEWORKS = {
  // Africa
  'ZA': { name: 'South Africa', frameworks: ['POPIA', 'ECTA', 'RICA'] },
  'NG': { name: 'Nigeria', frameworks: ['NDPR', 'CBN-Regulations'] },
  'KE': { name: 'Kenya', frameworks: ['DPA-2019'] },
  'GH': { name: 'Ghana', frameworks: ['DPA-2012'] },
  'EG': { name: 'Egypt', frameworks: ['DPL-2020'] },
  
  // Europe
  'EU': { name: 'European Union', frameworks: ['GDPR', 'ePrivacy', 'PSD2', 'MIFID2'] },
  'UK': { name: 'United Kingdom', frameworks: ['UK-GDPR', 'DPA-2018'] },
  'CH': { name: 'Switzerland', frameworks: ['FADP'] },
  
  // North America
  'US': { name: 'United States', frameworks: ['CCPA', 'CPRA', 'HIPAA', 'GLBA', 'SOX'] },
  'US-NY': { name: 'New York', frameworks: ['SHIELD', 'NYCRR-500'] },
  'US-VA': { name: 'Virginia', frameworks: ['CDPA'] },
  'CA': { name: 'Canada', frameworks: ['PIPEDA', 'CASL'] },
  'MX': { name: 'Mexico', frameworks: ['LFPDPPP'] },
  
  // South America
  'BR': { name: 'Brazil', frameworks: ['LGPD'] },
  'AR': { name: 'Argentina', frameworks: ['PDPA'] },
  'CL': { name: 'Chile', frameworks: ['Law-19628'] },
  
  // Asia Pacific
  'CN': { name: 'China', frameworks: ['PIPL', 'CSL', 'DSL'] },
  'JP': { name: 'Japan', frameworks: ['APPI'] },
  'SG': { name: 'Singapore', frameworks: ['PDPA'] },
  'AU': { name: 'Australia', frameworks: ['Privacy-Act-1988'] },
  'IN': { name: 'India', frameworks: ['PDPB'] },
  
  // Middle East
  'AE': { name: 'UAE', frameworks: ['DPL-DIFC', 'UAE-DP-Law'] },
  'IL': { name: 'Israel', frameworks: ['PPL'] },
  'SA': { name: 'Saudi Arabia', frameworks: ['PDPL-2021'] },
  
  // UN & International
  'UN': { name: 'United Nations', frameworks: ['UNCITRAL', 'UN-OECD'] },
  'INT': { name: 'International', frameworks: ['ISO27001', 'ISO27701', 'PCI-DSS', 'NIST'] }
};

// Data protection requirements by framework
const DATA_PROTECTION_REQUIREMENTS = {
  'GDPR': [
    'data_minimization',
    'purpose_limitation',
    'explicit_consent',
    'right_to_be_forgotten',
    'data_portability',
    'breach_notification',
    'dpia_required'
  ],
  'CCPA': [
    'privacy_notice',
    'opt_out_rights',
    'deletion_request',
    'non_discrimination',
    'data_sale_opt_out'
  ],
  'POPIA': [
    'minimum_processing',
    'accountability',
    'processing_limitation',
    'purpose_specification',
    'information_officer'
  ],
  // Add more frameworks here
};

class GlobalComplianceEngine {
  constructor(logDir) {
    this.logDir = logDir || path.join(__dirname, 'logs');
    this.complianceChecks = {};
    this.eventHandlers = {};
    
    // Create log directory
    fs.mkdir(this.logDir, { recursive: true }).catch(console.error);
  }
  
  /**
   * Get compliance requirements for a specific country
   * @param {string} countryCode - ISO country code
   * @returns {Object} Compliance requirements
   */
  getCountryRequirements(countryCode) {
    const country = COMPLIANCE_FRAMEWORKS[countryCode];
    if (!country) {
      return { error: 'country_not_found', supported: Object.keys(COMPLIANCE_FRAMEWORKS) };
    }
    
    const requirements = {};
    country.frameworks.forEach(framework => {
      requirements[framework] = DATA_PROTECTION_REQUIREMENTS[framework] || [];
    });
    
    return {
      country: country.name,
      countryCode,
      frameworks: country.frameworks,
      requirements
    };
  }
  
  /**
   * Log compliance event
   * @param {Object} event - Compliance event details
   * @returns {Promise<string>} Event ID
   */
  async logComplianceEvent(event) {
    const eventId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const logEntry = {
      id: eventId,
      timestamp,
      ...event
    };
    
    // Write to log file
    try {
      await fs.appendFile(
        path.join(this.logDir, `compliance-${new Date().toISOString().split('T')[0]}.log`),
        JSON.stringify(logEntry) + '\n'
      );
    } catch (err) {
      console.error('Error writing compliance log:', err);
    }
    
    // Trigger event handlers
    if (this.eventHandlers[event.type]) {
      this.eventHandlers[event.type].forEach(handler => {
        try {
          handler(logEntry);
        } catch (err) {
          console.error(`Error in compliance event handler for ${event.type}:`, err);
        }
      });
    }
    
    return eventId;
  }
  
  /**
   * Register compliance check
   * @param {string} type - Check type
   * @param {Function} checkFn - Check function
   */
  registerComplianceCheck(type, checkFn) {
    this.complianceChecks[type] = checkFn;
  }
  
  /**
   * Register event handler
   * @param {string} eventType - Event type
   * @param {Function} handlerFn - Handler function
   */
  onComplianceEvent(eventType, handlerFn) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handlerFn);
  }
  
  /**
   * Check if an operation is compliant
   * @param {string} countryCode - ISO country code
   * @param {string} operationType - Type of operation
   * @param {Object} data - Operation data
   * @returns {Promise<Object>} Compliance result
   */
  async checkCompliance(countryCode, operationType, data) {
    // Get country requirements
    const countryRequirements = this.getCountryRequirements(countryCode);
    if (countryRequirements.error) {
      return { compliant: false, reason: countryRequirements.error };
    }
    
    // Check if we have a specific check for this operation
    if (!this.complianceChecks[operationType]) {
      return { compliant: false, reason: 'operation_not_supported' };
    }
    
    // Run the check
    try {
      const result = await this.complianceChecks[operationType](data, countryRequirements);
      
      // Log the check
      await this.logComplianceEvent({
        type: 'compliance_check',
        operation: operationType,
        country: countryCode,
        result: result.compliant ? 'compliant' : 'non_compliant',
        reason: result.reason || null
      });
      
      return result;
    } catch (err) {
      console.error(`Compliance check error for ${operationType} in ${countryCode}:`, err);
      return { compliant: false, reason: 'check_error', error: err.message };
    }
  }
  
  /**
   * Get all supported countries and their compliance frameworks
   */
  getSupportedCountries() {
    return Object.entries(COMPLIANCE_FRAMEWORKS).map(([code, data]) => ({
      code,
      name: data.name,
      frameworks: data.frameworks
    }));
  }
}

module.exports = { 
  GlobalComplianceEngine, 
  COMPLIANCE_FRAMEWORKS, 
  DATA_PROTECTION_REQUIREMENTS 
};