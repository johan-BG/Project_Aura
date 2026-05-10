import React,{useState,useEffect} from 'react'
import Image from "next/image";
import Style from "./Token.module.css";
import images from '../../assets';
import {Toggle} from "../index";
const Token = ({setOpenSetting,setSlippage,slippage,deadline,setDeadline,txDeadline,setTxDeadline}) => {
    useEffect(() => {
    console.log("txDeadline changed to:", txDeadline);
  }, [txDeadline]);
  return (
    <div className={Style.Token}>
        <div className={Style.Token_box}>
            <div className={Style.Token_box_heading}>
                <h4>Setting</h4>
                <Image src={images.close} width={50} height={50} onClick={()=>setOpenSetting(false)}/>
            </div>
            <p className={Style.Token_box_para}>
                Slippage tolerance{""}
                <Image src={images.lock} alt="img" width={20} height={20}/>
            </p>
            <div className={Style.Token_box_input}>
                <button>Auto</button>
                <input type="text" placeholder={slippage} onChange={(e)=>setSlippage(e.target.value)}/>
            </div>
            <p className={Style.Token_box_para}>
                Deadline Time{""}
                <Image src={images.lock} alt="img" width={20} height={20}/>
            </p>
            <div className={Style.Token_box_input}>
                <input type="text" placeholder={deadline} onChange={(e)=>(setDeadline(e.target.value))}/>
                <button>minutes</button>
            </div>
            <h2>Interface Setting</h2>
            <div className={Style.Token_box_toggle}>
                <p className={Style.Token_box_para}>Transaction daedline</p>
                <Toggle 
                    label={txDeadline ? "Yes" : "No"} 
                    checked={txDeadline}
                    onChange={() => setTxDeadline(prev => !prev)} 
                />
            </div>
        </div>
    </div>
  )
}

export default Token