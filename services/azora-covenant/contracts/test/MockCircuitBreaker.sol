// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockCircuitBreaker
 * @dev Mock circuit breaker for testing Stability Fund
 */
contract MockCircuitBreaker is Ownable {
    mapping(bytes32 => bool) public activeTriggers;

    event FundActivated(bytes32 indexed triggerId, string description);

    constructor() Ownable(msg.sender) {}

    function activateFund(bytes32 triggerId, string calldata description) external onlyOwner {
        activeTriggers[triggerId] = true;
        emit FundActivated(triggerId, description);
    }

    function deactivateFund(bytes32 triggerId) external onlyOwner {
        activeTriggers[triggerId] = false;
    }

    function isTriggerActive(bytes32 triggerId) external view returns (bool) {
        return activeTriggers[triggerId];
    }
}