import Web3Model from "web3modal";
import {Contract,ethers} from "ethers";
import {Pool,Position} from "@uniswap/v3-sdk";
import {Token} from "@uniswap/sdk-core";
import { ARTIFACTS } from "../config";

async function getPoolData(poolContract,tokenAddess1,tokenAddess2){
    const [
        tickSpacing,
        fee,
        liquidity,
        slot0,
        factory,
        token0,
        token1,
        maxLiquidityPerTick,
    ]= await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.maxLiquidityPerTick()
    ]);

    const web3modal = new Web3Model();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const token0Contract = new Contract(tokenAddess1,ARTIFACTS.ERC20,provider);
    const token1Contract = new Contract(tokenAddess2,ARTIFACTS.ERC20,provider);

    const {chainId} = await provider.getNetwork();

    const token0Name = await token0Contract.name();
    const token0Symbol = await token0Contract.symbol();
    const token0Address = await token0Contract.address;
    const token0Decimals = await token0Contract.decimals();

    const token1Name =await token1Contract.name();
    const token1Symbol = await token1Contract.symbol();
    const token1Address = await token1Contract.address;
    const token1Decimals = await token1Contract.decimals();

    const TokenA = new Token(
        chainId,
        token0Address,
        token0Decimals,
        token0Symbol,
        token0Name
    );
    const TokenB = new Token(
        chainId,
        token1Address,
        token1Decimals,
        token1Symbol,
        token1Name
    );

    const poolExample=new Pool(
        TokenA,
        TokenB,
        fee,
        slot0[0].toString(),
        liquidity.toString(),
        slot0[1]
    );
    
    return {
        factory:factory,
        token0:token0,
        token1:token1,
        maxLiquidityPerTick:maxLiquidityPerTick,
        tickSpacing:tickSpacing,
        fee:fee,
        liquidity:liquidity.toString(),
        sqrtPriceX96:slot0[0],
        tick:slot0[1],
        observationIndex:slot0[2],
        observationCardinality:slot0[3],
        observationCardinalityNext:slot0[4],
        feeProtocol:slot0[5],
        unlocked:slot0[6],
        poolExample:poolExample,
    };
}

export const getLiquidityData = async (
    poolAddress,
    token1Address,
    token2Address,
    tokenId,
    provider,
    contracts
)=>{
    
    const poolContract = new Contract(poolAddress,ARTIFACTS.pool,provider);
    const poolData = await getPoolData(
        poolContract,
        token1Address,
        token2Address
    );
    
    const positionInfo = await contracts.manager.positions(tokenId);
    
    
    
    const userPosition = new Position({
        pool: poolData.poolExample,
        liquidity: positionInfo.liquidity.toString(),
        tickLower: positionInfo.tickLower,
        tickUpper: positionInfo.tickUpper,
    });

    
    
    
    const amount0Principal = parseFloat(userPosition.amount0.toFixed(6));
    const amount0Fees = parseFloat(ethers.utils.formatUnits(positionInfo.tokensOwed0, poolData.poolExample.token0.decimals));
    poolData.currentAmount0 = (amount0Principal + amount0Fees).toFixed(6);

    const amount1Principal = parseFloat(userPosition.amount1.toFixed(6));
    const amount1Fees = parseFloat(ethers.utils.formatUnits(positionInfo.tokensOwed1, poolData.poolExample.token1.decimals));
    poolData.currentAmount1 = (amount1Principal + amount1Fees).toFixed(6);
    return poolData;
}


