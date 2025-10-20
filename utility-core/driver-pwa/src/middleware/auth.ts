// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; role: string; companyId: string };
}

export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr || !hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = hdr.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // Expect payload: { sub, email, role, companyId }
    req.user = { id: payload.sub, email: payload.email, role: payload.role, companyId: payload.companyId };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}