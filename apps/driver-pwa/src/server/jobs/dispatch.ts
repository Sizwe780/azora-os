// name=src/server/jobs/dispatch.ts
import express from 'express';
import { prisma } from '../prisma';
const router = express.Router();

router.post('/assign', async (req: { body: { jobId: any; driverId: any; }; }, res: { json: (arg0: { ok: boolean; job: any; }) => any; }) => {
  const { jobId, driverId } = req.body;
  const job = await prisma.job.update({
    where: { id: jobId },
    data: { driverId, status: 'assigned' }
  });
  return res.json({ ok: true, job });
});

router.post('/status', async (req: { body: { jobId: any; status: any; tracking: any; }; }, res: { json: (arg0: { ok: boolean; job: any; }) => any; }) => {
  const { jobId, status, tracking } = req.body;
  const job = await prisma.job.update({
    where: { id: jobId },
    data: { status, tracking }
  });
  return res.json({ ok: true, job });
});

export default router;
