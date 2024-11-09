// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    bool private transferFromShouldFail;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setTransferFromShouldFail(bool _shouldFail) external {
        transferFromShouldFail = _shouldFail;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        if (transferFromShouldFail) {
            return false;
        }
        return super.transferFrom(sender, recipient, amount);
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        if (transferFromShouldFail) {
            return false;
        }
        return super.transfer(recipient, amount);
    }
}
