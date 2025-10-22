/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS - Document Verification Service
 * 
 * Blockchain-backed document verification with UID tracking, watermarking, originality checking,
 * tamper-proof 3-way ledger system (blockchain + database + audit log).
 * Customs integration with geofenced alerts for border crossings.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

const PORT = process.env.VERIFY_PORT || 8096;

// ============================================================================
// DATA STORES (3-WAY LEDGER SYSTEM)
// ============================================================================

// Ledger 1: Blockchain (immutable hash chain)
const blockchain = [];

// Ledger 2: Database (queryable document store)
const documents = new Map(); // docUID -> document metadata + content hash

// Ledger 3: Audit Log (all operations timestamped)
const auditLog = [];

// Supporting data structures
const verifications = new Map(); // verificationId -> verification record
const geofences = new Map(); // geofenceId -> geofence definition
const alerts = new Map(); // alertId -> geofenced alert

// ============================================================================
// BLOCKCHAIN IMPLEMENTATION (Tamper-Proof Chain)
// ============================================================================

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty = 2) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

function createGenesisBlock() {
  return new Block(0, new Date().toISOString(), { type: 'genesis', message: 'Azora Document Chain Genesis' }, '0');
}

// Initialize blockchain
if (blockchain.length === 0) {
  blockchain.push(createGenesisBlock());
}

function addBlockToChain(data) {
  const previousBlock = blockchain[blockchain.length - 1];
  const newBlock = new Block(
    blockchain.length,
    new Date().toISOString(),
    data,
    previousBlock.hash
  );
  newBlock.mineBlock(2); // Proof of work
  blockchain.push(newBlock);
  return newBlock;
}

function verifyChainIntegrity() {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    if (currentBlock.hash !== currentBlock.calculateHash()) {
      return { valid: false, error: `Block ${i} has been tampered with` };
    }

    if (currentBlock.previousHash !== previousBlock.hash) {
      return { valid: false, error: `Chain broken at block ${i}` };
    }
  }
  return { valid: true, message: 'Blockchain integrity verified' };
}

// ============================================================================
// UID GENERATION (Unique Document Identifier)
// ============================================================================

function generateDocumentUID(docType, userId, timestamp) {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const typeCode = docType.substring(0, 3).toUpperCase();
  const date = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
  return `AZ-${typeCode}-${date}-${random}`;
}

// ============================================================================
// DOCUMENT WATERMARKING
// ============================================================================

function generateWatermark(docUID, ownerName, timestamp) {
  return {
    logo: 'AZORA_LOGO_BASE64_HERE', // Base64 encoded Azora logo
    uid: docUID,
    owner: ownerName,
    timestamp,
    verification: `Verified by Azora OS - verify at https://azora.world/verify/${docUID}`,
    qrCode: generateQRCode(docUID)
  };
}

function generateQRCode(docUID) {
  // In production, use a QR code library
  return `QR_CODE_DATA_${docUID}`;
}

// ============================================================================
// DOCUMENT ORIGINALITY VERIFICATION
// ============================================================================

function checkDocumentOriginality(fileBuffer) {
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  // Check against existing documents
  for (const [uid, doc] of documents) {
    if (doc.contentHash === fileHash) {
      return {
        original: false,
        match: uid,
        message: `Document already exists with UID: ${uid}`,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt
      };
    }
  }

  return {
    original: true,
    contentHash: fileHash,
    message: 'Document is original'
  };
}

// ============================================================================
// 3-WAY LEDGER SYSTEM
// ============================================================================

function recordToLedgers(operation, data) {
  const timestamp = new Date().toISOString();
  
  // Ledger 1: Blockchain (immutable)
  const blockData = {
    operation,
    docUID: data.docUID,
    hash: data.contentHash || data.hash,
    timestamp,
    actor: data.actor
  };
  const block = addBlockToChain(blockData);
  
  // Ledger 2: Database (queryable)
  if (operation === 'UPLOAD' || operation === 'UPDATE') {
    documents.set(data.docUID, {
      ...data,
      blockchainIndex: block.index,
      ledgerTimestamp: timestamp
    });
  }
  
  // Ledger 3: Audit Log (detailed history)
  auditLog.push({
    id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    operation,
    docUID: data.docUID,
    actor: data.actor,
    timestamp,
    blockchainIndex: block.index,
    details: data
  });

  return {
    blockchainIndex: block.index,
    blockHash: block.hash,
    ledgerTimestamp: timestamp
  };
}

// ============================================================================
// DOCUMENT UPLOAD & VERIFICATION
// ============================================================================

