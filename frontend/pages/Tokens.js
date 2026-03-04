import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import images from "../assets";
import Style from "../styles/Tokens.module.css";
import { AllTokens } from "../Components/index";
import { useSwapContext } from "../Context/SwapContext";

const Tokens = () => {
  const { topTokens } = useSwapContext(); // Pulling real data from Graph/Config
  const [searchItem, setSearchItem] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 1. Debounce Logic: Updates 'debouncedSearch' 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchItem), 100);
    return () => clearTimeout(timer);
  }, [searchItem]);

  // 2. Search Logic: Filters the topTokens list
  // useMemo ensures we only re-filter when the list or the search term changes
  const filteredTokens = useMemo(() => {
    if (!topTokens) return [];
    if (!debouncedSearch) return topTokens;

    return topTokens.filter((token) => {
      const name = token.name?.toLowerCase() || "";
      const symbol = token.symbol?.toLowerCase() || "";
      const term = debouncedSearch.toLowerCase();
      return name.includes(term) || symbol.includes(term);
    });
  }, [debouncedSearch, topTokens]);

  return (
    <div className={Style.Tokens}>
      <div className={Style.Tokens_box}>
        <h2>Top Tokens on Uniswap</h2>
        
        <div className={Style.Tokens_box_header}>
          <div className={Style.Tokens_box_ethereum}>
            <p>
              <Image src={images.etherlogo} alt="ether" width={20} height={20} />
            </p>
            <p>Ethereum</p>
          </div>

          <div className={Style.Tokens_box_search}>
            <p>
              <Image src={images.search} alt="search" width={20} height={20} />
            </p>
            <input
              type="text"
              placeholder="Filter by name or symbol..."
              onChange={(e) => setSearchItem(e.target.value)}
              value={searchItem}
            />
          </div>
        </div>

        {/* 3. Empty State Handling */}
        {filteredTokens.length > 0 ? (
          <AllTokens allTokenList={filteredTokens} />
        ) : (
          <div className={Style.no_results}>
            <p>No tokens found matching "{debouncedSearch}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tokens;