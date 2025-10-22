/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Azora OS Instant Withdrawal Service
 * 
 * Allows founders to instantly withdraw their tokens with:
 * - 40% personal withdrawal
 * - 60% reinvestment to Azora
 * - Instant South African bank transfers
 * - Blockchain transaction recording
 * - Constitutional compliance verification
 * - South African regulatory adherence
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const router = express.Router();

// Constants
const TOKEN_VALUE_USD = 10; // Constitutionally guaranteed value

// File paths
const DATA_DIR = path.join(__dirname, 'data');
const BANKS_FILE = path.join(DATA_DIR, 'sa_banks.json');
const WITHDRAWALS_FILE = path.join(DATA_DIR, 'withdrawals.json');
const COMPLIANCE_FILE = path.join(DATA_DIR, 'compliance_records.json');
const CONSTITUTION_FILE = path.join(DATA_DIR, 'constitution_hash.json');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit_log.json');

// Mock SA bank integration (kept simple for dev)
const saBankApi = {
  processPayment: async (bankDetails, amount, reference) => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, transactionId: `SA-${Date.now()}`, timestamp: new Date().toISOString(), amount, reference };
  },
  verifyAccount: async (bankDetails) => {
    await new Promise(r => setTimeout(r, 300));
    return { verified: true, accountName: bankDetails.accountHolder || 'Unknown', bankName: bankDetails.bankName || 'Unknown' };
  }
};

// South African Financial Intelligence Centre Act (FICA) compliance mock
const ficaCompliance = {
  verifyStatus: async (founderId) => {
    await new Promise(r => setTimeout(r, 300));
    return { verified: true, level: 'full', lastVerified: new Date().toISOString() };
  },
  recordTransaction: async (founderId, amount, bankDetails) => {
    await new Promise(r => setTimeout(r, 200));
    return { reported: true, referenceId: `FICA-${Date.now()}` };
  }
};

async function init() {
  // Create data directory
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  // Initialize bank data
  try {
    await fs.access(BANKS_FILE);
  } catch (err) {
    const banks = [
      { id: 'fnb', name: 'First National Bank', code: '250655' },
      { id: 'absa', name: 'ABSA', code: '632005' },
      { id: 'standard', name: 'Standard Bank', code: '051001' },
      { id: 'nedbank', name: 'Nedbank', code: '198765' },
      { id: 'capitec', name: 'Capitec', code: '470010' }
    ];
    await fs.writeFile(BANKS_FILE, JSON.stringify(banks, null, 2));
  }
  
  // Initialize withdrawals
  try {
    await fs.access(WITHDRAWALS_FILE);
  } catch (err) {
    await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify([], null, 2));
  }
  
  // Initialize compliance records
  try {
    await fs.access(COMPLIANCE_FILE);
  } catch (err) {
    await fs.writeFile(COMPLIANCE_FILE, JSON.stringify({}, null, 2));
  }
  
  // Initialize constitution hash record
  try {
    await fs.access(CONSTITUTION_FILE);
  } catch (err) {
    const constitutionHash = {
      currentVersion: "1.0",
      hash: "f7a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0", // Hash of constitution document
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(CONSTITUTION_FILE, JSON.stringify(constitutionHash, null, 2));
  }
  
  // Initialize audit log
  try {
    await fs.access(AUDIT_LOG_FILE);
  } catch (err) {
    await fs.writeFile(AUDIT_LOG_FILE, JSON.stringify([], null, 2));
  }
}

function calculateZarAmount(tokens) {
  const usdPerToken = TOKEN_VALUE_USD; // Constitutionally guaranteed value
  const usdZarRate = 18.5; // dev constant - in production would use real-time forex
  return tokens * usdPerToken * usdZarRate;
}

async function createBlockchainTransaction(founderId, tokens, withdrawalId) {
  try {
    const payload = {
      type: 'FOUNDER_WITHDRAWAL',
      data: {
        founderId,
        tokens,
        withdrawalId,
        split: { personal: 0.4, reinvestment: 0.6 }, // Constitutional requirement
        tokenValue: TOKEN_VALUE_USD,
        timestamp: new Date().toISOString()
      }
    };
    const res = await axios.post('http://localhost:5001/api/transactions', payload, { timeout: 5000 });
    return res.data;
  } catch (err) {
    throw new Error('Failed to record transaction on blockchain: ' + (err.message || 'unknown'));
  }
}

