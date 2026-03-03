import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import Style from "./HeroSection.module.css";
import images from "../../assets";
import { Token, SearchToken } from "../index";
import { useSwapContext } from "../../Context/SwapContext";

const HeroSection = () => {
  // --- STATE ---
  const [openSetting, setOpenSetting] = useState(false);
  const [openToken, setOpenToken] = useState(false);
  const [openTokenTwo, setOpenTokenTwo] = useState(false);
  
  const [search, setSearch] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [tokenSwapOutPut, setTokenSwapOutPut] = useState("");
  const [poolMessage, setPoolMessage] = useState("");
  const [isOut, setIsOut] = useState(false); // false = exactInput, true = exactOutput

  const [tokenOne, setTokenOne] = useState({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
  });
  const [tokenTwo, setTokenTwo] = useState({
    name: "", image: "", symbol: "", tokenBalance: "", tokenAddress: "",decimals: ""
  });

  // --- CONTEXT ---
  // Fix: Do not use useContext() with a custom hook. Just call the hook.
  const {
    account,
    tokenData,
    provider,
    connectWallet,
    singleSwap, // Make sure this is exported from your context! 
    getSwapQuote
  } = useSwapContext();

  // --- HANDLERS ---
  const fetchPrice = async (value, isOutputDirection) => {
    if (!value || value <= 0) {
      setTokenSwapOutPut("");
      setPoolMessage("");
      setSearch(false);
      return;
    }

    setSearch(true);
    try {
      // Pass the current direction directly to avoid React stale state issues
      const data = await getSwapQuote(
        isOutputDirection,
        tokenOne.tokenAddress,
        tokenTwo.tokenAddress,
        3000,
        value
      )

      if (data) {
        if (isOutputDirection) {
          const amountOut=ethers.utils.formatUnits(data,tokenTwo.decimals);
          setTokenSwapOutPut(amountOut);
          setPoolMessage(`${value} ${tokenOne.symbol} = ${amountOut} ${tokenTwo.symbol}`);
        } else {
          // If user types in the bottom box, we estimate the top box input required
          //setSwapAmount(data); 
          const amountIn=ethers.utils.formatUnits(data,tokenOne.decimals)
          setPoolMessage(`Requires ~${amountIn} ${tokenOne.symbol} for ${value} ${tokenTwo.symbol}`);
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
    const val = e.target.value;
    setSwapAmount(val);
    setIsOut(true);
    fetchPrice(val, true);
  };

  const handleBottomInputChange = (e) => {
    const val = e.target.value;
    setTokenSwapOutPut(val);
    setIsOut(false);
    fetchPrice(val, false);
  };

  const handleSwapExecute = () => {
    if (!singleSwap) return console.error("Swap function missing from Context");
    
    singleSwap(
      isOut,
      tokenOne,
      tokenTwo,
      swapAmount, // Send the exact typed amount
      tokenSwapOutPut,
      3000
    );
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
          <button className={Style.HeroSection_box_btn} onClick={handleSwapExecute}>
            Swap
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