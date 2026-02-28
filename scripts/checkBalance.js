const { ethers } = require("hardhat");
const deploymentdata = require("./deploymentdata.json");

// Define the token address you want to check (Aura Coin or other)
// You can change this or pass it as env var
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || deploymentdata.weth; // Defaulting to something, but user likely wants Aura

async function main() {
    const [signer] = await ethers.getSigners();
    const userAddress = await signer.getAddress();
    
    console.log("Checking balance for user:", userAddress);
    console.log("Token Address:", TOKEN_ADDRESS);

    const tokenContract = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);
    
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    console.log(`Balance Raw: ${balance.toString()}`);
    console.log(`Balance Formatted: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });