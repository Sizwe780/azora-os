/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schema
const newsletterSchema = Joi.object({
  email: Joi.string().email().required(),
  source: Joi.string().max(50).optional()
})

// POST /api/newsletter - Subscribe to newsletter
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = newsletterSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }

    const { email, source = 'website' } = value

    // Check if email already exists
    const existing = await prisma.newsletterSignup.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.active) {
        return res.status(409).json({
          error: 'Email already subscribed',
          message: 'This email is already subscribed to our newsletter'
        })
      } else {
        // Reactivate subscription
        await prisma.newsletterSignup.update({
          where: { email },
          data: { active: true, source }
        })
        return res.json({
          success: true,
          message: 'Newsletter subscription reactivated'
        })
      }
    }

    // Create new subscription
    const signup = await prisma.newsletterSignup.create({
      data: {
        email,
        source
      }
    })

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      signupId: signup.id
    })

  } catch (error) {
    console.error('Newsletter signup error:', error)
    res.status(500).json({
      error: 'Failed to subscribe to newsletter',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// DELETE /api/newsletter - Unsubscribe from newsletter
router.delete('/', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const signup = await prisma.newsletterSignup.findUnique({
      where: { email }
    })

    if (!signup) {
      return res.status(404).json({
        error: 'Email not found',
        message: 'This email is not subscribed to our newsletter'
      })
    }

    if (!signup.active) {
      return res.status(409).json({
        error: 'Already unsubscribed',
        message: 'This email is already unsubscribed'
      })
    }

    // Deactivate subscription (soft delete)
    await prisma.newsletterSignup.update({
      where: { email },
      data: { active: false }
    })

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    res.status(500).json({
      error: 'Failed to unsubscribe from newsletter',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// GET /api/newsletter/stats - Get newsletter stats (admin only)
router.get('/stats', async (req, res) => {
  try {
    // In production, add authentication check here
    const total = await prisma.newsletterSignup.count()
    const active = await prisma.newsletterSignup.count({
      where: { active: true }
    })

    const recent = await prisma.newsletterSignup.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        recentSignups: recent
      }
    })

  } catch (error) {
    console.error('Error fetching newsletter stats:', error)
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

export { router as newsletterRoutes }