// src/server/routes/export.ts
import express from 'express';
import { exportDocument } from '../exports/exportDocument';
import { prisma } from '../prisma';

export const exportRouter = express.Router();

exportRouter.get('/api/:type/:id/pdf', async (req, res) => {
  const { type, id } = req.params;
  try {
    switch (type.toUpperCase()) {
      case 'CONTRACT': {
        const contract = await prisma.contract.findUnique({ where: { id }, include: { company: true } });
        if (!contract) return res.status(404).send('Not found');
        const { buffer, filename } = await exportDocument({
          type: 'CONTRACT',
          entityId: contract.id,
          companyId: contract.companyId,
          title: 'Contract',
          content: (doc) => {
            doc.fontSize(12).text(`Contract: ${contract.name}`);
            doc.text(`Version: ${contract.version}`);
            doc.text(`Status: ${contract.active ? 'Active' : 'Inactive'}`);
            doc.text(`Terms: ${contract.terms}`);
          }
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
      }
      // Add cases for ELD_LOG, RECEIPT, PAYOUT, etc.
      default:
        return res.status(400).send('Unsupported type');
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