function uploadDocument(docType, userId, userName, fileBuffer, metadata) {
  const timestamp = new Date().toISOString();
  
  // Check originality
  const originalityCheck = checkDocumentOriginality(fileBuffer);
  if (!originalityCheck.original) {
    return {
      success: false,
      error: 'Document already exists',
      existingUID: originalityCheck.match
    };
  }

  // Generate UID
  const docUID = generateDocumentUID(docType, userId, timestamp);

  // Generate watermark
  const watermark = generateWatermark(docUID, userName, timestamp);

  // Create document record
  const document = {
    docUID,
    docType,
    uploadedBy: userId,
    uploadedByName: userName,
    uploadedAt: timestamp,
    contentHash: originalityCheck.contentHash,
    metadata: {
      ...metadata,
      fileSize: fileBuffer.length,
      fileType: metadata.fileType || 'application/pdf'
    },
    watermark,
    status: 'verified',
    verifications: [],
    accessLog: []
  };

  // Record to all 3 ledgers
  const ledgerReceipt = recordToLedgers('UPLOAD', {
    docUID,
    contentHash: originalityCheck.contentHash,
    actor: userName
  });

  document.ledgerReceipt = ledgerReceipt;

  return {
    success: true,
    document,
    verificationUrl: `https://azora.world/verify/${docUID}`
  };
}

// ============================================================================
// DOCUMENT VERIFICATION (BY UID)
// ============================================================================

function verifyDocumentByUID(docUID, verifierInfo) {
  const document = documents.get(docUID);
  
  if (!document) {
    return {
      verified: false,
      error: 'Document not found',
      message: 'UID does not exist in Azora system'
    };
  }

  // Verify blockchain integrity
  const chainIntegrity = verifyChainIntegrity();
  if (!chainIntegrity.valid) {
    return {
      verified: false,
      error: 'Blockchain integrity compromised',
      message: chainIntegrity.error
    };
  }

  // Verify document block
  const block = blockchain[document.ledgerReceipt.blockchainIndex];
  if (!block || block.data.docUID !== docUID) {
    return {
      verified: false,
      error: 'Document not found in blockchain',
      message: 'Document may have been tampered with'
    };
  }

  // Record verification
  const verificationId = `ver_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const verification = {
    id: verificationId,
    docUID,
    verifiedBy: verifierInfo.name,
    verifierOrg: verifierInfo.organization,
    verifiedAt: new Date().toISOString(),
    result: 'authentic',
    blockchainVerified: true
  };

  document.verifications.push(verification);
  verifications.set(verificationId, verification);

  // Record to audit log
  recordToLedgers('VERIFY', {
    docUID,
    actor: verifierInfo.name,
    verificationId
  });

  return {
    verified: true,
    document: {
      uid: document.docUID,
      type: document.docType,
      uploadedBy: document.uploadedByName,
      uploadedAt: document.uploadedAt,
      watermark: document.watermark,
      verifications: document.verifications.length
    },
    verification,
    blockchainIntegrity: chainIntegrity,
    message: 'Document is authentic and has not been tampered with'
  };
}

// ============================================================================
// GEOFENCED ALERTS (Border Crossings, Customs)
// ============================================================================

function createGeofence(name, type, coordinates, radius, requiredDocs) {
  const geofenceId = `geo_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  const geofence = {
    id: geofenceId,
    name,
    type, // 'border', 'customs', 'weigh_station', 'rest_area'
    coordinates: { lat: coordinates.lat, lng: coordinates.lng },
    radiusMeters: radius,
    requiredDocuments: requiredDocs,
    active: true,
    createdAt: new Date().toISOString()
  };

  geofences.set(geofenceId, geofence);
  return geofence;
}

