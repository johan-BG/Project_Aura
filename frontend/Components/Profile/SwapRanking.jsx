import React, { useMemo } from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';
import { useSwapContext } from '../../Context/SwapContext';

const SwapRanking = () => {
  const { swapCount } = useSwapContext();
  
  const { tier, percentage } = useMemo(() => {
    let t = "Bronze";
    let p = 0;
    
    const safeCount = Number(swapCount) || 0;

    if (safeCount < 10) {
      t = "Bronze";
      p = Math.floor(((safeCount - 0) / (10 - 0)) * 100);
    } else if (safeCount < 25) {
      t = "Silver";
      p = Math.floor(((safeCount - 10) / (25 - 10)) * 100);
    } else if (safeCount < 50) {
      t = "Gold";
      p = Math.floor(((safeCount - 25) / (50 - 25)) * 100);
    } else if (safeCount < 100) {
      t = "Platinum";
      p = Math.floor(((safeCount - 50) / (100 - 50)) * 100);
    } else if (safeCount < 500) {
      t = "Diamond";
      p = Math.floor(((safeCount - 100) / (500 - 100)) * 100);
    } else {
      t = "Diamond";
      p = 100;
    }

    return { tier: t, percentage: Math.floor(p) };
  }, [swapCount]);

  return (
    <LevelProgress 
      title="Swap Ranking"
      tier={tier}
      percentage={percentage}
      badgeText={<span><span className={Style.LevelProgress_Percentage}>{percentage}%</span> to Next Tier</span>}
    />
  );
};

export default SwapRanking;
