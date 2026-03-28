export const claimBonus = async (userAddress, contract, network, level) => {
    // 1. Handshake Phase 1: Get Signature
    if(network=="unknown")
        network="localhost";
    const sigResponse = await fetch("https://projectaura-production.up.railway.app/get-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress, network, level })
    });
    const sigData = await sigResponse.json();
    if (!sigResponse.ok ) return level=="signIn"?alert(sigData.error):null;

    // 2. Handshake Phase 2: Execute On-Chain
    try {
        const tx = await contract.claimWithSignature(sigData.amount, level, sigData.signature);
        console.log("Transaction sent! Waiting for handshake confirmation...");
        
        // 3. Handshake Phase 3: Send confirmation to Backend
        const confirmResponse = await fetch("https://projectaura-production.up.railway.app/confirm-tx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                address: userAddress, 
                network, 
                level, 
                tx_hash: tx.hash 
            })
        });

        const confirmData = await confirmResponse.json();
        if (confirmData.success) {
            alert("Bonus transferd!!");
            await tx.wait(); // Final UI update
        }

    } catch (error) {
        console.error("Handshake failed at Phase 2/3:", error);
    }
};