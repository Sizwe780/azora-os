// src/server/routes.ts
import express from 'express';
import * as AI from './ai/aiController';
import { exportRouter } from '../server/exports/export';


export const router = express.Router();
router.post('/api/ai/plan-day', AI.planDay);
router.post('/api/trips', AI.planDay);             // quick alias to create trip
router.post('/api/trips/:id/start', AI.startTrip);
router.post('/api/trips/:id/stop', AI.stopTrip);
router.post('/api/trips/:id/logs/generate', AI.generateLogs);
router.get('/api/trips/:id/insights', AI.listInsights);
router.use(exportRouter);