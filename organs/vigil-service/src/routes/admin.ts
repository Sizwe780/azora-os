/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file admin.ts
 * @module organs/vigil-service/src/routes
 * @description Admin routes for user and role management
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies express, jsonwebtoken
 * @integrates_with
 *   - Authentication middleware
 *   - User management system
 * @api_endpoints /api/vigil/admin/users, /api/vigil/admin/roles
 * @state_management local
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit, integration
 */

import { Request, Response } from 'express';

interface VigilRequest extends Request {
  user?: {
    sub: string;
    name: string;
    email: string;
    role: string;
  };
}

const express = require('express');
const jwt = require('jsonwebtoken');
const { requireAuth, requireRole } = require('../auth/middlewares.js');
const { VigilRole } = require('../auth/types.js');

// In-memory user store (replace with database in production)
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
    password: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123' // Change in production!
  });
}

const router = express.Router();

// Apply authentication and admin role requirement to all admin routes
router.use(requireAuth);
router.use(requireRole('admin'));

/**
 * GET /api/vigil/admin/users - List all users
 */
router.get('/users', (req: VigilRequest, res: Response) => {
  try {
    const userList = Array.from(users.values()).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive
    }));

    res.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/vigil/admin/users - Create new user
 */
router.post('/users', (req: VigilRequest, res: Response) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, role, password' });
    }

    if (!['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, operator, or viewer' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      isActive: true,
      password // In production, hash this!
    };

    users.set(email, newUser);

    // Return user without password
    const { password: _, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * PUT /api/vigil/admin/users/:userId/role - Update user role
 */
router.put('/users/:userId/role', (req: VigilRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, operator, or viewer' });
    }

    // Find user by ID
    let targetUser = null;
    let targetEmail = null;

    for (const [email, user] of users) {
      if (user.id === userId) {
        targetUser = user;
        targetEmail = email;
        break;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (req.user && targetUser.id === req.user.sub && role !== 'admin') {
      return res.status(403).json({ error: 'Cannot change your own admin role' });
    }

    targetUser.role = role;

    res.json({
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

/**
 * DELETE /api/vigil/admin/users/:userId - Deactivate user
 */
router.delete('/users/:userId', (req: VigilRequest, res: Response) => {
  try {
    const { userId } = req.params;
    // Find user by ID
    let targetUser = null;
    let targetEmail = null;

    for (const [email, user] of users) {
      if (user.id === userId) {
        targetUser = user;
        targetEmail = email;
        break;
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.user && targetUser.id === req.user.sub) {
      return res.status(403).json({ error: 'Cannot deactivate your own account' });
    }

    targetUser.isActive = false;

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

/**
 * POST /api/vigil/admin/roles/assign - Bulk role assignment
 */
router.post('/roles/assign', (req: VigilRequest, res: Response) => {
  try {
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || !role) {
      return res.status(400).json({ error: 'Missing required fields: userIds (array), role' });
    }

    if (!['admin', 'operator', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, operator, or viewer' });
    }

    const updatedUsers = [];
    const notFoundUsers = [];

    for (const userId of userIds) {
      let found = false;
      for (const [email, user] of users) {
        if (user.id === userId && user.isActive) {
          // Prevent changing own role via bulk operation
          if (!req.user || user.id !== req.user.sub) {
            user.role = role;
            updatedUsers.push({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            });
          }
          found = true;
          break;
        }
      }
      if (!found) {
        notFoundUsers.push(userId);
      }
    }

    res.json({
      updated: updatedUsers,
      notFound: notFoundUsers,
      message: `Updated ${updatedUsers.length} users, ${notFoundUsers.length} not found`
    });
  } catch (error) {
    console.error('Error in bulk role assignment:', error);
    res.status(500).json({ error: 'Failed to assign roles' });
  }
});

module.exports = router;