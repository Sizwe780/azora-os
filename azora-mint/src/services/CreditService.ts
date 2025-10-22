/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import mongoose from 'mongoose';
import * as cron from 'node-cron';
import OpenAI from 'openai';

// Interfaces
interface TrustScoreFactors {
  transactionHistory: number;
  socialConnections: number;
  reputation: number;
  financialStability: number;
  communityEngagement: number;
}

interface TrustScore {
  overall: number;
  factors: TrustScoreFactors;
  lastUpdated: Date;
}

// MongoDB Schemas
const creditApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  purpose: {
    type: String,
    enum: ['business', 'personal', 'education', 'emergency'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  trustScore: { type: Number, min: 0, max: 100 },
  approvedAmount: Number,
  interestRate: Number,
  termMonths: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const loanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  applicationId: { type: String, required: true },
  amount: { type: Number, required: true },
  outstandingBalance: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  monthlyPayment: { type: Number, required: true },
  nextPaymentDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'paid_off', 'defaulted'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const repaymentSchema = new mongoose.Schema({
  loanId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  metabolicTax: { type: Number, default: 0 }, // 20% goes to autonomous collection
  status: {
    type: String,
    enum: ['processed', 'failed'],
    default: 'processed'
  }
});

const trustScoreSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  overall: { type: Number, min: 0, max: 100, required: true },
  factors: {
    transactionHistory: { type: Number, min: 0, max: 100 },
    socialConnections: { type: Number, min: 0, max: 100 },
    reputation: { type: Number, min: 0, max: 100 },
    financialStability: { type: Number, min: 0, max: 100 },
    communityEngagement: { type: Number, min: 0, max: 100 }
  },
  lastUpdated: { type: Date, default: Date.now }
});

// Models
const CreditApplication = mongoose.model('CreditApplication', creditApplicationSchema);
const Loan = mongoose.model('Loan', loanSchema);
const Repayment = mongoose.model('Repayment', repaymentSchema);
const TrustScore = mongoose.model('TrustScore', trustScoreSchema);

