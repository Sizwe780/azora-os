/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { MarketplaceService } from './marketplaceService';

const router = express.Router();

router.post('/list', async (req, res) => {
  const { userId, item, price } = req.body;
  if (!userId || !item || price === undefined) return res.status(400).json({ error: 'Missing fields' });
  try {
    const listing = await MarketplaceService.createListing(userId, item, price);
    res.json({ listed: true, id: listing.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list item', details: err });
  }
});

router.get('/listings', async (req, res) => {
  try {
    const listings = await MarketplaceService.getListings();
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get listings', details: err });
  }
});

router.post('/purchase', async (req, res) => {
  const { listingId, buyerId } = req.body;
  if (!listingId || !buyerId) return res.status(400).json({ error: 'Missing fields' });
  try {
    const transaction = await MarketplaceService.purchaseListing(listingId, buyerId);
    res.json({ purchased: true, transactionId: transaction.id });
  } catch (err) {
    const errorMessage = typeof err === 'object' && err !== null && 'message' in err ? (err as { message: string }).message : 'Failed to purchase listing';
    res.status(500).json({ error: errorMessage, details: err });
  }
});

export default router;