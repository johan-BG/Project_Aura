import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import Style from './Profile.module.css';
import InvestmentRanking from './InvestmentRanking';
import SwapRanking from './SwapRanking';
import { useSwapContext } from '../../Context/SwapContext';
import { claimBonus } from '../../Utils/claimBonus';
import { AuraCoinAddress, AuraCoinABI } from '../../Context/constants';

const Profile = ({ account }) => {
  const { provider, signer } = useSwapContext();
  
  const [investmentTier] = useState("Bronze");
  const [investmentProgress] = useState(79);
  const [swapTier] = useState("Bronze");
  const [swapProgress] = useState(0);

  const [isClaimed, setIsClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Optional: Add logic here to check if the user has already claimed the bonus
  // useEffect(() => { ... check contract or backend ... }, [account]);

  const handleClaimBonus = async () => {
    if (!account || !signer) return alert("Please connect wallet first");
    
    setIsLoading(true);
    try {
      // Connect to AuraCoin to execute the signature claim
      const contract = new ethers.Contract(AuraCoinAddress, AuraCoinABI, signer);
      
      // claimBonus expects (userAddress, contract)
      // Since it doesn't return a bool natively but alerts on the .ok failure, 
      // we can await it and assume if it doesn't throw, it may have succeeded.
      // Modifying it slightly to ensure state only updates on true success:
      const response = await fetch("http://localhost:5000/get-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account })
      });

      const data = await response.json();

      if (!response.ok) {
          alert(data.error); 
          setIsLoading(false);
          // If the error means they already claimed it, we could hide the button
          if (data.error.toLowerCase().includes("already claimed")) {
             setIsClaimed(true);
          }
          return;
      }

      const { amount, signature } = data;
      const tx = await contract.claimWithSignature(amount, signature);
      await tx.wait(); // Wait for confirmation
      
      console.log("Bonus Claimed successfully!");
      setIsClaimed(true);

    } catch (error) {
      console.error("Transaction Error:", error);
      
      // If error contains "fetch" or "NetworkError", it means the backend isn't running
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("Server Error: The python backend (localhost:5000) is offline.");
      } else {
        alert("Transaction failed or was rejected by your wallet.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Lock global scrolling when Profile is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Restore on close
    };
  }, []);

  return (
    <motion.div 
      className={Style.Profile}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={Style.Profile_header}>
        <h2>User Profile</h2>
        <p className={Style.Profile_account}>
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not Connected"}
        </p>
      </div>
      
      <div className={Style.Profile_sections}>
        {!isClaimed && (
          <div className={Style.ClaimButtonWrapper}>
            <button 
              className={Style.ClaimButton} 
              onClick={handleClaimBonus} 
              disabled={isLoading}
            >
              {isLoading ? "Claiming..." : "Claim Bonus"}
            </button>
          </div>
        )}
        <InvestmentRanking tier={investmentTier} percentage={investmentProgress} />
        <SwapRanking tier={swapTier} percentage={swapProgress} />
      </div>
    </motion.div>
  );
};

export default Profile;
