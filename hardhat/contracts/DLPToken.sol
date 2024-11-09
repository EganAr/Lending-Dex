// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DLPToken is ERC20, Ownable {
    address public dexAddress;

    constructor() ERC20("DEX LP Token", "DLP") Ownable(msg.sender) {}

    modifier onlyDex() {
        require(msg.sender == dexAddress, "Only DEX can call this");
        _;
    }

    function setDexAddress(address _dexAddress) external onlyOwner {
        dexAddress = _dexAddress;
    }

    function mint(address to, uint256 amount) external onlyDex {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyDex {
        _burn(from, amount);
    }
}
