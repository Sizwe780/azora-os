// src/routes/jobs.ts
import { Router } from 'express';
import { prisma } from '../db/client';
import { AuthedRequest } from '../middleware/auth';
import { audit } from '../../../../src/services/audit';

export const jobsRouter = Router();

/**
 * GET /api/jobs
 * List jobs for the tenant
 */
jobsRouter.get('/', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { status, q } = req.query;
  const where: any = { companyId };
  if (status) where.status = String(status);
  if (q) {
    where.OR = [
      { title: { contains: String(q), mode: 'insensitive' } },
      { pickup: { contains: String(q), mode: 'insensitive' } },
      { dropoff: { contains: String(q), mode: 'insensitive' } }
    ];
  }
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { driver: true }
  });
  res.json(jobs);
});

/**
 * POST /api/jobs
 * Create a job
 * body: { title, pickup, dropoff, cargoType?, driverId?, scheduledAt? }
 */
jobsRouter.post('/', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { title, pickup, dropoff, cargoType, driverId, scheduledAt } = req.body;

  if (!title || !pickup || !dropoff) {
    return res.status(400).json({ error: 'Missing required fields: title, pickup, dropoff' });
  }

  // Ensure driver belongs to same tenant if provided
  if (driverId) {
    const driver = await prisma.driver.findFirst({ where: { id: driverId, companyId } });
    if (!driver) return res.status(400).json({ error: 'Invalid driver for this company' });
  }

  const job = await prisma.job.create({
    data: {
      companyId,
      title,
      pickup,
      dropoff,
      cargoType,
      driverId: driverId ?? null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null
    }
  });

  await audit(companyId, req.user!.id, 'job_created', { jobId: job.id, title });

  res.status(201).json(job);
});

/**
 * GET /api/jobs/:id
 * Retrieve single job (tenant-scoped)
 */
jobsRouter.get('/:id', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { id } = req.params;

  const job = await prisma.job.findFirst({
    where: { id, companyId },
    include: { driver: true }
  });
  if (!job) return res.status(404).json({ error: 'Not found' });
  res.json(job);
});

/**
 * PUT /api/jobs/:id
 * Update job fields
 */
jobsRouter.put('/:id', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { id } = req.params;
  const { title, pickup, dropoff, cargoType, status, driverId, scheduledAt } = req.body;

  const existing = await prisma.job.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  if (driverId) {
    const driver = await prisma.driver.findFirst({ where: { id: driverId, companyId } });
    if (!driver) return res.status(400).json({ error: 'Invalid driver for this company' });
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      pickup: pickup ?? existing.pickup,
      dropoff: dropoff ?? existing.dropoff,
      cargoType: cargoType ?? existing.cargoType,
      status: status ?? existing.status,
      driverId: driverId ?? existing.driverId,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt
    }
  });

  await audit(companyId, req.user!.id, 'job_updated', { jobId: job.id, status: job.status });

  res.json(job);
});

/**
 * DELETE /api/jobs/:id
 * Cancel job (soft delete via status)
 */
jobsRouter.delete('/:id', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { id } = req.params;

  const existing = await prisma.job.findFirst({ where: { id, companyId } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const job = await prisma.job.update({
    where: { id },
    data: { status: 'canceled' }
  });

  await audit(companyId, req.user!.id, 'job_canceled', { jobId: job.id });

  res.json({ ok: true });
});