import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { ethers } from "ethers";
import { useSwapContext } from "./SwapContext";
import { createPool } from "../Utils/deployPool";
import { getLiquidityData } from "../Utils/checkLiquidity";
import { addLiquidity } from "../Utils/addLiquidity";
import { ARTIFACTS } from "../config";
import { removeLiquidity } from "../Utils/removeLiquidity";


const LiquidityContext = createContext();

export const LiquidityProvider = ({ children }) => {
    const { signer,chainId , provider, account, activeConfig ,refreshData} = useSwapContext();
    const [contracts, setContracts] = useState({ factory: null, manager: null, userStorage: null });
    const [allLiquidity, setAllLiquidity] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    
    useEffect(() => {
        if (!signer && !provider) return;
        const target = signer || provider;
        setContracts({
            factory: new ethers.Contract(activeConfig.contracts.factory, ARTIFACTS.factory, target),
            manager: new ethers.Contract(activeConfig.contracts.positionManager, ARTIFACTS.manager, target),
            userStorage: new ethers.Contract(activeConfig.contracts.userStorageData, ARTIFACTS.userStorgeData, target)
        });
    }, [signer, provider, activeConfig]);

    
    const fetchUserPositions = useCallback(async () => {
        if (!account || !contracts.manager || !contracts.factory) return;
        
        setIsLoading(true);
        try {
            
            const allTxs = await contracts.userStorage.getAllTransactions(account);
            
            
            const nfts = allTxs.filter(tx => tx.tokenId.toString() !== "0" && Number(tx.tokenId.toString()) < 1000000000000);

            const liquidityResults = await Promise.all(
                nfts.map(async (nft) => {
                    const positionInfo = await contracts.manager.positions(nft.tokenId);
                    
                    
                    const hasLiquidity = positionInfo.liquidity.gt(0);
                    const hasDust = positionInfo.tokensOwed0.gt(0) || positionInfo.tokensOwed1.gt(0);
                    
                    if (!hasLiquidity && !hasDust) return null;
                    
                    
                    const poolAddress = await contracts.factory.getPool(
                        positionInfo.token0, 
                        positionInfo.token1, 
                        positionInfo.fee
                    );

                    
                    const data = await getLiquidityData(
                        poolAddress,
                        positionInfo.token0,
                        positionInfo.token1,
                        nft.tokenId,
                        provider || signer.provider,
                        contracts
                    );

                    return {
                        ...data,
                        tokenId: nft.tokenId.toString(),
                        fee: positionInfo.fee
                    };
                })
            );

            setAllLiquidity(liquidityResults.filter(Boolean));
        } catch (error) {
            console.error("Error fetching all liquidity:", error);
        } finally {
            setIsLoading(false);
        }
    }, [account, contracts, provider, signer]);

    
    const createLiquidityAndPool = async (params) => {
        setIsLoading(true);
        try {
            if (!signer && !provider) return;
                const target = signer || provider;
            const poolAddress = await createPool(
                params.token0.tokenAddress,
                params.token1.tokenAddress,
                params.fee,
                params.tokenPrice1,
                params.tokenPrice2,
                contracts
            );

            const info = await addLiquidity(
                params.token0,
                params.token1,
                poolAddress,
                params.tokenAmount0,
                params.tokenAmount1,
                contracts,
                target,
                account
            );
          
            
            const tx = await contracts.userStorage.addToBlockchain(
                poolAddress,
                params.token1.tokenAddress,
                params.token1.tokenAddress,
                info
            );
            await tx.wait();

            
            await fetchUserPositions();
            await refreshData();
        } catch (error) {
            console.error("Operation failed:", error);
        }
        finally{
            setIsLoading(false);
        }
    };

    

    const removeLiquidityAndUpdateData= async(tokenId) => {
        try{
            setIsLoading(true);
            const receipt= await removeLiquidity(tokenId,contracts,account);
            await contracts.userStorage.removeTransaction(tokenId);
            await fetchUserPositions();
            await refreshData();
        }
        catch(e)
        {
            console.log("Liquidity Removal failed",e);
        }
        finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
          fetchUserPositions();
      }, [account,activeConfig,fetchUserPositions]);

    return (
        <LiquidityContext.Provider value={{ 
            ...contracts, 
            allLiquidity, 
            isLoading,  
            removeLiquidityAndUpdateData,
            createLiquidityAndPool,
            fetchUserPositions
        }}>
            {children}
        </LiquidityContext.Provider>
    );
};

export const useLiquidity = () => useContext(LiquidityContext);