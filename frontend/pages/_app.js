import { SwapTokenContextProvider } from "../Context/SwapContext";
import { LiquidityProvider } from "../Context/LiquidityContext";
import {NavBar} from "../Components/index";
import "../styles/globals.css";
import Head from "next/head";
function MyApp({ Component, pageProps }) {
  return (
    <SwapTokenContextProvider>
      <Head>
        <title>Project Aura</title>
      </Head>
      <NavBar/>
        <LiquidityProvider>
          <Component {...pageProps} />
        </LiquidityProvider>
    </SwapTokenContextProvider>
  );
}

export default MyApp;