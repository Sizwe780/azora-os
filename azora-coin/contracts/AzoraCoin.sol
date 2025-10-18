// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AzoraCoin
 * @dev Azora OS Native Token - Fixed at $1.00 USD value
 * Maximum Supply: 1,000,000 AZR
 * Initial Value: $1.00 USD per AZR
 */
contract AzoraCoin is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BOARD_ROLE = keccak256("BOARD_ROLE");
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant DAILY_MINT_LIMIT = 10_000 * 10**18; // 10k per day
    uint256 public constant USD_VALUE = 1 * 10**18; // $1.00 USD (18 decimals)
    uint256 public constant FOUNDER_WITHDRAWAL_LIMIT = 100 * 10**18; // $100
    uint256 public constant REQUIRED_APPROVALS = 2;
    
    // Tracking
    uint256 public lastMintTimestamp;
    uint256 public dailyMintedAmount;
    uint256 public totalStudentsJoined;
    uint256 public totalFounders;
    
    // Founder withdrawal tracking
    struct WithdrawalRequest {
        address founder;
        uint256 amount;
        uint256 approvals;
        bool executed;
        mapping(address => bool) hasApproved;
    }
    
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    uint256 public withdrawalRequestCount;
    
    // Founder balances
    mapping(address => uint256) public founderAllocations;
    mapping(address => uint256) public founderWithdrawn;
    
    // Events
    event StudentJoined(address indexed student, uint256 bonusAmount);
    event StudentRewarded(address indexed student, uint256 amount, string reason);
    event FounderAllocated(address indexed founder, uint256 amount);
    event WithdrawalRequested(uint256 indexed requestId, address indexed founder, uint256 amount);
    event WithdrawalApproved(uint256 indexed requestId, address indexed approver);
    event WithdrawalExecuted(uint256 indexed requestId, address indexed founder, uint256 amount);
    event ValueStabilized(uint256 timestamp, uint256 price);
    
    constructor(
        address defaultAdmin,
        address azoraAddress
    ) ERC20("Azora Coin", "AZR") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, azoraAddress);
        _grantRole(BOARD_ROLE, defaultAdmin);
        
        lastMintTimestamp = block.timestamp;
    }
    
    /**
     * @dev Register a new student and mint signup bonus
     */
    function registerStudent(address student, uint256 bonusAmount) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        returns (bool) 
    {
        require(student != address(0), "Invalid student address");
        require(bonusAmount <= 10 * 10**18, "Bonus too high"); // Max 10 AZR signup bonus
        require(totalSupply() + bonusAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        _checkDailyMintLimit(bonusAmount);
        _mint(student, bonusAmount);
        
        totalStudentsJoined++;
        
        emit StudentJoined(student, bonusAmount);
        return true;
    }
    
    /**
     * @dev Reward student for activities
     */
    function rewardStudent(address student, uint256 amount, string memory reason) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
        returns (bool) 
    {
        require(student != address(0), "Invalid student address");
        require(amount <= 50 * 10**18, "Reward too high"); // Max 50 AZR per reward
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _checkDailyMintLimit(amount);
        _mint(student, amount);
        
        emit StudentRewarded(student, amount, reason);
        return true;
    }
    
    /**
     * @dev Allocate tokens to founder
     */
    function allocateToFounder(address founder, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        returns (bool) 
    {
        require(founder != address(0), "Invalid founder address");
        require(amount <= 10_000 * 10**18, "Allocation too high"); // Max 10k AZR per founder
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        
        _mint(address(this), amount); // Mint to contract for vesting
        founderAllocations[founder] += amount;
        
        if (founderAllocations[founder] == amount) {
            totalFounders++;
            _grantRole(FOUNDER_ROLE, founder);
        }
        
        emit FounderAllocated(founder, amount);
        return true;
    }
    
    /**
     * @dev Request founder withdrawal
     */
    function requestWithdrawal(uint256 amount) 
        external 
        onlyRole(FOUNDER_ROLE) 
        nonReentrant 
        returns (uint256) 
    {
        require(amount <= FOUNDER_WITHDRAWAL_LIMIT, "Exceeds withdrawal limit");
        require(founderAllocations[msg.sender] >= amount, "Insufficient allocation");
        require(founderAllocations[msg.sender] - founderWithdrawn[msg.sender] >= amount, "Already withdrawn");
        
        uint256 requestId = withdrawalRequestCount++;
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        request.founder = msg.sender;
        request.amount = amount;
        request.approvals = 0;
        request.executed = false;
        
        emit WithdrawalRequested(requestId, msg.sender, amount);
        return requestId;
    }
    
    /**
     * @dev Approve founder withdrawal
     */
    function approveWithdrawal(uint256 requestId) 
        external 
        onlyRole(BOARD_ROLE) 
        returns (bool) 
    {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(!request.executed, "Already executed");
        require(!request.hasApproved[msg.sender], "Already approved");
        
        request.hasApproved[msg.sender] = true;
        request.approvals++;
        
        emit WithdrawalApproved(requestId, msg.sender);
        
        // Auto-execute if enough approvals
        if (request.approvals >= REQUIRED_APPROVALS) {
            _executeWithdrawal(requestId);
        }
        
        return true;
    }
    
    /**
     * @dev Execute approved withdrawal
     */
    function _executeWithdrawal(uint256 requestId) internal {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.approvals >= REQUIRED_APPROVALS, "Not enough approvals");
        require(!request.executed, "Already executed");
        
        request.executed = true;
        founderWithdrawn[request.founder] += request.amount;
        
        // Transfer from contract to founder
        _transfer(address(this), request.founder, request.amount);
        
        emit WithdrawalExecuted(requestId, request.founder, request.amount);
    }
    
    /**
     * @dev Check and reset daily mint limit
     */
    function _checkDailyMintLimit(uint256 amount) internal {
        if (block.timestamp >= lastMintTimestamp + 1 days) {
            dailyMintedAmount = 0;
            lastMintTimestamp = block.timestamp;
        }
        
        require(dailyMintedAmount + amount <= DAILY_MINT_LIMIT, "Daily mint limit exceeded");
        dailyMintedAmount += amount;
    }
    
    /**
     * @dev Get token value in USD (always $1.00)
     */
    function getTokenValueUSD() external pure returns (uint256) {
        return USD_VALUE;
    }
    
    /**
     * @dev Get founder withdrawal info
     */
    function getFounderInfo(address founder) 
        external 
        view 
        returns (
            uint256 allocated,
            uint256 withdrawn,
            uint256 available
        ) 
    {
        allocated = founderAllocations[founder];
        withdrawn = founderWithdrawn[founder];
        available = allocated - withdrawn;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override transfer to enforce pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
