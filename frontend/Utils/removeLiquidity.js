import { ethers } from "ethers";

export const removeLiquidity = async (tokenId,contracts,account) => {
    if (!contracts.manager || !account) return;

    try {
        
        const position = await contracts.manager.positions(tokenId);
        const liquidity = position.liquidity;

        if (liquidity.isZero()) {
            throw new Error("Position has no liquidity to remove.");
        }

        
        const decreaseParams = {
            tokenId: tokenId,
            liquidity: liquidity, 
            amount0Min: 0, 
            amount1Min: 0,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        };

        const decreaseTx = await contracts.manager.decreaseLiquidity(decreaseParams, {
            gasLimit: 500000,
        });
        await decreaseTx.wait();

        
        
        const receipt = await collectFees(tokenId,contracts,account);
        
        return receipt;
    } catch (error) {
        console.error("Remove Liquidity Error:", error);
    } 
};


const collectFees = async (tokenId,contracts,account) => {
    if (!contracts.manager || !account) return;

    try {
        const collectParams = {
            tokenId: tokenId,
            recipient: account,
            
            amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
            amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
        };

        const collectTx = await contracts.manager.collect(collectParams, {
            gasLimit: 500000,
        });
        const receipt = await collectTx.wait();
        
        
        return receipt;
    } catch (error) {
        console.error("Collect Fees Error:", error);
    }
};