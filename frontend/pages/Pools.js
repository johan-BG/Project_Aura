import React, { useState, useContext } from "react";
import Image from "next/image";


import images from "../assets";
import Style from "../styles/Pools.module.css";

import { PoolAdd, PoolConnect } from "../Components/index";

import { useSwapContext } from "../Context/SwapContext";
import { useLiquidity } from "../Context/LiquidityContext"; 

const Pool = () => {
  
  const { account, tokenData, connectWallet } = useSwapContext();
  
  
  const { 
    allLiquidity, 
    createLiquidityAndPool, 
    removeLiquidityAndUpdateData, 
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
          getAllLiquidity={allLiquidity} 
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