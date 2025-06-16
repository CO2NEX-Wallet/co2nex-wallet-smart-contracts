require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 🔑 Apillon Auth
const API_KEY = process.env.APILLON_API_KEY;
const API_SECRET = process.env.APILLON_API_SECRET;
const AUTH_HEADER = `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`;

// 📂 Folder to upload (GEE Analysis Folder)
const folderPath = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/GEE_Analysis/';

// 📁 Where to save CID records
const recordsPath = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/SmartContract_Records/';
if (!fs.existsSync(recordsPath)) fs.mkdirSync(recordsPath, { recursive: true });

// 🌐 Apillon API Endpoint
const UPLOAD_URL = 'https://api.apillon.io/storage/file';

async function uploadFile(filePath, fileName) {
  const fileData = fs.readFileSync(filePath);

  const response = await axios.post(UPLOAD_URL, fileData, {
    headers: {
      'Authorization': AUTH_HEADER,
      'Content-Type': 'application/octet-stream',
      'x-apillon-filename': fileName,
    },
  });

  const cid = response.data.data.cid;

  console.log(`✅ Uploaded: ${fileName}`);
  console.log(`🔗 CID: ${cid}`);
  console.log(`🔗 IPFS URL: https://${cid}.ipfs.cf-ipfs.com/${fileName}`);

  return { file: fileName, cid };
}

async function uploadFolder() {
  const files = fs.readdirSync(folderPath);
  const cidList = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const cidEntry = await uploadFile(filePath, file);
    cidList.push(cidEntry);
  }

  // ✅ Save CIDs to ipfs_cid_GEE.json (Separate from metadata CIDs)
  const cidJsonPath = path.join(recordsPath, 'ipfs_cid_GEE.json');
  fs.writeFileSync(cidJsonPath, JSON.stringify(cidList, null, 2));

  console.log(`✅ All GEE CIDs saved to ${cidJsonPath}`);
}

uploadFolder().catch((err) => {
  console.error('❌ Upload failed:', err.response ? err.response.data : err);
});
