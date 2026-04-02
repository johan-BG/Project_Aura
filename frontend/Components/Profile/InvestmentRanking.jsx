import React, { useMemo } from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';
import { useSwapContext } from '../../Context/SwapContext';

const InvestmentRanking = () => {
  const { Ltier,Lpercentage } = useSwapContext();
  
  return (
    <LevelProgress 
      title="Investment Ranking"
      tier={Ltier}
      percentage={Lpercentage}
      badgeText={<span><span className={Style.LevelProgress_Percentage}>{100-Lpercentage}%</span> to Next Tier</span>}
    />
  );
};

export default InvestmentRanking;
