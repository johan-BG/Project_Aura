import { ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { ARTIFACTS } from "../config";

// Helper to create SDK Token instances efficiently
const getSdkToken = (chainId, address, decimals, symbol, name) => {
  return new Token(chainId, address, parseInt(decimals), symbol, name);
};


// Helper to calculate ticks (Full Range or concentrated)
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
// ... inside your LiquidityProvider ...

export const addLiquidity = async (tokenA, tokenB, poolAddress, amountA, amountB , contracts ,signer ,account) => {
  
  try {

    const amount0Wei = ethers.utils.parseUnits(amountA, tokenA.decimals);
    const amount1Wei = ethers.utils.parseUnits(amountB, tokenB.decimals);

    const token0Contract = new ethers.Contract(tokenA.tokenAddress, ARTIFACTS.ERC20, signer);
    const token1Contract = new ethers.Contract(tokenB.tokenAddress, ARTIFACTS.ERC20, signer);

    console.log("Checking approvals...");

    // Check and Approve Token A
    const allowanceA = await token0Contract.allowance(account, contracts.manager.address);
    if (allowanceA.lt(amount0Wei)) {
      console.log("Approving Token A...");
      const txA = await token0Contract.approve(contracts.manager.address, amount0Wei);
      await txA.wait();
    }

    // Check and Approve Token B
    const allowanceB = await token1Contract.allowance(account, contracts.manager.address);
    if (allowanceB.lt(amount1Wei)) {
      console.log("Approving Token B...");
      const txB = await token1Contract.approve(contracts.manager.address, amount1Wei);
      await txB.wait();
    }
    // 1. Re-use existing contracts from state
    
    const poolContract = new ethers.Contract(poolAddress, ARTIFACTS.pool, signer);
    
    // 2. Fetch Pool Data in parallel
    const [tickSpacing, fee, liquidity, slot0, chainId] = await Promise.all([
      poolContract.tickSpacing(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
      signer.getChainId()
    ]);

    // 3. Setup SDK Objects
    const TokenA = getSdkToken(chainId, tokenA.tokenAddress, tokenA.decimals, tokenA.symbol, tokenA.name);
    const TokenB = getSdkToken(chainId, tokenB.tokenAddress, tokenB.decimals, tokenB.symbol, tokenB.name);

    const pool = new Pool(
      TokenA, TokenB, fee, 
      slot0.sqrtPriceX96.toString(), 
      liquidity.toString(), 
      slot0.tick
    );

    // 4. Calculate Position (using Mint Amounts)
    const ticks = getTickRange(slot0.tick, tickSpacing,true); // True for Full Range
    
    let existingTokenId = null;
    const balance = await contracts.manager.balanceOf(account);

    console.log(`Checking ${balance} existing positions for a match...`);

    for (let i = 0; i < balance; i++) {
      const tokenId = await contracts.manager.tokenOfOwnerByIndex(account, i);
      const positionData = await contracts.manager.positions(tokenId);

      // Check if this NFT matches our Pool and Tick Range
      const isSamePool = 
        positionData.token0.toLowerCase() === pool.token0.address.toLowerCase() &&
        positionData.token1.toLowerCase() === pool.token1.address.toLowerCase() &&
        positionData.fee === fee;

      const isSameRange = 
        positionData.tickLower === ticks.lower && 
        positionData.tickUpper === ticks.upper;

      if (isSamePool && isSameRange) {
        existingTokenId = tokenId;
        break; // Found it!
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
      console.log(`Matching position found (ID: ${existingTokenId}). Increasing liquidity...`);
      
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
      console.log("No matching position found. Minting new NFT...");

    // 5. Execute Transaction
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

    // Extract the tokenId from the event arguments
    const tokenId = event.args.tokenId.toString();
    // Return the TokenID from the transfer event
    return tokenId;
  } catch (error) {
    console.error("Add Liquidity Failed:", error);
  }
};
