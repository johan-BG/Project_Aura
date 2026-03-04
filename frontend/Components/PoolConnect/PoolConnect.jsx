import React, { useState } from "react";
import Image from "next/image";

// INTERNAL IMPORT
import Style from "./PoolConnect.module.css";
import images from "../../assets";

const PoolConnect = ({setClosePool,getAllLiquidity,removeLiquidityAndUpdateUserdata,account, collectFees,connectWallet}) => {
  const [loading, setLoading] = useState(null); // Store tokenId being processed

  const handleRemoveLiquidity = async (tokenId) => {
    setLoading(tokenId);
    try {
      await removeLiquidityAndUpdateUserdata(tokenId);
      alert("Liquidity removed successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to remove liquidity. See console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleCollectFees = async (tokenId) => {
    setLoading(tokenId);
    try {
        await collectFees(tokenId);
        alert("Fees collected successfully!");
    } catch (error) {
        console.error(error);
        alert("Failed to collect fees. See console.");
    } finally {
        setLoading(null);
    }
  };

  return (
    <div className={Style.PoolConnect}>
      <div className={Style.PoolConnect_box}>
        <div className={Style.PoolConnect_box_header}>
          <h2>Pool</h2>
          <p onClick={()=> setClosePool(true)}>+ New Position</p>
        </div>

{ !account ?(
        <div className={Style.PoolConnect_box_Middle}>
          <Image src={images.wallet} alt="wallet" height={80} width={80} />
          <p>Your active V3 liquidity positions will appear here.</p>
          <button onClick={() =>connectWallet()}>Connect Wallet</button>
        </div>
):(
  <div className={Style.PoolConnect_box_liquidity}>
    <div className={Style.PoolConnect_box_liquidity_header}>
      <p>Your Position {getAllLiquidity.length}</p>
    </div>
    {getAllLiquidity.map((el,i)=>(
      <div className={Style.PoolConnect_box_liquidity_box} key={i}>
        <div className={Style.PoolConnect_box_liquidity_list}>
          <p>
            <small className={Style.mark}>
              {el.poolExample.token0.name}
            </small>{" "}
            <small className={Style.mark}>
              {el.poolExample.token1.name}
            </small>{" "}
            {/* <span className={ Style.paragraph, Style.hide }>
              {el.poolExample.token0.name}/{el.poolExample.token1.name}
            </span>{" "} */}
            <small className={Style.mark}>
              {el.poolExample.fee}
            </small>{" "}
          </p>
          <p className={Style.highligth}>In Range</p>
        </div>
        <div className={Style.PoolConnect_box_liquidity_list_info}>
          <p>
          <small>Your Current Position</small>{" "}
          <span>
            {el.poolExample.token0.name} : {" "} {el.currentAmount0}
          </span>
          <span>
            {el.poolExample.token1.name} : {" "} {el.currentAmount1}
          </span>
          {/* <span className={Style.hide}>
            {el.poolExample.token0.name} per {""} {el.poolExample.token1.name}
          </span> */}
          </p>
        </div>
        <div className={Style.PoolConnect_box_liquidity_list_button}>
          {el.liquidity == "0" ? (
             <button
                onClick={() => handleCollectFees(el.tokenId)}
                disabled={loading === el.tokenId}
             >
                {loading === el.tokenId ? "Processing..." : "Claim Fees"}
             </button>
          ) : (
            <button 
                onClick={() => handleRemoveLiquidity(el.tokenId)}
                disabled={loading === el.tokenId}
            >
                {loading === el.tokenId ? "Processing..." : "Remove Liquidity"}
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)}
        <div className={Style.PoolConnect_box_info}>
          <div className={Style.PoolConnect_box_info_left}>
            <h5>Learn about providing liquidity</h5>
            <p>Check out our v3 LP walkthrough and migrate guide</p>
          </div>
          <div className={Style.PoolConnect_box_info_right}>
            <h5>Top pools</h5>
            <p>Explore Uniswap Analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolConnect;
