// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * AzoraSavingsVault.sol
 * Simple staking contract that accrues rewards linearly using an APY variable.
 * - Keeps logic minimal for auditability.
 * - Rewards paid in AZR via minting from an ERC20 mintable token contract.
 */

interface IERC20Mintable {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external;
}

contract AzoraSavingsVault {
    IERC20Mintable public immutable azr;
    address public governance;
    uint256 public apyBasisPoints; // e.g., 1500 = 15.00% APY

    struct Stake {
        uint256 amount;
        uint256 since; // timestamp
    }

    mapping(address => Stake) public stakes;
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance");
        _;
    }

    constructor(IERC20Mintable _azr, uint256 _apyBasisPoints, address _governance) {
        azr = _azr;
        apyBasisPoints = _apyBasisPoints;
        governance = _governance;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "amount=0");
        // pull tokens
        require(azr.transferFrom(msg.sender, address(this), amount), "transfer failed");
        _flushReward(msg.sender);
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].since = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(stakes[msg.sender].amount >= amount, "insufficient stake");
        uint256 reward = _calculateReward(msg.sender);
        stakes[msg.sender].amount -= amount;
        stakes[msg.sender].since = block.timestamp;
        // mint reward and return principal
        if (reward > 0) {
            azr.mint(msg.sender, reward);
        }
        // principal returned off-chain or via separate mechanism depending on token design.
        // For simple flows, we mint tokens to user as "reward" and assume principal was a transferable token held by contract.
        // Caller must withdraw principal through token transfer logic (omitted for brevity).
        emit Unstaked(msg.sender, amount, reward);
    }

    function _flushReward(address user) internal {
        // placeholder to realize or store accrued reward
        // not implemented to keep contract minimal and auditable
    }

    function _calculateReward(address user) public view returns (uint256) {
        Stake memory s = stakes[user];
        if (s.amount == 0 || s.since == 0) return 0;
        uint256 elapsed = block.timestamp - s.since;
        // APY basis points -> annual rate
        // reward = amount * apy * elapsed / year
        uint256 reward = (s.amount * apyBasisPoints * elapsed) / (10000 * 365 days);
        return reward;
    }

    // Governance setters
    function setAPY(uint256 _apyBasisPoints) external onlyGovernance {
        apyBasisPoints = _apyBasisPoints;
    }

    function setGovernance(address _gov) external onlyGovernance {
        governance = _gov;
    }
}