const { execSync } = require('child_process');
const fs = require('fs');
const path = require("path");

// Capture the network from the command line: --network sepolia
const args = process.argv.slice(2);
const networkIndex = args.indexOf('--network');
const network = networkIndex !== -1 ? args[networkIndex + 1] : 'localhost';

console.log(`🚀 Starting deployment on network: ${network}\n`);

const runCommand = (cmd) => {
  try {
    console.log(`Executing: ${cmd}`);
    // This runs the command and pipes the output to your terminal
    execSync(cmd, { stdio: 'inherit' }); 
  } catch (error) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
};

// Define your sequence of scripts
runCommand(`npx hardhat run scripts/uniswapContract.js --network ${network}`);
runCommand(`npx hardhat run scripts/deploy.js --network ${network}`);
runCommand(`npx hardhat run scripts/deployToken.js --network ${network}`);
runCommand(`node scripts/copyABI.js`);

fs.rename(path.join(__dirname,"../../frontend/address.json"), path.join(__dirname,`../../frontend/${network}_address.json`), (err) => {
  if (err) throw err;
  console.log('Rename complete!');
});

console.log("\n✅ All scripts executed successfully!");