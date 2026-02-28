import { ethers } from "ethers";

export const getLogoUrl = (address) => {
  try {
    const checksumAddress = ethers.utils.getAddress(address);
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checksumAddress}/logo.png`;
  } catch (e) {
    return "https://app.uniswap.org/static/media/eth.5ae99cb3.svg";
  }
};