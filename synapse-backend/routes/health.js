/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/health - Basic health check
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'azora-portal-backend',
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    })
  }
})

// GET /api/health/detailed - Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now()

    // Check database connection and get stats
    const dbStart = Date.now()
    const contactCount = await prisma.contactSubmission.count()
    const newsletterCount = await prisma.newsletterSignup.count({
      where: { active: true }
    })
    const dbLatency = Date.now() - dbStart

    const totalLatency = Date.now() - startTime

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'azora-portal-backend',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
        contactSubmissions: contactCount,
        activeNewsletterSignups: newsletterCount
      },
      responseTime: `${totalLatency}ms`
    })
  } catch (error) {
    console.error('Detailed health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database or service check failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export { router as healthRoutes }