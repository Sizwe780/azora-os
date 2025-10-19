// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract AZR is ERC20, Ownable, ReentrancyGuard, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    mapping(address => uint256) public mintedPerUser;
    mapping(address => bool) public kycVerified;
    address public kycService;

    event KYCVerified(address user);
    event RewardMinted(address to, uint256 amount);

    constructor(address _kycService) ERC20("Azora Coin", "AZR") {
        kycService = _kycService;
        _mint(msg.sender, 10000 * 10**18); // Initial supply for founder
    }

    modifier onlyKYC() {
        require(kycVerified[msg.sender] || msg.sender == owner(), "KYC required");
        _;
    }

    function verifyKYC(address user) external {
        require(msg.sender == kycService, "Unauthorized");
        kycVerified[user] = true;
        emit KYCVerified(user);
    }

    function mintReward(address to, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        require(mintedPerUser[to] + amount <= 100 * 10**18, "User limit exceeded");
        _mint(to, amount);
        mintedPerUser[to] += amount;
        emit RewardMinted(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
