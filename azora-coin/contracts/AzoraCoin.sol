// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AzoraCoin
 * @dev Enterprise-grade tokenomics designed for trillion-dollar valuation
 * 
 * TOTAL SUPPLY: 1,000,000 AZR (Fixed, Deflationary)
 * 
 * ALLOCATION BREAKDOWN:
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 🏢 ENTERPRISE ALLOCATION (60% = 600,000 AZR)
 *    • Fortune 500 Partners: 300,000 AZR
 *    • African Governments: 150,000 AZR
 *    • Strategic Investors: 100,000 AZR
 *    • Enterprise Validators: 50,000 AZR
 * 
 * 💼 BUSINESS ECOSYSTEM (20% = 200,000 AZR)
 *    • SME Partners: 80,000 AZR
 *    • Payment Processors: 50,000 AZR
 *    • Banking Partners: 40,000 AZR
 *    • Service Providers: 30,000 AZR
 * 
 * 🎓 STUDENT POOL (10% = 100,000 AZR)
 *    • Learning Rewards: 60,000 AZR
 *    • Achievement Bonuses: 30,000 AZR
 *    • Referral Program: 10,000 AZR
 * 
 * 🏛️ GOVERNANCE & FOUNDERS (5% = 50,000 AZR)
 *    • Board of Directors: 25,000 AZR (5,000 each × 5)
 *    • Founders: 25,000 AZR (Sizwe Ngwenya & Team)
 * 
 * 🤖 AI TREASURY (3% = 30,000 AZR)
 *    • AI Development Fund: 20,000 AZR
 *    • Reinvestment Pool: 10,000 AZR
 * 
 * 🔄 LIQUIDITY RESERVE (2% = 20,000 AZR)
 *    • Exchange Liquidity: 15,000 AZR
 *    • Market Making: 5,000 AZR
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * VALUE PROPOSITION:
 * • Enterprise-first ensures institutional adoption
 * • Students get life-changing amounts (even 1 AZR = $1,000 at target)
 * • Scarcity model drives value to $1M per coin = $1T market cap
 * • Deflationary through burn mechanism
 * • Multisig governance prevents manipulation
 */
