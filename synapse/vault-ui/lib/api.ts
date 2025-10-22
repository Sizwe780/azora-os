/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// API integration for Azora Mint (Anti-Bank Protocol)
// Connects vault UI to mint.azora.world service

const MINT_API_BASE = process.env.NEXT_PUBLIC_MINT_API_URL || 'http://localhost:3006';

export interface TrustScore {
  overall: number;
  factors: {
    systemUse: number;
    codeCompliance: number;
    socialLedger: number;
    repaymentHistory: number;
    valueCreation: number;
  };
  lastUpdated: string;
  eligible: boolean;
}

export interface CreditApplication {
  id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  trustScore: number;
  createdAt: string;
  approvedAt?: string;
}

export interface Loan {
  id: string;
  amount: number;
  collateralAmount: number;
  term: number; // months
  status: 'active' | 'paid' | 'defaulted';
  nextPaymentDue: string;
  nextPaymentAmount: number;
  remainingPayments: number;
  metabolicTax: number;
}

export interface CollateralSwapRequest {
  azrAmount: number;
  zarAmount: number;
  term: number;
}

export interface CollateralSwapResponse {
  loanId: string;
  collateralLocked: number;
  amountDisbursed: number;
  metabolicTax: number;
  nextPaymentDue: string;
  repaymentSchedule: Array<{
    dueDate: string;
    amount: number;
  }>;
}

// Trust Score API
export async function getUserTrustScore(userId: string): Promise<TrustScore> {
  const response = await fetch(`${MINT_API_BASE}/api/trust/score`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch trust score');
  }

  return response.json();
}

// Credit Application API
export async function applyForCredit(amount: number, purpose: string): Promise<CreditApplication> {
  const response = await fetch(`${MINT_API_BASE}/api/credit/apply`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount, purpose }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit credit application');
  }

  return response.json();
}

export async function getUserCreditApplications(): Promise<CreditApplication[]> {
  const response = await fetch(`${MINT_API_BASE}/api/credit/applications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch credit applications');
  }

  const data = await response.json();
  return data.applications;
}

// Loan Management API
export async function getUserLoans(): Promise<Loan[]> {
  const response = await fetch(`${MINT_API_BASE}/api/credit/loans`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch loans');
  }

  const data = await response.json();
  return data.loans;
}

export async function makeLoanPayment(loanId: string, amount: number): Promise<{ success: boolean; transactionId: string }> {
  const response = await fetch(`${MINT_API_BASE}/api/credit/repay/${loanId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    throw new Error('Failed to process payment');
  }

  return response.json();
}

// Anti-Bank Protocol - Collateral Swap
export async function requestCollateralSwap(request: CollateralSwapRequest): Promise<CollateralSwapResponse> {
  const response = await fetch(`${MINT_API_BASE}/api/antibank/collateral-swap`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to process collateral swap');
  }

  return response.json();
}

export async function getCollateralSwapQuote(azrAmount: number): Promise<{
  zarAmount: number;
  collateralRequired: number;
  metabolicTax: number;
  monthlyPayment: number;
  term: number;
}> {
  const response = await fetch(`${MINT_API_BASE}/api/antibank/quote?azrAmount=${azrAmount}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get quote');
  }

  return response.json();
}

// Utility functions
function getAuthToken(): string {
  // In a real implementation, this would get the token from auth context/storage
  // For now, return a placeholder
  return localStorage.getItem('authToken') || '';
}

export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

// Error handling utility
export class MintApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'MintApiError';
  }
}

// Health check
export async function checkMintServiceHealth(): Promise<{ status: string; version: string }> {
  const response = await fetch(`${MINT_API_BASE}/api/health`);

  if (!response.ok) {
    throw new MintApiError('Mint service is unavailable', response.status);
  }

  return response.json();
}