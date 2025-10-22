/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { useState, useEffect } from 'react';
import {
  TrustScore,
  CreditApplication,
  Loan,
  CollateralSwapRequest,
  CollateralSwapResponse,
  getUserTrustScore,
  applyForCredit,
  getUserCreditApplications,
  getUserLoans,
  makeLoanPayment,
  requestCollateralSwap,
  getCollateralSwapQuote,
  checkMintServiceHealth,
  MintApiError
} from '@/lib/api';

// Hook for trust score management
export function useTrustScore(userId: string) {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchTrustScore = async () => {
      try {
        setLoading(true);
        const score = await getUserTrustScore(userId);
        setTrustScore(score);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trust score');
      } finally {
        setLoading(false);
      }
    };

    fetchTrustScore();
  }, [userId]);

  const refresh = () => {
    if (userId) {
      const fetchTrustScore = async () => {
        try {
          const score = await getUserTrustScore(userId);
          setTrustScore(score);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to refresh trust score');
        }
      };
      fetchTrustScore();
    }
  };

  return { trustScore, loading, error, refresh };
}

// Hook for credit applications
export function useCreditApplications() {
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await getUserCreditApplications();
      setApplications(apps);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (amount: number, purpose: string) => {
    try {
      const newApp = await applyForCredit(amount, purpose);
      setApplications(prev => [newApp, ...prev]);
      return newApp;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { applications, loading, error, submitApplication, refresh: fetchApplications };
}

// Hook for loan management
export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const userLoans = await getUserLoans();
      setLoans(userLoans);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const makePayment = async (loanId: string, amount: number) => {
    try {
      const result = await makeLoanPayment(loanId, amount);
      // Refresh loans after payment
      await fetchLoans();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return { loans, loading, error, makePayment, refresh: fetchLoans };
}

// Hook for collateral swap functionality
export function useCollateralSwap() {
  const [quote, setQuote] = useState<{
    zarAmount: number;
    collateralRequired: number;
    metabolicTax: number;
    monthlyPayment: number;
    term: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = async (azrAmount: number) => {
    if (azrAmount < 100) {
      setError('Minimum collateral amount is 100 AZR');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const swapQuote = await getCollateralSwapQuote(azrAmount);
      setQuote(swapQuote);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get quote';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async (request: CollateralSwapRequest): Promise<CollateralSwapResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestCollateralSwap(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute collateral swap';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { quote, loading, error, getQuote, executeSwap };
}

// Hook for service health monitoring
export function useMintServiceHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      setLoading(true);
      await checkMintServiceHealth();
      setIsHealthy(true);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  return { isHealthy, loading, checkHealth };
}