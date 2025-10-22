/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for email sending
export const emailRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 email sends per minute
  message: {
    success: false,
    message: 'Too many emails sent from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Domain operations rate limiter
export const domainRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 domain operations per minute
  message: {
    success: false,
    message: 'Too many domain operations from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// SMTP configuration rate limiter
export const smtpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 SMTP config changes per 5 minutes
  message: {
    success: false,
    message: 'Too many SMTP configuration changes, please try again later.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory rate limiter for more complex scenarios
export const memoryRateLimiter = new RateLimiterMemory({
  keyPrefix: 'email_hosting',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware to check memory rate limiter
export async function checkMemoryRateLimit(req: Request, res: Response, next: NextFunction) {
  try {
    await memoryRateLimiter.consume(req.ip || 'unknown');
    next();
  } catch (rejRes: any) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) + ' seconds'
    });
  }
}