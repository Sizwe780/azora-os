/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file auth.ts
 * @module organs/vigil-service/src/routes
 * @description Authentication routes for login/logout
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies express, jsonwebtoken, bcryptjs
 * @integrates_with
 *   - JWT token generation
 *   - User authentication
 * @api_endpoints /api/vigil/auth/login, /api/vigil/auth/logout, /api/vigil/auth/me
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit, integration
 */

import { Request, Response } from 'express';

// Extend Express Request to include user property for authentication
interface VigilRequest extends Request {
  user?: {
    sub: string;
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastLoginAt?: string;
    isActive: boolean;
  };
}

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { optionalAuth } = require('../auth/middlewares.js');

// In-memory user store (replace with database in production)
// Same store as admin routes
const users = new Map();

// Initialize default admin user
if (!users.has('admin@azora.world')) {
  users.set('admin@azora.world', {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@azora.world',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isActive: true,
    passwordHash: bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 10)
  });
}

const router = express.Router();

/**
 * POST /api/vigil/auth/login - User login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.get(email);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (in production, compare hashed password)
    const isValidPassword = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : password === user.password; // Fallback for plain text (dev only)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    // Generate JWT token
    const tokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (parseInt(process.env.JWT_EXPIRES_IN || '3600')) // 1 hour default
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_PRIVATE_KEY || process.env.JWT_SECRET || 'default-secret',
      { algorithm: process.env.JWT_PRIVATE_KEY ? 'RS256' : 'HS256' }
    );

    // Return user info without sensitive data
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };

    res.json({
      token,
      user: userResponse,
      expiresIn: tokenPayload.exp - tokenPayload.iat
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/vigil/auth/logout - User logout (client-side token removal)
 */
router.post('/logout', optionalAuth, (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // In production, you might want to implement token blacklisting
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/vigil/auth/me - Get current user info
 */
router.get('/me', optionalAuth, (req: VigilRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = users.get(req.user.email);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  });
});

/**
 * POST /api/vigil/auth/refresh - Refresh JWT token
 */
router.post('/refresh', optionalAuth, (req: VigilRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = users.get(req.user.email);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'User not found or inactive' });
  }

  // Generate new token
  const tokenPayload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (parseInt(process.env.JWT_EXPIRES_IN || '3600'))
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_PRIVATE_KEY || process.env.JWT_SECRET || 'default-secret',
    { algorithm: process.env.JWT_PRIVATE_KEY ? 'RS256' : 'HS256' }
  );

  res.json({
    token,
    expiresIn: tokenPayload.exp - tokenPayload.iat
  });
});

module.exports = router;