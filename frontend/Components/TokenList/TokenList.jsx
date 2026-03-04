import React from 'react';
import Image from "next/image";
import Style from "./TokenList.module.css";
import images from "../../assets";

const TokenList = ({ tokenData, setOpenTokenBox }) => {
  return (
    <div className={Style.TokenList}>
      <p className={Style.TokenList_close} onClick={() => setOpenTokenBox(false)}>
        <Image src={images.close} alt="close" width={60} height={60} />
      </p>
      
      <div className={Style.TokenList_title}>
        <h2>Your Token List</h2>
      </div>

      {tokenData.map((el, i) => (
        /* Added key={i} here to fix React warning */
        <div key={i} className={Style.TokenList_box_info}>
          <p className={Style.TokenList_box_info_symbol}>{el.symbol}</p>
          <p>
            <span>{parseFloat(el.tokenBalance).toFixed(2)}</span>
            {el.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TokenList;