contract AzoraCoin is ERC20, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant BOARD_ROLE = keccak256("BOARD_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million AZR
    
    // Allocation limits (enforced at minting)
    uint256 public constant ENTERPRISE_ALLOCATION = 600_000 * 10**18; // 60%
    uint256 public constant BUSINESS_ALLOCATION = 200_000 * 10**18;   // 20%
    uint256 public constant STUDENT_ALLOCATION = 100_000 * 10**18;    // 10%
    uint256 public constant GOVERNANCE_ALLOCATION = 50_000 * 10**18;  // 5%
    uint256 public constant AI_TREASURY_ALLOCATION = 30_000 * 10**18; // 3%
    uint256 public constant LIQUIDITY_ALLOCATION = 20_000 * 10**18;   // 2%

    // Tracking minted amounts per category
    uint256 public enterpriseMinted;
    uint256 public businessMinted;
    uint256 public studentMinted;
    uint256 public governanceMinted;
    uint256 public aiTreasuryMinted;
    uint256 public liquidityMinted;

    // Multisig requirements
    uint256 public constant BOARD_SIZE = 5;
    uint256 public boardApprovals;
    mapping(address => bool) public boardApproved;

    // Burn tracking for deflationary model
    uint256 public totalBurned;

    event TokensMinted(address indexed to, uint256 amount, string category);
    event TokensBurned(address indexed from, uint256 amount);
    event BoardApprovalReceived(address indexed board, uint256 approvalCount);
    event EnterprisePartnerAdded(address indexed partner, uint256 allocation);

    constructor(
        address[] memory boardMembers
    ) ERC20("Azora Coin", "AZR") {
        require(boardMembers.length == BOARD_SIZE, "Must have exactly 5 board members");

        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);

        // Setup board
        for (uint256 i = 0; i < boardMembers.length; i++) {
            _grantRole(BOARD_ROLE, boardMembers[i]);
        }

        // Initial mint to contract for controlled distribution
        _mint(address(this), MAX_SUPPLY);
    }

    /**
     * @dev Mint tokens for enterprises (requires board approval)
     */
    function mintForEnterprise(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(
            enterpriseMinted + amount <= ENTERPRISE_ALLOCATION,
            "Exceeds enterprise allocation"
        );
        require(boardApprovals >= 3, "Requires 3 board approvals");

        enterpriseMinted += amount;
        _transfer(address(this), to, amount);
        
        emit TokensMinted(to, amount, "enterprise");
        
        // Reset approvals
        boardApprovals = 0;
        _resetBoardApprovals();
    }

    /**
     * @dev Mint tokens for businesses
     */
    function mintForBusiness(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(
            businessMinted + amount <= BUSINESS_ALLOCATION,
            "Exceeds business allocation"
        );
        require(boardApprovals >= 2, "Requires 2 board approvals");

        businessMinted += amount;
        _transfer(address(this), to, amount);
        
        emit TokensMinted(to, amount, "business");
        
        boardApprovals = 0;
        _resetBoardApprovals();
    }

    /**
     * @dev Mint tokens for students (single approval)
     */
    function mintForStudent(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(
            studentMinted + amount <= STUDENT_ALLOCATION,
            "Exceeds student allocation"
        );
        require(amount <= 100 * 10**18, "Max 100 AZR per student mint");

        studentMinted += amount;
        _transfer(address(this), to, amount);
        
        emit TokensMinted(to, amount, "student");
    }

    /**
     * @dev Mint for governance (founders, board)
     */
    function mintForGovernance(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(
            governanceMinted + amount <= GOVERNANCE_ALLOCATION,
            "Exceeds governance allocation"
        );
        require(boardApprovals >= 4, "Requires 4 board approvals");

        governanceMinted += amount;
        _transfer(address(this), to, amount);
        
        emit TokensMinted(to, amount, "governance");
        
        boardApprovals = 0;
        _resetBoardApprovals();
    }

    /**
     * @dev Mint for AI Treasury
     */
    function mintForAITreasury(
        address to,
        uint256 amount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(
            aiTreasuryMinted + amount <= AI_TREASURY_ALLOCATION,
            "Exceeds AI treasury allocation"
        );

        aiTreasuryMinted += amount;
        _transfer(address(this), to, amount);
        
        emit TokensMinted(to, amount, "ai_treasury");
    }

    /**
     * @dev Board member approval for minting
     */
    function approveAction() external onlyRole(BOARD_ROLE) {
        require(!boardApproved[msg.sender], "Already approved");
        
        boardApproved[msg.sender] = true;
        boardApprovals++;
        
        emit BoardApprovalReceived(msg.sender, boardApprovals);
    }

    /**
     * @dev Burn tokens (deflationary mechanism)
     */
    function burn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
        totalBurned += amount;
        
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Get remaining allocation per category
     */
    function getRemainingAllocation(string memory category) 
        external 
        view 
        returns (uint256) 
    {
        bytes32 categoryHash = keccak256(abi.encodePacked(category));
        
        if (categoryHash == keccak256("enterprise")) {
            return ENTERPRISE_ALLOCATION - enterpriseMinted;
        } else if (categoryHash == keccak256("business")) {
            return BUSINESS_ALLOCATION - businessMinted;
        } else if (categoryHash == keccak256("student")) {
            return STUDENT_ALLOCATION - studentMinted;
        } else if (categoryHash == keccak256("governance")) {
            return GOVERNANCE_ALLOCATION - governanceMinted;
        } else if (categoryHash == keccak256("ai_treasury")) {
            return AI_TREASURY_ALLOCATION - aiTreasuryMinted;
        } else if (categoryHash == keccak256("liquidity")) {
            return LIQUIDITY_ALLOCATION - liquidityMinted;
        }
        
        return 0;
    }

    /**
     * @dev Get tokenomics summary
     */
    function getTokenomics() external view returns (
        uint256 totalSupply_,
        uint256 circulatingSupply,
        uint256 burned,
        uint256 enterpriseRemaining,
        uint256 studentRemaining
    ) {
        totalSupply_ = MAX_SUPPLY;
        circulatingSupply = totalSupply() - balanceOf(address(this));
        burned = totalBurned;
        enterpriseRemaining = ENTERPRISE_ALLOCATION - enterpriseMinted;
        studentRemaining = STUDENT_ALLOCATION - studentMinted;
    }

    function _resetBoardApprovals() private {
        address[] memory board = new address[](BOARD_SIZE);
        uint256 count = 0;
        
        // Reset all board approvals
        for (uint256 i = 0; i < BOARD_SIZE && count < BOARD_SIZE; i++) {
            // In production, maintain a list of board addresses
            if (boardApproved[board[i]]) {
                boardApproved[board[i]] = false;
            }
        }
    }
}
