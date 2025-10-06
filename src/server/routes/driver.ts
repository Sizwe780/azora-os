// src/server/routes/drivers.ts
import express from 'express';
import { prisma } from '../prisma';
import { generateAzoraUID } from '../utils/uid';
import crypto from 'crypto';
import { recordLedgerEntry } from '../ledger';

const router = express.Router();

// src/server/routes/drivers.ts
router.get('/api/drivers', async (req, res) => {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ledgerEntries: {
          where: { type: 'DRIVER' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  
    const result = drivers.map((d: { id: any; email: any; createdAt: any; ledgerEntries: { uid: any; }[]; }) => ({
      id: d.id,
      email: d.email,
      createdAt: d.createdAt,
      uid: d.ledgerEntries[0]?.uid ?? null
    }));
  
    res.json({ drivers: result });
  });  

router.post('/api/drivers', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const driver = await prisma.driver.create({
    data: { email }
  });

  // Generate UID + hash
  const uid = generateAzoraUID('DRIVER');
  const hash = crypto.createHash('sha256').update(JSON.stringify(driver)).digest('hex');

  await recordLedgerEntry({
    uid,
    type: 'DRIVER',
    entityId: driver.id,
    driverId: driver.id,
    hash
  });

  res.json({ driver, uid });
});

router.delete('/api/drivers/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.driver.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
