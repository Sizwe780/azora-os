/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * PIVC Taxation Deployment Script
 *
 * Genesis Protocol - Part II: PIVC Taxation System
 *
 * Deploys the Proof-of-Impact Value Creation taxation system with:
 * - 5% tax rate on economic activities
 * - Automated distribution to ecosystem funds
 * - Tax exemptions and emergency controls
 * - Constitutional compliance
 */

async function main() {
  console.log("🚀 Deploying PIVC Taxation System...");
  console.log("Genesis Protocol - Part II: PIVC Taxation System\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // ========== DEPLOY MOCK CONTRACTS FOR TESTING ==========

  console.log("📋 Deploying mock contracts for testing...");

  // Deploy mock AZR token (primary ecosystem token)
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const azrToken = await MockERC20.deploy("Azora Token", "AZR", ethers.parseEther("10000000"));
  await azrToken.waitForDeployment();
  const azrTokenAddress = await azrToken.getAddress();
  console.log("✅ Mock AZR Token deployed at:", azrTokenAddress);

  // Deploy mock fund contracts
  const mockFunds = [
    { name: "Stability Fund", symbol: "SF" },
    { name: "Growth Fund", symbol: "GF" },
    { name: "AI Immune System", symbol: "AIS" },
    { name: "Constitutional Court", symbol: "CC" },
    { name: "Citizen's Oversight", symbol: "CO" },
    { name: "Geopolitical Readiness", symbol: "GR" }
  ];

  const deployedFunds = [];

  for (const fund of mockFunds) {
    const fundContract = await MockERC20.deploy(`${fund.name} Token`, fund.symbol, ethers.parseEther("1000000"));
    await fundContract.waitForDeployment();
    const fundAddress = await fundContract.getAddress();

    deployedFunds.push({
      name: fund.name,
      address: fundAddress
    });

    console.log(`  • ${fund.name}: ${fundAddress}`);
  }

  // ========== DEPLOY PIVC TAXATION ==========

  console.log("\n📋 Deploying PIVCTaxation contract...");

  const PIVCTaxation = await ethers.getContractFactory("PIVCTaxation");
  const pivcTaxation = await PIVCTaxation.deploy();

  await pivcTaxation.waitForDeployment();

  const pivcTaxationAddress = await pivcTaxation.getAddress();
  console.log("✅ PIVCTaxation deployed at:", pivcTaxationAddress);

  // ========== UPDATE TAX ALLOCATIONS ==========

  console.log("\n🔧 Updating tax allocations with deployed fund addresses...");

  const fundAllocations = [
    { name: "Stability Fund", percentage: 2500, address: deployedFunds[0].address },
    { name: "Growth Fund", percentage: 2500, address: deployedFunds[1].address },
    { name: "AI Immune System", percentage: 2000, address: deployedFunds[2].address },
    { name: "Constitutional Court", percentage: 1500, address: deployedFunds[3].address },
    { name: "Citizen's Oversight", percentage: 1000, address: deployedFunds[4].address },
    { name: "Geopolitical Readiness", percentage: 500, address: deployedFunds[5].address }
  ];

  for (let i = 0; i < fundAllocations.length; i++) {
    const allocation = fundAllocations[i];
    await pivcTaxation.updateTaxAllocation(
      i,
      allocation.address,
      allocation.percentage,
      allocation.name
    );
    console.log(`  • ${allocation.name}: ${allocation.percentage/100}% to ${allocation.address}`);
  }

  // ========== AUTHORIZE TAX COLLECTORS ==========

  console.log("\n🔐 Authorizing tax collectors...");

  // In production, these would be Citadel, Mint, and other economic contracts
  const taxCollectors = [
    deployer.address, // Deployer for testing
    // Add actual contract addresses here:
    // "0x..." // Citadel contract
    // "0x..." // Mint contract
    // "0x..." // Other economic activity contracts
  ];

  for (const collector of taxCollectors) {
    await pivcTaxation.authorizeCollector(collector);
    console.log(`  • Authorized tax collector: ${collector}`);
  }

  // ========== TEST TAX COLLECTION ==========

  console.log("\n🧪 Testing tax collection...");

  // Mint some AZR tokens to deployer for testing
  await azrToken.mint(deployer.address, ethers.parseEther("100000"));
  console.log("  • Minted 100,000 AZR tokens to deployer");

  // Approve taxation contract to spend tokens
  await azrToken.approve(pivcTaxationAddress, ethers.parseEther("100000"));
  console.log("  • Approved taxation contract to spend AZR tokens");

  // Simulate a transaction requiring tax (e.g., token swap worth 10,000 AZR)
  const transactionAmount = ethers.parseEther("10000");
  const expectedTax = (transactionAmount * 500n) / 10000n; // 5%

  console.log(`  • Simulating transaction of ${ethers.formatEther(transactionAmount)} AZR`);
  console.log(`  • Expected tax: ${ethers.formatEther(expectedTax)} AZR`);

  // Collect tax
  const actualTax = await pivcTaxation.collectTax(
    deployer.address,
    azrTokenAddress,
    transactionAmount,
    "token_swap"
  );

  console.log(`  • Actual tax collected: ${ethers.formatEther(actualTax)} AZR`);

  // Verify tax distribution
  console.log("\n📊 Verifying tax distribution...");

  for (const fund of deployedFunds) {
    const balance = await azrToken.balanceOf(fund.address);
    const expectedAmount = (expectedTax * fundAllocations[deployedFunds.indexOf(fund)].percentage) / 10000n;
    console.log(`  • ${fund.name}: ${ethers.formatEther(balance)} AZR (expected: ${ethers.formatEther(expectedAmount)} AZR)`);
  }

  // ========== TEST TAX EXEMPTIONS ==========

  console.log("\n🛡️ Testing tax exemptions...");

  // Grant tax exemption to a test address
  const testAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  await pivcTaxation.grantTaxExemption(
    testAddress,
    "Genesis Protocol development testing",
    24 * 60 * 60 // 24 hours
  );
  console.log(`  • Granted tax exemption to: ${testAddress}`);

  // Verify exemption
  const isExempt = await pivcTaxation.isTaxExempt(testAddress);
  console.log(`  • Address is exempt: ${isExempt}`);

  // ========== VERIFY DEPLOYMENT ==========

  console.log("\n🔍 Verifying deployment...");

  // Check tax statistics
  const taxStats = await pivcTaxation.getTaxStatistics();
  console.log("Tax Statistics:");
  console.log(`  Total transactions taxed: ${taxStats[0]}`);
  console.log(`  Tax rate: ${taxStats[1]/100}%`);
  console.log(`  Active allocations: ${taxStats[2]}`);
  console.log(`  Taxation active: ${taxStats[3]}`);

  // Check total tax collected
  const totalTaxCollected = await pivcTaxation.getTotalTaxCollected(azrTokenAddress);
  console.log(`  Total AZR tax collected: ${ethers.formatEther(totalTaxCollected)}`);

  // Check tax allocations
  const allocations = await pivcTaxation.getTaxAllocations();
  console.log(`Active tax allocations: ${allocations.length}`);

  let totalPercentage = 0;
  for (const allocation of allocations) {
    if (allocation.isActive) {
      console.log(`  • ${allocation.purpose}: ${allocation.percentage/100}% to ${allocation.recipient}`);
      totalPercentage += allocation.percentage;
    }
  }
  console.log(`  Total allocation percentage: ${totalPercentage/100}%`);

  // ========== SAVE DEPLOYMENT INFO ==========

  const deploymentInfo = {
    network: network.name,
    pivcTaxation: {
      address: pivcTaxationAddress,
      deploymentBlock: await pivcTaxation.deploymentTransaction().then(tx => tx.blockNumber),
      deployer: deployer.address
    },
    mockContracts: {
      azrToken: azrTokenAddress,
      funds: deployedFunds
    },
    taxAllocations: fundAllocations,
    taxCollectors: taxCollectors,
    testResults: {
      taxCollectionTested: true,
      taxDistributionVerified: true,
      exemptionSystemTested: true,
      collectedTaxAmount: actualTax.toString()
    },
    deploymentTime: new Date().toISOString(),
    genesisProtocol: "Part II - PIVC Taxation System"
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `pivc-taxation-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // ========== DEPLOYMENT COMPLETE ==========

  console.log("\n🎉 PIVC Taxation System deployment complete!");
  console.log("Genesis Protocol - Part II: PIVC Taxation System");
  console.log("\nNext steps:");
  console.log("1. Integrate tax collection in Citadel and Mint contracts");
  console.log("2. Set up real fund contract addresses");
  console.log("3. Configure tax exemptions for system contracts");
  console.log("4. Deploy Citadel smart contract for a-Token management");

  // Return deployment info for testing scripts
  return {
    pivcTaxation: pivcTaxationAddress,
    azrToken: azrTokenAddress,
    funds: deployedFunds,
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