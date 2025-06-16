require('dotenv').config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [owner] = await hre.ethers.getSigners();

  // ✅ Project Folder as input argument
  if (process.argv.length < 3) {
    console.error('❌ Please provide the project folder name.');
    console.error('Example: node scripts/mint.js CO2NEX_HIBC_Project_0002');
    process.exit(1);
  }
  const projectFolder = process.argv[2];

  // ✅ Paths to data
  const recordsPath = `../co2nex-project-data/${projectFolder}/SmartContract_Records/`;
  const tokenIdFile = path.join(recordsPath, 'token_id.txt');
  const ipfsCidFile = path.join(recordsPath, 'ipfs_cid.json');

  // ✅ Read token ID
  if (!fs.existsSync(tokenIdFile)) {
    console.error(`❌ token_id.txt not found in ${recordsPath}`);
    process.exit(1);
  }
  const tokenId = parseInt(fs.readFileSync(tokenIdFile, 'utf8').trim());

  // ✅ Read IPFS CID
  if (!fs.existsSync(ipfsCidFile)) {
    console.error(`❌ ipfs_cid.json not found in ${recordsPath}`);
    process.exit(1);
  }
  const cidData = JSON.parse(fs.readFileSync(ipfsCidFile, 'utf8'));
  const metadataCid = cidData.find(f => f.file === 'metadata.json')?.cid;
  if (!metadataCid) {
    console.error('❌ metadata.json CID not found in ipfs_cid.json');
    process.exit(1);
  }

  // ✅ Contract connection
  const Token = await hre.ethers.getContractFactory("CO2NEX1155");
  const token = await Token.attach(process.env.CONTRACT_ADDRESS);

  // ✅ Mint parameters
  const amount = 1000; // Mint 1000 credits (or change as needed)
  const metadataURI = `ipfs://${metadataCid}`;

  console.log(`🚀 Minting Token ID ${tokenId} with ${amount} units`);
  console.log(`🔗 Metadata URI: ${metadataURI}`);

  // ✅ Mint the token
  const tx = await token.mint(
    owner.address,  // Recipient address
    tokenId,        // Token ID
    amount,         // Amount to mint
    "0x"            // Data (empty)
  );
  await tx.wait();

  console.log(`✅ Minted ${amount} of Token ID ${tokenId} to ${owner.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
