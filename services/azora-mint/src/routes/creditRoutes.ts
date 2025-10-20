import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CreditApplication, Loan } from '../models/Credit';
import { calculateTrustScore, analyzeCreditApplication, processCreditApproval } from '../services/creditService';
import { customMetrics } from '../middleware/metrics';
import { aiRateLimiter } from '../middleware/rateLimiter';
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
 * /api/credit/apply:
 *   post:
 *     summary: Apply for micro-credit
 *     security:
 *       - bearerAuth: []
 */
router.post('/apply', [
  body('amountRequested').isFloat({ min: 100, max: 5000 }),
  body('purpose').isLength({ min: 10, max: 500 }),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { amountRequested, purpose } = req.body;

    // Check for existing pending application
    const existingApplication = await CreditApplication.findOne({
      userId: req.user.id,
      status: 'pending'
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending credit application'
      });
    }

    // Calculate trust score
    const trustScore = await calculateTrustScore(req.user.id);

    // Only allow applications for users with trust score >= 70
    if (trustScore < 70) {
      return res.status(400).json({
        success: false,
        error: 'Trust score too low for credit application',
        trustScore
      });
    }

    // AI analysis
    const aiAnalysis = await analyzeCreditApplication(
      req.user.id,
      amountRequested,
      purpose,
      trustScore
    );

    // Create application
    const application = new CreditApplication({
      userId: req.user.id,
      amountRequested,
      purpose,
      trustScore,
      aiAnalysis,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to respond
    });

    await application.save();
    customMetrics.creditApplicationsTotal.inc();

    // Auto-approve if AI confidence is high and amount is reasonable
    if (aiAnalysis.confidence > 0.8 && aiAnalysis.recommendedAmount >= amountRequested * 0.8) {
      application.status = 'approved';
      application.approvedAmount = amountRequested;
      application.approvedAt = new Date();
      await application.save();

      customMetrics.creditApprovalsTotal.inc();
    }

    res.status(201).json({
      success: true,
      data: {
        application,
        autoApproved: application.status === 'approved'
      }
    });

  } catch (error) {
    logger.error('Error creating credit application:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/credit/applications:
 *   get:
 *     summary: Get user's credit applications
 *     security:
 *       - bearerAuth: []
 */
router.get('/applications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const applications = await CreditApplication.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    logger.error('Error fetching applications:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/credit/loans:
 *   get:
 *     summary: Get user's active loans
 *     security:
 *       - bearerAuth: []
 */
router.get('/loans', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const loans = await Loan.find({
      userId: req.user.id,
      status: { $in: ['active', 'repaid'] }
    })
    .populate('applicationId')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: loans });
  } catch (error) {
    logger.error('Error fetching loans:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/credit/approve/{applicationId}:
 *   post:
 *     summary: Approve and process credit application (Admin/AI only)
 */
router.post('/approve/:applicationId', [
  param('applicationId').isMongoId()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const application = await CreditApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Application already processed' });
    }

    // Approve application
    application.status = 'approved';
    application.approvedAmount = application.aiAnalysis.recommendedAmount;
    application.approvedAt = new Date();
    await application.save();

    // Process the approval (create loan, lock collateral, disburse funds)
    const result = await processCreditApproval(application._id.toString());

    res.json({
      success: true,
      data: {
        application,
        loan: result
      }
    });

  } catch (error) {
    logger.error('Error approving application:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/credit/reject/{applicationId}:
 *   post:
 *     summary: Reject credit application (Admin/AI only)
 */
router.post('/reject/:applicationId', [
  param('applicationId').isMongoId()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const application = await CreditApplication.findById(req.params.applicationId);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Application already processed' });
    }

    application.status = 'rejected';
    await application.save();

    res.json({ success: true, data: application });
  } catch (error) {
    logger.error('Error rejecting application:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;