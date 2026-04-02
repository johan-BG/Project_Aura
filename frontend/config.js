// config.js
import localhost from "./localhost_address.json";
import sepolia from "./sepolia_address.json";
import optimism from "./optimism_address.json";

import userStorgeData from "./Context/UserStorageData.json";
import ERC20 from "./Context/ERC20.json";
import pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import manager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import quoterAbi from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import SingleSwapTokenABI  from "./Context/SingleSwapToken.json";
import factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import aura from "./Context/AuraCoin.json";

console.log(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);
export const ARTIFACTS = {
  userStorgeData: userStorgeData.abi,
  ERC20:ERC20.abi,
  aura:aura.abi,
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
      positionManager: localhost.nonfungiblePositionManager,
      factory: localhost.factory,
      router: localhost.swaprouter, // Usually deployed locally in your scripts
      userStorageData: localhost.UserStorageData,
      quoter:localhost.quoter,
      singleSwapToken:localhost.SingleSwapToken,
      aura:localhost.AuraCoin,
      tokens: [
        { 
          address: localhost.BooCoin, 
          name: "BooCoin", 
          symbol: "BOO", 
          decimals: 18
        },
        { 
          address: localhost.AuraCoin, 
          name: "AuraCoin", 
          symbol: "AURA", 
          decimals: 18,
          img: "/assets/Aura_coin.png" 
        },
        { 
          address: localhost.popUp,
          name: "PopUp", 
          symbol: "POP", 
          decimals: 18,
        },
        { 
          address: localhost.shoaib,
          name: "Shoaib", 
          symbol: "SHO", 
          decimals: 18,
        },
        { 
          address: localhost.rayyan,
          name: "Rayyan", 
          symbol: "RAY", 
          decimals: 18,
        },
        { 
          address:localhost.weth,
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
    subgraphUrl: "https://gateway.thegraph.com/api/5f704218070c5797b1928dd757cd63a0/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      positionManager: sepolia.nonfungiblePositionManager,
      factory: sepolia.factory,
      router: sepolia.swaprouter, // Usually deployed locally in your scripts
      userStorageData: sepolia.UserStorageData,
      quoter:sepolia.quoter,
      singleSwapToken:sepolia.SingleSwapToken,
      aura:sepolia.AuraCoin,
      tokens: [
        { 
          address: sepolia.BooCoin, 
          name: "BooCoin", 
          symbol: "BOO", 
          decimals: 18
        },
        { 
          address: sepolia.AuraCoin, 
          name: "AuraCoin", 
          symbol: "AURA", 
          decimals: 18,
          img: "/assets/Aura_coin.png" 
        },
        { 
          address: sepolia.popUp,
          name: "PopUp", 
          symbol: "POP", 
          decimals: 18,
        },
        { 
          address: sepolia.shoaib,
          name: "Shoaib", 
          symbol: "SHO", 
          decimals: 18,
        },
        { 
          address: sepolia.rayyan,
          name: "Rayyan", 
          symbol: "RAY", 
          decimals: 18,
        },
        { 
          address:sepolia.weth,
          name: "Wrapped ETH", 
          symbol: "WETH", 
          decimals: 18,
        }
      ]
    }
  },
  11155420: {
    name: "OP Sepolia Testnet",
    rpc: `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    subgraphUrl: "https://gateway.thegraph.com/api/5f704218070c5797b1928dd757cd63a0/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
    explorer: "https://sepolia.etherscan.io",
    contracts: {
      positionManager: optimism.nonfungiblePositionManager,
      factory: optimism.factory,
      router: optimism.swaprouter, // Usually deployed locally in your scripts
      userStorageData: optimism.UserStorageData,
      quoter:optimism.quoter,
      singleSwapToken:optimism.SingleSwapToken,
      aura:optimism.AuraCoin,
      tokens: [
        { 
          address: optimism.BooCoin, 
          name: "BooCoin", 
          symbol: "BOO", 
          decimals: 18
        },
        { 
          address: optimism.AuraCoin, 
          name: "AuraCoin", 
          symbol: "AURA", 
          decimals: 18,
          img: "/assets/Aura_coin.png" 
        },
        { 
          address: optimism.popUp,
          name: "PopUp", 
          symbol: "POP", 
          decimals: 18,
        },
        { 
          address: optimism.shoaib,
          name: "Shoaib", 
          symbol: "SHO", 
          decimals: 18,
        },
        { 
          address: optimism.rayyan,
          name: "Rayyan", 
          symbol: "RAY", 
          decimals: 18,
        },
        { 
          address:optimism.weth,
          name: "Wrapped ETH", 
          symbol: "WETH", 
          decimals: 18,
        }
      ]
    }
  }
};
export const TOKEN_RESULTS=20;
export const DEFAULT_CHAIN_ID = 31337;