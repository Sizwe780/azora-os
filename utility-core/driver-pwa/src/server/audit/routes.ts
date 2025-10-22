/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// src/server/audit/routes.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// GET /api/audit?companyId=...
router.get('/', async (req, res) => {
  const { companyId } = req.query as { companyId: string };
  const audits = await prisma.audit.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json({ audits });
});

export default router;
