/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy KYC
  const KYC = await hre.ethers.getContractFactory("KYC");
  const kyc = await KYC.deploy();
  await kyc.deployed();
  console.log("KYC deployed to:", kyc.address);

  // Deploy AZR
  const AZR = await hre.ethers.getContractFactory("AZR");
  const azr = await AZR.deploy(kyc.address);
  await azr.deployed();
  console.log("AZR deployed to:", azr.address);

  // Verify contracts
  await hre.run("verify:verify", { address: kyc.address });
  await hre.run("verify:verify", { address: azr.address, constructorArguments: [kyc.address] });
}

main().catch(console.error);
