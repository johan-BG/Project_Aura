import React, { useState, useEffect } from "react";
import Image from "next/image";


import images from "../../assets";
import Style from "./PoolAdd.module.css";
import Token from "../Token/Token";
import SearchToken from "../SearchToken/SearchToken";

const PoolAdd = ({ setClosePool, tokenData, createLiquidityAndPool }) => {
  const [openModel, setOpenModel] = useState(false);
  const [openTokenModelOne, setOpenTokenModelOne] = useState(false);
  const [openTokenModelTwo, setOpenTokenModelTwo] = useState(false);
  const [active, setActive] = useState(2);
  const [openFee, setOpenFee] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [loading,setLoading]=useState(false);
  const [fee, setFee] = useState(3000);
  const [slippage, setSlippage] = useState(25);
  const [deadline, setDeadline] = useState(20);
  const [tokenAmountOne, setTokenAmountOne] = useState(0);
  const [tokenAmountTwo, setTokenAmountTwo] = useState(0);

  const [tokenOne, setTokenOne] = useState({
    name: "",
    image: "",
    symbol: "",
    tokenBalance: "",
    tokenAddress: "",
  });
  const [tokenTwo, setTokenTwo] = useState({
    name: "",
    image: "",
    symbol: "",
    tokenBalance: "",
    tokenAddress: "",
  });

  const handleRemoveLiquidity = async (params) => {
    setLoading(true);
    try {
      await createLiquidityAndPool(params);
      
    } catch (error) {
      console.error(error);
      alert("Failed to add liquidity. See console for details.");
    } finally {
      setLoading(false);
      setClosePool(false);
    }
  };

  const feePairs = [
    {
      fee: "0.05%",
      info: "Best for stable pairs",
      number: "0% Select",
      feeSystem: 500,
    },
    {
      fee: "0.3%",
      info: "Best for stable pairs",
      number: "0% Select",
      feeSystem: 3000,
    },
    {
      fee: "1%",
      info: "Best for stable pairs",
      number: "0% Select",
      feeSystem: 10000,
    },
  ];

  const minPriceRange = (text) => {
    if (text == "+") {
      setMinPrice(minPrice + 1);
    } else if (text == "-") {
      setMinPrice(minPrice - 1);
    }
  };

  const maxPriceRange = (text) => {
    if (text == "+") {
      setMaxPrice(maxPrice + 1);
    } else if (text == "-") {
      setMaxPrice(maxPrice - 1);
    }
  };

  return (
    <div className={Style.PoolAdd}>
      <div className={Style.PoolAdd_box}>
        <div className={Style.PoolAdd_box_header}>
          <div className={Style.PoolAdd_box_header_left}>
            <Image
              src={images.arrowLeft}
              alt="image"
              width={30}
              height={30}
              onClick={() => setClosePool(false)}
            />
          </div>
          <div className={Style.PoolAdd_box_header_middle}>
            <p>Add Liquidity</p>
          </div>

          <div className={Style.PoolAdd_box_header_right}>
            {/* <p>
              {tokenOne.name || ""}
              {tokenOne.tokenBalance.slice(0, 9) || ""}
              {""}
              {""}
            </p> */}
            <Image
              src={images.close}
              alt="image"
              width={50}
              height={50}
              onClick={() => setOpenModel(true)}
            />
          </div>
        </div>


        <div className={Style.PoolAdd_box_price}>
          <div className={Style.PoolAdd_box_price_left}>
            <h4>Select Pair</h4>

            <div className={Style.PoolAdd_box_price_left_token}>
              <div
                className={Style.PoolAdd_box_price_left_token_info}
                onClick={() => setOpenTokenModelOne(true)}
              >
                <p>
                  <Image
                    src={images.etherlogo}
                    alt="image"
                    width={20}
                    height={20}
                  />
                </p>
                <p>{tokenOne.name || "ETH"}</p>
                <p>�</p>
              </div>

              <div
                className={Style.PoolAdd_box_price_left_token_info}
                onClick={() => setOpenTokenModelTwo(true)}
              >
                <p>
                  <Image
                    src={images.etherlogo}
                    alt="image"
                    width={20}
                    height={20}
                  />
                </p>
                <p>{tokenTwo.name || "ETH"}</p>
                <p>�</p>
              </div>
            </div>

            <div className={Style.PoolAdd_box_price_left_fee}>
              <div className={Style.PoolAdd_box_price_left_fee_left}>
                <h4>Fee teir</h4>
                <p>The % you will earn in fees</p>
              </div>

              {openFee ? (
                <button onClick={() => setOpenFee(false)}>Hide</button>
              ) : (
                <button onClick={() => setOpenFee(true)}>Show</button>
              )}
            </div>

            {openFee && (
              <div className={Style.PoolAdd_box_price_left_list}>
                {feePairs.map((el, i) => (
                  <div
                    className={Style.PoolAdd_box_price_left_list_item}
                    key={i + 1}
                    onClick={() => (setActive(i + 1), setFee(el.feeSystem))}
                  >
                    <div
                      className={Style.PoolAdd_box_price_left_list_item_content}
                    >
                      <p>{el.fee}</p>
                      <p>
                        {active == i + 1 ? (
                          <Image
                            src={images.tick}
                            alt="image"
                            width={20}
                            height={20}
                          />
                        ) : (
                          " "
                        )}
                      </p>
                    </div>

                    <small>{el.info}</small>
                    <p className={Style.PoolAdd_box_price_left_list_item_para}>
                      {el.number}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className={Style.PoolAdd_box_deposit}>
              <h4>Deposit Amount</h4>

              <div className={Style.PoolAdd_box_deposit_box}>
                <input
                  type="number"
                  placeholder={tokenOne.tokenBalance.slice(0, 9)}
                  onChange={(e) => setTokenAmountOne(e.target.value)}
                />

                <div className={Style.PoolAdd_box_deposit_box_input}>
                  <p>
                    <small>{tokenOne.name || "ETH"}</small> {""}
                    {""}
                    {tokenOne.symbol || "ETH"}
                  </p>
                  {/* <p className={Style.PoolAdd_box_deposit_box_input_balance}>
                    Balance: 0.00
                  </p> */}
                </div>
              </div>

              <div className={Style.PoolAdd_box_deposit_box}>
                <input
                  type="number"
                  placeholder={tokenTwo.tokenBalance.slice(0, 9)}
                  onChange={(e) => setTokenAmountTwo(e.target.value)}
                />
                <div className={Style.PoolAdd_box_deposit_box_input}>
                  <p>
                    <small>{tokenTwo.name || "ETH"}</small> {""}
                    {""}
                    {tokenTwo.symbol || "Select"}
                  </p>
                  {/* <p className={Style.PoolAdd_box_deposit_box_input_balance}>
                    Balance: 0.00
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          <div className={Style.PoolAdd_box_price_right}>
            <h4>Set Price Range</h4>

            <div className={Style.PoolAdd_box_price_right_box}>
              <p className={Style.PoolAdd_box_price_right_box_para}>
                Current Price: { tokenAmountOne && tokenAmountTwo ? tokenAmountTwo/tokenAmountOne : 0} {tokenOne.name || "ETH"} per{" "}
                {tokenTwo.name || "Select"}
              </p>
              <Image src={images.wallet} alt="wallet" height={80} width={80} />
              <h3>Your position will appear here.</h3>
            </div>

    
            <div className={Style.PoolAdd_box_price_right_range}>
              <div className={Style.PoolAdd_box_price_right_range_box}>
                <p>Min Price</p>
                <input
                  type="number"
                  placeholder="0.000"
                  min="0.00"
                  step="0.001"
                  className={Style.PoolAdd_box_price_right_range_box_para}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <p>
                  {tokenOne.name || "ETH"} per {tokenTwo.name || "Select"}
                </p>
              </div>

             
              <div className={Style.PoolAdd_box_price_right_range_box}>
                <p>Max Price</p>
                <input
                  type="number"
                  placeholder="0.000"
                  min="0.00"
                  step="0.001"
                  className={Style.PoolAdd_box_price_right_range_box_para}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
                <p>
                  {tokenOne.name || "ETH"} per {tokenTwo.name || "Select"}
                </p>
              </div>
            </div>


            <div className={Style.PoolAdd_box_price_right_amount}>
              <button
                onClick={() =>
                  handleRemoveLiquidity({
                    token0: tokenOne,
                    token1: tokenTwo,
                    fee: fee,
                    tokenPrice1: minPrice,
                    tokenPrice2: maxPrice,
                    slippage: slippage,
                    deadline: deadline,
                    tokenAmount0: tokenAmountOne,
                    tokenAmount1: tokenAmountTwo,
                  })
                }
                disabled={loading}
              >
                {loading?"Processing...":"Add Liquidity"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {openModel && (
        <div className={Style.token}>
          <Token
            setOpenSetting={setOpenModel}
            setSlippage={setSlippage}
            slippage={slippage}
            deadline={deadline}
            setDeadline={setDeadline}
          />
        </div>
      )}
      {openTokenModelOne && (
        <div className={Style.token}>
          <SearchToken
            tokens={setTokenOne}
            tokenData={tokenData}
            setOpenToken={setOpenTokenModelOne}
          />
        </div>
      )}
      {openTokenModelTwo && (
        <div className={Style.token}>
          <SearchToken
            tokens={setTokenTwo}
            tokenData={tokenData}
            setOpenToken={setOpenTokenModelTwo}
          />
        </div>
      )}
    </div>
  );
};

export default PoolAdd;
