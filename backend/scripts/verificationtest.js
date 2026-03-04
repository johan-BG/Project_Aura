const { expect } = require("chai");
const { ethers } = require("hardhat");
const axios = require("axios");
const {claimBonus}=require("../../frontend/Utils/claimBonus");

describe("ClaimBonus Functionality", function () {
    let token;
    let owner, user;
    const BACKEND_URL = "http://localhost:5000/get-signature";
    const contract_address=require("../server/utils/contract.json");
    //const abi=require("../artifacts/contracts/ERC20Aura.sol/AuraCoin.json").abi;

    before(async function () {
        // Get accounts from Hardhat
        [owner, user] = await ethers.getSigners();

        // const code = await ethers.provider.getCode(contract_address);
        // console.log("Contract code:", code);

        // Deploy the contract (v3.4.2 style)
        token = await ethers.getContractAt("AuraCoin",contract_address);
        token=token.connect(user.address);
        // owner.address is the signerAddress the Python server uses
        // token = await Token.deploy(); 
        // await token.deployed();

        console.log("Contract deployed to:", token.address);
        console.log("Testing with User Address:", user.address);
    });

    /**
     * The function you requested to test
     */
    // const claimBonus = async (userAddress, contractInstance, userSigner) => {
    //     try {
    //         // 1. Fetch signature from Python Backend
    //         const response = await axios.post(BACKEND_URL, {
    //             address: userAddress
    //         });

    //         const { amount, signature } = response.data;
    //         console.log(response.data);
    //         // 2. Call the smart contract
    //         // We connect the userSigner so the msg.sender is the user
    //         const tx = await contractInstance.connect(userSigner).claimWithSignature(
    //             amount, 
    //             signature
    //         );
    //         return await tx.wait();
    //     } catch (error) {
    //         // Re-throw the error so the test can catch it
    //         if (error.response) {
    //             throw new Error(error.response.data.error);
    //         }
    //         throw error;
    //     }
    // };

    it("1) Should allow the user to claim their first bonus", async function () {
        console.log(token.address);
        const initialBalance = await token.balanceOf(user.address);
        
        await claimBonus(user.address, token);

        const finalBalance = await token.balanceOf(user.address);
        expect(finalBalance).to.be.gt(initialBalance);
        console.log("First claim successful. Balance:", ethers.utils.formatEther(finalBalance));
    });

    it("2) Should fail when the user attempts to claim a second time", async function () {
        try {
            await claimBonus(user.address, token);
            // If it doesn't throw an error, force the test to fail
            expect.fail("The second claim should have been blocked by the backend.");
        } catch (error) {
            // Check if the error message matches what your Python script sends
            expect(error.message).to.contain("Security Alert");
            console.log("Second claim blocked correctly by Python backend.");
        }
    });
});