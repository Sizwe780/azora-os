/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';

// MongoDB Schemas
const liquidityPoolSchema = new mongoose.Schema({
  tokenA: { type: String, required: true },
  tokenB: { type: String, required: true },
  reserveA: { type: Number, default: 0 },
  reserveB: { type: Number, default: 0 },
  totalLiquidity: { type: Number, default: 0 },
  fee: { type: Number, default: 0.003 }, // 0.3% fee
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const liquidityPositionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  poolId: { type: String, required: true },
  liquidityTokens: { type: Number, required: true },
  tokenA: { type: String, required: true },
  tokenB: { type: String, required: true },
  amountA: { type: Number, required: true },
  amountB: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  removedAt: Date
});

const swapTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  poolId: { type: String, required: true },
  fromToken: { type: String, required: true },
  toToken: { type: String, required: true },
  amountIn: { type: Number, required: true },
  amountOut: { type: Number, required: true },
  fee: { type: Number, required: true },
  executedAt: { type: Date, default: Date.now }
});

// Models
const LiquidityPool = mongoose.model('LiquidityPool', liquidityPoolSchema);
const LiquidityPosition = mongoose.model('LiquidityPosition', liquidityPositionSchema);
const SwapTransaction = mongoose.model('SwapTransaction', swapTransactionSchema);

export class LiquidityService {
  constructor() {
    this.initializeDefaultPools();
  }

  /**
   * Initialize default liquidity pools
   */
  private async initializeDefaultPools() {
    try {
      const existingPools = await LiquidityPool.countDocuments();
      if (existingPools === 0) {
        const defaultPools = [
          { tokenA: 'AZR', tokenB: 'ETH', reserveA: 10000, reserveB: 10 },
          { tokenA: 'AZR', tokenB: 'USDC', reserveA: 10000, reserveB: 10000 },
          { tokenA: 'ETH', tokenB: 'USDC', reserveA: 10, reserveB: 2000 }
        ];

        await LiquidityPool.insertMany(defaultPools);
        console.log('✅ Initialized default liquidity pools');
      }
    } catch (error) {
      console.error('Initialize liquidity pools error:', error);
    }
  }

