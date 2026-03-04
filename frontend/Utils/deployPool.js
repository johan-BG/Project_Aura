import { BigNumber } from "ethers";

const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

// Only keep the math here
const encodePriceSqrt = (reserve1, reserve0) => {
    return BigNumber.from(
        new bn(reserve1.toString())
            .div(reserve0.toString())
            .sqrt()
            .multipliedBy(new bn(2).pow(96))
            .integerValue(3)
            .toString()
    );
};

// Pure logic for determining token order (V3 requirement)
const getSortedTokens = (addr1, addr2) => {
    return addr1.toLowerCase() < addr2.toLowerCase()
        ? [addr1, addr2]
        : [addr2, addr1];
};

export const createPool = async (address1, address2, fee, reserve1, reserve0, contracts) => {
        if (!contracts.manager || !contracts.factory) throw new Error("Contracts not initialized");

        try {
            const [token0, token1] = getSortedTokens(address1, address2);
            const price = encodePriceSqrt(reserve1, reserve0);

            // Use the pre-loaded contract instance
            const tx = await contracts.manager.createAndInitializePoolIfNecessary(
                token0, token1, fee, price, { gasLimit: 5000000 }
            );
            await tx.wait();

            const poolAddress = await contracts.factory.getPool(token0, token1, fee);
            return poolAddress;
        } catch (error) {
            console.error("Pool creation error:", error);
        }
    };