/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import DomainListing, { DomainBid, DomainWatchlist } from '../models/Domain';
import { customMetrics } from '../middleware/metrics';
import { biddingRateLimiter, watchlistRateLimiter } from '../middleware/rateLimiter';
import logger from '../utils/logger';

const router = Router();

// Note: AuthenticatedRequest is defined globally via Express namespace extension
type AuthenticatedRequest = Request;

// Middleware for bidding rate limiting
const biddingRateLimitMiddleware = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const userId = req.user?.id || req.ip || 'anonymous';
    await biddingRateLimiter.consume(userId);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many bidding attempts, please try again later.',
        statusCode: 429
      }
    });
  }
};

// Middleware for watchlist rate limiting
const watchlistRateLimitMiddleware = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  try {
    const userId = req.user?.id || req.ip || 'anonymous';
    await watchlistRateLimiter.consume(userId);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many watchlist additions, please try again later.',
        statusCode: 429
      }
    });
  }
};

/**
 * @swagger
 * /api/v1/marketplace/list:
 *   post:
 *     summary: List a domain for sale
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - price
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "example.com"
 *               price:
 *                 type: number
 *                 example: 1000
 *               currency:
 *                 type: string
 *                 default: "USD"
 *                 example: "USD"
 *               featured:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *     responses:
 *       200:
 *         description: Domain listed for sale successfully
 */
router.post('/list', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, price, currency = 'USD', featured = false } = req.body;
    const userId = req.user?.id || 'anonymous';

    if (!domain || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Domain and price are required'
      });
    }

    const normalizedDomain = domain.toLowerCase().trim();

    // Find and update domain listing
    const domainListing = await DomainListing.findOne({
      domain: normalizedDomain,
      owner: userId
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or access denied'
      });
    }

    if (domainListing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Domain is not available for listing'
      });
    }

    // Update domain for sale
    domainListing.status = 'listed';
    domainListing.price = price;
    domainListing.currency = currency;
    domainListing.featured = featured;

    await domainListing.save();

    customMetrics.domainsListedTotal.inc();

    res.json({
      success: true,
      data: domainListing
    });
  } catch (error: any) {
    logger.error('Error listing domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/marketplace/bid:
 *   post:
 *     summary: Place a bid on a domain
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - amount
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "example.com"
 *               amount:
 *                 type: number
 *                 example: 1500
 *               currency:
 *                 type: string
 *                 default: "USD"
 *                 example: "USD"
 *               message:
 *                 type: string
 *                 example: "I'm very interested in this domain"
 *     responses:
 *       201:
 *         description: Bid placed successfully
 */
router.post('/bid', biddingRateLimitMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, amount, currency = 'USD', message } = req.body;
    const userId = req.user?.id || 'anonymous';

    if (!domain || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Domain and amount are required'
      });
    }

    const normalizedDomain = domain.toLowerCase().trim();

    // Find domain listing
    const domainListing = await DomainListing.findOne({
      domain: normalizedDomain,
      status: 'listed'
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or not for sale'
      });
    }

    // Check if user is not bidding on their own domain
    if (domainListing.owner === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own domain'
      });
    }

    // Create bid
    const bid = new DomainBid({
      domainId: domainListing._id,
      bidder: userId,
      amount,
      currency,
      message
    });

    await bid.save();

    // Update domain inquiry count
    domainListing.inquiries += 1;
    await domainListing.save();

    customMetrics.bidsPlacedTotal.inc();

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error: any) {
    logger.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/marketplace/bids/{domain}:
 *   get:
 *     summary: Get bids for a domain
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain name
 *     responses:
 *       200:
 *         description: Bids retrieved successfully
 */
router.get('/bids/:domain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const userId = req.user?.id || 'anonymous';

    const normalizedDomain = domain.toLowerCase().trim();

    // Find domain listing
    const domainListing = await DomainListing.findOne({
      domain: normalizedDomain,
      owner: userId
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or access denied'
      });
    }

    // Get bids for this domain
    const bids = await DomainBid.find({
      domainId: domainListing._id,
      status: 'active'
    }).sort({ amount: -1, createdAt: -1 });

    res.json({
      success: true,
      data: bids
    });
  } catch (error: any) {
    logger.error('Error fetching bids:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bids',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/marketplace/buy/{domain}:
 *   post:
 *     summary: Buy a domain immediately
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: domain
 *         required: true
 *         schema:
 *           type: string
 *         description: Domain name
 *     responses:
 *       200:
 *         description: Domain purchased successfully
 */
router.post('/buy/:domain', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain } = req.params;
    const userId = req.user?.id || 'anonymous';

    const normalizedDomain = domain.toLowerCase().trim();

    // Find domain listing
    const domainListing = await DomainListing.findOne({
      domain: normalizedDomain,
      status: 'listed'
    });

    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found or not for sale'
      });
    }

    // Check if user is not buying their own domain
    if (domainListing.owner === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot buy your own domain'
      });
    }

    // Mark domain as sold
    domainListing.status = 'sold';
    domainListing.buyer = userId;
    domainListing.soldAt = new Date();
    domainListing.soldPrice = domainListing.price;

    await domainListing.save();

    customMetrics.domainsSoldTotal.inc();

    res.json({
      success: true,
      data: domainListing,
      message: 'Domain purchased successfully'
    });
  } catch (error: any) {
    logger.error('Error purchasing domain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase domain',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/marketplace/watchlist:
 *   post:
 *     summary: Add domain to watchlist
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *             properties:
 *               domain:
 *                 type: string
 *                 example: "example.com"
 *               alertPrice:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Domain added to watchlist successfully
 */
router.post('/watchlist', watchlistRateLimitMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain, alertPrice } = req.body;
    const userId = req.user?.id || 'anonymous';

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: 'Domain is required'
      });
    }

    const normalizedDomain = domain.toLowerCase().trim();

    // Check if domain exists
    const domainListing = await DomainListing.findOne({ domain: normalizedDomain });
    if (!domainListing) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Add to watchlist
    const watchlistItem = new DomainWatchlist({
      userId,
      domain: normalizedDomain,
      alertPrice
    });

    await watchlistItem.save();

    res.status(201).json({
      success: true,
      data: watchlistItem
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Domain already in watchlist'
      });
    }

    logger.error('Error adding to watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add domain to watchlist',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/marketplace/watchlist:
 *   get:
 *     summary: Get user's watchlist
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchlist retrieved successfully
 */
router.get('/watchlist', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'anonymous';

    const watchlist = await DomainWatchlist.find({ userId })
      .populate('domain')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: watchlist
    });
  } catch (error: any) {
    logger.error('Error fetching watchlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist',
      error: error.message
    });
  }
});

export default router;