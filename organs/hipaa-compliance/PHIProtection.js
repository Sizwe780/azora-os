/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import crypto from 'crypto';

export class PHIProtection {
  /**
   * Encrypt PHI data using AES-256-GCM
   */
  static encryptPHI(data, key = null) {
    const encryptionKey = key || crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', encryptionKey);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      key: encryptionKey.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: 'aes-256-gcm',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Decrypt PHI data
   */
  static decryptPHI(encryptedData) {
    const { encrypted, iv, key, authTag, algorithm } = encryptedData;

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Assess PHI sensitivity level
   */
  static assessSensitivity(phiData) {
    let sensitivity = 'low';

    // High sensitivity indicators
    if (phiData.diagnosis && this.containsMentalHealth(phiData.diagnosis)) {
      sensitivity = 'high';
    }
    if (phiData.geneticInfo) {
      sensitivity = 'high';
    }
    if (phiData.hivStatus || phiData.stdStatus) {
      sensitivity = 'high';
    }

    // Medium sensitivity indicators
    if (phiData.mentalHealthHistory || phiData.substanceAbuse) {
      sensitivity = Math.max(sensitivity === 'high' ? 'high' : 'medium');
    }

    return sensitivity;
  }

  /**
   * Calculate retention limit based on HIPAA requirements
   */
  static calculateRetentionLimit(_phiData) {
    // HIPAA requires retention for 6 years from date of creation
    // Some states require longer (e.g., 7-10 years)
    const retentionYears = 6;
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + retentionYears);

    return retentionDate.toISOString();
  }

  /**
   * Check minimum necessary rule
   */
  static isMinimumNecessary(purpose, phiRecord) {
    // For treatment, all data may be necessary
    if (purpose === 'treatment') {
      return true;
    }

    // For other purposes, limit to necessary data
    // This is a simplified implementation
    return phiRecord.accessControls.minimumNecessary;
  }

  static containsMentalHealth(diagnosis) {
    const mentalHealthTerms = ['depression', 'anxiety', 'schizophrenia', 'bipolar', 'ptsd'];
    return mentalHealthTerms.some(term =>
      diagnosis.toLowerCase().includes(term)
    );
  }

  static async isAuthorizedProvider(_accessorId, _patientId) {
    // In a real implementation, this would check against provider registry
    // For demo purposes, we'll assume accessor is authorized
    return true;
  }

  static async hasPatientAuthorization(patientId, purpose, accessorId) {
    // This would need access to HIPAA_DATA.authorizations
    // For now, return true for demo purposes
    console.log(`Checking authorization for patient ${patientId}, purpose ${purpose}, accessor ${accessorId}`);
    return true;
  }

  /**
   * Check if access is authorized
   */
  static async checkAccessAuthorization(accessorId, patientId, purpose) {
    // Check if accessor is authorized healthcare provider
    const isAuthorizedProvider = await this.isAuthorizedProvider(accessorId, patientId);

    // Check if purpose is valid
    const validPurposes = [
      'treatment', 'payment', 'healthcare-operations',
      'research', 'public-health', 'legal'
    ];

    if (!validPurposes.includes(purpose)) {
      return { authorized: false, reason: 'Invalid access purpose' };
    }

    // Treatment purpose - always allowed for authorized providers
    if (purpose === 'treatment' && isAuthorizedProvider) {
      return { authorized: true };
    }

    // Check for patient authorization for other purposes
    if (purpose !== 'treatment') {
      const hasAuthorization = await this.hasPatientAuthorization(patientId, purpose, accessorId);
      if (!hasAuthorization) {
        return { authorized: false, reason: 'Patient authorization required' };
      }
    }

    return { authorized: true };
  }
}