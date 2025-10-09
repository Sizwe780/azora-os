// src/middleware/companyScope.ts
import { Response, NextFunction } from 'express';
import { AuthedRequest } from './auth';
import { prisma } from '../db/client';

export async function companyScope(req: AuthedRequest, res: Response, next: NextFunction) {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(403).json({ error: 'No company context' });

  // Optional: Set DB session variable for RLS policies (if using pg and pg-boss etc.)
  try {
    await prisma.$executeRawUnsafe(`SET app.current_company = '${companyId}'`);
  } catch {
    // Ignore if not supported by driver; RLS can still be enforced at query level.
  }

  (req as any).companyId = companyId;
  next();
}