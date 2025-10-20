// src/server/routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JwtPayload
} from '../utils/jwt';

export const authRouter = express.Router();

function setAuthCookies(res: express.Response, access: string, refresh: string) {
  const domain = process.env.COOKIE_DOMAIN || 'localhost';
  const secure = process.env.COOKIE_SECURE === 'true';
  const accessTTL = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
  const refreshTTL = Number(process.env.REFRESH_TOKEN_TTL ?? 1209600);

  res.cookie('access_token', access, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    domain,
    maxAge: accessTTL * 1000
  });
  res.cookie('refresh_token', refresh, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    domain,
    maxAge: refreshTTL * 1000
  });
}

authRouter.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, roles: ['USER'] }
  });

  const payload: JwtPayload = { uid: user.id, email: user.email, roles: user.roles };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refresh } });
  setAuthCookies(res, access, refresh);
  res.json({ ok: true });
});

authRouter.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const payload: JwtPayload = { uid: user.id, email: user.email, roles: user.roles };
  const access = signAccessToken(payload);
  const refresh = signRefreshToken(payload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refresh } });
  setAuthCookies(res, access, refresh);
  res.json({ ok: true });
});

authRouter.post('/api/auth/refresh', async (req, res) => {
  const cookieToken = req.cookies?.refresh_token as string | undefined;
  const bodyToken = req.body?.refreshToken as string | undefined;
  const token = cookieToken || bodyToken;
  if (!token) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.uid } });
    if (!user || user.refreshToken !== token) return res.status(401).json({ error: 'Invalid refresh token' });

    const newPayload: JwtPayload = { uid: user.id, email: user.email, roles: user.roles };
    const access = signAccessToken(newPayload);
    const refresh = signRefreshToken(newPayload);

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: refresh } });
    setAuthCookies(res, access, refresh);
    res.json({ ok: true });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

authRouter.post('/api/auth/logout', async (req, res) => {
  const accessDomain = process.env.COOKIE_DOMAIN || 'localhost';
  const secure = process.env.COOKIE_SECURE === 'true';

  // If you want to revoke refresh token server-side:
  const cookieToken = req.cookies?.refresh_token as string | undefined;
  if (cookieToken) {
    try {
      const payload = verifyRefreshToken(cookieToken);
      await prisma.user.update({ where: { id: payload.uid }, data: { refreshToken: null } });
    } catch {}
  }

  res.clearCookie('access_token', { httpOnly: true, secure, sameSite: 'lax', domain: accessDomain });
  res.clearCookie('refresh_token', { httpOnly: true, secure, sameSite: 'lax', domain: accessDomain });
  res.json({ ok: true });
});

authRouter.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user });
});
