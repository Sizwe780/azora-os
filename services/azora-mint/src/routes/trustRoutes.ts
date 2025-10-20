import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { TrustScore } from '../models/Credit';
import { calculateTrustScore } from '../services/creditService';
import { trustRateLimiter } from '../middleware/rateLimiter';
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
 * /api/trust/score:
 *   get:
 *     summary: Get user's trust score
 *     security:
 *       - bearerAuth: []
 */
router.get('/score', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    let trustScore = await TrustScore.findOne({ userId: req.user.id });

    // If no trust score exists or it's outdated, calculate it
    if (!trustScore || trustScore.nextUpdate <= new Date()) {
      await calculateTrustScore(req.user.id);
      trustScore = await TrustScore.findOne({ userId: req.user.id });
    }

    if (!trustScore) {
      return res.status(404).json({ success: false, error: 'Trust score not found' });
    }

    res.json({ success: true, data: trustScore });
  } catch (error) {
    logger.error('Error fetching trust score:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/trust/calculate:
 *   post:
 *     summary: Force recalculate trust score
 *     security:
 *       - bearerAuth: []
 */
router.post('/calculate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Rate limit trust score calculations
    await trustRateLimiter.consume(req.user.id);

    const score = await calculateTrustScore(req.user.id);

    res.json({
      success: true,
      data: {
        userId: req.user.id,
        score,
        calculatedAt: new Date()
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Trust score calculation rate limited. Try again later.'
      });
    }

    logger.error('Error calculating trust score:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/trust/leaderboard:
 *   get:
 *     summary: Get trust score leaderboard
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 */
router.get('/leaderboard', [
  param('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const leaderboard = await TrustScore.find({})
      .sort({ score: -1 })
      .limit(limit)
      .select('userId score factors lastCalculated')
      .lean();

    // Anonymize user IDs for privacy
    const anonymizedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      score: entry.score,
      factors: entry.factors,
      lastCalculated: entry.lastCalculated,
      // Don't expose userId for privacy
    }));

    res.json({ success: true, data: anonymizedLeaderboard });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/trust/stats:
 *   get:
 *     summary: Get trust score statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      averageScore,
      scoreDistribution
    ] = await Promise.all([
      TrustScore.countDocuments(),
      TrustScore.aggregate([
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ]),
      TrustScore.aggregate([
        {
          $bucket: {
            groupBy: '$score',
            boundaries: [0, 20, 40, 60, 80, 100],
            default: '100+',
            output: { count: { $sum: 1 } }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        averageScore: averageScore[0]?.avg || 0,
        scoreDistribution: scoreDistribution.reduce((acc, bucket) => {
          acc[bucket._id] = bucket.count;
          return acc;
        }, {}),
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    logger.error('Error fetching trust stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/trust/factors:
 *   get:
 *     summary: Get explanation of trust score factors
 */
router.get('/factors', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      factors: {
        systemUse: {
          name: 'System Use',
          description: 'How actively you engage with Azora Learn and the marketplace',
          weight: 0.25,
          maxScore: 100
        },
        compliance: {
          name: 'Code Compliance',
          description: 'Quality and standards compliance of your code submissions',
          weight: 0.15,
          maxScore: 100
        },
        socialLedger: {
          name: 'Social Ledger',
          description: 'Your participation in proven pods and community activities',
          weight: 0.20,
          maxScore: 100
        },
        repaymentHistory: {
          name: 'Repayment History',
          description: 'Your track record of repaying previous loans',
          weight: 0.20,
          maxScore: 100
        },
        valueCreation: {
          name: 'Value Creation',
          description: 'Bounties completed and marketplace contributions',
          weight: 0.20,
          maxScore: 100
        }
      },
      calculation: 'Weighted average of all factors',
      updateFrequency: 'Daily, with manual recalculation available'
    }
  });
});

export default router;