// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Interfaces/PriceFeedAdapter.sol";

contract LendingBorrowingV3 is ReentrancyGuard {
    error LendingBorrowing__MustGreaterThanZero();
    error LendingBorrowing__InsufficientBalance();
    error LendingBorrowing__ApprovalFailed();
    error LendingBorrowing__TransferFailed();
    error LendingBorrowing__InsufficientCollateral();
    error LendingBorrowing__InsufficientLiquidity();
    error LendingBorrowing__HealthFactorIsBroken(uint256);
    error LendingBorrowing__HealthFactorIsNotBroken();
    error LendingBorrowing__NotEnoughCollateral();
    error LendingBorrowing__UserCannotLiquidateHimself();

    uint256 public constant INTEREST_RATE = 5;
    uint256 public constant SECONDS_IN_A_YEAR = 365 * 24 * 60 * 60;
    uint256 public constant COLLATERAL_FACTOR = 75;
    uint256 public constant LIQUIDATION_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_BONUS = 10;

    address private immutable daiToken;
    address private immutable collateralToken;
    address[] private borrowers;
    address[] private collateralHolders;

    mapping(address => mapping(address => uint256)) private userDeposits;
    mapping(address => mapping(address => uint256)) private userBorrows;
    mapping(address => mapping(address => uint256)) private userCollaterals;
    mapping(address => mapping(address => uint256)) private depositTimestamps;
    mapping(address => uint256) private totalDeposits;
    mapping(address => PriceFeedAdapter) private collateralPriceFeeds;
    mapping(address => PriceFeedAdapter) private daiPriceFeeds;

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event DepositCollateral(address indexed user, address indexed token, uint256 amount);
    event RedeemCollateral(address indexed user, address indexed token, uint256 amount);
    event Borrow(address indexed user, address indexed token, uint256 amount);
    event Repay(address indexed user, address indexed token, uint256 amount);
    event Liquidate(
        address indexed liquidator,
        address indexed borrower,
        uint256 amountToLiquidate,
        uint256 totalCollateralToLiquidate
    );

    constructor(
        address _daiToken,
        address _collateralToken,
        PriceFeedAdapter _collateralPriceFeed,
        PriceFeedAdapter _daiPriceFeed
    ) {
        daiToken = _daiToken;
        collateralToken = _collateralToken;
        collateralPriceFeeds[_collateralToken] = _collateralPriceFeed;
        daiPriceFeeds[daiToken] = _daiPriceFeed;
    }

    modifier moreThanZero(uint256 _amount) {
        if (_amount <= 0) {
            revert LendingBorrowing__MustGreaterThanZero();
        }
        _;
    }

    function deposit(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        bool success = IERC20(daiToken).approve(address(this), _amount);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(daiToken).transferFrom(msg.sender, address(this), _amount);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }

        userDeposits[msg.sender][daiToken] += _amount;
        totalDeposits[daiToken] += _amount;
        depositTimestamps[msg.sender][daiToken] = block.timestamp;
        emit Deposit(msg.sender, daiToken, _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        uint256 depositAmount = userDeposits[msg.sender][daiToken];
        if (depositAmount < _amount) {
            revert LendingBorrowing__InsufficientBalance();
        }

        uint256 depositTime = block.timestamp - depositTimestamps[msg.sender][daiToken];
        uint256 interest = calculateInterest(_amount, depositTime);
        uint256 totalAmount = _amount + interest;

        bool success = IERC20(daiToken).approve(address(this), totalAmount);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(daiToken).transfer(msg.sender, totalAmount);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }

        userDeposits[msg.sender][daiToken] -= _amount;
        totalDeposits[daiToken] -= _amount;
        if (userDeposits[msg.sender][daiToken] == 0) {
            depositTimestamps[msg.sender][daiToken] = 0; // Reset timestamp if no balance left
        }
        emit Withdraw(msg.sender, daiToken, _amount);
    }

    function depositCollateral(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        bool success = IERC20(collateralToken).approve(address(this), _amount);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(collateralToken).transferFrom(msg.sender, address(this), _amount);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }

        userCollaterals[msg.sender][collateralToken] += _amount;
        if (userCollaterals[msg.sender][collateralToken] > 0) {
            _addCollateralHolder(msg.sender);
        }

        emit DepositCollateral(msg.sender, collateralToken, _amount);
    }

    function redeemCollateral(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        uint256 collateralAmount = userCollaterals[msg.sender][collateralToken];
        if (collateralAmount < _amount) {
            revert LendingBorrowing__InsufficientCollateral();
        }

        userCollaterals[msg.sender][collateralToken] -= _amount;

        (uint256 healthFactor,) = calculateHealthFactor(msg.sender);
        if (healthFactor < 1e18) {
            revert LendingBorrowing__HealthFactorIsBroken(healthFactor);
        }

        if (userCollaterals[msg.sender][collateralToken] == 0) {
            _removeCollateralHolder(msg.sender);
        }

        bool success = IERC20(collateralToken).approve(address(this), _amount);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(collateralToken).transfer(msg.sender, _amount);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }

        emit RedeemCollateral(msg.sender, collateralToken, _amount);
    }

    function borrow(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        uint256 borrowLimit = getBorrowLimit(msg.sender);
        uint256 currentBorrows = userBorrows[msg.sender][daiToken];
        uint256 newTotalBorrows = currentBorrows + _amount;

        if (borrowLimit < newTotalBorrows) {
            revert LendingBorrowing__InsufficientCollateral();
        }

        userBorrows[msg.sender][daiToken] = newTotalBorrows;

        (uint256 healthFactor,) = calculateHealthFactor(msg.sender);
        if (healthFactor < 1e18) {
            revert LendingBorrowing__HealthFactorIsBroken(healthFactor);
        }

        if (userBorrows[msg.sender][daiToken] > 0) {
            _addBorrower(msg.sender);
        }

        bool success = IERC20(daiToken).approve(address(this), _amount);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(daiToken).transfer(msg.sender, _amount);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }
        emit Borrow(msg.sender, daiToken, _amount);
    }

    function repayBorrow(uint256 _amount) external nonReentrant moreThanZero(_amount) {
        uint256 borrowedAmount = userBorrows[msg.sender][daiToken];
        if (_amount > borrowedAmount) {
            revert LendingBorrowing__InsufficientBalance();
        }

        uint256 amountToRepay = _amount > borrowedAmount ? borrowedAmount : _amount;
        userBorrows[msg.sender][daiToken] -= amountToRepay;

        if (userBorrows[msg.sender][daiToken] == 0) {
            _removeBorrower(msg.sender);
        }

        bool success = IERC20(daiToken).approve(address(this), amountToRepay);
        if (!success) {
            revert LendingBorrowing__ApprovalFailed();
        }

        success = IERC20(daiToken).transferFrom(msg.sender, address(this), amountToRepay);
        if (!success) {
            revert LendingBorrowing__TransferFailed();
        }

        emit Repay(msg.sender, daiToken, amountToRepay);
    }

    function liquidate(address _borrower, uint256 _debtToCover) external nonReentrant moreThanZero(_debtToCover) {
        (uint256 healthFactor, uint256 borrowedAmount) = calculateHealthFactor(_borrower);
        if (healthFactor >= 1e18) {
            revert LendingBorrowing__HealthFactorIsNotBroken();
        }

        uint256 amountToLiquidate = (_debtToCover > borrowedAmount) ? borrowedAmount : _debtToCover;
        uint256 tokenAmountFromDebtCovered = getCollateralTokenAmountFromDai(amountToLiquidate);

        if (tokenAmountFromDebtCovered > userCollaterals[_borrower][collateralToken]) {
            revert LendingBorrowing__NotEnoughCollateral();
        }

        uint256 bonusCollateral = (tokenAmountFromDebtCovered * LIQUIDATION_BONUS) / 100;
        uint256 totalCollateralToLiquidate = tokenAmountFromDebtCovered + bonusCollateral;

        if (msg.sender == _borrower) {
            revert LendingBorrowing__UserCannotLiquidateHimself();
        }

        userBorrows[_borrower][daiToken] -= amountToLiquidate;
        userCollaterals[_borrower][collateralToken] -= tokenAmountFromDebtCovered;

        bool successDebt = IERC20(daiToken).approve(address(this), amountToLiquidate);
        successDebt = IERC20(daiToken).transferFrom(msg.sender, address(this), amountToLiquidate);

        bool successCollateral = IERC20(collateralToken).approve(address(this), totalCollateralToLiquidate);
        successCollateral = IERC20(collateralToken).transfer(msg.sender, totalCollateralToLiquidate);

        if (!successDebt || !successCollateral) {
            revert LendingBorrowing__TransferFailed();
        }

        emit Liquidate(msg.sender, _borrower, amountToLiquidate, totalCollateralToLiquidate);
    }

    function calculateHealthFactor(address _user) public view returns (uint256, uint256) {
        uint256 collateralValueInDai = calculateCollateralValue(_user);
        uint256 borrowedAmount = userBorrows[_user][daiToken];

        if (borrowedAmount == 0) return (1000e18, 0);

        uint256 collateralAdjustedForThreshold = (collateralValueInDai * LIQUIDATION_THRESHOLD) / 100;
        uint256 healthFactor = (collateralAdjustedForThreshold * 1e18) / borrowedAmount;

        return (healthFactor, borrowedAmount);
    }

    function getBorrowLimit(address _user) public view returns (uint256) {
        uint256 collateralValue = calculateCollateralValue(_user);
        return (collateralValue * COLLATERAL_FACTOR) / 100;
    }

    function getCollateralTokenAmountFromDai(uint256 _daiAmount) public view returns (uint256) {
        uint256 collateralPrice = getPriceEth();
        return (_daiAmount * 1e18) / collateralPrice;
    }

    function getTotalBorrows() public view returns (uint256) {
        uint256 totalBorrows = 0;
        // Mengambil total borrows dari setiap address yang telah melakukan borrow
        address[] memory borrower = getBorrowers(); // Implementasi fungsi ini diperlukan
        for (uint256 i = 0; i < borrower.length; i++) {
            totalBorrows += userBorrows[borrower[i]][daiToken];
        }
        return totalBorrows;
    }

    function getTotalCollateralValue() public view returns (uint256) {
        uint256 totalCollateralValue = 0;
        // Mengambil total collateral value dari setiap address yang telah deposit collateral
        address[] memory depositors = getCollateralDepositors(); // Implementasi fungsi ini diperlukan
        for (uint256 i = 0; i < depositors.length; i++) {
            totalCollateralValue += calculateCollateralValue(depositors[i]);
        }
        return totalCollateralValue;
    }

    function calculateAvailableBorrow(address _user) public view returns (uint256) {
        uint256 borrowLimit = getBorrowLimit(_user);
        uint256 borrowedAmount = userBorrows[_user][daiToken];

        return borrowLimit - borrowedAmount;
    }

    function calculateNetWorth(address _user) public view returns (uint256) {
        uint256 collateralValue = calculateCollateralValue(_user);
        uint256 borrowedValue = calculateDaiValue(_user);
        if (borrowedValue == 0) return collateralValue;

        return collateralValue - borrowedValue;
    }

    function calculateDaiValue(address _user) internal view returns (uint256) {
        uint256 borrowedAmount = userBorrows[_user][daiToken];
        uint256 borrowedPrice = getPriceDai();
        if (borrowedAmount == 0) return 0;

        return (borrowedAmount * borrowedPrice) / 1e18;
    }

    function calculateCollateralValue(address _user) internal view returns (uint256) {
        uint256 collateralAmount = userCollaterals[_user][collateralToken];
        uint256 collateralPrice = getPriceEth();

        return (collateralAmount * collateralPrice) / 1e18;
    }

    function calculateCollateralBalanceValue(address _user) internal view returns (uint256) {
        uint256 collateralAmount = IERC20(collateralToken).balanceOf(_user);
        uint256 collateralPrice = getPriceEth();

        return (collateralAmount * collateralPrice) / 1e18;
    }

    function getPriceEth() internal view returns (uint256) {
        PriceFeedAdapter priceFeedAddreses = collateralPriceFeeds[collateralToken];
        PriceFeedAdapter priceFeed = PriceFeedAdapter(priceFeedAddreses);
        (, int256 price,,,) = priceFeed.latestRoundData();

        return uint256(price) * 1e10;
    }

    function getPriceDai() internal view returns (uint256) {
        PriceFeedAdapter priceFeedAddreses = daiPriceFeeds[daiToken];
        PriceFeedAdapter priceFeed = PriceFeedAdapter(priceFeedAddreses);
        (, int256 price,,,) = priceFeed.latestRoundData();

        return uint256(price) * 1e10;
    }

    function calculateInterest(uint256 _principal, uint256 _timeElapsed) internal pure returns (uint256) {
        uint256 interest = _principal * INTEREST_RATE * _timeElapsed / SECONDS_IN_A_YEAR / 100;
        return interest;
    }

    function _addBorrower(address borrower) internal {
        for (uint256 i = 0; i < borrowers.length; i++) {
            if (borrowers[i] == borrower) {
                return;
            }
        }

        borrowers.push(borrower);
    }

    function _removeBorrower(address borrower) internal {
        for (uint256 i = 0; i < borrowers.length; i++) {
            if (borrowers[i] == borrower) {
                borrowers[i] = borrowers[borrowers.length - 1];
                borrowers.pop();
                break;
            }
        }
    }

    function _addCollateralHolder(address holder) internal {
        for (uint256 i = 0; i < collateralHolders.length; i++) {
            if (collateralHolders[i] == holder) {
                return;
            }
        }

        collateralHolders.push(holder);
    }

    function _removeCollateralHolder(address holder) internal {
        for (uint256 i = 0; i < collateralHolders.length; i++) {
            if (collateralHolders[i] == holder) {
                collateralHolders[i] = collateralHolders[collateralHolders.length - 1];
                collateralHolders.pop();
                break;
            }
        }
    }

    function getBorrowers() public view returns (address[] memory) {
        return borrowers;
    }

    function getCollateralDepositors() public view returns (address[] memory) {
        return collateralHolders;
    }

    function getUserDeposit(address user) external view returns (uint256) {
        return userDeposits[user][daiToken];
    }

    function getTotalDeposit() external view returns (uint256) {
        return totalDeposits[daiToken];
    }

    function getUserCollateral(address user) external view returns (uint256) {
        return userCollaterals[user][collateralToken];
    }

    function getUserBorrow(address user) external view returns (uint256) {
        return userBorrows[user][daiToken];
    }

    function getUserTimestamp(address user) external view returns (uint256) {
        return depositTimestamps[user][daiToken];
    }

    function getCollateralPrice() external view returns (uint256) {
        return getPriceEth();
    }

    function getDaiPrice() external view returns (uint256) {
        return getPriceDai();
    }

    function getCollateralValue(address _user) external view returns (uint256) {
        return calculateCollateralValue(_user);
    }

    function getCollateralWalletValue(address _user) external view returns (uint256) {
        return calculateCollateralBalanceValue(_user);
    }
}
