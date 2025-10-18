const hre = require("hardhat");

async function main() {
  console.log("🪙 Deploying Azora Coin - \$1.00 USD Value");
  console.log("==========================================");
  console.log("");
  
  const [deployer, board1, board2, founder1] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  console.log("");
  
  // Deploy Azora Coin
  const AzoraCoin = await hre.ethers.getContractFactory("AzoraCoin");
  const azoraCoin = await AzoraCoin.deploy(deployer.address, deployer.address);
  await azoraCoin.deployed();
  
  console.log("✅ Azora Coin deployed to:", azoraCoin.address);
  console.log("");
  
  // Get contract details
  const name = await azoraCoin.name();
  const symbol = await azoraCoin.symbol();
  const maxSupply = await azoraCoin.MAX_SUPPLY();
  const usdValue = await azoraCoin.USD_VALUE();
  const totalStudents = await azoraCoin.totalStudentsJoined();
  
  console.log("📋 Contract Details:");
  console.log("  Name:", name);
  console.log("  Symbol:", symbol);
  console.log("  Max Supply:", hre.ethers.utils.formatEther(maxSupply), "AZR");
  console.log("  USD Value:", hre.ethers.utils.formatEther(usdValue), "USD per AZR");
  console.log("  Students Joined:", totalStudents.toString());
  console.log("");
  
  // Grant roles to board members
  console.log("👥 Setting up board members...");
  const BOARD_ROLE = await azoraCoin.BOARD_ROLE();
  
  if (board1) {
    await azoraCoin.grantRole(BOARD_ROLE, board1.address);
    console.log("  ✓ Board Member 1:", board1.address);
  }
  
  if (board2) {
    await azoraCoin.grantRole(BOARD_ROLE, board2.address);
    console.log("  ✓ Board Member 2:", board2.address);
  }
  console.log("");
  
  // Allocate to test founder
  if (founder1) {
    console.log("💰 Allocating tokens to founder...");
    await azoraCoin.allocateToFounder(founder1.address, hre.ethers.utils.parseEther("1000"));
    const founderInfo = await azoraCoin.getFounderInfo(founder1.address);
    console.log("  ✓ Founder:", founder1.address);
    console.log("  ✓ Allocated:", hre.ethers.utils.formatEther(founderInfo.allocated), "AZR (\$" + hre.ethers.utils.formatEther(founderInfo.allocated) + " USD)");
    console.log("");
  }
  
  // Register test student
  console.log("🎓 Registering test student...");
  const testStudent = hre.ethers.Wallet.createRandom();
  await azoraCoin.registerStudent(testStudent.address, hre.ethers.utils.parseEther("10"));
  const studentBalance = await azoraCoin.balanceOf(testStudent.address);
  console.log("  ✓ Student:", testStudent.address);
  console.log("  ✓ Signup Bonus:", hre.ethers.utils.formatEther(studentBalance), "AZR (\$" + hre.ethers.utils.formatEther(studentBalance) + " USD)");
  console.log("");
  
  console.log("🎉 Deployment Complete!");
  console.log("");
  console.log("⚠️  SAVE THIS INFORMATION:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract Address:", azoraCoin.address);
  console.log("Deployer:", deployer.address);
  console.log("Board Member 1:", board1?.address || "N/A");
  console.log("Board Member 2:", board2?.address || "N/A");
  console.log("Test Founder:", founder1?.address || "N/A");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Add to .env:");
  console.log(`AZORA_COIN_CONTRACT=${azoraCoin.address}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
