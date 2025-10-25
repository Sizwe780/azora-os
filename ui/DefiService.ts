/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';
import * as cron from 'node-cron';

// MongoDB Schemas
const defiPoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  token: { type: String, required: true }, // AZR, ETH, etc.
  apy: { type: Number, required: true },
  totalDeposits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const defiPositionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  poolId: { type: String, required: true },
  amount: { type: Number, required: true },
  depositedAt: { type: Date, default: Date.now },
  rewards: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  withdrawnAt: Date
});

const yieldRewardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  positionId: { type: String, required: true },
  poolId: { type: String, required: true },
  amount: { type: Number, required: true },
  rewardDate: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['staking', 'liquidity', 'farming'],
    default: 'staking'
  }
});

// Models
const DefiPool = mongoose.model('DefiPool', defiPoolSchema);
const DefiPosition = mongoose.model('DefiPosition', defiPositionSchema);
const YieldReward = mongoose.model('YieldReward', yieldRewardSchema);

export class DefiService {
  constructor() {
    this.initializeDefaultPools();
  }

  /**
   * Initialize default DeFi pools
   */
  private async initializeDefaultPools() {
    try {
      const existingPools = await DefiPool.countDocuments();
      if (existingPools === 0) {
        const defaultPools = [
          { name: 'AZR Staking Pool', token: 'AZR', apy: 8 },
          { name: 'Liquidity Mining', token: 'AZR-ETH', apy: 15 },
          { name: 'Yield Farming', token: 'AZR', apy: 12 },
          { name: 'High Yield Pool', token: 'AZR', apy: 20 }
        ];

        await DefiPool.insertMany(defaultPools);
        console.log('✅ Initialized default DeFi pools');
      }
    } catch (error) {
      console.error('Initialize pools error:', error);
    }
  }

  /**
   * Get available DeFi pools
   */
  async getAvailablePools() {
    return await DefiPool.find({ isActive: true });
  }

  /**
   * Deposit tokens into a DeFi pool
   */
  async depositToPool(userId: string, poolId: string, amount: number) {
    try {
      if (amount <= 0) {
        throw new Error('Deposit amount must be positive');
      }

      const pool = await DefiPool.findById(poolId);
      if (!pool || !pool.isActive) {
        throw new Error('Pool not found or inactive');
      }

      // Create position
      const position = new DefiPosition({
        userId,
        poolId,
        amount
      });
      await position.save();

      // Update pool total deposits
      pool.totalDeposits += amount;
      await pool.save();

      return {
        positionId: position._id,
        poolName: pool.name,
        amount,
        apy: pool.apy,
        depositedAt: position.depositedAt
      };
    } catch (error) {
      console.error('Deposit to pool error:', error);
      throw error;
    }
  }

  /**
   * Withdraw tokens from a DeFi pool
   */
  async withdrawFromPool(userId: string, poolId: string, amount: number) {
    try {
      const position = await DefiPosition.findOne({
        userId,
        poolId,
        isActive: true
      });

      if (!position) {
        throw new Error('Active position not found in this pool');
      }

      if (amount > position.amount) {
        throw new Error('Withdrawal amount exceeds deposited amount');
      }

      // Calculate rewards earned
      const pool = await DefiPool.findById(poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      const daysDeposited = Math.floor((Date.now() - position.depositedAt.getTime()) / (24 * 60 * 60 * 1000));
      const rewards = (position.amount * pool.apy / 100 / 365) * daysDeposited;

      position.rewards = rewards;
      position.isActive = false;
      position.withdrawnAt = new Date();
      await position.save();

      // Update pool total deposits
      if (pool) {
        pool.totalDeposits -= amount;
        await pool.save();
      }

      return {
        positionId: position._id,
        withdrawnAmount: amount,
        rewards,
        totalReturned: amount + rewards
      };
    } catch (error) {
      console.error('Withdraw from pool error:', error);
      throw error;
    }
  }

  /**
   * Get user's DeFi positions
   */
  async getUserPositions(userId: string) {
    const positions = await DefiPosition.find({ userId }).populate('poolId');

    // Calculate current rewards for active positions
    const positionsWithRewards = await Promise.all(
      positions.map(async (position) => {
        const pool = position.poolId as any;
        let currentRewards = position.rewards;

        if (position.isActive && pool) {
          const daysDeposited = Math.floor((Date.now() - position.depositedAt.getTime()) / (24 * 60 * 60 * 1000));
          currentRewards = (position.amount * pool.apy / 100 / 365) * daysDeposited;
        }

        return {
          positionId: position._id,
          poolName: pool.name,
          token: pool.token,
          amount: position.amount,
          apy: pool.apy,
          currentRewards,
          depositedAt: position.depositedAt,
          isActive: position.isActive
        };
      })
    );

    return positionsWithRewards;
  }

  /**
   * Get user's yield farming rewards
   */
  async getYieldRewards(userId: string) {
    const rewards = await YieldReward.find({ userId })
      .populate('poolId')
      .sort({ rewardDate: -1 })
      .limit(50);

    const totalRewards = await YieldReward.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      rewards: rewards.map(reward => ({
        rewardId: reward._id,
        poolName: (reward.poolId as any).name,
        amount: reward.amount,
        type: reward.type,
        rewardDate: reward.rewardDate
      })),
      totalEarned: totalRewards[0]?.total || 0
    };
  }

  /**
   * Distribute yield rewards (runs hourly)
   */
  async distributeYieldRewards() {
    console.log('🔄 Distributing yield farming rewards...');

    try {
      const activePositions = await DefiPosition.find({ isActive: true }).populate('poolId');

      for (const position of activePositions) {
        const pool = position.poolId as any;
        const hourlyReward = (position.amount * pool.apy / 100 / 365 / 24);

        if (hourlyReward > 0) {
          // Update position rewards
          position.rewards += hourlyReward;
          await position.save();

          // Record yield reward
          const reward = new YieldReward({
            userId: position.userId,
            positionId: position._id.toString(),
            poolId: pool._id.toString(),
            amount: hourlyReward,
            type: pool.name.includes('Liquidity') ? 'liquidity' :
                  pool.name.includes('Farming') ? 'farming' : 'staking'
          });
          await reward.save();
        }
      }

      console.log(`✅ Distributed yield rewards to ${activePositions.length} positions`);
    } catch (error) {
      console.error('Yield rewards distribution error:', error);
    }
  }

  /**
   * Start yield distribution cron job (runs hourly)
   */
  startYieldDistribution() {
    cron.schedule('0 * * * *', async () => {
      await this.distributeYieldRewards();
    });
  }
}
