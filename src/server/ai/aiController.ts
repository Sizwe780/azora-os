// src/server/ai/aiController.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { defaultAzoraPolicy } from '../policy/azoraPolicy';
import { enforcePolicy } from '../policy/guard';
import { planTripWithHOS } from '../trip/planTrip';
import { generateEldPdf } from '../logs/eldPdf';

export async function planDay(req: Request, res: Response) {
  const { companyId, driverId, currentCycleUsedHrs, current, pickup, drop } = req.body;
  enforcePolicy(defaultAzoraPolicy, { type: 'trip.plan', params: req.body });
  const trip = await planTripWithHOS({ companyId, driverId, currentCycleUsedHrs, current, pickup, drop });
  await prisma.auditLog.create({ data: {
    companyId,
    actorUserId: (req as any).user?.uid,
    action: 'create_job',
    entityType: 'trip',
    payload: { tripId: trip.id, plan: trip.routeSummary }
  }});
  res.json(trip);
}

export async function startTrip(req: Request, res: Response) {
  const { id } = req.params;
  enforcePolicy(defaultAzoraPolicy, { type: 'trip.start', params: { id } });
  const trip = await prisma.tripPlan.update({ where: { id }, data: { status: 'started', startsAt: new Date() } });
  req.app.get('io').to(`trip:${id}`).emit('insight', { type: 'route_change', severity: 'info', message: 'Trip started', data: { tripId: id } });
  res.json(trip);
}

export async function stopTrip(req: Request, res: Response) {
  const { id } = req.params;
  const trip = await prisma.tripPlan.update({ where: { id }, data: { status: 'completed', completedAt: new Date() } });
  res.json(trip);
}

export async function generateLogs(req: Request, res: Response) {
  const { id } = req.params;
  enforcePolicy(defaultAzoraPolicy, { type: 'logs.generate', params: { id } });
  const log = await generateELDForTrip(id);
  res.json(log);
}

export async function listInsights(req: Request, res: Response) {
  const { id } = req.params;
  const insights = await prisma.insightEvent.findMany({ where: { tripId: id }, orderBy: { createdAt: 'desc' } });
  res.json(insights);
}
