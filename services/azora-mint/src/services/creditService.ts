import axios from 'axios';
import { CreditApplication, TrustScore, Loan } from '../models/Credit';
import { customMetrics } from '../middleware/metrics';
import { aiRateLimiter } from '../middleware/rateLimiter';
import logger from '../middleware/requestLogger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3007';
const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3002';

/**
 * Calculate trust score for a user
 */
export async function calculateTrustScore(userId: string): Promise<number> {
  try {
    // Rate limit AI operations
    await aiRateLimiter.consume('trust_calculation');

    // Gather data from various sources
    const [
      userActivity,
      codeQuality,
      socialData,
      repaymentHistory,
      valueCreation
    ] = await Promise.all([
      getUserActivityData(userId),
      getCodeQualityData(userId),
      getSocialLedgerData(userId),
      getRepaymentHistoryData(userId),
      getValueCreationData(userId),
    ]);

    // Calculate weighted factors (0-100 each)
    const factors = {
      systemUse: Math.min(userActivity.score, 100),
      compliance: Math.min(codeQuality.score, 100),
      socialLedger: Math.min(socialData.score, 100),
      repaymentHistory: Math.min(repaymentHistory.score, 100),
      valueCreation: Math.min(valueCreation.score, 100),
    };

    // Weighted average (system use and value creation have higher weight)
    const weights = {
      systemUse: 0.25,
      compliance: 0.15,
      socialLedger: 0.20,
      repaymentHistory: 0.20,
      valueCreation: 0.20,
    };

    const trustScore = Math.round(
      factors.systemUse * weights.systemUse +
      factors.compliance * weights.compliance +
      factors.socialLedger * weights.socialLedger +
      factors.repaymentHistory * weights.repaymentHistory +
      factors.valueCreation * weights.valueCreation
    );

    // Update or create trust score record
    await TrustScore.findOneAndUpdate(
      { userId },
      {
        score: trustScore,
        factors,
        lastCalculated: new Date(),
        nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next update in 24 hours
      },
      { upsert: true, new: true }
    );

    customMetrics.trustScoresCalculated.inc();

    logger.info(`Trust score calculated for user ${userId}: ${trustScore}`);

    return trustScore;

  } catch (error) {
    logger.error('Error calculating trust score:', error);
    throw error;
  }
}

/**
 * Analyze credit application using AI
 */
