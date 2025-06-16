require('dotenv').config();
const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

// Auth for Infura IPFS
const auth = 'Basic ' + Buffer.from(
  process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET
).toString('base64');

// IPFS client setup
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: { authorization: auth },
});

// ⛔ Folder argument missing handler
if (process.argv.length < 3) {
  console.error('❌ Please provide the project folder name.');
  console.error('Example: node scripts/ipfs_upload.js CO2NEX_HIBC_Project_0002');
  process.exit(1);
}

const projectFolder = process.argv[2];
const folderPath = `../co2nex-project-data/${projectFolder}/Metadata_IPFS/`;

async function uploadToIPFS() {
  try {
    const files = fs.readdirSync(folderPath);
    const results = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath);

      const result = await client.add({ path: file, content: fileContent });

      console.log(`✅ Uploaded: ${file}`);
      console.log(`🔗 IPFS CID: https://ipfs.io/ipfs/${result.cid}`);
      
      results.push({ file: file, cid: result.cid.toString() });
    }

    // Save CIDs locally for reference
    const outputPath = `../co2nex-project-data/${projectFolder}/SmartContract_Records/ipfs_cid.json`;
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log(`📝 Saved CIDs to ${outputPath}`);
  } catch (err) {
    console.error('❌ Upload error:', err);
  }
}

uploadToIPFS();
