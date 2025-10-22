/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import nodemailer from 'nodemailer'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().max(100).optional(),
  message: Joi.string().min(10).max(2000).required(),
  category: Joi.string().valid('general', 'enterprise', 'support', 'partnership').optional()
})

// Email transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      })
    }

    const { name, email, company, message, category = 'general' } = value

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company,
        message,
        category
      }
    })

    // Send notification email (if configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = createTransporter()

        const mailOptions = {
          from: process.env.SMTP_USER,
          to: process.env.CONTACT_EMAIL || 'contact@azora.world',
          subject: `New Contact Form Submission - ${category}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Submitted at: ${new Date().toISOString()}</small></p>
          `
        }

        await transporter.sendMail(mailOptions)
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: submission.id
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    res.status(500).json({
      error: 'Failed to submit contact form',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// GET /api/contact - Get contact submissions (admin only - would need auth)
router.get('/', async (req, res) => {
  try {
    // In production, add authentication check here
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    res.json({
      success: true,
      data: submissions
    })

  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    res.status(500).json({
      error: 'Failed to fetch submissions',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// PUT /api/contact/:id/status - Update submission status (admin only)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['new', 'read', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status }
    })

    res.json({
      success: true,
      data: submission
    })

  } catch (error) {
    console.error('Error updating submission status:', error)
    res.status(500).json({
      error: 'Failed to update status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

export { router as contactRoutes }