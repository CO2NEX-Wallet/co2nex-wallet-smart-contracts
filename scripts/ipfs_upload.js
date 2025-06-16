require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { saveCID } = require('./cid_writer');

// 🔑 Auth
const API_KEY = process.env.APILLON_API_KEY;
const API_SECRET = process.env.APILLON_API_SECRET;
const AUTH_HEADER = `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`;

// 📂 Folder path
const folderPath = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/Metadata_IPFS/';

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

  console.log(`✅ Uploaded: ${fileName}`);
  console.log(`🔗 CID: ${response.data.data.cid}`);
  console.log(`🔗 IPFS URL: https://${response.data.data.cid}.ipfs.cf-ipfs.com/${fileName}`);

  return response.data.data.cid;
}

async function uploadFolder() {
  const files = fs.readdirSync(folderPath);
  let mainCid = null;

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const cid = await uploadFile(filePath, file);

    if (file === 'metadata.json') {
      mainCid = cid;
    }
  }

  if (mainCid) {
    saveCID(mainCid);
  } else {
    console.warn('⚠️ metadata.json not found. CID not saved.');
  }
}

uploadFolder();
