require('dotenv').config();
const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

// Auth for Infura IPFS
const auth = 'Basic ' + Buffer.from(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_PROJECT_SECRET).toString('base64');

// IPFS client setup
const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

// 📂 Path to Metadata Folder
const folderPath = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/Metadata_IPFS/';

async function uploadToIPFS() {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath);

      const result = await client.add({ path: file, content: fileContent });

      console.log(`✅ Uploaded: ${file}`);
      console.log(`🔗 IPFS CID: https://ipfs.io/ipfs/${result.cid}`);
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
  }
}

uploadToIPFS();
