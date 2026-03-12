import React, { useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Style from "./NavBar.module.css";
import images from "../../assets/index";
import { Model, TokenList, Profile } from "../index";
import Identicon from 'react-identicons';
import { useSwapContext } from "../../Context/SwapContext";

const NavBar = () => {
  const { networkName, account, connectWallet, tokenData } = useSwapContext();
  const menuItems = [
    { name: "Swap", link: "/" },
    { name: "Tokens", link: "/Tokens" },
    { name: "Pools", link: "/Pools" },
  ];
  const [openModel, setOpenModel] = useState(false);
  const [openTokenBox, setOpenTokenBox] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className={Style.NavBar}>
      <div className={Style.NavBar_box}>
        {/* LEFT */}
        <div className={Style.NavBar_box_left}>
          <div className={Style.NavBar_box_left_img}>
            <Image src={images.uniswap} alt="logo" width={50} height={50} />
          </div>
          <div className={Style.NavBar_box_left_menu}>
            {menuItems.map((el, i) => (
              <Link key={i + 1} href={{ pathname: `${el.link}` }}>
                <p className={Style.NavBar_box_left_menu_item}>{el.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* MIDDLE: search (hidden on tablet/mobile via CSS) */}
        <div className={Style.NavBar_box_middle}>
          <div className={Style.NavBar_box_middle_search}>
            <div className={Style.NavBar_box_middle_search_img}>
              <Image src={images.search} alt="search" width={20} height={20} />
            </div>
            <input type="text" placeholder="Search Tokens" />
          </div>
        </div>

        {/* RIGHT */}
        <div className={Style.NavBar_box_right}>
          <div className={Style.NavBar_box_right_box}>
            <div className={Style.NavBar_box_right_box_img}>
              <Image src={images.ether} alt="Network" height={30} width={30} />
            </div>
            <p>{networkName}</p>
          </div>

          {account ? (
            <div className={Style.NavBar_box_right_profile}>
              <button onClick={() => setOpenTokenBox(true)}>
                {account.slice(0, 14)}…
              </button>
              <div 
                className={Style.NavBar_profile_icon} 
                onClick={() => setOpenProfile(prev => !prev)}
              >
                <Identicon string={account} size={25} bg="#fff" />
              </div>
              {openProfile && <Profile account={account} />}
            </div>
          ) : (
            <button onClick={() => setOpenModel(true)}>Connect</button>
          )}

          {/* Hamburger – visible on tablet/mobile via CSS */}
          <button
            className={Style.hamburger}
            aria-label="Toggle menu"
            onClick={() => setOpenMenu((prev) => !prev)}
          >
            {openMenu ? "✕" : "☰"}
          </button>

          {openModel && (
            <Model setOpenModel={setOpenModel} connectWallet={connectWallet} />
          )}
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`${Style.mobileMenu} ${openMenu ? Style.open : ""}`}>
        {menuItems.map((el, i) => (
          <Link key={i} href={{ pathname: `${el.link}` }} onClick={() => setOpenMenu(false)}>
            {el.name}
          </Link>
        ))}
      </div>

      {openTokenBox && (
        <TokenList tokenData={tokenData} setOpenTokenBox={setOpenTokenBox} />
      )}
    </div>
  );
};

export default NavBar;
