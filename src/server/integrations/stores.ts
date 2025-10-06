// src/server/integrations/stores.ts
import express from 'express';
import { prisma } from '../prisma';

const router = express.Router();

// POST /api/integrations/store/connect
router.post('/store/connect', async (req, res) => {
  const { companyId, type, apiKey, secret, webhookUrl } = req.body; // type: 'shopify' | 'woocommerce'
  await prisma.tenant.create({
    data: {
      companyId,
      name: `${type}-store`,
      // store credentials in a secure vault in production
    }
  });
  res.json({ ok: true });
});

export default router;
