const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CO2NEX1155 Token Contract", function () {
  let Token, token;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    Token = await ethers.getContractFactory("CO2NEX1155");
    token = await Token.deploy();
    await token.deployed();
  });

  it("Should deploy with correct owner", async function () {
    expect(await token.owner()).to.equal(owner.address);
  });

  it("Should mint correctly with Token ID", async function () {
    const tokenId = 1;
    const amount = 500;

    await token.mint(addr1.address, tokenId, amount, "0x");
    const balance = await token.balanceOf(addr1.address, tokenId);

    expect(balance).to.equal(amount);
  });

  it("Should return correct URI if set", async function () {
    const tokenId = 1;
    const amount = 500;
    const baseUri = "ipfs://testcid/";

    await token.setURI(baseUri);
    await token.mint(addr1.address, tokenId, amount, "0x");

    const uri = await token.uri(tokenId);
    expect(uri).to.equal(`${baseUri}${tokenId}.json`);
  });
});
