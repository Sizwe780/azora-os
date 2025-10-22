/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// types/ledger.ts
export interface LedgerEntry {
  id: string;
  timestamp: number;
  data: unknown;
  previousHash: string;
  hash: string;
  signature: string;
  publicKey: string;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
}

export interface Block {
  index: number;
  timestamp: number;
  entries: LedgerEntry[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  merkleRoot: string;
  minerReward: number;
}

export interface AzoraToken {
  id: string;
  owner: string;
  amount: number;
  minted: boolean;
}