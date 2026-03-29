import React, { useState, useEffect, createContext, useContext, useCallback ,useMemo,useRef} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { NETWORKS, DEFAULT_CHAIN_ID, ARTIFACTS ,TOKEN_RESULTS} from "../config";
const axios =require("axios");
import { getLogoUrl } from "../Utils/tokenHelper";
import { getQuoteExactInput,getQuoteExactOutput } from "../Utils/swapUpdatePrice";
import { saveSession, getSession }  from "../Utils/sessionControl";
import { claimBonus } from "../Utils/claimBonus";
import { liquidityLevel,swapLevel } from "../Utils/level";
const TOP_TOKENS_QUERY = `
{
  tokens(orderBy: volumeUSD, orderDirection: desc, first: ${TOKEN_RESULTS}) {
    id name symbol decimals volumeUSD totalValueLockedUSD txCount totalSupply
  }
}`;

// 1. Create the Context
const SwapTokenContext = createContext();

// 2. Export a custom hook for easy access
export const useSwapContext = () => useContext(SwapTokenContext);

export const SwapTokenContextProvider = ({ children }) => {
  // --- STATE ---
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [networkName, setNetworkName] = useState("");
  const [tokenData, setTokenData] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [topTokens,setTopTokens]=useState([]);
  const [contracts, setContracts] = useState({ router: null, quoter: null ,singleSwapToken: null, auraCoin: null, userStorageData: null});
  const [hasClaimed, setHasClaimed] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [Lpercentage,setLpercentage]=useState(0);
  const [Spercentage,setSpercentage]=useState(0);
  const [Ltier,setLTier]=useState("");
  const [Stier,setSTier]=useState("");

  const hasPriorSession = useRef(!!getSession());
  const prevLTier = useRef("");
  const prevSTier = useRef("");

  // --- HELPER: Get Active Network Config ---
  const activeConfig = useMemo(() => {
  return NETWORKS[chainId] || NETWORKS[DEFAULT_CHAIN_ID];
}, [chainId]);

  // --- 3. CORE DATA LOADER ---
  const fetchAccountData = useCallback(async (userAddr, currentProvider, currentChainId,contract) => {
    const config = NETWORKS[currentChainId];
    if (!config) return;

    try {
      // Fetch Eth Balance
      const ethBal = await currentProvider.getBalance(userAddr);
      
      // Fetch Token Balances from Config
      const tokens = await Promise.all(config.contracts.tokens.map(async (token) => {
        try {
          const contract = new ethers.Contract(token.address,ARTIFACTS.ERC20, currentProvider);
          const bal = await contract.balanceOf(userAddr);
          return {
            ...token,
            tokenBalance: ethers.utils.formatUnits(bal, token.decimals)
          };
        } catch (e) {
          console.warn(`Could not load ${token.symbol}`);
          return null;
        }
      }));

      setTokenData(tokens.filter(Boolean));

      // Fetch specific app data explicitly avoiding activeConfig checks
      try {
         
          const txs = await contract.userStorageData.getAllTransactions(userAddr);
          // Swaps are logged using Date.now() (timestamps > 1000000000000). LP Positions use basic sequential IDs (1, 2, 3...)
          const swaps = txs.filter(tx => Number(tx.tokenId.toString()) >= 1000000000000 || tx.tokenId.toString() === "0");
          const pools = txs.filter(tx => Number(tx.tokenId.toString()) < 1000000000000 && tx.tokenId.toString() !== "0");
          setAllTransactions(txs);

          const {ltier,lpercentage}=liquidityLevel(pools.length);
          const {stier,spercentage}=swapLevel(swaps.length);
         

          setLTier(ltier);
          setSTier(stier);
          setSpercentage(spercentage);
          setLpercentage(lpercentage);
          
      } catch (err) {
          console.error("Error verifying storage or aura events:", err);
      }

    } catch (error) {
      console.error("Error loading account data:", error);
    }
  }, []);

  // --- 4. WALLET CONNECTION ---
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      const newSigner = newProvider.getSigner();
      
      const { chainId , name } = await newProvider.getNetwork();
      const address = await newSigner.getAddress();
      const netconfig=NETWORKS[DEFAULT_CHAIN_ID];
      saveSession(address,chainId);
      
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(address);
      setChainId(chainId);
      setNetworkName(name);

      //await fetchAccountData(address, newProvider, chainId);
      await fetchTopTokens(netconfig.subgraphUrl);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchTopTokens = useCallback(async (overrideURL) => {
  const url = overrideURL || activeConfig?.subgraphUrl;
  if (!url) return setTopTokens([]); // Skip if no subgraph for this network (e.g. Localhost)

  try {
    const { data } = await axios.post(url, { query: TOP_TOKENS_QUERY });
    const formatted = data.data.tokens.map(token => ({
      ...token,
      address: token.id, // Aligning naming convention with local tokens
      logo: getLogoUrl(token.id)
    }));
    
    setTopTokens(formatted);
  } catch (error) {
    console.error("Graph Fetch Error:", error);
  }
}, [activeConfig?.subgraphUrl]);

const getSwapQuote = async (isExactInput, tokenIn, tokenOut, fee, amount) => {
    
  try{
    if (!contracts.quoter) return;

      const amountWei = ethers.utils.parseUnits(amount.toString(), 18); // Adjust decimals as needed

      if (isExactInput) {
        return await getQuoteExactInput(contracts.quoter, {
          tokenIn,
          tokenOut,
          fee,
          amountIn: amountWei,
          sqliteSqrtPriceLimitX96:0
        });
      } else {
        return await getQuoteExactOutput(contracts.quoter, {
          tokenIn,
          tokenOut,
          fee,
          amountOut: amountWei,
          sqliteSqrtPriceLimitX96:0
        });
      }
    }
    catch(e)
    {
      console.log("Price update failed",e);
    }
    };

    const singleSwap= async(isExactOputput,tokenIn,tokenOut,amountIn,amountOut,fee) => {
      try{
        const swapIn=ethers.utils.parseUnits(amountIn.toString(),tokenIn.decimals);
        const swapOut=ethers.utils.parseUnits(amountOut.toString(),tokenOut.decimals);
        const contract=new ethers.Contract(tokenIn.tokenAddress,ARTIFACTS.ERC20, signer || provider);
        const sfee=await contracts.singleSwapToken.estimateScarcityFee(tokenIn.tokenAddress,tokenOut.tokenAddress,fee);
        await contracts.auraCoin.approve(activeConfig.contracts.singleSwapToken,sfee);
        await contract.approve(activeConfig.contracts.singleSwapToken,swapIn);

        if(isExactOputput)
        {
          const tarnsaction = await contracts.singleSwapToken.swapExactInputSingle(
          tokenIn.tokenAddress,
          tokenOut.tokenAddress,
          swapIn,
          fee,
          {
            gasLimit: 1000000,
          },
        );
        await tarnsaction.wait();

        }
        else{
          const tarnsaction = await contracts.singleSwapToken.swapExactOutputSingle(
            tokenIn.tokenAddress,
            tokenOut.tokenAddress,
            swapOut,
            swapIn,
            fee,
            {
            gasLimit: 1000000,
            },
          );
          await tarnsaction.wait();
        }
        try {
            const swapId = Date.now();
            const logTx = await contracts.userStorageData.addToBlockchain(activeConfig.contracts.router, tokenIn.tokenAddress, tokenOut.tokenAddress, swapId); 
            await logTx.wait();
        } catch (err) {
            console.error("Error logging swap to UserStorageData:", err);
        }
        fetchAccountData(account, provider, chainId,contracts);
      }
      catch(e)
      {
        console.log("Swap failed",e);
      }
    }

  useEffect(() => {
    if (!signer && !provider) return;
    const target = signer || provider;

    setContracts({
      quoter: new ethers.Contract(activeConfig.contracts.quoter, ARTIFACTS.quoter, target), // Preloaded
      singleSwapToken:new ethers.Contract(activeConfig.contracts.singleSwapToken, ARTIFACTS.singleSwapToken, target),
      auraCoin: activeConfig?.contracts?.aura ? new ethers.Contract(activeConfig.contracts.aura, ARTIFACTS.aura, target) : null,
      userStorageData: activeConfig?.contracts?.userStorageData ? new ethers.Contract(activeConfig.contracts.userStorageData, ARTIFACTS.userStorgeData, target) : null
    });
  }, [signer, provider, activeConfig]);

  useEffect(() => {
    if (account && provider && chainId && contracts.userStorageData!=null) {

      fetchAccountData(account, provider, chainId,contracts);
    }
  }, [account, provider, chainId, contracts.userStorageData, fetchAccountData, contracts]);

  useEffect(() => {
    if (!account || !contracts.auraCoin || !networkName) return;

    const claimIfEligible = async () => {
      let shouldClaimL = false;
      let shouldClaimS = false;
      const lTierChanged = Ltier !== prevLTier.current;
      const sTierChanged = Stier !== prevSTier.current;
      if (!hasPriorSession.current) {
        // No prior session: Claim on the first valid tier fetch AND any future changes
        if (Ltier && Ltier !== "" && lTierChanged) shouldClaimL = true;
        if (Stier && Stier !== "" && sTierChanged) shouldClaimS = true;
      } else {
        // Had prior session: DO NOT claim on the initial data fetch (when prev is "")
        // ONLY claim when moving from one valid tier to a NEW valid tier
        if (prevLTier.current !== "" && Ltier !== "" && lTierChanged) shouldClaimL = true;
        if (prevSTier.current !== "" && Stier !== "" && sTierChanged) shouldClaimS = true;
      }

      try {
        if (shouldClaimL) await claimBonus(account, contracts.auraCoin, networkName, Ltier);
        if (shouldClaimS) await claimBonus(account, contracts.auraCoin, networkName, Stier);
        fetchAccountData(account, provider, chainId,contracts);
      } catch (error) {
        console.error("Failed to claim bonus:", error);
      }

      // Update refs for the next render
      prevLTier.current = Ltier;
      prevSTier.current = Stier;
    };

    claimIfEligible();
  }, [Ltier, Stier, account, contracts.auraCoin, networkName]);

  // --- 5. AUTOMATIC REFRESH ON ACCOUNT/CHAIN CHANGE ---
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) connectWallet();
        else setAccount("");
      });
      window.ethereum.on("chainChanged", (ChainId) => {
      window.location.reload(); 
    });
    }
  }, []);

  // Remove fetchTopTokens from connectWallet and use this:
  useEffect(() => {
    if (chainId) {
      fetchTopTokens();
    }
  }, [chainId, fetchTopTokens]);

  useEffect(() => {
    const session = getSession();
    
    if (session && session.address && session.chainId ) {
      setAccount(session.address);
      setChainId(session.chainId);
      connectWallet();
    }
  }, []);

  // --- 6. CONTEXT VALUE ---
  const value = {
    account,
    signer,
    provider,
    chainId,
    tokenData,
    networkName,
    activeConfig,
    isConnecting,
    topTokens,
    hasClaimed,
    setHasClaimed,
    allTransactions,
    Ltier,
    Stier,
    Spercentage,
    Lpercentage,
    contracts,
    getSwapQuote,
    connectWallet,
    singleSwap,
    refreshData: () => fetchAccountData(account, provider, chainId,contracts)
  };

  return (
    <SwapTokenContext.Provider value={value}>
      {children}
    </SwapTokenContext.Provider>
  );
};