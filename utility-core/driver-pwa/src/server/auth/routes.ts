// src/server/auth/routes.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, name, companyName } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const company = await prisma.company.create({ data: { name: companyName } });
  const user = await prisma.user.create({
    data: { email, name, role: 'admin', companyId: company.id, passwordHash }
  });
  const token = jwt.sign({ userId: user.id, companyId: company.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user, company });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Middleware example to attach req.user
export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export default router;
