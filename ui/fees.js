/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const FEE_BPS = parseInt(process.env.FEE_BPS || '10', 10); // 0.10%
const FEE_MIN_USD = parseFloat(process.env.FEE_MIN_USD || '0.01');

function calcFeeUSD(amountUSD) {
  const percent = (amountUSD * FEE_BPS) / 10000;
  return Math.max(percent, FEE_MIN_USD);
}

module.exports = { calcFeeUSD };
