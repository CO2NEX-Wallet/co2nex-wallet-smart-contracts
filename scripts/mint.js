const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  const Token = await hre.ethers.getContractFactory("CO2NEX1155");
  const token = await Token.attach("YOUR_DEPLOYED_TOKEN_CONTRACT_ADDRESS");

  const tx = await token.mint(owner.address, 1, 1000, "0x");
  await tx.wait();

  console.log("Minted 1000 Carbon Credits to", owner.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
