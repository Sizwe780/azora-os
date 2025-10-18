#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Azora OS Complete System Startup${NC}"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}ℹ️ Creating .env file from .env.example...${NC}"
  
  if [ -f ".env.example" ]; then
    cp .env.example .env
  else
    echo -e "${YELLOW}ℹ️ Creating default .env file...${NC}"
    cat > .env << 'ENVFILE'
# Azora OS Environment Variables
NODE_ENV=development
REACT_APP_API_URL=http://localhost:4000
REACT_APP_BLOCKCHAIN_URL=http://localhost:8545
REACT_APP_AZR_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
OPENAI_API_KEY=
BLOCKCHAIN_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
ENVFILE
  fi
  
  echo -e "${YELLOW}⚠️ Please update the .env file with your settings!${NC}"
fi

# Check for azora-coin .env file
if [ ! -f "azora-coin/.env" ]; then
  echo -e "${YELLOW}ℹ️ Creating azora-coin/.env file...${NC}"
  
  if [ -f "azora-coin/.env.example" ]; then
    cp azora-coin/.env.example azora-coin/.env
  else
    echo -e "${YELLOW}ℹ️ Creating default azora-coin/.env file...${NC}"
    mkdir -p azora-coin
    cat > azora-coin/.env << 'COINENV'
# Network URLs
GOERLI_URL=https://eth-goerli.alchemyapi.io/v2/your-api-key
MUMBAI_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key

# Private Keys - DO NOT SHARE OR COMMIT ACTUAL KEYS!
PRIVATE_KEY=0xYourPrivateKeyHere

# API Keys
ETHERSCAN_API_KEY=YourEtherscanApiKey

# Deployment
DEPLOYER_ADDRESS=0xYourDeployerAddress
AZORA_ADDRESS=0xAzoraAIAddress
BOARD_MEMBER1=0xBoardMember1Address
BOARD_MEMBER2=0xBoardMember2Address
BOARD_MEMBER3=0xBoardMember3Address
BOARD_MEMBER4=0xBoardMember4Address
BOARD_MEMBER5=0xBoardMember5Address
COINENV
  fi
  
  echo -e "${YELLOW}⚠️ Please update the azora-coin/.env file with your blockchain settings!${NC}"
fi

# Set up Azora Coin
echo -e "${GREEN}💰 Setting up Azora Coin...${NC}"
cd azora-coin

# Check if contracts directory exists
if [ ! -d "contracts" ]; then
  mkdir -p contracts
  
  # Create AzoraCoin contract if it doesn't exist
  if [ ! -f "contracts/AzoraCoin.sol" ]; then
    echo -e "${YELLOW}ℹ️ Creating Azora Coin smart contract...${NC}"
    cat > contracts/AzoraCoin.sol << 'SOLFILE'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AzoraCoin
 * @dev Implementation of the Azora Coin with a 1 million max supply
 * Based on Article XII of the Azora Constitution: Proof of Compliance minting
 */
