// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GlobalAzoraCoin is ERC20, AccessControl, ReentrancyGuard {
    // Roles
    bytes32 public constant FOUNDER_ROLE = keccak256("FOUNDER_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    // Country-specific guarantees
    mapping(string => CountryConfig) public countryConfigurations;
    
    // Founder withdrawal tracking
    mapping(address => mapping(string => WithdrawalConfig)) public founderWithdrawals;
    
    // Reserve balance
    uint256 public reserveBalance;
    
    // Events
    event CountryConfigured(string country, uint256 guaranteedWithdrawal, bool active);
    event WithdrawalGuaranteed(address founder, string country, uint256 amount);
    event WithdrawalExecuted(address founder, string country, uint256 amount);
    event ClientJoined(string country, address client, uint256 contribution);
    
    struct CountryConfig {
        uint256 guaranteedWithdrawal; // Amount guaranteed for founders
        uint256 minClientContribution; // Minimum client contribution to enable founder withdrawals
        uint256 activeClients; // Number of active clients in country
        uint256 totalContributions; // Total contributions from this country
        bool active; // Is this country supported
        string[] complianceStandards; // Required compliance standards
    }
    
    struct WithdrawalConfig {
        uint256 guaranteedAmount;
        uint256 withdrawnAmount;
        uint256 lastWithdrawalTime;
        bool guaranteed;
    }
    
    constructor() ERC20("Global Azora Coin", "GAZ") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(FOUNDER_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        // Configure South Africa with $100 guaranteed withdrawal
        configureCountry(
            "ZA", 
            100 * 10**18, // $100 in smallest units 
            10 * 10**18,  // $10 minimum client contribution
            true,
            new string[](0)
        );
    }
    
    /**
     * @dev Configure a country's parameters
     */
    function configureCountry(
        string memory countryCode,
        uint256 guaranteedWithdrawal,
        uint256 minClientContribution,
        bool active,
        string[] memory complianceStandards
    ) public onlyRole(GOVERNOR_ROLE) {
        countryConfigurations[countryCode] = CountryConfig({
            guaranteedWithdrawal: guaranteedWithdrawal,
            minClientContribution: minClientContribution,
            activeClients: 0,
            totalContributions: 0,
            active: active,
            complianceStandards: complianceStandards
        });
        
        emit CountryConfigured(countryCode, guaranteedWithdrawal, active);
    }
    
    /**
     * @dev Register a new client and enable founder guarantees if threshold reached
     */
    function registerClient(string memory countryCode, address client) 
        external 
        payable
        onlyRole(COMPLIANCE_ROLE)
    {
        CountryConfig storage config = countryConfigurations[countryCode];
        require(config.active, "Country not supported");
        require(msg.value >= config.minClientContribution, "Contribution below minimum");
        
        // Update country stats
        config.activeClients += 1;
        config.totalContributions += msg.value;
        reserveBalance += msg.value;
        
        emit ClientJoined(countryCode, client, msg.value);
        
        // Enable guaranteed withdrawals for all founders if this is first client
        if (config.activeClients == 1) {
            enableFounderGuarantees(countryCode);
        }
    }
    
    /**
     * @dev Enable guaranteed withdrawals for all founders in a country
     */
    function enableFounderGuarantees(string memory countryCode) internal {
        CountryConfig storage config = countryConfigurations[countryCode];
        require(config.active, "Country not supported");
        
        // This would use role members in production
        // For simplicity, we'll just enable for msg.sender as a founder
        address founder = msg.sender;
        if (hasRole(FOUNDER_ROLE, founder)) {
            founderWithdrawals[founder][countryCode] = WithdrawalConfig({
                guaranteedAmount: config.guaranteedWithdrawal,
                withdrawnAmount: 0,
                lastWithdrawalTime: 0,
                guaranteed: true
            });
            
            emit WithdrawalGuaranteed(founder, countryCode, config.guaranteedWithdrawal);
        }
    }
    
    /**
     * @dev Founder withdraws guaranteed amount
     */
    function founderWithdraw(string memory countryCode) 
        external 
        nonReentrant
        onlyRole(FOUNDER_ROLE)
    {
        WithdrawalConfig storage withdrawal = founderWithdrawals[msg.sender][countryCode];
        CountryConfig storage config = countryConfigurations[countryCode];
        
        require(config.active, "Country not supported");
        require(withdrawal.guaranteed, "No guarantee for this country");
        require(config.activeClients > 0, "No active clients in country");
        require(withdrawal.withdrawnAmount < withdrawal.guaranteedAmount, "Guarantee fully withdrawn");
        require(reserveBalance > 0, "Insufficient reserve");
        
        // Calculate withdrawal amount (remaining guarantee or reserve balance, whichever is lower)
        uint256 remainingGuarantee = withdrawal.guaranteedAmount - withdrawal.withdrawnAmount;
        uint256 withdrawAmount = remainingGuarantee < reserveBalance ? remainingGuarantee : reserveBalance;
        
        // Update state
        withdrawal.withdrawnAmount += withdrawAmount;
        withdrawal.lastWithdrawalTime = block.timestamp;
        reserveBalance -= withdrawAmount;
        
        // Send funds
        (bool sent, ) = msg.sender.call{value: withdrawAmount}("");
        require(sent, "Transfer failed");
        
        emit WithdrawalExecuted(msg.sender, countryCode, withdrawAmount);
    }
    
    /**
     * @dev Check if founder can withdraw from a country
     */
    function canFounderWithdraw(address founder, string memory countryCode) 
        public 
        view 
        returns (bool, uint256) 
    {
        WithdrawalConfig storage withdrawal = founderWithdrawals[founder][countryCode];
        CountryConfig storage config = countryConfigurations[countryCode];
        
        if (!config.active || !withdrawal.guaranteed || config.activeClients == 0) {
            return (false, 0);
        }
        
        uint256 remainingGuarantee = withdrawal.guaranteedAmount - withdrawal.withdrawnAmount;
        if (remainingGuarantee == 0 || reserveBalance == 0) {
            return (false, 0);
        }
        
        uint256 withdrawAmount = remainingGuarantee < reserveBalance ? remainingGuarantee : reserveBalance;
        return (true, withdrawAmount);
    }
    
    /**
     * @dev Add funds to reserve
     */
    function addToReserve() external payable {
        reserveBalance += msg.value;
    }
    
    receive() external payable {
        reserveBalance += msg.value;
    }
}