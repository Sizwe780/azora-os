/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file middlewares.ts
 * @module organs/vigil-service/src/auth
 * @description JWT authentication and role-based access control middleware
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jsonwebtoken, express
 * @integrates_with
 *   - Express routes
 *   - JWT token validation
 * @api_endpoints N/A
 * @state_management N/A
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

const jwt = require('jsonwebtoken');

/**
 * Middleware to require authentication for protected routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'default-secret', {
      algorithms: process.env.JWT_PUBLIC_KEY ? ['RS256'] : ['HS256']
    });

    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification failed:', (error as Error).message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

/**
 * Middleware factory to require specific roles
 * @param {...VigilRole} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden - Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'default-secret', {
        algorithms: process.env.JWT_PUBLIC_KEY ? ['RS256'] : ['HS256']
      });
      req.user = decoded;
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
      console.warn('Optional auth token invalid:', (error as Error).message);
    }
  }

  next();
}

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth
};