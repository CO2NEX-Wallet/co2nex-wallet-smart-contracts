require('dotenv').config();
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Load Apillon API credentials
const APILLON_AUTH = process.env.APILLON_AUTH;
const METADATA_FOLDER = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/Metadata_IPFS/';

async function uploadFolderToApillon() {
  const files = fs.readdirSync(METADATA_FOLDER);
  const uploaded = [];

  for (const file of files) {
    const filePath = path.join(METADATA_FOLDER, file);
    const data = fs.readFileSync(filePath);

    const res = await axios.post(
      'https://api.apillon.io/storage/upload-file',
      data,
      {
        headers: {
          'Authorization': `Basic ${APILLON_AUTH}`,
          'Content-Type': 'application/octet-stream',
          'X-Apillon-Filename': file
        }
      }
    );

    console.log(`✅ Uploaded ${file} → CID: ${res.data.data.cid}`);
    uploaded.push(res.data.data.cid);
  }

  return uploaded[0]; // Assuming metadata.json is first
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);

  // Upload metadata to IPFS
  const ipfsCID = await uploadFolderToApillon();
  fs.writeFileSync('../co2nex-project-data/CO2NEX_HIBC_Project_0002/SmartContract_Records/ipfs_cid.txt', ipfsCID);

  // Deploy token contract
  const Token = await hre.ethers.getContractFactory("CO2NEX1155");
  const token = await Token.deploy(`ipfs://${ipfsCID}/{id}.json`);
  await token.deployed();
  console.log("✅ Token deployed to:", token.address);

  // Save Token info
  fs.writeFileSync('../co2nex-project-data/CO2NEX_HIBC_Project_0002/SmartContract_Records/token_address.txt', token.address);

  // Deploy Escrow contract
  const Escrow = await hre.ethers.getContractFactory("Escrow1155");
  const escrow = await Escrow.deploy(token.address);
  await escrow.deployed();
  console.log("✅ Escrow deployed to:", escrow.address);

  // Save Escrow info
  fs.writeFileSync('../co2nex-project-data/CO2NEX_HIBC_Project_0002/SmartContract_Records/escrow_address.txt', escrow.address);

  console.log("🎉 Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
