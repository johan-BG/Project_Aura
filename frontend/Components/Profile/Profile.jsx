import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import Style from './Profile.module.css';
import InvestmentRanking from './InvestmentRanking';
import SwapRanking from './SwapRanking';
import { useSwapContext } from '../../Context/SwapContext';
import { claimBonus } from '../../Utils/claimBonus';


const Profile = ({ account }) => {
  const { refreshData,provider, signer ,networkName,contracts } = useSwapContext();
  
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
      
      
      await claimBonus(account,contracts.auraCoin,networkName,"signIn");
      refreshData();
      console.log("Bonus Claimed successfully!");

    } catch (error) {
      console.error("Transaction Error:", error);
      
      // If error contains "fetch" or "NetworkError", it means the backend isn't running
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert("Server Error: The python backend (localhost:5000) is offline.");
      } else {
        alert("Transaction failed or was rejected by your wallet.");
      }
    } finally {
      setIsClaimed(true);
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
