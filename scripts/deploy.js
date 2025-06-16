require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // ✅ Project folder from command line
  if (process.argv.length < 3) {
    console.error('❌ Please provide the project folder name.');
    console.error('Example: node scripts/deploy.js CO2NEX_HIBC_Project_0002');
    process.exit(1);
  }
  const projectFolder = process.argv[2];

  const recordsPath = `../co2nex-project-data/${projectFolder}/SmartContract_Records/`;
  if (!fs.existsSync(recordsPath)) fs.mkdirSync(recordsPath, { recursive: true });

  // ✅ Read CID from ipfs_cid.json
  const cidFile = path.join(recordsPath, 'ipfs_cid.json');
  if (!fs.existsSync(cidFile)) {
    console.error('❌ ipfs_cid.json not found.');
    process.exit(1);
  }

  const cidData = JSON.parse(fs.readFileSync(cidFile, 'utf8'));
  const metadataCid = cidData.find(f => f.file === 'metadata.json')?.cid;
  if (!metadataCid) {
    console.error('❌ metadata.json CID not found in ipfs_cid.json');
    process.exit(1);
  }

  const metadataURI = `ipfs://${metadataCid}`;

  console.log("🚀 Deploying contract...");
  const Token = await hre.ethers.getContractFactory("CO2NEX1155");
  const token = await Token.deploy(metadataURI);
  await token.deployed();

  console.log(`✅ Contract deployed at: ${token.address}`);

  // ✅ Save contract address
  fs.writeFileSync(path.join(recordsPath, 'contract_address.txt'), token.address);

  // ✅ Initial Token ID (hardcoded or configurable)
  const tokenId = Date.now(); // Example token ID based on timestamp
  fs.writeFileSync(path.join(recordsPath, 'token_id.txt'), tokenId.toString());

  console.log(`🆔 Token ID: ${tokenId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
