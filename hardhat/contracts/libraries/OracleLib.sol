// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../Interfaces/PriceFeedAdapter.sol";

library OracleLib {
    error OracleLib__StalePrice();
    error OracleLib__NegativePrice();
    error OracleLib__InvalidPrice();

    uint256 private constant TIMEOUT = 3 hours;
    int256 private constant MINIMAL_PRICE = 1e8;

    function staleCheckLatestRoundData(PriceFeedAdapter priceFeed)
        public
        view
        returns (uint80, int256, uint256, uint256, uint80)
    {
        (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) =
            priceFeed.latestRoundData();
        if (roundId <= 0) revert OracleLib__InvalidPrice();
        if (answer <= 0) revert OracleLib__NegativePrice();
        if (answer < MINIMAL_PRICE) revert OracleLib__StalePrice();

        uint256 secondsSinceUpdate = block.timestamp - updatedAt;
        if (secondsSinceUpdate > TIMEOUT) revert OracleLib__StalePrice();

        return (roundId, answer, startedAt, updatedAt, answeredInRound);
    }
}
