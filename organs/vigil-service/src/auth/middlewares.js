/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file middlewares.js
 * @module organs/vigil-service/src/auth
 * @description JWT authentication and role-based access control middleware
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 */

const jwt = require('jsonwebtoken');
const { VigilRole } = require('./types.js');

// Role hierarchy levels (higher number = more permissions)
const ROLE_LEVELS = {
  [VigilRole.VIEWER]: 1,
  [VigilRole.OPERATOR]: 2,
  [VigilRole.ADMIN]: 3
};

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

function requireRole(...roles) {
  // Handle both requireRole('role1', 'role2') and requireRole(['role1', 'role2'])
  if (roles.length === 1 && Array.isArray(roles[0])) {
    roles = roles[0];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }
    
    const userLevel = ROLE_LEVELS[req.user.role];
    if (userLevel === undefined) {
      return res.status(403).json({
        error: 'Forbidden - Invalid role',
        current: req.user.role
      });
    }
    
    // Check if user has sufficient level for any of the required roles
    const hasAccess = roles.some(role => {
      const requiredLevel = ROLE_LEVELS[role];
      return requiredLevel !== undefined && userLevel >= requiredLevel;
    });
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Forbidden - Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_SECRET || 'default-secret', {
      algorithms: process.env.JWT_PUBLIC_KEY ? ['RS256'] : ['HS256']
    });
    req.user = decoded;
  } catch (error) {
    console.warn('Optional auth token invalid:', error.message);
  }
  next();
}

module.exports = { requireAuth, requireRole, optionalAuth, authenticateToken: requireAuth };
