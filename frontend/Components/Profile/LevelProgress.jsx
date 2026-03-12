import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Style from './LevelProgress.module.css';

// We will use inline SVGs as placeholders for Medals since assets don't exist yet
const FMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#ff4d4d" stroke="#cc0000" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">F</text>
    </svg>
);

const DMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#ff9933" stroke="#cc6600" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">D</text>
    </svg>
);

const CMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#ffcc00" stroke="#cc9900" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">C</text>
    </svg>
);

const BMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#33cc33" stroke="#009900" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">B</text>
    </svg>
);

const AMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#3399ff" stroke="#0066cc" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">A</text>
    </svg>
);

const SMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#9933ff" stroke="#6600cc" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">S</text>
    </svg>
);

const PlatinumMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#e5e4e2" stroke="#b0b0b0" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">P</text>
    </svg>
);

const BronzeMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#cd7f32" stroke="#a0522d" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">B</text>
    </svg>
);

const SilverMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#c0c0c0" stroke="#808080" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">S</text>
    </svg>
);

const GoldMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <circle cx="50" cy="50" r="45" fill="#ffd700" stroke="#b8860b" strokeWidth="5"/>
        <text x="50" y="60" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">G</text>
    </svg>
);

const DiamondMedal = () => (
    <svg viewBox="0 0 100 100" width="50" height="50">
        <polygon points="50,10 90,40 50,90 10,40" fill="#b9f2ff" stroke="#00bfff" strokeWidth="4"/>
        <text x="50" y="55" fontSize="25" textAnchor="middle" fill="#005a80" fontWeight="bold">💎</text>
    </svg>
);

const LevelProgress = ({ title, tier = "Bronze", percentage, badgeText, size = 130 }) => {
  const [offset, setOffset] = useState(0);
  
  // SVG Config
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    // Calculate final offset
    const progressOffset = circumference - (percentage / 100) * circumference;
    setOffset(progressOffset);
  }, [percentage, circumference]);

  const renderMedal = () => {
    switch(tier) {
      case "F": return <FMedal />;
      case "D": return <DMedal />;
      case "C": return <CMedal />;
      case "B": return <BMedal />;
      case "A": return <AMedal />;
      case "S": return <SMedal />;
      case "Bronze": return <BronzeMedal />;
      case "Silver": return <SilverMedal />;
      case "Gold": return <GoldMedal />;
      case "Platinum": return <PlatinumMedal />;
      case "Diamond": return <DiamondMedal />;
      default: return <DiamondMedal />;
    }
  };

  return (
    <div className={Style.LevelProgress_Card}>
      <h3 className={Style.LevelProgress_Title}>{title}</h3>
      
      <div className={Style.LevelProgress_Wrapper}>
        <svg 
          className={Style.LevelProgress_SVG} 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff00" /> {/* Green */}
              <stop offset="50%" stopColor="#ffff00" /> {/* Yellow */}
              <stop offset="100%" stopColor="#ff0000" /> {/* Red */}
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            className={Style.LevelProgress_Track}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          
          {/* Animated Progress Circle */}
          <motion.circle
            className={Style.LevelProgress_Fill}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            stroke="url(#progressGradient)"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} // Start from top
          />
        </svg>

        {/* Center Inner Content */}
        <div className={Style.LevelProgress_Inner}>
          <div className={Style.LevelProgress_Medal}>
            {renderMedal()}
          </div>
        </div>
      </div>
      
      <div className={Style.LevelProgress_TextBadge}>
         {badgeText}
      </div>
    </div>
  );
};

export default LevelProgress;
