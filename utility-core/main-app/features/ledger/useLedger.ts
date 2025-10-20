// features/ledger/useLedger.ts
import { useState, useEffect } from 'react';
import { Block, LedgerEntry, AzoraToken } from '../../types/ledger';

export interface LedgerStats {
  totalBlocks: number;
  totalEntries: number;
  currentDifficulty: number;
  totalTokens: number;
  ecosystemValue: number;
  isValid: boolean;
}

export function useLedger() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pendingEntries, setPendingEntries] = useState<LedgerEntry[]>([]);
  const [tokens, setTokens] = useState<AzoraToken[]>([]);
  const [stats, setStats] = useState<LedgerStats>({
    totalBlocks: 0,
    totalEntries: 0,
    currentDifficulty: 0,
    totalTokens: 0,
    ecosystemValue: 0,
    isValid: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/v1/ledger?action=blocks');
      const data = await response.json();
      setBlocks(data);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    }
  };

  const fetchPendingEntries = async () => {
    try {
      const response = await fetch('/api/v1/ledger?action=pending');
      const data = await response.json();
      setPendingEntries(data);
    } catch (error) {
      console.error('Failed to fetch pending entries:', error);
    }
  };

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/v1/ledger?action=tokens');
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/ledger?action=stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const recordTransaction = async (txId: string, from: string, to: string, amount: number, type?: string) => {
    try {
      const response = await fetch('/api/v1/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transaction', txId, from, to, amount, type }),
      });
      const entry = await response.json();
      await Promise.all([fetchBlocks(), fetchPendingEntries(), fetchStats()]);
      return entry;
    } catch (error) {
      console.error('Failed to record transaction:', error);
      throw error;
    }
  };

  const mintToken = async (clientId: string, amount?: number) => {
    try {
      const response = await fetch('/api/v1/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mint', clientId, amount }),
      });
      const token = await response.json();
      await fetchTokens();
      await fetchStats();
      return token;
    } catch (error) {
      console.error('Failed to mint token:', error);
      throw error;
    }
  };

  const forceMineBlock = async () => {
    try {
      const response = await fetch('/api/v1/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mine' }),
      });
      const result = await response.json();
      await Promise.all([fetchBlocks(), fetchPendingEntries(), fetchStats()]);
      return result;
    } catch (error) {
      console.error('Failed to mine block:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchBlocks(), fetchPendingEntries(), fetchTokens(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return {
    blocks,
    pendingEntries,
    tokens,
    stats,
    loading,
    recordTransaction,
    mintToken,
    forceMineBlock,
    refresh: () => {
      fetchBlocks();
      fetchPendingEntries();
      fetchTokens();
      fetchStats();
    },
  };
}