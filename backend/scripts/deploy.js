const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { json } = require("stream/consumers");

async function main() {
    const network = hre.network.name;
    const [deployer] = await hre.ethers.getSigners();
    
    console.log(`Deploying contracts on ${network} network`);
    console.log(`Deployer address: ${deployer.address}`);
    console.log(`Deployer balance: ${hre.ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);

    const deploymentData=JSON.parse(fs.readFileSync(path.join(__dirname,"../../frontend/address.json"), "utf8"));
    const gasOverrides = {
        maxFeePerGas: ethers.utils.parseUnits('100', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei'),
        };
    // Deploy BooCoin
    console.log("Deploying BooCoin...");
    const BooCoin = await hre.ethers.getContractFactory("BooCoin");
    const booCoin = await BooCoin.deploy();
    await booCoin.deployed();
    deploymentData.BooCoin = booCoin.address;
    console.log(`booCoin: ${booCoin.address}`);

    // Deploy AuraCoin
    console.log("Deploying AuraCoin...");
    const AuraCoin = await hre.ethers.getContractFactory("AuraCoin");
    const auraCoin = await AuraCoin.deploy();
    await auraCoin.deployed();
    deploymentData.AuraCoin = auraCoin.address;
    console.log(`auraCoin: ${auraCoin.address}`);

    // Deploy SingleSwapToken
    console.log("Deploying SingleSwapToken...");
    const SingleSwapToken = await hre.ethers.getContractFactory("SingleSwapToken");
    const singleSwapToken = await SingleSwapToken.deploy(deploymentData.AuraCoin,deploymentData.factory,deploymentData.swaprouter);
    await singleSwapToken.deployed();
    deploymentData.SingleSwapToken = singleSwapToken.address;
    console.log(`singleSwapToken: ${singleSwapToken.address}`);

    //Deploy SwapMultiHop
    console.log("Deploying SwapMultiHop...");
    const SwapMultiHop = await hre.ethers.getContractFactory("SwapMultiHop");
    const swapMultiHop = await SwapMultiHop.deploy();
    await swapMultiHop.deployed();
    deploymentData.SwapMultiHop = swapMultiHop.address;
    console.log(`swapMultiHop: ${swapMultiHop.address}`);

    console.log("Deploying UserStorageData...");
    const UserStorageData = await hre.ethers.getContractFactory("UserStorageData");
    const userStorageData = await UserStorageData.deploy();
    await userStorageData.deployed();
    deploymentData.UserStorageData = userStorageData.address;
    console.log(`userStorageData: ${userStorageData.address}`);

    // Save to address.json
    const addressesPath = path.join(__dirname, "../../frontend/address.json");
    fs.writeFileSync(
        addressesPath,
        JSON.stringify(deploymentData, null, 2)
    );

    fs.writeFileSync(
        path.join(__dirname, "../server/utils/contract.json"),
        JSON.stringify(deploymentData.AuraCoin,null,0)
    );
    
    console.log(`\n📝 Deployment data saved to ${addressesPath}`);
    console.log("\nDeployed Contracts:");
    console.log(JSON.stringify(deploymentData.contracts, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});