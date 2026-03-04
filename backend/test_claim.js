const hre = require("hardhat");
const { ethers } = hre;
const { Web3 } = require("web3"); // we can simulate web3 python keccak

async function main() {
    const addresses = require("./frontend/localhost_address.json");
    const auraAddress = addresses.AuraCoin;
    
    const AuraCoin = await ethers.getContractFactory("AuraCoin");
    const token = await AuraCoin.attach(auraAddress);
    
    // account 0
    const [deployer, user1] = await ethers.getSigners();
    
    console.log("Signer address configured on contract:", await token.signerAddress());
    console.log("Expected deployer/signer:", deployer.address);
    console.log("User address:", user1.address);
    
    // Simulate python hashing
    const amount = ethers.utils.parseUnits("50", 18);
    // uint256 is 32 bytes, address is 20 bytes
    // abi.encodePacked
    const hash = ethers.utils.solidityKeccak256(["address", "uint256"], [user1.address, amount]);
    
    // Sign
    const signature = await deployer.signMessage(ethers.utils.arrayify(hash));
    
    console.log("Generated signature:", signature);
    
    try {
        console.log("Sending claimWithSignature...");
        const tx = await token.connect(user1).claimWithSignature(amount, signature);
        await tx.wait();
        console.log("Success! Balance:", await token.balanceOf(user1.address));
    } catch (e) {
        console.error("Failed!", e.message);
    }
}

main().catch(console.error);
