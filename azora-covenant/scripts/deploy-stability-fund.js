/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Stability Fund Deployment Script
 *
 * Genesis Protocol - Part II: Stability Fund Mechanism
 *
 * Deploys the automated reserve building system that diverts 25% of
 * Growth Fund revenues to build crisis reserves during market stress.
 */

async function main() {
  console.log("🚀 Deploying Stability Fund Mechanism...");
  console.log("Genesis Protocol - Part II: Stability Fund Mechanism\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // ========== DEPLOY MOCK CONTRACTS FOR TESTING ==========

  console.log("📋 Deploying mock contracts for testing...");

  // Deploy mock Growth Fund
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const growthFundToken = await MockERC20.deploy("Growth Fund Token", "GFT", ethers.parseEther("1000000"));
  await growthFundToken.waitForDeployment();
  const growthFundTokenAddress = await growthFundToken.getAddress();
  console.log("✅ Mock Growth Fund Token deployed at:", growthFundTokenAddress);

  // Deploy mock Circuit Breaker
  const MockCircuitBreaker = await ethers.getContractFactory("MockCircuitBreaker");
  const circuitBreaker = await MockCircuitBreaker.deploy();
  await circuitBreaker.waitForDeployment();
  const circuitBreakerAddress = await circuitBreaker.getAddress();
  console.log("✅ Mock Circuit Breaker deployed at:", circuitBreakerAddress);

  // Deploy mock Constitutional Court
  const MockConstitutionalCourt = await ethers.getContractFactory("MockConstitutionalCourt");
  const constitutionalCourt = await MockConstitutionalCourt.deploy();
  await constitutionalCourt.waitForDeployment();
  const constitutionalCourtAddress = await constitutionalCourt.getAddress();
  console.log("✅ Mock Constitutional Court deployed at:", constitutionalCourtAddress);

  // ========== DEPLOY STABILITY FUND ==========

  console.log("\n📋 Deploying StabilityFund contract...");

  const StabilityFund = await ethers.getContractFactory("StabilityFund");
  const stabilityFund = await StabilityFund.deploy(
    growthFundTokenAddress,    // Growth Fund token
    circuitBreakerAddress,     // Circuit Breaker system
    constitutionalCourtAddress // Constitutional Court
  );

  await stabilityFund.waitForDeployment();

  const stabilityFundAddress = await stabilityFund.getAddress();
  console.log("✅ StabilityFund deployed at:", stabilityFundAddress);

  // ========== INITIALIZE FUND ASSETS ==========

  console.log("\n🔧 Initializing fund assets...");

  // Deploy additional mock tokens for fund diversification
  const fundAssets = [
    {
      name: "AZR Token",
      symbol: "AZR",
      initialSupply: ethers.parseEther("1000000"),
      targetPercentage: 4000 // 40%
    },
    {
      name: "USDC Token",
      symbol: "USDC",
      initialSupply: ethers.parseEther("1000000"),
      targetPercentage: 3000 // 30%
    },
    {
      name: "RWA Token",
      symbol: "RWA",
      initialSupply: ethers.parseEther("100000"),
      targetPercentage: 2000 // 20%
    },
    {
      name: "Gold Token",
      symbol: "GLD",
      initialSupply: ethers.parseEther("10000"),
      targetPercentage: 1000 // 10%
    }
  ];

  const deployedAssets = [];

  for (const asset of fundAssets) {
    const token = await MockERC20.deploy(asset.name, asset.symbol, asset.initialSupply);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();

    // Add to stability fund
    await stabilityFund.addFundAsset(tokenAddress, asset.targetPercentage);

    deployedAssets.push({
      ...asset,
      address: tokenAddress
    });

    console.log(`  • ${asset.symbol}: ${tokenAddress} (${asset.targetPercentage/100}%)`);
  }

  // ========== AUTHORIZE FUND MANAGERS ==========

  console.log("\n🔐 Authorizing fund managers...");

  const fundManagers = [
    deployer.address, // Deployer as fund manager
    // In production, add actual fund manager addresses:
    // "0x..." // Risk management team
    // "0x..." // Treasury department
  ];

  for (const manager of fundManagers) {
    await stabilityFund.setFundManager(manager, true);
    console.log(`  • Authorized fund manager: ${manager}`);
  }

  // ========== TEST FUND ACTIVATION ==========

  console.log("\n🧪 Testing fund activation...");

  // Activate a test crisis trigger
  const testTriggerId = ethers.encodeBytes32String("TEST_CRISIS_001");
  await circuitBreaker.activateFund(testTriggerId, "Test market volatility trigger");

  // Activate stability fund diversion
  await stabilityFund.activateFundDiversion(
    testTriggerId,
    "Test crisis - High volatility in a-Token markets"
  );

  console.log("  • Activated test crisis trigger");
  console.log("  • Stability fund diversion active");

  // ========== TEST FUND DIVERSION ==========

  console.log("\n💰 Testing fund diversion...");

  // Simulate Growth Fund receiving revenue
  const testRevenue = ethers.parseEther("10000"); // 10,000 tokens

  // Approve transfer from deployer to growth fund
  await growthFundToken.approve(stabilityFundAddress, testRevenue);

  // Simulate diversion (normally called by Growth Fund contract)
  await stabilityFund.divertFunds(growthFundTokenAddress, testRevenue);

  const diversionAmount = (testRevenue * 2500n) / 10000n; // 25%
  console.log(`  • Diverted ${ethers.formatEther(diversionAmount)} tokens to stability fund`);

  // ========== VERIFY DEPLOYMENT ==========

  console.log("\n🔍 Verifying deployment...");

  // Check fund overview
  const fundOverview = await stabilityFund.getFundOverview();
  console.log("Fund Overview:");
  console.log(`  Total deposited: ${ethers.formatEther(fundOverview[0])}`);
  console.log(`  Total withdrawn: ${ethers.formatEther(fundOverview[1])}`);
  console.log(`  Current value: ${ethers.formatEther(fundOverview[2])}`);
  console.log(`  Active triggers: ${fundOverview[3]}`);
  console.log(`  Pending requests: ${fundOverview[4]}`);

  // Check active assets
  const activeAssets = await stabilityFund.getActiveAssets();
  console.log(`Active assets: ${activeAssets.length}`);

  for (const assetAddr of activeAssets) {
    const allocation = await stabilityFund.fundAllocations(assetAddr);
    console.log(`  • ${assetAddr}: ${allocation.targetPercentage/100}% target`);
  }

  // ========== SAVE DEPLOYMENT INFO ==========

  const deploymentInfo = {
    network: network.name,
    stabilityFund: {
      address: stabilityFundAddress,
      deploymentBlock: await stabilityFund.deploymentTransaction().then(tx => tx.blockNumber),
      deployer: deployer.address
    },
    mockContracts: {
      growthFundToken: growthFundTokenAddress,
      circuitBreaker: circuitBreakerAddress,
      constitutionalCourt: constitutionalCourtAddress
    },
    fundAssets: deployedAssets,
    fundManagers: fundManagers,
    testResults: {
      triggerActivated: true,
      diversionTested: true,
      divertedAmount: diversionAmount.toString()
    },
    deploymentTime: new Date().toISOString(),
    genesisProtocol: "Part II - Stability Fund Mechanism"
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `stability-fund-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // ========== DEPLOYMENT COMPLETE ==========

  console.log("\n🎉 Stability Fund Mechanism deployment complete!");
  console.log("Genesis Protocol - Part II: Stability Fund Mechanism");
  console.log("\nNext steps:");
  console.log("1. Integrate with actual Growth Fund contract");
  console.log("2. Connect to real Circuit Breaker system");
  console.log("3. Set up Constitutional Court approvals");
  console.log("4. Deploy AI Immune system for metabolic monitoring");

  // Return deployment info for testing scripts
  return {
    stabilityFund: stabilityFundAddress,
    fundAssets: deployedAssets,
    testResults: deploymentInfo.testResults
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });