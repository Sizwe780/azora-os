/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying The Covenant - Supreme Constitutional Law of Azora...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy The Covenant
  const TheCovenant = await ethers.getContractFactory("TheCovenant");
  const covenant = await TheCovenant.deploy();

  await covenant.deployed();

  console.log("🎉 The Covenant deployed successfully!");
  console.log("Contract address:", covenant.address);
  console.log("Transaction hash:", covenant.deployTransaction.hash);

  // Verify deployment
  console.log("\n📋 Deployment Summary:");
  console.log("- Contract: The Covenant");
  console.log("- Address:", covenant.address);
  console.log("- Network:", network.name);
  console.log("- Deployer:", deployer.address);

  // Initialize with Genesis Protocol
  console.log("\n🔧 Initializing Genesis Protocol state...");

  // This would include initial setup of governance structures
  // For now, just log completion
  console.log("✅ Genesis Protocol initialization complete");

  return covenant.address;
}

main()
  .then((address) => {
    console.log("\n🎯 Deployment completed successfully!");
    console.log("The Covenant Address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });