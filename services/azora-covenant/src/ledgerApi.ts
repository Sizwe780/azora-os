/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import cors from 'cors';

const router = express.Router();

router.post('/checkpoint', async (req, res) => {
  const { nodeid, stateroot, signature, snapshot_locator } = req.body;
  if (!nodeid || !stateroot || !signature) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await LedgerService.createCheckpoint(nodeid, stateroot, signature, snapshot_locator);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkpoint', details: err });
  }
});

router.get('/state', async (req, res) => {
  try {
    const state = await LedgerService.getState();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get state', details: err });
  }
});

router.post('/entry', async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) return res.status(400).json({ error: 'Missing key or value' });
  try {
    const entry = await LedgerService.addEntry(key, value);
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add entry', details: err });
  }
});

router.get('/entry/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const entry = await LedgerService.getEntry(key);
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get entry', details: err });
  }
});

export default router;

class LedgerService {
  private static ledger: Map<string, any> = new Map();
  private static checkpoints: any[] = [];

  static async createCheckpoint(nodeid: string, stateroot: string, signature: string, snapshot_locator: string): Promise<any> {
    const checkpoint = {
      id: `checkpoint-${Date.now()}`,
      nodeid,
      stateroot,
      signature,
      snapshot_locator,
      timestamp: new Date().toISOString(),
      ledgerSize: this.ledger.size,
      stateHash: this.calculateStateHash(),
    };

    this.checkpoints.push(checkpoint);

    logger.info('Checkpoint created', { checkpointId: checkpoint.id, nodeId: nodeid });

    return checkpoint;
  }

  static async getState(): Promise<any> {
    return {
      size: this.ledger.size,
      entries: Array.from(this.ledger.entries()),
      lastCheckpoint: this.checkpoints[this.checkpoints.length - 1] || null,
      timestamp: new Date().toISOString(),
    };
  }

  static async addEntry(key: string, value: string): Promise<any> {
    const entry = {
      key,
      value,
      timestamp: new Date().toISOString(),
      hash: this.hashEntry(key, value),
    };

    this.ledger.set(key, entry);

    logger.info('Entry added to ledger', { key, hash: entry.hash });

    return entry;
  }

  static async getEntry(key: string): Promise<any> {
    const entry = this.ledger.get(key);

    if (!entry) {
      throw new Error(`Entry not found for key: ${key}`);
    }

    return entry;
  }

  private static calculateStateHash(): string {
    const crypto = require('crypto');
    const stateData = JSON.stringify(Array.from(this.ledger.entries()).sort());
    return crypto.createHash('sha256').update(stateData).digest('hex');
  }

  private static hashEntry(key: string, value: string): string {
    const crypto = require('crypto');
    const data = JSON.stringify({ key, value, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}