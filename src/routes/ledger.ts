// src/routes/ledger.ts
import { Router } from 'express';
import { prisma } from '../db/client';
import { AuthedRequest } from '../middleware/auth';

export const ledgerRouter = Router();

/**
 * GET /api/ledger
 * Returns invoices and settlements for the tenant
 * Query params:
 *   kind=all|invoices|settlements
 *   limit, offset
 */
ledgerRouter.get('/', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const kind = String(req.query.kind || 'all');
  const limit = Number(req.query.limit || 50);
  const offset = Number(req.query.offset || 0);

  const result: any = {};

  if (kind === 'all' || kind === 'invoices') {
    result.invoices = await prisma.invoice.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  if (kind === 'all' || kind === 'settlements') {
    // The tenant can be owner or subcontractor; show both sides
    result.settlements = await prisma.settlement.findMany({
      where: {
        OR: [{ ownerCompany: companyId }, { subcontractor: companyId }]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });
  }

  res.json(result);
});

/**
 * GET /api/ledger/invoices/:id
 * Download invoice metadata (and optionally redirect to PDF)
 */
ledgerRouter.get('/invoices/:id', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { id } = req.params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, companyId }
  });
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  res.json(invoice);
});

/**
 * GET /api/ledger/settlements/:id
 */
ledgerRouter.get('/settlements/:id', async (req: AuthedRequest, res) => {
  const companyId = (req as any).companyId as string;
  const { id } = req.params;

  const settlement = await prisma.settlement.findFirst({
    where: {
      id,
      OR: [{ ownerCompany: companyId }, { subcontractor: companyId }]
    }
  });
  if (!settlement) return res.status(404).json({ error: 'Not found' });

  res.json(settlement);
});