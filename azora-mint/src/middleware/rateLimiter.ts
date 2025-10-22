/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI-specific rate limiter for credit operations
export const aiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'ai_credit',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Trust score calculation rate limiter
export const trustRateLimiter = new RateLimiterMemory({
  keyPrefix: 'trust_score',
  points: 5, // Number of requests
  duration: 300, // Per 5 minutes
});