// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockConstitutionalCourt
 * @dev Mock constitutional court for testing Stability Fund approvals
 */
contract MockConstitutionalCourt is Ownable {
    mapping(uint256 => bool) public approvedRequests;

    event WithdrawalApproved(uint256 indexed requestId, address indexed approver);

    constructor() Ownable(msg.sender) {}

    function approveWithdrawal(uint256 requestId) external onlyOwner {
        approvedRequests[requestId] = true;
        emit WithdrawalApproved(requestId, msg.sender);
    }

    function isApproved(uint256 requestId) external view returns (bool) {
        return approvedRequests[requestId];
    }

    // Simulate supermajority approval
    function getApprovalCount(uint256 requestId) external pure returns (uint256) {
        // Mock: always return 5 approvals (above supermajority threshold)
        return 5;
    }
}