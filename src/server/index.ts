import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes, { authMiddleware } from './auth/routes';
import paymentsHistory from './payments/history';
import paymentsReceipt from './payments/receipt';
import paystackWebhook from './payments/webhook';

import subscriptionsRoutes from './subscriptions/routes';
import partnersRoutes from './partners/routes';
import auditRoutes from './audit/routes';
import driversRoutes from './drivers/ruotes';
import jobsDispatch from './jobs/dispatch';
import jobsUpload from './jobs/upload';
import companyRoutes from './company/routes';
import contractsRoutes from './contracts/routes';
import nationRoutes from './nation/routes';
import federationRoutes from './federation/routes';
import advisorRoutes from './advisor/routes';
import integrationsWebhooks from './integrations/webhooks';
import storeRoutes from './integrations/stores';

import { initRealtime } from './realtime';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(helmet());

// Public
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsHistory);
app.use('/api/payments', paymentsReceipt);
app.use('/api/payments', paystackWebhook);
app.use('/api/integrations', integrationsWebhooks);

// Authenticated
app.use('/api/subscriptions', authMiddleware, subscriptionsRoutes);
app.use('/api/partners', authMiddleware, partnersRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/drivers', authMiddleware, driversRoutes);
app.use('/api/jobs', authMiddleware, jobsDispatch);
app.use('/api/jobs', authMiddleware, jobsUpload);
app.use('/api/company', authMiddleware, companyRoutes);
app.use('/api/contracts', authMiddleware, contractsRoutes);
app.use('/api/nation', authMiddleware, nationRoutes);
app.use('/api/federation', authMiddleware, federationRoutes);
app.use('/api/advisor', authMiddleware, advisorRoutes);
app.use('/api/integrations', authMiddleware, storeRoutes);

// HTTP + Socket.io
const httpServer = http.createServer(app);
initRealtime(httpServer);

httpServer.listen(process.env.PORT || 3001);