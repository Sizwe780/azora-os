/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Trisula Reserve
 * @dev The diversified collateral reserve system for Azora a-Tokens.
 *
 * The Trisula Reserve maintains three asset classes to mitigate collateral,
 * custody, and valuation risks:
 * 1. Native AZR tokens (primary reserve asset)
 * 2. Basket of external stablecoins (USDC, PYUSD, etc.)
 * 3. Tokenized Real-World Assets (RWAs) from Forge network
 *
 * Genesis Protocol - Part II: Trisula Reserve Fortification
 */
contract TrisulaReserve is Ownable, ReentrancyGuard {

    // ========== RESERVE STRUCTURE ==========

    /**
     * @dev Reserve asset types
     */
    enum AssetType {
        AZR,           // Native Azora Coin
        STABLECOIN,    // External stablecoins
        RWA           // Real World Assets
    }

    /**
     * @dev Reserve asset configuration
     */
    struct ReserveAsset {
        address tokenAddress;
        AssetType assetType;
        string symbol;
        uint256 balance;
        uint256 targetAllocation; // Percentage (basis points, 0-10000)
        uint256 currentAllocation; // Current percentage
        bool isActive;
        uint256 lastUpdated;
    }

    /**
     * @dev Overall reserve metrics
     */
    struct ReserveMetrics {
        uint256 totalValueUSD;      // Total reserve value in USD
        uint256 azrValueUSD;        // AZR portion value
        uint256 stablecoinValueUSD; // Stablecoin portion value
        uint256 rwaValueUSD;        // RWA portion value
        uint256 utilizationRatio;   // How much of reserve is backing a-Tokens
        uint256 lastRebalancing;    // Timestamp of last rebalancing
    }

    // ========== STATE VARIABLES ==========

    mapping(address => ReserveAsset) public reserveAssets;
    address[] public activeAssets;

    ReserveMetrics public metrics;

    // Reserve targets (basis points)
    uint256 public constant AZR_TARGET = 4000;      // 40% AZR
    uint256 public constant STABLECOIN_TARGET = 3500; // 35% Stablecoins
    uint256 public constant RWA_TARGET = 2500;      // 25% RWAs

    // Rebalancing parameters
    uint256 public constant REBALANCE_THRESHOLD = 500; // 5% deviation triggers rebalance
    uint256 public constant REBALANCE_COOLDOWN = 1 hours;

    // Oracle for price feeds (would be Chainlink in production)
    address public priceOracle;

    // Authorized Citadel contracts
    mapping(address => bool) public authorizedCitadels;

    // ========== EVENTS ==========

    event AssetAdded(
        address indexed tokenAddress,
        AssetType assetType,
        string symbol,
        uint256 targetAllocation
    );

    event AssetRemoved(
        address indexed tokenAddress,
        string symbol
    );

    event ReserveRebalanced(
        uint256 totalValueUSD,
        uint256 azrValueUSD,
        uint256 stablecoinValueUSD,
        uint256 rwaValueUSD
    );

    event CitadelAuthorized(
        address indexed citadelAddress
    );

    event CitadelRevoked(
        address indexed citadelAddress
    );

    // ========== CONSTRUCTOR ==========

    constructor(address _priceOracle) Ownable(msg.sender) {
        priceOracle = _priceOracle;
        _initializeGenesisReserve();
    }

    // ========== RESERVE MANAGEMENT ==========

    /**
     * @dev Add a new asset to the reserve
     */
    function addReserveAsset(
        address tokenAddress,
        AssetType assetType,
        string calldata symbol,
        uint256 targetAllocation
    ) external onlyOwner {
        require(tokenAddress != address(0), "Invalid token address");
        require(bytes(symbol).length > 0, "Symbol required");
        require(!reserveAssets[tokenAddress].isActive, "Asset already exists");
        require(targetAllocation <= 10000, "Invalid target allocation");

        reserveAssets[tokenAddress] = ReserveAsset({
            tokenAddress: tokenAddress,
            assetType: assetType,
            symbol: symbol,
            balance: 0,
            targetAllocation: targetAllocation,
            currentAllocation: 0,
            isActive: true,
            lastUpdated: block.timestamp
        });

        activeAssets.push(tokenAddress);

        emit AssetAdded(tokenAddress, assetType, symbol, targetAllocation);
    }

    /**
     * @dev Remove an asset from the reserve
     */
    function removeReserveAsset(address tokenAddress) external onlyOwner {
        require(reserveAssets[tokenAddress].isActive, "Asset not active");

        reserveAssets[tokenAddress].isActive = false;

        // Remove from active assets array
        for (uint256 i = 0; i < activeAssets.length; i++) {
            if (activeAssets[i] == tokenAddress) {
                activeAssets[i] = activeAssets[activeAssets.length - 1];
                activeAssets.pop();
                break;
            }
        }

        emit AssetRemoved(tokenAddress, reserveAssets[tokenAddress].symbol);
    }

    /**
     * @dev Deposit assets into the reserve
     */
    function deposit(
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        require(reserveAssets[tokenAddress].isActive, "Asset not in reserve");

        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        reserveAssets[tokenAddress].balance += amount;
        reserveAssets[tokenAddress].lastUpdated = block.timestamp;

        // Update metrics
        _updateReserveMetrics();
    }

    /**
     * @dev Withdraw assets from the reserve (only by authorized Citadel)
     */
    function withdraw(
        address tokenAddress,
        uint256 amount,
        address recipient
    ) external nonReentrant {
        require(authorizedCitadels[msg.sender], "Unauthorized withdrawal");
        require(reserveAssets[tokenAddress].isActive, "Asset not in reserve");
        require(reserveAssets[tokenAddress].balance >= amount, "Insufficient balance");

        reserveAssets[tokenAddress].balance -= amount;
        reserveAssets[tokenAddress].lastUpdated = block.timestamp;

        IERC20 token = IERC20(tokenAddress);
        require(token.transfer(recipient, amount), "Transfer failed");

        // Update metrics
        _updateReserveMetrics();
    }

    /**
     * @dev Rebalance the reserve to target allocations
     */
    function rebalanceReserve() external {
        require(
            block.timestamp >= metrics.lastRebalancing + REBALANCE_COOLDOWN,
            "Rebalance cooldown active"
        );

        // Check if rebalancing is needed
        bool needsRebalance = _checkRebalanceNeeded();
        require(needsRebalance, "Rebalancing not required");

        // Perform rebalancing logic
        _performRebalancing();

        metrics.lastRebalancing = block.timestamp;

        emit ReserveRebalanced(
            metrics.totalValueUSD,
            metrics.azrValueUSD,
            metrics.stablecoinValueUSD,
            metrics.rwaValueUSD
        );
    }

    // ========== CITADEL AUTHORIZATION ==========

    /**
     * @dev Authorize a Citadel contract to manage reserve withdrawals
     */
    function authorizeCitadel(address citadelAddress) external onlyOwner {
        require(citadelAddress != address(0), "Invalid citadel address");
        require(!authorizedCitadels[citadelAddress], "Citadel already authorized");

        authorizedCitadels[citadelAddress] = true;
        emit CitadelAuthorized(citadelAddress);
    }

    /**
     * @dev Revoke Citadel authorization
     */
    function revokeCitadel(address citadelAddress) external onlyOwner {
        require(authorizedCitadels[citadelAddress], "Citadel not authorized");

        authorizedCitadels[citadelAddress] = false;
        emit CitadelRevoked(citadelAddress);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get reserve asset details
     */
    function getReserveAsset(address tokenAddress) external view returns (ReserveAsset memory) {
        return reserveAssets[tokenAddress];
    }

    /**
     * @dev Get all active reserve assets
     */
    function getActiveAssets() external view returns (address[] memory) {
        return activeAssets;
    }

    /**
     * @dev Get reserve utilization for a specific a-Token
     */
    function getReserveUtilization(bytes32 tokenSymbol) external view returns (uint256) {
        // In production, this would calculate utilization for specific a-Tokens
        return metrics.utilizationRatio;
    }

    /**
     * @dev Check if reserve is adequately collateralized
     */
    function isReserveAdequate(uint256 requiredCollateralUSD) external view returns (bool) {
        // Minimum collateralization ratio: 150%
        uint256 minimumRequired = (requiredCollateralUSD * 150) / 100;
        return metrics.totalValueUSD >= minimumRequired;
    }

    /**
     * @dev Get reserve health score (0-100)
     */
    function getReserveHealthScore() external view returns (uint256) {
        if (metrics.totalValueUSD == 0) return 0;

        // Calculate diversification score
        uint256 diversificationScore = _calculateDiversificationScore();

        // Calculate allocation adherence score
        uint256 allocationScore = _calculateAllocationScore();

        // Combined health score
        return (diversificationScore + allocationScore) / 2;
    }

    // ========== PRIVATE FUNCTIONS ==========

    /**
     * @dev Initialize the Genesis Reserve with core assets
     */
    function _initializeGenesisReserve() private {
        // This would be populated with actual token addresses in deployment
        // For now, we set up the structure

        metrics = ReserveMetrics({
            totalValueUSD: 0,
            azrValueUSD: 0,
            stablecoinValueUSD: 0,
            rwaValueUSD: 0,
            utilizationRatio: 0,
            lastRebalancing: block.timestamp
        });
    }

    /**
     * @dev Update reserve metrics after deposits/withdrawals
     */
    function _updateReserveMetrics() private {
        uint256 totalValue = 0;
        uint256 azrValue = 0;
        uint256 stablecoinValue = 0;
        uint256 rwaValue = 0;

        for (uint256 i = 0; i < activeAssets.length; i++) {
            address tokenAddress = activeAssets[i];
            ReserveAsset storage asset = reserveAssets[tokenAddress];

            // Get USD value (would use price oracle in production)
            uint256 usdValue = _getAssetUSDValue(tokenAddress, asset.balance);

            totalValue += usdValue;

            if (asset.assetType == AssetType.AZR) {
                azrValue += usdValue;
            } else if (asset.assetType == AssetType.STABLECOIN) {
                stablecoinValue += usdValue;
            } else if (asset.assetType == AssetType.RWA) {
                rwaValue += usdValue;
            }

            // Update current allocation
            if (totalValue > 0) {
                asset.currentAllocation = (usdValue * 10000) / totalValue;
            }
        }

        metrics.totalValueUSD = totalValue;
        metrics.azrValueUSD = azrValue;
        metrics.stablecoinValueUSD = stablecoinValue;
        metrics.rwaValueUSD = rwaValue;
    }

    /**
     * @dev Get USD value of an asset (mock implementation)
     */
    function _getAssetUSDValue(address tokenAddress, uint256 amount) private view returns (uint256) {
        // In production, this would query Chainlink price feeds
        // For now, return a mock value based on token type

        ReserveAsset memory asset = reserveAssets[tokenAddress];

        if (asset.assetType == AssetType.AZR) {
            // Assume AZR = $1.00
            return amount / 1e18;
        } else if (asset.assetType == AssetType.STABLECOIN) {
            // Stablecoins = $1.00
            return amount / 1e18;
        } else if (asset.assetType == AssetType.RWA) {
            // RWAs = variable value, assume $1.00 for simplicity
            return amount / 1e18;
        }

        return 0;
    }

    /**
     * @dev Check if rebalancing is needed
     */
    function _checkRebalanceNeeded() private view returns (bool) {
        for (uint256 i = 0; i < activeAssets.length; i++) {
            ReserveAsset memory asset = reserveAssets[activeAssets[i]];

            uint256 deviation = asset.currentAllocation > asset.targetAllocation
                ? asset.currentAllocation - asset.targetAllocation
                : asset.targetAllocation - asset.currentAllocation;

            if (deviation >= REBALANCE_THRESHOLD) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Perform reserve rebalancing
     */
    function _performRebalancing() private {
        // In production, this would implement sophisticated rebalancing logic
        // For now, just update metrics
        _updateReserveMetrics();
    }

    /**
     * @dev Calculate diversification score (0-100)
     */
    function _calculateDiversificationScore() private view returns (uint256) {
        if (activeAssets.length == 0) return 0;

        uint256 score = 0;

        // Reward having multiple asset types
        uint256 azrAssets = 0;
        uint256 stableAssets = 0;
        uint256 rwaAssets = 0;

        for (uint256 i = 0; i < activeAssets.length; i++) {
            AssetType assetType = reserveAssets[activeAssets[i]].assetType;
            if (assetType == AssetType.AZR) azrAssets++;
            else if (assetType == AssetType.STABLECOIN) stableAssets++;
            else if (assetType == AssetType.RWA) rwaAssets++;
        }

        // Base score for having all three asset types
        if (azrAssets > 0 && stableAssets > 0 && rwaAssets > 0) {
            score += 60;
        } else if ((azrAssets > 0 && stableAssets > 0) || (azrAssets > 0 && rwaAssets > 0) || (stableAssets > 0 && rwaAssets > 0)) {
            score += 30;
        }

        // Additional score for multiple assets per type
        score += (azrAssets + stableAssets + rwaAssets - 3) * 5;

        return score > 100 ? 100 : score;
    }

    /**
     * @dev Calculate allocation adherence score (0-100)
     */
    function _calculateAllocationScore() private view returns (uint256) {
        uint256 totalDeviation = 0;

        for (uint256 i = 0; i < activeAssets.length; i++) {
            ReserveAsset memory asset = reserveAssets[activeAssets[i]];

            uint256 deviation = asset.currentAllocation > asset.targetAllocation
                ? asset.currentAllocation - asset.targetAllocation
                : asset.targetAllocation - asset.currentAllocation;

            totalDeviation += deviation;
        }

        // Convert deviation to score (lower deviation = higher score)
        uint256 score = 100;
        if (totalDeviation > 0) {
            score = 100 - (totalDeviation / activeAssets.length);
        }

        return score > 100 ? 100 : score;
    }
}