// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract KYC {
    address public owner;
    mapping(address => bool) public verified;

    constructor() {
        owner = msg.sender;
    }

    function verify(address user) external {
        require(msg.sender == owner, "Unauthorized");
        verified[user] = true;
    }
}
