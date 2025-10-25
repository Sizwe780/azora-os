/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Citadel Deployment Script
 *
 * Genesis Protocol - Part II: Citadel Smart Contract
 *
 * Deploys the central minting, redemption, and collateral management
 * system for Azora a-Tokens with integrated stability controls.
 */

async function main() {
  console.log("🚀 Deploying Citadel Smart Contract...");
  console.log("Genesis Protocol - Part II: Citadel Smart Contract\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH\n");

  // ========== DEPLOY MOCK CONTRACTS FOR TESTING ==========

  console.log("📋 Deploying mock contracts for testing...");

  // Deploy mock Trisula Reserve
  const MockTrisulaReserve = await ethers.getContractFactory("MockTrisulaReserve");
  const trisulaReserve = await MockTrisulaReserve.deploy();
  await trisulaReserve.waitForDeployment();
  const trisulaReserveAddress = await trisulaReserve.getAddress();
  console.log("✅ Mock Trisula Reserve deployed at:", trisulaReserveAddress);

  // Deploy mock Circuit Breaker
  const MockCircuitBreaker = await ethers.getContractFactory("MockCircuitBreaker");
  const circuitBreaker = await MockCircuitBreaker.deploy();
  await circuitBreaker.waitForDeployment();
  const circuitBreakerAddress = await circuitBreaker.getAddress();
  console.log("✅ Mock Circuit Breaker deployed at:", circuitBreakerAddress);

  // Deploy mock Stability Fund
  const MockStabilityFund = await ethers.getContractFactory("MockStabilityFund");
  const stabilityFund = await MockStabilityFund.deploy();
  await stabilityFund.waitForDeployment();
  const stabilityFundAddress = await stabilityFund.getAddress();
  console.log("✅ Mock Stability Fund deployed at:", stabilityFundAddress);

  // Deploy mock PIVC Taxation
  const MockPIVCTaxation = await ethers.getContractFactory("MockPIVCTaxation");
  const pivcTaxation = await MockPIVCTaxation.deploy();
  await pivcTaxation.waitForDeployment();
  const pivcTaxationAddress = await pivcTaxation.getAddress();
  console.log("✅ Mock PIVC Taxation deployed at:", pivcTaxationAddress);

  // ========== DEPLOY A-TOKENS ==========

  console.log("\n🪙 Deploying a-Token contracts...");

  const MockERC20 = await ethers.getContractFactory("MockERC20");

  // Deploy aZAR token
  const aZAR = await MockERC20.deploy("Azora ZAR", "aZAR", ethers.parseEther("1000000"));
  await aZAR.waitForDeployment();
  const aZARAddress = await aZAR.getAddress();
  console.log("✅ aZAR token deployed at:", aZARAddress);

  // Deploy aUSD token
  const aUSD = await MockERC20.deploy("Azora USD", "aUSD", ethers.parseEther("1000000"));
  await aUSD.waitForDeployment();
  const aUSDAddress = await aUSD.getAddress();
  console.log("✅ aUSD token deployed at:", aUSDAddress);

  // Deploy peg tokens (collateral)
  const ZAR = await MockERC20.deploy("ZAR Stablecoin", "ZAR", ethers.parseEther("1000000"));
  await ZAR.waitForDeployment();
  const ZARAddress = await ZAR.getAddress();
  console.log("✅ ZAR stablecoin deployed at:", ZARAddress);

  const USDC = await MockERC20.deploy("USD Coin", "USDC", ethers.parseEther("1000000"));
  await USDC.waitForDeployment();
  const USDCAddress = await USDC.getAddress();
  console.log("✅ USDC stablecoin deployed at:", USDCAddress);

  // ========== DEPLOY CITADEL ==========

  console.log("\n🏰 Deploying Citadel contract...");

  const Citadel = await ethers.getContractFactory("Citadel");
  const citadel = await Citadel.deploy(
    trisulaReserveAddress,
    circuitBreakerAddress,
    stabilityFundAddress,
    pivcTaxationAddress
  );

  await citadel.waitForDeployment();

  const citadelAddress = await citadel.getAddress();
  console.log("✅ Citadel deployed at:", citadelAddress);

  // ========== CONFIGURE A-TOKENS ==========

  console.log("\n⚙️ Configuring a-Tokens in Citadel...");

  // Configure aZAR
  await citadel.configureAToken(
    ethers.encodeBytes32String("aZAR"),
    aZARAddress,
    ZARAddress,
    15000, // 150% minimum collateral ratio
    12000, // 120% liquidation ratio
    50,    // 0.5% minting fee
    25     // 0.25% redemption fee
  );
  console.log("  • Configured aZAR token");

  // Configure aUSD
  await citadel.configureAToken(
    ethers.encodeBytes32String("aUSD"),
    aUSDAddress,
    USDCAddress,
    15000, // 150% minimum collateral ratio
    12000, // 120% liquidation ratio
    30,    // 0.3% minting fee
    15     // 0.15% redemption fee
  );
  console.log("  • Configured aUSD token");

  // ========== TEST CITADEL FUNCTIONALITY ==========

  console.log("\n🧪 Testing Citadel functionality...");

  // Mint some collateral tokens to deployer for testing
  await ZAR.mint(deployer.address, ethers.parseEther("100000"));
  await USDC.mint(deployer.address, ethers.parseEther("100000"));
  console.log("  • Minted 100,000 ZAR and USDC to deployer");

  // Approve Citadel to spend collateral
  await ZAR.approve(citadelAddress, ethers.parseEther("100000"));
  await USDC.approve(citadelAddress, ethers.parseEther("100000"));
  console.log("  • Approved Citadel to spend collateral tokens");

  // Test aZAR minting
  console.log("\n🧪 Testing aZAR minting...");

  const zarCollateralAmount = ethers.parseEther("15000"); // 15,000 ZAR
  const expectedAzarAmount = ethers.parseEther("10000"); // Should mint 10,000 aZAR (150% collateral ratio)

  // Deposit collateral
  await citadel.depositCollateral(ethers.encodeBytes32String("aZAR"), zarCollateralAmount);
  console.log(`  • Deposited ${ethers.formatEther(zarCollateralAmount)} ZAR as collateral`);

  // Mint aZAR
  await citadel.mintATokens(ethers.encodeBytes32String("aZAR"), expectedAzarAmount);
  console.log(`  • Minted ${ethers.formatEther(expectedAzarAmount)} aZAR tokens`);

  // Check position
  const position = await citadel.getUserPosition(deployer.address, ethers.encodeBytes32String("aZAR"));
  console.log(`  • Position - Collateral: ${ethers.formatEther(position[0])}, Debt: ${ethers.formatEther(position[1])}, Ratio: ${position[2]/100}%`);

  // Test aUSD minting
  console.log("\n🧪 Testing aUSD minting...");

  const usdcCollateralAmount = ethers.parseEther("15000"); // 15,000 USDC
  const expectedAusdAmount = ethers.parseEther("10000"); // Should mint 10,000 aUSD

  // Deposit collateral
  await citadel.depositCollateral(ethers.encodeBytes32String("aUSD"), usdcCollateralAmount);
  console.log(`  • Deposited ${ethers.formatEther(usdcCollateralAmount)} USDC as collateral`);

  // Mint aUSD
  await citadel.mintATokens(ethers.encodeBytes32String("aUSD"), expectedAusdAmount);
  console.log(`  • Minted ${ethers.formatEther(expectedAusdAmount)} aUSD tokens`);

  // Check position
  const usdPosition = await citadel.getUserPosition(deployer.address, ethers.encodeBytes32String("aUSD"));
  console.log(`  • Position - Collateral: ${ethers.formatEther(usdPosition[0])}, Debt: ${ethers.formatEther(usdPosition[1])}, Ratio: ${usdPosition[2]/100}%`);

  // ========== VERIFY DEPLOYMENT ==========

  console.log("\n🔍 Verifying deployment...");

  // Check Citadel statistics
  const citadelStats = await citadel.getCitadelStats();
  console.log("Citadel Statistics:");
  console.log(`  Total a-Tokens: ${citadelStats[0]}`);
  console.log(`  Total positions: ${citadelStats[1]}`);
  console.log(`  Total fees collected: ${ethers.formatEther(citadelStats[2])}`);
  console.log(`  Minting paused: ${citadelStats[3]}`);
  console.log(`  Redemption paused: ${citadelStats[4]}`);

  // Check active a-Tokens
  const activeATokens = await citadel.getActiveATokens();
  console.log(`Active a-Tokens: ${activeATokens.length}`);

  for (const tokenBytes32 of activeATokens) {
    const symbol = ethers.decodeBytes32String(tokenBytes32);
    const config = await citadel.getATokenConfig(tokenBytes32);
    console.log(`  • ${symbol}: ${config.tokenAddress}`);
    console.log(`    Collateral ratio: ${config.minimumCollateralRatio/100}%`);
    console.log(`    Minting fee: ${config.mintingFee/100}%`);
  }

  // Check token balances
  const azarBalance = await aZAR.balanceOf(deployer.address);
  const ausdBalance = await aUSD.balanceOf(deployer.address);
  console.log(`\nUser Token Balances:`);
  console.log(`  aZAR: ${ethers.formatEther(azarBalance)}`);
  console.log(`  aUSD: ${ethers.formatEther(ausdBalance)}`);

  // ========== SAVE DEPLOYMENT INFO ==========

  const deploymentInfo = {
    network: network.name,
    citadel: {
      address: citadelAddress,
      deploymentBlock: await citadel.deploymentTransaction().then(tx => tx.blockNumber),
      deployer: deployer.address
    },
    mockContracts: {
      trisulaReserve: trisulaReserveAddress,
      circuitBreaker: circuitBreakerAddress,
      stabilityFund: stabilityFundAddress,
      pivcTaxation: pivcTaxationAddress
    },
    aTokens: {
      aZAR: {
        address: aZARAddress,
        pegToken: ZARAddress,
        collateralRatio: 15000,
        mintingFee: 50
      },
      aUSD: {
        address: aUSDAddress,
        pegToken: USDCAddress,
        collateralRatio: 15000,
        mintingFee: 30
      }
    },
    pegTokens: {
      ZAR: ZARAddress,
      USDC: USDCAddress
    },
    testResults: {
      aZARMintingTested: true,
      aUSDMintingTested: true,
      collateralDeposited: zarCollateralAmount.toString(),
      tokensMinted: expectedAzarAmount.toString()
    },
    deploymentTime: new Date().toISOString(),
    genesisProtocol: "Part II - Citadel Smart Contract"
  };

  // Save to deployments folder
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `citadel-${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // ========== DEPLOYMENT COMPLETE ==========

  console.log("\n🎉 Citadel Smart Contract deployment complete!");
  console.log("Genesis Protocol - Part II: Citadel Smart Contract");
  console.log("\nNext steps:");
  console.log("1. Integrate with real Trisula Reserve and Circuit Breaker contracts");
  console.log("2. Deploy additional a-Tokens (aEUR, aGBP, etc.)");
  console.log("3. Set up price oracles for collateral ratio calculations");
  console.log("4. Implement liquidation incentives and mechanisms");
  console.log("5. Genesis Protocol implementation complete! 🎊");

  // Return deployment info for testing scripts
  return {
    citadel: citadelAddress,
    aTokens: {
      aZAR: aZARAddress,
      aUSD: aUSDAddress
    },
    pegTokens: {
      ZAR: ZARAddress,
      USDC: USDCAddress
    },
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