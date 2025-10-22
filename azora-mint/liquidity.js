/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let pools = {};

app.post('/api/liquidity/pool/seed', (req, res) => {
  const { poolid, seedamountazr, seedamountstable, ownermultisig } = req.body;
  pools[poolid] = {
    azr: seedamountazr,
    stable: seedamountstable,
    tvl: seedamountazr + seedamountstable
  };
  res.json({ poolref: poolid, initialtvl: pools[poolid].tvl });
});

app.post('/api/liquidity/swap', (req, res) => {
  const { poolid, amountIn, tokenIn } = req.body;
  const pool = pools[poolid];
  if (!pool) return res.status(404).json({ error: 'Pool not found' });
  const amountOut = tokenIn === 'AZR' ? (amountIn * pool.stable) / pool.azr : (amountIn * pool.azr) / pool.stable;
  res.json({ amountOut });
});

const PORT = process.env.LIQUIDITY_PORT || 4100;
app.listen(PORT, () => console.log(`✅ Liquidity Service running on port ${PORT}`));
