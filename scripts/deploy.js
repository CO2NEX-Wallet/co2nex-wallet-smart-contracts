const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("CO2NEX1155");
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token deployed at:", token.address);

  const Escrow = await hre.ethers.getContractFactory("Escrow1155");
  const escrow = await Escrow.deploy(token.address);
  await escrow.deployed();
  console.log("Escrow deployed at:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
