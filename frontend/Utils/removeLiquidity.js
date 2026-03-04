import { ethers } from "ethers";

export const removeLiquidity = async (tokenId,contracts,account) => {
    if (!contracts.manager || !account) return;

    try {
        // Fetch position details to get current liquidity amount
        const position = await contracts.manager.positions(tokenId);
        const liquidity = position.liquidity;

        if (liquidity.isZero()) {
            throw new Error("Position has no liquidity to remove.");
        }

        // Phase 1: Decrease Liquidity (Moves funds from Pool -> Manager)
        const decreaseParams = {
            tokenId: tokenId,
            liquidity: liquidity, // 100% of the position
            amount0Min: 0, 
            amount1Min: 0,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10,
        };

        const decreaseTx = await contracts.manager.decreaseLiquidity(decreaseParams, {
            gasLimit: 500000,
        });
        await decreaseTx.wait();

        // Phase 2: Collect (Moves funds from Manager -> User Wallet)
        // We chain this immediately for a "Remove All" experience
        const receipt = await collectFees(tokenId,contracts,account);
        
        return receipt;
    } catch (error) {
        console.error("Remove Liquidity Error:", error);
    } 
};

// 2. COLLECT FEES (Claiming earned 0.3% / 1% fees)
const collectFees = async (tokenId,contracts,account) => {
    if (!contracts.manager || !account) return;

    try {
        const collectParams = {
            tokenId: tokenId,
            recipient: account,
            // We use the "Max" trick to sweep everything owed to the user
            amount0Max: ethers.BigNumber.from(2).pow(128).sub(1),
            amount1Max: ethers.BigNumber.from(2).pow(128).sub(1),
        };

        const collectTx = await contracts.manager.collect(collectParams, {
            gasLimit: 500000,
        });
        const receipt = await collectTx.wait();
        
        // Refresh positions to show updated fee data in UI
        return receipt;
    } catch (error) {
        console.error("Collect Fees Error:", error);
    }
};