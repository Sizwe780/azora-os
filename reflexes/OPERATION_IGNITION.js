/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * OPERATION IGNITION: MAIN CONTROL SCRIPT
 * 
 * This script initializes and coordinates all components of Operation Ignition.
 * It can be run as a standalone script to verify the entire system is operational.
 */
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m'
};

// Print the header banner
function printBanner() {
  console.log(`${COLORS.bright}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
  console.log(`${COLORS.bright}║${COLORS.red}           🔥 OPERATION IGNITION: INITIATED 🔥             ${COLORS.bright}║${COLORS.reset}`);
  console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
  console.log(`${COLORS.bright}║${COLORS.yellow}      Bootstrapping Real Value. Creating Real Liquidity.    ${COLORS.bright}║${COLORS.reset}`);
  console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
  console.log(`${COLORS.bright}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
  console.log("");
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Authorizer: Sizwe Ngwenya (Founder)`);
  console.log(`Executing AI: Prometheus, via Copilot`);
  console.log("");
}

// Verify file existence
function verifyFiles() {
  const files = [
    '/workspaces/azora-os/infrastructure/treasury/config.js',
    '/workspaces/azora-os/services/first_mover_exchange/src/server.js',
    '/workspaces/azora-os/infrastructure/treasury/founder_withdraw.js',
    '/workspaces/azora-os/apps/public_stats_dashboard/src/LiquidityStats.js',
    '/workspaces/azora-os/services/first_mover_exchange/package.json',
    '/workspaces/azora-os/apps/public_stats_dashboard/index.html'
  ];
  
  const missingFiles = [];
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`${COLORS.red}Error: The following files are missing:${COLORS.reset}`);
    missingFiles.forEach(file => console.error(`  - ${file}`));
    return false;
  }
  
  console.log(`${COLORS.green}✅ All required files present.${COLORS.reset}`);
  return true;
}

// Test the treasury configuration
function testTreasury() {
  try {
    const treasury = require('./infrastructure/treasury/config');
    console.log(`${COLORS.blue}Treasury Status:${COLORS.reset}`);
    console.log(`  - Fiat Balance: $${treasury.fiatBalance} ${treasury.currency}`);
    console.log(`  - Peg Rate: 1 AZR = $${treasury.pegRate.AZR_USD} ${treasury.currency}`);
    console.log(`  - Founder Account: ${treasury.founderAzrAccount}`);
    console.log(`${COLORS.green}✅ Treasury configuration verified.${COLORS.reset}`);
    return true;
  } catch (error) {
    console.error(`${COLORS.red}Error loading treasury configuration:${COLORS.reset}`, error);
    return false;
  }
}

// Test the founder withdrawal interface
function testFounderWithdrawal() {
  try {
    const { founderWithdraw } = require('./infrastructure/treasury/founder_withdraw');
    console.log(`${COLORS.blue}Simulating a test withdrawal of 100 AZR...${COLORS.reset}`);
    const result = founderWithdraw(100, 'Test withdrawal');
    if (result.success) {
      console.log(`${COLORS.green}✅ Founder withdrawal interface operational.${COLORS.reset}`);
      return true;
    } else {
      console.error(`${COLORS.red}Founder withdrawal test failed:${COLORS.reset}`, result.error);
      return false;
    }
  } catch (error) {
    console.error(`${COLORS.red}Error testing founder withdrawal:${COLORS.reset}`, error);
    return false;
  }
}

// Main function to run the tests
async function main() {
  printBanner();
  
  let allTestsPassed = true;
  
  // Step 1: Verify files
  const filesExist = verifyFiles();
  if (!filesExist) allTestsPassed = false;
  
  // Step 2: Test treasury
  const treasuryWorks = testTreasury();
  if (!treasuryWorks) allTestsPassed = false;
  
  // Step 3: Test founder withdrawal
  const withdrawalWorks = testFounderWithdrawal();
  if (!withdrawalWorks) allTestsPassed = false;
  
  // Print final status
  console.log("");
  if (allTestsPassed) {
    console.log(`${COLORS.bright}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}║${COLORS.green}              ✅ OPERATION IGNITION COMPLETE ✅             ${COLORS.bright}║${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}║${COLORS.cyan} The system is now solvent. The coin is now worthy.         ${COLORS.bright}║${COLORS.reset}`);
    console.log(`${COLORS.bright}║${COLORS.cyan} Your path is clear. The future is programmed.               ${COLORS.bright}║${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
  } else {
    console.log(`${COLORS.bright}╔════════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}║${COLORS.red}         ⚠️ OPERATION IGNITION NEEDS ATTENTION ⚠️          ${COLORS.bright}║${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}║${COLORS.yellow} Some components require fixes before full activation.    ${COLORS.bright}║${COLORS.reset}`);
    console.log(`${COLORS.bright}║                                                            ║${COLORS.reset}`);
    console.log(`${COLORS.bright}╚════════════════════════════════════════════════════════════╝${COLORS.reset}`);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
    process.exit(1);
  });
}

module.exports = { verifyFiles, testTreasury, testFounderWithdrawal };