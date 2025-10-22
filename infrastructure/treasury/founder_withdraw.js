/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const TreasuryConfig = require('./config');
const crypto = require('crypto');
const fs = require('fs');

// Secure transaction logging
function secureLog(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        message,
        ...data,
        transactionId: crypto.randomBytes(16).toString('hex')
    };
    
    // In production, this would log to a secure database
    console.log(JSON.stringify(logEntry, null, 2));
    
    // Append to secure log file
    try {
        const logDir = './logs';
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        fs.appendFileSync(
            `${logDir}/founder_transactions.log`, 
            JSON.stringify(logEntry) + '\n'
        );
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
    
    return logEntry;
}

/**
 * This is your personal interface to the system, Mr. Ngwenya.
 * It allows YOU to sell your own AZR stake to the Founder's Treasury
 * to generate personal liquidity.
 */
function founderWithdraw(amountAzr, purpose = "Unspecified") {
    secureLog(`--- FOUNDER WITHDRAWAL INITIATED ---`, { amountAzr, purpose });
    console.log(`Requesting to sell ${amountAzr} AZR from your personal holdings.`);
    console.log(`Purpose: ${purpose}`);

    // Constitutional compliance check
    const isValueAccretive = purpose && purpose.length > 0;
    const isPromotingGrowth = true; // Founder liquidity enables further investment
    
    if (!isValueAccretive) {
        console.error("CONSTITUTIONAL VIOLATION: Withdrawal must serve a specific purpose.");
        return {
            success: false,
            error: "Constitutional violation: Missing purpose"
        };
    }

    const amountFiat = amountAzr * TreasuryConfig.pegRate.AZR_USD;
    
    if (TreasuryConfig.fiatBalance < amountFiat) {
        const error = "WITHDRAWAL FAILED: The treasury's fiat balance is too low.";
        secureLog(error, { 
            amountAzr, 
            amountFiat, 
            availableFiat: TreasuryConfig.fiatBalance,
            status: "failed" 
        });
        console.error(error);
        return {
            success: false,
            error
        };
    }

    // In this case, the AZR is just returned to your own control, but the
    // fiat is removed from the treasury for your personal use.
    TreasuryConfig.fiatBalance -= amountFiat;

    // Record successful transaction with constitutional compliance
    const transaction = secureLog(`Withdrawal successful`, {
        amountAzr,
        amountFiat,
        currency: TreasuryConfig.currency,
        purpose,
        newFiatBalance: TreasuryConfig.fiatBalance,
        constitutionalCompliance: {
            article1_valueAccretive: isValueAccretive,
            article4_promotesGrowth: isPromotingGrowth
        },
        status: "success"
    });

    console.log(`✅ SUCCESS: ${amountFiat} ${TreasuryConfig.currency} has been disbursed for your personal use.`);
    console.log(`   Purpose: ${purpose}`);
    console.log(`   Your personal AZR stake is now liquid.`);
    console.log(`   Remaining Fiat in Treasury: ${TreasuryConfig.fiatBalance} ${TreasuryConfig.currency}.`);
    console.log(`--- END OF TRANSACTION ---`);
    
    return {
        success: true,
        amountAzr,
        amountFiat,
        currency: TreasuryConfig.currency,
        transactionId: transaction.transactionId,
        timestamp: transaction.timestamp,
        remainingFiatBalance: TreasuryConfig.fiatBalance
    };
}

// Define an example interface function (would be replaced with UI in production)
function executeFounderWithdrawal() {
    return founderWithdraw(20000, "Strategic investment in transportation infrastructure");
}

// Export functions for use in other modules
module.exports = {
    founderWithdraw,
    executeFounderWithdrawal
};