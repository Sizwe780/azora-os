/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// General API rate limiter
export const websiteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for website generation
export const generationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 website generations per hour
  message: {
    error: 'Too many website generations from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for deployment operations
export const deploymentRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // limit each IP to 10 deployments per 30 minutes
  message: {
    error: 'Too many deployment operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Memory-based rate limiter for AI operations
export const aiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'ai_operations',
  points: 20, // Number of AI operations
  duration: 60 * 60, // Per 1 hour
});