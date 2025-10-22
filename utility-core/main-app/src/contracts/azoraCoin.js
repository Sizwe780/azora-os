/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// AzoraCoin ABI - used for interacting with the Azora Coin smart contract
export const azoraCoinABI = [
  // Basic ERC20 functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Custom AzoraCoin functions
  "function proposeMint(address recipient, uint256 amount, bytes32 complianceRecordHash, bytes complianceProof) returns (bytes32)",
  "function approveMint(bytes32 requestId)",
  "function executeMint(bytes32 requestId)",
  "function complianceRecords(bytes32) view returns (bool)",
  "function requiredApprovals() view returns (uint256)",
  "function dailyMintLimit() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event MintRequested(bytes32 indexed requestId, address indexed recipient, uint256 amount, bytes32 complianceRecordHash)",
  "event MintApproved(bytes32 indexed requestId, address indexed approver)",
  "event MintExecuted(bytes32 indexed requestId, address indexed recipient, uint256 amount)",
  "event ComplianceRecordProcessed(bytes32 indexed recordHash, address indexed verifier)"
];
