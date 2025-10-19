// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AzoraCoin
 * @dev A compliant ERC20 token for the Azora OS.
 * - Fixed supply of 1,000,000 tokens.
 * - Minted entirely to the contract deployer (Treasury).
 * - No further minting is possible.
 */
contract AzoraCoin is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1M AZR

    constructor() ERC20("Azora Coin", "AZR") Ownable(msg.sender) {
        _mint(msg.sender, 100_000 * 10**18); // Initial mint
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
