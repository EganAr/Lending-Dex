// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./DLPToken.sol";
import "./Interfaces/PriceFeedAdapter.sol";

contract DEX is ReentrancyGuard {
    error DEX__TransferFailed();
    error DEX__AmountTooLow();
    error DEX__AmountTooHigh();
    error DEX__MustGreaterThanZero();
    error DEX__InvalidTokenRatio();
    error DEX__InsufficientLiquidityBalance();
    error DEX__ExcessiveSlippage();
    error DEX__CircuitBreakerTriggered();
    error DEX__ZeroPrice();
    error DEX__RateLimitExceeded(uint256);
    error DEX__InvalidSwapToken();
    error DEX__FlashLoanProtection();

    struct SwapTracking {
        uint256 swapsCount;
        uint256 windowStart;
    }

    mapping(address => mapping(address => uint256)) private s_liquidityBalance;
    mapping(address => uint256) private s_liquidityTotalSupply;
    mapping(address => PriceFeedAdapter) private s_firstTokenPriceFeeds;
    mapping(address => PriceFeedAdapter) private s_secondTokenPriceFeeds;
    mapping(address => SwapTracking) private userSwapTracking;

    DLPToken private immutable lpToken;
    address private immutable ethToken;
    address private immutable daiToken;
    uint256 private lastPriceRatio;

    uint256 private constant PRECISION = 1e18;
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    uint256 private constant SWAP_FEE = 30;
    uint256 private constant FEE_DENOMINATOR = 10000;
    uint256 private constant MAX_SLIPPAGE = 100; // 1%
    uint256 private constant EXTREME_SLIPPAGE_THRESHOLD = 500; // 5%
    uint256 private constant CIRCUIT_BREAKER_THRESHOLD = 20;
    uint256 private constant MAX_SWAPS_PER_WINDOW = 10;
    uint256 private constant TIME_WINDOW = 1 days;

    event AddLiquidity(
        address indexed sender,
        address firstToken,
        uint256 firstTokenAmount,
        address secondToken,
        uint256 secondTokenAmount,
        uint256 lpTokensMinted
    );
    event RemoveLiquidity(
        address indexed sender,
        address firstToken,
        uint256 firstTokenAmount,
        address secondToken,
        uint256 secondTokenAmount,
        uint256 lpTokensBurned
    );
    event Swap(address indexed sender, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);
    event WindowReset(address user, uint256 newWindowStart);
    event SwapTracked(address user, uint256 swapsCount, uint256 windowStart);
    event CircuitBreakerTriggered(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event HighSlippageWarning(address user, uint256 slippage);

    constructor(
        address _firstToken,
        address _secondToken,
        PriceFeedAdapter _firstPriceFeed,
        PriceFeedAdapter _secondPriceFeed
    ) {
        ethToken = _firstToken;
        daiToken = _secondToken;
        s_firstTokenPriceFeeds[ethToken] = _firstPriceFeed;
        s_secondTokenPriceFeeds[daiToken] = _secondPriceFeed;

        lpToken = new DLPToken();
        lpToken.setDexAddress(address(this));
    }

    modifier flashLoanProtection() {
        if (tx.origin != msg.sender) revert DEX__FlashLoanProtection();
        _;
    }

    modifier priceCheck() {
        uint256 currentPriceRatio = getCurrentPriceRatio();
        if (lastPriceRatio == 0) {
            lastPriceRatio = currentPriceRatio;
            _;
            return;
        }
        uint256 priceChange;
        if (currentPriceRatio > lastPriceRatio) {
            priceChange = ((currentPriceRatio - lastPriceRatio) * 100) / lastPriceRatio;
        } else {
            priceChange = ((lastPriceRatio - currentPriceRatio) * 100) / lastPriceRatio;
        }
        if (priceChange > CIRCUIT_BREAKER_THRESHOLD) {
            emit CircuitBreakerTriggered(lastPriceRatio, currentPriceRatio, block.timestamp);
            revert DEX__CircuitBreakerTriggered();
        }

        lastPriceRatio = currentPriceRatio;
        _;
    }

    modifier rateLimit() {
        SwapTracking storage tracking = userSwapTracking[msg.sender];
        uint256 currentTime = block.timestamp;

        if (currentTime >= tracking.windowStart + TIME_WINDOW) {
            tracking.swapsCount = 0;
            tracking.windowStart = currentTime;
            emit WindowReset(msg.sender, currentTime);
        }
        if (tracking.swapsCount >= MAX_SWAPS_PER_WINDOW) {
            uint256 timeUntilReset = (tracking.windowStart + TIME_WINDOW) - currentTime;
            revert DEX__RateLimitExceeded(timeUntilReset);
        }
        tracking.swapsCount++;
        emit SwapTracked(msg.sender, tracking.swapsCount, tracking.windowStart);
        _;
    }

    modifier moreThanZero(uint256 _amount) {
        if (_amount <= 0) {
            revert DEX__MustGreaterThanZero();
        }
        _;
    }

    function addLiquidity(uint256 _ethAmount, uint256 _daiAmount)
        external
        nonReentrant
        moreThanZero(_ethAmount)
        moreThanZero(_daiAmount)
        returns (uint256 lpTokens)
    {
        _validateLiquidityAmounts(_ethAmount, _daiAmount);
        _validateTokenRatio(_ethAmount, _daiAmount);

        _transferTokensToContract(msg.sender, _ethAmount, _daiAmount);
        lpTokens = _calculateAndMintLPTokens(_ethAmount, _daiAmount);
        _updateLiquidityBalances(msg.sender, _ethAmount, _daiAmount, true);

        emit AddLiquidity(msg.sender, ethToken, _ethAmount, daiToken, _daiAmount, lpTokens);
        return lpTokens;
    }

    function removeLiquidity(uint256 _lpTokens)
        external
        nonReentrant
        moreThanZero(_lpTokens)
        returns (uint256 _ethAmount, uint256 _daiAmount)
    {
        (_ethAmount, _daiAmount) = _calculateWithdrawAmounts(_lpTokens);
        _validateWithdrawal(msg.sender, _ethAmount, _daiAmount);

        lpToken.burn(msg.sender, _lpTokens);
        _updateLiquidityBalances(msg.sender, _ethAmount, _daiAmount, false);
        _transferTokensFromContract(msg.sender, _ethAmount, _daiAmount);

        emit RemoveLiquidity(msg.sender, ethToken, _ethAmount, daiToken, _daiAmount, _lpTokens);
        return (_ethAmount, _daiAmount);
    }

    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut)
        external
        nonReentrant
        moreThanZero(amountIn)
        priceCheck
        rateLimit
        flashLoanProtection
        returns (uint256 amountOut)
    {
        _validateSwapParameters(tokenIn, amountIn);
        address tokenOut = _getOppositeToken(tokenIn);
        amountOut = getOutputAmount(tokenIn, amountIn);

        if (amountOut < minAmountOut) revert DEX__ExcessiveSlippage();
        _executeSwap(msg.sender, tokenIn, amountIn, tokenOut, amountOut);

        emit Swap(msg.sender, tokenIn, amountIn, tokenOut, amountOut);
        return amountOut;
    }

    function getCurrentPriceRatio() internal view returns (uint256) {
        (uint256 firstPrice, uint256 secondPrice) = getPrice();

        uint256 ratio = (uint256(firstPrice) * PRECISION) / uint256(secondPrice);
        if (ratio == 0) {
            revert DEX__ZeroPrice();
        }

        return ratio; // return e18
    }

    function getPrice() public view returns (uint256, uint256) {
        PriceFeedAdapter firstPriceFeed = PriceFeedAdapter(s_firstTokenPriceFeeds[ethToken]);
        PriceFeedAdapter secondPriceFeed = PriceFeedAdapter(s_secondTokenPriceFeeds[daiToken]);

        (, int256 firstPrice,,,) = firstPriceFeed.latestRoundData();
        (, int256 secondPrice,,,) = secondPriceFeed.latestRoundData();

        return (uint256(firstPrice) * 1e10, uint256(secondPrice) * 1e10);
    }

    function getOutputLiquidity(address tokenIn, uint256 amountIn) public view returns (uint256 liquidity) {
        uint256 ratio = getCurrentPriceRatio();
        if (tokenIn == daiToken) {
            return (amountIn * PRECISION) / ratio;
        } else if (tokenIn == ethToken) {
            return (amountIn * ratio) / PRECISION;
        }
    }

    function getOutputAmount(address tokenIn, uint256 amountIn) public view returns (uint256) {
        // Calculate using x * y = k formula
        uint256 inputReserve = s_liquidityTotalSupply[tokenIn];
        address tokenOut = tokenIn == ethToken ? daiToken : ethToken;
        uint256 outputReserve = s_liquidityTotalSupply[tokenOut];

        if (inputReserve <= MINIMUM_LIQUIDITY || outputReserve <= MINIMUM_LIQUIDITY) revert DEX__AmountTooLow();
        if (amountIn >= type(uint256).max / (FEE_DENOMINATOR - SWAP_FEE)) revert DEX__AmountTooHigh();

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - SWAP_FEE);
        if (outputReserve >= type(uint256).max / amountInWithFee) revert DEX__AmountTooHigh();

        uint256 numerator = amountInWithFee * outputReserve;
        uint256 denominator = (inputReserve * FEE_DENOMINATOR) + amountInWithFee;
        if (denominator < 0) revert DEX__ZeroPrice();

        return numerator / denominator;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y == 0) return 0;
        if (y <= 3) return 1;

        z = y;
        uint256 x = y >> 1;

        while (x < z) {
            z = x;
            x = (y / x + x) >> 1;

            if (x == z || x + 1 == z) {
                return z;
            }
        }

        return z;
    }

    function _validateLiquidityAmounts(uint256 _ethAmount, uint256 _daiAmount) internal pure {
        if (
            _ethAmount >= type(uint256).max / PRECISION || _daiAmount >= type(uint256).max / PRECISION
                || _ethAmount > type(uint256).max / _daiAmount
        ) {
            revert DEX__AmountTooHigh();
        }
        if (_ethAmount <= MINIMUM_LIQUIDITY || _daiAmount <= MINIMUM_LIQUIDITY) {
            revert DEX__AmountTooLow();
        }
    }

    function _validateTokenRatio(uint256 _ethAmount, uint256 _daiAmount) internal view {
        uint256 currentRatio = getCurrentPriceRatio();
        (uint256 ethPrice,) = getPrice();
        uint256 providedRatio = (_ethAmount * currentRatio) / ((_daiAmount * PRECISION) / ethPrice);

        uint256 allowedDeviation = currentRatio / 100;
        if (providedRatio > currentRatio + allowedDeviation || providedRatio < currentRatio - allowedDeviation) {
            revert DEX__InvalidTokenRatio();
        }
    }

    function _validateSwapParameters(address tokenIn, uint256 amountIn) internal view {
        if (tokenIn != ethToken && tokenIn != daiToken) revert DEX__InvalidSwapToken();

        uint256 maxInput = s_liquidityTotalSupply[tokenIn] / 2;
        if (amountIn > maxInput) revert DEX__AmountTooHigh();
    }

    function _calculateAndMintLPTokens(uint256 _ethAmount, uint256 _daiAmount) internal returns (uint256 lpTokens) {
        if (lpToken.totalSupply() == 0) {
            lpTokens = sqrt(_ethAmount * _daiAmount) - MINIMUM_LIQUIDITY;
            lpToken.mint(address(1), MINIMUM_LIQUIDITY);
        } else {
            uint256 firstTokenShare = (_ethAmount * lpToken.totalSupply()) / s_liquidityTotalSupply[ethToken];
            uint256 secondTokenShare = (_daiAmount * lpToken.totalSupply()) / s_liquidityTotalSupply[daiToken];
            lpTokens = firstTokenShare < secondTokenShare ? firstTokenShare : secondTokenShare;
        }
        lpToken.mint(msg.sender, lpTokens);
        return lpTokens;
    }

    function _calculateWithdrawAmounts(uint256 _lpTokens)
        internal
        view
        returns (uint256 ethAmount, uint256 daiAmount)
    {
        ethAmount = (_lpTokens * s_liquidityTotalSupply[ethToken]) / lpToken.totalSupply();
        daiAmount = (_lpTokens * s_liquidityTotalSupply[daiToken]) / lpToken.totalSupply();
        return (ethAmount, daiAmount);
    }

    function _validateWithdrawal(address user, uint256 ethAmount, uint256 daiAmount) internal view {
        if (
            (s_liquidityTotalSupply[ethToken] - ethAmount) < MINIMUM_LIQUIDITY
                || (s_liquidityTotalSupply[daiToken] - daiAmount) < MINIMUM_LIQUIDITY
                || s_liquidityBalance[user][ethToken] < ethAmount || s_liquidityBalance[user][daiToken] < daiAmount
        ) {
            revert DEX__InsufficientLiquidityBalance();
        }
    }

    function _getOppositeToken(address tokenIn) internal view returns (address) {
        if (tokenIn != ethToken && tokenIn != daiToken) revert DEX__InvalidSwapToken();
        return tokenIn == ethToken ? daiToken : ethToken;
    }

    function _updateLiquidityBalances(address user, uint256 ethAmount, uint256 daiAmount, bool isAdding) internal {
        if (isAdding) {
            s_liquidityBalance[user][ethToken] += ethAmount;
            s_liquidityBalance[user][daiToken] += daiAmount;
            s_liquidityTotalSupply[ethToken] += ethAmount;
            s_liquidityTotalSupply[daiToken] += daiAmount;
        } else {
            s_liquidityBalance[user][ethToken] -= ethAmount;
            s_liquidityBalance[user][daiToken] -= daiAmount;
            s_liquidityTotalSupply[ethToken] -= ethAmount;
            s_liquidityTotalSupply[daiToken] -= daiAmount;
        }
    }

    function _executeSwap(address user, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut)
        internal
    {
        bool success = IERC20(tokenIn).transferFrom(user, address(this), amountIn);
        if (!success) revert DEX__TransferFailed();

        success = IERC20(tokenOut).transfer(user, amountOut);
        if (!success) revert DEX__TransferFailed();

        s_liquidityTotalSupply[tokenIn] += amountIn;
        s_liquidityTotalSupply[tokenOut] -= amountOut;
    }

    function _transferTokensToContract(address from, uint256 ethAmount, uint256 daiAmount) internal {
        bool firstTokenSuccess = IERC20(ethToken).transferFrom(from, address(this), ethAmount);
        bool secondTokenSuccess = IERC20(daiToken).transferFrom(from, address(this), daiAmount);
        if (!firstTokenSuccess || !secondTokenSuccess) {
            revert DEX__TransferFailed();
        }
    }

    function _transferTokensFromContract(address to, uint256 ethAmount, uint256 daiAmount) internal {
        bool firstTokenSuccess = IERC20(ethToken).transfer(to, ethAmount);
        bool secondTokenSuccess = IERC20(daiToken).transfer(to, daiAmount);
        if (!firstTokenSuccess || !secondTokenSuccess) {
            revert DEX__TransferFailed();
        }
    }

    function getUserLiquidity(address user) external view returns (uint256, uint256) {
        uint256 ethBalance = s_liquidityBalance[user][ethToken];
        uint256 daiBalance = s_liquidityBalance[user][daiToken];
        return (ethBalance, daiBalance);
    }

    function getLiquidityTotalSupply() external view returns (uint256, uint256) {
        uint256 totalEthSupply = s_liquidityTotalSupply[ethToken];
        uint256 totalDaiSupply = s_liquidityTotalSupply[daiToken];
        return (totalEthSupply, totalDaiSupply);
    }

    function getLpTokensBalance(address user) external view returns (uint256) {
        return lpToken.balanceOf(user);
    }

    function getTotalLpTokens() external view returns (uint256) {
        return lpToken.totalSupply();
    }
}
