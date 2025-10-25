/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Circuit Breaker System
 * @dev Automated stability system for Azora a-Tokens.
 *
 * Implements a state machine to manage a-Token stability during volatility:
 * - OPEN: Normal operation
 * - HALF_OPEN: Limited operation for testing recovery
 * - CLOSED: Emergency halt of redemptions
 *
 * Genesis Protocol - Part II: Circuit Breakers Activated
 */
contract CircuitBreaker is Ownable, ReentrancyGuard {

    // ========== CIRCUIT STATES ==========

    /**
     * @dev Circuit breaker states
     */
    enum CircuitState {
        OPEN,      // Normal operation - all functions available
        HALF_OPEN, // Recovery testing - limited operations allowed
        CLOSED     // Emergency halt - critical functions disabled
    }

    /**
     * @dev Circuit breaker configuration for each a-Token
     */
    struct CircuitConfig {
        bytes32 tokenSymbol;        // e.g., "aZAR", "aUSD"
        CircuitState currentState;
        uint256 failureThreshold;   // Volatility threshold to trigger closure
        uint256 recoveryTimeout;    // Time to wait before attempting recovery
        uint256 lastStateChange;
        uint256 failureCount;
        uint256 successCount;
        bool isActive;
    }

    /**
     * @dev Circuit breaker metrics
     */
    struct CircuitMetrics {
        uint256 totalTriggers;
        uint256 successfulRecoveries;
        uint256 failedRecoveries;
        uint256 averageDowntime;    // In seconds
        uint256 lastIncident;
    }

    // ========== STATE VARIABLES ==========

    mapping(bytes32 => CircuitConfig) public circuitConfigs;
    mapping(bytes32 => CircuitMetrics) public circuitMetrics;
    bytes32[] public activeCircuits;

    // Global parameters
    uint256 public constant MAX_FAILURE_THRESHOLD = 10000; // 100% (basis points)
    uint256 public constant MIN_RECOVERY_TIMEOUT = 1 hours;
    uint256 public constant MAX_RECOVERY_TIMEOUT = 7 days;

    // Authorized stability contracts (Citadel, Mint, etc.)
    mapping(address => bool) public authorizedContracts;

    // Emergency override (only Founders Council)
    mapping(address => bool) public emergencyOperators;

    // ========== EVENTS ==========

    event CircuitActivated(
        bytes32 indexed tokenSymbol,
        CircuitState newState,
        string reason
    );

    event CircuitRecoveryAttempted(
        bytes32 indexed tokenSymbol,
        bool successful
    );

    event CircuitConfigUpdated(
        bytes32 indexed tokenSymbol,
        uint256 failureThreshold,
        uint256 recoveryTimeout
    );

    event EmergencyOverride(
        bytes32 indexed tokenSymbol,
        CircuitState forcedState,
        address operator
    );

    // ========== CONSTRUCTOR ==========

    constructor() Ownable(msg.sender) {
        _initializeGenesisCircuits();
    }

    // ========== CIRCUIT MANAGEMENT ==========

    /**
     * @dev Add a new circuit breaker for an a-Token
     */
    function addCircuitBreaker(
        bytes32 tokenSymbol,
        uint256 failureThreshold,
        uint256 recoveryTimeout
    ) external onlyOwner {
        require(tokenSymbol != bytes32(0), "Invalid token symbol");
        require(!circuitConfigs[tokenSymbol].isActive, "Circuit already exists");
        require(failureThreshold <= MAX_FAILURE_THRESHOLD, "Threshold too high");
        require(recoveryTimeout >= MIN_RECOVERY_TIMEOUT, "Recovery timeout too short");
        require(recoveryTimeout <= MAX_RECOVERY_TIMEOUT, "Recovery timeout too long");

        circuitConfigs[tokenSymbol] = CircuitConfig({
            tokenSymbol: tokenSymbol,
            currentState: CircuitState.OPEN,
            failureThreshold: failureThreshold,
            recoveryTimeout: recoveryTimeout,
            lastStateChange: block.timestamp,
            failureCount: 0,
            successCount: 0,
            isActive: true
        });

        circuitMetrics[tokenSymbol] = CircuitMetrics({
            totalTriggers: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0,
            averageDowntime: 0,
            lastIncident: 0
        });

        activeCircuits.push(tokenSymbol);

        emit CircuitConfigUpdated(tokenSymbol, failureThreshold, recoveryTimeout);
    }

    /**
     * @dev Update circuit breaker configuration
     */
    function updateCircuitConfig(
        bytes32 tokenSymbol,
        uint256 failureThreshold,
        uint256 recoveryTimeout
    ) external onlyOwner {
        require(circuitConfigs[tokenSymbol].isActive, "Circuit not active");
        require(failureThreshold <= MAX_FAILURE_THRESHOLD, "Threshold too high");
        require(recoveryTimeout >= MIN_RECOVERY_TIMEOUT, "Recovery timeout too short");
        require(recoveryTimeout <= MAX_RECOVERY_TIMEOUT, "Recovery timeout too long");

        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        config.failureThreshold = failureThreshold;
        config.recoveryTimeout = recoveryTimeout;

        emit CircuitConfigUpdated(tokenSymbol, failureThreshold, recoveryTimeout);
    }

    /**
     * @dev Trigger circuit breaker based on volatility metrics
     * Called by authorized stability monitoring contracts
     */
    function triggerCircuitBreaker(
        bytes32 tokenSymbol,
        uint256 volatilityLevel,
        string calldata reason
    ) external {
        require(authorizedContracts[msg.sender] || owner() == msg.sender, "Unauthorized trigger");
        require(circuitConfigs[tokenSymbol].isActive, "Circuit not active");

        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        CircuitMetrics storage metrics = circuitMetrics[tokenSymbol];

        // Check if volatility exceeds threshold
        if (volatilityLevel >= config.failureThreshold) {
            if (config.currentState == CircuitState.OPEN) {
                // Trigger circuit closure
                config.currentState = CircuitState.CLOSED;
                config.lastStateChange = block.timestamp;
                config.failureCount++;

                metrics.totalTriggers++;
                metrics.lastIncident = block.timestamp;

                emit CircuitActivated(tokenSymbol, CircuitState.CLOSED, reason);

                // Schedule recovery attempt
                _scheduleRecoveryAttempt(tokenSymbol);
            }
        }
    }

    /**
     * @dev Attempt circuit recovery (move from CLOSED to HALF_OPEN)
     */
    function attemptRecovery(bytes32 tokenSymbol) external {
        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        require(config.isActive, "Circuit not active");
        require(config.currentState == CircuitState.CLOSED, "Circuit not closed");

        uint256 timeSinceClosure = block.timestamp - config.lastStateChange;
        require(timeSinceClosure >= config.recoveryTimeout, "Recovery timeout not elapsed");

        // Move to half-open state for testing
        config.currentState = CircuitState.HALF_OPEN;
        config.lastStateChange = block.timestamp;

        emit CircuitActivated(tokenSymbol, CircuitState.HALF_OPEN, "Recovery attempt initiated");
    }

    /**
     * @dev Confirm successful recovery (move from HALF_OPEN to OPEN)
     */
    function confirmRecovery(bytes32 tokenSymbol) external {
        require(authorizedContracts[msg.sender] || owner() == msg.sender, "Unauthorized confirmation");
        require(circuitConfigs[tokenSymbol].isActive, "Circuit not active");

        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        CircuitMetrics storage metrics = circuitMetrics[tokenSymbol];

        require(config.currentState == CircuitState.HALF_OPEN, "Circuit not half-open");

        // Successful recovery
        config.currentState = CircuitState.OPEN;
        config.lastStateChange = block.timestamp;
        config.successCount++;

        metrics.successfulRecoveries++;

        _updateAverageDowntime(tokenSymbol);

        emit CircuitRecoveryAttempted(tokenSymbol, true);
        emit CircuitActivated(tokenSymbol, CircuitState.OPEN, "Recovery confirmed");
    }

    /**
     * @dev Report recovery failure (move back to CLOSED)
     */
    function reportRecoveryFailure(bytes32 tokenSymbol, string calldata reason) external {
        require(authorizedContracts[msg.sender] || owner() == msg.sender, "Unauthorized report");
        require(circuitConfigs[tokenSymbol].isActive, "Circuit not active");

        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        CircuitMetrics storage metrics = circuitMetrics[tokenSymbol];

        require(config.currentState == CircuitState.HALF_OPEN, "Circuit not half-open");

        // Recovery failed, back to closed
        config.currentState = CircuitState.CLOSED;
        config.lastStateChange = block.timestamp;

        metrics.failedRecoveries++;

        _scheduleRecoveryAttempt(tokenSymbol);

        emit CircuitRecoveryAttempted(tokenSymbol, false);
        emit CircuitActivated(tokenSymbol, CircuitState.CLOSED, reason);
    }

    // ========== AUTHORIZATION MANAGEMENT ==========

    /**
     * @dev Authorize a contract to trigger circuit breakers
     */
    function authorizeContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = true;
    }

    /**
     * @dev Revoke contract authorization
     */
    function revokeContract(address contractAddress) external onlyOwner {
        authorizedContracts[contractAddress] = false;
    }

    /**
     * @dev Add emergency operator (Founders Council only)
     */
    function addEmergencyOperator(address operator) external onlyOwner {
        require(operator != address(0), "Invalid operator address");
        emergencyOperators[operator] = true;
    }

    /**
     * @dev Emergency override of circuit state
     */
    function emergencyOverride(
        bytes32 tokenSymbol,
        CircuitState forcedState,
        string calldata reason
    ) external {
        require(emergencyOperators[msg.sender], "Not an emergency operator");
        require(circuitConfigs[tokenSymbol].isActive, "Circuit not active");

        CircuitConfig storage config = circuitConfigs[tokenSymbol];
        CircuitState previousState = config.currentState;

        config.currentState = forcedState;
        config.lastStateChange = block.timestamp;

        emit EmergencyOverride(tokenSymbol, forcedState, msg.sender);
        emit CircuitActivated(tokenSymbol, forcedState, string(abi.encodePacked("Emergency override: ", reason)));
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Check if an operation is allowed for a token
     */
    function isOperationAllowed(
        bytes32 tokenSymbol,
        string calldata operationType
    ) external view returns (bool) {
        CircuitConfig memory config = circuitConfigs[tokenSymbol];
        if (!config.isActive) return true; // Inactive circuits allow all operations

        CircuitState state = config.currentState;

        if (state == CircuitState.OPEN) {
            return true; // All operations allowed
        } else if (state == CircuitState.HALF_OPEN) {
            // Limited operations during recovery testing
            return _isAllowedInHalfOpen(operationType);
        } else if (state == CircuitState.CLOSED) {
            // Critical operations only during emergency
            return _isAllowedInClosed(operationType);
        }

        return false;
    }

    /**
     * @dev Get circuit breaker status
     */
    function getCircuitStatus(bytes32 tokenSymbol) external view returns (
        CircuitState currentState,
        uint256 failureThreshold,
        uint256 recoveryTimeout,
        uint256 lastStateChange,
        uint256 failureCount,
        uint256 successCount,
        bool isActive
    ) {
        CircuitConfig memory config = circuitConfigs[tokenSymbol];
        return (
            config.currentState,
            config.failureThreshold,
            config.recoveryTimeout,
            config.lastStateChange,
            config.failureCount,
            config.successCount,
            config.isActive
        );
    }

    /**
     * @dev Get circuit metrics
     */
    function getCircuitMetrics(bytes32 tokenSymbol) external view returns (CircuitMetrics memory) {
        return circuitMetrics[tokenSymbol];
    }

    /**
     * @dev Get all active circuits
     */
    function getActiveCircuits() external view returns (bytes32[] memory) {
        return activeCircuits;
    }

    /**
     * @dev Get system-wide circuit health
     */
    function getSystemHealth() external view returns (
        uint256 totalCircuits,
        uint256 openCircuits,
        uint256 halfOpenCircuits,
        uint256 closedCircuits,
        uint256 averageUptime
    ) {
        uint256 openCount = 0;
        uint256 halfOpenCount = 0;
        uint256 closedCount = 0;
        uint256 totalUptime = 0;

        for (uint256 i = 0; i < activeCircuits.length; i++) {
            CircuitConfig memory config = circuitConfigs[activeCircuits[i]];
            CircuitMetrics memory metrics = circuitMetrics[activeCircuits[i]];

            if (config.currentState == CircuitState.OPEN) openCount++;
            else if (config.currentState == CircuitState.HALF_OPEN) halfOpenCount++;
            else if (config.currentState == CircuitState.CLOSED) closedCount++;

            totalUptime += metrics.averageDowntime;
        }

        uint256 avgUptime = activeCircuits.length > 0 ? totalUptime / activeCircuits.length : 0;

        return (
            activeCircuits.length,
            openCount,
            halfOpenCount,
            closedCount,
            avgUptime
        );
    }

    // ========== PRIVATE FUNCTIONS ==========

    /**
     * @dev Initialize Genesis Protocol circuits
     */
    function _initializeGenesisCircuits() private {
        // Initialize with core a-Tokens
        // These would be configured with appropriate thresholds in production

        // aZAR - South African Rand pegged token
        addCircuitBreaker("aZAR", 2000, 2 hours); // 20% volatility threshold

        // aUSD - USD pegged token
        addCircuitBreaker("aUSD", 1500, 1 hours); // 15% volatility threshold

        // Additional circuits can be added as new a-Tokens are deployed
    }

    /**
     * @dev Check if operation is allowed in HALF_OPEN state
     */
    function _isAllowedInHalfOpen(string memory operationType) private pure returns (bool) {
        // Allow limited operations during recovery testing
        bytes32 opHash = keccak256(abi.encodePacked(operationType));

        // Allow: small redemptions, deposits, status checks
        // Block: large redemptions, minting, complex operations
        return opHash == keccak256("deposit") ||
               opHash == keccak256("small_redemption") ||
               opHash == keccak256("status_check");
    }

    /**
     * @dev Check if operation is allowed in CLOSED state
     */
    function _isAllowedInClosed(string memory operationType) private pure returns (bool) {
        // Only critical operations during emergency halt
        bytes32 opHash = keccak256(abi.encodePacked(operationType));

        // Allow: status checks, emergency overrides
        // Block: all transactional operations
        return opHash == keccak256("status_check") ||
               opHash == keccak256("emergency_override");
    }

    /**
     * @dev Schedule automatic recovery attempt
     */
    function _scheduleRecoveryAttempt(bytes32 tokenSymbol) private {
        // In production, this would use a time-based automation system
        // For now, recovery must be manually triggered after timeout
    }

    /**
     * @dev Update average downtime calculation
     */
    function _updateAverageDowntime(bytes32 tokenSymbol) private {
        CircuitMetrics storage metrics = circuitMetrics[tokenSymbol];
        CircuitConfig storage config = circuitConfigs[tokenSymbol];

        uint256 downtime = block.timestamp - config.lastStateChange;

        if (metrics.averageDowntime == 0) {
            metrics.averageDowntime = downtime;
        } else {
            // Exponential moving average
            metrics.averageDowntime = (metrics.averageDowntime + downtime) / 2;
        }
    }
}