export class CreditService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Apply for credit with AI-driven approval
   */
  async applyForCredit(userId: string, amount: number, purpose: string) {
    try {
      // Get or calculate trust score
      const trustScore = await this.getTrustScore(userId);

      // Use AI to analyze creditworthiness
      const aiAnalysis = await this.analyzeCreditApplication(userId, amount, purpose, trustScore);

      // Determine approval based on AI analysis and trust score
      const isApproved = aiAnalysis.approved && trustScore.overall >= 60;
      const approvedAmount = isApproved ? Math.min(amount, aiAnalysis.suggestedAmount) : 0;

      // Create application record
      const application = new CreditApplication({
        userId,
        amount,
        purpose,
        status: isApproved ? 'approved' : 'rejected',
        trustScore: trustScore.overall,
        approvedAmount,
        interestRate: aiAnalysis.interestRate,
        termMonths: aiAnalysis.termMonths
      });

      await application.save();

      // If approved, create loan
      if (isApproved) {
        await this.createLoan(application._id.toString(), userId, approvedAmount, aiAnalysis.interestRate, aiAnalysis.termMonths);
      }

      return {
        applicationId: application._id,
        status: application.status,
        approvedAmount,
        interestRate: aiAnalysis.interestRate,
        termMonths: aiAnalysis.termMonths,
        aiAnalysis: aiAnalysis.reasoning
      };
    } catch (error) {
      console.error('Credit application error:', error);
      throw error;
    }
  }

  /**
   * Use AI to analyze credit application
   */
  private async analyzeCreditApplication(userId: string, amount: number, purpose: string, trustScore: any) {
    try {
      const prompt = `
        Analyze this credit application for Azora OS micro-credit protocol:

        User Trust Score: ${trustScore.overall}/100
        Factors:
        - Transaction History: ${trustScore.factors.transactionHistory}/100
        - Social Connections: ${trustScore.factors.socialConnections}/100
        - Reputation: ${trustScore.factors.reputation}/100
        - Financial Stability: ${trustScore.factors.financialStability}/100
        - Community Engagement: ${trustScore.factors.communityEngagement}/100

        Requested Amount: $${amount}
        Purpose: ${purpose}

        Based on Azora Constitution Article VIII.6, provide:
        1. Approval decision (true/false)
        2. Suggested loan amount (if approved)
        3. Interest rate (0-15%)
        4. Term in months (1-24)
        5. Reasoning for the decision

        Return as JSON with keys: approved, suggestedAmount, interestRate, termMonths, reasoning
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        approved: result.approved || false,
        suggestedAmount: result.suggestedAmount || 0,
        interestRate: result.interestRate || 5,
        termMonths: result.termMonths || 12,
        reasoning: result.reasoning || 'AI analysis completed'
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to rule-based decision
      return {
        approved: trustScore.overall >= 70,
        suggestedAmount: Math.min(amount, 1000),
        interestRate: 5,
        termMonths: 12,
        reasoning: 'Fallback rule-based decision due to AI error'
      };
    }
  }

  /**
   * Create a loan from approved application
   */
  private async createLoan(applicationId: string, userId: string, amount: number, interestRate: number, termMonths: number) {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                          (Math.pow(1 + monthlyRate, termMonths) - 1);

    const loan = new Loan({
      userId,
      applicationId,
      amount,
      outstandingBalance: amount,
      interestRate,
      termMonths,
      monthlyPayment,
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await loan.save();
    return loan;
  }

  /**
   * Get user's credit applications
   */
  async getUserApplications(userId: string) {
    return await CreditApplication.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get user's active loans
   */
  async getUserLoans(userId: string) {
    return await Loan.find({ userId, status: 'active' });
  }

  /**
   * Process loan repayment
   */
  async makeRepayment(userId: string, loanId: string, amount: number) {
    const loan = await Loan.findOne({ _id: loanId, userId, status: 'active' });

    if (!loan) {
      throw new Error('Loan not found or not active');
    }

    // Calculate metabolic tax (20%)
    const metabolicTax = amount * 0.20;
    const actualPayment = amount - metabolicTax;

    // Update loan balance
    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - actualPayment);

    if (loan.outstandingBalance <= 0) {
      loan.status = 'paid_off';
    }

    // Calculate next payment date
    const nextPayment = new Date(loan.nextPaymentDate);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    loan.nextPaymentDate = nextPayment;

    await loan.save();

    // Record repayment
    const repayment = new Repayment({
      loanId,
      userId,
      amount,
      metabolicTax
    });

    await repayment.save();

    return {
      loanId,
      amountPaid: actualPayment,
      metabolicTax,
      remainingBalance: loan.outstandingBalance,
      status: loan.status
    };
  }

  /**
   * Calculate or retrieve trust score
   */
  async getTrustScore(userId: string): Promise<any> {
    let trustScore = await TrustScore.findOne({ userId });

    if (!trustScore || (Date.now() - trustScore.lastUpdated.getTime()) > 24 * 60 * 60 * 1000) {
      // Calculate new trust score
      const factors = await this.calculateTrustFactors(userId);

      const overall = Math.round(
        (factors.transactionHistory * 0.3) +
        (factors.socialConnections * 0.2) +
        (factors.reputation * 0.2) +
        (factors.financialStability * 0.2) +
        (factors.communityEngagement * 0.1)
      );

      if (trustScore) {
        trustScore.overall = overall;
        trustScore.factors = factors;
        trustScore.lastUpdated = new Date();
        await trustScore.save();
      } else {
        trustScore = new TrustScore({
          userId,
          overall,
          factors
        });
        await trustScore.save();
      }
    }

    return trustScore;
  }

  /**
   * Calculate trust score factors
   */
  private async calculateTrustFactors(userId: string): Promise<TrustScoreFactors> {
    // This would integrate with various data sources
    // For now, return mock data based on user activity
    const applications = await CreditApplication.countDocuments({ userId });
    const successfulRepayments = await Repayment.countDocuments({ userId, status: 'processed' });

    return {
      transactionHistory: Math.min(100, successfulRepayments * 10),
      socialConnections: Math.min(100, applications * 5 + 50), // Mock social factor
      reputation: Math.min(100, successfulRepayments * 8 + 40),
      financialStability: Math.min(100, successfulRepayments * 12 + 30),
      communityEngagement: Math.min(100, applications * 6 + 45)
    };
  }

  /**
   * Start autonomous collection cron job (runs daily)
   */
  startAutonomousCollection() {
    cron.schedule('0 0 * * *', async () => {
      console.log('🔄 Running autonomous collection...');

      try {
        // Find overdue loans
        const overdueLoans = await Loan.find({
          status: 'active',
          nextPaymentDate: { $lt: new Date() }
        });

        for (const loan of overdueLoans) {
          // Collect 20% metabolic tax from user's holdings
          const metabolicTax = loan.monthlyPayment * 0.20;

          // In a real implementation, this would interact with the blockchain/wallet
          console.log(`Collected ${metabolicTax} AZR metabolic tax from user ${loan.userId} for loan ${loan._id}`);

          // Update loan status if severely overdue
          const daysOverdue = Math.floor((Date.now() - loan.nextPaymentDate.getTime()) / (24 * 60 * 60 * 1000));

          if (daysOverdue > 90) {
            loan.status = 'defaulted';
            await loan.save();
            console.log(`Loan ${loan._id} marked as defaulted`);
          }
        }

        console.log(`✅ Autonomous collection completed for ${overdueLoans.length} loans`);
      } catch (error) {
        console.error('Autonomous collection error:', error);
      }
    });
  }
}