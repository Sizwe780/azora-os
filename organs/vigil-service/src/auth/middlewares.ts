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

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['jsonwebtoken', 'express'],
  exports: ['requireAuth', 'requireRole', 'optionalAuth'],
  consumed_by: ['routes/*.ts', 'index.js'],
  dependencies: [],
  api_calls: [],
  state_shared: false,
  environment_vars: ['JWT_PUBLIC_KEY', 'JWT_PRIVATE_KEY']
}

const jwt = require('jsonwebtoken');
const { VigilJwt, VigilRole } = require('./types');

/**
 * Middleware to require authentication for protected routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requireAuth(req, res, next) {
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
    console.error('JWT verification failed:', error.message);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

/**
 * Middleware factory to require specific roles
 * @param {...VigilRole} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
function requireRole(...roles) {
  return (req, res, next) => {
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
function optionalAuth(req, res, next) {
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
      console.warn('Optional auth token invalid:', error.message);
    }
  }

  next();
}

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth
};