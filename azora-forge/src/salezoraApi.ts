/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { SalezoraService } from './salezoraService';

const router = express.Router();

router.post('/campaign', async (req, res) => {
  const { name, target, strategy, deadline } = req.body;
  if (!name || !target || !strategy || !deadline) return res.status(400).json({ error: 'Missing fields' });
  try {
    const campaign = await SalezoraService.createCampaign(name, target, strategy, new Date(deadline));
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create campaign', details: err });
  }
});

router.post('/lead', async (req, res) => {
  const { userId, campaignId, score } = req.body;
  if (!userId || !campaignId || score === undefined) return res.status(400).json({ error: 'Missing fields' });
  try {
    const lead = await SalezoraService.addLead(userId, campaignId, score);
    res.json({ lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add lead', details: err });
  }
});

router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await SalezoraService.getCampaigns();
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get campaigns', details: err });
  }
});

router.get('/leads', async (req, res) => {
  const { campaignId } = req.query;
  try {
    const leads = await SalezoraService.getLeads(campaignId as string);
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leads', details: err });
  }
});

router.post('/optimize/:campaignId', async (req, res) => {
  const { campaignId } = req.params;
  try {
    const optimizedStrategy = await SalezoraService.optimizeStrategy(campaignId);
    res.json({ optimizedStrategy });
  } catch (err) {
    const errorMessage = typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : 'Unknown error';
    res.status(500).json({ error: errorMessage, details: err });
  }
});

export default router;