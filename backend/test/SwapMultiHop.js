const { days } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration");
const {expect} = require("chai");
const {ethers}=require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; 
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
const DAI_WHALE = "0x97f991971a37D4Ca58064e6a98FC563F03A71E5c"; 
const USDC_WHALE = "0x97f991971a37D4Ca58064e6a98FC563F03A71E5c";

const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

describe("SwapMultiHop",()=>{
    let swapMultiHop;
    let accounts;
    let weth;
    let dai;
    let usdc;

    before(async()=>{
        accounts=await ethers.getSigners(1);
        const SwapMultiHop=await ethers.getContractFactory("SwapMultiHop");
        swapMultiHop= await SwapMultiHop.deploy();
        weth= await ethers.getContractAt("IWETH",WETH9);
        dai= await ethers.getContractAt("IERC20",DAI);
        usdc= await ethers.getContractAt("IERC20",USDC);

        console.log(weth.address);
        console.log(dai.address);
        console.log(usdc.address);
    });
    it("swapExactInputMutliHop",async()=>{
        const amountIn=10n**18n;
        console.log(accounts[0].address);
        console.log("Dai balance before",await dai.balanceOf(accounts[0].address));
        await weth.deposit({value:amountIn});
        console.log("Weth balance before",await weth.balanceOf(accounts[0].address));
        await weth.approve(swapMultiHop.address,amountIn);
        await swapMultiHop.swapExactInputMultiHop(amountIn);
        console.log("Dai balance",await dai.balanceOf(accounts[0].address));
        
        // console.log(weth);
        // console.log(dai);
        // console.log(usdc);
    });
    it("swapExactOutputSingle",async()=>{
        const wethAmountInMax=10n**18n;
        const daiAmountOut=10n*10n**18n;

        await weth.deposit({value:wethAmountInMax});
        await weth.approve(swapMultiHop.address,wethAmountInMax);
        console.log("approved");
        console.log("Weth balance before",await weth.balanceOf(accounts[0].address));
        await swapMultiHop.swapExactOutputMultiHop(daiAmountOut,wethAmountInMax);
        console.log(accounts[0].address);
        console.log("Dai balance",await dai.balanceOf(accounts[0].address));
    });
});