import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Style from "./NavBar.module.css";
import images from "../../assets/index";
import { Model, TokenList } from "../index";
import { useSwapContext } from "../../Context/SwapContext";
const NavBar = () => {
  const { networkName,account, connectWallet, tokenData } =useSwapContext();
  const menuItems = [
    {
      name: "Swap",
      link: "/",
    },
    {
      name: "Tokens",
      link: "/",
    },
    {
      name: "Pools",
      link: "/",
    },
  ];
  const [openModel, setOpenModel] = useState(false);
  const [openTokenBox, setOpenTokenBox] = useState(false);
  return (
    <div className={Style.NavBar}>
      <div className={Style.NavBar_box}>
        <div className={Style.NavBar_box_left}>
          <div className={Style.NavBar_box_left_img}>
            <Image src={images.uniswap} alt="logo" width={50} height={50} />
          </div>
          <div className={Style.NavBar_box_left_menu}>
            {menuItems.map((el, i) => (
              <Link key={i + 1} href={{ pathname: `${el.name}` }}>
                <p className={Style.NavBar_box_left_menu_item}>{el.name}</p>
              </Link>
            ))}
            {/* ,query:`${el.link}` */}
          </div>
        </div>
        <div className={Style.NavBar_box_middle}>
          <div className={Style.NavBar_box_middle_search}>
            <div className={Style.NavBar_box_middle_search_img}>
              <Image src={images.search} alt="search" width={20} height={20} />
            </div>
            <input type="text" placeholder="Search Tokens" />
          </div>
        </div>
        <div className={Style.NavBar_box_right}>
          <div className={Style.NavBar_box_right_box}>
            <div className={Style.NavBar_box_right_box_img}>
              <Image src={images.ether} alt="Network" height={30} width={30} />
            </div>
            {/* <p>{networkConnect}</p> */}
            <p>{networkName}</p>
          </div>
          {account ? (
            <button onClick={() => setOpenTokenBox(true)}>
              {account.slice(0, 20)}
            </button>
          ) : (
            <button onClick={() => setOpenModel(true)}>Connect</button>
          )}

          {openModel && (
            <Model setOpenModel={setOpenModel} connectWallet={connectWallet} />
          )}
        </div>
      </div>
      {openTokenBox && (
        <TokenList tokenData={tokenData} setOpenTokenBox={setOpenTokenBox} />
      )}
    </div>
  );
};

export default NavBar;
