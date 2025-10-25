/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ethers } from "ethers";

async function createWallet() {
  console.log("🔑 Creating new Ethereum wallet for Azora OS development...\n");

  // Create a random wallet
  const wallet = ethers.Wallet.createRandom();

  console.log("✅ New wallet created!");
  console.log("📧 Address:", wallet.address);
  console.log("🔐 Private Key:", wallet.privateKey);
  console.log("🔑 Public Key:", wallet.publicKey);
  console.log("🎯 Mnemonic:", wallet.mnemonic?.phrase);
  console.log("📏 Private Key Length:", wallet.privateKey.length, "(should be 66 characters: 0x + 64 hex)");
  console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
  console.log("   - Save this private key securely");
  console.log("   - Never commit private keys to version control");
  console.log("   - Use this only for development/testing");
  console.log("   - Fund this address with test ETH for Sepolia network");
  console.log("\n💡 Next steps:");
  console.log("   1. Copy the private key to your .env file");
  console.log("   2. Get test ETH from https://sepoliafaucet.com/");
  console.log("   3. Deploy contracts with: npx hardhat run scripts/deploy.js --network sepolia");
}

createWallet().catch(console.error);