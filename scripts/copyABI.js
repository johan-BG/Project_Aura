// copyFiles.js
const fs = require("fs");
const path = require("path");

// Define source and destination directories
const sourceDir = "artifacts/contracts";
const destDir = "Context";

// List of files to copy (just names, not paths)
const filesToCopy = [
  "ERC20Aura.sol\\AuraCoin.json",
  "ERC20Boo.sol\\BooCoin.json",
  "Interfaces\\IWETH.sol\\IWETH.json",
  "SwapMultiHop.sol\\SwapMultiHop.json",
  "SwapToken.sol\\SingleSwapToken.json",
  "storeUserData.sol\\UserStorageData.json"
  //"..\\@openzeppelin\\contracts\\token\\ERC20\\ERC20.sol\\ERC20.json",
];

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy files one by one
filesToCopy.forEach((file) => {
  const srcPath = path.join(sourceDir, file);
  const destPath = path.join(destDir, path.basename(file));

  fs.copyFile(srcPath, destPath, (err) => {
    if (err) {
      console.error(`❌ Error copying ${file}:`, err);
    } else {
      console.log(`✅ Copied: ${srcPath} to ${destPath}`);
    }
  });
});
