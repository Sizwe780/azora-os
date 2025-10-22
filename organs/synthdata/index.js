/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const faker = require('faker');
const csvStringify = require('csv-stringify/lib/sync');
const app = express();
app.use(express.json());

app.post('/api/synthdata', (req, res) => {
  const { type, count, fields, seed } = req.body;
  if (seed) faker.seed(seed);
  const data = [];
  for (let i = 0; i < (count || 100); i++) {
    const row = {};
    for (const f of fields) {
      row[f] = faker.fake(`{{${f}}}`);
    }
    data.push(row);
  }
  if (type === 'csv') {
    res.type('text/csv').send(csvStringify(data, { header: true }));
  } else {
    res.json({ data });
  }
});

app.listen(5700, () => console.log("[synthdata] running on 5700"));
