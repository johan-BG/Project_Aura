export const claimBonus = async (userAddress, contract, network, level) => {
    // 1. Handshake Phase 1: Get Signature
    let url=process.env.NEXT_PUBLIC_SERVER_URL;
    if(network=="unknown")
        {
            network="localhost";
            url="http://127.0.0.1:5000";
        }
    const sigResponse = await fetch(`${url}/get-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress, network, level })
    });
    const sigData = await sigResponse.json();
    if (!sigResponse.ok ) return level=="signIn"?alert(sigData.error):null;

    // 2. Handshake Phase 2: Execute On-Chain
    try {
        const tx = await contract.claimWithSignature(sigData.amount, level, sigData.signature);
        
        // 3. Handshake Phase 3: Send confirmation to Backend
        const confirmResponse = await fetch(`${url}/confirm-tx`, {
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