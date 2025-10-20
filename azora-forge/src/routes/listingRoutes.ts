import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Listing, Transaction } from '../models/Listing';
import { customMetrics } from '../middleware/metrics';
import logger from '../middleware/requestLogger';

const router = Router();

// Extend Express Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
  };
}

/**
 * @swagger
 * /api/listings:
 *   get:
 *     summary: Get all active listings
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of listings
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20
    } = req.query;

    const query: any = { status: 'active' };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
    }

    let searchQuery = Listing.find(query);

    if (search) {
      searchQuery = searchQuery.find({
        $text: { $search: search as string }
      });
    }

    const listings = await searchQuery
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .populate('seller', 'username walletAddress');

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', [
  param('id').isMongoId()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    res.json({ success: true, data: listing });
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/listings:
 *   post:
 *     summary: Create a new listing
 *     security:
 *       - bearerAuth: []
 */
router.post('/', [
  body('title').isLength({ min: 5, max: 100 }),
  body('description').isLength({ min: 10, max: 1000 }),
  body('category').notEmpty(),
  body('price').isFloat({ min: 0.01 }),
  body('deliveryMethod').isIn(['digital', 'service']),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const listing = new Listing({
      ...req.body,
      sellerId: req.user.id,
    });

    await listing.save();
    customMetrics.listingsCreatedTotal.inc();

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/listings/{id}/purchase:
 *   post:
 *     summary: Purchase a listing (P2P transfer facilitation)
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/purchase', [
  param('id').isMongoId(),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Listing is not available' });
    }

    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot purchase your own listing' });
    }

    // Create transaction record (facilitation only)
    const transaction = new Transaction({
      listingId: listing._id,
      buyerId: req.user.id,
      sellerId: listing.sellerId,
      amount: listing.price,
      status: 'pending',
    });

    await transaction.save();

    // Mark listing as sold
    listing.status = 'sold';
    await listing.save();

    customMetrics.transactionsTotal.inc();

    res.json({
      success: true,
      data: {
        transaction,
        listing,
        message: 'Purchase initiated. Please complete the AZR transfer to the seller.',
        sellerWallet: 'Seller wallet address would be retrieved from user service',
      }
    });
  } catch (error) {
    logger.error('Error purchasing listing:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;