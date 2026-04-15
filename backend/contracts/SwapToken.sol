 // SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "hardhat/console.sol";

contract SingleSwapToken {
    address public immutable customToken;
    address public immutable factory;
    address public immutable router;
    address public owner;

    // Fee Configuration
    uint256 public minFee;
    uint256 public maxFee;
    uint256 public constant FIXED_FEE_BPS = 5; // 0.1%

    // Trailing Reference State
    mapping(address => int24) public poolReferences;
    mapping(address => bool) public isInitialized;

    constructor(address _customToken, address _factory,address _router) {
        minFee=10*10**18;
        maxFee=64*10**18;
        router=_router;
        customToken = _customToken;
        factory = _factory;
        owner = msg.sender;
    }

    // --- MATH ENGINE (Optimized & Readable) ---

    function estimateScarcityFee(address tokenIn, address tokenOut, uint24 poolFee) public view returns (uint256) {
        // 1. Check for exemption (Fixed Fee is separate, this is just for Scarcity)
        if (tokenIn == customToken || tokenOut == customToken) {
            return 0;
        }

        // 2. Find the pool
        address pool = IUniswapV3Factory(factory).getPool(tokenIn, tokenOut, poolFee);
        if (pool == address(0)) return 0;

        // 3. Get current price (Tick)
        (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();

        // 4. Calculate based on existing reference
        if (!isInitialized[pool]) {
            return minFee;
        }

        int24 ref = poolReferences[pool];
        uint256 distance;
        
        // We use the same math as the internal function, but we don't UPDATE the reference
        distance = uint256(int24(currentTick > ref ? currentTick - ref : ref - currentTick));

        if (distance <= 500) return minFee;
        if (distance >= 1500) return maxFee;

        return minFee + ((distance - 500) * (maxFee - minFee) / 1000);
    }

    function _calculateScarcityFee(address pool, int24 currentTick) internal returns (uint256) {
        // 1. Cold Start Initialization 📍
        if (!isInitialized[pool]) {
            poolReferences[pool] = currentTick;
            isInitialized[pool] = true;
            return minFee;
        }

        int24 ref = poolReferences[pool];
        uint256 distance;

        // 2. Gas-Optimized Distance Calculation ⚡
        distance = uint256(int256(currentTick > ref ? currentTick - ref : ref - currentTick));

        // 3. Update Reference (Trailing Average / 100) 🐢
        poolReferences[pool] = int24((int256(ref) * 99 + int256(currentTick)) / 100);

        // 4. Sliding Scale Logic (500-tick Anchor) 🎢
        if (distance <= 500) return minFee;
        if (distance >= 1500) return maxFee;

        return minFee + ((distance - 500) * (maxFee - minFee) / 1000);
    }

    // --- SWAP INTERFACE ---

    function swapExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint24 poolFee
    ) external returns (uint256 amountOut) {
        // Find official pool address 🏭
        address pool = IUniswapV3Factory(factory).getPool(tokenIn, tokenOut, poolFee);
        require(pool != address(0), "Pool not found");

    
        uint256 fixedFeeAmount = (amountIn * FIXED_FEE_BPS) / 10000;
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, owner, fixedFeeAmount);
        uint256 swapAmount = amountIn - fixedFeeAmount;

      
        if (tokenIn != customToken && tokenOut != customToken) {
            (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();
            uint256 sFee = _calculateScarcityFee(pool, currentTick);
            TransferHelper.safeTransferFrom(customToken, msg.sender, customToken, sFee);
            console.log(sFee);
        }

        // 3. Execute Uniswap Swap 🦄
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), swapAmount);
        TransferHelper.safeApprove(tokenIn, router, swapAmount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: poolFee,
            recipient: msg.sender,
            deadline: block.timestamp,
            amountIn: swapAmount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        amountOut = ISwapRouter(router).exactInputSingle(params);
    }
    function swapExactOutputSingle(address token1,address token2,uint amountOut,uint amountInMaximum,uint24 poolFee) external returns(uint amountIn)
    {
        address pool = IUniswapV3Factory(factory).getPool(token1, token2, poolFee);
        require(pool != address(0), "Pool not found");

        TransferHelper.safeTransferFrom(token1, msg.sender, address(this), amountInMaximum);
        TransferHelper.safeApprove(token1, router,amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter.ExactOutputSingleParams({
            tokenIn:token1,
            tokenOut:token2,
            fee:poolFee,
            recipient:msg.sender,
            deadline:block.timestamp,
            amountOut:amountOut,
            amountInMaximum:amountInMaximum,
            sqrtPriceLimitX96:0
        });
        amountIn=ISwapRouter(router).exactOutputSingle(params);

        uint256 fixedFeeAmount = (amountIn * FIXED_FEE_BPS) / 10000;
        TransferHelper.safeTransfer(token1, owner, fixedFeeAmount);


        if (token1 != customToken && token2 != customToken) {
            (, int24 currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();
            uint256 sFee = _calculateScarcityFee(pool, currentTick);
            TransferHelper.safeTransferFrom(customToken, msg.sender, customToken, sFee);
            console.log(sFee);
        }

        if(amountIn<amountInMaximum)
        {
            TransferHelper.safeApprove(token1, router, 0);
            TransferHelper.safeTransfer(token1, msg.sender, amountInMaximum-amountIn-fixedFeeAmount);
        }
    }
}