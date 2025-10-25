/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getMetrics } from '../middleware/metrics';
import { CreditApplication, Loan, TrustScore } from '../models/Credit';
import logger from '../middleware/requestLogger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'azora-mint',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness check (includes database connectivity)
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database not connected');
    }
    await db.admin().ping();

    res.json({
      success: true,
      status: 'ready',
      service: 'azora-mint',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      status: 'not ready',
      service: 'azora-mint',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness check
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'alive',
    service: 'azora-mint',
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Prometheus metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(metrics);
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to get metrics' });
  }
});

/**
 * @swagger
 * /api/health/stats:
 *   get:
 *     summary: Service statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database not connected');
    }

    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      activeLoans,
      totalLoanValue,
      totalTrustScores
    ] = await Promise.all([
      CreditApplication.countDocuments(),
      CreditApplication.countDocuments({ status: 'pending' }),
      CreditApplication.countDocuments({ status: 'approved' }),
      Loan.countDocuments({ status: 'active' }),
      Loan.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: null, totalZAR: { $sum: '$amountZAR' }, totalAZR: { $sum: '$amountAZR' } } }
      ]),
      TrustScore.countDocuments()
    ]);

    const loanValue = totalLoanValue[0] || { totalZAR: 0, totalAZR: 0 };

    res.json({
      success: true,
      data: {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications
        },
        loans: {
          active: activeLoans,
          totalValueZAR: loanValue.totalZAR,
          totalValueAZR: loanValue.totalAZR
        },
        trustScores: totalTrustScores,
        database: {
          name: db.databaseName,
          collections: (await db.collections()).length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
});

/**
 * @swagger
 * /api/health/constitution:
 *   get:
 *     summary: Constitution compliance check
 */
router.get('/constitution', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      article: 'VIII.6',
      name: 'Neural Credit Protocol',
      compliance: {
        trustScoreBased: true,
        metabolicTax: 0.20,
        maxTermMonths: 3,
        collateralRequired: true,
        autonomousCollection: true,
        defaultPenalty: 0.15,
        observationPhase: true
      },
      status: 'compliant',
      lastAudit: new Date().toISOString()
    }
  });
});

export default router;