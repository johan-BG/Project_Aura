// config.js
import deploymentdata from "./scripts/deploymentdata.json";
import tokendata from "./scripts/tokendata.json";
import addresses from "./Context/address.json";
import userStorgeData from "./Context/UserStorageData.json";
import ERC20 from "./Context/ERC20.json";
import pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import manager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import quoterAbi from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import SingleSwapTokenABI  from "./Context/SingleSwapToken.json";
import factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";


export const ARTIFACTS = {
  userStorgeData: userStorgeData.abi,
  ERC20:ERC20.abi,
  pool:pool.abi,
  manager:manager.abi,
  quoter:quoterAbi.abi,
  singleSwapToken:SingleSwapTokenABI.abi,
  factory:factory.abi
};
export const NETWORKS = {
  // --- LOCAL HARDHAT ---
  31337: {
    name: "Hardhat Localhost",
    rpc: "http://127.0.0.1:8545",
    subgraphUrl: "https://gateway.thegraph.com/api/5f704218070c5797b1928dd757cd63a0/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    explorer: "", // No explorer for local
    contracts: {
      positionManager: deploymentdata.nonfungiblePositionManager,
      factory: deploymentdata.factory,
      router: deploymentdata.swaprouter, // Usually deployed locally in your scripts
      userStorageData: addresses.contracts.UserStorageData,
      quoter:deploymentdata.quoter,
      singleSwapToken:addresses.contracts.SingleSwapToken,
      tokens: [
        { 
          address: addresses.contracts.BooCoin, 
          name: "BooCoin", 
          symbol: "BOO", 
          decimals: 18
        },
        { 
          address: addresses.contracts.AuraCoin, 
          name: "AuraCoin", 
          symbol: "AURA", 
          decimals: 18,
          img: "/assets/Aura_coin.png" 
        },
        { 
          address: tokendata.popUp,
          name: "PopUp", 
          symbol: "POP", 
          decimals: 18,
        },
        { 
          address: tokendata.shoaib,
          name: "Shoaib", 
          symbol: "SHO", 
          decimals: 18,
        },
        { 
          address: tokendata.rayyan,
          name: "Rayyan", 
          symbol: "RAY", 
          decimals: 18,
        },
        { 
          address: deploymentdata.weth,
          name: "Wrapped ETH", 
          symbol: "WETH", 
          decimals: 18,
        }
      ]
    }
  },
  // --- SEPOLIA TESTNET ---
  11155111: {
    name: "Sepolia Testnet",
    rpc: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      positionManager: "0x123...", // Your deployed Sepolia Address
      factory: "0x456...",
      router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      tokens: [
        { address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", name: "USDC", symbol: "USDC", decimals: 6 },
        { address: "0x3e622317f8C93f7328350cF0B56d9eD4C620C5d6", name: "DAI", symbol: "DAI", decimals: 18 }
      ]
    }
  }
};
export const TOKEN_RESULTS=20;
export const DEFAULT_CHAIN_ID = process.env.NODE_ENV === "development" ? 31337 : 11155111;