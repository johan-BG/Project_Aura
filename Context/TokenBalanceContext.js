import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { checkIfWalletConnected } from "../Utils/appFeatures";
import {
  BooCoinAddress,
  AuraCoinAddress,
  BooCoinABI,
  AuraCoinABI,
  IWETHAddress,
  IWETHABI,
} from "./constants";

const TokenBalanceContext = createContext();

export const useTokenBalance = () => useContext(TokenBalanceContext);

export const TokenBalanceProvider = ({ children }) => {
  const [balances, setBalances] = useState({});
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  // Initialize provider and account
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const account = await checkIfWalletConnected();
        setAccount(account);
      }
    };
    init();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
        updateAllBalances(accounts[0]);
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  // Update balances when account changes
  useEffect(() => {
    if (account && provider) {
      updateAllBalances(account);
    }
  }, [account, provider]);

  const updateAllBalances = async (address) => {
    if (!provider || !address) return;

    try {
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);

      // Get token contracts
      const booCoin = new ethers.Contract(BooCoinAddress, BooCoinABI, provider);
      const auraCoin = new ethers.Contract(
        AuraCoinAddress,
        AuraCoinABI,
        provider
      );
      const weth = new ethers.Contract(IWETHAddress, IWETHABI, provider);

      // Get token balances
      const [booBalance, auraBalance, wethBalance] = await Promise.all([
        booCoin.balanceOf(address),
        auraCoin.balanceOf(address),
        weth.balanceOf(address),
      ]);

      setBalances({
        eth: ethers.utils.formatEther(ethBalance),
        boo: ethers.utils.formatEther(booBalance),
        aura: ethers.utils.formatEther(auraBalance),
        weth: ethers.utils.formatEther(wethBalance),
      });
    } catch (error) {
      console.error("Error updating balances:", error);
    }
  };

  const refreshBalances = () => {
    if (account) {
      updateAllBalances(account);
    }
  };

  return (
    <TokenBalanceContext.Provider
      value={{ balances, account, refreshBalances }}
    >
      {children}
    </TokenBalanceContext.Provider>
  );
};
