import cron from 'node-cron';
import { CreditApplication, Loan, TrustScore } from '../models/Credit';
import { processRepayment } from './creditService';
import logger from '../middleware/requestLogger';

/**
 * Start the credit processing scheduler
 * Handles automated tasks like trust score updates, loan monitoring, and collections
 */
export function startCreditScheduler(): void {
  // Update trust scores daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    await updateAllTrustScores();
  });

  // Check for expired applications daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    await expireOldApplications();
  });

  // Process overdue payments daily at 4 AM
  cron.schedule('0 4 * * *', async () => {
    await processOverduePayments();
  });

  // Update loan statuses and check for defaults daily at 5 AM
  cron.schedule('0 5 * * *', async () => {
    await updateLoanStatuses();
  });

  // Monthly maintenance on the 1st at 6 AM
  cron.schedule('0 6 1 * *', async () => {
    await monthlyMaintenance();
  });

  logger.info('Credit scheduler started');
}

/**
 * Update trust scores for all users
 */
async function updateAllTrustScores(): Promise<void> {
  try {
    logger.info('Starting daily trust score updates');

    const trustScores = await TrustScore.find({
      nextUpdate: { $lte: new Date() }
    });

    for (const trustScore of trustScores) {
      try {
        // Import the calculate function here to avoid circular imports
        const { calculateTrustScore } = await import('./creditService');
        await calculateTrustScore(trustScore.userId);
      } catch (error) {
        logger.error(`Error updating trust score for user ${trustScore.userId}:`, error);
      }
    }

    logger.info(`Updated trust scores for ${trustScores.length} users`);
  } catch (error) {
    logger.error('Error in updateAllTrustScores:', error);
  }
}

/**
 * Expire old credit applications
 */
async function expireOldApplications(): Promise<void> {
  try {
    logger.info('Checking for expired applications');

    const expiredApplications = await CreditApplication.updateMany(
      {
        status: 'pending',
        expiresAt: { $lte: new Date() }
      },
      { status: 'expired' }
    );

    logger.info(`Expired ${expiredApplications.modifiedCount} old applications`);
  } catch (error) {
    logger.error('Error expiring applications:', error);
  }
}

/**
 * Process overdue payments and trigger autonomous collection
 */
async function processOverduePayments(): Promise<void> {
  try {
    logger.info('Processing overdue payments');

    const overdueLoans = await Loan.find({
      status: 'active',
      'repaymentSchedule.status': 'pending',
      'repaymentSchedule.dueDate': { $lte: new Date() }
    });

    for (const loan of overdueLoans) {
      try {
        // Mark overdue payments
        const updatedSchedule = loan.repaymentSchedule.map(payment => {
          if (payment.status === 'pending' && payment.dueDate <= new Date()) {
            return { ...payment, status: 'overdue' as const };
          }
          return payment;
        });

        loan.repaymentSchedule = updatedSchedule;
        await loan.save();

        // Trigger autonomous collection for severely overdue payments (> 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const severelyOverdue = updatedSchedule.filter(
          payment => payment.status === 'overdue' && payment.dueDate <= thirtyDaysAgo
        );

        if (severelyOverdue.length > 0) {
          await triggerAutonomousCollection(loan._id.toString(), loan.userId);
        }

      } catch (error) {
        logger.error(`Error processing overdue payments for loan ${loan._id}:`, error);
      }
    }

    logger.info(`Processed overdue payments for ${overdueLoans.length} loans`);
  } catch (error) {
    logger.error('Error in processOverduePayments:', error);
  }
}

/**
 * Update loan statuses and handle defaults
 */
async function updateLoanStatuses(): Promise<void> {
  try {
    logger.info('Updating loan statuses');

    const loans = await Loan.find({ status: 'active' });

    for (const loan of loans) {
      try {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        // Check for default (3-month term expired with outstanding balance)
        if (loan.dueDate <= now) {
          const totalPaid = loan.repaymentSchedule
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);

          const outstandingBalance = loan.totalDebt - totalPaid;

          if (outstandingBalance > 0) {
            // Apply 15% default penalty
            const penalty = outstandingBalance * 0.15;
            loan.defaultPenalty = penalty;
            loan.status = 'defaulted';

            // Seize collateral
            await seizeCollateral(loan.userId, loan.amountAZR);

            // Update trust score
            await penalizeTrustScore(loan.userId);

            logger.warn(`Loan ${loan._id} defaulted for user ${loan.userId}`);
          }
        }

        await loan.save();

      } catch (error) {
        logger.error(`Error updating loan status for ${loan._id}:`, error);
      }
    }

    logger.info(`Updated statuses for ${loans.length} loans`);
  } catch (error) {
    logger.error('Error in updateLoanStatuses:', error);
  }
}