  /**
   * Get available liquidity pools
   */
  async getLiquidityPools() {
    return await LiquidityPool.find({ isActive: true });
  }

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(userId: string, poolId: string, tokenA: string, tokenB: string, amountA: number, amountB: number) {
    try {
      if (amountA <= 0 || amountB <= 0) {
        throw new Error('Amounts must be positive');
      }

      const pool = await LiquidityPool.findById(poolId);
      if (!pool || !pool.isActive) {
        throw new Error('Pool not found or inactive');
      }

      if (pool.tokenA !== tokenA || pool.tokenB !== tokenB) {
        throw new Error('Token pair does not match pool');
      }

      // Calculate liquidity tokens to mint
      let liquidityTokens = 0;
      if (pool.totalLiquidity === 0) {
        // First liquidity provision
        liquidityTokens = Math.sqrt(amountA * amountB);
      } else {
        // Subsequent liquidity provision
        const liquidityA = (amountA / pool.reserveA) * pool.totalLiquidity;
        const liquidityB = (amountB / pool.reserveB) * pool.totalLiquidity;
        liquidityTokens = Math.min(liquidityA, liquidityB);
      }

      // Update pool reserves
      pool.reserveA += amountA;
      pool.reserveB += amountB;
      pool.totalLiquidity += liquidityTokens;
      await pool.save();

      // Create position
      const position = new LiquidityPosition({
        userId,
        poolId,
        liquidityTokens,
        tokenA,
        tokenB,
        amountA,
        amountB
      });
      await position.save();

      return {
        positionId: position._id,
        liquidityTokens,
        poolReserves: {
          reserveA: pool.reserveA,
          reserveB: pool.reserveB
        },
        totalLiquidity: pool.totalLiquidity
      };
    } catch (error) {
      console.error('Add liquidity error:', error);
      throw error;
    }
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(userId: string, poolId: string, liquidityTokens: number) {
    try {
      const position = await LiquidityPosition.findOne({
        userId,
        poolId,
        isActive: true
      });

      if (!position) {
        throw new Error('Active liquidity position not found');
      }

      if (liquidityTokens > position.liquidityTokens) {
        throw new Error('Cannot remove more liquidity than owned');
      }

      const pool = await LiquidityPool.findById(poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      // Calculate token amounts to return
      const amountA = (liquidityTokens / pool.totalLiquidity) * pool.reserveA;
      const amountB = (liquidityTokens / pool.totalLiquidity) * pool.reserveB;

      // Update pool
      pool.reserveA -= amountA;
      pool.reserveB -= amountB;
      pool.totalLiquidity -= liquidityTokens;
      await pool.save();

      // Update position
      position.liquidityTokens -= liquidityTokens;
      if (position.liquidityTokens <= 0) {
        position.isActive = false;
        position.removedAt = new Date();
      }
      await position.save();

      return {
        positionId: position._id,
        returnedTokens: {
          tokenA: pool.tokenA,
          amountA,
          tokenB: pool.tokenB,
          amountB
        },
        remainingLiquidity: position.liquidityTokens
      };
    } catch (error) {
      console.error('Remove liquidity error:', error);
      throw error;
    }
  }

  /**
   * Get user's liquidity positions
   */
  async getUserLiquidityPositions(userId: string) {
    const positions = await LiquidityPosition.find({ userId }).populate('poolId');

    return positions.map(position => {
      const pool = position.poolId as any;
      return {
        positionId: position._id,
        poolId: position.poolId,
        tokenPair: `${position.tokenA}/${position.tokenB}`,
        liquidityTokens: position.liquidityTokens,
        depositedAmounts: {
          tokenA: position.tokenA,
          amountA: position.amountA,
          tokenB: position.tokenB,
          amountB: position.amountB
        },
        currentValue: this.calculatePositionValue(position, pool),
        addedAt: position.addedAt,
        isActive: position.isActive
      };
    });
  }

  /**
   * Calculate current value of a liquidity position
   */
  private calculatePositionValue(position: any, pool: any): number {
    if (!position.isActive) return 0;

    const shareOfPool = position.liquidityTokens / pool.totalLiquidity;
    const valueA = shareOfPool * pool.reserveA;
    const valueB = shareOfPool * pool.reserveB;

    // Convert to common value (assuming AZR as base)
    // This is simplified - in reality would use price feeds
    return valueA + (valueB * 1000); // Assuming 1 ETH = 1000 AZR
  }

  /**
   * Swap tokens through liquidity pools
   */
  async swapTokens(userId: string, fromToken: string, toToken: string, amountIn: number) {
    try {
      if (amountIn <= 0) {
        throw new Error('Amount must be positive');
      }

      // Find appropriate pool
      const pool = await LiquidityPool.findOne({
        $or: [
          { tokenA: fromToken, tokenB: toToken },
          { tokenA: toToken, tokenB: fromToken }
        ],
        isActive: true
      });

      if (!pool) {
        throw new Error('No liquidity pool found for this token pair');
      }

      // Determine input/output reserves
      let reserveIn: number, reserveOut: number;
      if (pool.tokenA === fromToken) {
        reserveIn = pool.reserveA;
        reserveOut = pool.reserveB;
      } else {
        reserveIn = pool.reserveB;
        reserveOut = pool.reserveA;
      }

      // Calculate output amount using AMM formula
      const amountInWithFee = amountIn * (1 - pool.fee);
      const amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

      if (amountOut <= 0) {
        throw new Error('Insufficient liquidity for this swap');
      }

      // Update pool reserves
      if (pool.tokenA === fromToken) {
        pool.reserveA += amountIn;
        pool.reserveB -= amountOut;
      } else {
        pool.reserveB += amountIn;
        pool.reserveA -= amountOut;
      }
      await pool.save();

      // Record transaction
      const transaction = new SwapTransaction({
        userId,
        poolId: pool._id.toString(),
        fromToken,
        toToken,
        amountIn,
        amountOut,
        fee: amountIn * pool.fee
      });
      await transaction.save();

      return {
        transactionId: transaction._id,
        fromToken,
        toToken,
        amountIn,
        amountOut,
        fee: transaction.fee,
        priceImpact: this.calculatePriceImpact(amountIn, reserveIn, reserveOut)
      };
    } catch (error) {
      console.error('Swap tokens error:', error);
      throw error;
    }
  }

  /**
   * Calculate price impact of a swap
   */
  private calculatePriceImpact(amountIn: number, reserveIn: number, reserveOut: number): number {
    const expectedOut = (amountIn * reserveOut) / reserveIn;
    const actualOut = (amountIn * 0.997 * reserveOut) / (reserveIn + amountIn * 0.997);
    return ((expectedOut - actualOut) / expectedOut) * 100;
  }
}
