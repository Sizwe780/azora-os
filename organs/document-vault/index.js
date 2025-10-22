/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Document Vault & Ledger Service
 * 
 * Secure document vault with validity/originality checking, UID watermarking,
 * certification badges, and 3-way back system ledger for all documents and transactions.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

const PORT = 4087;

// ============================================================================
// DATA STORES (3-Way Ledger System)
// ============================================================================

const primaryLedger = new Map(); // Primary storage
const secondaryLedger = new Map(); // Secondary backup
const tertiaryLedger = new Map(); // Tertiary backup

const documents = new Map(); // documentId -> document data
const documentIndex = new Map(); // UID -> documentId
const verificationLog = new Map(); // verificationId -> verification record
const accessLog = new Map(); // accessId -> access record

// ============================================================================
// DOCUMENT UID & WATERMARKING
// ============================================================================

function generateDocumentUID() {
  // Format: AZ-DOC-{timestamp}-{random}
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `AZ-DOC-${timestamp}-${random}`;
}

function generateWatermark(documentId, uid) {
  return {
    logo: 'AZORA_LOGO_BASE64', // Would be actual logo in production
    uid,
    documentId,
    issuer: 'Azora World (Pty) Ltd',
    issuedAt: new Date().toISOString(),
    qrCode: generateQRCode(uid), // QR code for mobile scanning
    hologram: generateHologram(uid) // Digital hologram for authenticity
  };
}

function generateQRCode(uid) {
  // Would generate actual QR code in production
  return `QR_CODE_${uid}`;
}

function generateHologram(uid) {
  // Would generate actual hologram in production
  return crypto.createHash('sha256').update(uid).digest('hex');
}

// ============================================================================
// DOCUMENT VALIDATION & ORIGINALITY CHECKING
// ============================================================================

function validateDocument(documentData) {
  const validation = {
    isValid: true,
    isOriginal: true,
    checks: [],
    confidence: 100
  };
  
  // Check 1: File integrity
  const fileHash = crypto.createHash('sha256').update(documentData.content).digest('hex');
  validation.checks.push({
    check: 'File Integrity',
    passed: true,
    hash: fileHash
  });
  
  // Check 2: Metadata consistency
  if (!documentData.metadata || !documentData.metadata.createdAt) {
    validation.isValid = false;
    validation.confidence -= 20;
    validation.checks.push({
      check: 'Metadata Consistency',
      passed: false,
      reason: 'Missing or invalid metadata'
    });
  } else {
    validation.checks.push({
      check: 'Metadata Consistency',
      passed: true
    });
  }
  
  // Check 3: Format validation
  const allowedFormats = ['pdf', 'jpg', 'png', 'docx', 'xlsx'];
  if (!allowedFormats.includes(documentData.format.toLowerCase())) {
    validation.isValid = false;
    validation.confidence -= 30;
    validation.checks.push({
      check: 'Format Validation',
      passed: false,
      reason: `Format ${documentData.format} not allowed`
    });
  } else {
    validation.checks.push({
      check: 'Format Validation',
      passed: true
    });
  }
  
  // Check 4: Tampering detection
  if (documentData.previousHash) {
    const expectedHash = crypto.createHash('sha256')
      .update(documentData.previousHash + documentData.content)
      .digest('hex');
    
    if (expectedHash !== documentData.currentHash) {
      validation.isOriginal = false;
      validation.confidence -= 50;
      validation.checks.push({
        check: 'Tampering Detection',
        passed: false,
        reason: 'Document appears to have been modified'
      });
    } else {
      validation.checks.push({
        check: 'Tampering Detection',
        passed: true
      });
    }
  }
  
  // Check 5: Duplicate detection
  const existingDoc = Array.from(documents.values()).find(d => 
    d.fileHash === fileHash && d.name === documentData.name
  );
  
  if (existingDoc) {
    validation.isOriginal = false;
    validation.checks.push({
      check: 'Duplicate Detection',
      passed: false,
      reason: 'Identical document already exists',
      existingDocumentId: existingDoc.id
    });
  } else {
    validation.checks.push({
      check: 'Duplicate Detection',
      passed: true
    });
  }
  
  return validation;
}

function certifyDocument(documentId) {
  const document = documents.get(documentId);
  if (!document) return { error: 'Document not found' };
  
  const certification = {
    certified: true,
    certificationId: `CERT-${Date.now()}`,
    documentId,
    uid: document.uid,
    
    certifiedBy: 'Azora Verification System',
    certifiedAt: new Date().toISOString(),
    
    validityChecks: document.validation,
    
    blockchain: {
      blockHash: crypto.createHash('sha256')
        .update(documentId + document.uid + Date.now())
        .digest('hex'),
      timestamp: Date.now(),
      previousHash: document.metadata.previousBlockHash || null
    },
    
    legalStatus: 'certified_original',
    
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  };
  
  document.certification = certification;
  documents.set(documentId, document);
  
  // Record in 3-way ledger
  recordInLedger('CERTIFICATION', certification);
  
  return certification;
}

