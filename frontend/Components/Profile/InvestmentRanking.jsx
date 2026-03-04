import React from 'react';
import LevelProgress from './LevelProgress';
import Style from './LevelProgress.module.css';

const InvestmentRanking = ({ tier, percentage }) => {
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
