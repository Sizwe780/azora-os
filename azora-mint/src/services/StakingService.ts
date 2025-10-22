/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';
import * as cron from 'node-cron';

// MongoDB Schemas
const stakingPositionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  duration: { type: Number, required: true }, // in days
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  apy: { type: Number, required: true }, // Annual Percentage Yield
  rewards: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'unstaking', 'completed'],
    default: 'active'
  },
  unstakeRequestedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const stakingRewardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  stakeId: { type: String, required: true },
  amount: { type: Number, required: true },
  rewardDate: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['daily', 'maturity'],
    default: 'daily'
  }
});

// Models
const StakingPosition = mongoose.model('StakingPosition', stakingPositionSchema);
const StakingReward = mongoose.model('StakingReward', stakingRewardSchema);

export class StakingService {
  /**
   * Calculate APY based on staking duration
   */
  private calculateAPY(duration: number): number {
    // Longer staking periods get higher APY
    if (duration >= 365) return 12; // 12% for 1 year
    if (duration >= 180) return 8;  // 8% for 6 months
    if (duration >= 90) return 6;   // 6% for 3 months
    if (duration >= 30) return 4;   // 4% for 1 month
    return 2; // 2% for shorter periods
  }

  /**
   * Create a new staking position
   */
  async createStake(userId: string, amount: number, duration: number) {
    try {
      if (amount < 1) {
        throw new Error('Minimum staking amount is 1 AZR');
      }

      if (duration < 30 || duration > 365) {
        throw new Error('Staking duration must be between 30 and 365 days');
      }

      const apy = this.calculateAPY(duration);
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

      const stake = new StakingPosition({
        userId,
        amount,
        duration,
        startDate,
        endDate,
        apy
      });

      await stake.save();

      return {
        stakeId: stake._id,
        amount,
        duration,
        apy,
        endDate,
        estimatedRewards: this.calculateEstimatedRewards(amount, apy, duration)
      };
    } catch (error) {
      console.error('Create stake error:', error);
      throw error;
    }
  }

  /**
   * Calculate estimated rewards
   */
  private calculateEstimatedRewards(amount: number, apy: number, duration: number): number {
    const dailyRate = apy / 100 / 365;
    return amount * dailyRate * duration;
  }

  /**
   * Get user's staking positions
   */
  async getUserStakingPositions(userId: string) {
    return await StakingPosition.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Unstake tokens (with 7-day unstaking period for longer stakes)
   */
  async unstake(userId: string, stakeId: string) {
    const stake = await StakingPosition.findOne({ _id: stakeId, userId });

    if (!stake) {
      throw new Error('Staking position not found');
    }

    if (stake.status !== 'active') {
      throw new Error('Staking position is not active');
    }

    const now = new Date();
    const daysStaked = Math.floor((now.getTime() - stake.startDate.getTime()) / (24 * 60 * 60 * 1000));

    // Calculate rewards earned so far
    const rewards = this.calculateEstimatedRewards(stake.amount, stake.apy, daysStaked);
    stake.rewards = rewards;

    // For stakes longer than 90 days, require 7-day unstaking period
    if (stake.duration >= 90) {
      stake.status = 'unstaking';
      stake.unstakeRequestedAt = now;
      await stake.save();

      return {
        status: 'unstaking',
        unstakeAvailableAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        rewards
      };
    } else {
      // Immediate unstaking for shorter stakes
      stake.status = 'completed';
      await stake.save();

      return {
        status: 'completed',
        rewards,
        returnedAmount: stake.amount + rewards
      };
    }
  }

  /**
   * Process completed unstaking positions
   */
  async processCompletedUnstaking() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const completedUnstaking = await StakingPosition.find({
      status: 'unstaking',
      unstakeRequestedAt: { $lte: sevenDaysAgo }
    });

    for (const stake of completedUnstaking) {
      stake.status = 'completed';
      await stake.save();
    }

    return completedUnstaking.length;
  }

  /**
   * Get user's staking rewards
   */
  async getStakingRewards(userId: string) {
    const rewards = await StakingReward.find({ userId }).sort({ rewardDate: -1 }).limit(50);

    const totalRewards = await StakingReward.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      rewards,
      totalEarned: totalRewards[0]?.total || 0
    };
  }

  /**
   * Distribute daily staking rewards
   */
  async distributeDailyRewards() {
    console.log('🔄 Distributing daily staking rewards...');

    try {
      const activeStakes = await StakingPosition.find({ status: 'active' });

      for (const stake of activeStakes) {
        const daysStaked = Math.floor((Date.now() - stake.startDate.getTime()) / (24 * 60 * 60 * 1000));
        const dailyReward = (stake.amount * stake.apy / 100 / 365);

        if (dailyReward > 0) {
          stake.rewards += dailyReward;
          await stake.save();

          // Record the reward
          const reward = new StakingReward({
            userId: stake.userId,
            stakeId: stake._id.toString(),
            amount: dailyReward,
            type: 'daily'
          });
          await reward.save();
        }
      }

      console.log(`✅ Distributed rewards to ${activeStakes.length} staking positions`);
    } catch (error) {
      console.error('Daily rewards distribution error:', error);
    }
  }

  /**
   * Get global staking statistics
   */
  async getStakingStats() {
    const [
      totalStaked,
      activeStakes,
      totalStakers,
      averageAPY
    ] = await Promise.all([
      StakingPosition.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      StakingPosition.countDocuments({ status: 'active' }),
      StakingPosition.distinct('userId', { status: 'active' }),
      StakingPosition.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, avgAPY: { $avg: '$apy' } } }
      ])
    ]);

    return {
      totalStaked: totalStaked[0]?.total || 0,
      activeStakes,
      totalStakers: totalStakers.length,
      averageAPY: averageAPY[0]?.avgAPY || 0,
      timestamp: new Date()
    };
  }

  /**
   * Start reward distribution cron job (runs daily at midnight)
   */
  startRewardDistribution() {
    cron.schedule('0 0 * * *', async () => {
      await this.distributeDailyRewards();
      await this.processCompletedUnstaking();
    });
  }
}