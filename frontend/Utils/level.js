export const liquidityLevel= (poolCount) => {
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

    return { ltier: t, lpercentage: 100-Math.floor(p) };
  };

  export const swapLevel = (swapCount) => {
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

    return { stier: t, spercentage: 100-Math.floor(p) };
  };