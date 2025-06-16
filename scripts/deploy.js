require('dotenv').config();
const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log('🚀 Deploying CO2NEX1155 contract with account:', deployer.address);
  console.log('💰 Account balance:', (await deployer.getBalance()).toString());

  const Token = await hre.ethers.getContractFactory('CO2NEX1155');
  const token = await Token.deploy();

  await token.deployed();

  console.log('✅ CO2NEX1155 deployed to:', token.address);

  // Optional: Save contract address to a file
  const fs = require('fs');
  fs.writeFileSync(
    './deployment_token_address.txt',
    `CO2NEX1155 Contract Address: ${token.address}\n`
  );
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});
