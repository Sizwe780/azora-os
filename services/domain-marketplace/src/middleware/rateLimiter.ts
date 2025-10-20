import rateLimit from 'express-rate-limit';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// General API rate limiter
export const domainRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for domain registration
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 domain registrations per hour
  message: {
    error: 'Too many domain registrations from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for search endpoints
export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 searches per minute
  message: {
    error: 'Too many search requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Memory-based rate limiter for bidding
export const biddingRateLimiter = new RateLimiterMemory({
  keyPrefix: 'domain_bidding',
  points: 50, // Number of requests
  duration: 60 * 60, // Per 1 hour
});

// Rate limiter for watchlist operations
export const watchlistRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 watchlist operations per windowMs
  message: {
    error: 'Too many watchlist operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});