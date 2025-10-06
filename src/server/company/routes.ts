// src/server/company/routes.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

router.get('/:companyId', async (req, res) => {
  const company = await prisma.company.findUnique({ where: { id: req.params.companyId } });
  res.json(company);
});

router.post('/update', async (req, res) => {
  const { companyId, name, vatNumber, vatPercent, billingEmail, popiaConsent } = req.body;
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { name, vatNumber, vatPercent, billingEmail, popiaConsent }
  });
  await writeAudit(companyId, 'settings', 'update_company', { name, vatNumber, vatPercent, popiaConsent });
  res.json({ company });
});

export default router;
