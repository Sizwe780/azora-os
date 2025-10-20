// src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { auth } from './middleware/auth';
import { companyScope } from './middleware/companyScope';
import { errorHandler } from './middleware/error';

import { jobsRouter } from './routes/jobs';
import { ledgerRouter } from './routes/ledger';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['*'] }));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Protected routes
app.use('/api', auth, companyScope);
app.use('/api/jobs', jobsRouter);
app.use('/api/ledger', ledgerRouter);

// Error handler
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Azora OS API listening on ${port}`);
});
