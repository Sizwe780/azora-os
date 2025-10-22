/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { UserRole } from '@prisma/client';
declare class LedgerService {
    /**
     * Creates a new user and their associated wallet.
     * Your existing onboarding logic.
     */
    createUser(email: string, role: UserRole): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    /**
     * Mints new AZR, assuming $1 USD equivalent has been secured.
     * This is an ADMIN/SYSTEM-only action (e.g., called by a payment webhook).
     * It atomically creates a transaction and updates the user's balance.
     */
    mint(userId: string, amountToMint: number, notes: string, externalTxnId: string): Promise<{
        transaction: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.TxnType;
            status: import(".prisma/client").$Enums.TxnStatus;
            amount: number;
            usdEquivalent: number;
            notes: string | null;
            externalTxnId: string | null;
            updatedAt: Date;
            senderId: string | null;
            recipientId: string | null;
        };
        updatedWallet: {
            id: string;
            balance: number;
            userId: string;
        };
    }>;
    /**
     * Initiates an "Instant Withdrawal"
     * This is a 2-step process:
     * 1. (This function) Atomically debit the user's AZR balance and create a PENDING transaction.
     * 2. (External) An external system processes the payout (e.g., sends USDC).
     * 3. (Webhook) The external system calls our API to mark the transaction COMPLETED.
     */
    requestWithdrawal(userId: string, amountToWithdraw: number): Promise<{
        transaction: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.TxnType;
            status: import(".prisma/client").$Enums.TxnStatus;
            amount: number;
            usdEquivalent: number;
            notes: string | null;
            externalTxnId: string | null;
            updatedAt: Date;
            senderId: string | null;
            recipientId: string | null;
        };
        newBalance: number;
    }>;
    /**
     * !! PSEUDOCODE for Payout Integration !!
     * This is the "Connect real payout API" step.
     */
    executePayout(internalTxnId: string, amount: number, destinationAddress: string): Promise<void>;
    /**
     * Completes a transaction (e.g., called by a payout webhook).
     */
    completeTransaction(internalTxnId: string, externalTxnId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        status: import(".prisma/client").$Enums.TxnStatus;
        amount: number;
        usdEquivalent: number;
        notes: string | null;
        externalTxnId: string | null;
        updatedAt: Date;
        senderId: string | null;
        recipientId: string | null;
    }>;
    /**
     * Fails a transaction and REFUNDS the user.
     * This is critical for maintaining trust.
     */
    failTransaction(internalTxnId: string, failureReason: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        status: import(".prisma/client").$Enums.TxnStatus;
        amount: number;
        usdEquivalent: number;
        notes: string | null;
        externalTxnId: string | null;
        updatedAt: Date;
        senderId: string | null;
        recipientId: string | null;
    } | undefined>;
    /**
     * Gets a user's balance.
     */
    getBalance(userId: string): Promise<number>;
    /**
     * Gets a user's transaction history (their ledger).
     */
    getHistory(userId: string): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.TxnType;
        status: import(".prisma/client").$Enums.TxnStatus;
        amount: number;
        usdEquivalent: number;
        notes: string | null;
        externalTxnId: string | null;
        updatedAt: Date;
        senderId: string | null;
        recipientId: string | null;
    }[]>;
}
declare const _default: LedgerService;
export default _default;
//# sourceMappingURL=ledgerService.d.ts.map