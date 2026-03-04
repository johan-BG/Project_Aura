const { ethers } = require("hardhat");
const deploymentdata = require("./deploymentdata.json");

async function main() {
    // Replace with the Token ID you want to check
    const tokenId = process.env.TOKEN_ID; 

    if (!tokenId) {
        console.error("Please provide a TOKEN_ID environment variable.");
        return;
    }

    const positionManagerAddress = deploymentdata.nonfungiblePositionManager;
    console.log("Checking Position Manager:", positionManagerAddress);

    const NonfungiblePositionManager = await ethers.getContractAt(
        "NonfungiblePositionManager",
        positionManagerAddress
    );

    console.log(`Fetching data for Token ID: ${tokenId}...`);
    const position = await NonfungiblePositionManager.positions(tokenId);

    console.log("Liquidity:", position.liquidity.toString());
    console.log("Tokens Owed 0:", position.tokensOwed0.toString());
    console.log("Tokens Owed 1:", position.tokensOwed1.toString());

    if (position.tokensOwed0.gt(0) || position.tokensOwed1.gt(0)) {
        console.log(">>> Dust Found! You should collect these fees.");
    } else {
        console.log(">>> No dust found. Position is clean.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
