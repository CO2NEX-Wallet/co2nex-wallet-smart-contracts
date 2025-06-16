const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow1155 Contract", function () {
  let Token, Escrow;
  let token, escrow;
  let owner, addr1, addr2;
  const tokenId = 1;
  const depositAmount = 100;

  beforeEach(async function () {
    // Get the contract factories
    [owner, addr1, addr2] = await ethers.getSigners();

    Token = await ethers.getContractFactory("CO2NEX1155");
    token = await Token.deploy();
    await token.deployed();

    // Mint tokens to addr1
    await token.connect(owner).mint(addr1.address, tokenId, 1000, "0x");

    // Deploy the escrow contract
    Escrow = await ethers.getContractFactory("Escrow1155");
    escrow = await Escrow.deploy(token.address);
    await escrow.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await escrow.tokenAddress()).to.equal(token.address);
    });
  });

  describe("Deposit", function () {
    it("Should allow users to deposit tokens into escrow", async function () {
      // Approve escrow to transfer tokens
      await token.connect(addr1).setApprovalForAll(escrow.address, true);

      // Deposit tokens
      await expect(
        escrow.connect(addr1).deposit(tokenId, depositAmount)
      ).to.emit(escrow, "Deposited")
        .withArgs(addr1.address, tokenId, depositAmount);

      const balance = await escrow.balanceOf(addr1.address, tokenId);
      expect(balance).to.equal(depositAmount);

      const walletBalance = await token.balanceOf(addr1.address, tokenId);
      expect(walletBalance).to.equal(1000 - depositAmount);
    });

    it("Should fail if approval is not given", async function () {
      await expect(
        escrow.connect(addr1).deposit(tokenId, depositAmount)
      ).to.be.revertedWith("ERC1155: caller is not approved");
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await token.connect(addr1).setApprovalForAll(escrow.address, true);
      await escrow.connect(addr1).deposit(tokenId, depositAmount);
    });

    it("Should allow users to withdraw tokens from escrow", async function () {
      await expect(
        escrow.connect(addr1).withdraw(tokenId, depositAmount)
      ).to.emit(escrow, "Withdrawn")
        .withArgs(addr1.address, tokenId, depositAmount);

      const balance = await escrow.balanceOf(addr1.address, tokenId);
      expect(balance).to.equal(0);

      const walletBalance = await token.balanceOf(addr1.address, tokenId);
      expect(walletBalance).to.equal(1000);
    });

    it("Should fail if trying to withdraw more than deposited", async function () {
      await expect(
        escrow.connect(addr1).withdraw(tokenId, depositAmount + 1)
      ).to.be.revertedWith("Not enough balance in escrow");
    });
  });

  describe("Ownership & Admin", function () {
    it("Should restrict ownership-only functions", async function () {
      await expect(
        escrow.connect(addr1).setTokenAddress(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner can change token address", async function () {
      await escrow.connect(owner).setTokenAddress(addr2.address);
      expect(await escrow.tokenAddress()).to.equal(addr2.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should not allow depositing zero tokens", async function () {
      await token.connect(addr1).setApprovalForAll(escrow.address, true);
      await expect(
        escrow.connect(addr1).deposit(tokenId, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should not allow withdrawing zero tokens", async function () {
      await expect(
        escrow.connect(addr1).withdraw(tokenId, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });
  });
});
