/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Founder's Withdrawal Treasury
 * This is the seed capital that bootstraps the entire economy.
 * It is REAL money, provided by the Founder, to guarantee the initial
 * value of AZR for the first users and enable founder liquidity.
 */
const FOUNDER_TREASURY = {
    // The Founder seeds this with real fiat currency (e.g., ZAR/USD).
    fiatBalance: 25000, // Example: $25,000 USD
    currency: 'USD',
    
    // The official, initial exchange rate. This is the PEG.
    pegRate: {
        'AZR_USD': 1.00 // 1 AZR is worth exactly $1.00 USD initially.
    },

    // The destination for all AZR bought back from users.
    founderAzrAccount: 'founder-acc-001', // Sizwe Ngwenya's account ID.
    
    // Constitutional compliance tracking
    constitutionalVerification: {
        article1_valueAccretive: true, // Creates real economic value
        article3_truthfulness: true,   // Based on real assets
        article4_promotesGrowth: true  // Enables ecosystem growth
    }
};

module.exports = FOUNDER_TREASURY;