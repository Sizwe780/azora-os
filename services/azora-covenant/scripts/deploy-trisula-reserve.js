/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Trisula Reserve - Diversified Collateral System...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Mock price oracle address (would be Chainlink in production)
  const mockPriceOracle = "0x0000000000000000000000000000000000000000";

  // Deploy Trisula Reserve
  const TrisulaReserve = await ethers.getContractFactory("TrisulaReserve");
  const reserve = await TrisulaReserve.deploy(mockPriceOracle);

  await reserve.deployed();

  console.log("🎉 Trisula Reserve deployed successfully!");
  console.log("Contract address:", reserve.address);
  console.log("Transaction hash:", reserve.deployTransaction.hash);

  // Initialize with Genesis Reserve assets
  console.log("\n🔧 Initializing Genesis Reserve assets...");

  // In production, these would be real token addresses
  const mockAZR = "0x1111111111111111111111111111111111111111";
  const mockUSDC = "0x2222222222222222222222222222222222222222";
  const mockRWA = "0x3333333333333333333333333333333333333333";

  // Add AZR (40% target)
  await reserve.addReserveAsset(mockAZR, 0, "AZR", 4000);
  console.log("✅ Added AZR to reserve");

  // Add USDC (35% target)
  await reserve.addReserveAsset(mockUSDC, 1, "USDC", 3500);
  console.log("✅ Added USDC to reserve");

  // Add RWA (25% target)
  await reserve.addReserveAsset(mockRWA, 2, "RWA", 2500);
  console.log("✅ Added RWA to reserve");

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log("- Contract: Trisula Reserve");
  console.log("- Address:", reserve.address);
  console.log("- Network:", network.name);
  console.log("- Deployer:", deployer.address);
  console.log("- Reserve Assets: 3 (AZR, USDC, RWA)");
  console.log("- Target Allocation: 40% AZR, 35% USDC, 25% RWA");

  return reserve.address;
}

main()
  .then((address) => {
    console.log("\n🎯 Trisula Reserve deployment completed successfully!");
    console.log("Reserve Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });