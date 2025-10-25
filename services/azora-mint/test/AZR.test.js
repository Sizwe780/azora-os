/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const { expect } = require("chai");

describe("AZR", function () {
  it("Should mint rewards correctly", async function () {
    const [owner, user] = await ethers.getSigners();
    const KYC = await ethers.getContractFactory("KYC");
    const kyc = await KYC.deploy();
    const AZR = await ethers.getContractFactory("AZR");
    const azr = await AZR.deploy(kyc.address);

    await kyc.verify(user.address);
    await azr.mintReward(user.address, 100);
    expect(await azr.balanceOf(user.address)).to.equal(100);
  });
});
