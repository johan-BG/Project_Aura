import { SwapTokenContextProvider } from "../Context/SwapContext";
import { LiquidityProvider } from "../Context/LiquidityContext";
import {NavBar} from "../Components/index";
import "../styles/globals.css";
function MyApp({ Component, pageProps }) {
  return (
    <SwapTokenContextProvider>
      <NavBar/>
        <LiquidityProvider>
          <Component {...pageProps} />
        </LiquidityProvider>
    </SwapTokenContextProvider>
  );
}

export default MyApp;