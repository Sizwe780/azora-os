/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4092;

// Fee collection mechanism (explicit for audit)
function collectFee(amountUSD) {
  const bps = Number(process.env.FEE_BPS || 10);
  const min = Number(process.env.FEE_MIN_USD || 0.01);
  const pct = (Number(amountUSD) * bps) / 10000;
  return Math.max(pct, min);
}

app.post('/api/fees/quote', (req, res) => {
  const { amountUSD } = req.body || {};
  if (isNaN(Number(amountUSD))) return res.status(400).json({ error: 'amountUSD required' });
  const feeUSD = collectFee(Number(amountUSD));
  res.json({ amountUSD: Number(amountUSD), feeUSD, feeBps: Number(process.env.FEE_BPS || 10), minUSD: Number(process.env.FEE_MIN_USD || 0.01), transparencyNote: 'Fees fund maintenance, security, and development. Fixed supply honored.' });
});

app.post('/api/fees/collect', (req, res) => {
  const { txId, amountUSD } = req.body || {};
  if (!txId || isNaN(Number(amountUSD))) return res.status(400).json({ error: 'txId and amountUSD required' });
  const feeUSD = collectFee(Number(amountUSD));
  // TODO: move AZR or stablecoin; record entry
  res.json({ ok: true, txId, charged: feeUSD });
});

app.listen(PORT, () => {
  console.log(`azora-coin-integration listening on ${PORT}`);
});

export type FeeQuote = { amountUSD: number; feeUSD: number; feeBps: number; minUSD: number; transparencyNote: string; };

export class AzoraSDK {
  constructor(private baseUrl = process.env.AZORA_COIN_SERVICE_URL || 'http://localhost:4092') {}

  async feeQuote(amountUSD: number): Promise<FeeQuote> {
    const r = await fetch(`${this.baseUrl}/api/fees/quote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountUSD }) });
    if (!r.ok) throw new Error(`feeQuote failed ${r.status}`);
    return r.json();
  }

  async collectFee(txId: string, amountUSD: number): Promise<{ ok: boolean; txId: string; charged: number; }> {
    const r = await fetch(`${this.baseUrl}/api/fees/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ txId, amountUSD }) });
    if (!r.ok) throw new Error(`collectFee failed ${r.status}`);
    return r.json();
  }
}