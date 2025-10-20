// name=src/server/jobs/upload.ts
import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { prisma } from '../prisma';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/csv', upload.single('file'), async (req, res) => {
  const companyId = req.body.companyId;
  const results: any[] = [];
  fs.createReadStream(req.file!.path)
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      for (const r of results) {
        await prisma.job.create({
          data: {
            companyId,
            ref: r.order_id,
            pickup: { address: r.pickup_address },
            dropoff: { address: r.dropoff_address },
            status: 'new'
          }
        });
      }
      res.json({ ok: true, imported: results.length });
    });
});

export default router;
