import React, { useMemo } from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';
import { useSwapContext } from '../../Context/SwapContext';

const SwapRanking = () => {
  const { Stier,Spercentage } = useSwapContext();
  

  return (
    <LevelProgress 
      title="Swap Ranking"
      tier={Stier}
      percentage={Spercentage}
      badgeText={<span><span className={Style.LevelProgress_Percentage}>{Spercentage}%</span> to Next Tier</span>}
    />
  );
};

export default SwapRanking;
