/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Circuit Breaker Deployment Script
 *
 * Genesis Protocol - Part II: Circuit Breakers Activated
 *
 * Deploys the automated stability system for Azora a-Tokens with:
 * - State machine for OPEN/HALF_OPEN/CLOSED states
 * - Volatility-based triggers
 * - Recovery mechanisms
 * - Emergency overrides
 */

async function main() {
  console.log("🚀 Deploying Circuit Breaker System...");
  console.log("Genesis Protocol - Part II: Circuit Breakers Activated\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // ========== DEPLOY CIRCUIT BREAKER ==========

  console.log("📋 Deploying CircuitBreaker contract...");

  const CircuitBreaker = await ethers.getContractFactory("CircuitBreaker");
  const circuitBreaker = await CircuitBreaker.deploy();

  await circuitBreaker.waitForDeployment();

  const circuitBreakerAddress = await circuitBreaker.getAddress();
  console.log("✅ CircuitBreaker deployed at:", circuitBreakerAddress);

  // ========== INITIALIZE GENESIS CIRCUITS ==========

  console.log("\n🔧 Initializing Genesis Protocol circuits...");

  // Core a-Token circuits with appropriate thresholds
  const genesisCircuits = [
    {
      symbol: "aZAR",
      threshold: 2000, // 20% volatility threshold (basis points)
      recoveryTimeout: 2 * 60 * 60, // 2 hours in seconds
      description: "South African Rand pegged a-Token"
    },
    {
      symbol: "aUSD",
      threshold: 1500, // 15% volatility threshold
      recoveryTimeout: 1 * 60 * 60, // 1 hour in seconds
      description: "USD pegged a-Token"
    },
    {
      symbol: "aEUR",
      threshold: 1800, // 18% volatility threshold
      recoveryTimeout: 3 * 60 * 60, // 3 hours in seconds
      description: "EUR pegged a-Token"
    },
    {
      symbol: "aGBP",
      threshold: 1700, // 17% volatility threshold
      recoveryTimeout: 2.5 * 60 * 60, // 2.5 hours in seconds
      description: "GBP pegged a-Token"
    }
  ];

  // The circuits are already initialized in the constructor
  // But we can update them with specific configurations if needed
  for (const circuit of genesisCircuits) {
    console.log(`  • Configuring ${circuit.symbol} circuit (${circuit.description})`);

    // Update with specific thresholds (they're already added in constructor)
    await circuitBreaker.updateCircuitConfig(
      ethers.encodeBytes32String(circuit.symbol),
      circuit.threshold,
      circuit.recoveryTimeout
    );

    console.log(`    Threshold: ${circuit.threshold/100}%`);
    console.log(`    Recovery timeout: ${circuit.recoveryTimeout/3600} hours`);
  }

  // ========== AUTHORIZE STABILITY CONTRACTS ==========

  console.log("\n🔐 Authorizing stability monitoring contracts...");

  // In production, these would be the actual deployed contract addresses
  // For now, we'll authorize the deployer and some placeholder addresses
  const authorizedContracts = [
    deployer.address, // Deployer for testing
    // Add actual stability contract addresses here:
    // "0x..." // Citadel stability monitor
    // "0x..." // Mint volatility monitor
    // "0x..." // Oracle price feeds
  ];

  for (const contractAddr of authorizedContracts) {
    await circuitBreaker.authorizeContract(contractAddr);
    console.log(`  • Authorized: ${contractAddr}`);
  }

  // ========== VERIFY DEPLOYMENT ==========

  console.log("\n🔍 Verifying deployment...");

  // Check circuit configurations
  const activeCircuits = await circuitBreaker.getActiveCircuits();
  console.log(`Active circuits: ${activeCircuits.length}`);

  for (const circuitBytes32 of activeCircuits) {
    const symbol = ethers.decodeBytes32String(circuitBytes32);
    const status = await circuitBreaker.getCircuitStatus(circuitBytes32);
    console.log(`  • ${symbol}: ${status.currentState === 0 ? 'OPEN' : status.currentState === 1 ? 'HALF_OPEN' : 'CLOSED'}`);
  }

  // Check system health
  const systemHealth = await circuitBreaker.getSystemHealth();
  console.log(`\nSystem Health:`);
  console.log(`  Total circuits: ${systemHealth.totalCircuits}`);
  console.log(`  Open: ${systemHealth.openCircuits}`);
  console.log(`  Half-open: ${systemHealth.halfOpenCircuits}`);
  console.log(`  Closed: ${systemHealth.closedCircuits}`);

  // ========== SAVE DEPLOYMENT INFO ==========

  const deploymentInfo = {
    network: network.name,
    circuitBreaker: {
      address: circuitBreakerAddress,
      deploymentBlock: await circuitBreaker.deploymentTransaction().then(tx => tx.blockNumber),
      deployer: deployer.address
    },
    circuits: genesisCircuits,
    authorizedContracts: authorizedContracts,
    deploymentTime: new Date().toISOString(),
    genesisProtocol: "Part II - Circuit Breakers Activated"
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `circuit-breaker-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // ========== DEPLOYMENT COMPLETE ==========

  console.log("\n🎉 Circuit Breaker System deployment complete!");
  console.log("Genesis Protocol - Part II: Circuit Breakers Activated");
  console.log("\nNext steps:");
  console.log("1. Integrate circuit breaker checks in a-Token contracts");
  console.log("2. Connect volatility monitoring oracles");
  console.log("3. Test circuit breaker triggers and recovery");
  console.log("4. Deploy Stability Fund mechanism");

  // Return deployment info for testing scripts
  return {
    circuitBreaker: circuitBreakerAddress,
    circuits: genesisCircuits
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });