/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file auth-middleware.test.js
 * @module organs/vigil-service/test
 * @description Unit tests for authentication middleware
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies jest
 * @integrates_with
 *   - Authentication middleware
 *   - JWT tokens
 * @api_endpoints N/A
 * @state_management N/A
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: ['jest'],
  exports: [],
  consumed_by: ['npm test'],
  dependencies: ['vigil-service'],
  api_calls: [],
  state_shared: false,
  environment_vars: []
}

const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../src/auth/middlewares');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const TEST_USER = {
  id: 'test-user-001',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin'
};

function generateTestToken(user = TEST_USER) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    },
    JWT_SECRET
  );
}

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    test('should authenticate valid JWT token', () => {
      const token = generateTestToken();
      mockReq.headers.authorization = `Bearer ${token}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.email).toBe(TEST_USER.email);
      expect(mockReq.user.role).toBe(TEST_USER.role);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject missing authorization header', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized - No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid token format', () => {
      mockReq.headers.authorization = 'InvalidToken';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized - No token provided'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject expired token', () => {
      const expiredToken = jwt.sign(
        {
          sub: TEST_USER.id,
          name: TEST_USER.name,
          email: TEST_USER.email,
          role: TEST_USER.role,
          iat: Math.floor(Date.now() / 1000) - 7200,
          exp: Math.floor(Date.now() / 1000) - 3600
        },
        JWT_SECRET
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized - Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject malformed JWT', () => {
      mockReq.headers.authorization = 'Bearer invalid.jwt.token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized - Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    test('should allow access with correct role', () => {
      const token = generateTestToken();
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.user = { role: 'admin' };

      const middleware = requireRole('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should deny access with insufficient role', () => {
      const token = generateTestToken({ ...TEST_USER, role: 'operator' });
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.user = { role: 'operator' };

      const middleware = requireRole('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Forbidden - Insufficient permissions'
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should allow access with higher role', () => {
      mockReq.user = { role: 'admin' };
      const middleware = requireRole('operator');
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle multiple required roles', () => {
      mockReq.user = { role: 'operator' };
      const middleware = requireRole(['admin', 'operator']);
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should deny access when role not in allowed list', () => {
      const token = generateTestToken({ ...TEST_USER, role: 'viewer' });
      mockReq.headers.authorization = `Bearer ${token}`;
      mockReq.user = { role: 'viewer' };

      const middleware = requireRole(['admin', 'operator']);
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Forbidden - Insufficient permissions'
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle missing user object', () => {
      const middleware = requireRole('admin');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized - Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Role Hierarchy', () => {
    test('admin should have access to all roles', () => {
      mockReq.user = { role: 'admin' };
      const adminOnly = requireRole('admin');
      const operatorOnly = requireRole('operator');
      const viewerOnly = requireRole('viewer');
      adminOnly(mockReq, mockRes, mockNext);
      operatorOnly(mockReq, mockRes, mockNext);
      viewerOnly(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(3);
    });

    test('operator should have access to operator and viewer roles', () => {
      mockReq.user = { role: 'operator' };
      const adminOnly = requireRole('admin');
      const operatorOnly = requireRole('operator');
      const viewerOnly = requireRole('viewer');
      adminOnly(mockReq, mockRes, mockNext);
      operatorOnly(mockReq, mockRes, mockNext);
      viewerOnly(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
    });

    test('viewer should only have access to viewer role', () => {
      mockReq.user = { role: 'viewer' };

      const adminOnly = requireRole('admin');
      const operatorOnly = requireRole('operator');
      const viewerOnly = requireRole('viewer');

      adminOnly(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(0);

      operatorOnly(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(0);

      viewerOnly(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });
});