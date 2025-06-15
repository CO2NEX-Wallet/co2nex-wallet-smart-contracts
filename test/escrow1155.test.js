const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Escrow1155", function () {
  let Token, Escrow, token, escrow;
  let owner, buyer, seller;

  beforeEach(async function () {
    [owner, buyer, seller] = await ethers.getSigners();

    Token = await ethers.getContractFactory("CO2NEX1155");
    token = await Token.deploy();
    await token.deployed();

    Escrow = await ethers.getContractFactory("Escrow1155");
    escrow = await Escrow.deploy(token.address);
    await escrow.deployed();

    // Mint tokens to buyer
    await token.mint(buyer.address, 1, 1000, "0x"); // Carbon
  });

  it("Should create a deal and hold tokens", async function () {
    await token.connect(buyer).setApprovalForAll(escrow.address, true);

    await expect(escrow.connect(buyer).createDeal(seller.address, 1, 500))
      .to.emit(escrow, "DealCreated")
      .withArgs(1, buyer.address, seller.address, 1, 500);

    const balance = await token.balanceOf(escrow.address, 1);
    expect(balance).to.equal(500);
  });

  it("Should release tokens to seller", async function () {
    await token.connect(buyer).setApprovalForAll(escrow.address, true);
    await escrow.connect(buyer).createDeal(seller.address, 1, 500);

    await expect(escrow.connect(buyer).releaseDeal(1))
      .to.emit(escrow, "DealReleased")
      .withArgs(1);

    const sellerBalance = await token.balanceOf(seller.address, 1);
    expect(sellerBalance).to.equal(500);

    const escrowBalance = await token.balanceOf(escrow.address, 1);
    expect(escrowBalance).to.equal(0);
  });

  it("Should not release twice", async function () {
    await token.connect(buyer).setApprovalForAll(escrow.address, true);
    await escrow.connect(buyer).createDeal(seller.address, 1, 500);

    await escrow.connect(buyer).releaseDeal(1);
    await expect(escrow.connect(buyer).releaseDeal(1)).to.be.revertedWith("Deal already released");
  });

  it("Should block unauthorized release", async function () {
    await token.connect(buyer).setApprovalForAll(escrow.address, true);
    await escrow.connect(buyer).createDeal(seller.address, 1, 500);

    await expect(escrow.connect(seller).releaseDeal(1)).to.be.revertedWith("Not authorized");
  });
});
