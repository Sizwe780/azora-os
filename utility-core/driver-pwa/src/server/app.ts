// src/server/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth';
import { requireAuth, requireRole } from './middleware/auth';
import { scheduledExportsRouter } from './jobs/scheduledExports';

const app = express();

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000'], // add your domains
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use(authRouter);

// Protected example
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ ok: true, user: (req as any).user });
});

// Role-protected example
app.get('/api/admin-only', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.json({ ok: true });
});

// Existing routers
app.use(scheduledExportsRouter);

export default app;
