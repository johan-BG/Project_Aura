const fs = require("fs");

const tokendata = JSON.parse(fs.readFileSync("scripts/tokendata.json", "utf8"));
const deploymentdata=JSON.parse(fs.readFileSync("scripts/deploymentdata.json", "utf8"));

shoaibAddress=tokendata.shoaib;
rayyanAddress=tokendata.rayyan;
popUpAddress=tokendata.popUp;

wethAdress=deploymentdata.weth;
factoryAddress=deploymentdata.factory;
swapRouterAddress=deploymentdata.swapRouter;
nftDescriptorAddress=deploymentdata.nftDescriptor;
positionDescriptorAddress=deploymentdata.nonfungibleTokenPositionDescriptor;
positionManagerAddress=deploymentdata.nonfungiblePositionManager;

// console.log(shoaibAddress);
const artifacts = {
    UniswapV3Factory:require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
    NonfungiblePositionManager:require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonFungiblePositionManager.json")
};

const {Contract,BigNumber} = require("ethers");
const bn = require("bignumber.js");
bn.config({EXPONENTIAL_AT:999999,DECIMAL_PLACES:40});
const { ethers } = require("hardhat");

require("dotenv").config();
const MAINNET_URL=`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;

const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

function encodePriceSqrt(reserve1,reserve0){
    return BigNumber.from(
        new bn(reserve1.toString())
            .div(reserve0.toString())
            .sqrt()
            .multipliedBy(new bn(2).pow(96))
            .integerValue(3)
            .toString()
    );
}

const nonfungiblePositionManager = new Contract(
    positionManagerAddress,
    artifacts.NonfungiblePositionManager.abi,
    provider
);

const factory = new Contract(
    factoryAddress,
    artifacts.UniswapV3Factory.abi,
    provider
);

async function deployPool(token0,token1,fee,price){
    const [owner] = await ethers.getSigners();
    await nonfungiblePositionManager
        .connect(owner)
        .createAndInitializePoolIfNecessary(token0,token1,fee,price,{
            gasLimit:5000000,
        });

    const poolAddress = await factory.connect(owner).getPool(token0,token1,fee);
    return poolAddress;
}

async function main() {
    const shoRay = await deployPool(
        shoaibAddress,
        rayyanAddress,
        500,
        encodePriceSqrt(1,1)
    );
    console.log("Sho_Ray",`${shoRay}`);
    deploymentdata.sho_ray=shoRay;
    fs.writeFileSync(
                "scripts/deploymentdata.json",
                JSON.stringify(deploymentdata, null, 2)
            );
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });