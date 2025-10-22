/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file types.js
 * @module organs/vigil-service/src/auth
 * @description CommonJS type definitions for Vigil authentication and authorization
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 */

const VigilRole = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Example structure for VigilJwt
// This is for reference, not enforced by JS
// {
//   sub: string,
//   name: string,
//   email: string,
//   role: VigilRole,
//   iat: number,
//   exp: number
// }

// Example structure for VigilUser
// {
//   id: string,
//   name: string,
//   email: string,
//   role: VigilRole,
//   createdAt: string,
//   lastLoginAt?: string,
//   isActive: boolean
// }

module.exports = {
  VigilRole
  // VigilJwt, VigilUser, LoginRequest, LoginResponse are documented above for reference
};
