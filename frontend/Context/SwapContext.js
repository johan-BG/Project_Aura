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


const SwapTokenContext = createContext();


export const useSwapContext = () => useContext(SwapTokenContext);

export const SwapTokenContextProvider = ({ children }) => {
  
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [readProvider, setReadProvider] = useState(null);
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [networkName, setNetworkName] = useState("");
  const [tokenData, setTokenData] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [topTokens,setTopTokens]=useState([]);
  const [contracts, setContracts] = useState({ router: null, quoter: null ,singleSwapToken: null, auraCoin: null, userStorageData: null, factory:null});
  const [hasClaimed, setHasClaimed] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [Lpercentage,setLpercentage]=useState(0);
  const [Spercentage,setSpercentage]=useState(0);
  const [Ltier,setLTier]=useState("");
  const [Stier,setSTier]=useState("");

  const hasPriorSession = useRef(!!getSession());
  const prevLTier = useRef("");
  const prevSTier = useRef("");

  
  const activeConfig = useMemo(() => {
  return NETWORKS[chainId] || NETWORKS[DEFAULT_CHAIN_ID];
}, [chainId]);

  
  const fetchAccountData = useCallback(async (userAddr, currentProvider, currentChainId,contract) => {
    const config = NETWORKS[currentChainId];
    if (!config) return;

    try {
      
      const ethBal = await currentProvider.getBalance(userAddr);
      
      
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

      
      try {
         
          const txs = await contract.userStorageData.getAllTransactions(userAddr);
          
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
      const newReadProvider = new ethers.providers.JsonRpcProvider(NETWORKS[chainId].rpc);
      saveSession(address,chainId);
      setReadProvider(newReadProvider);
      setProvider(newProvider);
      setSigner(newSigner);
      setAccount(address);
      setChainId(chainId);
      setNetworkName(name);

      
      await fetchTopTokens(netconfig.subgraphUrl);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchTopTokens = useCallback(async (overrideURL) => {
  const url = overrideURL || activeConfig?.subgraphUrl;
  if (!url) return setTopTokens([]); 

  try {
    const { data } = await axios.post(url, { query: TOP_TOKENS_QUERY });
    const formatted = data.data.tokens.map(token => ({
      ...token,
      address: token.id, 
      logo: getLogoUrl(token.id)
    }));
    
    setTopTokens(formatted);
  } catch (error) {
    console.error("Graph Fetch Error:", error);
  }
}, [activeConfig?.subgraphUrl]);

const getSwapQuote = async (isExactInput, tokenIn, tokenOut, fee, amount) => {
  const amountWei = ethers.utils.parseUnits(amount.toString(), 18); 
  try{
      let amountOut;
      if (isExactInput) {
        amountOut = await getQuoteExactInput(contracts.quoter, {
          tokenIn,
          tokenOut,
          fee,
          amountIn: amountWei,
          sqliteSqrtPriceLimitX96:0
        });
      } else {
        amountOut = await getQuoteExactOutput(contracts.quoter, {
          tokenIn,
          tokenOut,
          fee,
          amountOut: amountWei,
          sqliteSqrtPriceLimitX96:0
        });
      }
      return {
        swap:true,
        amount:amountOut
      };
      
    }
    catch(e)
    {
    const poolAddress = await contracts.factory.getPool(tokenIn, tokenOut, fee);
    if (poolAddress === ethers.constants.AddressZero) {
            return { 
                swap:false,
                error: "Pool does not exist for this token pair and fee tier." 
            };
        }
    const poolContract = new ethers.Contract(poolAddress, ARTIFACTS.pool, readProvider);
    const liquidity = await poolContract.liquidity();

    if (liquidity.isZero()) {
          return { 
              swap:false,
              error:"Pool has no liquidity"
          };
      }

    const tokenOutContract = new ethers.Contract(tokenOut, ARTIFACTS.ERC20, readProvider);
    const poolBalance = await tokenOutContract.balanceOf(poolAddress);
    if(Number(poolBalance) <= Number(amountWei))
      return {
        swap:false,
        error:"Pool does not have sufficient balance"
      };
    }
    return {
      swap:false,
      error:"Quote faided"
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
      quoter: activeConfig?.contracts?.quoter ? new ethers.Contract(activeConfig.contracts.quoter, ARTIFACTS.quoter, readProvider):null, 
      singleSwapToken: activeConfig?.contracts?.singleSwapToken ? new ethers.Contract(activeConfig.contracts.singleSwapToken, ARTIFACTS.singleSwapToken, target):null,
      auraCoin: activeConfig?.contracts?.aura ? new ethers.Contract(activeConfig.contracts.aura, ARTIFACTS.aura, target) : null,
      userStorageData: activeConfig?.contracts?.userStorageData ? new ethers.Contract(activeConfig.contracts.userStorageData, ARTIFACTS.userStorgeData, target) : null,
      factory:activeConfig?.contracts?.factory ? new ethers.Contract(activeConfig.contracts.factory,ARTIFACTS.factory,target):null
    });
  }, [signer, provider, activeConfig]);

  useEffect(() => {
    if (account && provider && chainId && contracts.userStorageData!=null) {

      fetchAccountData(account, readProvider, chainId,contracts);
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
        
        if (Ltier && Ltier !== "" && lTierChanged) shouldClaimL = true;
        if (Stier && Stier !== "" && sTierChanged) shouldClaimS = true;
      } else {
        
        
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

      
      prevLTier.current = Ltier;
      prevSTier.current = Stier;
    };

    claimIfEligible();
  }, [Ltier, Stier, account, contracts.auraCoin, networkName]);

  
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
    refreshData: () => fetchAccountData(account, readProvider, chainId,contracts)
  };

  return (
    <SwapTokenContext.Provider value={value}>
      {children}
    </SwapTokenContext.Provider>
  );
};