export async function analyzeCreditApplication(
  userId: string,
  amountRequested: number,
  purpose: string,
  trustScore: number
): Promise<{
  riskAssessment: string;
  recommendedAmount: number;
  confidence: number;
  reasoning: string;
}> {
  try {
    // Rate limit AI operations
    await aiRateLimiter.consume('credit_analysis');

    const startTime = Date.now();

    // Get additional context
    const userProfile = await getUserProfileData(userId);
    const marketData = await getMarketConditions();

    // Call AI service for analysis
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/credit-analysis`, {
      userId,
      amountRequested,
      purpose,
      trustScore,
      userProfile,
      marketData,
    }, {
      timeout: 30000, // 30 second timeout
    });

    const analysis = aiResponse.data;

    const duration = (Date.now() - startTime) / 1000;
    logger.info(`Credit analysis completed for user ${userId}, duration: ${duration}s`);

    return {
      riskAssessment: analysis.riskAssessment,
      recommendedAmount: Math.min(analysis.recommendedAmount, amountRequested),
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
    };

  } catch (error) {
    logger.error('Error analyzing credit application:', error);

    // Fallback analysis if AI service fails
    return {
      riskAssessment: trustScore >= 70 ? 'low_risk' : 'medium_risk',
      recommendedAmount: Math.min(amountRequested, trustScore >= 70 ? amountRequested : amountRequested * 0.5),
      confidence: 0.5,
      reasoning: 'AI service temporarily unavailable, using fallback analysis based on trust score',
    };
  }
}

/**
 * Process credit approval and create loan
 */
export async function processCreditApproval(
  applicationId: string
): Promise<{ loanId: string; disbursementDetails: any }> {
  try {
    const application = await CreditApplication.findById(applicationId);
    if (!application || application.status !== 'approved') {
      throw new Error('Invalid application');
    }

    // Calculate loan terms
    const amountZAR = application.approvedAmount!;
    const metabolicTax = amountZAR * 0.20; // 20% metabolic tax
    const totalDebt = amountZAR + metabolicTax;

    // Get current ICV (Intrinsic Coin Value) from blockchain service
    const icvResponse = await axios.get(`${BLOCKCHAIN_SERVICE_URL}/api/icv`);
    const icv = icvResponse.data.icv; // ZAR per AZR

    const amountAZR = Math.ceil(totalDebt / icv); // Collateral required

    // Create loan record
    const loan = new Loan({
      userId: application.userId,
      applicationId: application._id,
      amountZAR,
      amountAZR,
      metabolicTax,
      totalDebt,
      disbursementDate: new Date(),
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      repaymentSchedule: generateRepaymentSchedule(totalDebt, 6), // 6 monthly payments
    });

    await loan.save();

    // Lock collateral on blockchain
    await lockCollateral(application.userId, amountAZR);

    // Disburse funds (this would integrate with payment processor)
    const disbursementDetails = await disburseFunds(application.userId, amountZAR);

    customMetrics.creditApprovalsTotal.inc();
    customMetrics.activeLoans.inc();
    customMetrics.totalLoanValue.inc(amountAZR);

    logger.info(`Loan created for user ${application.userId}: ${amountZAR} ZAR`);

    return {
      loanId: loan._id.toString(),
      disbursementDetails,
    };

  } catch (error) {
    logger.error('Error processing credit approval:', error);
    throw error;
  }
}

/**
 * Process loan repayment
 */
export async function processRepayment(
  loanId: string,
  amount: number,
  method: 'manual' | 'autonomous_collection' = 'manual'
): Promise<{ status: string; remainingBalance: number }> {
  try {
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== 'active') {
      throw new Error('Invalid loan');
    }

    // Update repayment schedule
    const updatedSchedule = updateRepaymentSchedule(loan.repaymentSchedule, amount);
    loan.repaymentSchedule = updatedSchedule;

    // Check if loan is fully repaid
    const totalPaid = updatedSchedule
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const remainingBalance = loan.totalDebt - totalPaid;

    if (remainingBalance <= 0) {
      loan.status = 'repaid';
      loan.collateralReleased = true;

      // Release collateral
      await releaseCollateral(loan.userId, loan.amountAZR);

      customMetrics.activeLoans.dec();
      customMetrics.totalLoanValue.dec(loan.amountAZR);
    }

    await loan.save();
    customMetrics.creditRepaymentsTotal.inc();

    logger.info(`Repayment processed for loan ${loanId}: ${amount} ZAR`);

    return {
      status: loan.status,
      remainingBalance: Math.max(0, remainingBalance),
    };

  } catch (error) {
    logger.error('Error processing repayment:', error);
    throw error;
  }
}

// Helper functions

async function getUserActivityData(userId: string): Promise<{ score: number }> {
  // This would integrate with user service to get activity data
  // For now, return mock data
  return { score: 75 };
}

async function getCodeQualityData(userId: string): Promise<{ score: number }> {
  // This would integrate with code analysis service
  return { score: 80 };
}

async function getSocialLedgerData(userId: string): Promise<{ score: number }> {
  // This would integrate with social service
  return { score: 70 };
}

async function getRepaymentHistoryData(userId: string): Promise<{ score: number }> {
  // Check past loan repayment history
  const pastLoans = await Loan.find({ userId, status: { $in: ['repaid', 'defaulted'] } });
  if (pastLoans.length === 0) return { score: 50 }; // Neutral for new users

  const repaidLoans = pastLoans.filter(loan => loan.status === 'repaid').length;
  const repaymentRate = repaidLoans / pastLoans.length;

  return { score: Math.round(repaymentRate * 100) };
}

async function getValueCreationData(userId: string): Promise<{ score: number }> {
  // This would integrate with bounty/marketplace services
  return { score: 85 };
}

async function getUserProfileData(userId: string): Promise<any> {
  // This would fetch comprehensive user profile
  return { userId, profileCompleteness: 0.8 };
}

async function getMarketConditions(): Promise<any> {
  // This would get current market data
  return { icv: 10, marketSentiment: 'positive' };
}

function generateRepaymentSchedule(totalDebt: number, months: number): Array<{
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
}> {
  const monthlyAmount = totalDebt / months;
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    schedule.push({
      dueDate: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000), // Monthly
      amount: monthlyAmount,
      status: 'pending' as const,
    });
  }

  return schedule;
}

function updateRepaymentSchedule(
  schedule: Array<{
    dueDate: Date;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paidAt?: Date;
  }>,
  paymentAmount: number
): typeof schedule {
  let remainingPayment = paymentAmount;

  return schedule.map(payment => {
    if (payment.status === 'paid' || remainingPayment <= 0) {
      return payment;
    }

    if (remainingPayment >= payment.amount) {
      remainingPayment -= payment.amount;
      return {
        ...payment,
        status: 'paid',
        paidAt: new Date(),
      };
    } else {
      // Partial payment - this is simplified, in reality might need more complex logic
      return payment;
    }
  });
}

async function lockCollateral(userId: string, amountAZR: number): Promise<void> {
  // This would call blockchain service to lock collateral
  logger.info(`Locking ${amountAZR} AZR collateral for user ${userId}`);
}

async function releaseCollateral(userId: string, amountAZR: number): Promise<void> {
  // This would call blockchain service to release collateral
  logger.info(`Releasing ${amountAZR} AZR collateral for user ${userId}`);
}

async function disburseFunds(userId: string, amountZAR: number): Promise<any> {
  // This would integrate with payment processor to disburse funds
  logger.info(`Disbursing ${amountZAR} ZAR to user ${userId}`);
  return { transactionId: `tx_${Date.now()}`, status: 'completed' };
}