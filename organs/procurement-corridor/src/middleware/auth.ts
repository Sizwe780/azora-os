/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        organizationId: string;
        email: string;
        role: 'admin' | 'manager' | 'viewer';
        permissions: string[];
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authentication token provided', 401);
    }

    const token = authHeader.substring(7);

    // TODO: Implement JWT verification with auth service
    // For now, mock user for development
    if (process.env.NODE_ENV === 'development' && token === 'dev-token') {
      req.user = {
        id: 'dev-user-1',
        organizationId: 'dev-org-1',
        email: 'dev@azora.world',
        role: 'admin',
        permissions: ['*'],
      };
      return next();
    }

    // In production, verify with auth service
    // const user = await verifyToken(token);
    // req.user = user;

    throw new AppError('Invalid authentication token', 401);
  } catch (error) {
    next(error);
  }
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (
      req.user.permissions.includes('*') ||
      req.user.permissions.includes(permission)
    ) {
      return next();
    }

    return next(new AppError('Insufficient permissions', 403));
  };
};
