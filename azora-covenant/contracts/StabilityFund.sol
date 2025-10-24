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
 * @title Stability Fund Mechanism
 * @dev Automated reserve building system for economic stability.
 *
 * Genesis Protocol - Part II: Stability Fund Mechanism
 *
 * Diverts 25% of Growth Fund revenues to build crisis reserves:
 * - Activated during market stress (Circuit Breaker triggers)
 * - Builds reserves across multiple asset classes
 * - Provides liquidity during recovery periods
 * - Constitutional supermajority required for withdrawals
 */

contract StabilityFund is Ownable, ReentrancyGuard {

    // ========== FUND STRUCTURES ==========

    /**
     * @dev Stability fund allocation structure
     */
    struct FundAllocation {
        address asset;           // Asset address (ERC20 or native)
        uint256 targetPercentage; // Target allocation (basis points)
        uint256 currentBalance;  // Current balance in fund
        uint256 totalDeposited;  // Total deposited over time
        uint256 totalWithdrawn;  // Total withdrawn over time
        bool isActive;          // Whether this asset is active in fund
    }

    /**
     * @dev Fund activation trigger
     */
    struct FundTrigger {
        bytes32 triggerId;
        string description;
        uint256 activationTime;
        uint256 deactivationTime;
        uint256 totalDiverted;
        bool isActive;
    }

    /**
     * @dev Withdrawal request requiring constitutional approval
     */
    struct WithdrawalRequest {
        uint256 requestId;
        address requester;
        address asset;
        uint256 amount;
        string purpose;
        uint256 requestTime;
        uint256 approvalDeadline;
        uint256 approvalsReceived;
        uint256 approvalsRequired; // Supermajority threshold
        bool executed;
        mapping(address => bool) approvals;
    }

    // ========== STATE VARIABLES ==========

    // Fund allocations (25% diverted from Growth Fund)
    mapping(address => FundAllocation) public fundAllocations;
    address[] public activeAssets;

    // Fund triggers (activated by Circuit Breakers)
    mapping(bytes32 => FundTrigger) public fundTriggers;
    bytes32[] public activeTriggers;

    // Withdrawal requests
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    uint256 public nextRequestId = 1;

    // Core parameters
    uint256 public constant FUND_DIVERSION_RATE = 2500; // 25% (basis points)
    uint256 public constant SUPERVOTE_THRESHOLD = 667; // 66.7% supermajority
    uint256 public constant WITHDRAWAL_DEADLINE = 7 days;
    uint256 public constant MAX_WITHDRAWAL_PERCENT = 1000; // 10% of fund per withdrawal

    // Authorized entities
    address public growthFund;           // Source of diverted funds
    address public circuitBreaker;       // Circuit breaker system
    address public constitutionalCourt;  // Guardian Oracles for approvals
    mapping(address => bool) public fundManagers; // Authorized fund managers

    // Fund metrics
    uint256 public totalDeposited;
    uint256 public totalWithdrawn;
    uint256 public currentFundValue;
    uint256 public lastRebalancing;

    // ========== EVENTS ==========

    event FundActivated(
        bytes32 indexed triggerId,
        string description,
        uint256 divertedAmount
    );

    event FundDeactivated(
        bytes32 indexed triggerId,
        uint256 totalDiverted
    );

    event FundsDiverted(
        address indexed asset,
        uint256 amount,
        bytes32 indexed triggerId
    );

    event WithdrawalRequested(
        uint256 indexed requestId,
        address indexed asset,
        uint256 amount,
        string purpose
    );

    event WithdrawalApproved(
        uint256 indexed requestId,
        address indexed approver
    );

    event WithdrawalExecuted(
        uint256 indexed requestId,
        address indexed asset,
        uint256 amount,
        address recipient
    );

    event FundRebalanced(
        address[] assets,
        uint256[] amounts
    );

    // ========== CONSTRUCTOR ==========

    constructor(
        address _growthFund,
        address _circuitBreaker,
        address _constitutionalCourt
    ) Ownable(msg.sender) {
        require(_growthFund != address(0), "Invalid growth fund address");
        require(_circuitBreaker != address(0), "Invalid circuit breaker address");
        require(_constitutionalCourt != address(0), "Invalid court address");

        growthFund = _growthFund;
        circuitBreaker = _circuitBreaker;
        constitutionalCourt = _constitutionalCourt;

        _initializeFundAllocations();
    }

    // ========== FUND ACTIVATION ==========

    /**
     * @dev Activate stability fund diversion (called by Circuit Breaker)
     */
    function activateFundDiversion(
        bytes32 triggerId,
        string calldata description
    ) external {
        require(msg.sender == circuitBreaker || owner() == msg.sender, "Unauthorized activation");
        require(!fundTriggers[triggerId].isActive, "Trigger already active");

        fundTriggers[triggerId] = FundTrigger({
            triggerId: triggerId,
            description: description,
            activationTime: block.timestamp,
            deactivationTime: 0,
            totalDiverted: 0,
            isActive: true
        });

        activeTriggers.push(triggerId);

        emit FundActivated(triggerId, description, 0);
    }

    /**
     * @dev Deactivate fund diversion when crisis passes
     */
    function deactivateFundDiversion(bytes32 triggerId) external {
        require(msg.sender == circuitBreaker || owner() == msg.sender, "Unauthorized deactivation");
        require(fundTriggers[triggerId].isActive, "Trigger not active");

        FundTrigger storage trigger = fundTriggers[triggerId];
        trigger.deactivationTime = block.timestamp;
        trigger.isActive = false;

        // Remove from active triggers
        for (uint256 i = 0; i < activeTriggers.length; i++) {
            if (activeTriggers[i] == triggerId) {
                activeTriggers[i] = activeTriggers[activeTriggers.length - 1];
                activeTriggers.pop();
                break;
            }
        }

        emit FundDeactivated(triggerId, trigger.totalDiverted);
    }

    /**
     * @dev Divert funds from Growth Fund to Stability Fund
     * Called automatically when Growth Fund receives revenues
     */
    function divertFunds(
        address asset,
        uint256 incomingAmount
    ) external nonReentrant {
        require(msg.sender == growthFund, "Only Growth Fund can divert");
        require(fundAllocations[asset].isActive, "Asset not in fund allocation");

        // Calculate diversion amount (25% of incoming)
        uint256 diversionAmount = (incomingAmount * FUND_DIVERSION_RATE) / 10000;

        // Check if there's an active trigger
        bool hasActiveTrigger = false;
        bytes32 activeTriggerId;

        for (uint256 i = 0; i < activeTriggers.length; i++) {
            if (fundTriggers[activeTriggers[i]].isActive) {
                hasActiveTrigger = true;
                activeTriggerId = activeTriggers[i];
                break;
            }
        }

        if (!hasActiveTrigger) {
            // No active crisis, but still divert small amount for baseline reserves
            diversionAmount = diversionAmount / 4; // 6.25% baseline diversion
        }

        if (diversionAmount == 0) return;

        // Transfer funds from Growth Fund to Stability Fund
        IERC20(asset).transferFrom(growthFund, address(this), diversionAmount);

        // Update fund allocation
        FundAllocation storage allocation = fundAllocations[asset];
        allocation.currentBalance += diversionAmount;
        allocation.totalDeposited += diversionAmount;

        // Update trigger if active
        if (hasActiveTrigger) {
            fundTriggers[activeTriggerId].totalDiverted += diversionAmount;
        }

        totalDeposited += diversionAmount;
        currentFundValue += diversionAmount;

        emit FundsDiverted(asset, diversionAmount, activeTriggerId);
    }

    // ========== WITHDRAWAL SYSTEM ==========

    /**
     * @dev Request withdrawal from stability fund (requires constitutional approval)
     */
    function requestWithdrawal(
        address asset,
        uint256 amount,
        string calldata purpose
    ) external {
        require(fundManagers[msg.sender] || owner() == msg.sender, "Not authorized to request withdrawal");
        require(fundAllocations[asset].isActive, "Asset not in fund");
        require(amount <= fundAllocations[asset].currentBalance, "Insufficient balance");
        require(amount <= (currentFundValue * MAX_WITHDRAWAL_PERCENT) / 10000, "Exceeds max withdrawal percentage");

        uint256 requestId = nextRequestId++;
        WithdrawalRequest storage request = withdrawalRequests[requestId];

        request.requestId = requestId;
        request.requester = msg.sender;
        request.asset = asset;
        request.amount = amount;
        request.purpose = purpose;
        request.requestTime = block.timestamp;
        request.approvalDeadline = block.timestamp + WITHDRAWAL_DEADLINE;
        request.approvalsRequired = _calculateSupermajorityThreshold();
        request.executed = false;

        emit WithdrawalRequested(requestId, asset, amount, purpose);
    }

    /**
     * @dev Approve withdrawal request (Constitutional Court or authorized entities)
     */
    function approveWithdrawal(uint256 requestId) external {
        require(msg.sender == constitutionalCourt || fundManagers[msg.sender] || owner() == msg.sender, "Not authorized to approve");

        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requestId != 0, "Request not found");
        require(!request.executed, "Request already executed");
        require(block.timestamp <= request.approvalDeadline, "Approval deadline passed");
        require(!request.approvals[msg.sender], "Already approved");

        request.approvals[msg.sender] = true;
        request.approvalsReceived++;

        emit WithdrawalApproved(requestId, msg.sender);

        // Auto-execute if supermajority reached
        if (request.approvalsReceived >= request.approvalsRequired) {
            _executeWithdrawal(requestId);
        }
    }

    /**
     * @dev Execute approved withdrawal
     */
    function executeWithdrawal(uint256 requestId) external {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requestId != 0, "Request not found");
        require(!request.executed, "Request already executed");
        require(request.approvalsReceived >= request.approvalsRequired, "Insufficient approvals");

        _executeWithdrawal(requestId);
    }

    // ========== FUND MANAGEMENT ==========

    /**
     * @dev Rebalance fund allocations
     */
    function rebalanceFund() external {
        require(fundManagers[msg.sender] || owner() == msg.sender, "Not authorized");

        // Calculate target allocations
        uint256 totalValue = currentFundValue;
        address[] memory assets = activeAssets;
        uint256[] memory targetAmounts = new uint256[](assets.length);

        for (uint256 i = 0; i < assets.length; i++) {
            FundAllocation storage allocation = fundAllocations[assets[i]];
            targetAmounts[i] = (totalValue * allocation.targetPercentage) / 10000;
        }

        // Execute rebalancing (simplified - in production would use DEX)
        // For now, just record the rebalancing event
        lastRebalancing = block.timestamp;

        emit FundRebalanced(assets, targetAmounts);
    }

    /**
     * @dev Add new asset to fund allocation
     */
    function addFundAsset(
        address asset,
        uint256 targetPercentage
    ) external onlyOwner {
        require(asset != address(0), "Invalid asset address");
        require(!fundAllocations[asset].isActive, "Asset already in fund");
        require(targetPercentage <= 10000, "Invalid percentage");

        fundAllocations[asset] = FundAllocation({
            asset: asset,
            targetPercentage: targetPercentage,
            currentBalance: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            isActive: true
        });

        activeAssets.push(asset);
    }

    /**
     * @dev Update fund manager authorization
     */
    function setFundManager(address manager, bool authorized) external onlyOwner {
        fundManagers[manager] = authorized;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get fund overview
     */
    function getFundOverview() external view returns (
        uint256 _totalDeposited,
        uint256 _totalWithdrawn,
        uint256 _currentValue,
        uint256 _activeTriggers,
        uint256 _pendingRequests
    ) {
        uint256 pendingCount = 0;
        for (uint256 i = 1; i < nextRequestId; i++) {
            if (!withdrawalRequests[i].executed) {
                pendingCount++;
            }
        }

        return (
            totalDeposited,
            totalWithdrawn,
            currentFundValue,
            activeTriggers.length,
            pendingCount
        );
    }

    /**
     * @dev Get withdrawal request details
     */
    function getWithdrawalRequest(uint256 requestId) external view returns (
        address requester,
        address asset,
        uint256 amount,
        string memory purpose,
        uint256 approvalsReceived,
        uint256 approvalsRequired,
        bool executed
    ) {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        return (
            request.requester,
            request.asset,
            request.amount,
            request.purpose,
            request.approvalsReceived,
            request.approvalsRequired,
            request.executed
        );
    }

    /**
     * @dev Get active fund triggers
     */
    function getActiveTriggers() external view returns (bytes32[] memory) {
        return activeTriggers;
    }

    // ========== PRIVATE FUNCTIONS ==========

    /**
     * @dev Initialize fund allocations with Genesis Protocol assets
     */
    function _initializeFundAllocations() private {
        // AZR token (40% target allocation)
        // In production, these would be actual deployed token addresses
        address azrToken = address(0x1234567890123456789012345678901234567890); // Placeholder
        addFundAsset(azrToken, 4000); // 40%

        // USDC (30% target allocation)
        address usdcToken = address(0xabcdefabcdefabcdefabcdefabcdefabcdefabcd); // Placeholder
        addFundAsset(usdcToken, 3000); // 30%

        // Real World Assets (20% target allocation)
        address rwaToken = address(0xfedcba0987654321fedcba0987654321fedcba0987); // Placeholder
        addFundAsset(rwaToken, 2000); // 20%

        // Gold-backed token (10% target allocation)
        address goldToken = address(0x1111111111111111111111111111111111111111); // Placeholder
        addFundAsset(goldToken, 1000); // 10%
    }

    /**
     * @dev Calculate supermajority threshold for withdrawals
     */
    function _calculateSupermajorityThreshold() private view returns (uint256) {
        // In production, this would query the Constitutional Court
        // for the current number of authorized approvers
        // For now, return a fixed threshold
        return 5; // Require 5 approvals for supermajority
    }

    /**
     * @dev Execute withdrawal after approval
     */
    function _executeWithdrawal(uint256 requestId) private nonReentrant {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(!request.executed, "Already executed");

        // Transfer funds
        IERC20(request.asset).transfer(request.requester, request.amount);

        // Update fund tracking
        FundAllocation storage allocation = fundAllocations[request.asset];
        allocation.currentBalance -= request.amount;
        allocation.totalWithdrawn += request.amount;

        totalWithdrawn += request.amount;
        currentFundValue -= request.amount;

        request.executed = true;

        emit WithdrawalExecuted(requestId, request.asset, request.amount, request.requester);
    }
}