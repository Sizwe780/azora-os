/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ledgerService.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Your config, moved from .env for clarity
// In real code, this comes from process.env
const ZAR_USD_RATE = 18.5; // This would be fetched live
class LedgerService {
    /**
     * Creates a new user and their associated wallet.
     * Your existing onboarding logic.
     */
    async createUser(email, role) {
        const user = await prisma.user.create({
            data: {
                email,
                role,
                wallet: {
                    create: {
                        balance: 0.0,
                    },
                },
            },
        });
        return user;
    }
    /**
     * Mints new AZR, assuming $1 USD equivalent has been secured.
     * This is an ADMIN/SYSTEM-only action (e.g., called by a payment webhook).
     * It atomically creates a transaction and updates the user's balance.
     */
    async mint(userId, amountToMint, notes, externalTxnId) {
        const userWallet = await prisma.wallet.findUnique({
            where: { userId },
        });
        if (!userWallet) {
            throw new Error('User wallet not found');
        }
        try {
            const [transaction, updatedWallet] = await prisma.$transaction([
                // 1. Create the immutable ledger entry
                prisma.transaction.create({
                    data: {
                        type: 'MINT',
                        status: 'COMPLETED',
                        amount: amountToMint,
                        usdEquivalent: amountToMint, // Assumes 1:1 backing
                        notes: notes || 'New coin minting',
                        externalTxnId: externalTxnId, // e.g., The Stripe Charge ID
                        recipientId: userWallet.id,
                    },
                }),
                // 2. Update the user's balance
                prisma.wallet.update({
                    where: { id: userWallet.id },
                    data: {
                        balance: {
                            increment: amountToMint,
                        },
                    },
                }),
            ]);
            return { transaction, updatedWallet };
        }
        catch (error) {
            console.error('Minting failed:', error);
            throw new Error('Atomic mint transaction failed.');
        }
    }
    /**
     * Initiates an "Instant Withdrawal"
     * This is a 2-step process:
     * 1. (This function) Atomically debit the user's AZR balance and create a PENDING transaction.
     * 2. (External) An external system processes the payout (e.g., sends USDC).
     * 3. (Webhook) The external system calls our API to mark the transaction COMPLETED.
     */
    async requestWithdrawal(userId, amountToWithdraw) {
        const userWallet = await prisma.wallet.findUnique({
            where: { userId },
        });
        if (!userWallet)
            throw new Error('User wallet not found');
        if (userWallet.balance < amountToWithdraw) {
            throw new Error('Insufficient funds');
        }
        try {
            // Atomically debit and log
            const [transaction, updatedWallet] = await prisma.$transaction([
                // 1. Create the PENDING ledger entry
                prisma.transaction.create({
                    data: {
                        type: 'WITHDRAWAL',
                        status: 'PENDING',
                        amount: amountToWithdraw,
                        usdEquivalent: amountToWithdraw,
                        notes: `User withdrawal request`,
                        senderId: userWallet.id, // Money is "sent" from the wallet
                    },
                }),
                // 2. Debit the user's balance
                prisma.wallet.update({
                    where: { id: userWallet.id },
                    data: {
                        balance: {
                            decrement: amountToWithdraw,
                        },
                    },
                }),
            ]);
            // !!! TRIGGER REAL PAYOUT HERE !!!
            // This is where you call the Payout API (Stripe, PayPal, USDC Transfer)
            // We pass the transaction.id so the webhook can identify it.
            // Do not await this if it's slow; let it run in the background.
            this.executePayout(transaction.id, amountToWithdraw, 'user-usdc-wallet-address'); // Get user's real payout address
            return { transaction, newBalance: updatedWallet.balance };
        }
        catch (error) {
            console.error('Withdrawal request failed:', error);
            // The transaction will be rolled back automatically
            throw new Error('Atomic withdrawal transaction failed.');
        }
    }
    /**
     * !! PSEUDOCODE for Payout Integration !!
     * This is the "Connect real payout API" step.
     */
    async executePayout(internalTxnId, amount, destinationAddress) {
        // const payoutApi = new PayoutProvider(process.env.PAYOUT_API_KEY);
        try {
            console.log(`Sending ${amount} USD/USDC to ${destinationAddress} for internal tx ${internalTxnId}`);
            // const apiResponse = await payoutApi.send({
            //   amount: amount,
            //   destination: destinationAddress,
            //   currency: 'USDC',
            //   metadata: { internalTxnId: internalTxnId } // IMPORTANT
            // });
            // const externalId = apiResponse.id;
            // DUMMY SUCCESS
            const externalId = `dummy_payout_${Date.now()}`;
            console.log(`Payout successful, external ID: ${externalId}`);
            // Update our transaction to COMPLETED
            await this.completeTransaction(internalTxnId, externalId);
        }
        catch (error) {
            console.error(`Payout failed for ${internalTxnId}:`, error);
            // If payout fails, we must roll back the transaction
            await this.failTransaction(internalTxnId, error.message);
        }
    }
    /**
     * Completes a transaction (e.g., called by a payout webhook).
     */
    async completeTransaction(internalTxnId, externalTxnId) {
        return prisma.transaction.update({
            where: { id: internalTxnId },
            data: {
                status: 'COMPLETED',
                externalTxnId: externalTxnId,
            },
        });
    }
    /**
     * Fails a transaction and REFUNDS the user.
     * This is critical for maintaining trust.
     */
    async failTransaction(internalTxnId, failureReason) {
        const txn = await prisma.transaction.findUnique({ where: { id: internalTxnId } });
        if (!txn || txn.status !== 'PENDING') {
            throw new Error('Transaction not found or not in a reversible state');
        }
        // Atomically refund the user and mark the transaction as FAILED
        try {
            const [updatedTxn, updatedWallet] = await prisma.$transaction([
                prisma.transaction.update({
                    where: { id: internalTxnId },
                    data: {
                        status: 'FAILED',
                        notes: `Failed: ${failureReason}`,
                    },
                }),
                // Refund the user's balance
                prisma.wallet.update({
                    where: { id: txn.senderId }, // Assumes senderId is the user's wallet
                    data: {
                        balance: {
                            increment: txn.amount, // Give the money back
                        },
                    },
                }),
            ]);
            console.log(`Transaction ${internalTxnId} failed. User ${updatedWallet.userId} has been refunded.`);
            return updatedTxn;
        }
        catch (error) {
            console.error(`CRITICAL: Failed to roll back transaction ${internalTxnId}:`, error);
            // This state requires manual admin intervention!
        }
    }
    /**
     * Gets a user's balance.
     */
    async getBalance(userId) {
        const wallet = await prisma.wallet.findUnique({
            where: { userId },
        });
        return wallet?.balance || 0.0;
    }
    /**
     * Gets a user's transaction history (their ledger).
     */
    async getHistory(userId) {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            return [];
        return prisma.transaction.findMany({
            where: {
                OR: [
                    { senderId: wallet.id },
                    { recipientId: wallet.id }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}
exports.default = new LedgerService();
//# sourceMappingURL=ledgerService.js.map