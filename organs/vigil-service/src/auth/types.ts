/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file types.ts
 * @module organs/vigil-service/src/auth
 * @description Type definitions for Vigil authentication and authorization
 * @author Azora OS Team
 * @created 2025-10-21
 * @updated 2025-10-21
 * @dependencies N/A
 * @integrates_with
 *   - JWT authentication middleware
 *   - Role-based access control
 * @api_endpoints N/A
 * @state_management N/A
 * @mobile_optimized No
 * @accessibility N/A
 * @tests unit
 */

// INTEGRATION MAP
const INTEGRATIONS = {
  imports: [],
  exports: ['VigilRole', 'VigilJwt', 'VigilUser'],
  consumed_by: ['middlewares.ts', 'routes/admin.ts'],
  dependencies: [],
  api_calls: [],
  state_shared: false,
  environment_vars: []
}

export type VigilRole = 'admin' | 'operator' | 'viewer';

export interface VigilJwt {
  sub: string;             // user id
  name: string;
  email: string;
  role: VigilRole;
  iat: number;
  exp: number;
}

export interface VigilUser {
  id: string;
  name: string;
  email: string;
  role: VigilRole;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: VigilUser;
  expiresIn: number;
}