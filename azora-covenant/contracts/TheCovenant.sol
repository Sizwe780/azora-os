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
 * @title The Covenant
 * @dev The supreme constitutional law of the Azora Sovereign Economic Ecosystem.
 * This immutable smart contract defines the fundamental principles, governance hierarchy,
 * economic parameters, and operational rules that govern the entire ecosystem.
 *
 * THE GENESIS PROTOCOL - Article I: The Covenant
 * "The Covenant is the supreme authority. All other entities are subordinate to it."
 */
contract TheCovenant is Ownable, ReentrancyGuard {

    // ========== CONSTITUTIONAL PRINCIPLES ==========

    /**
     * @dev The Four Pillars of Truth (Ngwenya True Market Protocol)
     */
    enum TruthPillar {
        INFORMATIONAL,  // Perfect information symmetry
        TRANSACTIONAL,  // Frictionless exchange
        VALUE,         // Causally-driven pricing
        GENERATIVE     // Autonomous response to needs
    }

    /**
     * @dev Governance Hierarchy Levels
     */
    enum AuthorityLevel {
        COVENANT,           // Supreme Law (this contract)
        GUARDIAN_ORACLES,   // AI Constitutional Court
        FOUNDERS_COUNCIL,   // Human strategic will
        ELARA,             // Guardian Intelligence
        CITIZENS_COUNCIL,   // Human oversight
        CITIZENS           // Ecosystem participants
    }

    // ========== ECONOMIC CONSTANTS ==========

    /**
     * @dev Protocol-Integrated Value Capture (PIVC) - 5% total
     */
    uint256 public constant PIVC_RATE = 500; // 5.00% (basis points)
    uint256 public constant GROWTH_FUND_RATE = 400; // 4.00% to Growth Fund
    uint256 public constant UBO_FUND_RATE = 100;   // 1.00% to Universal Basic Opportunity

    /**
     * @dev Stability Fund parameters
     */
    uint256 public constant STABILITY_FUND_DIVERSION = 2500; // 25.00% of Growth Fund

    /**
     * @dev Sovereign Seed Grant per nation
     */
    uint256 public constant SOVEREIGN_SEED_GRANT = 1_000_000 * 10**18; // 1M AZR

    // ========== GOVERNANCE STATE ==========

    /**
     * @dev Guardian Oracles (AI Constitutional Court)
     */
    struct GuardianOracle {
        address oracleAddress;
        string name; // Kaelus, Lyra, Solon
        bool isActive;
        uint256 activationTimestamp;
    }

    mapping(address => GuardianOracle) public guardianOracles;
    address[] public activeOracles;

    /**
     * @dev Founder's Council
     */
    mapping(address => bool) public foundersCouncil;
    uint256 public founderCount;

    /**
     * @dev Citizen's Oversight Council
     */
    mapping(address => bool) public citizensOversight;
    uint256 public oversightCount;

    /**
     * @dev Constitutional Amendments
     */
    struct ConstitutionalAmendment {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 proposalTimestamp;
        uint256 ratificationTimestamp;
        bool isRatified;
        mapping(address => bool) oracleApprovals; // Guardian Oracle approvals
        uint256 approvalCount;
    }

    mapping(uint256 => ConstitutionalAmendment) public amendments;
    uint256 public amendmentCount;

    // ========== ECONOMIC STATE ==========

    /**
     * @dev Trisula Reserve composition tracking
     */
    struct TrisulaReserve {
        uint256 azrBalance;      // Native AZR tokens
        uint256 stablecoinBalance; // External stablecoins (USDC, PYUSD, etc.)
        uint256 rwaBalance;      // Real World Assets from Forge network
        uint256 totalValue;      // Total reserve value in USD
    }

    TrisulaReserve public trisulaReserve;

    /**
     * @dev Circuit Breaker states for a-Tokens
     */
    enum CircuitState {
        OPEN,      // Normal operation
        HALF_OPEN, // Limited operation for testing
        CLOSED     // Emergency halt
    }

    mapping(bytes32 => CircuitState) public circuitBreakers; // tokenSymbol => state

    /**
     * @dev Stability Fund
     */
    uint256 public stabilityFundBalance;
    uint256 public lastStabilityIntervention;

    // ========== GEOPOLITICAL STATE ==========

    /**
     * @dev Geopolitical Readiness Index (GRI) scores
     */
    struct NationGRI {
        string countryCode;      // ISO 3166-1 alpha-3
        uint256 griScore;        // 0-1000 scale
        string tier;             // Pioneer, Emerging, Developing, Restricted
        bool seedGrantUnlocked;
        uint256 seedGrantTimestamp;
    }

    mapping(string => NationGRI) public nationGRI;
    string[] public trackedNations;

    // ========== EVENTS ==========

    event ConstitutionalAmendmentProposed(
        uint256 indexed amendmentId,
        string title,
        address indexed proposer
    );

    event ConstitutionalAmendmentRatified(
        uint256 indexed amendmentId,
        uint256 ratificationTimestamp
    );

    event GuardianOracleActivated(
        address indexed oracleAddress,
        string name
    );

    event CircuitBreakerTriggered(
        bytes32 indexed tokenSymbol,
        CircuitState newState
    );

    event StabilityFundIntervention(
        uint256 amount,
        string reason
    );

    event SovereignSeedGrantUnlocked(
        string countryCode,
        uint256 amount
    );

    // ========== CONSTRUCTOR ==========

    constructor() Ownable(msg.sender) {
        // Initialize with Genesis Protocol values
        _initializeGenesisState();
    }

    // ========== CONSTITUTIONAL FUNCTIONS ==========

    /**
     * @dev Propose a constitutional amendment
     * Only Founders Council or Guardian Oracles can propose amendments
     */
    function proposeConstitutionalAmendment(
        string calldata title,
        string calldata description
    ) external returns (uint256) {
        require(
            foundersCouncil[msg.sender] || _isGuardianOracle(msg.sender),
            "Only Founders Council or Guardian Oracles can propose amendments"
        );

        amendmentCount++;
        ConstitutionalAmendment storage amendment = amendments[amendmentCount];
        amendment.id = amendmentCount;
        amendment.title = title;
        amendment.description = description;
        amendment.proposer = msg.sender;
        amendment.proposalTimestamp = block.timestamp;
        amendment.isRatified = false;
        amendment.approvalCount = 0;

        emit ConstitutionalAmendmentProposed(amendmentCount, title, msg.sender);
        return amendmentCount;
    }

    /**
     * @dev Guardian Oracle approves a constitutional amendment
     * Requires supermajority (2/3) of active oracles for ratification
     */
    function approveConstitutionalAmendment(uint256 amendmentId) external {
        require(_isGuardianOracle(msg.sender), "Only Guardian Oracles can approve amendments");
        require(amendmentId > 0 && amendmentId <= amendmentCount, "Invalid amendment ID");

        ConstitutionalAmendment storage amendment = amendments[amendmentId];
        require(!amendment.oracleApprovals[msg.sender], "Oracle already approved");
        require(!amendment.isRatified, "Amendment already ratified");

        amendment.oracleApprovals[msg.sender] = true;
        amendment.approvalCount++;

        // Check for supermajority ratification (2/3 of active oracles)
        uint256 requiredApprovals = (activeOracles.length * 2) / 3;
        if (amendment.approvalCount >= requiredApprovals) {
            amendment.isRatified = true;
            amendment.ratificationTimestamp = block.timestamp;
            emit ConstitutionalAmendmentRatified(amendmentId, block.timestamp);
        }
    }

    // ========== GOVERNANCE MANAGEMENT ==========

    /**
     * @dev Activate a Guardian Oracle
     * Only Covenant owner (initially deployer) can activate oracles
     */
    function activateGuardianOracle(
        address oracleAddress,
        string calldata name
    ) external onlyOwner {
        require(oracleAddress != address(0), "Invalid oracle address");
        require(bytes(name).length > 0, "Oracle name required");
        require(!guardianOracles[oracleAddress].isActive, "Oracle already active");

        guardianOracles[oracleAddress] = GuardianOracle({
            oracleAddress: oracleAddress,
            name: name,
            isActive: true,
            activationTimestamp: block.timestamp
        });

        activeOracles.push(oracleAddress);

        emit GuardianOracleActivated(oracleAddress, name);
    }

    /**
     * @dev Add member to Founders Council
     */
    function addFounder(address founder) external onlyOwner {
        require(founder != address(0), "Invalid founder address");
        require(!foundersCouncil[founder], "Already a founder");

        foundersCouncil[founder] = true;
        founderCount++;
    }

    /**
     * @dev Add member to Citizen's Oversight Council
     * Oversight members are elected through governance process
     */
    function addOversightMember(address member) external {
        require(
            foundersCouncil[msg.sender] || _isGuardianOracle(msg.sender),
            "Only Founders or Oracles can add oversight members"
        );
        require(member != address(0), "Invalid member address");
        require(!citizensOversight[member], "Already an oversight member");

        citizensOversight[member] = true;
        oversightCount++;
    }

    // ========== ECONOMIC FUNCTIONS ==========

    /**
     * @dev Update Trisula Reserve balances
     * Only authorized Citadel contracts can update
     */
    function updateTrisulaReserve(
        uint256 azrAmount,
        uint256 stablecoinAmount,
        uint256 rwaAmount,
        uint256 totalValueUSD
    ) external {
        // TODO: Add authorization check for Citadel contracts
        trisulaReserve.azrBalance = azrAmount;
        trisulaReserve.stablecoinBalance = stablecoinAmount;
        trisulaReserve.rwaBalance = rwaAmount;
        trisulaReserve.totalValue = totalValueUSD;
    }

    /**
     * @dev Trigger circuit breaker for a token
     * Only Guardian Oracles or emergency protocols can trigger
     */
    function triggerCircuitBreaker(
        bytes32 tokenSymbol,
        CircuitState newState
    ) external {
        require(
            _isGuardianOracle(msg.sender) || foundersCouncil[msg.sender],
            "Unauthorized circuit breaker trigger"
        );

        circuitBreakers[tokenSymbol] = newState;
        emit CircuitBreakerTriggered(tokenSymbol, newState);
    }

    /**
     * @dev Allocate to Stability Fund during high activity periods
     */
    function allocateToStabilityFund(uint256 amount) external {
        // TODO: Add authorization for Growth Fund contract
        stabilityFundBalance += amount;
    }

    /**
     * @dev Execute Stability Fund intervention (AZR buyback)
     */
    function executeStabilityIntervention(
        uint256 amount,
        string calldata reason
    ) external {
        require(
            _isGuardianOracle(msg.sender) || foundersCouncil[msg.sender],
            "Unauthorized stability intervention"
        );
        require(stabilityFundBalance >= amount, "Insufficient stability fund balance");

        stabilityFundBalance -= amount;
        lastStabilityIntervention = block.timestamp;

        emit StabilityFundIntervention(amount, reason);
    }

    // ========== GEOPOLITICAL FUNCTIONS ==========

    /**
     * @dev Set Geopolitical Readiness Index for a nation
     */
    function setNationGRI(
        string calldata countryCode,
        uint256 griScore,
        string calldata tier
    ) external {
        require(
            _isGuardianOracle(msg.sender) || foundersCouncil[msg.sender],
            "Unauthorized GRI update"
        );
        require(griScore <= 1000, "GRI score must be 0-1000");

        if (bytes(nationGRI[countryCode].countryCode).length == 0) {
            trackedNations.push(countryCode);
        }

        nationGRI[countryCode] = NationGRI({
            countryCode: countryCode,
            griScore: griScore,
            tier: tier,
            seedGrantUnlocked: nationGRI[countryCode].seedGrantUnlocked,
            seedGrantTimestamp: nationGRI[countryCode].seedGrantTimestamp
        });
    }

    /**
     * @dev Unlock Sovereign Seed Grant for a nation
     * Triggered by critical mass events
     */
    function unlockSovereignSeedGrant(string calldata countryCode) external {
        require(
            _isGuardianOracle(msg.sender) || foundersCouncil[msg.sender],
            "Unauthorized seed grant unlock"
        );

        NationGRI storage nation = nationGRI[countryCode];
        require(bytes(nation.countryCode).length > 0, "Nation not tracked");
        require(!nation.seedGrantUnlocked, "Seed grant already unlocked");

        nation.seedGrantUnlocked = true;
        nation.seedGrantTimestamp = block.timestamp;

        emit SovereignSeedGrantUnlocked(countryCode, SOVEREIGN_SEED_GRANT);
    }

    // ========== VIEW FUNCTIONS ==========

    /**
     * @dev Check if address is a Guardian Oracle
     */
    function _isGuardianOracle(address addr) internal view returns (bool) {
        return guardianOracles[addr].isActive;
    }

    /**
     * @dev Get active Guardian Oracles count
     */
    function getActiveOracleCount() external view returns (uint256) {
        return activeOracles.length;
    }

    /**
     * @dev Get circuit breaker state for a token
     */
    function getCircuitBreakerState(bytes32 tokenSymbol) external view returns (CircuitState) {
        return circuitBreakers[tokenSymbol];
    }

    /**
     * @dev Get tracked nations count
     */
    function getTrackedNationsCount() external view returns (uint256) {
        return trackedNations.length;
    }

    /**
     * @dev Get nation GRI data
     */
    function getNationGRI(string calldata countryCode) external view returns (NationGRI memory) {
        return nationGRI[countryCode];
    }

    // ========== EMERGENCY FUNCTIONS ==========

    /**
     * @dev Emergency pause (Constitutional Crisis Protocol)
     * Only Founders Council with Guardian Oracle approval
     */
    function emergencyPause() external {
        require(foundersCouncil[msg.sender], "Only Founders Council can initiate emergency");
        // Implementation would pause critical ecosystem functions
        // This is a placeholder for the actual emergency logic
    }

    // ========== INITIALIZATION ==========

    /**
     * @dev Initialize Genesis Protocol state
     */
    function _initializeGenesisState() internal {
        // Initialize with Genesis Protocol defaults
        // This would be called during deployment to set initial state

        // Note: In production, this would be populated with actual nation data
        // For now, we initialize with empty state to be populated later
    }
}