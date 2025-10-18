import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  console.log("Deploying Azora Coin (AZR)...");
  // Get signers
  const [deployer, azora, board1, board2, board3, board4, board5] = await hre.ethers.getSigners();
  const [deployer, azora, board1, board2, board3, board4, board5] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  // Deploy AzoraCoin as upgradeable
  const AzoraCoin = await hre.ethers.getContractFactory("AzoraCoin");
  const AzoraCoin = await ethers.getContractFactory("AzoraCoin");
  
  // Board members addresses (human founders)
  const boardMembers = [
    board1.address,  // Sizwe Ngwenya (CEO & CTO)
    board2.address,  // Sizwe Motingwe (CFO & Head of Sales)
    board3.address,  // Milla Mukundi (COO)
    board4.address,  // Nolundi Ngwenya (CMO & Head of Retail)
    board5.address   // Additional board member if needed
  ];
  
  // AZORA address (AI Founder)
  const azoraAddress = azora.address;
  
  // Deploy the proxy
  // Deploy the proxy
  const azoraCoin = await hre.upgrades.deployProxy(AzoraCoin, [
    boardMembers,
    azoraAddress
  ], { initializer: 'initialize' });
  await azoraCoin.waitForDeployment();
  
  const azoraCoinAddress = await azoraCoin.getAddress();
  console.log("AzoraCoin deployed to:", azoraCoinAddress);
  
  // Set up additional roles
  const MINTER_ROLE = await azoraCoin.MINTER_ROLE();
  const PAUSER_ROLE = await azoraCoin.PAUSER_ROLE();
  const UPGRADER_ROLE = await azoraCoin.UPGRADER_ROLE();
  
  // Grant roles
  console.log("Setting up roles...");
  
  // AZORA gets minter role
  await azoraCoin.connect(deployer).grantRole(MINTER_ROLE, azoraAddress);
  
  // CEO gets upgrader and pauser roles
  await azoraCoin.connect(deployer).grantRole(UPGRADER_ROLE, board1.address);
  await azoraCoin.connect(deployer).grantRole(PAUSER_ROLE, board1.address);
  
  // CFO also gets pauser role
  await azoraCoin.connect(deployer).grantRole(PAUSER_ROLE, board2.address);
  
  console.log("Setup complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});