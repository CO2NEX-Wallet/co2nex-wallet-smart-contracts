require('dotenv').config();
const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const tokenAddress = process.env.CONTRACT_ADDRESS;
  if (!tokenAddress) {
    console.error('❌ CONTRACT_ADDRESS not found in .env');
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();

  console.log('🚀 Deploying Escrow contract with account:', deployer.address);
  console.log('💰 Account balance:', (await deployer.getBalance()).toString());

  const Escrow = await hre.ethers.getContractFactory('Escrow1155');
  const escrow = await Escrow.deploy(tokenAddress);

  await escrow.deployed();

  console.log('✅ Escrow deployed to:', escrow.address);

  const projectFolder = process.env.DEFAULT_PROJECT_FOLDER || 'CO2NEX_HIBC_Project_0002';
  const saveDir = path.join('../co2nex-project-data/', projectFolder, 'SmartContract_Records');
  const savePath = path.join(saveDir, 'escrow_address.txt');

  // Ensure directory exists
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  fs.writeFileSync(savePath, escrow.address);
  console.log(`📄 Escrow address saved to: ${savePath}`);
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});
