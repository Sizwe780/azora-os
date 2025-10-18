// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * ViralRewards.sol
 * - Doubles referral bonus for the first 10,000 evangelists who each refer >=5 active users.
 * - Simple, auditable on-chain logic. Integrate with off-chain "active" verification.
 *
 * NOTE: This contract is a coordinator only (records referrals & pays out rewards).
 * Real token transfers should be handled by a separate token contract (ERC20) via `mintReward`.
 */

interface IERC20Mintable {
    function mint(address to, uint256 amount) external;
}

contract ViralRewards {
    IERC20Mintable public immutable azrToken;
    address public governance;

    uint256 public constant EVANGELIST_THRESHOLD = 5;      // referrals needed to qualify
    uint256 public constant EVANGELIST_LIMIT = 10000;      // first N evangelists get doubled reward
    uint256 public evangelistCount;

    uint256 public baseReferralReward; // expressed in token smallest unit

    mapping(address => uint256) public referrals;          // referee -> referrer count is tracked off-chain
    mapping(address => uint256) public referrerReferredCount; // on-chain tally of confirmed referrals
    mapping(address => bool) public evangelistPaid;

    event ReferralConfirmed(address indexed referrer, address indexed referee);
    event RewardPaid(address indexed referrer, uint256 amount, bool evangelistBonus);

    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance");
        _;
    }

    constructor(IERC20Mintable _azrToken, uint256 _baseReferralReward, address _governance) {
        azrToken = _azrToken;
        baseReferralReward = _baseReferralReward;
        governance = _governance;
    }

    /// @notice Called by an off-chain verifier (governance service) to confirm a referral is valid & active.
    /// @dev Off-chain system must ensure a referee is "active" before calling.
    function confirmReferral(address referrer, address referee) external onlyGovernance {
        require(referrer != address(0) && referee != address(0), "invalid addresses");
        // prevent double-count for same referee
        // simplified: governance ensures uniqueness
        referrerReferredCount[referrer] += 1;
        emit ReferralConfirmed(referrer, referee);

        // If referrer reaches threshold and hasn't yet been paid evangelist bonus, consider payout
        if (referrerReferredCount[referrer] >= EVANGELIST_THRESHOLD && !evangelistPaid[referrer]) {
            bool isEvangelist = false;
            if (evangelistCount < EVANGELIST_LIMIT) {
                // evangelist tier: double reward
                evangelistCount += 1;
                isEvangelist = true;
            }
            _payReferralReward(referrer, isEvangelist);
            evangelistPaid[referrer] = true;
        } else {
            // standard per-referral reward on confirmation
            _payReferralReward(referrer, false);
        }
    }

    function _payReferralReward(address referrer, bool evangelistBonus) internal {
        uint256 reward = baseReferralReward;
        if (evangelistBonus) {
            reward = reward * 2;
        }
        azrToken.mint(referrer, reward);
        emit RewardPaid(referrer, reward, evangelistBonus);
    }

    // Governance functions
    function setBaseReferralReward(uint256 _amount) external onlyGovernance {
        baseReferralReward = _amount;
    }

    function setGovernance(address _gov) external onlyGovernance {
        governance = _gov;
    }
}