function checkGeofenceCompliance(vehicleLocation, vehicleDocuments) {
  const alertsTriggered = [];

  geofences.forEach(geofence => {
    if (!geofence.active) return;

    // Calculate distance from vehicle to geofence
    const distance = calculateDistance(
      vehicleLocation.lat,
      vehicleLocation.lng,
      geofence.coordinates.lat,
      geofence.coordinates.lng
    );

    // Check if vehicle is approaching (within 10km) or inside geofence
    if (distance <= 10000) {
      const missingDocs = [];
      
      geofence.requiredDocuments.forEach(docType => {
        const hasDoc = vehicleDocuments.some(doc => doc.docType === docType && doc.status === 'verified');
        if (!hasDoc) {
          missingDocs.push(docType);
        }
      });

      if (missingDocs.length > 0) {
        const alertId = `alert_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const alert = {
          id: alertId,
          type: 'DOCUMENT_MISSING',
          severity: distance <= geofence.radiusMeters ? 'critical' : 'warning',
          geofence: geofence.name,
          distance: distance,
          distanceFormatted: `${(distance / 1000).toFixed(1)} km`,
          missingDocuments: missingDocs,
          message: distance <= geofence.radiusMeters 
            ? `You are at ${geofence.name}. Missing documents: ${missingDocs.join(', ')}`
            : `Approaching ${geofence.name} (${(distance / 1000).toFixed(1)} km away). Prepare: ${missingDocs.join(', ')}`,
          timestamp: new Date().toISOString()
        };

        alerts.set(alertId, alert);
        alertsTriggered.push(alert);
      }
    }
  });

  return alertsTriggered;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ============================================================================
// SEED SADC BORDER GEOFENCES
// ============================================================================

function seedBorderGeofences() {
  // Beitbridge Border (South Africa <-> Zimbabwe)
  createGeofence(
    'Beitbridge Border Post',
    'border',
    { lat: -22.2167, lng: 30.0000 },
    2000,
    ['passport', 'vehicle_license', 'cof', 'goods_declaration', 'comesa_yellow_card', 'sad500', 'bill_of_lading']
  );

  // Kazungula Border (Botswana <-> Zambia)
  createGeofence(
    'Kazungula Border Post',
    'border',
    { lat: -17.7833, lng: 25.2667 },
    2000,
    ['passport', 'vehicle_license', 'cof', 'sad500', 'comesa_yellow_card', 'certificate_of_origin']
  );

  // Ressano Garcia Border (South Africa <-> Mozambique)
  createGeofence(
    'Ressano Garcia / Lebombo Border',
    'border',
    { lat: -25.4333, lng: 31.9833 },
    2000,
    ['passport', 'vehicle_license', 'third_party_insurance', 'sad500', 'manifesto_de_carga']
  );

  // Skilpadshek Border (South Africa <-> Botswana)
  createGeofence(
    'Skilpadshek Border Post',
    'border',
    { lat: -25.9667, lng: 25.6167 },
    2000,
    ['passport', 'vehicle_license', 'road_permit', 'sad500', 'bill_of_lading']
  );

  console.log('✅ Seeded 4 SADC border geofences');
}

seedBorderGeofences();

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Document Verification Service',
    status: 'operational',
    documents: documents.size,
    blockchainBlocks: blockchain.length,
    geofences: geofences.size,
    auditLogEntries: auditLog.length
  });
});

// Upload document
app.post('/api/documents/upload', (req, res) => {
  const { docType, userId, userName, fileBuffer, metadata } = req.body;

  // Convert base64 to buffer if needed
  const buffer = Buffer.from(fileBuffer, 'base64');

  const result = uploadDocument(docType, userId, userName, buffer, metadata);

  if (!result.success) {
    return res.status(409).json(result);
  }

  res.json(result);
});

// Verify document by UID
app.post('/api/documents/verify/:uid', (req, res) => {
  const { uid } = req.params;
  const verifierInfo = req.body;

  const result = verifyDocumentByUID(uid, verifierInfo);

  if (!result.verified) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// Get document by UID
app.get('/api/documents/:uid', (req, res) => {
  const { uid } = req.params;
  const document = documents.get(uid);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Record access
  document.accessLog.push({
    accessedAt: new Date().toISOString(),
    accessedBy: req.query.userId || 'anonymous'
  });

  res.json(document);
});

// Get user's documents
app.get('/api/documents/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userDocs = [];

  documents.forEach(doc => {
    if (doc.uploadedBy === userId) {
      userDocs.push({
        uid: doc.docUID,
        type: doc.docType,
        uploadedAt: doc.uploadedAt,
        status: doc.status,
        verifications: doc.verifications.length,
        watermark: doc.watermark
      });
    }
  });

  res.json({
    userId,
    documentCount: userDocs.length,
    documents: userDocs
  });
});

// Check geofence compliance
app.post('/api/geofence/check', (req, res) => {
  const { vehicleLocation, vehicleDocuments } = req.body;

  const alerts = checkGeofenceCompliance(vehicleLocation, vehicleDocuments);

  res.json({
    location: vehicleLocation,
    alertsCount: alerts.length,
    alerts,
    compliant: alerts.length === 0
  });
});

// Get all geofences
app.get('/api/geofences', (req, res) => {
  const allGeofences = Array.from(geofences.values());
  res.json({
    count: allGeofences.length,
    geofences: allGeofences
  });
});

// Verify blockchain integrity
app.get('/api/blockchain/verify', (req, res) => {
  const result = verifyChainIntegrity();
  res.json({
    ...result,
    blocks: blockchain.length,
    latestBlock: blockchain[blockchain.length - 1]
  });
});

// Get audit log
app.get('/api/audit/log', (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  const logs = auditLog.slice(offset, offset + parseInt(limit));

  res.json({
    total: auditLog.length,
    offset: parseInt(offset),
    limit: parseInt(limit),
    logs
  });
});

// Get document audit trail
app.get('/api/audit/document/:uid', (req, res) => {
  const { uid } = req.params;
  const trail = auditLog.filter(log => log.docUID === uid);

  res.json({
    docUID: uid,
    eventCount: trail.length,
    trail
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Document Verification Service running on port ${PORT}`);
  console.log(`🔗 3-Way Ledger System: ACTIVE`);
  console.log(`   - Blockchain: ${blockchain.length} blocks`);
  console.log(`   - Database: ${documents.size} documents`);
  console.log(`   - Audit Log: ${auditLog.length} entries`);
  console.log(`🌍 Geofenced Alerts: ${geofences.size} zones monitored`);
  console.log(`🔐 Document Watermarking: ACTIVE`);
  console.log(`✓ UID Tracking: ACTIVE`);
});

module.exports = app;

// Additional signing endpoint for document signatures
app.post('/api/sign', (req, res) => {
  const { documentId, signerId } = req.body;
  const signaturePayload = `${documentId}|${signerId}|${new Date().toISOString()}`;
  const signature = crypto.createHmac('sha256', 'azora-secret-key').update(signaturePayload).digest('hex');
  
  res.status(201).json({
    message: 'Document signed successfully.',
    signature: `sig-${signature}`
  });
});
