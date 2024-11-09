// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AggregatorV3Interface.sol";

contract PriceFeedAdapter {
    AggregatorV3Interface private immutable i_PriceFeed;

    constructor(address _priceFeed) {
        i_PriceFeed = AggregatorV3Interface(_priceFeed);
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return i_PriceFeed.latestRoundData();
    }

    function decimals() external view returns (uint8) {
        return i_PriceFeed.decimals();
    }

    function description() external view returns (string memory) {
        return i_PriceFeed.description();
    }

    function version() external view returns (uint256) {
        return i_PriceFeed.version();
    }

    function getRoundData(uint80 _roundId)
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return i_PriceFeed.getRoundData(_roundId);
    }
}
