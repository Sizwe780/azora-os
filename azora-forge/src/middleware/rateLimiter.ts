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

// AI-specific rate limiter for marketplace operations
export const aiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'ai_marketplace',
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

// Bidding rate limiter
export const biddingRateLimiter = new RateLimiterMemory({
  keyPrefix: 'bidding',
  points: 5, // Number of bids
  duration: 60, // Per 60 seconds
});

// Watchlist rate limiter
export const watchlistRateLimiter = new RateLimiterMemory({
  keyPrefix: 'watchlist',
  points: 10, // Number of watchlist additions
  duration: 60, // Per 60 seconds
});

// Registration rate limiter
export const registrationRateLimiter = new RateLimiterMemory({
  keyPrefix: 'registration',
  points: 3, // Number of registrations
  duration: 3600, // Per hour
});