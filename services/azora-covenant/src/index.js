/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// index.ts
const express_1 = __importDefault(require("express"));
const ledgerService_1 = __importDefault(require("./ledgerService"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
// --- User/Auth Routes (Simplified) ---
// In a real app, 'req.userId' would come from a JWT or session middleware
app.post('/register', async (req, res) => {
    const { email, role } = req.body;
    try {
        const user = await ledgerService_1.default.createUser(email, role);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ error: 'User already exists' });
    }
});
// --- Wallet Endpoints ---
app.get('/balance', async (req, res) => {
    // const userId = req.user.id; // From auth middleware
    const { userId } = req.query; // Using query param for testing
    if (!userId)
        return res.status(400).json({ error: 'userId is required' });
    const balance = await ledgerService_1.default.getBalance(userId);
    res.json({ userId, azoraBalance: balance });
});
app.get('/history', async (req, res) => {
    // const userId = req.user.id; // From auth middleware
    const { userId } = req.query; // Using query param for testing
    if (!userId)
        return res.status(400).json({ error: 'userId is required' });
    const history = await ledgerService_1.default.getHistory(userId);
    res.json(history);
});
/**
 * Your "Instant Withdrawal" Endpoint
 * This is now fully ledger-backed.
 */
app.post('/withdraw', async (req, res) => {
    // const userId = req.user.id; // From auth middleware
    const { userId, amount } = req.body;
    if (amount <= 0) {
        return res.status(400).json({ error: 'Withdrawal amount must be positive' });
    }
    try {
        const { transaction, newBalance } = await ledgerService_1.default.requestWithdrawal(userId, amount);
        // The payout is now processing in the background
        res.status(202).json({
            message: 'Withdrawal initiated. Payout is processing.',
            transactionId: transaction.id,
            status: transaction.status,
            newBalance,
        });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// --- Admin & Webhook Routes (Must be protected!) ---
/**
 * Endpoint to be called by your payment provider (Stripe, etc.)
 * when a user successfully deposits $1.
 * This Mints 1 AZR.
 */
app.post('/webhooks/deposit-successful', async (req, res) => {
    // TODO: Verify webhook signature!
    const { userId, amountUsd, chargeId } = req.body;
    try {
        await ledgerService_1.default.mint(userId, amountUsd, // Assumes 1:1
        `Deposit from charge ${chargeId}`, chargeId);
        res.status(200).send({ received: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to process minting webhook' });
    }
});
/**
 * Public Endpoint for Proof of Reserve
 * This builds trust by proving 1:1 backing.
 */
app.get('/proof-of-reserve', async (req, res) => {
    // 1. Get total supply of AZR from our ledger
    const supplyAggregation = await prisma.wallet.aggregate({
        _sum: {
            balance: true,
        },
    });
    const totalAzoraSupply = supplyAggregation._sum.balance || 0;
    // 2. Get real reserve balance
    // !! This is the crucial part !!
    // You must fetch this from your bank or crypto wallet API
    // For now, we can mock it from an .env variable
    const totalReserveHoldings = parseFloat(process.env.RESERVE_BALANCE_USD || '0.0');
    // Example: Fetching from a USDC wallet API (pseudocode)
    // const usdcBalance = await usdcWalletApi.getBalance(process.env.RESERVE_WALLET_ADDRESS);
    // const totalReserveHoldings = usdcBalance.amount;
    const isBacked = totalReserveHoldings >= totalAzoraSupply;
    res.json({
        totalAzoraSupply,
        totalReserveHoldings,
        status: isBacked ? 'FULLY_BACKED' : 'UNDER_COLLATERALIZED',
        discrepancy: totalReserveHoldings - totalAzoraSupply,
        lastChecked: new Date().toISOString(),
    });
});
// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Azora Ledger Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map