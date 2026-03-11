import React from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';

const SwapRanking = ({ tier, percentage }) => {
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
