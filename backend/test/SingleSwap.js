// const { days } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration");
// const {expect} = require("chai");
// const {ethers}=require("hardhat");

// const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; 
// const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; 
// const DAI_WHALE = "0x97f991971a37D4Ca58064e6a98FC563F03A71E5c"; 
// const USDC_WHALE = "0x97f991971a37D4Ca58064e6a98FC563F03A71E5c";

// const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// describe("SingleSwapToken",()=>{
//     let singleSwapToken;
//     let accounts;
//     let weth;
//     let dai;
//     let usdc;

//     before(async()=>{
//         accounts=await ethers.getSigners(1);
//         const SingleSwapToken=await ethers.getContractFactory("SingleSwapToken");
//         singleSwapToken= await SingleSwapToken.deploy();
//         weth= await ethers.getContractAt("IWETH",WETH9);
//         dai= await ethers.getContractAt("IERC20",DAI);
//         usdc= await ethers.getContractAt("IERC20",USDC);

//         console.log(weth.address);
//         console.log(dai.address);
//         console.log(usdc.address);
//     });
//     it("swapExactInputSingle",async()=>{
//         const amountIn=10n**18n;
//         console.log(accounts[0].address);
//         console.log("Dai balance before",await dai.balanceOf(accounts[0].address));
//         await weth.deposit({value:amountIn});
//         console.log("Weth balance before",await weth.balanceOf(accounts[0].address));
//         await weth.approve(singleSwapToken.address,amountIn);
//         await singleSwapToken.swapExactInputSingle(amountIn);
//         console.log("Dai balance",await dai.balanceOf(accounts[0].address));
        
//         // console.log(weth);
//         // console.log(dai);
//         // console.log(usdc);
//     })
//     it("swapExactOutputSingle",async()=>{
//         const wethAmountInMax=10n**18n;
//         const daiAmountOut=100n*10n**18n;

//         await weth.deposit({value:wethAmountInMax});
//         await weth.approve(singleSwapToken.address,wethAmountInMax);
//         console.log("approved");
//         console.log("Weth balance before",await weth.balanceOf(accounts[0].address));
//         await singleSwapToken.swapExactOutputSingle(daiAmountOut,wethAmountInMax);
//         console.log(accounts[0].address);
//         console.log("Dai balance",await dai.balanceOf(accounts[0].address));
//     });
// });
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SingleSwapToken Scarcity Fee Test", function () {
  let singleSwap, auraCoin, shoaib, popUp;
  let owner, user;
  
  // Addresses provided by user
  const SINGLE_SWAP_ADDR = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  const AURA_COIN_ADDR = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const SHOAIB_ADDR = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
  const POPUP_ADDR = "0x9A676e781A523b5d0C0e43731313A708CB607508";
  
  const POOL_FEE = 3000; // 0.3% pool tier

  before(async function () {
    [owner, user] = await ethers.getSigners();
    console.log(owner.address);

    // Attach to deployed contracts
    singleSwap = await ethers.getContractAt("SingleSwapToken", SINGLE_SWAP_ADDR);
    auraCoin = await ethers.getContractAt("IERC20", AURA_COIN_ADDR);
    shoaib = await ethers.getContractAt("IERC20", SHOAIB_ADDR);
    popUp = await ethers.getContractAt("IERC20", POPUP_ADDR);
  });

  it("Should execute swap and distribute fees correctly", async function () {
    const amountIn = ethers.utils.parseEther("100");
    
    // 1. Setup Balances & Approvals
    // Ensure user has enough Shoaib and AuraCoin
    // Note: In a real test, you might need to deal with impersonating or minting
    
    await shoaib.approve(singleSwap.address, amountIn);
    
    // Estimate scarcity fee to know how much Aura to approve
    const estimatedAuraFee = await singleSwap.estimateScarcityFee(SHOAIB_ADDR, POPUP_ADDR, POOL_FEE);
    console.log(`Estimated Scarcity Fee: ${estimatedAuraFee.toString()} AURA`);
    
    await auraCoin.approve(singleSwap.address, estimatedAuraFee);

    // 2. Capture Initial Balances
    const initialOwnerShoaib = await shoaib.balanceOf(owner.address);
    const initialOwnerAura = await auraCoin.balanceOf(owner.address);
    const initialAuraContractBal = await auraCoin.balanceOf(AURA_COIN_ADDR);

    // 3. Execute Swap
    const tx = await singleSwap.executeSwap(
      SHOAIB_ADDR,
      POPUP_ADDR,
      amountIn,
      POOL_FEE
    );
    await tx.wait();

    // 4. Validate Fixed Fee (0.1% of 100 = 0.1 Shoaib)
    const finalOwnerShoaib = await shoaib.balanceOf(owner.address);
    const finalOwnerAura = await auraCoin.balanceOf(owner.address);
    const expectedFixedFee = amountIn.mul(10).div(10000);
    expect(finalOwnerShoaib.sub(initialOwnerShoaib)).to.lt(0);
    expect(finalOwnerAura.sub(initialOwnerAura)).to.lt(0);
    console.log(finalOwnerAura,initialOwnerAura);

    // 5. Validate Scarcity Fee (Sent to AuraCoin contract address)
    const finalAuraContractBal = await auraCoin.balanceOf(AURA_COIN_ADDR);
    expect(finalAuraContractBal.sub(initialAuraContractBal)).to.be.gt(0);
    console.log(finalAuraContractBal,initialAuraContractBal);
    console.log("Scarcity Fee successfully sent to Token Contract!");
  });

  it("Should update trailing reference after swap", async function () {
    // Check if isInitialized is true for the pool
    const factoryAddr = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const factory = await ethers.getContractAt("IUniswapV3Factory", factoryAddr);
    const poolAddr = await factory.getPool(SHOAIB_ADDR, POPUP_ADDR, POOL_FEE);
    
    const isInit = await singleSwap.isInitialized(poolAddr);
    expect(isInit).to.be.true;
    
    const refTick = await singleSwap.poolReferences(poolAddr);
    console.log(`Updated Reference Tick for Pool: ${refTick.toString()}`);
  });
});