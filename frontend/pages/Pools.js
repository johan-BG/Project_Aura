import React, { useState, useContext } from "react";
import Image from "next/image";

// INTERNAL IMPORT
import images from "../assets";
import Style from "../styles/Pools.module.css";

import { PoolAdd, PoolConnect } from "../Components/index";
// Import both contexts
import { useSwapContext } from "../Context/SwapContext";
import { useLiquidity } from "../Context/LiquidityContext"; // Using the custom hook we made

const Pool = () => {
  // 1. Get Wallet/Token data from SwapContext
  const { account, tokenData, connectWallet } = useSwapContext();
  
  // 2. Get all Liquidity actions and data from LiquidityContext
  const { 
    allLiquidity, 
    createLiquidityAndPool, 
    removeLiquidityAndUpdateData, // Ensure this is moved to LiquidityContext
    collectFees,
    isLoading 
  } = useLiquidity();

  const [closePool, setClosePool] = useState(false);

  return (
    <div className={Style.Pool}>
      {closePool ? (
        <PoolAdd 
          account={account} 
          setClosePool={setClosePool} 
          tokenData={tokenData} 
          createLiquidityAndPool={createLiquidityAndPool} 
        />
      ) : (
        <PoolConnect 
          setClosePool={setClosePool} 
          getAllLiquidity={allLiquidity} // Pass the state from context
          removeLiquidityAndUpdateUserdata={removeLiquidityAndUpdateData} 
          account={account} 
          collectFees={collectFees} 
          isLoading={isLoading}
          connectWallet={connectWallet}
        />
      )}
    </div>
  );
};

export default Pool;