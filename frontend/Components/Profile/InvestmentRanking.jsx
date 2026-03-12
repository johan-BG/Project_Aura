import React, { useMemo } from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';
import { useSwapContext } from '../../Context/SwapContext';

const InvestmentRanking = () => {
  const { poolCount } = useSwapContext();
  
  const { tier, percentage } = useMemo(() => {
    let t = "Bronze";
    let p = 0;
    
    const safeCount = Number(poolCount) || 0;

    if (safeCount < 5) {
      t = "F";
      p = Math.floor(((safeCount - 0) / (5 - 0)) * 100);
    } else if (safeCount < 10) {
      t = "D";
      p = Math.floor(((safeCount - 5) / (10 - 5)) * 100);
    } else if (safeCount < 30) {
      t = "C";
      p = Math.floor(((safeCount - 10) / (30 - 10)) * 100);
    } else if (safeCount < 50) {
      t = "B";
      p = Math.floor(((safeCount - 30) / (50 - 30)) * 100);
    } else if (safeCount < 100) {
      t = "A";
      p = Math.floor(((safeCount - 50) / (100 - 50)) * 100);
    } else {
      t = "S";
      p = 100;
    }

    return { tier: t, percentage: Math.floor(p) };
  }, [poolCount]);

  return (
    <LevelProgress 
      title="Investment Ranking"
      tier={tier}
      percentage={percentage}
      badgeText={<span><span className={Style.LevelProgress_Percentage}>{percentage}%</span> to Next Tier</span>}
    />
  );
};

export default InvestmentRanking;
