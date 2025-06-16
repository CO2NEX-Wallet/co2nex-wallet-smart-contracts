const fs = require('fs');
const path = require('path');

function saveCID(cid) {
  const recordPath = '../co2nex-project-data/CO2NEX_HIBC_Project_0002/SmartContract_Records/ipfs_cid.txt';

  fs.writeFileSync(recordPath, cid, 'utf8');
  console.log(`✅ CID saved to ${recordPath}`);
}

module.exports = { saveCID };
