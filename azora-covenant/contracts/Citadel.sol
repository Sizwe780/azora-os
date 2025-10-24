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
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

/**
 * @title Citadel - Azora Token Citadel
 * @dev Central minting, redemption, and collateral management for a-Tokens.
 *
 * Genesis Protocol - Part II: Citadel Smart Contract
 *
 * The Citadel manages:
 * - a-Token minting with collateral backing
 * - Redemption mechanisms with stability controls
 * - Multi-collateral reserve management
 * - Integration with Circuit Breakers and Stability Fund
 * - PIVC taxation on economic activities
 */

contract Citadel is Ownable, ReentrancyGuard {

    // ========== CITadel STRUCTURES ==========

    /**
     * @dev a-Token configuration
     */
    struct ATokenConfig {
        bytes32 tokenSymbol;        // e.g., "aZAR", "aUSD"
        address tokenAddress;       // Deployed ERC20 token address
        address pegToken;          // Token this a-Token is pegged to (e.g., USDC for aUSD)
        uint256 minimumCollateralRatio; // Minimum collateral ratio (basis points)
        uint256 liquidationRatio;  // Liquidation threshold (basis points)
        uint256 mintingFee;        // Fee for minting (basis points)
        uint256 redemptionFee;     // Fee for redemption (basis points)
        bool isActive;             // Whether this a-Token is active
    }

    /**
     * @dev User position for collateral and debt
     */
    struct Position {
        address user;
        bytes32 tokenSymbol;
        uint256 collateralAmount;  // Amount of collateral deposited
        uint256 debtAmount;        // Amount of a-Tokens minted (debt)
        uint256 lastUpdateTime;
        bool isLiquidated;
    }

    /**
     * @dev Minting/redemption transaction record
     */
    struct CitadelTransaction {
        uint256 transactionId;
        address user;
        bytes32 tokenSymbol;
        string transactionType;    // "mint", "redeem", "deposit", "withdraw"
        uint256 collateralAmount;
        uint256 tokenAmount;
        uint256 feeAmount;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // ========== STATE VARIABLES ==========

    // a-Token configurations
    mapping(bytes32 => ATokenConfig) public aTokenConfigs;
    bytes32[] public activeATokens;

    // User positions: user => tokenSymbol => position
    mapping(address => mapping(bytes32 => Position)) public userPositions;

    // Transaction records
    mapping(uint256 => CitadelTransaction) public citadelTransactions;
    uint256 public nextTransactionId = 1;

    // Global parameters
    uint256 public constant MAX_FEE = 1000; // 10% max fee
    uint256 public constant LIQUIDATION_BONUS = 10500; // 5% bonus for liquidators
    uint256 public constant MAX_COLLATERAL_RATIO = 100000; // 1000% max ratio

    // Protocol fees (collected in AZR)
    uint256 public totalFeesCollected;
    address public feeRecipient; // PIVC taxation system

    // Integration contracts
    address public trisulaReserve;    // Collateral reserve system
    address public circuitBreaker;    // Circuit breaker system
    address public stabilityFund;     // Stability fund
    address public pivcTaxation;      // Taxation system

    // Emergency controls
    bool public mintingPaused;
    bool public redemptionPaused;
    mapping(bytes32 => bool) public tokenMintingPaused;
    mapping(bytes32 => bool) public tokenRedemptionPaused;

    // ========== EVENTS ==========

    event ATokenConfigured(
        bytes32 indexed tokenSymbol,
        address tokenAddress,
        address pegToken,
        uint256 minimumCollateralRatio
    );

    event CollateralDeposited(
        address indexed user,
        bytes32 indexed tokenSymbol,
        uint256 amount
    );

    event CollateralWithdrawn(
        address indexed user,
        bytes32 indexed tokenSymbol,
        uint256 amount
    );

    event ATokensMinted(
        address indexed user,
        bytes32 indexed tokenSymbol,
        uint256 amount,
        uint256 fee
    );

    event ATokensRedeemed(
        address indexed user,
        bytes32 indexed tokenSymbol,
        uint256 amount,
        uint256 fee
    );

    event PositionLiquidated(
        address indexed user,
        bytes32 indexed tokenSymbol,
        address indexed liquidator,
        uint256 collateralSeized,
        uint256 debtRepaid
    );

    event ProtocolFeeCollected(
        uint256 amount,
        string feeType
    );

    event EmergencyControlActivated(
        string controlType,
        bool activated,
        string reason
    );

    // ========== CONSTRUCTOR ==========

    constructor(
        address _trisulaReserve,
        address _circuitBreaker,
        address _stabilityFund,
        address _pivcTaxation
    ) Ownable(msg.sender) {
        trisulaReserve = _trisulaReserve;
        circuitBreaker = _circuitBreaker;
        stabilityFund = _stabilityFund;
        pivcTaxation = _pivcTaxation;
        feeRecipient = _pivcTaxation; // PIVC taxation system receives fees

        _initializeGenesisATokens();
    }

    // ========== A-TOKEN CONFIGURATION ==========

    /**
     * @dev Configure a new a-Token
     */
    function configureAToken(
        bytes32 tokenSymbol,
        address tokenAddress,
        address pegToken,
        uint256 minimumCollateralRatio,
        uint256 liquidationRatio,
        uint256 mintingFee,
        uint256 redemptionFee
    ) external onlyOwner {
        require(tokenSymbol != bytes32(0), "Invalid token symbol");
        require(tokenAddress != address(0), "Invalid token address");
        require(pegToken != address(0), "Invalid peg token");
        require(minimumCollateralRatio >= 10000, "Collateral ratio too low"); // Min 100%
        require(minimumCollateralRatio <= MAX_COLLATERAL_RATIO, "Collateral ratio too high");
        require(liquidationRatio >= minimumCollateralRatio, "Liquidation ratio too low");
        require(mintingFee <= MAX_FEE, "Minting fee too high");
        require(redemptionFee <= MAX_FEE, "Redemption fee too high");

        aTokenConfigs[tokenSymbol] = ATokenConfig({
            tokenSymbol: tokenSymbol,
            tokenAddress: tokenAddress,
            pegToken: pegToken,
            minimumCollateralRatio: minimumCollateralRatio,
            liquidationRatio: liquidationRatio,
            mintingFee: mintingFee,
            redemptionFee: redemptionFee,
            isActive: true
        });

        // Add to active tokens if not already present
        bool alreadyActive = false;
        for (uint256 i = 0; i < activeATokens.length; i++) {
            if (activeATokens[i] == tokenSymbol) {
                alreadyActive = true;
                break;
            }
        }
        if (!alreadyActive) {
            activeATokens.push(tokenSymbol);
        }

        emit ATokenConfigured(tokenSymbol, tokenAddress, pegToken, minimumCollateralRatio);
    }

    /**
     * @dev Update a-Token configuration
     */
    function updateATokenConfig(
        bytes32 tokenSymbol,
        uint256 minimumCollateralRatio,
        uint256 liquidationRatio,
        uint256 mintingFee,
        uint256 redemptionFee
    ) external onlyOwner {
        require(aTokenConfigs[tokenSymbol].isActive, "a-Token not configured");

        ATokenConfig storage config = aTokenConfigs[tokenSymbol];
        config.minimumCollateralRatio = minimumCollateralRatio;
        config.liquidationRatio = liquidationRatio;
        config.mintingFee = mintingFee;
        config.redemptionFee = redemptionFee;

        emit ATokenConfigured(tokenSymbol, config.tokenAddress, config.pegToken, minimumCollateralRatio);
    }

    /**
     * @dev Deactivate an a-Token
     */
    function deactivateAToken(bytes32 tokenSymbol) external onlyOwner {
        require(aTokenConfigs[tokenSymbol].isActive, "a-Token not active");
        aTokenConfigs[tokenSymbol].isActive = false;

        // Remove from active tokens
        for (uint256 i = 0; i < activeATokens.length; i++) {
            if (activeATokens[i] == tokenSymbol) {
                activeATokens[i] = activeATokens[activeATokens.length - 1];
                activeATokens.pop();
                break;
            }
        }
    }

    // ========== COLLATERAL MANAGEMENT ==========

    /**
     * @dev Deposit collateral for an a-Token position
     */
    function depositCollateral(
        bytes32 tokenSymbol,
        uint256 amount
    ) external nonReentrant {
        require(aTokenConfigs[tokenSymbol].isActive, "a-Token not active");
        require(amount > 0, "Invalid amount");
        require(!mintingPaused, "Minting is paused");

        ATokenConfig memory config = aTokenConfigs[tokenSymbol];

        // Transfer collateral from user
        IERC20(config.pegToken).transferFrom(msg.sender, address(this), amount);

        // Update position
        Position storage position = userPositions[msg.sender][tokenSymbol];
        position.user = msg.sender;
        position.tokenSymbol = tokenSymbol;
        position.collateralAmount += amount;
        position.lastUpdateTime = block.timestamp;

        // Record transaction
        _recordTransaction(msg.sender, tokenSymbol, "deposit", amount, 0, 0);

        emit CollateralDeposited(msg.sender, tokenSymbol, amount);
    }

    /**
     * @dev Withdraw collateral from position
     */
    function withdrawCollateral(
        bytes32 tokenSymbol,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Invalid amount");

        Position storage position = userPositions[msg.sender][tokenSymbol];
        require(position.collateralAmount >= amount, "Insufficient collateral");
        require(!position.isLiquidated, "Position liquidated");

        // Check if withdrawal would violate collateral ratio
        uint256 newCollateralAmount = position.collateralAmount - amount;
        if (position.debtAmount > 0) {
            uint256 collateralRatio = _calculateCollateralRatio(newCollateralAmount, position.debtAmount, tokenSymbol);
            require(collateralRatio >= aTokenConfigs[tokenSymbol].minimumCollateralRatio, "Would violate collateral ratio");
        }

        // Update position
        position.collateralAmount = newCollateralAmount;
        position.lastUpdateTime = block.timestamp;

        // Transfer collateral back to user
        ATokenConfig memory config = aTokenConfigs[tokenSymbol];
        IERC20(config.pegToken).transfer(msg.sender, amount);

        // Record transaction
        _recordTransaction(msg.sender, tokenSymbol, "withdraw", amount, 0, 0);

        emit CollateralWithdrawn(msg.sender, tokenSymbol, amount);
    }

    // ========== MINTING AND REDEMPTION ==========

    /**
     * @dev Mint a-Tokens against collateral
     */
    function mintATokens(
        bytes32 tokenSymbol,
        uint256 amount
    ) external nonReentrant {
        require(aTokenConfigs[tokenSymbol].isActive, "a-Token not active");
        require(amount > 0, "Invalid amount");
        require(!mintingPaused, "Minting is paused");
        require(!tokenMintingPaused[tokenSymbol], "Token minting paused");

        Position storage position = userPositions[msg.sender][tokenSymbol];
        require(!position.isLiquidated, "Position liquidated");

        ATokenConfig memory config = aTokenConfigs[tokenSymbol];

        // Check circuit breaker status
        if (circuitBreaker != address(0)) {
            bool operationAllowed = _checkCircuitBreaker(tokenSymbol, "mint");
            require(operationAllowed, "Circuit breaker prevents minting");
        }

        // Calculate required collateral
        uint256 requiredCollateral = _calculateRequiredCollateral(amount, config.minimumCollateralRatio, tokenSymbol);
        require(position.collateralAmount >= requiredCollateral, "Insufficient collateral");

        // Calculate minting fee
        uint256 feeAmount = (amount * config.mintingFee) / 10000;

        // Update position
        position.debtAmount += amount;
        position.lastUpdateTime = block.timestamp;

        // Mint a-Tokens to user
        IERC20(config.tokenAddress).transfer(msg.sender, amount);

        // Handle fees (send to PIVC taxation system)
        if (feeAmount > 0) {
            totalFeesCollected += feeAmount;
            // In production, fees would be sent to AZR and taxed via PIVC system
            emit ProtocolFeeCollected(feeAmount, "minting_fee");
        }

        // Record transaction
        _recordTransaction(msg.sender, tokenSymbol, "mint", 0, amount, feeAmount);

        emit ATokensMinted(msg.sender, tokenSymbol, amount, feeAmount);
    }

    /**
     * @dev Redeem a-Tokens for collateral
     */
    function redeemATokens(
        bytes32 tokenSymbol,
        uint256 amount
    ) external nonReentrant {
        require(aTokenConfigs[tokenSymbol].isActive, "a-Token not active");
        require(amount > 0, "Invalid amount");
        require(!redemptionPaused, "Redemption is paused");
        require(!tokenRedemptionPaused[tokenSymbol], "Token redemption paused");

        Position storage position = userPositions[msg.sender][tokenSymbol];
        require(position.debtAmount >= amount, "Insufficient debt");
        require(!position.isLiquidated, "Position liquidated");

        ATokenConfig memory config = aTokenConfigs[tokenSymbol];

        // Check circuit breaker status
        if (circuitBreaker != address(0)) {
            bool operationAllowed = _checkCircuitBreaker(tokenSymbol, "redeem");
            require(operationAllowed, "Circuit breaker prevents redemption");
        }

        // Calculate redemption fee
        uint256 feeAmount = (amount * config.redemptionFee) / 10000;

        // Calculate collateral to return
        uint256 collateralToReturn = _calculateCollateralForRedemption(amount, tokenSymbol);

        // Update position
        position.debtAmount -= amount;
        position.collateralAmount -= collateralToReturn;
        position.lastUpdateTime = block.timestamp;

        // Burn a-Tokens from user
        IERC20(config.tokenAddress).transferFrom(msg.sender, address(this), amount);
        // In production, tokens would be burned

        // Return collateral to user
        IERC20(config.pegToken).transfer(msg.sender, collateralToReturn);

        // Handle fees
        if (feeAmount > 0) {
            totalFeesCollected += feeAmount;
            emit ProtocolFeeCollected(feeAmount, "redemption_fee");
        }

        // Record transaction
        _recordTransaction(msg.sender, tokenSymbol, "redeem", collateralToReturn, amount, feeAmount);

        emit ATokensRedeemed(msg.sender, tokenSymbol, amount, feeAmount);
    }

    // ========== LIQUIDATION SYSTEM ==========

    /**
     * @dev Liquidate an under-collateralized position
     */
    function liquidatePosition(
        address user,
        bytes32 tokenSymbol
    ) external nonReentrant {
        Position storage position = userPositions[user][tokenSymbol];
        require(position.debtAmount > 0, "No debt to liquidate");
        require(!position.isLiquidated, "Position already liquidated");

        ATokenConfig memory config = aTokenConfigs[tokenSymbol];

        // Check if position is under-collateralized
        uint256 collateralRatio = _calculateCollateralRatio(position.collateralAmount, position.debtAmount, tokenSymbol);
        require(collateralRatio < config.liquidationRatio, "Position not liquidatable");

        // Calculate liquidation amounts
        uint256 debtToRepay = position.debtAmount;
        uint256 collateralToSeize = (debtToRepay * LIQUIDATION_BONUS) / 10000; // 5% bonus

        // Ensure we don't seize more than available collateral
        if (collateralToSeize > position.collateralAmount) {
            collateralToSeize = position.collateralAmount;
        }

        // Mark position as liquidated
        position.isLiquidated = true;

        // Transfer debt tokens from liquidator to repay debt
        IERC20(config.tokenAddress).transferFrom(msg.sender, address(this), debtToRepay);

        // Transfer collateral bonus to liquidator
        IERC20(config.pegToken).transfer(msg.sender, collateralToSeize);

        // Send remaining collateral to Stability Fund
        uint256 remainingCollateral = position.collateralAmount - collateralToSeize;
        if (remainingCollateral > 0 && stabilityFund != address(0)) {
            IERC20(config.pegToken).transfer(stabilityFund, remainingCollateral);
        }

        emit PositionLiquidated(user, tokenSymbol, msg.sender, collateralToSeize, debtToRepay);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get user's position for an a-Token
     */
    function getUserPosition(address user, bytes32 tokenSymbol) external view returns (
        uint256 collateralAmount,
        uint256 debtAmount,
        uint256 collateralRatio,
        bool isLiquidatable,
        bool isLiquidated
    ) {
        Position memory position = userPositions[user][tokenSymbol];
        uint256 ratio = 0;
        bool liquidatable = false;

        if (position.debtAmount > 0) {
            ratio = _calculateCollateralRatio(position.collateralAmount, position.debtAmount, tokenSymbol);
            liquidatable = ratio < aTokenConfigs[tokenSymbol].liquidationRatio;
        }

        return (
            position.collateralAmount,
            position.debtAmount,
            ratio,
            liquidatable,
            position.isLiquidated
        );
    }

    /**
     * @dev Calculate collateral ratio for a position
     */
    function calculateCollateralRatio(
        uint256 collateralAmount,
        uint256 debtAmount,
        bytes32 tokenSymbol
    ) external view returns (uint256) {
        return _calculateCollateralRatio(collateralAmount, debtAmount, tokenSymbol);
    }

    /**
     * @dev Get a-Token configuration
     */
    function getATokenConfig(bytes32 tokenSymbol) external view returns (ATokenConfig memory) {
        return aTokenConfigs[tokenSymbol];
    }

    /**
     * @dev Get all active a-Tokens
     */
    function getActiveATokens() external view returns (bytes32[] memory) {
        return activeATokens;
    }

    /**
     * @dev Get Citadel statistics
     */
    function getCitadelStats() external view returns (
        uint256 totalATokens,
        uint256 totalPositions,
        uint256 totalFeesCollected_,
        bool mintingPaused_,
        bool redemptionPaused_
    ) {
        uint256 totalPositionsCount = 0;

        // Count total positions (simplified - in production would track this)
        for (uint256 i = 0; i < activeATokens.length; i++) {
            // This is a simplified count - production would maintain a counter
            totalPositionsCount += 1; // Placeholder
        }

        return (
            activeATokens.length,
            totalPositionsCount,
            totalFeesCollected,
            mintingPaused,
            redemptionPaused
        );
    }

    // ========== EMERGENCY CONTROLS ==========

    /**
     * @dev Pause/unpause all minting
     */
    function setMintingPaused(bool paused, string calldata reason) external onlyOwner {
        mintingPaused = paused;
        emit EmergencyControlActivated("minting", paused, reason);
    }

    /**
     * @dev Pause/unpause all redemptions
     */
    function setRedemptionPaused(bool paused, string calldata reason) external onlyOwner {
        redemptionPaused = paused;
        emit EmergencyControlActivated("redemption", paused, reason);
    }

    /**
     * @dev Pause/unpause minting for specific token
     */
    function setTokenMintingPaused(bytes32 tokenSymbol, bool paused, string calldata reason) external onlyOwner {
        tokenMintingPaused[tokenSymbol] = paused;
        emit EmergencyControlActivated(string(abi.encodePacked("minting_", tokenSymbol)), paused, reason);
    }

    /**
     * @dev Pause/unpause redemption for specific token
     */
    function setTokenRedemptionPaused(bytes32 tokenSymbol, bool paused, string calldata reason) external onlyOwner {
        tokenRedemptionPaused[tokenSymbol] = paused;
        emit EmergencyControlActivated(string(abi.encodePacked("redemption_", tokenSymbol)), paused, reason);
    }

    // ========== PRIVATE FUNCTIONS ==========

    /**
     * @dev Initialize Genesis Protocol a-Tokens
     */
    function _initializeGenesisATokens() private {
        // Initialize with core a-Tokens
        // In production, these would be actual deployed token addresses

        // aZAR - South African Rand pegged
        configureAToken(
            "aZAR",
            address(0x1111111111111111111111111111111111111111), // Placeholder
            address(0x2222222222222222222222222222222222222222), // ZAR stablecoin
            15000, // 150% minimum collateral ratio
            12000, // 120% liquidation ratio
            50,    // 0.5% minting fee
            25     // 0.25% redemption fee
        );

        // aUSD - USD pegged
        configureAToken(
            "aUSD",
            address(0x3333333333333333333333333333333333333333), // Placeholder
            address(0x4444444444444444444444444444444444444444), // USDC
            15000, // 150% minimum collateral ratio
            12000, // 120% liquidation ratio
            30,    // 0.3% minting fee
            15     // 0.15% redemption fee
        );
    }

    /**
     * @dev Calculate collateral ratio
     */
    function _calculateCollateralRatio(
        uint256 collateralAmount,
        uint256 debtAmount,
        bytes32 tokenSymbol
    ) private view returns (uint256) {
        if (debtAmount == 0) return 0;

        // Get collateral price in terms of debt token
        // In production, this would use price oracles
        uint256 collateralValue = collateralAmount; // Simplified - assume 1:1 for now
        uint256 debtValue = debtAmount;

        return (collateralValue * 10000) / debtValue;
    }

    /**
     * @dev Calculate required collateral for minting
     */
    function _calculateRequiredCollateral(
        uint256 tokenAmount,
        uint256 collateralRatio,
        bytes32 tokenSymbol
    ) private view returns (uint256) {
        // Simplified calculation - in production would use price oracles
        return (tokenAmount * collateralRatio) / 10000;
    }

    /**
     * @dev Calculate collateral to return for redemption
     */
    function _calculateCollateralForRedemption(
        uint256 tokenAmount,
        bytes32 tokenSymbol
    ) private view returns (uint256) {
        // Simplified calculation - in production would use price oracles
        Position memory position = userPositions[msg.sender][tokenSymbol];
        if (position.debtAmount == 0) return 0;

        return (position.collateralAmount * tokenAmount) / position.debtAmount;
    }

    /**
     * @dev Check circuit breaker status
     */
    function _checkCircuitBreaker(bytes32 tokenSymbol, string memory operationType) private view returns (bool) {
        // In production, this would call the circuit breaker contract
        // For now, return true (operation allowed)
        return true;
    }

    /**
     * @dev Record a Citadel transaction
     */
    function _recordTransaction(
        address user,
        bytes32 tokenSymbol,
        string memory transactionType,
        uint256 collateralAmount,
        uint256 tokenAmount,
        uint256 feeAmount
    ) private {
        uint256 transactionId = nextTransactionId++;
        citadelTransactions[transactionId] = CitadelTransaction({
            transactionId: transactionId,
            user: user,
            tokenSymbol: tokenSymbol,
            transactionType: transactionType,
            collateralAmount: collateralAmount,
            tokenAmount: tokenAmount,
            feeAmount: feeAmount,
            timestamp: block.timestamp,
            blockNumber: block.number
        });
    }
}