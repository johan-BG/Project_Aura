import React from "react";
import Image from "next/image";
import Style from "./AllTokens.module.css";
import images from "../../assets";

const AllTokens = ({ allTokenList }) => {
  return (
    <div className={Style.Alltokens}>
      <div className={Style.AllTokens_box}>
        <div className={Style.AllTokens_box_header}>
          <p className={Style.hide}>#</p>
          <p>Token name</p>
          <p>Price</p>
          {/* Hidden on mobile (hide), hidden on tablet (hideTablet) */}
          <p className={Style.hideTablet}>ValueLockedUSD</p>
          <p className={Style.hide}>
            Tx Count{" "}
            <small>
              <Image src={images.question} alt="img" width={15} height={15} />
            </small>
          </p>
          <p className={Style.hide}>
            <small>
              <Image src={images.arrowPrice} alt="img" width={15} height={15} />
            </small>{" "}
            Token Supply{" "}
            <small>
              <Image src={images.question} alt="img" width={15} height={15} />
            </small>
          </p>
        </div>

        {allTokenList.map((el, i) => (
          <div key={i} className={Style.AllTokens_box_list}>
            <p className={Style.hide}>{i + 1}</p>
            <p className={Style.AllTokens_box_list_para}>
              <small>
                <Image src={el.logo} alt={el.symbol} width={25} height={25} />
              </small>
              <small>{el.name}</small>
              <small>{el.symbol}</small>
            </p>

            <p>{el.volumeUSD.slice(0, 9)}</p>
            <p className={Style.hideTablet}>{el.totalValueLockedUSD.slice(0, 9)}</p>
            <p className={Style.hide}>{el.txCount.slice(0, 9)}</p>
            <p className={Style.hide}>{el.totalSupply.slice(0, 9)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTokens;
