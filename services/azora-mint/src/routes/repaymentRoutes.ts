import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Loan, RepaymentTransaction } from '../models/Credit';
import { processRepayment } from '../services/creditService';
import logger from '../middleware/requestLogger';

const router = Router();

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

/**
 * @swagger
 * /api/repayment/pay:
 *   post:
 *     summary: Make a loan repayment
 *     security:
 *       - bearerAuth: []
 */
router.post('/pay', [
  body('loanId').isMongoId(),
  body('amount').isFloat({ min: 0.01 }),
  body('method').optional().isIn(['manual', 'autonomous_collection']),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { loanId, amount, method = 'manual' } = req.body;

    // Verify loan belongs to user
    const loan = await Loan.findOne({ _id: loanId, userId: req.user.id });
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Loan is not active' });
    }

    // Create repayment transaction record
    const transaction = new RepaymentTransaction({
      loanId,
      userId: req.user.id,
      amount,
      method,
      status: 'pending',
    });

    await transaction.save();

    // Process the repayment
    const result = await processRepayment(loanId, amount, method);

    // Update transaction status
    transaction.status = 'completed';
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({
      success: true,
      data: {
        transaction,
        loanStatus: result.status,
        remainingBalance: result.remainingBalance,
      }
    });

  } catch (error) {
    logger.error('Error processing repayment:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/repayment/schedule/{loanId}:
 *   get:
 *     summary: Get repayment schedule for a loan
 *     security:
 *       - bearerAuth: []
 */
router.get('/schedule/:loanId', [
  param('loanId').isMongoId()
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const loan = await Loan.findOne({
      _id: req.params.loanId,
      userId: req.user.id
    });

    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    // Calculate current status
    const now = new Date();
    const totalPaid = loan.repaymentSchedule
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const totalDue = loan.repaymentSchedule
      .filter(payment => payment.dueDate <= now)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const overdueAmount = loan.repaymentSchedule
      .filter(payment => payment.status === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      success: true,
      data: {
        loanId: loan._id,
        totalDebt: loan.totalDebt,
        totalPaid,
        remainingBalance: loan.totalDebt - totalPaid,
        nextPayment: loan.repaymentSchedule.find(p => p.status === 'pending'),
        overdueAmount,
        schedule: loan.repaymentSchedule,
        summary: {
          totalPayments: loan.repaymentSchedule.length,
          completedPayments: loan.repaymentSchedule.filter(p => p.status === 'paid').length,
          pendingPayments: loan.repaymentSchedule.filter(p => p.status === 'pending').length,
          overduePayments: loan.repaymentSchedule.filter(p => p.status === 'overdue').length,
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching repayment schedule:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/repayment/history:
 *   get:
 *     summary: Get user's repayment history
 *     security:
 *       - bearerAuth: []
 */
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const transactions = await RepaymentTransaction.find({
      userId: req.user.id
    })
    .populate('loanId', 'amountZAR amountAZR status')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: transactions });
  } catch (error) {
    logger.error('Error fetching repayment history:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/repayment/autonomous/{loanId}:
 *   post:
 *     summary: Trigger autonomous collection for overdue loan (Admin only)
 */
router.post('/autonomous/:loanId', [
  param('loanId').isMongoId()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const loan = await Loan.findById(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Loan is not active' });
    }

    // Check for overdue payments
    const overduePayments = loan.repaymentSchedule.filter(
      payment => payment.status === 'overdue'
    );

    if (overduePayments.length === 0) {
      return res.status(400).json({ success: false, error: 'No overdue payments found' });
    }

    const overdueAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Create autonomous collection transaction
    const transaction = new RepaymentTransaction({
      loanId: loan._id,
      userId: loan.userId,
      amount: overdueAmount,
      method: 'autonomous_collection',
      status: 'pending',
    });

    await transaction.save();

    // Process the autonomous collection
    const result = await processRepayment(loan._id.toString(), overdueAmount, 'autonomous_collection');

    // Update transaction status
    transaction.status = 'completed';
    transaction.processedAt = new Date();
    await transaction.save();

    res.json({
      success: true,
      data: {
        transaction,
        loanStatus: result.status,
        collectedAmount: overdueAmount,
        remainingBalance: result.remainingBalance,
      }
    });

  } catch (error) {
    logger.error('Error processing autonomous collection:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;