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
 * @title PIVC Taxation System
 * @dev Proof-of-Impact Value Creation taxation for ecosystem funding.
 *
 * Azora Sovereignty Protocol - Layer 3: The Economy
 *
 * Implements a 5% Protocol-Integrated Value Capture on every transaction:
 * - 4% -> Growth Fund: Fuels Forge expansion and AZR buy-and-burn mechanism
 * - 1% -> UBO Fund: Powers Universal Basic Assets and Proof-of-Contribution system
 */

contract PIVCTaxation is Ownable, ReentrancyGuard {

    // ========== TAX STRUCTURES ==========

    /**
     * @dev Tax allocation structure
     */
    struct TaxAllocation {
        address recipient;      // Address to receive tax funds
        uint256 percentage;     // Percentage of tax revenue (basis points)
        string purpose;         // Description of fund usage
        bool isActive;          // Whether this allocation is active
    }

    /**
     * @dev Tax transaction record
     */
    struct TaxRecord {
        uint256 recordId;
        address taxpayer;
        address token;
        uint256 grossAmount;
        uint256 taxAmount;
        uint256 timestamp;
        string transactionType;
        bytes32 transactionHash;
    }

    /**
     * @dev Tax exemption structure
     */
    struct TaxExemption {
        address exemptAddress;
        string reason;
        uint256 expiryTimestamp;
        address grantedBy;
        bool isActive;
    }

    // ========== STATE VARIABLES ==========

    // Tax rate: 5% (500 basis points)
    uint256 public constant TAX_RATE = 500;

    // Tax allocations as per Genesis Protocol
    TaxAllocation[] public taxAllocations;

    // Tax records
    mapping(uint256 => TaxRecord) public taxRecords;
    uint256 public nextRecordId = 1;

    // Tax exemptions
    mapping(address => TaxExemption) public taxExemptions;

    // Authorized tax collectors (contracts that can collect taxes)
    mapping(address => bool) public authorizedCollectors;

    // Tax revenue tracking
    mapping(address => uint256) public totalTaxCollected; // token => amount
    uint256 public totalTransactionsTaxed;

    // Emergency tax controls
    bool public taxationActive = true;
    uint256 public maxTaxPerTransaction = 1000000 * 10**18; // 1M tokens max tax per tx

    // ========== EVENTS ==========

    event TaxCollected(
        uint256 indexed recordId,
        address indexed taxpayer,
        address indexed token,
        uint256 grossAmount,
        uint256 taxAmount,
        string transactionType
    );

    event TaxDistributed(
        address indexed token,
        address indexed recipient,
        uint256 amount,
        string purpose
    );

    event TaxExemptionGranted(
        address indexed exemptAddress,
        string reason,
        uint256 expiryTimestamp
    );

    event TaxExemptionRevoked(
        address indexed exemptAddress,
        string reason
    );

    event TaxAllocationUpdated(
        uint256 indexed index,
        address recipient,
        uint256 percentage,
        string purpose
    );

    event EmergencyTaxControl(
        bool taxationActive,
        string reason
    );

    // ========== CONSTRUCTOR ==========

    constructor() Ownable(msg.sender) {
        _initializeTaxAllocations();
    }

    // ========== TAX COLLECTION ==========

    /**
     * @dev Collect tax on a transaction
     * Called by authorized tax collectors (e.g., Citadel, Mint contracts)
     */
    function collectTax(
        address taxpayer,
        address token,
        uint256 grossAmount,
        string calldata transactionType
    ) external nonReentrant returns (uint256 taxAmount) {
        require(authorizedCollectors[msg.sender], "Not authorized to collect tax");
        require(taxationActive, "Taxation is currently inactive");
        require(grossAmount > 0, "Invalid gross amount");

        // Check for tax exemption
        if (_isTaxExempt(taxpayer)) {
            return 0;
        }

        // Calculate tax amount (5%)
        taxAmount = (grossAmount * TAX_RATE) / 10000;

        // Cap maximum tax per transaction for safety
        if (taxAmount > maxTaxPerTransaction) {
            taxAmount = maxTaxPerTransaction;
        }

        require(taxAmount > 0, "Tax amount too small");

        // Transfer tax from taxpayer to this contract
        IERC20(token).transferFrom(taxpayer, address(this), taxAmount);

        // Record the tax transaction
        uint256 recordId = nextRecordId++;
        taxRecords[recordId] = TaxRecord({
            recordId: recordId,
            taxpayer: taxpayer,
            token: token,
            grossAmount: grossAmount,
            taxAmount: taxAmount,
            timestamp: block.timestamp,
            transactionType: transactionType,
            transactionHash: keccak256(abi.encodePacked(taxpayer, token, grossAmount, block.timestamp))
        });

        // Update tracking
        totalTaxCollected[token] += taxAmount;
        totalTransactionsTaxed++;

        // Distribute tax according to allocations
        _distributeTax(token, taxAmount);

        emit TaxCollected(recordId, taxpayer, token, grossAmount, taxAmount, transactionType);

        return taxAmount;
    }

    /**
     * @dev Calculate tax amount without collecting (for preview)
     */
    function calculateTax(uint256 grossAmount) external pure returns (uint256) {
        return (grossAmount * TAX_RATE) / 10000;
    }

    /**
     * @dev Check if an address is tax exempt
     */
    function isTaxExempt(address account) external view returns (bool) {
        return _isTaxExempt(account);
    }

    // ========== TAX DISTRIBUTION ==========

    /**
     * @dev Distribute collected tax according to allocations
     */
    function _distributeTax(address token, uint256 totalTaxAmount) private {
        uint256 remainingAmount = totalTaxAmount;

        for (uint256 i = 0; i < taxAllocations.length; i++) {
            TaxAllocation memory allocation = taxAllocations[i];

            if (!allocation.isActive) continue;

            uint256 allocationAmount = (totalTaxAmount * allocation.percentage) / 10000;

            if (allocationAmount > 0 && remainingAmount >= allocationAmount) {
                IERC20(token).transfer(allocation.recipient, allocationAmount);
                remainingAmount -= allocationAmount;

                emit TaxDistributed(token, allocation.recipient, allocationAmount, allocation.purpose);
            }
        }

        // Any remaining amount (due to rounding) goes to Growth Fund
        if (remainingAmount > 0) {
            // Find Growth Fund allocation
            for (uint256 i = 0; i < taxAllocations.length; i++) {
                if (keccak256(abi.encodePacked(taxAllocations[i].purpose)) == keccak256(abi.encodePacked("Growth Fund - Forge expansion and AZR buy-and-burn"))) {
                    IERC20(token).transfer(taxAllocations[i].recipient, remainingAmount);
                    emit TaxDistributed(token, taxAllocations[i].recipient, remainingAmount, "Growth Fund (rounding)");
                    break;
                }
            }
        }
    }

    /**
     * @dev Manually trigger tax distribution for accumulated funds
     * Emergency function for stuck funds
     */
    function emergencyDistributeTax(address token) external onlyOwner {
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance > 0, "No funds to distribute");

        _distributeTax(token, contractBalance);
    }

    // ========== TAX ALLOCATIONS MANAGEMENT ==========

    /**
     * @dev Update tax allocation
     */
    function updateTaxAllocation(
        uint256 index,
        address recipient,
        uint256 percentage,
        string calldata purpose
    ) external onlyOwner {
        require(index < taxAllocations.length, "Invalid allocation index");
        require(recipient != address(0), "Invalid recipient address");
        require(percentage <= 10000, "Percentage cannot exceed 100%");

        taxAllocations[index].recipient = recipient;
        taxAllocations[index].percentage = percentage;
        taxAllocations[index].purpose = purpose;
        taxAllocations[index].isActive = true;

        // Verify total allocations don't exceed 100%
        _verifyAllocationsTotal();

        emit TaxAllocationUpdated(index, recipient, percentage, purpose);
    }

    /**
     * @dev Add new tax allocation
     */
    function addTaxAllocation(
        address recipient,
        uint256 percentage,
        string calldata purpose
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        require(percentage <= 10000, "Percentage cannot exceed 100%");

        taxAllocations.push(TaxAllocation({
            recipient: recipient,
            percentage: percentage,
            purpose: purpose,
            isActive: true
        }));

        // Verify total allocations don't exceed 100%
        _verifyAllocationsTotal();

        emit TaxAllocationUpdated(taxAllocations.length - 1, recipient, percentage, purpose);
    }

    /**
     * @dev Deactivate tax allocation
     */
    function deactivateTaxAllocation(uint256 index) external onlyOwner {
        require(index < taxAllocations.length, "Invalid allocation index");
        taxAllocations[index].isActive = false;

        emit TaxAllocationUpdated(index, taxAllocations[index].recipient, 0, "Deactivated");
    }

    // ========== TAX EXEMPTIONS ==========

    /**
     * @dev Grant tax exemption
     */
    function grantTaxExemption(
        address exemptAddress,
        string calldata reason,
        uint256 durationSeconds
    ) external onlyOwner {
        require(exemptAddress != address(0), "Invalid address");
        require(durationSeconds > 0, "Invalid duration");

        taxExemptions[exemptAddress] = TaxExemption({
            exemptAddress: exemptAddress,
            reason: reason,
            expiryTimestamp: block.timestamp + durationSeconds,
            grantedBy: msg.sender,
            isActive: true
        });

        emit TaxExemptionGranted(exemptAddress, reason, block.timestamp + durationSeconds);
    }

    /**
     * @dev Revoke tax exemption
     */
    function revokeTaxExemption(address exemptAddress) external onlyOwner {
        require(taxExemptions[exemptAddress].isActive, "Address not exempt");

        string memory reason = taxExemptions[exemptAddress].reason;
        taxExemptions[exemptAddress].isActive = false;

        emit TaxExemptionRevoked(exemptAddress, reason);
    }

    // ========== AUTHORIZATION MANAGEMENT ==========

    /**
     * @dev Authorize a contract to collect taxes
     */
    function authorizeCollector(address collector) external onlyOwner {
        require(collector != address(0), "Invalid collector address");
        authorizedCollectors[collector] = true;
    }

    /**
     * @dev Revoke collector authorization
     */
    function revokeCollector(address collector) external onlyOwner {
        authorizedCollectors[collector] = false;
    }

    // ========== EMERGENCY CONTROLS ==========

    /**
     * @dev Emergency toggle for taxation system
     */
    function setTaxationActive(bool active, string calldata reason) external onlyOwner {
        taxationActive = active;
        emit EmergencyTaxControl(active, reason);
    }

    /**
     * @dev Update maximum tax per transaction
     */
    function setMaxTaxPerTransaction(uint256 maxTax) external onlyOwner {
        require(maxTax > 0, "Invalid max tax amount");
        maxTaxPerTransaction = maxTax;
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Get tax allocation details
     */
    function getTaxAllocations() external view returns (TaxAllocation[] memory) {
        return taxAllocations;
    }

    /**
     * @dev Get tax statistics
     */
    function getTaxStatistics() external view returns (
        uint256 _totalTransactionsTaxed,
        uint256 _taxRate,
        uint256 _activeAllocations,
        bool _taxationActive
    ) {
        uint256 activeAllocations = 0;
        for (uint256 i = 0; i < taxAllocations.length; i++) {
            if (taxAllocations[i].isActive) activeAllocations++;
        }

        return (
            totalTransactionsTaxed,
            TAX_RATE,
            activeAllocations,
            taxationActive
        );
    }

    /**
     * @dev Get tax record details
     */
    function getTaxRecord(uint256 recordId) external view returns (TaxRecord memory) {
        return taxRecords[recordId];
    }

    /**
     * @dev Get total tax collected for a token
     */
    function getTotalTaxCollected(address token) external view returns (uint256) {
        return totalTaxCollected[token];
    }

    // ========== PRIVATE FUNCTIONS ==========

    /**
     * @dev Initialize tax allocations according to Azora Sovereignty Protocol
     */
    function _initializeTaxAllocations() private {
        // Azora Sovereignty Protocol PIVC allocations:
        // - Growth Fund: 4% (4000 basis points) - Fuels Forge expansion and AZR buy-and-burn
        // - UBO Fund: 1% (1000 basis points) - Powers Universal Basic Assets and Proof-of-Contribution

        // Note: In production, these would be actual deployed contract addresses
        // For now, using placeholder addresses

        taxAllocations.push(TaxAllocation({
            recipient: address(0x2222222222222222222222222222222222222222), // Growth Fund
            percentage: 4000, // 4% - 4000 basis points
            purpose: "Growth Fund - Forge expansion and AZR buy-and-burn",
            isActive: true
        }));

        taxAllocations.push(TaxAllocation({
            recipient: address(0x7777777777777777777777777777777777777777), // UBO Fund
            percentage: 1000, // 1% - 1000 basis points
            purpose: "UBO Fund - Universal Basic Assets and Proof-of-Contribution",
            isActive: true
        }));
    }

    /**
     * @dev Check if address is tax exempt
     */
    function _isTaxExempt(address account) private view returns (bool) {
        TaxExemption memory exemption = taxExemptions[account];
        return exemption.isActive && block.timestamp <= exemption.expiryTimestamp;
    }

    /**
     * @dev Verify that total tax allocations don't exceed 100%
     */
    function _verifyAllocationsTotal() private view {
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < taxAllocations.length; i++) {
            if (taxAllocations[i].isActive) {
                totalPercentage += taxAllocations[i].percentage;
            }
        }
        require(totalPercentage <= 10000, "Total allocations exceed 100%");
    }
}