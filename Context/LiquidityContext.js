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

    // --- 1. Load Contracts Once ---
    useEffect(() => {
        if (!signer && !provider) return;
        const target = signer || provider;
        setContracts({
            factory: new ethers.Contract(activeConfig.contracts.factory, ARTIFACTS.factory, target),
            manager: new ethers.Contract(activeConfig.contracts.positionManager, ARTIFACTS.manager, target),
            userStorage: new ethers.Contract(activeConfig.contracts.userStorageData, ARTIFACTS.userStorgeData, target)
        });
    }, [signer, provider, activeConfig]);

    // --- 2. Fetch All User Positions ---
    const fetchUserPositions = useCallback(async () => {
        if (!account || !contracts.manager || !contracts.factory) return;
        
        setIsLoading(true);
        try {
            // Get number of NFTs owned by user
            const nfts=await contracts.userStorage.getAllTransactions(account);
            
            const liquidityResults = await Promise.all(
                nfts.map(async (nft) => {
                    const positionInfo = await contracts.manager.positions(nft.tokenId);
                    
                    // Skip empty positions with no pending fees (dust)
                    const hasLiquidity = positionInfo.liquidity.gt(0);
                    const hasDust = positionInfo.tokensOwed0.gt(0) || positionInfo.tokensOwed1.gt(0);
                    
                    if (!hasLiquidity && !hasDust) return null;
                    
                    // Derive Pool Address from Factory (cached logic)
                    const poolAddress = await contracts.factory.getPool(
                        positionInfo.token0, 
                        positionInfo.token1, 
                        positionInfo.fee
                    );

                    // Get detailed pricing/amount data from your Utils
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

    // --- 3. Create Pool & Add Liquidity ---
    const createLiquidityAndPool = async (params) => {
        try {
            if (!signer && !provider) return;
                const target = signer || provider;
            console.log(params);
            const poolAddress = await createPool(
                params.token0.tokenAddress,
                params.token1.tokenAddress,
                params.fee,
                params.tokenPrice1,
                params.tokenPrice2,
                contracts
            );
            console.log(poolAddress,params);

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
            console.log(info);
            // Save to your custom UserStorage smart contract
            await contracts.userStorage.addToBlockchain(
                poolAddress,
                params.token1.tokenAddress,
                params.token1.tokenAddress,
                info
            );

            // Refresh the list after saving
            await fetchUserPositions();
            await refreshData();
        } catch (error) {
            console.error("Operation failed:", error);
        }
    };

    //Liquidity Removal

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
      }, [account,chainId,fetchUserPositions]);

    return (
        <LiquidityContext.Provider value={{ 
            ...contracts, 
            allLiquidity, 
            isLoading,  
            removeLiquidityAndUpdateData,
            createLiquidityAndPool 
        }}>
            {children}
        </LiquidityContext.Provider>
    );
};

export const useLiquidity = () => useContext(LiquidityContext);