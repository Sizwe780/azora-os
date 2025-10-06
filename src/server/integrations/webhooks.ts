// src/server/integrations/webhooks.ts
import express from 'express';
import { prisma } from '../prisma';
import { writeAudit } from '../audit/write';

const router = express.Router();

// POST /api/integrations/webhook/:source
router.post('/webhook/:source', async (req, res) => {
  const source = req.params.source; // 'fastway' | 'dsv' | 'courierguy' | 'shopify' | 'woocommerce'
  const payload = req.body;

  // Normalize to Azora Job events
  const normalized = normalizeEvent(source, payload);
  if (!normalized) return res.status(400).json({ error: 'Unsupported payload' });

  const { externalRef, companyId, pickup, dropoff, status } = normalized;

  // Upsert job by external reference
  const job = await prisma.job.upsert({
    where: { ref_companyId: { ref: externalRef, companyId } },
    update: { pickup, dropoff, status },
    create: { ref: externalRef, companyId, pickup, dropoff, status: status ?? 'new' }
  });

  await writeAudit(companyId, 'integration', 'job_event', { source, externalRef, status });
  res.json({ ok: true, job });
});

function normalizeEvent(source: string, payload: any) {
  try {
    switch (source) {
      case 'shopify': {
        const order = payload;
        return {
          externalRef: order.id?.toString(),
          companyId: order.note_attributes?.find((n: any) => n.name === 'companyId')?.value,
          pickup: { address: order.shipping_address?.city || 'Warehouse' },
          dropoff: { address: `${order.shipping_address?.address1}, ${order.shipping_address?.city}` },
          status: 'new'
        };
      }
      case 'woocommerce': {
        const order = payload;
        return {
          externalRef: order.id?.toString(),
          companyId: order.meta_data?.find((m: any) => m.key === 'companyId')?.value,
          pickup: { address: 'Warehouse' },
          dropoff: { address: `${order.shipping?.address_1}, ${order.shipping?.city}` },
          status: 'new'
        };
      }
      case 'fastway':
      case 'dsv':
      case 'courierguy': {
        const ev = payload;
        return {
          externalRef: ev.consignRef || ev.waybill || ev.tracking_number,
          companyId: ev.companyId,
          pickup: { address: ev.pickup_address },
          dropoff: { address: ev.dropoff_address },
          status: mapCarrierStatus(ev.status)
        };
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function mapCarrierStatus(s: string) {
  const x = s.toLowerCase();
  if (x.includes('delivered')) return 'delivered';
  if (x.includes('in transit') || x.includes('out for delivery')) return 'in_transit';
  if (x.includes('failed') || x.includes('exception')) return 'failed';
  if (x.includes('assigned') || x.includes('allocated')) return 'assigned';
  return 'new';
}

export default router;
