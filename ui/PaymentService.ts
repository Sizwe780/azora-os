/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';

// MongoDB Schemas
const paymentTransactionSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  transactionHash: { type: String },
  fee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const paymentRequestSchema = new mongoose.Schema({
  requesterId: { type: String, required: true },
  recipientId: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  fulfilledAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Models
const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);

export class PaymentService {
  /**
   * Send payment to another user
   */
  async sendPayment(senderId: string, recipientId: string, amount: number, description?: string) {
    try {
      if (amount <= 0) {
        throw new Error('Payment amount must be positive');
      }

      // In a real implementation, this would check sender's balance
      // and transfer tokens on the blockchain
      const fee = amount * 0.001; // 0.1% transaction fee

      const transaction = new PaymentTransaction({
        senderId,
        recipientId,
        amount,
        description,
        fee,
        transactionHash: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      await transaction.save();

      return {
        transactionId: transaction._id,
        senderId,
        recipientId,
        amount,
        fee,
        transactionHash: transaction.transactionHash,
        createdAt: transaction.createdAt
      };
    } catch (error) {
      console.error('Send payment error:', error);
      throw error;
    }
  }

  /**
   * Request payment from another user
   */
  async requestPayment(requesterId: string, recipientId: string, amount: number, description: string) {
    try {
      if (amount <= 0) {
        throw new Error('Request amount must be positive');
      }

      const request = new PaymentRequest({
        requesterId,
        recipientId,
        amount,
        description
      });

      await request.save();

      return {
        requestId: request._id,
        requesterId,
        recipientId,
        amount,
        description,
        createdAt: request.createdAt
      };
    } catch (error) {
      console.error('Request payment error:', error);
      throw error;
    }
  }

  /**
   * Get user's payment transactions
   */
  async getUserTransactions(userId: string, limit: number = 20) {
    const transactions = await PaymentTransaction.find({
      $or: [{ senderId: userId }, { recipientId: userId }]
    })
    .sort({ createdAt: -1 })
    .limit(limit);

    return transactions.map(tx => ({
      transactionId: tx._id,
      type: tx.senderId === userId ? 'sent' : 'received',
      counterpartyId: tx.senderId === userId ? tx.recipientId : tx.senderId,
      amount: tx.amount,
      description: tx.description,
      fee: tx.fee,
      status: tx.status,
      transactionHash: tx.transactionHash,
      createdAt: tx.createdAt
    }));
  }

  /**
   * Get payment requests for user (both sent and received)
   */
  async getPaymentRequests(userId: string) {
    const sentRequests = await PaymentRequest.find({
      requesterId: userId
    }).sort({ createdAt: -1 });

    const receivedRequests = await PaymentRequest.find({
      recipientId: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });

    return {
      sent: sentRequests.map(req => ({
        requestId: req._id,
        recipientId: req.recipientId,
        amount: req.amount,
        description: req.description,
        status: req.status,
        createdAt: req.createdAt
      })),
      received: receivedRequests.map(req => ({
        requestId: req._id,
        requesterId: req.requesterId,
        amount: req.amount,
        description: req.description,
        status: req.status,
        createdAt: req.createdAt
      }))
    };
  }

  /**
   * Fulfill a payment request
   */
  async fulfillPaymentRequest(userId: string, requestId: string) {
    try {
      const request = await PaymentRequest.findOne({
        _id: requestId,
        recipientId: userId,
        status: 'pending'
      });

      if (!request) {
        throw new Error('Payment request not found or already fulfilled');
      }

      // Send the payment
      const payment = await this.sendPayment(
        userId,
        request.requesterId,
        request.amount,
        `Payment for: ${request.description}`
      );

      // Update request status
      request.status = 'fulfilled';
      request.fulfilledAt = new Date();
      await request.save();

      return {
        requestId: request._id,
        paymentId: payment.transactionId,
        amount: request.amount,
        fulfilledAt: request.fulfilledAt
      };
    } catch (error) {
      console.error('Fulfill payment request error:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics for user
   */
  async getPaymentStats(userId: string) {
    const [
      sentCount,
      receivedCount,
      totalSent,
      totalReceived,
      pendingRequests
    ] = await Promise.all([
      PaymentTransaction.countDocuments({ senderId: userId }),
      PaymentTransaction.countDocuments({ recipientId: userId }),
      PaymentTransaction.aggregate([
        { $match: { senderId: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PaymentTransaction.aggregate([
        { $match: { recipientId: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      PaymentRequest.countDocuments({
        recipientId: userId,
        status: 'pending'
      })
    ]);

    return {
      transactions: {
        sent: sentCount,
        received: receivedCount,
        totalSent: totalSent[0]?.total || 0,
        totalReceived: totalReceived[0]?.total || 0
      },
      requests: {
        pending: pendingRequests
      },
      netBalance: (totalReceived[0]?.total || 0) - (totalSent[0]?.total || 0)
    };
  }

  /**
   * Process escrow payments (for marketplace transactions)
   */
  async createEscrowPayment(buyerId: string, sellerId: string, amount: number, itemId: string) {
    try {
      // Create escrow transaction (held until item is delivered)
      const transaction = new PaymentTransaction({
        senderId: buyerId,
        recipientId: sellerId,
        amount,
        description: `Escrow payment for item ${itemId}`,
        status: 'pending' // Will be completed when item is confirmed delivered
      });

      await transaction.save();

      return {
        escrowId: transaction._id,
        buyerId,
        sellerId,
        amount,
        itemId,
        status: 'held'
      };
    } catch (error) {
      console.error('Create escrow payment error:', error);
      throw error;
    }
  }

  /**
   * Release escrow payment (when item is delivered)
   */
  async releaseEscrowPayment(escrowId: string, releaserId: string) {
    try {
      const transaction = await PaymentTransaction.findById(escrowId);

      if (!transaction) {
        throw new Error('Escrow payment not found');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Escrow payment already processed');
      }

      // Only buyer or seller can release escrow
      if (releaserId !== transaction.senderId && releaserId !== transaction.recipientId) {
        throw new Error('Unauthorized to release escrow');
      }

      transaction.status = 'completed';
      await transaction.save();

      return {
        escrowId: transaction._id,
        status: 'released',
        releasedAt: new Date()
      };
    } catch (error) {
      console.error('Release escrow payment error:', error);
      throw error;
    }
  }
}
