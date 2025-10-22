/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import { AuthService, AuditService } from './authService.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.createUser(email, password);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.authenticateUser(email, password);
    const session = await AuthService.createSession(user.id);
    res.json({ token: session.token, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;
    // Invalidate session
    await AuditService.log('USER_LOGOUT', { token });
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;