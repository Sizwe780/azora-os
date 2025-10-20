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