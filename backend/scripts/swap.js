const { ethers } = require("ethers");

// --- 1. CONFIGURATION ---
const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`; // e.g., Alchemy or Infura
const PRIVATE_KEY = `${process.env.ACCOUNT_KEY}`;

// ABI containing only the exactInputSingle function required for the swap
if (!RPC_URL || !PRIVATE_KEY) {
    console.error("Please set SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file");
    process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 2. Constants
const ROUTER_ADDRESS = "0x3a9d48ab9751398bbfa63ad67599bb04e4bdf98b"; // Uniswap V3 SwapRouter
const DAI_ADDRESS = "0xd67215fD6c0890493F34aF3C5E4231cE98871fCb";    // DAI from your prompt
const WETH_ADDRESS = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";   // Canonical WETH on Sepolia

// 3. ABI for SwapRouter (We only need exactInputSingle)
const routerAbi = [
    `function exactInputSingle(
        tuple(
            address tokenIn,
            address tokenOut,
            uint24 fee,
            address recipient,
            uint256 deadline,
            uint256 amountIn,
            uint256 amountOutMinimum,
            uint160 sqrtPriceLimitX96
        ) params
    ) external payable returns (uint256 amountOut)`
];

const swapRouter = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);

// 4. Main Swap Function
async function swapEthForDai(amountInEth) {
    console.log(`Starting swap of ${amountInEth} ETH to DAI...`);
    
    try {
        // Convert ETH amount to Wei
        const amountIn = ethers.utils.parseEther(amountInEth.toString());
        
        // Slippage / Output Control
        // NOTE: Setting this to 0 means you accept ANY amount of DAI (100% slippage).
        // In a real production app, you MUST use the Quoter contract to get the expected 
        // amount out, then apply a slippage percentage (e.g., 99% of quote) here.
        const amountOutMinimum = 0; 
        
        // Deadline (20 minutes from now)
        const deadline = Math.floor(Date.now() / 1000) + (60 * 20);

        // Uniswap V3 Pool Fee Tier (0.3% = 3000, 0.05% = 500, 1% = 10000)
        // Note: 3000 is the most common pool for WETH/DAI
        const poolFee = 3000; 

        // Construct the ExactInputSingleParams tuple
        const params = {
            tokenIn: WETH_ADDRESS,
            tokenOut: DAI_ADDRESS,
            fee: poolFee,
            recipient: wallet.address,
            deadline: deadline,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0 // 0 ensures we swap until the exact input amount is exhausted
        };

        console.log("Sending transaction...");

        // Execute the swap
        // Because tokenIn is WETH, passing { value: amountIn } tells the router 
        // to take our native ETH, wrap it, and execute the swap.
        const tx = await swapRouter.exactInputSingle(params, {
            value: amountIn,
            gasLimit: 300000 // Safe manual limit; remove to let ethers auto-estimate
        });

        console.log(`Transaction submitted! Hash: ${tx.hash}`);
        console.log(`Waiting for confirmation...`);

        const receipt = await tx.wait();
        
        console.log(`Swap successful! Block Number: ${receipt.blockNumber}`);
        console.log(`View on Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);

    } catch (error) {
        console.error("Swap failed:");
        if (error.reason) {
            console.error("Reason:", error.reason);
        } else {
            console.error(error);
        }
    }
}

// Execute the function (Swap 0.01 ETH)
// Add this helper to your swap.js
async function logBalances(label) {
    const eth = await provider.getBalance(wallet.address);
    const daiContract = new ethers.Contract(DAI_ADDRESS, ["function balanceOf(address) view returns (uint256)"], provider);
    const dai = await daiContract.balanceOf(wallet.address);
    
    console.log(`\n[${label}]`);
    console.log(`ETH: ${ethers.utils.formatEther(eth)}`);
    console.log(`DAI: ${ethers.utils.formatUnits(dai, 18)}`); // Adjust decimals if DAI is not 18
}

// Then call it in your main execution block
async function run() {
    await logBalances("BEFORE SWAP");
    await swapEthForDai("0.01");
    await logBalances("AFTER SWAP");
}

run();