contract AzoraCoin is ERC20, AccessControl, Pausable {
    using ECDSA for bytes32;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant BOARD_ROLE = keccak256("BOARD_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens with 18 decimals
    uint256 public dailyMintLimit = 10000 * 10**18; // 10,000 tokens per day
    uint256 public requiredApprovals = 2; // Multi-sig requirement
    
    struct MintRequest {
        address recipient;
        uint256 amount;
        bytes32 complianceRecordHash;
        uint256 timestamp;
        uint256 approvals;
        bool executed;
        mapping(address => bool) hasApproved;
    }
    
    mapping(bytes32 => MintRequest) public mintRequests;
    mapping(bytes32 => bool) public complianceRecords;
    
    uint256 public dailyMinted;
    uint256 public lastResetTimestamp;
    
    event MintRequested(bytes32 indexed requestId, address indexed recipient, uint256 amount, bytes32 complianceRecordHash);
    event MintApproved(bytes32 indexed requestId, address indexed approver);
    event MintExecuted(bytes32 indexed requestId, address indexed recipient, uint256 amount);
    event ComplianceRecordProcessed(bytes32 indexed recordHash, address indexed verifier);
    
    constructor(address admin, address azora) ERC20("Azora Coin", "AZR") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(BOARD_ROLE, admin);
        
        // Grant AZORA AI the roles
        _grantRole(MINTER_ROLE, azora);
        _grantRole(COMPLIANCE_ROLE, azora);
        _grantRole(BOARD_ROLE, azora);
        
        // Initialize time tracking
        lastResetTimestamp = block.timestamp;
    }
    
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    function resetDailyLimit() internal {
        if (block.timestamp >= lastResetTimestamp + 1 days) {
            dailyMinted = 0;
            lastResetTimestamp = block.timestamp;
        }
    }
    
    function proposeMint(
        address recipient, 
        uint256 amount, 
        bytes32 complianceRecordHash,
        bytes calldata complianceProof
    ) public onlyRole(MINTER_ROLE) whenNotPaused returns (bytes32) {
        require(recipient != address(0), "AzoraCoin: mint to the zero address");
        require(amount > 0, "AzoraCoin: amount must be positive");
        require(totalSupply() + amount <= MAX_SUPPLY, "AzoraCoin: exceeds max supply");
        
        resetDailyLimit();
        require(dailyMinted + amount <= dailyMintLimit, "AzoraCoin: exceeds daily mint limit");
        
        // Verify compliance record if not already verified
        if (!complianceRecords[complianceRecordHash]) {
            // In production, verify the proof against the hash
            // For now, we just mark it as verified
            complianceRecords[complianceRecordHash] = true;
            emit ComplianceRecordProcessed(complianceRecordHash, msg.sender);
        }
        
        bytes32 requestId = keccak256(abi.encodePacked(
            recipient, 
            amount, 
            complianceRecordHash, 
            block.timestamp, 
            msg.sender
        ));
        
        MintRequest storage request = mintRequests[requestId];
        request.recipient = recipient;
        request.amount = amount;
        request.complianceRecordHash = complianceRecordHash;
        request.timestamp = block.timestamp;
        request.approvals = 1; // Creator counts as first approval
        request.executed = false;
        request.hasApproved[msg.sender] = true;
        
        emit MintRequested(requestId, recipient, amount, complianceRecordHash);
        
        // Auto-execute if only one approval required
        if (requiredApprovals == 1) {
            executeMint(requestId);
        }
        
        return requestId;
    }
    
    function approveMint(bytes32 requestId) public onlyRole(BOARD_ROLE) whenNotPaused {
        MintRequest storage request = mintRequests[requestId];
        
        require(request.timestamp > 0, "AzoraCoin: request does not exist");
        require(!request.executed, "AzoraCoin: already executed");
        require(!request.hasApproved[msg.sender], "AzoraCoin: already approved");
        
        request.approvals += 1;
        request.hasApproved[msg.sender] = true;
        
        emit MintApproved(requestId, msg.sender);
        
        if (request.approvals >= requiredApprovals) {
            executeMint(requestId);
        }
    }
    
    function executeMint(bytes32 requestId) internal {
        MintRequest storage request = mintRequests[requestId];
        
        require(request.timestamp > 0, "AzoraCoin: request does not exist");
        require(!request.executed, "AzoraCoin: already executed");
        require(request.approvals >= requiredApprovals, "AzoraCoin: insufficient approvals");
        
        request.executed = true;
        dailyMinted += request.amount;
        
        _mint(request.recipient, request.amount);
        
        emit MintExecuted(requestId, request.recipient, request.amount);
    }
    
    function setDailyMintLimit(uint256 newLimit) public onlyRole(DEFAULT_ADMIN_ROLE) {
        dailyMintLimit = newLimit;
    }
    
    function setRequiredApprovals(uint256 newRequired) public onlyRole(DEFAULT_ADMIN_ROLE) {
        requiredApprovals = newRequired;
    }
    
    // Required override for compatibility
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // Required overrides for compatibility
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
SOLFILE
  fi

  # Install dependencies and compile
  echo -e "${GREEN}📦 Installing Azora Coin dependencies...${NC}"
  npm install --silent @openzeppelin/contracts hardhat @nomicfoundation/hardhat-toolbox dotenv

  echo -e "${GREEN}🔨 Compiling Azora Coin contract...${NC}"
  npx hardhat compile
fi

cd ..

# Create contract ABI file
echo -e "${GREEN}📝 Creating Azora Coin ABI...${NC}"
mkdir -p apps/main-app/src/contracts
cat > apps/main-app/src/contracts/azoraCoin.js << 'ABIFILE'
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
ABIFILE

# Start services with Docker Compose
echo -e "${GREEN}🐳 Starting services with Docker Compose...${NC}"
docker-compose build
docker-compose up -d

# Wait for services to start
echo -e "${GREEN}⏳ Waiting for services to start...${NC}"
sleep 5

# Display service status
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose ps

# Start main-app
echo -e "${GREEN}🚀 Starting main app...${NC}"
cd apps/main-app
npm install
npm run dev &

echo ""
echo -e "${GREEN}✅ Azora OS started successfully!${NC}"
echo ""
echo "Access the application at: http://localhost:5173"
echo ""
echo "Services running:"
echo " - AZORA AI: http://localhost:4060"
echo " - Compliance Service: http://localhost:4081"
echo " - Azora Coin Integration: http://localhost:4092"
echo " - Blockchain: http://localhost:8545"
echo ""
echo -e "${YELLOW}Use ./check-full-compliance.sh to verify constitutional compliance${NC}"
echo ""
