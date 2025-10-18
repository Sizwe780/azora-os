import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { AzoraCoin } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("AzoraCoin", function () {
  let azoraCoin: AzoraCoin;
  let deployer: SignerWithAddress, 
      azora: SignerWithAddress, 
      board1: SignerWithAddress,
      board2: SignerWithAddress,
      board3: SignerWithAddress,
      user1: SignerWithAddress,
      user2: SignerWithAddress;
  
  const complianceHash1 = ethers.keccak256(ethers.toUtf8Bytes("compliance_record_1"));
  const complianceHash2 = ethers.keccak256(ethers.toUtf8Bytes("compliance_record_2"));
  const mintAmount = ethers.parseEther("100");

  beforeEach(async function () {
    // Get signers
    [deployer, azora, board1, board2, board3, user1, user2] = await ethers.getSigners();
    
    // Deploy AzoraCoin
    const AzoraCoin = await ethers.getContractFactory("AzoraCoin");
    
    // Board members addresses (human founders)
    const boardMembers = [
      board1.address,
      board2.address,
      board3.address
    ];
    
    // AZORA address (AI Founder)
    const azoraAddress = azora.address;
    
    // Deploy the proxy
    azoraCoin = await upgrades.deployProxy(AzoraCoin, [
      boardMembers,
      azoraAddress
    ], { initializer: 'initialize' }) as unknown as AzoraCoin;

    await azoraCoin.waitForDeployment();
  });

  describe("Initialization", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await azoraCoin.name()).to.equal("Azora Coin");
      expect(await azoraCoin.symbol()).to.equal("AZR");
    });
    
    it("Should assign roles correctly", async function () {
      const BOARD_ROLE = await azoraCoin.BOARD_ROLE();
      const AZORA_ROLE = await azoraCoin.AZORA_ROLE();
      
      // Check AZORA role
      expect(await azoraCoin.hasRole(AZORA_ROLE, azora.address)).to.be.true;
      
      // Check board roles
      expect(await azoraCoin.hasRole(BOARD_ROLE, board1.address)).to.be.true;
      expect(await azoraCoin.hasRole(BOARD_ROLE, board2.address)).to.be.true;
      expect(await azoraCoin.hasRole(BOARD_ROLE, board3.address)).to.be.true;
    });
  });

  describe("Proof of Compliance Minting", function () {
    it("Should allow AZORA to propose a mint", async function () {
      const tx = await azoraCoin.connect(azora).proposeMint(
        user1.address,
        mintAmount,
        complianceHash1,
        "0x" // Empty compliance proof for testing
      );
      
      const receipt = await tx.wait();
      if (!receipt?.logs) throw new Error("No logs in receipt");
      
      // Get event from logs
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      expect(event).to.not.be.undefined;
    });
    
    it("Should allow board members to approve and execute minting", async function () {
      // AZORA proposes mint
      const tx = await azoraCoin.connect(azora).proposeMint(
        user1.address,
        mintAmount,
        complianceHash1,
        "0x" // Empty compliance proof for testing
      );
      
      const receipt = await tx.wait();
      if (!receipt?.logs) throw new Error("No logs in receipt");
      
      // Get request ID from event
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      if (!event) throw new Error("MintRequested event not found");
      const requestId = event.args[0];
      
      // Board members approve
      await azoraCoin.connect(board1).approveMint(requestId);
      await azoraCoin.connect(board2).approveMint(requestId);
      
      // Check user balance
      expect(await azoraCoin.balanceOf(user1.address)).to.equal(mintAmount);
    });
    
    it("Should prevent double-processing of the same compliance record", async function () {
      // First mint with compliance record
      const tx1 = await azoraCoin.connect(azora).proposeMint(
        user1.address,
        mintAmount,
        complianceHash1,
        "0x"
      );
      
      const receipt1 = await tx1.wait();
      if (!receipt1?.logs) throw new Error("No logs in receipt");
      
      const event1 = receipt1.logs.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      if (!event1) throw new Error("MintRequested event not found");
      const requestId1 = event1.args[0];
      
      // Board members approve
      await azoraCoin.connect(board1).approveMint(requestId1);
      await azoraCoin.connect(board2).approveMint(requestId1);
      
      // Try to reuse the same compliance record
      await expect(
        azoraCoin.connect(azora).proposeMint(
          user2.address,
          mintAmount,
          complianceHash1,
          "0x"
        )
      ).to.be.revertedWith("Compliance record already processed");
    });
    
    it("Should enforce daily mint limits", async function () {
      // Set a very low daily mint limit for testing
      const lowLimit = ethers.parseEther("150");
      await azoraCoin.connect(deployer).updateDailyMintLimit(lowLimit);
      
      // First mint within limit
      const tx1 = await azoraCoin.connect(azora).proposeMint(
        user1.address,
        mintAmount, // 100 AZR
        complianceHash1,
        "0x"
      );
      
      const receipt1 = await tx1.wait();
      const event1 = receipt1?.logs?.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      if (!event1) throw new Error("MintRequested event not found");
      const requestId1 = event1.args[0];
      
      // Board members approve first mint
      await azoraCoin.connect(board1).approveMint(requestId1);
      await azoraCoin.connect(board2).approveMint(requestId1);
      
      // Second mint that would exceed the limit
      const tx2 = await azoraCoin.connect(azora).proposeMint(
        user2.address,
        mintAmount, // Another 100 AZR, which would exceed 150 AZR limit
        complianceHash2,
        "0x"
      );
      
      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs?.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      if (!event2) throw new Error("MintRequested event not found");
      const requestId2 = event2.args[0];
      
      // Board members try to approve second mint, but it should fail at execution
      await azoraCoin.connect(board1).approveMint(requestId2);
      
      // This should fail due to daily limit
      await expect(
        azoraCoin.connect(board2).approveMint(requestId2)
      ).to.be.revertedWith("Daily mint limit exceeded");
    });
  });

  describe("Pausing and Security Features", function () {
    it("Should allow pausing and unpausing by authorized users", async function () {
      // Grant pauser role to board1
      const PAUSER_ROLE = await azoraCoin.PAUSER_ROLE();
      await azoraCoin.connect(deployer).grantRole(PAUSER_ROLE, board1.address);
      
      // Pause the token
      await azoraCoin.connect(board1).pause();
      
      // Try to transfer (should fail)
      await expect(
        azoraCoin.connect(user1).transfer(user2.address, ethers.parseEther("1"))
      ).to.be.reverted;
      
      // Unpause
      await azoraCoin.connect(board1).unpause();
      
      // Now transfer should work (if user1 had any tokens)
      // We'll first mint some tokens to user1
      const tx = await azoraCoin.connect(azora).proposeMint(
        user1.address,
        mintAmount,
        complianceHash2,
        "0x"
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs?.find((log: any) => 
        log.fragment?.name === "MintRequested"
      );
      
      if (!event) throw new Error("MintRequested event not found");
      const requestId = event.args[0];
      
      // Board members approve
      await azoraCoin.connect(board1).approveMint(requestId);
      await azoraCoin.connect(board2).approveMint(requestId);
      
      // Now transfer should work
      await azoraCoin.connect(user1).transfer(user2.address, ethers.parseEther("1"));
      
      expect(await azoraCoin.balanceOf(user2.address)).to.equal(ethers.parseEther("1"));
    });
  });
});