import React,{useState,useEffect} from 'react'
import Image from "next/image";
import Style from "./Model.module.css";
import images from "../../assets";
const Model = ({setOpenModel,connectWallet}) => {
  const walletmenu=["MetaMask","CoinBase","Wallet","WalletConnect"];
  return (
    <div className={Style.Model}>
      <div className={Style.Model_box}>
        <div className={Style.Model_box_heading}>
          <p>Connect Wallet</p>
          <div className={Style.Model_box_heading_img}>
            <Image src={images.close} alt="logo" width={50} height={50} onClick={()=>setOpenModel(false)}/>
          </div>
        </div>
        <div className={Style.Model_box_wallet}>
          {walletmenu.map((el,i)=>(
            <p key={i+1} onClick={()=>connectWallet()}>{el}</p>
          ))}
        </div>
        <p className={Style.Model_box_para}>
          By connecting a wallet, you agree to Uniswap Lab's
          <br /> Terms of Service and consent to its Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Model