/**
 * Monthly maintenance tasks
 */
async function monthlyMaintenance(): Promise<void> {
  try {
    logger.info('Running monthly maintenance');

    // Generate monthly reports
    await generateMonthlyReport();

    // Clean up old expired applications (older than 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const cleanupResult = await CreditApplication.deleteMany({
      status: 'expired',
      expiresAt: { $lte: sixMonthsAgo }
    });

    logger.info(`Cleaned up ${cleanupResult.deletedCount} expired applications`);

    // Update metrics
    await updateSystemMetrics();

  } catch (error) {
    logger.error('Error in monthly maintenance:', error);
  }
}

// Helper functions

async function triggerAutonomousCollection(loanId: string, userId: string): Promise<void> {
  try {
    // This would integrate with payment processing to automatically collect from user's account
    // For now, we'll simulate by creating a repayment transaction
    logger.info(`Triggering autonomous collection for loan ${loanId}, user ${userId}`);

    // In a real implementation, this would:
    // 1. Check user's connected bank account/payment method
    // 2. Attempt to withdraw the overdue amount
    // 3. Process the repayment if successful

  } catch (error) {
    logger.error('Error in autonomous collection:', error);
  }
}

async function seizeCollateral(userId: string, amountAZR: number): Promise<void> {
  try {
    // This would call blockchain service to seize collateral
    logger.info(`Seizing ${amountAZR} AZR collateral from user ${userId}`);
  } catch (error) {
    logger.error('Error seizing collateral:', error);
  }
}

async function penalizeTrustScore(userId: string): Promise<void> {
  try {
    const trustScore = await TrustScore.findOne({ userId });
    if (trustScore) {
      // Reduce trust score by 50% for default
      trustScore.score = Math.max(0, Math.floor(trustScore.score * 0.5));
      trustScore.factors.repaymentHistory = 0; // Reset repayment history
      await trustScore.save();

      logger.info(`Penalized trust score for user ${userId} due to default`);
    }
  } catch (error) {
    logger.error('Error penalizing trust score:', error);
  }
}

async function generateMonthlyReport(): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      newApplications,
      approvedApplications,
      activeLoans,
      repaidLoans,
      defaultedLoans
    ] = await Promise.all([
      CreditApplication.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
      CreditApplication.countDocuments({
        status: 'approved',
        approvedAt: { $gte: startOfMonth }
      }),
      Loan.countDocuments({ status: 'active' }),
      Loan.countDocuments({
        status: 'repaid',
        updatedAt: { $gte: startOfMonth }
      }),
      Loan.countDocuments({
        status: 'defaulted',
        updatedAt: { $gte: startOfMonth }
      })
    ]);

    logger.info('Monthly Report:', {
      newApplications,
      approvedApplications,
      activeLoans,
      repaidLoans,
      defaultedLoans,
      period: startOfMonth.toISOString().substring(0, 7)
    });

  } catch (error) {
    logger.error('Error generating monthly report:', error);
  }
}

async function updateSystemMetrics(): Promise<void> {
  try {
    const [
      activeLoans,
      totalLoanValue
    ] = await Promise.all([
      Loan.countDocuments({ status: 'active' }),
      Loan.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, total: { $sum: '$amountAZR' } } }
      ])
    ]);

    // Update Prometheus metrics
    const { customMetrics } = await import('../middleware/metrics');
    customMetrics.activeLoans.set(activeLoans);
    customMetrics.totalLoanValue.set(totalLoanValue[0]?.total || 0);

    logger.info('System metrics updated');
  } catch (error) {
    logger.error('Error updating system metrics:', error);
  }
}