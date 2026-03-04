import { ethers } from "ethers";

/**
 * Simulates a swap to get the expected output amount
 */
export const getQuoteExactInput = async (quoterContract, params) => {
  const { tokenIn, tokenOut, fee, amountIn, sqliteSqrtPriceLimitX96 } = params;

  try {
    // callStatic simulates the transaction without sending it to the blockchain
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      amountIn: amountIn, // Ensure this is a BigNumber or string
      sqrtPriceLimitX96: sqliteSqrtPriceLimitX96 || 0 // Must be 'sqrtPriceLimitX96'
    });
    return quotedAmountOut.amountOut.toString();
  } catch (error) {
    console.error("Quote Exact Input Error:", error);
    return "0";
  }
};

/**
 * Simulates a swap to find how much input is required for a specific output
 */
export const getQuoteExactOutput = async (quoterContract, params) => {
  const { tokenIn, tokenOut, fee, amountOut, sqliteSqrtPriceLimitX96 } = params;
  try {
    const quotedAmountIn = await quoterContract.callStatic.quoteExactOutputSingle({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      amount: amountOut,
      // CRITICAL: The smart contract key MUST be 'sqrtPriceLimitX96'
      sqrtPriceLimitX96: sqliteSqrtPriceLimitX96 || 0 
    });

    return quotedAmountIn[0].toString();
  } catch (error) {
    console.error("Quote Exact Output Error:", error);
    return "0";
  }
};