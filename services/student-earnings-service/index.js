/**
 * @file Student Earnings Service
 * @description Simplified interface for students to earn and withdraw tokens instantly
 */

const express = require('express');
const axios = require('axios');
const db = require('../south-african-compliance/database');

const app = express();
app.use(express.json());

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://sovereign-minter:4002';
const COMPLIANCE_SERVICE_URL = process.env.COMPLIANCE_SERVICE_URL || 'http://proof-of-compliance:4003';

/**
 * Initialize student wallet (called during onboarding)
 */
app.post('/api/students/:studentId/wallet/initialize', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { walletAddress, kycVerified = false, taxNumber } = req.body;

    await db.query(
      `INSERT INTO student_wallets (student_id, wallet_address, kyc_verified, tax_number)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id) DO NOTHING`,
      [studentId, walletAddress, kycVerified, taxNumber]
    );

    res.json({ success: true, message: 'Wallet initialized' });
  } catch (error) {
    console.error('Wallet initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize wallet' });
  }
});

/**
 * Simple endpoint for students to earn tokens (handles blockchain complexity)
 */
app.post('/api/students/:studentId/earn', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { activityType, metadata } = req.body;

    // Calculate tokens based on activity type
    const tokensMap = {
      'coursework_completion': 10,
      'quiz_passed': 5,
      'project_submission': 25,
      'peer_review': 3,
      'community_contribution': 15,
      'research_paper': 50,
      'hackathon_participation': 100
    };

    const tokensEarned = tokensMap[activityType] || 1;

    // Record in database with compliance
    const activity = await db.recordMintingActivity(
      studentId,
      activityType,
      tokensEarned,
      metadata
    );

    // Trigger blockchain minting in background (non-blocking)
    axios.post(`${BLOCKCHAIN_SERVICE_URL}/mint`, {
      recipient: studentId,
      amount: tokensEarned,
      activityId: activity.id
    }).catch(err => console.error('Blockchain mint error:', err));

    // Report to compliance service
    axios.post(`${COMPLIANCE_SERVICE_URL}/report`, {
      type: 'STUDENT_EARNING',
      studentId,
      amount: tokensEarned,
      activity: activityType
    }).catch(err => console.error('Compliance report error:', err));

    res.json({
      success: true,
      tokensEarned,
      message: `You earned ${tokensEarned} tokens for ${activityType}!`,
      activityId: activity.id
    });
  } catch (error) {
    console.error('Earning error:', error);
    res.status(500).json({ error: 'Failed to process earning' });
  }
});

/**
 * Instant withdrawal endpoint (blockchain complexity handled in background)
 */
app.post('/api/students/:studentId/withdraw', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { amount, destinationAccount, accountType = 'bank' } = req.body;

    // Process withdrawal with compliance checks
    const { withdrawalId, complianceCheck } = await db.processInstantWithdrawal(
      studentId,
      amount,
      destinationAccount
    );

    // Initiate blockchain transfer in background
    axios.post(`${BLOCKCHAIN_SERVICE_URL}/transfer`, {
      from: studentId,
      to: destinationAccount,
      amount,
      withdrawalId
    }).then(async (response) => {
      // Update withdrawal with blockchain hash
      await db.query(
        `UPDATE instant_withdrawals 
         SET blockchain_tx_hash = $1, status = 'completed', processed_at = NOW()
         WHERE id = $2`,
        [response.data.txHash, withdrawalId]
      );

      // Update wallet balances
      await db.query(
        `UPDATE student_wallets 
         SET pending_balance = pending_balance - $1
         WHERE student_id = $2`,
        [amount, studentId]
      );
    }).catch(async (err) => {
      console.error('Blockchain transfer error:', err);
      // Rollback withdrawal on failure
      await db.query(
        `UPDATE instant_withdrawals SET status = 'failed' WHERE id = $1`,
        [withdrawalId]
      );
      await db.query(
        `UPDATE student_wallets 
         SET balance = balance + $1, pending_balance = pending_balance - $1
         WHERE student_id = $2`,
        [amount, studentId]
      );
    });

    res.json({
      success: true,
      message: `Withdrawal of ${amount} tokens initiated!`,
      withdrawalId,
      estimatedArrival: accountType === 'bank' ? '2-3 business days' : 'Instant',
      complianceStatus: complianceCheck.amount_check
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get student balance and earnings (simple view)
 */
app.get('/api/students/:studentId/dashboard', async (req, res) => {
  try {
    const { studentId } = req.params;
    const summary = await db.getStudentEarningsSummary(studentId);

    res.json({
      availableBalance: summary.balance,
      pendingWithdrawals: summary.pending_balance,
      totalEarned: summary.total_earned,
      totalWithdrawn: summary.total_withdrawn,
      activitiesCompleted: summary.total_minting_activities,
      canWithdraw: summary.kyc_verified,
      kycStatus: summary.kyc_verified ? 'Verified' : 'Pending'
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'student-earnings' });
});

const PORT = process.env.PORT || 4700;
app.listen(PORT, async () => {
  await db.initStudentEarningsTables();
  console.log(`✅ Student Earnings Service running on port ${PORT}`);
});

module.exports = app;