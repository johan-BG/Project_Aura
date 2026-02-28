const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const network = hre.network.name;
    const [deployer] = await hre.ethers.getSigners();
    
    console.log(`Deploying contracts on ${network} network`);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Deployer balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

    const deploymentData = {
        network: network,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {}
    };
    const gasOverrides = {
        maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
        };
    // Deploy BooCoin
    console.log("Deploying BooCoin...");
    const BooCoin = await hre.ethers.getContractFactory("BooCoin");
    const booCoin = await BooCoin.deploy();
    await booCoin.deployed();
    deploymentData.contracts.BooCoin = booCoin.address;
    console.log(`✅ BooCoin deployed at ${booCoin.address}`);

    // Deploy AuraCoin
    console.log("Deploying AuraCoin...");
    const AuraCoin = await hre.ethers.getContractFactory("AuraCoin");
    const auraCoin = await AuraCoin.deploy();
    await auraCoin.deployed();
    deploymentData.contracts.AuraCoin = auraCoin.address;
    console.log(`✅ AuraCoin deployed at ${auraCoin.address}`);

    // Deploy SingleSwapToken
    console.log("Deploying SingleSwapToken...");
    const SingleSwapToken = await hre.ethers.getContractFactory("SingleSwapToken");
    const singleSwapToken = await SingleSwapToken.deploy();
    await singleSwapToken.deployed();
    deploymentData.contracts.SingleSwapToken = singleSwapToken.address;
    console.log(`✅ SingleSwapToken deployed at ${singleSwapToken.address}`);

    //Deploy SwapMultiHop
    console.log("Deploying SwapMultiHop...");
    const SwapMultiHop = await hre.ethers.getContractFactory("SwapMultiHop");
    const swapMultiHop = await SwapMultiHop.deploy();
    await swapMultiHop.deployed();
    deploymentData.contracts.SwapMultiHop = swapMultiHop.address;
    console.log(`✅ SwapMultiHop deployed at ${swapMultiHop.address}`);

    console.log("Deploying UserStorageData...");
    const UserStorageData = await hre.ethers.getContractFactory("UserStorageData");
    const userStorageData = await UserStorageData.deploy();
    await userStorageData.deployed();
    deploymentData.contracts.UserStorageData = userStorageData.address;
    console.log(`✅ UserStorageData deployed at ${userStorageData.address}`);

    // Save to address.json
    const addressesPath = path.join(__dirname, "../Context/address.json");
    fs.writeFileSync(
        addressesPath,
        JSON.stringify(deploymentData, null, 2)
    );
    
    console.log(`\n📝 Deployment data saved to ${addressesPath}`);
    console.log("\nDeployed Contracts:");
    console.log(JSON.stringify(deploymentData.contracts, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});