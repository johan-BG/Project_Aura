import { ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { ARTIFACTS } from "../config";


const getSdkToken = (chainId, address, decimals, symbol, name) => {
  return new Token(chainId, address, parseInt(decimals), symbol, name);
};



const getTickRange = (tick, tickSpacing, isFullRange = false) => {
  if (isFullRange) {
    return {
      lower: nearestUsableTick(-887272, tickSpacing),
      upper: nearestUsableTick(887272, tickSpacing),
    };
  }
  return {
    lower: nearestUsableTick(tick, tickSpacing) - tickSpacing * 2,
    upper: nearestUsableTick(tick, tickSpacing) + tickSpacing * 2,
  };
};


export const addLiquidity = async (tokenA, tokenB, poolAddress, amountA, amountB , contracts ,signer ,account) => {
  
  try {

    const amount0Wei = ethers.utils.parseUnits(amountA, tokenA.decimals);
    const amount1Wei = ethers.utils.parseUnits(amountB, tokenB.decimals);

    const token0Contract = new ethers.Contract(tokenA.tokenAddress, ARTIFACTS.ERC20, signer);
    const token1Contract = new ethers.Contract(tokenB.tokenAddress, ARTIFACTS.ERC20, signer);

    

    
    const allowanceA = await token0Contract.allowance(account, contracts.manager.address);
    if (allowanceA.lt(amount0Wei)) {
      
      const txA = await token0Contract.approve(contracts.manager.address, amount0Wei);
      await txA.wait();
    }

    
    const allowanceB = await token1Contract.allowance(account, contracts.manager.address);
    if (allowanceB.lt(amount1Wei)) {
      
      const txB = await token1Contract.approve(contracts.manager.address, amount1Wei);
      await txB.wait();
    }
    
    
    const poolContract = new ethers.Contract(poolAddress, ARTIFACTS.pool, signer);
    
    
    const [tickSpacing, fee, liquidity, slot0, chainId] = await Promise.all([
      poolContract.tickSpacing(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
      signer.getChainId()
    ]);

    
    const TokenA = getSdkToken(chainId, tokenA.tokenAddress, tokenA.decimals, tokenA.symbol, tokenA.name);
    const TokenB = getSdkToken(chainId, tokenB.tokenAddress, tokenB.decimals, tokenB.symbol, tokenB.name);

    const pool = new Pool(
      TokenA, TokenB, fee, 
      slot0.sqrtPriceX96.toString(), 
      liquidity.toString(), 
      slot0.tick
    );

    
    const ticks = getTickRange(slot0.tick, tickSpacing,true); 
    
    let existingTokenId = null;
    const balance = await contracts.manager.balanceOf(account);

    

    for (let i = 0; i < balance; i++) {
      const tokenId = await contracts.manager.tokenOfOwnerByIndex(account, i);
      const positionData = await contracts.manager.positions(tokenId);

      
      const isSamePool = 
        positionData.token0.toLowerCase() === pool.token0.address.toLowerCase() &&
        positionData.token1.toLowerCase() === pool.token1.address.toLowerCase() &&
        positionData.fee === fee;

      const isSameRange = 
        positionData.tickLower === ticks.lower && 
        positionData.tickUpper === ticks.upper;

      if (isSamePool && isSameRange) {
        existingTokenId = tokenId;
        break; 
      }
    }

    const position = Position.fromAmounts({
      pool,
      tickLower: ticks.lower,
      tickUpper: ticks.upper,
      amount0: ethers.utils.parseUnits(amountA, tokenA.decimals).toString(),
      amount1: ethers.utils.parseUnits(amountB, tokenB.decimals).toString(),
      useFullPrecision: true,
    });

    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

    let receipt;
    if (existingTokenId) {
      
      
      const increaseParams = {
        tokenId: existingTokenId,
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        amount0Min: 0,
        amount1Min: 0,
        deadline: Math.floor(Date.now() / 1000) + 1200,
      };

      const tx = await contracts.manager.increaseLiquidity(increaseParams, { gasLimit: 500000 });
      receipt = await tx.wait();
    }
    else {
      

    
    const params = {
      token0: pool.token0.address,
      token1: pool.token1.address,
      fee: fee,
      tickLower: ticks.lower,
      tickUpper: ticks.upper,
      amount0Desired: amount0Desired.toString(),
      amount1Desired: amount1Desired.toString(),
      amount0Min: 0,
      amount1Min: 0,
      recipient: account,
      deadline: Math.floor(Date.now() / 1000) + 1200,
    };

    const tx = await contracts.manager.mint(params, { gasLimit: 3000000 });
    receipt = await tx.wait();
  }
    
    const event = receipt.events.find((e) => e.event === "IncreaseLiquidity");

    if (!event) {
    throw new Error("Could not find IncreaseLiquidity event in transaction receipt.");
    }

    
    const tokenId = event.args.tokenId.toString();
    
    return tokenId;
  } catch (error) {
    console.error("Add Liquidity Failed:", error);
  }
};
