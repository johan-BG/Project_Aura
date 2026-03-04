const { NonfungiblePositionManager } = require("@uniswap/v3-sdk");
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
sho_RayAddress=deploymentdata.sho_ray;


const artifacts = {
    NonfungiblePositionManager:require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    Shoaib:require("../artifacts/contracts/Shoaib.sol/Shoaib.json"),
    Rayyan:require("../artifacts/contracts/Rayyan.sol/Rayyan.json"),
    UniswapV3Pool:require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")
};

const {Contract, providers} = require("ethers");
const {Token} = require("@uniswap/sdk-core");
const {Pool,Position,nearestUsableTick}=require("@uniswap/v3-sdk");
const { ethers } = require("hardhat");

async function getPoolData(poolContract){
    const [tickSpacing,fee,liquidity,slot0]=await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0()
    ]);
    return {
        tickSpacing:tickSpacing,
        fee:fee,
        liquidity:liquidity,
        sqrtPriceX96:slot0[0],
        tick:slot0[1]
    };
}

async function main()
{
    const [owner,signer1]=await ethers.getSigners();
    const provider = waffle.provider;

    const ShoaibContract = new Contract(
        shoaibAddress,
        artifacts.Shoaib.abi,
        provider
    );
    const RayyanContract= new Contract(
        rayyanAddress,
        artifacts.Rayyan.abi,
        provider
    );
     await ShoaibContract.connect(owner).approve(
        positionManagerAddress,
        ethers.utils.parseEther("1000")
     );
     await RayyanContract.connect(owner).approve(
        positionManagerAddress,
        ethers.utils.parseEther("1000")
     );

     const poolContract = new Contract(
        sho_RayAddress,
        artifacts.UniswapV3Pool.abi,
        provider
     );
     console.log("token");
     const poolData = await getPoolData(poolContract);

     const ShoaibToken = new Token(31337,shoaibAddress,18,"Shoaib","Tether");
     const RayyanToken = new Token(31337,rayyanAddress,18,"Rayyan","RayyanCoin");

     const pool = new Pool(
        ShoaibToken,
        RayyanToken,
        poolData.fee,
        poolData.sqrtPriceX96.toString(),
        poolData.liquidity.toString(),
        poolData.tick
     );
     console.log("pool");
     const position  =Position.fromAmounts({
        pool:pool,
        //liquidity:ethers.utils.parseEther("1"),
        tickLower:nearestUsableTick(poolData.tick,poolData.tickSpacing)-poolData.tickSpacing*2,
        tickUpper:nearestUsableTick(poolData.tick,poolData.tickSpacing)+poolData.tickSpacing*2,
        amount0: ethers.utils.parseUnits("1000", 18).toString(), // Use actual decimals
        amount1: ethers.utils.parseUnits("1000", 18).toString(), // Use actual decimals
        useFullPrecision: true
     });

     console.log("position")
     const {amount0:amount0Desired,amount1:amount1Desired}= position.mintAmounts;
     console.log(amount0Desired,amount1Desired);
     params = {
        token0:shoaibAddress,
        token1:rayyanAddress,
        fee:poolData.fee,
        tickLower:nearestUsableTick(poolData.tick,poolData.tickSpacing)-poolData.tickSpacing*2,
        tickUpper:nearestUsableTick(poolData.tick,poolData.tickSpacing)+poolData.tickSpacing*2,
        amount0Desired:amount0Desired.toString(),
        amount1Desired:amount1Desired.toString(),
        amount0Min:0,
        amount1Min:0,
        recipient:owner.address,
        deadline: Math.floor(Date.now() / 1000) + 60 * 10,
     };

     const nonfungiblePositionManager = new Contract(
        positionManagerAddress,
        artifacts.NonfungiblePositionManager.abi,
        provider
     );

     const tx = await nonfungiblePositionManager
                    .connect(owner)
                    .mint(params,{gasLimit:"1000000"});
     const receipt = await tx.wait();
     console.log(receipt);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });