const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const initialOwner = deployer.address; // Treasury address
  const azoraCoin = await hre.ethers.deployContract("AzoraCoin", [initialOwner]);

  await azoraCoin.waitForDeployment();

  console.log(
    `AzoraCoin (AZR) with 1,000,000 supply deployed to ${azoraCoin.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
