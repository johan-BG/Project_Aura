import booCoin from "./BooCoin.json";
import auraCoin from "./AuraCoin.json";
import singleSwapToken from "./SingleSwapToken.json";
import swapMultiHop from "./SwapMultiHop.json";
import IWETH from "./IWETH.json";
import addresses from "./address.json";

// Token addresses
export const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const IWETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Contract addresses from deployment
export const BooCoinAddress = addresses.BooCoin;
export const AuraCoinAddress = addresses.AuraCoin;
export const SingleSwapTokenAddress = addresses.SingleSwapToken;
export const SwapMultiHopAddress = addresses.SwapMultiHop;

// ABIs
export const BooCoinABI = booCoin.abi;
export const AuraCoinABI = auraCoin.abi;
export const SingleSwapTokenABI = singleSwapToken.abi;
export const SwapMultiHopABI = swapMultiHop.abi;
export const IWETHABI = IWETH.abi;