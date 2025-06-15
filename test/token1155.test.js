const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CO2NEX1155 Token", function () {
  it("Should mint correctly", async function () {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("CO2NEX1155");
    const token = await Token.deploy();
    await token.deployed();

    await token.mint(addr1.address, 1, 500, "0x");
    const balance = await token.balanceOf(addr1.address, 1);
    expect(balance).to.equal(500);
  });
});
