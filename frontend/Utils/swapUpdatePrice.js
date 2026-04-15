import { ethers } from "ethers";

/**
 * Simulates a swap to get the expected output amount
 */
export const getQuoteExactInput = async (quoterContract, params) => {
  const { tokenIn, tokenOut, fee, amountIn, sqliteSqrtPriceLimitX96 } = params;

    
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      amountIn: amountIn, 
      sqrtPriceLimitX96: sqliteSqrtPriceLimitX96 || 0 
    });
    return quotedAmountOut.amountOut.toString();
};

/**
 * Simulates a swap to find how much input is required for a specific output
 */
export const getQuoteExactOutput = async (quoterContract, params) => {
  const { tokenIn, tokenOut, fee, amountOut, sqliteSqrtPriceLimitX96 } = params;
    const quotedAmountIn = await quoterContract.callStatic.quoteExactOutputSingle({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      amount: amountOut,
      
      sqrtPriceLimitX96: sqliteSqrtPriceLimitX96 || 0 
    });

    return quotedAmountIn[0].toString();
};