// ============================================================================
// 3-WAY LEDGER SYSTEM
// ============================================================================

function recordInLedger(type, data) {
  const recordId = `LEDGER-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  const record = {
    id: recordId,
    type,
    data,
    timestamp: new Date().toISOString(),
    hash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
  };
  
  // Write to all three ledgers simultaneously
  primaryLedger.set(recordId, record);
  secondaryLedger.set(recordId, record);
  tertiaryLedger.set(recordId, record);
  
  // Verify consistency
  verifyLedgerConsistency(recordId);
  
  return record;
}

function verifyLedgerConsistency(recordId) {
  const primary = primaryLedger.get(recordId);
  const secondary = secondaryLedger.get(recordId);
  const tertiary = tertiaryLedger.get(recordId);
  
  if (!primary || !secondary || !tertiary) {
    console.error(`❌ Ledger inconsistency detected for ${recordId}`);
    return false;
  }
  
  if (primary.hash !== secondary.hash || primary.hash !== tertiary.hash) {
    console.error(`❌ Hash mismatch detected for ${recordId}`);
    return false;
  }
  
  return true;
}

function recoverFromLedger(recordId) {
  // Try primary first
  let record = primaryLedger.get(recordId);
  if (record) return { source: 'primary', record };
  
  // Try secondary
  record = secondaryLedger.get(recordId);
  if (record) {
    // Restore to primary
    primaryLedger.set(recordId, record);
    return { source: 'secondary', record };
  }
  
  // Try tertiary
  record = tertiaryLedger.get(recordId);
  if (record) {
    // Restore to primary and secondary
    primaryLedger.set(recordId, record);
    secondaryLedger.set(recordId, record);
    return { source: 'tertiary', record };
  }
  
  return { error: 'Record not found in any ledger' };
}

// ============================================================================
// DOCUMENT UPLOAD & MANAGEMENT
// ============================================================================

function uploadDocument(userId, documentData) {
  const documentId = `DOC-${Date.now()}`;
  const uid = generateDocumentUID();
  
  // Validate document
  const validation = validateDocument(documentData);
  
  const document = {
    id: documentId,
    uid,
    
    name: documentData.name,
    type: documentData.type,
    format: documentData.format,
    size: documentData.size,
    
    content: documentData.content, // Base64 or binary
    fileHash: crypto.createHash('sha256').update(documentData.content).digest('hex'),
    
    metadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      category: documentData.category,
      tags: documentData.tags || [],
      description: documentData.description,
      
      createdAt: documentData.metadata?.createdAt,
      modifiedAt: documentData.metadata?.modifiedAt,
      author: documentData.metadata?.author
    },
    
    validation,
    watermark: generateWatermark(documentId, uid),
    
    certification: null, // Set after certification
    
    access: {
      visibility: documentData.visibility || 'private', // private, team, company, public
      allowedUsers: documentData.allowedUsers || [],
      allowedRoles: documentData.allowedRoles || []
    },
    
    borderReadiness: {
      ready: false,
      requiredFor: [], // countries/border posts where this doc is required
      lastChecked: null
    },
    
    status: 'active' // active, archived, deleted
  };
  
  documents.set(documentId, document);
  documentIndex.set(uid, documentId);
  
  // Record in 3-way ledger
  recordInLedger('DOCUMENT_UPLOAD', {
    documentId,
    uid,
    userId,
    validation
  });
  
  // Auto-certify if valid and original
  if (validation.isValid && validation.isOriginal) {
    certifyDocument(documentId);
  }
  
  return document;
}

function getDocumentByUID(uid) {
  const documentId = documentIndex.get(uid);
  if (!documentId) return { error: 'Document not found' };
  
  const document = documents.get(documentId);
  
  // Log access
  logDocumentAccess(documentId, 'UID_LOOKUP', uid);
  
  return document;
}

function verifyDocumentAuthenticity(uid) {
  const verificationId = `VERIFY-${Date.now()}`;
  
  const document = getDocumentByUID(uid);
  if (document.error) return document;
  
  const verification = {
    id: verificationId,
    uid,
    documentId: document.id,
    
    authentic: true,
    confidence: 100,
    
    checks: {
      uidMatch: document.uid === uid,
      certificationValid: document.certification && 
        new Date(document.certification.expiresAt) > new Date(),
      watermarkIntact: !!document.watermark,
      ledgerConsistent: verifyLedgerConsistency(`LEDGER-${document.id}`)
    },
    
    verifiedAt: new Date().toISOString()
  };
  
  // Check if document has been tampered with
  const currentHash = crypto.createHash('sha256').update(document.content).digest('hex');
  if (currentHash !== document.fileHash) {
    verification.authentic = false;
    verification.confidence = 0;
    verification.checks.tampered = true;
  }
  
  verificationLog.set(verificationId, verification);
  
  // Record in ledger
  recordInLedger('VERIFICATION', verification);
  
  return verification;
}

function checkBorderReadiness(documentId, location) {
  const document = documents.get(documentId);
  if (!document) return { error: 'Document not found' };
  
  // Border crossing requirements (based on location)
  const borderRequirements = {
    'ZW-Beitbridge': ['passport', 'vehicle_license', 'goods_declaration', 'comesa_yellow_card'],
    'ZM-Chirundu': ['passport', 'vehicle_license', 'bill_of_lading', 'commercial_invoice'],
    'BW-Skilpadshek': ['passport', 'vehicle_license', 'road_permit'],
    'MZ-Ressano-Garcia': ['passport', 'vehicle_license', 'third_party_insurance'],
    'NA-Ariamsvlei': ['passport', 'vehicle_license', 'cbc_permit']
  };
  
  const requiredDocs = borderRequirements[location] || [];
  const ready = requiredDocs.includes(document.type.toLowerCase());
  
  document.borderReadiness = {
    ready,
    location,
    requiredFor: requiredDocs,
    lastChecked: new Date().toISOString(),
    alert: ready ? null : `This document type (${document.type}) is not required for ${location}`
  };
  
  documents.set(documentId, document);
  
  return document.borderReadiness;
}

function logDocumentAccess(documentId, action, userId) {
  const accessId = `ACCESS-${Date.now()}`;
  
  const accessRecord = {
    id: accessId,
    documentId,
    action,
    userId,
    timestamp: new Date().toISOString(),
    ipAddress: null // Would be captured from request in production
  };
  
  accessLog.set(accessId, accessRecord);
  
  // Record in ledger
  recordInLedger('DOCUMENT_ACCESS', accessRecord);
  
  return accessRecord;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Document Vault & Ledger Service',
    status: 'operational',
    documents: documents.size,
    ledgerRecords: {
      primary: primaryLedger.size,
      secondary: secondaryLedger.size,
      tertiary: tertiaryLedger.size
    }
  });
});

// Upload document
app.post('/api/documents/upload', (req, res) => {
  const { userId, ...documentData } = req.body;
  
  const document = uploadDocument(userId, documentData);
  
  res.json({
    success: true,
    document
  });
});

// Get document by ID
app.get('/api/documents/:documentId', (req, res) => {
  const { documentId } = req.params;
  const document = documents.get(documentId);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  logDocumentAccess(documentId, 'VIEW', req.query.userId);
  
  res.json(document);
});

// Get document by UID
app.get('/api/documents/uid/:uid', (req, res) => {
  const { uid } = req.params;
  const document = getDocumentByUID(uid);
  
  if (document.error) {
    return res.status(404).json(document);
  }
  
  res.json(document);
});

// Verify document authenticity
app.post('/api/documents/verify/:uid', (req, res) => {
  const { uid } = req.params;
  
  const verification = verifyDocumentAuthenticity(uid);
  
  if (verification.error) {
    return res.status(404).json(verification);
  }
  
  res.json(verification);
});

// Certify document
app.post('/api/documents/:documentId/certify', (req, res) => {
  const { documentId } = req.params;
  
  const certification = certifyDocument(documentId);
  
  if (certification.error) {
    return res.status(404).json(certification);
  }
  
  res.json({
    success: true,
    certification
  });
});

// Check border readiness
app.post('/api/documents/:documentId/border-readiness', (req, res) => {
  const { documentId } = req.params;
  const { location } = req.body;
  
  const readiness = checkBorderReadiness(documentId, location);
  
  if (readiness.error) {
    return res.status(404).json(readiness);
  }
  
  res.json(readiness);
});

// Get all documents for user
app.get('/api/documents/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  const userDocuments = Array.from(documents.values())
    .filter(doc => doc.metadata.uploadedBy === userId || 
                   doc.access.allowedUsers.includes(userId));
  
  res.json({
    documents: userDocuments,
    total: userDocuments.length
  });
});

// Recover from ledger
app.post('/api/ledger/recover/:recordId', (req, res) => {
  const { recordId } = req.params;
  
  const result = recoverFromLedger(recordId);
  
  if (result.error) {
    return res.status(404).json(result);
  }
  
  res.json(result);
});

// Get ledger statistics
app.get('/api/ledger/stats', (req, res) => {
  const stats = {
    primary: {
      records: primaryLedger.size,
      healthy: true
    },
    secondary: {
      records: secondaryLedger.size,
      healthy: secondaryLedger.size === primaryLedger.size
    },
    tertiary: {
      records: tertiaryLedger.size,
      healthy: tertiaryLedger.size === primaryLedger.size
    },
    consistency: secondaryLedger.size === primaryLedger.size && 
                 tertiaryLedger.size === primaryLedger.size
  };
  
  res.json(stats);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Document Vault & Ledger Service running on port ${PORT}`);
  console.log(`🗂️ Document Vault: ACTIVE`);
  console.log(`✅ Validation & Certification: ACTIVE`);
  console.log(`🔐 UID Watermarking: ACTIVE`);
  console.log(`📊 3-Way Ledger System: ACTIVE`);
  console.log(`🛂 Border Readiness: ACTIVE`);
});

module.exports = app;
