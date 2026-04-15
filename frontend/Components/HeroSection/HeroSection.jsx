import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import Style from "./HeroSection.module.css";
import images from "../../assets";
import { Token, SearchToken } from "../index";
import { useSwapContext } from "../../Context/SwapContext";
import { useLiquidity } from "../../Context/LiquidityContext";

const HeroSection = () => {
  
  const [openSetting, setOpenSetting] = useState(false);
  const { fetchUserPositions } = useLiquidity();
  const [openToken, setOpenToken] = useState(false);
  const [openTokenTwo, setOpenTokenTwo] = useState(false);
  const [loading,setLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [tokenSwapOutPut, setTokenSwapOutPut] = useState("");
  const [poolMessage, setPoolMessage] = useState("");
  const [isOut, setIsOut] = useState(false); 
  const [disable,setDisable] = useState(false);
  const [tokenOne, setTokenOne] = useState({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
  });
  const [tokenTwo, setTokenTwo] = useState({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
  });

  
  
  const {
    account,
    tokenData,
    provider,
    connectWallet,
    singleSwap, 
    getSwapQuote
  } = useSwapContext();

  
  const fetchPrice = async (value, isOutputDirection) => {
    if (!value || value <= 0) {
      setTokenSwapOutPut("");
      setPoolMessage("");
      setSearch(false);
      return;
    }
    if( tokenOne.tokenAddress=="" || tokenTwo.tokenAddress=="" ) {
      setPoolMessage("Please provide token details");
      setDisable(true);
      return;
    }
    setSearch(true);
    try {
      
      const result = await getSwapQuote(
        isOutputDirection,
        tokenOne.tokenAddress,
        tokenTwo.tokenAddress,
        3000,
        isOutputDirection?value*0.9995:value
      )
      if(!result.swap){
          setPoolMessage(result.error);
          setDisable(true);
      }
       else {
        const data = result.amount;
        if (isOutputDirection) {
          const amountOut=ethers.utils.formatUnits(data,tokenTwo.decimals);
          setTokenSwapOutPut(amountOut);
          setPoolMessage(`${value} ${tokenOne.symbol} = ${amountOut.slice(0,7)} ${tokenTwo.symbol}`);
        } else {
          
          
          const amountIn =Number(ethers.utils.formatUnits(data, tokenOne.decimals)) * 1.0005;
          if(amountIn>tokenOne.tokenBalance)
          {
            setPoolMessage("You don't have enough balance");
            setDisable(true);
          }
          else
            setPoolMessage(
              `Requires ~${amountIn.toString().slice(0,7)} ${tokenOne.symbol} for ${value} ${tokenTwo.symbol}`
            );
        }
      }
    } catch (error) {
      console.error("Price fetch error:", error);
      setPoolMessage("Error fetching price. Check pool liquidity.");
      if (!isOutputDirection) setTokenSwapOutPut("0");
    } finally {
      setSearch(false);
    }
  };

  const handleTopInputChange = (e) => {
    const val = Number(e.target.value);
    setDisable(false);
    if(tokenOne.tokenAddress && val>tokenOne.tokenBalance)
    {
      setDisable(true);
      setPoolMessage("You don't have enough balance");
    }
    else
      fetchPrice(val, true);
    setSwapAmount(val);
    setIsOut(true);
  };

  const handleBottomInputChange = (e) => {
    const val = e.target.value;
    setTokenSwapOutPut(val);
    setIsOut(false);
    setDisable(false);
    fetchPrice(val, false);
  };

  const handleSwapExecute = async() => {
    if (!singleSwap) return console.error("Swap function missing from Context");
    setLoading(true);
    await singleSwap(
      isOut,
      tokenOne,
      tokenTwo,
      swapAmount, 
      tokenSwapOutPut,
      3000
    );
    fetchUserPositions();
    setSwapAmount("");
    setTokenSwapOutPut(0);
    setPoolMessage("");
    setTokenOne({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
    });
    setTokenTwo({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
    });
    setLoading(false);
  };

  return (
    <div className={Style.HeroSection}>
      <div className={Style.HeroSection_box}>
        {/* HEADING */}
        <div className={Style.HeroSection_box_heading}>
          <p>Swap</p>
          <div className={Style.HeroSection_box_heading_img}>
            <Image
              src={images.close}
              alt="settings"
              width={50}
              height={50}
              onClick={() => setOpenSetting(true)}
            />
          </div>
        </div>

        {/* INPUT 1 (EXACT INPUT) */}
        <div className={Style.HeroSection_box_input}>
          <input
            type="number"
            placeholder="0.0"
            value={swapAmount}
            onChange={handleTopInputChange}
          />
          <button onClick={() => setOpenToken(true)}>
            <Image
              src={tokenOne.image || images.etherlogo}
              width={20}
              height={20}
              alt="token"
            />
            {tokenOne.symbol || "Select"}
            <small>{tokenOne.tokenBalance ? tokenOne.tokenBalance.slice(0, 7) : "0.0"}</small>
          </button>
        </div>

        {/* INPUT 2 (EXACT OUTPUT) */}
        <div className={Style.HeroSection_box_input}>
          <div className={Style.inputWrapper}>
            {search && isOut ? (
              <Image src={images.loading} width={80} height={30} alt="loading" className={Style.loader} />
            ) : (
              <input
                type="number"
                placeholder="0.0"
                value={tokenSwapOutPut ? String(tokenSwapOutPut).slice(0, 9) : ""}
                onChange={handleBottomInputChange}
                className={Style.inputField}
              />
            )}
          </div>
          <button onClick={() => setOpenTokenTwo(true)}>
            <Image
              src={tokenTwo.image || images.etherlogo}
              width={20}
              height={20}
              alt="token"
            />
            {tokenTwo.symbol || "Select"}
            <small>{tokenTwo.tokenBalance ? tokenTwo.tokenBalance.slice(0, 7) : "0.0"}</small>
          </button>
        </div>

        {/* POOL MESSAGE & LOADER */}
        <div className={Style.HeroSection_box_message}>
          {search ? <small>Fetching best price...</small> : <small>{poolMessage}</small>}
        </div>

        {/* ACTION BUTTON */}
        {account ? (
          
          <button className={Style.HeroSection_box_btn} onClick={handleSwapExecute} disabled={loading || disable}>
              { !loading? "Swap" : "Processing...." }
          </button>
        ) : (
          <button className={Style.HeroSection_box_btn} onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>

      {/* MODALS */}
      {openSetting && <Token setOpenSetting={setOpenSetting} />}
      
      {openToken && (
        <SearchToken setOpenToken={setOpenToken} tokens={setTokenOne} tokenData={tokenData} />
      )}
      
      {openTokenTwo && (
        <SearchToken setOpenToken={setOpenTokenTwo} tokens={setTokenTwo} tokenData={tokenData} />
      )}
    </div>
  );
};

export default HeroSection;