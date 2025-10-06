// src/server/logs/routes.ts
import { Router } from 'express';
import { generateEldPdf } from './eldPdf';

export const logsRouter = Router();

logsRouter.get('/api/trips/:id/logs/pdf', async (req, res) => {
  try {
    const { buffer, filename } = await generateEldPdf(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Failed to generate PDF' });
  }
});
