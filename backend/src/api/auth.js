/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Federated Identity API Route
// Provides REST endpoints for registration, authentication, and authorization

const express = require('express');
const router = express.Router();
const federatedIdentityService = require('../services/auth/federatedIdentityService');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const user = req.body;
    const result = federatedIdentityService.registerUser(user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/authenticate
router.post('/authenticate', (req, res) => {
  try {
    const { username, password } = req.body;
    const result = federatedIdentityService.authenticate(username, password);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/authorize
router.post('/authorize', (req, res) => {
  try {
    const { user, requiredRole } = req.body;
    const authorized = federatedIdentityService.authorize(user, requiredRole);
    res.json({ authorized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
