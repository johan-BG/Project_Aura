export const claimBonus = async(userAddress,contract) => {

    const response = await fetch("http://localhost:5000/get-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: userAddress })
    });

    const data = await response.json();

    if (!response.ok) {
        // This will display: "Security Alert: Our records show..."
        alert(data.error); 
        return;
    }

    // Otherwise, proceed to call the smart contract
    const { amount, signature } = data;

    try {
        const tx = await contract.claimWithSignature(amount, signature);
        await tx.wait();
        console.log("Bonus Claimed successfully!");
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}