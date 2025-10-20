// src/server/drivers/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// GET /api/drivers
router.get('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const drivers = await prisma.user.findMany({
    where: { companyId, role: 'driver' },
    select: { id: true, email: true, name: true }
  });
  res.json({ drivers });
});

// POST /api/drivers
router.post('/', async (req, res) => {
  const companyId = (req.user as any).companyId;
  const { email, name } = req.body;
  const driver = await prisma.user.create({
    data: {
      email,
      name,
      role: 'driver',
      companyId,
      passwordHash: '' // if you’re using auth, generate properly
    }
  });
  await writeAudit(companyId, 'driver', 'create', { driverId: driver.id, email });
  res.json({ driver });
});

export default router;