// Log to audit trail
async function logToAudit(action, details) {
  try {
    const auditLog = JSON.parse(await fs.readFile(AUDIT_LOG_FILE, 'utf8'));
    auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      hash: crypto.createHash('sha256').update(JSON.stringify({action, details, timestamp: Date.now()})).digest('hex')
    });
    await fs.writeFile(AUDIT_LOG_FILE, JSON.stringify(auditLog, null, 2));
  } catch (err) {
    console.error('Failed to write to audit log:', err);
  }
}

// Check founder compliance status
async function checkFounderCompliance(founderId) {
  try {
    const complianceRecords = JSON.parse(await fs.readFile(COMPLIANCE_FILE, 'utf8'));
    const founderRecord = complianceRecords[founderId];
    
    if (!founderRecord) {
      return {
        compliant: false,
        reason: 'No compliance record found for founder'
      };
    }
    
    // Check if attestation is current
    const attestationAge = Date.now() - new Date(founderRecord.lastAttestation).getTime();
    const maxAttestationAge = 90 * 24 * 60 * 60 * 1000; // 90 days
    
    if (attestationAge > maxAttestationAge) {
      return {































































































































































































































































































































































































































































module.exports = router;init().catch(e => console.error('instant-withdraw init error', e));// Initialize on load});  }    res.status(500).json({ error: 'Failed to get constitution hash' });    console.error('Error getting constitution hash:', err);  } catch (err) {    });      lastUpdated: constitution.lastUpdated      hash: constitution.hash,      version: constitution.currentVersion,    res.json({        const constitution = JSON.parse(await fs.readFile(CONSTITUTION_FILE, 'utf8'));  try {router.get('/constitution', async (req, res) => {// GET /constitution - Get current constitution hash for attestation});  }    res.status(500).json({ error: 'Failed to access audit log' });    console.error('Error accessing audit log:', err);  } catch (err) {    });      entries: founderAudit      founderId,    res.json({        });      timestamp: new Date().toISOString()      accessedBy: req.query.adminId || 'unknown',      founderId,    await logToAudit('AUDIT_LOG_ACCESS', {        );      entry.details && entry.details.founderId === founderId    const founderAudit = auditLog.filter(entry =>     const auditLog = JSON.parse(await fs.readFile(AUDIT_LOG_FILE, 'utf8'));        }      return res.status(403).json({ error: 'Unauthorized access to audit log' });    if (!isAdmin) {        const isAdmin = req.query.adminToken === 'ADMIN_SECRET'; // This is for demo only!    const { founderId } = req.params;    // In production, would check admin permissions here  try {router.get('/audit-log/:founderId', async (req, res) => {// GET /audit-log/:founderId - Get audit log for a founder (requires admin)});  }    res.status(500).json({ error: 'Failed to read withdrawal history' });    console.error('Error getting withdrawal history:', err);  } catch (err) {    });      withdrawals: result      count: result.length,      founderId,    res.json({        });      count: result.length      timestamp: new Date().toISOString(),      ip: req.ip,      founderId,    await logToAudit('WITHDRAWAL_HISTORY_ACCESS', {    // Log history access to audit trail        const result = withdrawals.filter(w => w.founderId === founderId);    const withdrawals = JSON.parse(raw || '[]');    const raw = await fs.readFile(WITHDRAWALS_FILE, 'utf8');    const { founderId } = req.params;  try {router.get('/history/:founderId', async (req, res) => {// GET /history/:founderId - Get withdrawal history for a founder});  }    res.status(500).json({ error: 'Failed to process withdrawal', details: err.message });    console.error('Error processing withdrawal:', err);  } catch (err) {    });      }        total: tokens * TOKEN_VALUE_USD        perToken: TOKEN_VALUE_USD,      guaranteedValue: {      withdrawal,      message: 'Withdrawal processed successfully and constitutionally compliant',      success: true,     res.json({     });      bankName: bankDetails.bankName      zarAmount,      reinvestTokens,      personalTokens,      tokens,      withdrawalId: withdrawal.id,      founderId,    await logToAudit('WITHDRAWAL_COMPLETED', {    // Log to audit trail    }      });        blockchainError: err.message         withdrawal,         warning: 'Withdrawal completed but blockchain recording failed',         success: true,       return res.status(200).json({             });        error: err.message        withdrawalId: withdrawal.id,        founderId,      await logToAudit('BLOCKCHAIN_RECORDING_FAILED', {      // don't fail the withdrawal if blockchain recording fails; return warning    } catch (err) {      await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));      // Update withdrawal record with blockchain tx              (tx.transactionId || null);        tx.transaction.id || tx.transaction.hash || null :       withdrawal.blockchainTx = tx.transaction ?       const tx = await createBlockchainTransaction(founderId, tokens, withdrawal.id);    try {    // Record on blockchain (best-effort)    await fs.writeFile(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));    withdrawals.push(withdrawal);    const withdrawals = JSON.parse(raw || '[]');    const raw = await fs.readFile(WITHDRAWALS_FILE, 'utf8');    // Save withdrawal    };      timestamp: new Date().toISOString()      blockchainTx: null,      constitutionallyCompliant: true,      status: 'completed',      ficaReference: ficaReport.referenceId,      payment,      },        accountNumber: bankDetails.accountNumber && bankDetails.accountNumber.slice(-4) // Only store last 4 digits        bankName: bankDetails.bankName,       bankDetails: {       zarAmount,      tokenValue: TOKEN_VALUE_USD,      reinvestTokens,      personalTokens,      tokens,      founderId,      id: uuidv4(),    const withdrawal = {    // Create withdrawal record    );      }        accountNumber: bankDetails.accountNumber && bankDetails.accountNumber.slice(-4) // Only store last 4 digits for logging        accountType: bankDetails.accountType,        bank: bankDetails.bankName,      {      zarAmount,      founderId,    const ficaReport = await ficaCompliance.recordTransaction(    // Record FICA transaction    );      `AZORA-${founderId.substring(0,8)}`      zarAmount,       bankDetails,     const payment = await saBankApi.processPayment(    const zarAmount = calculateZarAmount(personalTokens);    // Process bank payment (personal portion only)    }      });        details: verify         error: 'Bank verification failed',       return res.status(400).json({             });        }          accountType: bankDetails.accountType          bank: bankDetails.bankName,        bankDetails: {        founderId,      await logToAudit('BANK_VERIFICATION_FAILED', {    if (!verify.verified) {    const verify = await saBankApi.verifyAccount(bankDetails);    // Verify bank account    }      });        }          ratio: personalTokens / tokens          reinvestment: reinvestTokens,          personal: personalTokens,        provided: {        details: 'Constitutional requirement: 40% personal, 60% reinvestment',        error: 'Invalid token split ratio',      return res.status(400).json({    if (Math.abs((personalTokens / tokens) - 0.4) > 0.01) { // Allow 1% tolerance for rounding        const reinvestTokens = tokens - personalTokens;    const personalTokens = Math.floor(tokens * 0.4);    // Verify split compliance (40/60 rule)    }      }        });          available: founderAllocation.remaining.personal           error: 'Insufficient personal allocation',         return res.status(400).json({       if (tokens > founderAllocation.remaining.personal) {    if (founderAllocation && founderAllocation.remaining && typeof founderAllocation.remaining.personal === 'number') {    // Basic allocation check: ensure tokens <= available personal allocation if founderAllocation provided        }      });        resolution: 'Please attest to the latest constitution before withdrawal'        provided: constitutionVersion,        current: constitution.currentVersion,        error: 'Outdated constitution version',      return res.status(400).json({    if (constitutionVersion !== constitution.currentVersion) {    const constitution = JSON.parse(await fs.readFile(CONSTITUTION_FILE, 'utf8'));    // Verify constitution version        }      });        resolution: 'Please complete all compliance requirements before attempting withdrawal'        details: complianceStatus,        error: 'Founder is not constitutionally compliant',      return res.status(403).json({            });        tokens        details: complianceStatus,        reason: 'Non-compliant',        founderId,      await logToAudit('WITHDRAWAL_REJECTED', {    if (!complianceStatus.compliant) {        const complianceStatus = await checkFounderCompliance(founderId);    // Check constitutional compliance        }      return res.status(400).json({ error: 'Missing required fields' });    if (!founderId || !bankDetails || !tokens) {    // Validate required fields        const { founderId, bankDetails, tokens, founderAllocation, constitutionVersion } = req.body;  try {router.post('/process', async (req, res) => {// POST /process - Process withdrawal});  }    res.status(500).json({ error: 'Failed to check compliance status' });    console.error('Error checking compliance:', err);  } catch (err) {    });      ...status      founderId,    res.json({        });      timestamp: new Date().toISOString()      status,      founderId,    await logToAudit('COMPLIANCE_CHECK', {        const status = await checkFounderCompliance(founderId);    const { founderId } = req.params;  try {router.get('/compliance/:founderId', async (req, res) => {// GET /compliance/:founderId - Check compliance status});  }    res.status(500).json({ error: 'Failed to process FICA verification' });    console.error('Error processing FICA verification:', err);  } catch (err) {    });      ficaStatus      message: 'FICA verification successful',      success: true,    res.json({        });      timestamp: new Date().toISOString()      status: ficaStatus,      founderId,    await logToAudit('FICA_VERIFICATION', {        });      ficaStatus: ficaStatus      ficaCompliant: true,    const updated = await updateComplianceRecord(founderId, {    // Update compliance record        }      });        details: ficaStatus        error: 'FICA verification failed',      return res.status(400).json({    if (!ficaStatus.verified) {        const ficaStatus = await ficaCompliance.verifyStatus(founderId);    // For demo, we'll mock the verification    // In production, we'd verify real documents here        }      return res.status(400).json({ error: 'Missing required FICA verification fields' });    if (!founderId || !documents) {        const { founderId, documents } = req.body;  try {router.post('/fica-verification', async (req, res) => {// POST /fica-verification - Verify FICA compliance});  }    res.status(500).json({ error: 'Failed to process attestation' });    console.error('Error processing attestation:', err);  } catch (err) {    });      }        expiresAt: new Date(new Date(updated.lastAttestation).getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString()        version: updated.constitutionVersion,        timestamp: updated.lastAttestation,      attestation: {      message: 'Constitutional attestation recorded',      success: true,    res.json({        });      timestamp: new Date().toISOString()      constitutionVersion: constitution.currentVersion,      founderId,    await logToAudit('CONSTITUTION_ATTESTATION', {        });      constitutionVersion: constitution.currentVersion      lastAttestation: new Date().toISOString(),    const updated = await updateComplianceRecord(founderId, {    // Update compliance record with attestation        }      });        message: 'The constitution has been updated. Please review the latest version.'        error: 'Invalid constitution hash',      return res.status(400).json({    if (constitutionHash !== constitution.hash) {        const constitution = JSON.parse(await fs.readFile(CONSTITUTION_FILE, 'utf8'));    // Verify the constitution hash matches current version        }      return res.status(400).json({ error: 'Missing required attestation fields' });    if (!founderId || !constitutionHash || !acceptedTerms) {        const { founderId, constitutionHash, acceptedTerms } = req.body;  try {router.post('/attest', async (req, res) => {// POST /attest - Attest to constitution});  }    res.status(500).json({ error: 'Failed to read banks' });    console.error('Error getting banks:', err);  } catch (err) {    await logToAudit('BANKS_LIST_ACCESS', { ip: req.ip });    res.json(JSON.parse(data));    const data = await fs.readFile(BANKS_FILE, 'utf8');  try {router.get('/banks', async (req, res) => {// GET /banks - List all supported South African banks// Routes}  }    throw new Error('Failed to update compliance record');    console.error('Error updating compliance record:', err);  } catch (err) {    return complianceRecords[founderId];    await fs.writeFile(COMPLIANCE_FILE, JSON.stringify(complianceRecords, null, 2));        };      lastUpdated: new Date().toISOString()      ...update,      ...complianceRecords[founderId],    complianceRecords[founderId] = {    // Update with new data        }      };        withdrawalViolations: []        ficaCompliant: false,        createdAt: new Date().toISOString(),        id: founderId,      complianceRecords[founderId] = {    if (!complianceRecords[founderId]) {    // Create record if it doesn't exist        const complianceRecords = JSON.parse(await fs.readFile(COMPLIANCE_FILE, 'utf8'));  try {async function updateComplianceRecord(founderId, update) {// Update founder compliance record}  }    throw new Error('Failed to verify compliance status');    console.error('Error checking founder compliance:', err);  } catch (err) {    };      ficaStatus: founderRecord.ficaStatus      lastAttestation: founderRecord.lastAttestation,      compliant: true,    return {         }      };        violations: founderRecord.withdrawalViolations        reason: 'Previous withdrawal violations must be addressed',        compliant: false,      return {    if (founderRecord.withdrawalViolations && founderRecord.withdrawalViolations.length > 0) {    // Check for previous withdrawal violations        }      };        reason: 'FICA compliance not verified'        compliant: false,      return {    if (!founderRecord.ficaCompliant) {    // Check FICA compliance        }      };        lastAttestation: founderRecord.lastAttestation        reason: 'Constitution attestation has expired (required every 90 days)',        compliant: false,