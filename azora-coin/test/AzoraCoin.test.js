const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AzoraCoin", function () {
  it("Should mint tokens", async function () {
    const [owner] = await ethers.getSigners();
    const AzoraCoin = await ethers.getContractFactory("AzoraCoin");
    const azoraCoin = await AzoraCoin.deploy(owner.address);
    await azoraCoin.deployed();

    await azoraCoin.mint(owner.address, 100);
    expect(await azoraCoin.balanceOf(owner.address)).to.equal(100);
  });
});
