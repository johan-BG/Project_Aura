import React, { useState } from "react";
import Image from "next/image";
import Style from "./SearchToken.module.css";
import images from "../../assets";

const SearchToken = ({ setOpenToken, tokens, tokenData }) => {
  const [active, setActive] = useState(1);
  const coin = [
    {
      img: images.ether,
      name: "ETH",
    },
    {
      img: images.ether,
      name: "DAI",
    },
    {
      img: images.ether,
      name: "WETH9",
    },
    {
      img: images.ether,
      name: "UNI",
    },
    {
      img: images.ether,
      name: "USDC",
    },
    {
      img: images.ether,
      name: "AURA",
    },
    {
      img: images.ether,
      name: "BOO",
    },
  ];
  return (
    <div className={Style.SearchToken}>
      <div className={Style.SearchToken_box}>
        <div className={Style.SearchToken_box_heading}>
          <h4>Select a token</h4>
          <Image
            src={images.close}
            alt="close"
            width={50}
            height={50}
            onClick={() => setOpenToken(false)}
          />
        </div>
        <div className={Style.SearchToken_box_search}>
          <div className={Style.SearchToken_box_search_img}>
            <Image src={images.search} alt="img" width={20} height={20} />
          </div>
          <input type="text" placeholder="Search name and paste the address" />
        </div>
        <div className={Style.SearchToken_box_tokens}>
          {tokenData.map((el, i) => (
            <span
              key={i + 1}
              className={active == i + 1 ? `${Style.active}` : ""}
              onClick={() => (
                setActive(i + 1),
                tokens({
                  name: el.name,
                  image: el.img,
                  symbol: el.symbol,
                  decimals: el.decimals,
                  tokenBalance: el.tokenBalance,
                  tokenAddress: el.address,
                }),
                setOpenToken(false)
              )}
            >
              <Image
                src={el.img || images.ether}
                alt="image"
                width={30}
                height={30}
              />
              {el.symbol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchToken;
