/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const name = 'localize';

// Simple currency symbol map (extend as needed)
const symbols = { ZAR: 'R', NGN: '₦', KES: 'KSh', GHS: '₵', USD: '$' };

const actions = {
  // Returns localized CTA text + currency display
  cta: async (_ctx, input = {}) => {
    const { locale = 'en-ZA', currency = 'ZAR' } = input;
    const symbol = symbols[currency] || currency + ' ';
    return {
      title: locale.startsWith('en') ? 'Start your 30‑day free trial' : 'Anza majaribio ya siku 30 bila malipo',
      forUserBenefit: 'Risk‑free evaluation, intro pricing after trial.',
      transparencyNote: 'You can opt out of suggestions anytime.',
      priceExample: `${symbol}50 / month (intro)`,
      locale,
      currency,
    };
  },
};

module.exports = { name, actions };